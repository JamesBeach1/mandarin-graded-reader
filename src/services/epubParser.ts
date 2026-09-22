/**
 * Zero-Dependency Client-Side EPUB & Literature Ingestion Parser
 * Reads EPUB ZIP archives using native DecompressionStream('deflate-raw'), extracts manifest/spine,
 * and parses chapter HTML nodes into interactive token streams.
 */

export interface EpubChapter {
  id: string;
  title: string;
  href: string;
  htmlContent: string;
  rawText: string;
}

export interface ParsedEpubBook {
  title: string;
  author: string;
  chapters: EpubChapter[];
  tableOfContents: { title: string; chapterId: string }[];
}

export class EpubParser {
  /**
   * Parses an ArrayBuffer containing an EPUB file
   */
  public static async parseEpub(buffer: ArrayBuffer): Promise<ParsedEpubBook> {
    const files = await this.unzip(buffer);
    
    // 1. Read container.xml to locate root .opf
    const containerXml = files['META-INF/container.xml'] || files['container.xml'];
    let opfPath = 'OEBPS/content.opf';
    
    if (containerXml) {
      const match = containerXml.match(/full-path=["']([^"']+\.opf)["']/i);
      if (match && match[1]) {
        opfPath = match[1];
      }
    }

    // 2. Read OPF file
    const opfContent = files[opfPath] || files['content.opf'] || Object.keys(files).find(k => k.endsWith('.opf')) ? files[Object.keys(files).find(k => k.endsWith('.opf'))!] : '';
    
    let title = 'Imported Chinese Literature';
    let author = 'Unknown Author';
    const chapters: EpubChapter[] = [];
    const toc: { title: string; chapterId: string }[] = [];

    if (opfContent) {
      const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
      if (titleMatch) title = titleMatch[1].trim();

      const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
      if (authorMatch) author = authorMatch[1].trim();

      // Parse manifest items (href -> id)
      const manifest: Record<string, string> = {};
      const itemRegex = /<item\s+[^>]*id=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*\/>/gi;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = itemRegex.exec(opfContent)) !== null) {
        manifest[itemMatch[1]] = itemMatch[2];
      }

      // Parse spine reading order
      const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
      const itemrefRegex = /<itemref\s+[^>]*idref=["']([^"']+)["'][^>]*\/>/gi;
      let refMatch: RegExpExecArray | null;
      let chapterIdx = 1;

      while ((refMatch = itemrefRegex.exec(opfContent)) !== null) {
        const idref = refMatch[1];
        const relativeHref = manifest[idref];
        if (relativeHref) {
          const fullPath = (opfDir + relativeHref).replace(/^\//, '');
          const html = files[fullPath] || files[relativeHref] || '';
          if (html) {
            const rawText = this.stripHtml(html);
            const chapterTitle = `Chapter ${chapterIdx}`;
            chapters.push({
              id: `chap_${chapterIdx}`,
              title: chapterTitle,
              href: fullPath,
              htmlContent: html,
              rawText
            });
            toc.push({ title: chapterTitle, chapterId: `chap_${chapterIdx}` });
            chapterIdx++;
          }
        }
      }
    }

    // Fallback: If no spine found, collect all .html / .xhtml files
    if (chapters.length === 0) {
      const htmlFiles = Object.keys(files).filter(k => k.endsWith('.html') || k.endsWith('.xhtml') || k.endsWith('.htm'));
      htmlFiles.sort().forEach((file, idx) => {
        const html = files[file];
        const rawText = this.stripHtml(html);
        if (rawText.trim().length > 20) {
          const chapterTitle = `Section ${idx + 1}`;
          chapters.push({
            id: `sec_${idx + 1}`,
            title: chapterTitle,
            href: file,
            htmlContent: html,
            rawText
          });
          toc.push({ title: chapterTitle, chapterId: `sec_${idx + 1}` });
        }
      });
    }

    return {
      title,
      author,
      chapters,
      tableOfContents: toc
    };
  }

  /**
   * Native ZIP extractor reading uncompressed or Deflate files using DecompressionStream
   */
  private static async unzip(buffer: ArrayBuffer): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    const view = new DataView(buffer);
    let offset = 0;

    while (offset < buffer.byteLength - 30) {
      const signature = view.getUint32(offset, true);
      if (signature !== 0x04034b50) {
        // Not a local file header
        offset++;
        continue;
      }

      const compressionMethod = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const fileNameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);

      const fileNameBytes = new Uint8Array(buffer, offset + 30, fileNameLen);
      const fileName = new TextDecoder('utf-8').decode(fileNameBytes);

      const dataOffset = offset + 30 + fileNameLen + extraLen;
      if (dataOffset + compressedSize > buffer.byteLength) break;

      const compressedData = new Uint8Array(buffer, dataOffset, compressedSize);

      try {
        let fileContent = '';
        if (compressionMethod === 0) {
          // Stored (no compression)
          fileContent = new TextDecoder('utf-8').decode(compressedData);
        } else if (compressionMethod === 8) {
          // Deflate compression
          if (typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(compressedData);
            writer.close();
            const response = new Response(ds.readable);
            fileContent = await response.text();
          }
        }
        if (fileContent) {
          files[fileName] = fileContent;
        }
      } catch {
        // Skip unparseable binary streams
      }

      offset = dataOffset + compressedSize;
    }

    return files;
  }

  /**
   * Cleans raw HTML tags leaving textual prose
   */
  public static stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, '\n')
      .trim();
  }
}
