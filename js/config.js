// Runtime endpoints for the Piper voice.
// Everything is a plain static file: no bundler, no build step.

export const ORT_MODULE_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/ort.min.mjs";

// Directory holding ort-wasm-simd-threaded.{mjs,wasm}; onnxruntime-web appends file names to it.
export const ORT_WASM_BASE_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";

export const PIPER_MODULE_URL = "lib/piper/piper.js";

// espeak-ng needs its dictionary package plus a small wasm binary. espeakng.worker.js
// would otherwise look for them next to the page, so they are located explicitly.
export const PIPER_DIR = "lib/piper/";
export const ESPEAK_DATA_NAME = "espeakng.worker.data";

// Get the model from https://huggingface.co/rhasspy/piper-voices (see README).
export const MODEL_URL = "en_US-amy-medium/en_US-amy-medium.onnx";
export const MODEL_CONFIG_URL = MODEL_URL + ".json";

// Keys the download and the synthesized audio cache; bump to invalidate both.
export const VOICE_ID = "en_US-amy-medium";

export const MODEL_CACHE_NAME = "pairs-voice-v1";
export const AUDIO_DB_NAME = "pairs-speech-v1";
