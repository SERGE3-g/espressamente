"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold, Italic, Underline as UnderlineIcon, Code, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Quote, Minus,
  Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Highlighter, Undo, Redo, Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkDialog } from "./LinkDialog";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
}

export function RichTextEditor({ content, onChange, className }: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInitialUrl, setLinkInitialUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Youtube.configure({ width: 640, height: 360 }),
      Placeholder.configure({ placeholder: "Inizia a scrivere..." }),
      CharacterCount,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const currentUrl = editor.getAttributes("link").href || "";
    setLinkInitialUrl(currentUrl);
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkConfirm = useCallback((url: string) => {
    if (!editor) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL dell'immagine:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL del video YouTube:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const setColor = useCallback(() => {
    if (!editor) return;
    const color = window.prompt("Colore (es. #ff0000, red):", "#5c3d2e");
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();

  type ToolItem =
    | { type: "divider" }
    | { icon: React.ComponentType<{ className?: string }>; action: () => void; active: boolean; label: string; disabled?: boolean };

  const tools: ToolItem[] = [
    // Formattazione testo
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), label: "Grassetto" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), label: "Corsivo" },
    { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), label: "Sottolineato" },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike"), label: "Barrato" },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive("code"), label: "Codice inline" },
    { type: "divider" },

    // Titoli & blocchi
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), label: "Titolo H2" },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), label: "Titolo H3" },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), label: "Citazione" },
    { icon: Code2, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock"), label: "Blocco codice" },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, label: "Linea separatrice" },
    { type: "divider" },

    // Liste
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), label: "Lista puntata" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), label: "Lista numerata" },
    { type: "divider" },

    // Allineamento
    { icon: AlignLeft, action: () => editor.chain().focus().setTextAlign("left").run(), active: editor.isActive({ textAlign: "left" }), label: "Allinea a sinistra" },
    { icon: AlignCenter, action: () => editor.chain().focus().setTextAlign("center").run(), active: editor.isActive({ textAlign: "center" }), label: "Allinea al centro" },
    { icon: AlignRight, action: () => editor.chain().focus().setTextAlign("right").run(), active: editor.isActive({ textAlign: "right" }), label: "Allinea a destra" },
    { icon: AlignJustify, action: () => editor.chain().focus().setTextAlign("justify").run(), active: editor.isActive({ textAlign: "justify" }), label: "Giustifica" },
    { type: "divider" },

    // Colori
    { icon: Palette, action: setColor, active: false, label: "Colore testo" },
    { icon: Highlighter, action: () => editor.chain().focus().toggleHighlight({ color: "#fef3c7" }).run(), active: editor.isActive("highlight"), label: "Evidenzia" },
    { type: "divider" },

    // Media & link
    { icon: LinkIcon, action: openLinkDialog, active: editor.isActive("link"), label: "Link" },
    { icon: ImageIcon, action: addImage, active: false, label: "Immagine" },
    { icon: YoutubeIcon, action: addYoutube, active: false, label: "Video YouTube" },
    { type: "divider" },

    // Cronologia
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false, label: "Annulla", disabled: !editor.can().undo() },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false, label: "Ripristina", disabled: !editor.can().redo() },
  ];

  return (
    <div className={cn("rounded-xl border border-brand-200 bg-white overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-brand-200 bg-brand-50/50 flex-wrap">
        {tools.map((tool, i) => {
          if ("type" in tool && tool.type === "divider") {
            return <div key={i} className="w-px h-5 bg-brand-200 mx-1" />;
          }
          const t = tool as Exclude<ToolItem, { type: "divider" }>;
          return (
            <button
              key={i}
              type="button"
              onClick={t.action}
              title={t.label}
              disabled={t.disabled}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                t.active
                  ? "bg-brand-200 text-brand-800"
                  : "text-brand-500 hover:bg-brand-100 hover:text-brand-700",
                t.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <t.icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose-brand min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 [&_.tiptap]:outline-none [&_.tiptap]:min-h-[280px] [&_.tiptap_p.is-editor-empty:first-child::before]:text-brand-300 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_img]:rounded-lg [&_.tiptap_img]:max-w-full [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-brand-300 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-brand-600 [&_.tiptap_pre]:bg-brand-900 [&_.tiptap_pre]:text-brand-100 [&_.tiptap_pre]:rounded-lg [&_.tiptap_pre]:p-4 [&_.tiptap_pre]:text-sm [&_.tiptap_hr]:border-brand-200 [&_.tiptap_a]:text-accent-gold [&_.tiptap_a]:underline [&_mark]:bg-amber-100 [&_mark]:rounded-sm [&_mark]:px-0.5"
      />

      {/* Word count */}
      <div className="flex items-center justify-end gap-3 px-3 py-1.5 border-t border-brand-100 bg-brand-50/30 text-xs text-brand-400">
        <span>{wordCount} parole</span>
        <span>{charCount} caratteri</span>
      </div>

      {/* Link Dialog */}
      <LinkDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onConfirm={handleLinkConfirm}
        initialUrl={linkInitialUrl}
      />
    </div>
  );
}
