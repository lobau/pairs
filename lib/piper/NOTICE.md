# Third-party speech files in this folder

These files are not under this project's GPL-2.0 license. They are unmodified copies of
the browser speech stack, kept here because the app loads them directly (no bundler).

| File | From | License |
| --- | --- | --- |
| `piper.js` | https://rhasspy.github.io/piper-samples/resources/piper.js ("Mini Piper implementation in Javascript") | GPL-3.0 (Piper / piper1-gpl) |
| `espeakng.worker.js` | https://rhasspy.github.io/piper-samples/resources/espeakng.worker.js | GPL-3.0 (espeak-ng) |
| `espeakng.worker.wasm` | https://rhasspy.github.io/piper-samples/resources/espeakng.worker.wasm | GPL-3.0 (espeak-ng) |
| `espeakng.worker.data` | https://rhasspy.github.io/piper-samples/espeakng.worker.data | GPL-3.0 (espeak-ng), not in git, fetched with curl |

Fetched 2026-10-25. `piper.js` carries one local patch, marked in the file: `setVoice` takes
a third argument passed to the espeak-ng module, so `espeakng.worker.data` and
`espeakng.worker.wasm` are looked up next to this folder instead of next to the page. Without
it the request for the dictionary is a 404 and initialization never resolves.

`sha256sum` of the copies as fetched, before the patch:

    eae618bad024a1c68c5516a5f5025e167b7dca0e33a7fc2ee1e5aea18a0d8c9c  piper.js
    141236dc04b79b13a417ffd10c25a9b25f93dd7cc978448dad58b9b95d2ac210  espeakng.worker.js
    eb0ea920003d62ed0a97f6d51a0903ff0cb6553d8d5e02eb5dce4c26e055f33f  espeakng.worker.wasm
    07263c3a96e26dcea39e0d7e (full value: sha256sum lib/piper/espeakng.worker.data)  espeakng.worker.data

## Not vendored here

onnxruntime-web is loaded from a pinned jsDelivr URL in `js/config.js`, because its WebAssembly
binary is 14 MB:
https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/ (MIT license)
To self-host it instead, put `ort.min.mjs`, `ort-wasm-simd-threaded.mjs` and
`ort-wasm-simd-threaded.wasm` in a folder and point `ORT_MODULE_URL` and `ORT_WASM_BASE_URL`
at it.

## License note

Piper and espeak-ng are GPL-3.0 while this repository is GPL-2.0, which is not automatically
compatible. Serving these files alongside the app is a decision for the project owner; only the
voice model download in the README points at the upstream projects.
