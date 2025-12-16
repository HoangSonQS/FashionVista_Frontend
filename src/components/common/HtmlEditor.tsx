import React, { useEffect, useRef } from 'react';

interface HtmlEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({ label, value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Đồng bộ value từ ngoài vào editor (edit mode, reset form...)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const exec = (command: string) => {
    // Dùng command đơn giản cho đồ án (b, i, ul, ol, undo, redo)
    document.execCommand(command, false);
    handleInput();
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--muted-foreground)]">
          {label}
        </label>
      )}

      {/* Toolbar đơn giản */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-[var(--border)] bg-[var(--card)] px-2 py-1">
        <button
          type="button"
          className="px-2 py-0.5 text-xs rounded border border-[var(--border)] hover:bg-[var(--muted)]"
          onClick={() => exec('bold')}
        >
          B
        </button>
        <button
          type="button"
          className="px-2 py-0.5 text-xs italic rounded border border-[var(--border)] hover:bg-[var(--muted)]"
          onClick={() => exec('italic')}
        >
          I
        </button>
        <button
          type="button"
          className="px-2 py-0.5 text-xs rounded border border-[var(--border)] hover:bg-[var(--muted)]"
          onClick={() => exec('underline')}
        >
          U
        </button>
        <button
          type="button"
          className="px-2 py-0.5 text-xs rounded border border-[var(--border)] hover:bg-[var(--muted)]"
          onClick={() => exec('insertUnorderedList')}
        >
          • List
        </button>
        <button
          type="button"
          className="px-2 py-0.5 text-xs rounded border border-[var(--border)] hover:bg-[var(--muted)]"
          onClick={() => exec('insertOrderedList')}
        >
          1. List
        </button>
      </div>

      {/* Vùng soạn thảo */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[200px] rounded-b-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] prose max-w-none prose-p:my-2 empty:before:text-[var(--muted-foreground)] empty:before:content-[attr(data-placeholder)]"
      />

      <p className="text-xs text-[var(--muted-foreground)]">
        Bạn có thể dùng in đậm, in nghiêng, danh sách… để trình bày nội dung như landing page.
      </p>
    </div>
  );
};

export default HtmlEditor;



