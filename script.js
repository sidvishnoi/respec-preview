const form = document.forms[0];
form.submitButton.disabled = true;

form.addEventListener("submit", event => {
  event.preventDefault();
  const spec = new URL(form.spec.value);
  const version = new URL(form.version.value);
  const respecConfig = form.respecConfig.value;
  const searchParams = new URLSearchParams(spec.searchParams);
  searchParams.set("spec", spec.href.replace(spec.search, ""));
  searchParams.set("version", version.href);
  if (respecConfig) searchParams.set("respecConfig", respecConfig);
  window.location.search = searchParams.toString();
});

// prefill form
const { searchParams } = new URL(window.location.href);
const version = searchParams.get("version");
const spec = searchParams.get("spec");
const respecConfig = searchParams.get("respecConfig");
if (spec) {
  searchParams.delete("version");
  searchParams.delete("spec");
  searchParams.delete("respecConfig");
  form.spec.value = spec + searchParams.toString();
}
if (version) {
  form.version.value = version;
}
if (respecConfig) {
  form.respecConfig.value = respecConfig;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(() => {
    form.submitButton.disabled = false;
  });
} else {
  form.append("Error: ServiceWorker must be available for this app to work.");
}
