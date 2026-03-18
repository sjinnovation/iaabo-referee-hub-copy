export interface CertificateTemplate {
  id: string;
  templateUrl: string | null;
  memberNameXPercent: number;
  memberNameYPercent: number;
  courseTitleXPercent: number;
  courseTitleYPercent: number;
  /** Font size (px) for member name. */
  memberNameFontSizePx: number;
  /** Font size (px) for course title. */
  courseTitleFontSizePx: number;
  updatedAt: string;
  updatedBy?: string;
}

export const DEFAULT_CERTIFICATE_TEMPLATE_ID = '00000000-0000-0000-0000-000000000001';
