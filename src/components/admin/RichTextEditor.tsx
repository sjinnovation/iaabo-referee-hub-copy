import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  ImagePlus,
  Loader2,
  AlignLeft,
  AlignRight,
  AlignCenter,
} from 'lucide-react';
import { ImageWithAlign } from '@/components/admin/ImageWithAlignExtension';
import { uploadCourseContentImage } from '@/services/courseContentStorage';
import { cn } from '@/lib/utils';

const EDITOR_CLASS =
  'prose prose-sm max-w-none dark:prose-invert min-h-[180px] px-4 py-3 focus:outline-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:border-0 [&_img]:shadow-none [&_img]:outline-none rich-text-editor rich-text-content-inner';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function Toolbar({ editor, onImageUploading }: { editor: Editor | null; onImageUploading?: (v: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => inputRef.current?.click();

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      e.target.value = '';
      try {
        onImageUploading?.(true);
        const url = await uploadCourseContentImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        console.error('Image upload failed:', err);
      } finally {
        onImageUploading?.(false);
      }
    },
    [editor, onImageUploading]
  );

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1 rounded-t-lg">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        data-state={editor.isActive('bold') ? 'on' : 'off'}
      >
        <BoldIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        data-state={editor.isActive('italic') ? 'on' : 'off'}
      >
        <ItalicIcon className="h-4 w-4" />
      </Button>
      <div className="w-px h-5 bg-border mx-0.5" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        data-state={editor.isActive('heading', { level: 2 }) ? 'on' : 'off'}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        data-state={editor.isActive('heading', { level: 3 }) ? 'on' : 'off'}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <div className="w-px h-5 bg-border mx-0.5" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-state={editor.isActive('bulletList') ? 'on' : 'off'}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        data-state={editor.isActive('orderedList') ? 'on' : 'off'}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="w-px h-5 bg-border mx-0.5" />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleImageClick} title="Insert image">
        <ImagePlus className="h-4 w-4" />
      </Button>
      {editor.isActive('image') && (
        <>
          <div className="w-px h-5 bg-border mx-0.5" />
          <span className="text-xs text-muted-foreground mr-0.5">Image:</span>
          {(['left', 'right', 'block'] as const).map((align) => (
            <Button
              key={align}
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().updateAttributes('image', { align }).run()}
              title={align === 'left' ? 'Text beside (right)' : align === 'right' ? 'Text beside (left)' : 'Full width'}
            >
              {align === 'left' ? (
                <AlignLeft className="h-4 w-4" />
              ) : align === 'right' ? (
                <AlignRight className="h-4 w-4" />
              ) : (
                <AlignCenter className="h-4 w-4" />
              )}
            </Button>
          ))}
        </>
      )}
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder, className, disabled }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [, setSelectionTick] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Heading.configure({ levels: [2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      ImageWithAlign.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {},
      }),
    ],
    content: value || '',
    editable: !disabled,
    editorProps: {
      attributes: {
        class: EDITOR_CLASS,
        'data-placeholder': placeholder ?? 'Write your content here… You can add images with the image button.',
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        const file = files?.[0];
        if (!file || !file.type.startsWith('image/')) return false;
        event.preventDefault();
        uploadCourseContentImage(file)
          .then((url) => {
            const { schema } = view.state;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (coordinates) {
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            }
          })
          .catch(console.error);
        return true;
      },
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files;
        const file = files?.[0];
        if (!file || !file.type.startsWith('image/')) return false;
        event.preventDefault();
        uploadCourseContentImage(file)
          .then((url) => {
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src: url });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
          })
          .catch(console.error);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = value || '';
    if (current !== normalized) {
      editor.commands.setContent(normalized, false as any);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const onSelectionUpdate = () => setSelectionTick((t) => t + 1);
    editor.on('selectionUpdate', onSelectionUpdate);
    return () => { editor.off('selectionUpdate', onSelectionUpdate); };
  }, [editor]);

  return (
    <div ref={wrapperRef} className={cn('rounded-lg border bg-background overflow-hidden rich-text-editor-wrap', className)}>
      <Toolbar editor={editor} onImageUploading={setUploading} />
      <div className="relative">
        <EditorContent editor={editor} />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-b-lg">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
