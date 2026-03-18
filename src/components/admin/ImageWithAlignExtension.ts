import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';

export type ImageAlign = 'left' | 'right' | 'block';

const ALIGN_CLASSES: Record<ImageAlign, string> = {
  left: 'float-left mr-4 mb-2 rounded-lg max-w-full h-auto',
  right: 'float-right ml-4 mb-2 rounded-lg max-w-full h-auto',
  block: 'block mx-auto rounded-lg max-w-full h-auto',
};

export const ImageWithAlign = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'block' as ImageAlign,
        parseHTML: (el: HTMLElement) => {
          const data = el.getAttribute('data-align') as ImageAlign | null;
          if (data && (data === 'left' || data === 'right' || data === 'block')) return data;
          const cls = el.getAttribute('class') || '';
          if (cls.includes('float-left')) return 'left' as ImageAlign;
          if (cls.includes('float-right')) return 'right' as ImageAlign;
          return 'block' as ImageAlign;
        },
        renderHTML: (attrs: Record<string, unknown>) => ({ 'data-align': attrs.align || 'block' }),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }: { node: { attrs: { align?: ImageAlign } }; HTMLAttributes: Record<string, unknown> }) {
    const align = (node.attrs.align as ImageAlign) || 'block';
    const alignClass = ALIGN_CLASSES[align];
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, { class: alignClass, 'data-align': align }, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign:
        (align: ImageAlign) =>
        ({ chain }: { chain: () => { focus: () => { updateAttributes: (name: string, attrs: Record<string, unknown>) => { run: () => boolean } } } }) =>
          chain().focus().updateAttributes('image', { align }).run(),
    };
  },
});
