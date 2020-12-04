// @ts-check
const respecScript = /(https:)?\/\/(www\.w3\.org\/Tools\/respec|w3c\.github\.io\/respec\/builds)\/(respec-[\w-]+)(\.js)?/;

const respecPreviewMarker = `<a href="https://respec-preview.netlify.com/"
    style="position:fixed;right:0;bottom:0;border:none;padding:8px;margin:0;line-height:0;">
    <img src="https://img.shields.io/badge/respec--preview-orange.svg">
  </a>`;
const previewMarkerInjector = `
window.addEventListener('load', async () => {
  await document.respec.ready;
  document.body.insertAdjacentHTML('beforeend', \`${respecPreviewMarker}\`);
});`;

const sw = /** @type {ServiceWorkerGlobalScope} */ (self);

/** @type {URL} */
let spec;

sw.addEventListener("install", event => {
  sw.skipWaiting();
});

sw.addEventListener("fetch", event => {
  if (shouldMockResponse(event.request)) {
    event.respondWith(getModifiedResponse(event.request));
  } else if (isSpecAsset(event.request) && spec) {
    const oldURL = new URL(event.request.url);
    const url = new URL(oldURL.pathname.replace(/^\//, ""), spec.href);
    event.respondWith(fetch(url.href));
  }
});

/** @param {FetchEvent['request']} request */
function shouldMockResponse(request) {
  const isNavigation =
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept").includes("text/html"));

  if (!isNavigation) return false;
  try {
    const params = getParams(request.url);
    spec = params.spec;
    return true;
  } catch (error) {
    return false;
  }
}

/** @param {FetchEvent['request']} request */
function isSpecAsset(request) {
  return new URL(request.url).hostname === globalThis.location.hostname;
}

/** @param {FetchEvent['request']} request */
async function getModifiedResponse(request) {
  const { spec, version, respecConfig } = getParams(request.url);
  try {
    const res = await fetch(new Request(spec.href));
    const originalHTML = await res.text();
    const modifiedHTML = originalHTML
      .replace("</head>", `<script>${respecConfig}</script></head>`)
      .replace("</head>", `<script>${previewMarkerInjector}</script></head>`)
      .replace(respecScript, version.href);
    return new Response(modifiedHTML, {
      headers: res.headers,
      status: res.status,
    });
  } catch (error) {
    console.error(error);
    return new Response("Error: " + error.message);
  }
}

/** @param {string} requestURL */
function getParams(requestURL) {
  const url = new URL(requestURL);
  const spec = new URL(url.searchParams.get("spec"));
  const version = new URL(url.searchParams.get("version"));
  const respecConfig = url.searchParams.get("respecConfig");
  return { spec, version, respecConfig };
}
