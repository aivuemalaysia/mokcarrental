'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FiBold, FiItalic, FiUnderline, FiList, FiLink } from 'react-icons/fi';

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (focused) return;
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [focused, value]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    const html = ref.current?.innerHTML || '';
    onChange(html);
  };

  const toolbar = useMemo(
    () => [
      { label: 'Bold', icon: FiBold, onClick: () => exec('bold') },
      { label: 'Italic', icon: FiItalic, onClick: () => exec('italic') },
      { label: 'Underline', icon: FiUnderline, onClick: () => exec('underline') },
      { label: 'List', icon: FiList, onClick: () => exec('insertUnorderedList') },
      {
        label: 'Link',
        icon: FiLink,
        onClick: () => {
          const url = window.prompt('Enter URL (https://...)');
          if (!url) return;
          exec('createLink', url);
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {toolbar.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2 text-gray-700 dark:text-gray-200"
            aria-label={item.label}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || '')}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="min-h-[180px] w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        data-placeholder={placeholder || 'Write content...'}
      />
    </div>
  );
}

