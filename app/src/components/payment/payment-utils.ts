export function getBaseUrl () {
  return document.baseURI.replace(/\/+$/, '') // Trim trailing slash
}
