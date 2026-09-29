"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TableCell, TableHeader, TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  FileCode2,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanPastedHtml } from "./cleanPastedHtml";
import { MediaPickerDialog } from "./MediaPickerDialog";

// A link ends where it ends: text typed right after it is plain text, not part of the link.
const ArticleLink = Link.extend({ inclusive: () => false });

// Columns aren't resizable, so ignore fixed pixel widths pasted from Google Docs or Word.
const noColumnWidth = { colwidth: { default: null, parseHTML: () => null, renderHTML: () => ({}) } };
const ArticleTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...noColumnWidth };
  },
});
const ArticleTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...noColumnWidth };
  },
});

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function ToolButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex size-8 flex-none items-center justify-center rounded-lg text-muted-2 transition-colors disabled:opacity-35",
        active ? "bg-blush-soft text-brand" : "hover:bg-blush hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px flex-none bg-[#f0e1e8]" aria-hidden="true" />;
}

/** Pretty-print HTML one block per line for the source view. */
function formatHtml(html: string) {
  return html
    .replace(/(<\/(?:p|h[1-6]|ul|ol|li|blockquote|table|thead|tbody|tr|figure|pre|div)>)(?=<)/g, "$1\n")
    .replace(/(<(?:ul|ol|table|thead|tbody|tr|blockquote)(?:\s[^>]*)?>)(?=<)/g, "$1\n")
    .replace(/(<(?:hr|img)[^>]*>)(?=<)/g, "$1\n");
}

function LinkPanel({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const current = editor.getAttributes("link") as { href?: string; target?: string | null; rel?: string | null };
  const [href, setHref] = useState(current.href ?? "");
  const [newTab, setNewTab] = useState(current.target === "_blank");
  const [sponsored, setSponsored] = useState(Boolean(current.rel?.includes("sponsored")));

  function apply() {
    const url = href.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }
    const normalized = /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`;
    const chain = editor.chain().focus().extendMarkRange("link");
    const attrs = {
      href: normalized,
      target: newTab ? "_blank" : null,
      rel: sponsored ? "sponsored nofollow" : null,
    };
    if (editor.state.selection.empty && !editor.isActive("link")) {
      chain.insertContent({ type: "text", text: normalized, marks: [{ type: "link", attrs }] }).run();
    } else {
      chain.setLink(attrs).run();
    }
    onClose();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#f3e8ee] bg-blush/50 px-3 py-2.5">
      <input
        autoFocus
        type="text"
        value={href}
        onChange={(e) => setHref(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
          if (e.key === "Escape") onClose();
        }}
        placeholder="Paste a link, e.g. https://example.com or /best-platforms/"
        className="adm-input min-w-[240px] flex-1 py-1.5"
        aria-label="Link URL"
      />
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-2">
        <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} className="accent-[#d81e66]" />
        Open in new tab
      </label>
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-2" title="Adds rel=&quot;sponsored nofollow&quot; — use for affiliate links">
        <input type="checkbox" checked={sponsored} onChange={(e) => setSponsored(e.target.checked)} className="accent-[#d81e66]" />
        Affiliate / sponsored
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={apply} className="adm-btn adm-btn-primary adm-btn-sm">
          Apply
        </button>
        {current.href && (
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              onClose();
            }}
            className="adm-btn adm-btn-danger adm-btn-sm"
          >
            Remove link
          </button>
        )}
        <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Toolbar({
  editor,
  onImage,
  onLink,
  sourceMode,
  onToggleSource,
}: {
  editor: Editor;
  onImage: () => void;
  onLink: () => void;
  sourceMode: boolean;
  onToggleSource: () => void;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      alignLeft: e.isActive({ textAlign: "left" }),
      alignCenter: e.isActive({ textAlign: "center" }),
      alignRight: e.isActive({ textAlign: "right" }),
      inTable: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();
  const off = sourceMode;

  return (
    <div>
      <div className="flex items-center gap-0.5 overflow-x-auto px-2 py-1.5 sm:flex-wrap">
      <ToolButton label="Paragraph" active={state.paragraph} disabled={off} onClick={() => chain().setParagraph().run()}>
        <Pilcrow className="size-4" />
      </ToolButton>
      <ToolButton label="Heading 2" active={state.h2} disabled={off} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton label="Heading 3" active={state.h3} disabled={off} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </ToolButton>
      <ToolButton label="Heading 4" active={state.h4} disabled={off} onClick={() => chain().toggleHeading({ level: 4 }).run()}>
        <Heading4 className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="Bold (Ctrl+B)" active={state.bold} disabled={off} onClick={() => chain().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Italic (Ctrl+I)" active={state.italic} disabled={off} onClick={() => chain().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Underline (Ctrl+U)" active={state.underline} disabled={off} onClick={() => chain().toggleUnderline().run()}>
        <UnderlineIcon className="size-4" />
      </ToolButton>
      <ToolButton label="Strikethrough" active={state.strike} disabled={off} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolButton>
      <ToolButton label="Inline code" active={state.code} disabled={off} onClick={() => chain().toggleCode().run()}>
        <Code className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="Add or edit link (Ctrl+K)" active={state.link} disabled={off} onClick={onLink}>
        <Link2 className="size-4" />
      </ToolButton>
      <ToolButton label="Remove link" disabled={off || !state.link} onClick={() => chain().extendMarkRange("link").unsetLink().run()}>
        <Link2Off className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="Bullet list" active={state.bulletList} disabled={off} onClick={() => chain().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="Numbered list" active={state.orderedList} disabled={off} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Quote" active={state.blockquote} disabled={off} onClick={() => chain().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolButton>
      <ToolButton label="Divider line" disabled={off} onClick={() => chain().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="Align left" active={state.alignLeft} disabled={off} onClick={() => chain().setTextAlign("left").run()}>
        <AlignLeft className="size-4" />
      </ToolButton>
      <ToolButton label="Align center" active={state.alignCenter} disabled={off} onClick={() => chain().setTextAlign("center").run()}>
        <AlignCenter className="size-4" />
      </ToolButton>
      <ToolButton label="Align right" active={state.alignRight} disabled={off} onClick={() => chain().setTextAlign("right").run()}>
        <AlignRight className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="Insert image" disabled={off} onClick={onImage}>
        <ImageIcon className="size-4" />
      </ToolButton>
      <ToolButton
        label="Insert table"
        disabled={off}
        active={state.inTable}
        onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon className="size-4" />
      </ToolButton>
      <Divider />
      <ToolButton label="Undo (Ctrl+Z)" disabled={off || !state.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="Redo (Ctrl+Shift+Z)" disabled={off || !state.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 className="size-4" />
      </ToolButton>
      <div className="ml-auto flex-none pl-2">
        <button
          type="button"
          onClick={onToggleSource}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
            sourceMode ? "bg-ink text-white" : "text-muted-2 hover:bg-blush hover:text-ink",
          )}
          title="Edit the raw HTML"
        >
          <FileCode2 className="size-4" aria-hidden="true" /> {sourceMode ? "Visual editor" : "HTML"}
        </button>
      </div>
      </div>

      {state.inTable && !off && (
        <div className="flex flex-wrap items-center gap-1 border-t border-[#f3e8ee] px-2 py-1.5 text-xs">
          <span className="mr-1 font-semibold text-subtle">Table:</span>
          {[
            ["+ Row", () => chain().addRowAfter().run()],
            ["+ Column", () => chain().addColumnAfter().run()],
            ["− Row", () => chain().deleteRow().run()],
            ["− Column", () => chain().deleteColumn().run()],
            ["Header row", () => chain().toggleHeaderRow().run()],
            ["Delete table", () => chain().deleteTable().run()],
          ].map(([label, run]) => (
            <button
              key={label as string}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={run as () => void}
              className="rounded-md px-2 py-1 font-medium text-muted-2 hover:bg-blush hover:text-brand"
            >
              {label as string}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder = "Start writing your article…" }: Props) {
  const [sourceMode, setSourceMode] = useState(false);
  const [source, setSource] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }),
      ArticleLink.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { target: null, rel: null },
      }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      TableKit.configure({ table: { resizable: false }, tableCell: false, tableHeader: false }),
      ArticleTableCell,
      ArticleTableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: { class: "prose-sfo", "aria-label": "Article content" },
      transformPastedHTML: cleanPastedHtml,
      handleKeyDown: (_view, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          setLinkOpen(true);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current(e.isEmpty ? "" : e.getHTML()),
  });

  const counts = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? { words: e.storage.characterCount.words() as number } : { words: 0 }),
  });

  function toggleSource() {
    if (!editor) return;
    if (sourceMode) {
      editor.commands.setContent(source, { emitUpdate: true });
      setSourceMode(false);
    } else {
      setSource(formatHtml(editor.isEmpty ? "" : editor.getHTML()));
      setSourceMode(true);
      setLinkOpen(false);
    }
  }

  return (
    <div className="sfo-editor adm-card overflow-clip">
      <div className="sticky top-14 z-10 border-b border-[#f3e8ee] bg-white/95 backdrop-blur lg:top-0">
        {editor ? (
          <Toolbar
            editor={editor}
            sourceMode={sourceMode}
            onToggleSource={toggleSource}
            onImage={() => setPickerOpen(true)}
            onLink={() => setLinkOpen((v) => !v)}
          />
        ) : (
          <div className="h-11" aria-hidden="true" />
        )}
        {editor && linkOpen && !sourceMode && <LinkPanel editor={editor} onClose={() => setLinkOpen(false)} />}
      </div>

      {sourceMode ? (
        <textarea
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            onChange(e.target.value);
          }}
          spellCheck={false}
          aria-label="HTML source"
          className="block min-h-[520px] w-full resize-y border-0 bg-[#1f0d17] p-5 font-mono text-[13px] leading-relaxed text-[#fce7f0] outline-none"
        />
      ) : editor ? (
        <EditorContent editor={editor} />
      ) : (
        // Until the editor starts in the browser, show the saved (sanitized) content so the page doesn't jump.
        <div className="editor-preview prose-sfo" aria-busy="true" dangerouslySetInnerHTML={{ __html: value }} />
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[#f3e8ee] px-4 py-2 text-xs text-subtle">
        <span className={cn(!sourceMode && "hidden sm:inline")}>
          {sourceMode ? "Editing HTML — switch back to see the visual editor." : "Tip: select text and press Ctrl+K to add a link."}
        </span>
        <span className="ml-auto flex-none">
          {counts?.words ?? 0} words · ~{Math.max(1, Math.round((counts?.words ?? 0) / 225))} min read
        </span>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Insert an image"
        onPick={(item) => {
          editor
            ?.chain()
            .focus()
            .setImage({
              src: item.url,
              alt: item.alt,
              width: item.width ?? undefined,
              height: item.height ?? undefined,
            })
            .command(({ tr }) => {
              // The new image is left selected, so the next key press or paste would replace it.
              // Put the cursor in the paragraph after the image instead (adding one if needed).
              if (!(tr.selection instanceof NodeSelection) || tr.selection.node.type.name !== "image") return true;
              const after = tr.selection.to;
              if (!tr.doc.resolve(after).nodeAfter?.isTextblock) {
                tr.insert(after, tr.doc.type.schema.nodes.paragraph.create());
              }
              tr.setSelection(TextSelection.create(tr.doc, after + 1));
              return true;
            })
            .run();
        }}
      />
    </div>
  );
}
