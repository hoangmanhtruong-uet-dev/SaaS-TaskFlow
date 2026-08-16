import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

type Resolver = (hostname: string) => Promise<Array<{ address: string; family: number }>>;

function blockedIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
}

export function isBlockedNetworkAddress(address: string) {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (isIP(normalized) === 4) return blockedIpv4(normalized);
  if (isIP(normalized) !== 6) return true;
  if (normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
  const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return mapped ? blockedIpv4(mapped) : false;
}

const defaultResolver: Resolver = async (hostname) => lookup(hostname, { all: true, verbatim: true });

export async function validateOutboundUrl(value: string, allowedHosts: readonly string[], resolver: Resolver = defaultResolver) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port && url.port !== "443") throw new Error("Outbound URL must use HTTPS without credentials or a custom port.");
  const host = url.hostname.toLowerCase();
  if (!allowedHosts.map((item) => item.toLowerCase()).includes(host)) throw new Error("Outbound host is not allowlisted.");
  const addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await resolver(host);
  if (!addresses.length || addresses.some(({ address }) => isBlockedNetworkAddress(address))) throw new Error("Outbound host resolves to a blocked network.");
  return url;
}

export async function fetchAllowlisted(input: string, options: { allowedHosts: readonly string[]; timeoutMs?: number; maxBytes?: number; init?: RequestInit }) {
  const url = await validateOutboundUrl(input, options.allowedHosts);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 5_000);
  try {
    const response = await fetch(url, { ...options.init, redirect: "error", signal: controller.signal });
    const maxBytes = options.maxBytes ?? 1024 * 1024;
    const declared = Number(response.headers.get("content-length") ?? 0);
    if (declared > maxBytes) throw new Error("Outbound response exceeds the size limit.");
    const body = new Uint8Array(await response.arrayBuffer());
    if (body.byteLength > maxBytes) throw new Error("Outbound response exceeds the size limit.");
    return { response, body };
  } finally { clearTimeout(timeout); }
}
