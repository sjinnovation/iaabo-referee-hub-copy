import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { DataTable } from '@/components/DataTable';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Users,
  Trash2,
  BookOpen,
  FileText,
  Send,
  Archive,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ManagedCourse, CourseStatus, COURSE_CATEGORIES, formatPrice } from '@/types/course';
import {
  getAllManagedCourses,
  deleteCourse,
  updateCourseStatus,
  getEnrollmentStats,
} from '@/services/courseManagement';

const statusConfig: Record<CourseStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'default' },
  archived: { label: 'Archived', variant: 'outline' },
};

const AdminCourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<ManagedCourse | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState({ total: 0, enrolled: 0, inProgress: 0, completed: 0 });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const [list, stats] = await Promise.all([getAllManagedCourses(), getEnrollmentStats()]);
      setCourses(list);
      setEnrollmentStats(stats);
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'Failed to load courses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    totalEnrollments: enrollmentStats.total,
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex flex-col items-center justify-center min-h-[280px] gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleDelete = (course: ManagedCourse) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      try {
        await deleteCourse(courseToDelete.id);
        toast({
          title: 'Course Deleted',
          description: `"${courseToDelete.title}" has been removed.`,
        });
        loadCourses();
      } catch (e: any) {
        toast({ title: 'Error', description: e?.message ?? 'Failed to delete course', variant: 'destructive' });
      }
    }
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const handleStatusChange = async (courseId: string, status: CourseStatus) => {
    try {
      await updateCourseStatus(courseId, status);
      toast({
        title: 'Status Updated',
        description: `Course status changed to ${status}.`,
      });
      loadCourses();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message ?? 'Failed to update status', variant: 'destructive' });
    }
  };

  const columns = [
    {
      header: 'Course',
      accessor: (course: ManagedCourse) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt=""
              className="w-11 h-11 rounded-lg object-cover shrink-0 ring-1 ring-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{course.title}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[250px]">
              {course.description || 'No description'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (course: ManagedCourse) => (
        <Badge variant="outline" className="capitalize text-xs">
          {course.category}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (course: ManagedCourse) => {
        const config = statusConfig[course.status];
        return (
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: 'Price',
      accessor: (course: ManagedCourse) => (
        <span className="text-sm font-medium">
          {course.isFree ? (
            <Badge variant="secondary" className="text-xs">Free</Badge>
          ) : (
            formatPrice(course.price, course.currency)
          )}
        </span>
      ),
    },
    {
      header: 'Enrolled',
      accessor: (course: ManagedCourse) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm">{course.enrollmentCount || 0}</span>
        </div>
      ),
    },
    {
      header: 'Season',
      accessor: (course: ManagedCourse) => (
        <span className="text-sm text-muted-foreground">{course.seasonYear}</span>
      ),
    },
    {
      header: '',
      accessor: (course: ManagedCourse) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Course
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course.id}/enrollments`)}>
              <Users className="w-4 h-4 mr-2" />
              Manage Enrollments
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {course.status === 'draft' && (
              <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'published')}>
                <Send className="w-4 h-4 mr-2" />
                Publish
              </DropdownMenuItem>
            )}
            {course.status === 'published' && (
              <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'archived')}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
            {course.status === 'archived' && (
              <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'published')}>
                <Send className="w-4 h-4 mr-2" />
                Re-publish
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(course)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 px-6 py-8 shadow-sm">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Management</h1>
              <p className="text-muted-foreground mt-1.5 max-w-xl">
                Create, manage, and publish courses for your members. Track enrollments and completion.
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/courses/new')}
              className="gap-2 shrink-0 shadow-md hover:shadow-lg transition-shadow"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  <p className="text-3xl font-bold mt-1 tabular-nums">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-3xl font-bold mt-1 text-green-600 dark:text-green-400 tabular-nums">{stats.published}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/15 flex items-center justify-center ring-2 ring-green-500/20">
                  <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                  <p className="text-3xl font-bold mt-1 text-amber-600 dark:text-amber-400 tabular-nums">{stats.draft}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/15 flex items-center justify-center ring-2 ring-amber-500/20">
                  <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Enrollments</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400 tabular-nums">{stats.totalEnrollments}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/15 flex items-center justify-center ring-2 ring-blue-500/20">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters + Table */}
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-xl">All Courses</CardTitle>
                <CardDescription className="mt-0.5">
                  {filteredCourses.length} of {courses.length} courses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-xl bg-muted/40 border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background border-muted-foreground/20"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {COURSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed bg-muted/20">
                <div className="h-20 w-20 rounded-2xl bg-muted/60 flex items-center justify-center mb-5 ring-2 ring-muted-foreground/10">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-xl mb-1.5">
                  {courses.length === 0 ? 'No courses yet' : 'No matching courses'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                  {courses.length === 0
                    ? 'Create your first course to get started. Add sections and content blocks to build the curriculum.'
                    : 'Try adjusting your search or filters to find what you need.'}
                </p>
                {courses.length === 0 && (
                  <Button onClick={() => navigate('/admin/courses/new')} className="gap-2" size="lg">
                    <Plus className="w-4 h-4" />
                    Create Course
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden">
                <DataTable columns={columns} data={filteredCourses} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This will also remove
              all enrollments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminCourseManagement;
