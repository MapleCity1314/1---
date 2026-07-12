// 图片格式判断的共享工具：Studio 拖拽/粘贴/上传都会用到。
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
}

export async function isHeicFile(file: File): Promise<boolean> {
  if (/\.(heic|heif)$/i.test(file.name)) return true;
  if (file.type === "image/heic" || file.type === "image/heif") return true;
  // 部分浏览器不带扩展名/MIME 时，读文件头判断（ftyp box 里含 heic/heix/hevc/mif1）
  try {
    const buffer = await file.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const text = String.fromCharCode(...bytes);
    return /ftypheic|ftypheix|ftyphevc|ftypmif1/.test(text);
  } catch {
    return false;
  }
}
