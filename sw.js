// @ts-check
const respecScript = "https://www.w3.org/Tools/respec/respec-w3c";

const sw = /** @type {ServiceWorkerGlobalScope} */ (self);

sw.addEventListener("install", event => {
  sw.skipWaiting();
});

sw.addEventListener("fetch", event => {
  if (shouldMockResponse(event.request)) {
    event.respondWith(getModifiedResponse(event.request));
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
    getParams(request);
    return true;
  } catch (error) {
    return false;
  }
}

/** @param {FetchEvent['request']} request */
async function getModifiedResponse(request) {
  const { spec, version } = getParams(request);
  try {
    const res = await fetch(new Request(spec.href));
    const originalHTML = await res.text();
    const modifiedHTML = originalHTML
      .replace("<head>", `<head><base href="${spec}">`)
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

/** @param {FetchEvent['request']} request */
function getParams(request) {
  const url = new URL(request.url);
  const spec = new URL(url.searchParams.get("spec"));
  const version = new URL(url.searchParams.get("version"));
  return { spec, version };
}
