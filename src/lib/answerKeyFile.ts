export async function parseAnswerKeyFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractTextFromPdf(file);
  }

  if (
    file.type.startsWith('text/') ||
    name.endsWith('.txt') ||
    name.endsWith('.md')
  ) {
    const text = (await file.text()).trim();
    if (!text) throw new Error('File is empty.');
    return text;
  }

  throw new Error('Unsupported file type. Upload PDF, TXT, or MD.');
}

async function extractTextFromPdf(file: File): Promise<string> {
  const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);

  GlobalWorkerOptions.workerSrc = workerModule.default;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }

  const combined = pages.join('\n\n').trim();
  if (!combined) {
    throw new Error(
      'No readable text in this PDF. If it is scanned images, paste the answer key manually.',
    );
  }

  return combined;
}
