import assert from "node:assert/strict";
import test from "node:test";
import { isBlockedNetworkAddress, validateOutboundUrl } from "../../app/lib/outbound-url";

test("SSRF guard blocks private, metadata, loopback, and non-allowlisted destinations", async () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "::1", "fc00::1", "fe80::1"]) assert.equal(isBlockedNetworkAddress(address), true, address);
  assert.equal(isBlockedNetworkAddress("203.0.113.10"), false);
  await assert.rejects(validateOutboundUrl("http://api.example.com/data", ["api.example.com"]), /HTTPS/);
  await assert.rejects(validateOutboundUrl("https://evil.example/data", ["api.example.com"]), /allowlisted/);
  await assert.rejects(validateOutboundUrl("https://api.example.com/data", ["api.example.com"], async () => [{ address: "169.254.169.254", family: 4 }]), /blocked network/);
  const safe = await validateOutboundUrl("https://api.example.com/data", ["api.example.com"], async () => [{ address: "203.0.113.10", family: 4 }]);
  assert.equal(safe.hostname, "api.example.com");
});
