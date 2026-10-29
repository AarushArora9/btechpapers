/**
 * Pure client-side valid PDF binary generator.
 * Produces compliant PDF-1.4 binary payloads containing title, metadata, header, and structured content.
 */

interface PdfOptions {
  title: string;
  category?: string;
  author?: string;
  pageCount?: number;
  summary?: string;
  date?: string;
}

export function generateValidPdfBytes(options: PdfOptions): Uint8Array {
  const title = options.title || 'Document';
  const category = options.category || 'Documentation';
  const author = options.author || 'OctoDoc Documentation Team';
  const date = options.date || new Date().toISOString().split('T')[0];
  const summary = options.summary || 'Official documentation and specifications reference material.';
  const pageCount = Math.max(1, Math.min(options.pageCount || 4, 30));

  // Escape parentheses in PDF string literals
  const sanitize = (text: string) => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  // Build PDF objects
  const objects: string[] = [];

  // Object 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  // Object 2: Pages root
  const pageRefs = Array.from({ length: pageCount }, (_, i) => `${3 + i * 2} 0 R`).join(' ');
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [ ${pageRefs} ] /Count ${pageCount} >>\nendobj`);

  // Build each page object and content stream
  for (let i = 0; i < pageCount; i++) {
    const pageNum = i + 1;
    const pageObjIdx = 3 + i * 2;
    const contentObjIdx = pageObjIdx + 1;

    // Page object
    objects.push(
      `${pageObjIdx} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 612 792 ] /Contents ${contentObjIdx} 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> >>\nendobj`
    );

    // Content stream text
    let streamText = '';
    // Decorative header line
    streamText += '0.2 0.4 0.8 rg\n';
    streamText += '54 738 504 2 re f\n';
    
    // Header Text
    streamText += '0 0 0 rg\n';
    streamText += 'BT\n';
    streamText += '/F2 10 Tf\n';
    streamText += '54 748 Td\n';
    streamText += `(${sanitize(category.toUpperCase())} // OCTODOC HUB) Tj\n`;
    streamText += 'ET\n';

    // Page content
    streamText += 'BT\n';
    if (pageNum === 1) {
      // Document Title
      streamText += '/F2 22 Tf\n';
      streamText += '54 680 Td\n';
      streamText += `(${sanitize(title)}) Tj\n`;

      // Meta info
      streamText += '/F1 10 Tf\n';
      streamText += '0 -24 Td\n';
      streamText += `(Author: ${sanitize(author)} | Date: ${sanitize(date)} | Pages: ${pageCount}) Tj\n`;

      // Section divider
      streamText += '/F2 13 Tf\n';
      streamText += '0 -40 Td\n';
      streamText += '(1. Executive Summary & Overview) Tj\n';

      // Summary body
      streamText += '/F1 10 Tf\n';
      streamText += '0 -20 Td\n';
      streamText += `(${sanitize(summary)}) Tj\n`;

      streamText += '0 -18 Td\n';
      streamText += '(This document is an official technical reference maintained within the repository.) Tj\n';
      streamText += '0 -15 Td\n';
      streamText += '(All content adheres to the engineering standards and quality guidelines.) Tj\n';

      streamText += '/F2 13 Tf\n';
      streamText += '0 -36 Td\n';
      streamText += '(2. Architectural Specifications) Tj\n';

      streamText += '/F1 10 Tf\n';
      streamText += '0 -20 Td\n';
      streamText += '(System architecture follows modern decoupled principles with zero-latency caching.) Tj\n';
      streamText += '0 -15 Td\n';
      streamText += '(All components communicate via asynchronous event buses with idempotent verification.) Tj\n';
      streamText += '0 -15 Td\n';
      streamText += '(Data consistency is enforced through append-only log structures and immutable snapshots.) Tj\n';
    } else {
      // Subsequent Pages
      streamText += '/F2 15 Tf\n';
      streamText += '54 680 Td\n';
      streamText += `(${sanitize(title)} - Section ${pageNum}) Tj\n`;

      streamText += '/F1 10 Tf\n';
      streamText += '0 -28 Td\n';
      streamText += `(Detailed reference notes, benchmarks, and implementation appendices for Section ${pageNum}.) Tj\n`;
      streamText += '0 -18 Td\n';
      streamText += '(Telemetry, error boundaries, and telemetry metrics are logged for this module.) Tj\n';
      streamText += '0 -18 Td\n';
      streamText += '(Check the root repository README and index table for cross-referenced documents.) Tj\n';
    }

    // Footer with Page Number
    streamText += '/F1 9 Tf\n';
    streamText += `54 50 Td\n`;
    streamText += `(Page ${pageNum} of ${pageCount} | OctoDoc Architecture Repository) Tj\n`;
    streamText += 'ET\n';

    // Footer hairline
    streamText += '0.8 0.8 0.8 rg\n';
    streamText += '54 65 504 1 re f\n';

    const streamLength = new TextEncoder().encode(streamText).length;
    objects.push(
      `${contentObjIdx} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}\nendstream\nendobj`
    );
  }

  // Assemble full PDF
  let pdfString = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdfString.length);
    pdfString += objects[i] + '\n';
  }

  const startXref = pdfString.length;
  pdfString += `xref\n0 ${objects.length + 1}\n`;
  pdfString += '0000000000 65535 f \n';

  for (let i = 1; i <= objects.length; i++) {
    const off = offsets[i].toString().padStart(10, '0');
    pdfString += `${off} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  return new TextEncoder().encode(pdfString);
}
