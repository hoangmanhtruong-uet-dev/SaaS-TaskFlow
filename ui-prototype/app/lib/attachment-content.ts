const extensionsByMime: Record<string, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};
const dangerousEmbeddedExtension = /\.(?:exe|com|bat|cmd|scr|msi|ps1|js|mjs|html?|svg|jar)(?:\.|$)/i;

function startsWith(bytes: Uint8Array, expected: number[]) {
  return expected.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array) {
  return new TextDecoder("latin1").decode(bytes);
}

export function attachmentFileNameIsSafe(fileName: string, mimeType: string) {
  if (!fileName || fileName.length > 240 || fileName.includes("/") || fileName.includes("\\") || [...fileName].some((character) => character.charCodeAt(0) < 32) || dangerousEmbeddedExtension.test(fileName)) return false;
  const lower = fileName.toLowerCase();
  return (extensionsByMime[mimeType] ?? []).some((extension) => lower.endsWith(extension));
}

export function validateAttachmentContent(bytes: Uint8Array, mimeType: string, fileName: string) {
  if (!attachmentFileNameIsSafe(fileName, mimeType)) return { safe: false as const, reason: "extension_mismatch" };
  if (!bytes.length) return { safe: false as const, reason: "empty_file" };
  let valid = false;
  if (mimeType === "image/jpeg") valid = startsWith(bytes, [0xff, 0xd8, 0xff]);
  else if (mimeType === "image/png") valid = startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  else if (mimeType === "image/webp") valid = ascii(bytes.slice(0, 4)) === "RIFF" && ascii(bytes.slice(8, 12)) === "WEBP";
  else if (mimeType === "application/pdf") {
    const content = ascii(bytes);
    valid = content.startsWith("%PDF-") && !/(?:<script|\/JavaScript\b|\/Launch\b|\/EmbeddedFile\b)/i.test(content);
  } else if (mimeType === "text/plain" || mimeType === "text/csv") {
    try {
      const content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      valid = !content.includes("\0") && !/<(?:script|html|svg|iframe)|<\?xml/i.test(content);
    } catch { valid = false; }
  } else if (mimeType.includes("openxmlformats-officedocument")) {
    const content = ascii(bytes);
    const expectedFolder = mimeType.includes("wordprocessingml") ? "word/" : "xl/";
    valid = startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) && content.includes("[Content_Types].xml") && content.includes(expectedFolder) && !content.includes("vbaProject.bin");
  }
  return valid ? { safe: true as const } : { safe: false as const, reason: "content_signature_mismatch" };
}
