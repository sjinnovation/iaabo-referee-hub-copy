import { useState, useRef } from 'react';
import { ContentBlock, ContentBlockType, CONTENT_BLOCK_TYPES, extractYouTubeVideoId, QuizQuestion } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { uploadCourseContentVideo, uploadCourseContentAudio } from '@/services/courseContentStorage';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  FileText,
  Video,
  Headphones,
  Youtube,
  Code,
  HardDrive,
  HelpCircle,
  Upload,
} from 'lucide-react';

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const iconMap: Record<string, React.ElementType> = {
  FileText,
  Video,
  Headphones,
  Youtube,
  Code,
  HardDrive,
  HelpCircle,
};

const typeIcons: Record<ContentBlockType, React.ElementType> = {
  text: FileText,
  video: Video,
  audio: Headphones,
  youtube_embed: Youtube,
  embed: Code,
  drive_url: HardDrive,
  quiz: HelpCircle,
};

const typeLabels: Record<ContentBlockType, string> = {
  text: 'Text Block',
  video: 'Video Block',
  audio: 'Audio Block',
  youtube_embed: 'YouTube Video',
  embed: 'Embed Code',
  drive_url: 'Drive URL',
  quiz: 'Quiz (MCQ)',
};

function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function BlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const Icon = typeIcons[block.type];
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleYouTubeUrlChange = (url: string) => {
    setYoutubeUrl(url);
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      onUpdate({ ...block, youtubeVideoId: videoId });
    }
  };

  return (
    <Card className="rounded-xl border-l-4 border-l-primary transition-all hover:shadow-md overflow-hidden">
      <CardHeader className="py-3 px-4 bg-muted/10 border-b">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 ring-1 ring-primary/20">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">{typeLabels[block.type]}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveUp}
              disabled={isFirst}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveDown}
              disabled={isLast}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="mb-3">
          <Label className="text-xs text-muted-foreground">Block title (shown in course outline)</Label>
          <Input
            value={block.title ?? ''}
            onChange={(e) => onUpdate({ ...block, title: e.target.value || undefined })}
            placeholder="e.g. IAABO Rules Guide"
            className="mt-1"
          />
        </div>
        {block.type === 'text' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Content</Label>
              <RichTextEditor
                value={block.textContent || ''}
                onChange={(html) => onUpdate({ ...block, textContent: html })}
                placeholder="Write your content here… Use the toolbar to format and add images."
                className="mt-1"
              />
            </div>
          </div>
        )}

        {block.type === 'video' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setVideoUploading(true);
                  try {
                    const url = await uploadCourseContentVideo(file);
                    onUpdate({ ...block, mediaUrl: url, mediaFileName: file.name });
                    toast({ title: 'Video uploaded', description: 'Video has been stored and linked to this block.' });
                  } catch (err) {
                    toast({
                      title: 'Upload failed',
                      description: err instanceof Error ? err.message : 'Video upload failed.',
                      variant: 'destructive',
                    });
                  } finally {
                    setVideoUploading(false);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={videoUploading}
                onClick={() => videoInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {videoUploading ? 'Uploading…' : 'Upload video'}
              </Button>
              <span className="text-xs text-muted-foreground">MP4, WebM, OGG up to 200MB</span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {block.mediaFileName ? 'Video file' : 'Or paste video URL'}
              </Label>
              {block.mediaFileName ? (
                <div className="mt-1 flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                  <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-medium">{block.mediaFileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto shrink-0 text-xs"
                    onClick={() => onUpdate({ ...block, mediaUrl: undefined, mediaFileName: undefined })}
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    value={block.mediaUrl || ''}
                    onChange={(e) => onUpdate({ ...block, mediaUrl: e.target.value })}
                    placeholder="https://example.com/video.mp4 or YouTube URL"
                    className="mt-1"
                  />
                  {block.mediaUrl && extractYouTubeVideoId(block.mediaUrl) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      YouTube video detected — will embed automatically
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {block.type === 'audio' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mpeg,audio/mp3,.mp3"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setAudioUploading(true);
                  try {
                    const url = await uploadCourseContentAudio(file);
                    onUpdate({ ...block, mediaUrl: url, mediaFileName: file.name });
                    toast({ title: 'Audio uploaded', description: 'Audio has been stored and linked to this block.' });
                  } catch (err) {
                    toast({
                      title: 'Upload failed',
                      description: err instanceof Error ? err.message : 'Audio upload failed.',
                      variant: 'destructive',
                    });
                  } finally {
                    setAudioUploading(false);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={audioUploading}
                onClick={() => audioInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {audioUploading ? 'Uploading…' : 'Upload audio (MP3)'}
              </Button>
              <span className="text-xs text-muted-foreground">MP3 up to 50MB</span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {block.mediaFileName ? 'Audio file' : 'Or paste audio URL'}
              </Label>
              {block.mediaFileName ? (
                <div className="mt-1 flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                  <Headphones className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-medium">{block.mediaFileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto shrink-0 text-xs"
                    onClick={() => onUpdate({ ...block, mediaUrl: undefined, mediaFileName: undefined })}
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <Input
                  value={block.mediaUrl || ''}
                  onChange={(e) => onUpdate({ ...block, mediaUrl: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                  className="mt-1"
                />
              )}
            </div>
          </div>
        )}

        {block.type === 'youtube_embed' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">YouTube URL or Video ID</Label>
              <Input
                value={youtubeUrl || block.youtubeVideoId || ''}
                onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or video ID"
                className="mt-1"
              />
              {block.youtubeVideoId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Video ID: <code className="bg-muted px-1 py-0.5 rounded">{block.youtubeVideoId}</code>
                </p>
              )}
            </div>
            {block.youtubeVideoId && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black mt-2">
                <iframe
                  src={`https://www.youtube.com/embed/${block.youtubeVideoId}`}
                  title="YouTube Preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {block.type === 'embed' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Embed Code (HTML / iframe)</Label>
              <Textarea
                value={block.mediaUrl || ''}
                onChange={(e) => onUpdate({ ...block, mediaUrl: e.target.value })}
                placeholder='<iframe src="..." width="100%" height="400"></iframe>'
                className="mt-1 min-h-[100px] font-mono text-sm"
              />
            </div>
          </div>
        )}

        {block.type === 'drive_url' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Google Drive URL</Label>
              <Input
                value={block.mediaUrl || ''}
                onChange={(e) => onUpdate({ ...block, mediaUrl: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
                className="mt-1"
              />
              {block.mediaUrl && (
                <a
                  href={block.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1.5"
                >
                  <HardDrive className="w-3 h-3" />
                  Open in Google Drive
                </a>
              )}
            </div>
          </div>
        )}

        {block.type === 'quiz' && (() => {
          const quiz = block.quiz ?? { passingScore: 0, questions: [] };
          const totalQuestions = quiz.questions.length;
          const maxPassing = totalQuestions > 0 ? totalQuestions - 1 : 0;
          const passingValid = totalQuestions === 0 || (quiz.passingScore >= 0 && quiz.passingScore < totalQuestions);

          const setQuiz = (next: { passingScore: number; questions: QuizQuestion[] }) =>
            onUpdate({ ...block, quiz: next });

          const addQuestion = () =>
            setQuiz({
              ...quiz,
              questions: [...quiz.questions, { questionText: '', options: ['', ''], correctIndex: 0 }],
            });

          const updateQuestion = (idx: number, q: QuizQuestion) => {
            const next = [...quiz.questions];
            next[idx] = q;
            setQuiz({ ...quiz, questions: next });
          };

          const removeQuestion = (idx: number) => {
            const next = quiz.questions.filter((_, i) => i !== idx);
            const newPassing = Math.min(quiz.passingScore, next.length > 0 ? next.length - 1 : 0);
            setQuiz({ passingScore: newPassing, questions: next });
          };

          const addOption = (qIdx: number) => {
            const q = quiz.questions[qIdx];
            updateQuestion(qIdx, { ...q, options: [...q.options, ''] });
          };

          const setOption = (qIdx: number, optIdx: number, value: string) => {
            const q = quiz.questions[qIdx];
            const next = [...q.options];
            next[optIdx] = value;
            updateQuestion(qIdx, { ...q, options: next });
          };

          const removeOption = (qIdx: number, optIdx: number) => {
            const q = quiz.questions[qIdx];
            if (q.options.length <= 2) return;
            const next = q.options.filter((_, i) => i !== optIdx);
            const newCorrect = Math.min(q.correctIndex, next.length - 1);
            updateQuestion(qIdx, { ...q, options: next, correctIndex: newCorrect });
          };

          return (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Passing score (correct answers required)</Label>
                <Input
                  type="number"
                  min={0}
                  max={maxPassing}
                  value={totalQuestions === 0 ? '' : quiz.passingScore}
                  onChange={(e) => {
                    const v = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    if (!Number.isNaN(v)) setQuiz({ ...quiz, passingScore: Math.max(0, Math.min(maxPassing, v)) });
                  }}
                  placeholder={totalQuestions === 0 ? 'Add questions first' : `0–${maxPassing}`}
                  className="mt-1 w-28"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be less than total questions. {totalQuestions > 0 && `Max: ${maxPassing} of ${totalQuestions} questions.`}
                </p>
                {!passingValid && totalQuestions > 0 && (
                  <p className="text-xs text-destructive mt-1">Passing score must be less than {totalQuestions}.</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">MCQ questions</Label>
                  <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addQuestion}>
                    <Plus className="w-3.5 h-3.5" />
                    Add question
                  </Button>
                </div>
                {quiz.questions.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    No questions yet. Add at least one question.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quiz.questions.map((q, qIdx) => (
                      <Card key={qIdx} className="rounded-lg border bg-muted/10">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Question {qIdx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => removeQuestion(qIdx)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Question text</Label>
                            <Textarea
                              value={q.questionText}
                              onChange={(e) => updateQuestion(qIdx, { ...q, questionText: e.target.value })}
                              placeholder="Enter the question..."
                              className="mt-1 min-h-[60px]"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Options (select correct answer)</Label>
                            <div className="mt-2 space-y-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`quiz-q-${qIdx}`}
                                    checked={q.correctIndex === oIdx}
                                    onChange={() => updateQuestion(qIdx, { ...q, correctIndex: oIdx })}
                                    className="rounded-full border-primary text-primary"
                                  />
                                  <Input
                                    value={opt}
                                    onChange={(e) => setOption(qIdx, oIdx, e.target.value)}
                                    placeholder={`Option ${oIdx + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeOption(qIdx, oIdx)}
                                    disabled={q.options.length <= 2}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={() => addOption(qIdx)}>
                                <Plus className="w-3.5 h-3.5" />
                                Add option
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div className="mt-3">
          <Label className="text-xs text-muted-foreground">Caption (optional)</Label>
          <Input
            value={block.caption || ''}
            onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
            placeholder="Add a caption for this content..."
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ContentBlockEditor({ blocks, onChange }: ContentBlockEditorProps) {
  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: generateBlockId(),
      type,
      sortOrder: blocks.length,
      ...(type === 'quiz' ? { quiz: { passingScore: 0, questions: [] } } : {}),
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updatedBlock: ContentBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks.map((b, i) => ({ ...b, sortOrder: i })));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks.map((b, i) => ({ ...b, sortOrder: i })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
        <div>
          <h3 className="text-sm font-semibold">Content Blocks</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-lg">
              <Plus className="w-3.5 h-3.5" />
              Add Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {CONTENT_BLOCK_TYPES.map((blockType) => {
              const Icon = iconMap[blockType.icon] || FileText;
              return (
                <DropdownMenuItem
                  key={blockType.value}
                  onClick={() => addBlock(blockType.value)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {blockType.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed rounded-xl bg-muted/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center">
              <Video className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center">
              <Youtube className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">No content blocks yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-5 max-w-xs text-center">
            Add text, video, audio, or embeds to build your course content
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-lg">
                <Plus className="w-3.5 h-3.5" />
                Add Your First Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {CONTENT_BLOCK_TYPES.map((blockType) => {
                const Icon = iconMap[blockType.icon] || FileText;
                return (
                  <DropdownMenuItem
                    key={blockType.value}
                    onClick={() => addBlock(blockType.value)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {blockType.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <BlockEditor
              key={block.id}
              block={block}
              onUpdate={(updated) => updateBlock(index, updated)}
              onDelete={() => deleteBlock(index)}
              onMoveUp={() => moveBlock(index, 'up')}
              onMoveDown={() => moveBlock(index, 'down')}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
