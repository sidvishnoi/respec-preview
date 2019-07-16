# respec-preview

Preview documents that use [ReSpec](https://github.com/w3c/respec) using a specific ReSpec version. Useful for preview/PR builds or for testing regressions.

Uses `ServiceWorker` to fetch a document, while replacing the default ReSpec script [1] with the one you provide.

# Example

View [Payment Request using ReSpec v24.23.0](https://respec-preview.netlify.com/?spec=https%3A%2F%2Fw3c.github.io%2Fpayment-request%2F&version=https%3A%2F%2Funpkg.com%2Frespec%4024.23.0%2Fbuilds%2Frespec-w3c-common.js)

Live version: https://respec-preview.netlify.com/

---

[1] https://www.w3.org/Tools/respec/respec-w3c
