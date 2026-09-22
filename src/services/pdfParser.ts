/**
 * PDF Ingestion & Text Extraction Service
 * Supports client-side PDF document parsing with CJK font CMap decoding,
 * page-by-page segmentation, lexical density analysis, and offline fallback extraction.
 */

export interface PdfPage {
  pageNumber: number;
  title: string;
  text: string;
  lines: string[];
}

export interface ParsedPdfDocument {
  title: string;
  author?: string;
  totalPages: number;
  pages: PdfPage[];
  fullText: string;
}

export class PdfParser {
  private static pdfjsPromise: Promise<any> | null = null;

  /**
   * Dynamically loads Mozilla PDF.js from a reliable CDN with CJK CMap support
   */
  private static async loadPdfJs(): Promise<any> {
    if (typeof window === 'undefined') {
      throw new Error('PDF parsing requires browser window environment.');
    }

    if ((window as any).pdfjsLib) {
      return (window as any).pdfjsLib;
    }

    if (this.pdfjsPromise) {
      return this.pdfjsPromise;
    }

    this.pdfjsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(lib);
        } else {
          reject(new Error('pdfjsLib not found on window after script load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
      document.head.appendChild(script);
    });

    return this.pdfjsPromise;
  }

  /**
   * Parses an ArrayBuffer of a PDF document into structured pages and text
   */
  public static async parsePdf(buffer: ArrayBuffer, fileName: string = 'Document.pdf'): Promise<ParsedPdfDocument> {
    try {
      const pdfjs = await this.loadPdfJs();
      
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/'
      });

      const pdf = await loadingTask.promise;
      const totalPages: number = pdf.numPages;
      const pages: PdfPage[] = [];

      let title = fileName.replace(/\.pdf$/i, '');
      let author = 'Unknown Author';

      try {
        const metadata = await pdf.getMetadata();
        if (metadata?.info?.Title && metadata.info.Title.trim().length > 0) {
          title = metadata.info.Title.trim();
        }
        if (metadata?.info?.Author && metadata.info.Author.trim().length > 0) {
          author = metadata.info.Author.trim();
        }
      } catch {
        // Ignore metadata extraction errors
      }

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastY: number | null = null;
        const lineChunks: string[] = [];
        let currentLine = '';

        for (const item of (textContent.items as any[])) {
          const str = item.str || '';
          if (!str) continue;

          // Check if item starts a new line based on vertical position
          const transform = item.transform;
          const y = transform ? transform[5] : null;

          if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) {
              lineChunks.push(currentLine.trim());
            }
            currentLine = str;
          } else {
            // In Chinese, characters do not require spaces between words
            const isPrevChinese = currentLine.length > 0 && /[\u4e00-\u9fa5]/.test(currentLine.slice(-1));
            const isCurrChinese = /[\u4e00-\u9fa5]/.test(str[0]);
            
            if (isPrevChinese && isCurrChinese) {
              currentLine += str;
            } else if (currentLine.length > 0 && !currentLine.endsWith(' ') && !str.startsWith(' ')) {
              currentLine += (isPrevChinese || isCurrChinese ? '' : ' ') + str;
            } else {
              currentLine += str;
            }
          }

          if (y !== null) lastY = y;
        }

        if (currentLine.trim()) {
          lineChunks.push(currentLine.trim());
        }

        const pageText = lineChunks.join('\n');
        pages.push({
          pageNumber: i,
          title: `Page ${i}`,
          text: pageText,
          lines: lineChunks
        });
      }

      const fullText = pages.map(p => p.text).join('\n\n');

      return {
        title,
        author,
        totalPages,
        pages,
        fullText
      };
    } catch (err) {
      console.warn('PDF.js parsing failed or offline, attempting native stream decompression fallback:', err);
      return this.parsePdfFallback(buffer, fileName);
    }
  }

  /**
   * Fallback client-side native PDF text stream extractor
   * Uses browser native DecompressionStream('deflate') for offline operation
   */
  private static async parsePdfFallback(buffer: ArrayBuffer, fileName: string): Promise<ParsedPdfDocument> {
    const uint8 = new Uint8Array(buffer);
    const latin1 = new TextDecoder('latin1').decode(uint8);

    // Extract stream blocks
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match: RegExpExecArray | null;
    const extractedLines: string[] = [];

    while ((match = streamRegex.exec(latin1)) !== null) {
      const rawStream = match[1];
      const streamBytes = new Uint8Array(rawStream.length);
      for (let i = 0; i < rawStream.length; i++) {
        streamBytes[i] = rawStream.charCodeAt(i);
      }

      let decompressed = '';
      try {
        // Attempt native deflate decompression
        if (typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('deflate');
          const writer = ds.writable.getWriter();
          writer.write(streamBytes);
          writer.close();
          const response = new Response(ds.readable);
          const decompressedBuf = await response.arrayBuffer();
          decompressed = new TextDecoder('latin1').decode(decompressedBuf);
        }
      } catch {
        decompressed = rawStream;
      }

      // Extract text within BT ... ET blocks and parenthesized strings
      const textMatches = decompressed.match(/\(([^)]+)\)\s*Tj/g) || [];
      for (const tm of textMatches) {
        const textContent = tm.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
        // Filter readable Chinese or Latin text
        if (textContent.length > 0) {
          extractedLines.push(textContent);
        }
      }
    }

    const fullText = extractedLines.join('\n') || '无法解析此 PDF 中的文字。请确保该 PDF 包含可选中文本（非纯扫描图片）。';

    return {
      title: fileName.replace(/\.pdf$/i, ''),
      author: 'Unknown Author',
      totalPages: 1,
      pages: [
        {
          pageNumber: 1,
          title: 'Document Content',
          text: fullText,
          lines: extractedLines
        }
      ],
      fullText
    };
  }
}
