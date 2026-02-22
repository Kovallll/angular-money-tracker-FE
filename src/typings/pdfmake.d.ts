declare module 'pdfmake/build/pdfmake' {
  const pdfMake: {
    vfs?: Record<string, string>;
    createPdf: (doc: object) => { download: (name: string) => void };
  };
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  export const pdfMake: { vfs: Record<string, string> };
}
