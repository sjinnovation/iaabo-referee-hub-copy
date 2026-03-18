import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderOpen, Trash2, Edit, Loader2, Upload, FileArchive, Users, FileImage, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { EmbeddedCourse } from '@/types/embeddedCourse';
import {
  getAllEmbeddedCourses,
  createEmbeddedCourse,
  updateEmbeddedCourse,
  deleteEmbeddedCourse,
  getEmbeddedCourseByFolderSlug,
} from '@/services/embeddedCourses';
import {
  uploadEmbeddedCourseZip,
  getFolderSlugFromZip,
  embeddedCourseFolderExistsInStorage,
  deleteEmbeddedCourseStorageFolder,
  type UploadProgress,
} from '@/services/embeddedCourseUpload';
import { Progress } from '@/components/ui/progress';
import { CertificateTemplatePlacement, type PlaceMode } from '@/components/admin/CertificateTemplatePlacement';

const AdminEmbeddedCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EmbeddedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<EmbeddedCourse | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<EmbeddedCourse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFolderSlug, setFormFolderSlug] = useState('');
  const [formIaaboCourseId, setFormIaaboCourseId] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formZipFile, setFormZipFile] = useState<File | null>(null);
  const [formDerivedSlug, setFormDerivedSlug] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [slugConflict, setSlugConflict] = useState<string | null>(null);
  const [certCourse, setCertCourse] = useState<EmbeddedCourse | null>(null);
  const [certTemplateUrl, setCertTemplateUrl] = useState<string | null>(null);
  const [certMemberNameX, setCertMemberNameX] = useState(50);
  const [certMemberNameY, setCertMemberNameY] = useState(35);
  const [certCourseTitleX, setCertCourseTitleX] = useState(50);
  const [certCourseTitleY, setCertCourseTitleY] = useState(48);
  const [certMemberNameFontSize, setCertMemberNameFontSize] = useState(28);
  const [certCourseTitleFontSize, setCertCourseTitleFontSize] = useState(28);
  const [certPlaceMode, setCertPlaceMode] = useState<PlaceMode>(null);
  const [certUploading, setCertUploading] = useState(false);
  const certFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const list = await getAllEmbeddedCourses();
      setCourses(list);
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to load embedded courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.folderSlug.toLowerCase().includes(q) ||
      (c.iaaboCourseId && c.iaaboCourseId.toLowerCase().includes(q))
    );
  });

  const openCreate = () => {
    setFormTitle('');
    setFormDescription('');
    setFormFolderSlug('');
    setFormIaaboCourseId('');
    setFormActive(true);
    setFormZipFile(null);
    setFormDerivedSlug(null);
    setUploadProgress(null);
    setSlugConflict(null);
    setEditCourse(null);
    setCreateOpen(true);
  };

  const openEdit = (course: EmbeddedCourse) => {
    setFormTitle(course.title);
    setFormDescription(course.description);
    setFormFolderSlug(course.folderSlug);
    setFormIaaboCourseId(course.iaaboCourseId ?? '');
    setFormActive(course.isActive);
    setFormZipFile(null);
    setFormDerivedSlug(null);
    setUploadProgress(null);
    setSlugConflict(null);
    setEditCourse(course);
    setCreateOpen(true);
  };

  const closeForm = () => {
    setCreateOpen(false);
    setEditCourse(null);
    setFormTitle('');
    setFormDescription('');
    setFormFolderSlug('');
    setFormIaaboCourseId('');
    setFormActive(true);
    setFormZipFile(null);
    setFormDerivedSlug(null);
    setUploadProgress(null);
    setSlugConflict(null);
  };

  const onZipSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormZipFile(file ?? null);
    setFormDerivedSlug(null);
    setSlugConflict(null);
    if (!file) return;
    try {
      const slug = await getFolderSlugFromZip(file);
      setFormDerivedSlug(slug);
      const [inStorage, inDb] = await Promise.all([
        embeddedCourseFolderExistsInStorage(slug),
        getEmbeddedCourseByFolderSlug(slug),
      ]);
      if (inStorage || inDb) {
        setSlugConflict(`A course or folder named "${slug}" already exists. Use a different ZIP or rename the top-level folder inside the ZIP.`);
      }
    } catch (err) {
      setSlugConflict(err instanceof Error ? err.message : 'Invalid ZIP');
    }
    e.target.value = '';
  };

  const onCertTemplateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !certCourse) return;
    setCertUploading(true);
    try {
      const { uploadEmbeddedCourseCertificateTemplateFile } = await import('@/services/embeddedCourses');
      const url = await uploadEmbeddedCourseCertificateTemplateFile(certCourse.id, file);
      const updated = await updateEmbeddedCourse(certCourse.id, {
        certificateTemplateUrl: url,
      });
      setCertCourse(updated);
      setCertTemplateUrl(updated.certificateTemplateUrl ?? url);
      toast({
        title: 'Template uploaded',
        description: 'Certificate template image has been updated for this course.',
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload certificate template.',
        variant: 'destructive',
      });
    } finally {
      setCertUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toast({ title: 'Validation', description: 'Title is required.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setUploadProgress(null);
    try {
      if (editCourse) {
        const slug = formFolderSlug.trim().replace(/\s+/g, '-');
        await updateEmbeddedCourse(editCourse.id, {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          folderSlug: slug || undefined,
          iaaboCourseId: formIaaboCourseId.trim() || null,
          isActive: formActive,
        });
        toast({ title: 'Updated', description: 'Embedded course updated.' });
        closeForm();
        loadCourses();
      } else {
        if (!formZipFile) {
          toast({ title: 'Validation', description: 'Please upload a ZIP file of the course folder (with res/index.html inside).', variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        if (slugConflict) {
          toast({ title: 'Conflict', description: slugConflict, variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        const { folderSlug } = await uploadEmbeddedCourseZip(formZipFile, setUploadProgress);
        await createEmbeddedCourse({
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          folderSlug,
          iaaboCourseId: formIaaboCourseId.trim() || null,
          contentInStorage: true,
          createdBy: user?.id,
        });
        toast({ title: 'Created', description: `"${formTitle.trim()}" is ready. Members can enroll and take the course.` });
        closeForm();
        loadCourses();
      }
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCourse) return;
    const title = deleteCourse.title;
    try {
      if (deleteCourse.contentInStorage) {
        await deleteEmbeddedCourseStorageFolder(deleteCourse.folderSlug);
      }
      await deleteEmbeddedCourse(deleteCourse.id);
      toast({ title: 'Deleted', description: `"${title}" removed.` });
      loadCourses();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to delete';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
    setDeleteCourse(null);
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Embedded Courses</h1>
            <p className="text-muted-foreground mt-1">
              Upload a ZIP of a course folder (with <code className="text-xs bg-muted px-1 rounded">res/index.html</code> inside). No folder with the same name may already exist.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) closeForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { openCreate(); setCreateOpen(true); }}>
                <Plus className="w-4 h-4" />
                Add Embedded Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editCourse ? 'Edit Embedded Course' : 'New Embedded Course'}</DialogTitle>
                <DialogDescription>
                  {editCourse
                    ? 'Update title, description, or visibility.'
                    : 'Upload a ZIP of the course folder. The ZIP must contain a top-level folder with res/index.html inside (same structure as IAABO-Micro-25-26-Rules-Changes).'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="emb-title">Title</Label>
                  <Input
                    id="emb-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. IAABO Micro - 25-26 Rules Changes"
                  />
                </div>
                {!editCourse && (
                  <div className="grid gap-2">
                    <Label>Course folder (ZIP)</Label>
                    <div className="flex items-center gap-2 rounded-lg border border-dashed p-4">
                      <input
                        type="file"
                        accept=".zip"
                        className="hidden"
                        id="emb-zip"
                        onChange={onZipSelect}
                      />
                      <Label htmlFor="emb-zip" className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <Upload className="w-4 h-4" />
                        {formZipFile ? formZipFile.name : 'Choose ZIP file'}
                      </Label>
                    </div>
                    {formZipFile && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileArchive className="w-3 h-3" />
                        Folder name: <span className="font-mono">{formDerivedSlug ?? formZipFile.name.replace(/\.zip$/i, '').replace(/\s+/g, '-')}</span> (must not already exist)
                      </p>
                    )}
                    {slugConflict && (
                      <p className="text-xs text-destructive">{slugConflict}</p>
                    )}
                    {uploadProgress && (
                      <div className="space-y-1">
                        <Progress value={(uploadProgress.fileIndex / uploadProgress.fileCount) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Uploading {uploadProgress.fileIndex} / {uploadProgress.fileCount}…
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {editCourse && (
                  <div className="grid gap-1">
                    <Label className="text-muted-foreground">Folder</Label>
                    <p className="text-sm font-mono">{formFolderSlug}</p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="emb-iaabo-course-id">IAABO Course ID (optional)</Label>
                  <Input
                    id="emb-iaabo-course-id"
                    value={formIaaboCourseId}
                    onChange={(e) => setFormIaaboCourseId(e.target.value)}
                    placeholder="e.g. IAABO-123"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emb-desc">Description (optional)</Label>
                  <Input
                    id="emb-desc"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short description for the catalog"
                  />
                </div>
                {editCourse && (
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="emb-active">Active (visible in member catalog)</Label>
                    <Switch
                      id="emb-active"
                      checked={formActive}
                      onCheckedChange={setFormActive}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeForm} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || (!editCourse && (!formZipFile || !!slugConflict))}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editCourse ? 'Save' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or folder slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="font-medium">
                {courses.length === 0 ? 'No embedded courses yet' : 'No matching courses'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {courses.length === 0
                  ? 'Add one with the button above by uploading a ZIP of the course folder.'
                  : 'Try a different search.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredCourses.map((course) => {
              const isCertExpanded = certCourse?.id === course.id;
              return (
                <Card key={course.id} className="p-4 space-y-3">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{course.title}</span>
                        {!course.isActive && <Badge variant="secondary">Inactive</Badge>}
                        {course.contentInStorage && (
                          <Badge variant="outline" className="text-xs">
                            Storage
                          </Badge>
                        )}
                      </div>
                      {course.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{course.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{course.folderSlug}</span>
                        {course.iaaboCourseId && (
                          <span className="font-mono">IAABO: {course.iaaboCourseId}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/admin/embedded-courses/${course.id}/stats`)}
                        title="View Stats"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/admin/embedded-courses/${course.id}/enrollments`)}
                        title="Manage Enrollments"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEdit(course)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteCourse(course)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant={isCertExpanded ? 'secondary' : 'outline'}
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        if (isCertExpanded) {
                          setCertCourse(null);
                          setCertTemplateUrl(null);
                          setCertPlaceMode(null);
                        } else {
                          setCertCourse(course);
                          setCertTemplateUrl(course.certificateTemplateUrl ?? null);
                          setCertMemberNameX(course.certificateMemberNameXPercent ?? 50);
                          setCertMemberNameY(course.certificateMemberNameYPercent ?? 35);
                          setCertCourseTitleX(course.certificateCourseTitleXPercent ?? 50);
                          setCertCourseTitleY(course.certificateCourseTitleYPercent ?? 48);
                          setCertMemberNameFontSize(course.certificateMemberNameFontSizePx ?? 28);
                          setCertCourseTitleFontSize(course.certificateCourseTitleFontSizePx ?? 28);
                          setCertPlaceMode(null);
                        }
                      }}
                    >
                      <FileImage className="w-4 h-4" />
                      {isCertExpanded ? 'Hide certificate template' : 'Certificate template'}
                    </Button>
                  </div>
                  {isCertExpanded && (
                    <div className="mt-2 border-t pt-3 space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Certificate template (optional)</p>
                        <p className="text-xs text-muted-foreground">
                          Upload a PNG background and set where the member name and course title appear for this embedded
                          course only. If not set, the global certificate template will be used.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <input
                            ref={certFileInputRef}
                            type="file"
                            accept="image/png"
                            className="hidden"
                            onChange={onCertTemplateFileChange}
                          />
                          {certTemplateUrl ? (
                            <div className="space-y-3">
                              <div className="rounded-lg border overflow-hidden bg-muted/30 max-w-md">
                                <img
                                  src={certTemplateUrl}
                                  alt="Certificate template"
                                  className="w-full h-auto object-contain max-h-64"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => certFileInputRef.current?.click()}
                                disabled={certUploading}
                                className="gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                {certUploading ? 'Uploading…' : 'Replace template'}
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="border-2 border-dashed rounded-xl p-4 max-w-md flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => certFileInputRef.current?.click()}
                            >
                              <FileImage className="h-8 w-8" />
                              <p className="text-sm font-medium">Upload certificate background (PNG)</p>
                              <p className="text-xs text-muted-foreground text-center">
                                Optional: if not set, the global certificate template will be used when members download
                                certificates.
                              </p>
                              <Button type="button" variant="secondary" size="sm" disabled={certUploading} className="mt-1">
                                {certUploading ? 'Uploading…' : 'Choose file'}
                              </Button>
                            </div>
                          )}
                        </div>
                        {certTemplateUrl && (
                          <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 max-w-md">
                              <div className="space-y-2">
                                <Label>Member name font size (px)</Label>
                                <Input
                                  type="number"
                                  min={12}
                                  max={72}
                                  value={certMemberNameFontSize}
                                  onChange={(e) => setCertMemberNameFontSize(Number(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Course title font size (px)</Label>
                                <Input
                                  type="number"
                                  min={12}
                                  max={72}
                                  value={certCourseTitleFontSize}
                                  onChange={(e) => setCertCourseTitleFontSize(Number(e.target.value))}
                                />
                              </div>
                            </div>
                            <CertificateTemplatePlacement
                              imageUrl={certTemplateUrl}
                              memberNameX={certMemberNameX}
                              memberNameY={certMemberNameY}
                              courseTitleX={certCourseTitleX}
                              courseTitleY={certCourseTitleY}
                              memberNameFontSizePx={certMemberNameFontSize}
                              courseTitleFontSizePx={certCourseTitleFontSize}
                              placeMode={certPlaceMode}
                              onPlaceModeChange={setCertPlaceMode}
                              onPositionChange={({ memberNameX, memberNameY, courseTitleX, courseTitleY }) => {
                                setCertMemberNameX(memberNameX);
                                setCertMemberNameY(memberNameY);
                                setCertCourseTitleX(courseTitleX);
                                setCertCourseTitleY(courseTitleY);
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="gap-2"
                              onClick={async () => {
                                if (!certCourse) return;
                                try {
                                  await updateEmbeddedCourse(certCourse.id, {
                                    certificateTemplateUrl: certTemplateUrl ?? null,
                                    certificateMemberNameXPercent: certTemplateUrl ? certMemberNameX : null,
                                    certificateMemberNameYPercent: certTemplateUrl ? certMemberNameY : null,
                                    certificateCourseTitleXPercent: certTemplateUrl ? certCourseTitleX : null,
                                    certificateCourseTitleYPercent: certTemplateUrl ? certCourseTitleY : null,
                                    certificateMemberNameFontSizePx: certTemplateUrl ? certMemberNameFontSize : null,
                                    certificateCourseTitleFontSizePx: certTemplateUrl ? certCourseTitleFontSize : null,
                                  });
                                  toast({
                                    title: 'Certificate settings saved',
                                    description: 'Certificate template and text positions have been updated.',
                                  });
                                  await loadCourses();
                                } catch (e: unknown) {
                                  toast({
                                    title: 'Save failed',
                                    description:
                                      e instanceof Error ? e.message : 'Failed to save certificate settings.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              Save certificate settings
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteCourse} onOpenChange={(open) => !open && setDeleteCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete embedded course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteCourse?.title}&quot; and all enrollments.
              {deleteCourse?.contentInStorage ? ' Uploaded files in storage will also be deleted.' : ' Files in public/embedded-courses/ will not be deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminEmbeddedCourses;
