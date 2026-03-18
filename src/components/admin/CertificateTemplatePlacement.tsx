import { useRef, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/** Same font as generated certificate: bold italic serif */
const CERT_PLACEHOLDER_FONT = 'Georgia, "Times New Roman", Times, serif';

export type PlaceMode = 'member_name' | 'course_title' | null;

interface CertificateTemplatePlacementProps {
  imageUrl: string;
  memberNameX: number;
  memberNameY: number;
  courseTitleX: number;
  courseTitleY: number;
  memberNameFontSizePx: number;
  courseTitleFontSizePx: number;
  placeMode: PlaceMode;
  onPlaceModeChange: (mode: PlaceMode) => void;
  onPositionChange: (params: {
    memberNameX: number;
    memberNameY: number;
    courseTitleX: number;
    courseTitleY: number;
  }) => void;
  disabled?: boolean;
}

export function CertificateTemplatePlacement({
  imageUrl,
  memberNameX,
  memberNameY,
  courseTitleX,
  courseTitleY,
  memberNameFontSizePx,
  courseTitleFontSizePx,
  placeMode,
  onPlaceModeChange,
  onPositionChange,
  disabled,
}: CertificateTemplatePlacementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'member_name' | 'course_title' | null>(null);

  const getPercentFromEvent = useCallback(
    (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    },
    []
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (disabled || !placeMode) return;
    const p = getPercentFromEvent(e);
    if (!p) return;
    if (placeMode === 'member_name') {
      onPositionChange({
        memberNameX: p.x,
        memberNameY: p.y,
        courseTitleX: courseTitleX,
        courseTitleY: courseTitleY,
      });
      onPlaceModeChange(null);
    } else {
      onPositionChange({
        memberNameX: memberNameX,
        memberNameY: memberNameY,
        courseTitleX: p.x,
        courseTitleY: p.y,
      });
      onPlaceModeChange(null);
    }
  };

  const handleMarkerMouseDown = (e: React.MouseEvent, which: 'member_name' | 'course_title') => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(which);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const px = Math.max(0, Math.min(100, x));
      const py = Math.max(0, Math.min(100, y));
      if (dragging === 'member_name') {
        onPositionChange({
          memberNameX: px,
          memberNameY: py,
          courseTitleX: courseTitleX,
          courseTitleY: courseTitleY,
        });
      } else {
        onPositionChange({
          memberNameX: memberNameX,
          memberNameY: memberNameY,
          courseTitleX: px,
          courseTitleY: py,
        });
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, memberNameX, memberNameY, courseTitleX, courseTitleY, onPositionChange]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative inline-block w-full max-w-2xl rounded-lg border bg-muted/30 overflow-hidden"
      >
        <img
          src={imageUrl}
          alt="Certificate template"
          className="block w-full h-auto max-h-[480px] object-contain select-none pointer-events-none"
          draggable={false}
        />
        {/* Click overlay for placement mode */}
        <div
          className={cn(
            'absolute inset-0',
            placeMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          )}
          onClick={handleOverlayClick}
          onMouseDown={(e) => e.target === e.currentTarget && placeMode && e.preventDefault()}
          aria-hidden
        />
        {/* Member name placeholder — same font/size as downloaded certificate */}
        <div
          className={cn(
            'absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-auto text-center whitespace-nowrap select-none',
            placeMode === 'member_name' && 'outline outline-2 outline-primary outline-offset-1 rounded',
            dragging === 'member_name' && 'cursor-grabbing',
            !dragging && !placeMode && 'cursor-grab'
          )}
          style={{
            left: `${memberNameX}%`,
            top: `${memberNameY}%`,
            fontFamily: CERT_PLACEHOLDER_FONT,
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontSize: `${memberNameFontSizePx}px`,
            color: '#000',
          }}
          onMouseDown={(e) => handleMarkerMouseDown(e, 'member_name')}
          title="Member name position (drag to move)"
        >
          &lt; Member Name &gt;
        </div>
        {/* Course title placeholder — same font/size as downloaded certificate */}
        <div
          className={cn(
            'absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-auto text-center whitespace-nowrap select-none',
            placeMode === 'course_title' && 'outline outline-2 outline-primary outline-offset-1 rounded',
            dragging === 'course_title' && 'cursor-grabbing',
            !dragging && !placeMode && 'cursor-grab'
          )}
          style={{
            left: `${courseTitleX}%`,
            top: `${courseTitleY}%`,
            fontFamily: CERT_PLACEHOLDER_FONT,
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontSize: `${courseTitleFontSizePx}px`,
            color: '#000',
          }}
          onMouseDown={(e) => handleMarkerMouseDown(e, 'course_title')}
          title="Course title position (drag to move)"
        >
          &lt; Course Title &gt;
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPlaceModeChange(placeMode === 'member_name' ? null : 'member_name')}
          disabled={disabled}
          className={cn(
            'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            placeMode === 'member_name'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {placeMode === 'member_name'
            ? 'Click on certificate to place member name…'
            : 'Set member name position'}
        </button>
        <button
          type="button"
          onClick={() => onPlaceModeChange(placeMode === 'course_title' ? null : 'course_title')}
          disabled={disabled}
          className={cn(
            'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            placeMode === 'course_title'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {placeMode === 'course_title'
            ? 'Click on certificate to place course title…'
            : 'Set course title position'}
        </button>
      </div>
    </div>
  );
}
