/// <reference lib="webworker" />

export type ExportPdfWorkerPayload = { docDefinition: Record<string, unknown> };
export type ExportPdfWorkerResult = { arrayBuffer: ArrayBuffer } | { error: string };

addEventListener('message', async (event: MessageEvent<ExportPdfWorkerPayload>) => {
  const { docDefinition } = event.data;
  try {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const vfsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default;
    const vfs = (vfsModule as { pdfMake?: { vfs: Record<string, string> } }).pdfMake?.vfs;
    if (vfs && typeof pdfMake.vfs === 'undefined') {
      pdfMake.vfs = vfs;
    }
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob: Blob) => {
      blob.arrayBuffer().then((arrayBuffer) => {
        postMessage({ arrayBuffer } as ExportPdfWorkerResult, [arrayBuffer]);
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    postMessage({ error: message } as ExportPdfWorkerResult);
  }
});
