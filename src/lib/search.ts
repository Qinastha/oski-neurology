export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("uk-UA")
    .normalize("NFKD")
    .replace(/[’ʼ`´ʹ‘]/g, "'")
    .replace(/[–—-]/g, " ")
    .replace(/[^\p{L}\p{N}']+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
