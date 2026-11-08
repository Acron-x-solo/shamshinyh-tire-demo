export function assetUrl(path, base = import.meta.env.BASE_URL) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path;
  return `${base.replace(/\/?$/, "/")}${path.replace(/^\/+/, "")}`;
}
