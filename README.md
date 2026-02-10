# HEIC to JPEG

A static PWA that converts HEIC images to JPEG entirely in the browser using [heic2any](https://github.com/nicolo-ribaudo/heic2any) (libheif WASM). No server-side processing, no build step.

The main goal is to make it less annoying to receive heic images on android phones.

A hosted version of this app lives at https://heic.sanford.io

## Features

- File picker and drag-and-drop support
- Android Share Target API — share HEIC files directly to the app
- Offline support via service worker with cache-first strategy
- Mobile-first responsive design

## Usage

Serve the files with any static HTTP server:

```
python3 -m http.server
```

For share target and full PWA functionality, deploy to an HTTPS host (e.g. GitHub Pages, Cloudflare Pages, Netlify).

## How it works

1. User provides a HEIC file (via file picker, drag-and-drop, or Android share)
2. `heic2any` decodes the HEIC using libheif compiled to WASM and re-encodes as JPEG
3. The converted JPEG is displayed as a preview with a download button

The service worker precaches all static assets and the heic2any CDN bundle for offline use. For the Android share target flow, the service worker intercepts the incoming POST, stashes the shared file in a dedicated cache, and redirects to the main page which picks it up and converts it.
