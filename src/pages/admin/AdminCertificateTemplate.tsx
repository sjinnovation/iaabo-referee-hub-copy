import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCertificateTemplate,
  updateCertificateTemplate,
  uploadCertificateTemplateFile,
} from '@/services/certificateTemplate';
import type { CertificateTemplate } from '@/types/certificate';
import { CertificateTemplatePlacement } from '@/components/admin/CertificateTemplatePlacement';
import { Upload, Save, FileImage } from 'lucide-react';

const AdminCertificateTemplate = () => {
  const { user } = useAuth();
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [memberNameX, setMemberNameX] = useState(50);
  const [memberNameY, setMemberNameY] = useState(35);
  const [courseTitleX, setCourseTitleX] = useState(50);
  const [courseTitleY, setCourseTitleY] = useState(48);
  const [memberNameFontSize, setMemberNameFontSize] = useState(28);
  const [courseTitleFontSize, setCourseTitleFontSize] = useState(28);
  const [placeMode, setPlaceMode] = useState<'member_name' | 'course_title' | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getCertificateTemplate();
        if (cancelled) return;
        setTemplate(data ?? null);
        if (data) {
          setMemberNameX(data.memberNameXPercent);
          setMemberNameY(data.memberNameYPercent);
          setCourseTitleX(data.courseTitleXPercent);
          setCourseTitleY(data.courseTitleYPercent);
          setMemberNameFontSize(data.memberNameFontSizePx);
          setCourseTitleFontSize(data.courseTitleFontSizePx);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== 'image/png') {
      toast({ title: 'Invalid file', description: 'Please upload a PNG image.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadCertificateTemplateFile(file);
      const updated = await updateCertificateTemplate({ templateUrl: url }, user.id);
      if (updated) setTemplate(updated);
      toast({ title: 'Template uploaded', description: 'Certificate template image has been updated.' });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload template.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSavePositions = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateCertificateTemplate(
        {
          memberNameXPercent: memberNameX,
          memberNameYPercent: memberNameY,
          courseTitleXPercent: courseTitleX,
          courseTitleYPercent: courseTitleY,
          memberNameFontSizePx: memberNameFontSize,
          courseTitleFontSizePx: courseTitleFontSize,
        },
        user.id
      );
      if (updated) setTemplate(updated);
      toast({ title: 'Positions saved', description: 'Certificate text positions have been updated.' });
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Failed to save.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Generic Certificate Template"
          subtitle="Upload a blank certificate image and set where the member name and course title appear. Used when a course does not have its own certificate template."
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Template Image
            </CardTitle>
            <CardDescription>
              Upload a PNG image of your blank certificate. Only superadmin/admin can upload. This generic template is used when a course does not have its own certificate template; member name and course title are overlaid at the positions below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={handleFileChange}
            />
            {template?.templateUrl ? (
              <div className="space-y-3">
                <div className="rounded-lg border overflow-hidden bg-muted/30 max-w-md">
                  <img
                    src={template.templateUrl}
                    alt="Certificate template"
                    className="w-full h-auto object-contain max-h-80"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading…' : 'Replace template'}
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-xl p-8 max-w-md flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10" />
                <p className="text-sm font-medium">Upload blank certificate (PNG)</p>
                <p className="text-xs">Click or drop a PNG image. Used as base for all generated certificates.</p>
                <Button type="button" variant="secondary" size="sm" disabled={uploading} className="mt-2">
                  {uploading ? 'Uploading…' : 'Choose file'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {template?.templateUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Text positions</CardTitle>
            <CardDescription>
              Set the font size below, then click or drag the &quot;Member Name&quot; and &quot;Course Title&quot; placeholders on the certificate. Placeholders use the same font and size as the downloaded certificate so you can see how it will look.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 max-w-md">
              <div className="space-y-2">
                <Label>Member name font size (px)</Label>
                <Input
                  type="number"
                  min={12}
                  max={72}
                  value={memberNameFontSize}
                  onChange={(e) => setMemberNameFontSize(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Size for the &quot;Member Name&quot; text on the certificate.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Course title font size (px)</Label>
                <Input
                  type="number"
                  min={12}
                  max={72}
                  value={courseTitleFontSize}
                  onChange={(e) => setCourseTitleFontSize(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Size for the &quot;Course Title&quot; text on the certificate.
                </p>
              </div>
            </div>
            <CertificateTemplatePlacement
                imageUrl={template.templateUrl}
                memberNameX={memberNameX}
                memberNameY={memberNameY}
                courseTitleX={courseTitleX}
                courseTitleY={courseTitleY}
                memberNameFontSizePx={memberNameFontSize}
                courseTitleFontSizePx={courseTitleFontSize}
                placeMode={placeMode}
                onPlaceModeChange={setPlaceMode}
                onPositionChange={({ memberNameX: mx, memberNameY: my, courseTitleX: cx, courseTitleY: cy }) => {
                  setMemberNameX(mx);
                  setMemberNameY(my);
                  setCourseTitleX(cx);
                  setCourseTitleY(cy);
                }}
              />
            <Button onClick={handleSavePositions} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving…' : 'Save positions'}
            </Button>
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCertificateTemplate;
