import type { CertificateTemplate } from '@/types/certificate';

/** Serif font matching certificate style; bold and italic for dynamic text. */
const CERT_FONT_FAMILY = 'Georgia, "Times New Roman", Times, serif';

/**
 * Load an image from URL (cross-origin) for use on canvas.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load certificate template image'));
    img.src = url;
  });
}

/**
 * Draw text on canvas at position (xPercent, yPercent) as percentage of width/height.
 * Text is centered at that point, bold and italic, black, using certificate serif font.
 */
function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  xPercent: number,
  yPercent: number,
  width: number,
  height: number,
  fontSizePx: number
): void {
  const x = (width * xPercent) / 100;
  const y = (height * yPercent) / 100;
  ctx.save();
  ctx.font = `bold italic ${fontSizePx}px ${CERT_FONT_FAMILY}`;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Generate a certificate PNG blob from the template image and dynamic text.
 * Uses template positions (percent) and font size. Returns PNG blob for download.
 */
type CertificateTemplateLike = Pick<
  CertificateTemplate,
  | 'templateUrl'
  | 'memberNameXPercent'
  | 'memberNameYPercent'
  | 'courseTitleXPercent'
  | 'courseTitleYPercent'
  | 'memberNameFontSizePx'
  | 'courseTitleFontSizePx'
>;

export async function generateCertificatePng(options: {
  template: CertificateTemplateLike;
  memberName: string;
  courseTitle: string;
}): Promise<Blob> {
  const { template, memberName, courseTitle } = options;
  if (!template.templateUrl?.trim()) {
    throw new Error('Certificate template is not configured. Please ask an administrator to upload a template.');
  }

  const img = await loadImage(template.templateUrl);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(img, 0, 0);

  // Scale font sizes so the visual size on the certificate matches the admin preview.
  // Admin preview is ~672px wide (max-w-2xl); at full resolution the same relative size needs scaling.
  const REFERENCE_WIDTH = 672;
  const fontScale = width / REFERENCE_WIDTH;
  const memberNameFontPx = Math.round(template.memberNameFontSizePx * fontScale);
  const courseTitleFontPx = Math.round(template.courseTitleFontSizePx * fontScale);

  drawCenteredText(
    ctx,
    memberName,
    template.memberNameXPercent,
    template.memberNameYPercent,
    width,
    height,
    memberNameFontPx
  );
  drawCenteredText(
    ctx,
    courseTitle,
    template.courseTitleXPercent,
    template.courseTitleYPercent,
    width,
    height,
    courseTitleFontPx
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export certificate as PNG'));
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Trigger download of a blob as a file with the given filename.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
