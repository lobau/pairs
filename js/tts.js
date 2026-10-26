// Speech synthesis through Piper (piper1-gpl) running fully in the browser:
// onnxruntime-web (wasm) runs the voice model, espeak-ng (wasm) does phonemization.
// Synthesized words are cached in IndexedDB, the voice model in Cache Storage.

import {
    ORT_MODULE_URL,
    ORT_WASM_BASE_URL,
    PIPER_MODULE_URL,
    PIPER_DIR,
    ESPEAK_DATA_NAME,
    MODEL_URL,
    MODEL_CONFIG_URL,
    VOICE_ID,
    MODEL_CACHE_NAME,
    AUDIO_DB_NAME
} from "./config.js";

let piper = null;
let ready = false;
let startingUp = null;

// word -> object URL of the wav, for the current page view only
const audioUrls = new Map();
let audioStorePromise = null;
// Serializes background prefetch so it never competes with audible playback
let prefetchChain = Promise.resolve();

function fromDocument(path) {
    return new URL(path, document.baseURI).href;
}

// onProgress({ stage, ratio }) with ratio null for indeterminate stages.
export function init(onProgress) {
    if (ready) return Promise.resolve();
    if (!startingUp) startingUp = startUp(onProgress);
    return startingUp;
}

async function startUp(onProgress) {
    const progress = typeof onProgress === "function" ? onProgress : function() {};

    progress({ stage: "Loading speech engine", ratio: null });
    const ort = await import(ORT_MODULE_URL);
    ort.env.wasm.wasmPaths = ORT_WASM_BASE_URL;
    // Multi-threaded inference needs SharedArrayBuffer, which browsers only expose
    // when the page is cross-origin isolated.
    ort.env.wasm.numThreads =
        typeof SharedArrayBuffer === "undefined" ? 1 : navigator.hardwareConcurrency || 1;
    // lib/piper/piper.js talks to the engine through this global.
    globalThis.ort = ort;

    const modelUrl = await cachedAsset(fromDocument(MODEL_URL), "voice model", progress);
    const dictionaryUrl = await cachedAsset(
        fromDocument(PIPER_DIR + ESPEAK_DATA_NAME),
        "speech dictionary",
        progress
    );

    progress({ stage: "Loading voice", ratio: null });
    piper = await import(fromDocument(PIPER_MODULE_URL));
    await piper.setVoice(modelUrl, fromDocument(MODEL_CONFIG_URL), {
        locateFile: function(name) {
            return name === ESPEAK_DATA_NAME ? dictionaryUrl : fromDocument(PIPER_DIR + name);
        }
    });

    ready = true;
    return;
}

// Resolves to an object URL for a large asset, downloading it at most once per browser.
async function cachedAsset(target, label, progress) {
    const cache = "caches" in window ? await caches.open(MODEL_CACHE_NAME) : null;

    if (cache) {
        const stored = await cache.match(target);
        if (stored) {
            progress({ stage: "Reading " + label, ratio: 1 });
            return URL.createObjectURL(await stored.blob());
        }
    }

    const response = await fetch(target);
    if (!response.ok) {
        throw new Error(
            label + " " + target + " is missing (HTTP " + response.status + "). See the download step in README.md."
        );
    }
    // Storing the clone also stores the body, so it must happen before the body is read.
    if (cache) cache.put(target, response.clone()).catch(function() {});

    if (!response.body) {
        progress({ stage: "Downloading " + label, ratio: null });
        return URL.createObjectURL(await response.blob());
    }

    const total = Number(response.headers.get("content-length")) || 0;
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
        const read = await reader.read();
        if (read.done) break;
        chunks.push(read.value);
        received += read.value.length;
        progress({
            stage: "Downloading " + label,
            ratio: total ? received / total : null,
            received: received,
            total: total
        });
    }

    return URL.createObjectURL(new Blob(chunks, { type: "application/octet-stream" }));
}

// Resolves to an object URL of the wav for a word, synthesizing it on first use.
export async function speak(word) {
    const key = cacheKey(word);
    if (audioUrls.has(key)) return audioUrls.get(key);

    const stored = await readAudio(key);
    if (stored) {
        return remember(key, stored);
    }

    if (!ready) throw new Error("Voice is not loaded");

    const synthesized = await piper.textToWavAudio(word);
    const bytes = await synthesized.arrayBuffer();
    writeAudio(key, bytes);
    return remember(key, bytes);
}

// Warms the cache for words the current session is likely to need.
export function prefetch(words) {
    for (const word of words) {
        prefetchChain = prefetchChain
            .then(function() {
                return ready ? speak(word) : null;
            })
            .catch(function() {});
    }
    return prefetchChain;
}

function cacheKey(word) {
    return VOICE_ID + ":" + word.toLowerCase().trim();
}

function remember(key, bytes) {
    const url = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
    audioUrls.set(key, url);
    return url;
}

function audioStore() {
    if (!audioStorePromise) {
        audioStorePromise = new Promise(function(resolve, reject) {
            const request = indexedDB.open(AUDIO_DB_NAME, 1);
            request.onupgradeneeded = function() {
                request.result.createObjectStore("speech");
            };
            request.onsuccess = function() {
                resolve(request.result);
            };
            request.onerror = function() {
                reject(request.error);
            };
        });
    }
    return audioStorePromise;
}

async function readAudio(key) {
    const db = await audioStore();
    return new Promise(function(resolve) {
        const request = db.transaction("speech", "readonly").objectStore("speech").get(key);
        request.onsuccess = function() {
            resolve(request.result);
        };
        // A lost read only costs a re-synthesis.
        request.onerror = function() {
            resolve(undefined);
        };
    });
}

function writeAudio(key, bytes) {
    return audioStore()
        .then(function(db) {
            db.transaction("speech", "readwrite").objectStore("speech").put(bytes, key);
        })
        .catch(function() {});
}
