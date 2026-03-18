import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { ContentBlock, extractYouTubeVideoId } from '@/types/course';

import { Button } from '@/components/ui/button';
import { FileText, Video, Headphones, Youtube, Code, HardDrive, ExternalLink, HelpCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export interface QuizAttemptResult {
  correct: number;
  total: number;
  passed: boolean;
}

interface ContentBlockRendererProps {
  block: ContentBlock;
  className?: string;
  /** If provided and not null, quiz block shows only the score (no questions). Used when user already submitted. */
  quizAttempt?: QuizAttemptResult | null;
  /** Called when user submits the quiz; parent should save attempt and pass updated quizAttempt. */
  onQuizSubmit?: (result: QuizAttemptResult) => void;
}

function isHtml(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith('<') && (trimmed.includes('</') || trimmed.endsWith('/>'));
}

function TextBlock({ block }: { block: ContentBlock }) {
  const text = block.textContent?.trim() || '';
  const asHtml = isHtml(text);
  const sanitizedHtml = asHtml ? DOMPurify.sanitize(text, { ADD_ATTR: ['target'] }) : null;

  return (
    <div className="rounded-xl border-l-4 border-l-primary/50 bg-muted/20 p-5">
      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-img:rounded-lg prose-img:max-w-full prose-img:border-0 prose-img:ring-0 prose-img:outline-none rich-text-content">
        {text ? (
          asHtml && sanitizedHtml ? (
            <div className="rich-text-content rich-text-content-inner overflow-visible w-full" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              }}
            >
              {text}
            </ReactMarkdown>
          )
        ) : (
          <p className="text-muted-foreground italic">No content</p>
        )}
      </div>
      {block.caption && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50 italic">{block.caption}</p>
      )}
    </div>
  );
}

function VideoBlock({ block }: { block: ContentBlock }) {
  if (!block.mediaUrl) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20">
        <div className="text-center text-muted-foreground">
          <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No video URL provided</p>
        </div>
      </div>
    );
  }

  const youtubeId = extractYouTubeVideoId(block.mediaUrl);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg ring-1 ring-border/50">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={block.caption || 'YouTube Video'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={block.mediaUrl}
            controls
            className="w-full h-full object-contain"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      {block.caption && (
        <p className="text-sm text-muted-foreground italic">{block.caption}</p>
      )}
    </div>
  );
}

function AudioBlock({ block }: { block: ContentBlock }) {
  if (!block.mediaUrl) {
    return (
      <div className="flex items-center justify-center h-28 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20">
        <div className="text-center text-muted-foreground">
          <Headphones className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No audio URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-muted/40 rounded-xl p-5 border ring-1 ring-border/50">
        <audio src={block.mediaUrl} controls className="w-full" preload="metadata">
          Your browser does not support the audio element.
        </audio>
      </div>
      {block.caption && (
        <p className="text-sm text-muted-foreground italic">{block.caption}</p>
      )}
    </div>
  );
}

function YouTubeBlock({ block }: { block: ContentBlock }) {
  if (!block.youtubeVideoId) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20">
        <div className="text-center text-muted-foreground">
          <Youtube className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No YouTube video ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg ring-1 ring-border/50">
        <iframe
          src={`https://www.youtube.com/embed/${block.youtubeVideoId}`}
          title={block.caption || 'YouTube Video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {block.caption && (
        <p className="text-sm text-muted-foreground italic">{block.caption}</p>
      )}
    </div>
  );
}

function DriveUrlBlock({ block }: { block: ContentBlock }) {
  if (!block.mediaUrl) {
    return (
      <div className="flex items-center justify-center h-28 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20">
        <div className="text-center text-muted-foreground">
          <HardDrive className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No Drive URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <a
        href={block.mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-5 rounded-xl border-2 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all shadow-sm"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 shrink-0 ring-2 ring-primary/20">
          <HardDrive className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{block.caption || 'Google Drive File'}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{block.mediaUrl}</p>
        </div>
        <ExternalLink className="w-5 h-5 text-muted-foreground shrink-0" />
      </a>
    </div>
  );
}

function QuizBlock({
  block,
  quizAttempt,
  onQuizSubmit,
}: {
  block: ContentBlock;
  quizAttempt?: QuizAttemptResult | null;
  onQuizSubmit?: (result: QuizAttemptResult) => void;
}) {
  const quiz = block.quiz;
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<QuizAttemptResult | null>(null);
  const [retryClicked, setRetryClicked] = useState(false);

  if (!quiz || questions.length === 0) {
    return (
      <div className="rounded-xl border-l-4 border-l-primary/50 bg-muted/20 p-5 flex items-center gap-3">
        <HelpCircle className="w-10 h-10 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No quiz questions configured.</p>
      </div>
    );
  }

  const total = questions.length;
  const correct = Object.entries(answers).filter(([qi, opt]) => questions[Number(qi)]?.correctIndex === opt).length;
  const passed = correct >= quiz.passingScore;

  const displayResult = submittedResult ?? quizAttempt;
  /** Show result (no questions) when: just submitted, or have a stored failed attempt and haven't clicked Retry yet. */
  const showResult =
    (submitted && displayResult != null) ||
    (quizAttempt != null && !quizAttempt.passed && !retryClicked);

  const handleSubmit = () => {
    const result: QuizAttemptResult = { correct, total, passed };
    setSubmittedResult(result);
    setSubmitted(true);
    onQuizSubmit?.(result);
  };

  const handleRetry = () => {
    setRetryClicked(true);
    setSubmitted(false);
    setSubmittedResult(null);
    setAnswers({});
  };

  if (showResult && displayResult) {
    return (
      <div className="rounded-xl border-l-4 border-l-primary/50 bg-muted/20 p-6 space-y-4">
        <div className="flex items-center gap-3">
          {displayResult.passed ? (
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-10 h-10 text-destructive" />
          )}
          <div>
            <p className="font-medium">{displayResult.passed ? 'Pass' : 'Fail'}</p>
            <p className="text-sm text-muted-foreground">
              You got {displayResult.correct} of {displayResult.total} correct. Passing score: {quiz.passingScore}.
            </p>
          </div>
        </div>
        {!displayResult.passed && (
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
        )}
        {block.caption && (
          <p className="text-xs text-muted-foreground pt-3 border-t border-border/50 italic">{block.caption}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border-l-4 border-l-primary/50 bg-muted/20 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-10 h-10 text-primary/80" />
        <div>
          <p className="font-medium">Quiz</p>
          <p className="text-sm text-muted-foreground">
            {total} question{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="space-y-2">
            <p className="text-sm font-medium">{q.questionText || `Question ${qIdx + 1}`}</p>
            <div className="space-y-2 pl-2">
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} className="flex items-center gap-3 cursor-pointer rounded-lg border border-border/60 bg-background px-4 py-3 hover:bg-muted/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name={`quiz-${block.id}-${qIdx}`}
                    checked={answers[qIdx] === oIdx}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                    className="rounded-full border-primary text-primary"
                  />
                  <span className="text-sm">{opt || `Option ${oIdx + 1}`}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSubmit} className="gap-2">
        <CheckCircle className="w-4 h-4" />
        Submit quiz
      </Button>
      {block.caption && (
        <p className="text-xs text-muted-foreground pt-3 border-t border-border/50 italic">{block.caption}</p>
      )}
    </div>
  );
}

function EmbedBlock({ block }: { block: ContentBlock }) {
  if (!block.mediaUrl) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/20">
        <div className="text-center text-muted-foreground">
          <Code className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No embed content provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl overflow-hidden ring-1 ring-border/50"
        dangerouslySetInnerHTML={{ __html: block.mediaUrl }}
      />
      {block.caption && (
        <p className="text-sm text-muted-foreground italic">{block.caption}</p>
      )}
    </div>
  );
}


export function ContentBlockRenderer({ block, className, quizAttempt, onQuizSubmit }: ContentBlockRendererProps) {
  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return <TextBlock block={block} />;
      case 'video':
        return <VideoBlock block={block} />;
      case 'audio':
        return <AudioBlock block={block} />;
      case 'youtube_embed':
        return <YouTubeBlock block={block} />;
      case 'embed':
        return <EmbedBlock block={block} />;
      case 'drive_url':
        return <DriveUrlBlock block={block} />;
      case 'quiz':
        return (
          <QuizBlock
            block={block}
            quizAttempt={quizAttempt}
            onQuizSubmit={onQuizSubmit}
          />
        );
      default:
        return <p className="text-muted-foreground">Unknown block type</p>;
    }
  };

  return <div className={className}>{renderBlock()}</div>;
}

export function ContentBlockPreview({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">No content blocks yet</p>
        <p className="text-xs mt-1">Add content blocks to build your course</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blocks
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((block) => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))}
    </div>
  );
}
