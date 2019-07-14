// @ts-check
const respecScript = "https://www.w3.org/Tools/respec/respec-w3c";

const sw = /** @type {ServiceWorkerGlobalScope} */ (self);

sw.addEventListener("install", event => {
  sw.skipWaiting();
});

sw.addEventListener("fetch", event => {
  if (shouldMockResponse(event.request)) {
    const { spec, version } = getParams(event.request);
    event.respondWith(
      fetch(new Request(spec))
        .then(async res => {
          // modify response 🎉🎉
          const originalHTML = await res.text();
          const newHTML = originalHTML
            .replace("<head>", `<head><base href="${spec}">`)
            .replace(respecScript, version);
          return new Response(newHTML, {
            headers: res.headers,
            status: res.status,
          });
        })
        .catch(error => {
          return new Response(
            "Some error occured. Please try again." + error.message,
            { status: 200 },
          );
        }),
    );
  }
});

/** @param {FetchEvent['request']} request */
function shouldMockResponse(request) {
  const isNavigation =
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept").includes("text/html"));

  if (!isNavigation) return false;
  const { spec, version } = getParams(request);
  try {
    new URL(version);
    new URL(spec);
    return true;
  } catch (error) {
    return false;
  }
}

/** @param {FetchEvent['request']} request */
function getParams(request) {
  const url = new URL(request.url);
  const spec = url.searchParams.get("spec");
  const version = url.searchParams.get("version");
  return { spec, version };
}
