import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { AdminSidebar } from '@/components/AdminSidebar';
import { ContentBlockEditor } from '@/components/admin/ContentBlockEditor';
import { ContentBlockRenderer } from '@/components/admin/ContentBlockRenderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Eye, Send, Plus, Trash2, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  CourseCategory,
  CourseFormData,
  CourseSection,
  COURSE_CATEGORIES,
  formatPrice,
  getBlockDisplayTitle,
} from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';
import { createCourse, getManagedCourse, updateCourse } from '@/services/courseManagement';

const currentYear = new Date().getFullYear();
const seasonYears = Array.from({ length: 5 }, (_, i) => String(currentYear - 1 + i));

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `sec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const AdminCourseEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CourseCategory>('custom');
  const [seasonYear, setSeasonYear] = useState(String(currentYear));
  const [courseDate, setCourseDate] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(30);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      getManagedCourse(id)
        .then((course) => {
          if (course) {
            setTitle(course.title);
            setDescription(course.description);
            setCategory(course.category);
            setSeasonYear(course.seasonYear);
            setCourseDate(course.courseDate || '');
            setThumbnailUrl(course.thumbnailUrl || '');
            setIsRequired(course.isRequired);
            setIsFree(course.isFree);
            setPrice(course.price);
            setCurrency(course.currency);
            setEstimatedDurationMinutes(course.estimatedDurationMinutes);
            setSections(course.sections && course.sections.length > 0 ? course.sections : []);
          } else {
            toast({ title: 'Error', description: 'Course not found', variant: 'destructive' });
            navigate('/admin/courses');
          }
        })
        .catch(() => {
          toast({ title: 'Error', description: 'Failed to load course', variant: 'destructive' });
          navigate('/admin/courses');
        });
    } else {
      setSections([{ id: generateId(), title: 'Section 1', sortOrder: 0, contentBlocks: [] }]);
    }
  }, [id, navigate]);

  const buildFormData = (status: 'draft' | 'published'): CourseFormData => ({
    title,
    description,
    category,
    status,
    thumbnailUrl,
    isRequired,
    isFree,
    price: isFree ? 0 : price,
    currency,
    seasonYear,
    courseDate: courseDate || undefined,
    estimatedDurationMinutes,
    sections,
  });

  const updateSection = (index: number, updates: Partial<CourseSection>) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next.map((s, i) => ({ ...s, sortOrder: i }));
    });
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { id: generateId(), title: `Section ${prev.length + 1}`, sortOrder: prev.length, contentBlocks: [] },
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) {
      toast({ title: 'Cannot remove', description: 'Course must have at least one section.', variant: 'destructive' });
      return;
    }
    setSections((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, sortOrder: i })));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next.map((s, i) => ({ ...s, sortOrder: i }));
    });
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Course title is required';
    if (!seasonYear) return 'Season year is required';
    if (!isFree && price <= 0) return 'Price must be greater than 0 for paid courses';
    return null;
  };

  const handleSave = async (status: 'draft' | 'published') => {
    const error = validate();
    if (error) {
      toast({ title: 'Validation Error', description: error, variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const data = buildFormData(status);
      if (isEditing && id) {
        await updateCourse(id, data);
        toast({
          title: 'Course Updated',
          description: `"${title}" has been ${status === 'published' ? 'published' : 'saved as draft'}.`,
        });
      } else {
        await createCourse(data, user?.id);
        toast({
          title: 'Course Created',
          description: `"${title}" has been ${status === 'published' ? 'published' : 'saved as draft'}.`,
        });
      }
      navigate('/admin/courses');
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'Failed to save course', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const priceDisplay = isFree ? 'Free' : formatPrice(price, currency);

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 px-6 py-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/admin/courses')}
                className="shrink-0 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {isEditing ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isEditing
                    ? 'Update course details and content'
                    : 'Build a new course with sections and content blocks'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="gap-2 rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="gap-2 rounded-lg shadow-sm"
              >
                <Send className="w-4 h-4" />
                Publish
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="editor" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6 mt-6">
            {/* Course details (includes pricing) */}
            <Card className="rounded-xl border shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-base">Course Details</CardTitle>
                <CardDescription>Basic information and pricing for the course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 2025 NFHS Rules Changes"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief overview of what this course covers..."
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as CourseCategory)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Season Year *</Label>
                  <Select value={seasonYear} onValueChange={setSeasonYear}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seasonYears.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="courseDate">Date</Label>
                  <Input
                    id="courseDate"
                    type="date"
                    value={courseDate}
                    onChange={(e) => setCourseDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Est. Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={estimatedDurationMinutes}
                    onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                  {thumbnailUrl && (
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      className="mt-2 rounded-lg w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="required" className="cursor-pointer">Required Course</Label>
                  <Switch
                    id="required"
                    checked={isRequired}
                    onCheckedChange={setIsRequired}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="free" className="cursor-pointer">Free Course</Label>
                    <Switch id="free" checked={isFree} onCheckedChange={setIsFree} />
                  </div>

                  {!isFree && (
                    <>
                      <div className="mt-4">
                        <Label htmlFor="price">Price ($)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="price"
                            type="number"
                            min={0.01}
                            step={0.01}
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder="10.30"
                            className="flex-1"
                          />
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Display price: <span className="font-medium">{priceDisplay}</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course content sections: below course details */}
            <div className="space-y-4">
              <Card className="min-h-[400px] rounded-xl border shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                    <div>
                      <CardTitle className="text-base">Course Content (by section)</CardTitle>
                      <CardDescription>
                        Add sections (lessons) and content blocks in each section
                      </CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addSection} className="gap-1.5 rounded-lg">
                      <Plus className="w-4 h-4" />
                      Add Section
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {sections.map((section, index) => (
                      <Card key={section.id} className="rounded-xl border-2 border-dashed border-muted-foreground/20 overflow-hidden border-l-4 border-l-primary">
                        <CardHeader className="py-3 px-4 flex flex-row items-center gap-2 bg-muted/10">
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(index, { title: e.target.value })}
                            placeholder="Section title"
                            className="font-medium flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === sections.length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeSection(index)}
                              disabled={sections.length <= 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ContentBlockEditor
                            blocks={section.contentBlocks}
                            onChange={(blocks) => updateSection(index, { contentBlocks: blocks })}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="space-y-6 max-w-4xl rounded-2xl border bg-card p-6 shadow-sm">
              {/* Same layout as member course viewer */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold tracking-tight">{title || 'Untitled Course'}</h1>
                  <p className="text-muted-foreground mt-1">
                    {description || 'No description provided'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{category}</Badge>
                    <span>{estimatedDurationMinutes} min</span>
                    {isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    {!isFree && <Badge variant="secondary">{priceDisplay}</Badge>}
                    {courseDate && (
                      <span>{new Date(courseDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              </div>
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Course thumbnail"
                  className="w-full h-48 lg:h-64 object-cover rounded-xl ring-1 ring-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <Card className="rounded-xl border shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="text-lg">Course Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <p className="text-sm">This course has no content yet.</p>
                    </div>
                  ) : (
                    sections
                      .slice()
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((section) => {
                        const blocks = (section.contentBlocks || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
                        return (
                          <Collapsible
                            key={section.id}
                            defaultOpen={section.sortOrder === 0}
                            className="group/section"
                          >
                            <div className="border-b last:border-b-0">
                              <CollapsibleTrigger className="flex w-full items-center justify-between py-4 px-1 text-left font-medium hover:underline">
                                <span>{section.title}</span>
                                <span className="text-muted-foreground font-normal text-sm">
                                  {blocks.length} Topic{blocks.length !== 1 ? 's' : ''}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/section:rotate-180" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="pb-4 pl-2">
                                  <div className="text-xs text-muted-foreground mb-2 px-2">Lesson Content</div>
                                  {blocks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground px-2 py-2">No topics in this section.</p>
                                  ) : (
                                    <>
                                      {blocks.map((block) => (
                                        <div
                                          key={block.id}
                                          className="flex items-center gap-2 py-3 px-2 text-sm font-medium rounded-lg border bg-muted/30 mb-2"
                                        >
                                          <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center shrink-0">
                                            <FileText className="w-2.5 h-2.5 text-muted-foreground" />
                                          </div>
                                          <span>{getBlockDisplayTitle(block)}</span>
                                        </div>
                                      ))}
                                      <div className="mt-4 space-y-6 rounded-lg border border-dashed border-muted-foreground/20 p-4">
                                        <div className="text-xs text-muted-foreground mb-2">Preview (as members will see)</div>
                                        {blocks.map((block) => (
                                          <ContentBlockRenderer key={block.id} block={block} />
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminCourseEditor;
