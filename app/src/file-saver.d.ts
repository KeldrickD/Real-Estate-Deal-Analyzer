declare module 'file-saver' {
  export function saveAs(data: Blob | File | URL, filename?: string, options?: Object): void;
} 