// 按扩展名分组，决定 FileModal 该用哪个 viewer/editor 打开文件。
export const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
export const TEXT_EDIT_EXTS = [
  "txt",
  "md",
  "json",
  "ts",
  "tsx",
  "js",
  "jsx",
  "css",
  "html",
  "yml",
  "yaml",
  "py",
  "java",
  "c",
  "cpp",
  "go",
  "rs",
  "sh",
  "sql",
  "xml",
  "log",
];
export const SHEET_EXTS = ["xlsx", "xls", "csv"];
export const DOCX_EXTS = ["docx"];
export const SLIDES_EXTS = ["pptx", "ppt"];
export const PDF_EXTS = ["pdf"];

// Monaco 语言映射（缺省 plaintext）
const LANG_MAP: Record<string, string> = {
  md: "markdown",
  json: "json",
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  css: "css",
  html: "html",
  yml: "yaml",
  yaml: "yaml",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  go: "go",
  rs: "rust",
  sh: "shell",
  sql: "sql",
  xml: "xml",
};

export function monacoLanguageFor(ext: string | null): string {
  return LANG_MAP[ext ?? ""] ?? "plaintext";
}
