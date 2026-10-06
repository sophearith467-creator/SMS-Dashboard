import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { FileTextIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AttachmentPickerProps {
  label?: string;
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentPicker({
  label = 'Attached documents',
  files,
  onChange,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
  maxSizeMB = 10,
  disabled = false,
}: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object URLs for image previews; revoked when files change or on unmount.
  const previews = useMemo(
    () =>
      files.map((file) => ({
        key: fileKey(file),
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      })),
    [files]
  );
  useEffect(
    () => () => {
      previews.forEach((preview) => preview.url && URL.revokeObjectURL(preview.url));
    },
    [previews]
  );

  function addFiles(incoming: FileList | File[]) {
    const next = [...files];
    const rejected: string[] = [];
    for (const file of Array.from(incoming)) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        rejected.push(file.name);
        continue;
      }
      if (!next.some((existing) => fileKey(existing) === fileKey(file))) next.push(file);
    }
    setError(
      rejected.length > 0
        ? `${rejected.join(', ')} ${rejected.length === 1 ? 'is' : 'are'} larger than ${maxSizeMB} MB.`
        : null
    );
    onChange(next);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
    setError(null);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled && event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
  }

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-fg">{label}</span>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-5 text-center',
          'transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60',
          dragging
            ? 'border-brand bg-surface-muted'
            : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted'
        )}
      >
        <UploadCloudIcon size={20} className="text-fg-subtle" aria-hidden />
        <span className="text-[13px] font-medium text-fg">
          Click to upload or drag files here
        </span>
        <span className="text-[11.5px] text-fg-subtle">
          Images, PDF, Word, Excel — up to {maxSizeMB} MB each
        </span>
      </button>

      {error && (
        <p role="alert" className="mt-1.5 text-[12px] text-danger">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {files.map((file, index) => {
            const preview = previews[index];
            return (
              <li
                key={preview?.key ?? fileKey(file)}
                className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-soft"
              >
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  className="absolute left-1.5 top-1.5 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-fg-muted shadow-soft transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-danger"
                >
                  <XIcon size={13} aria-hidden />
                </button>

                {preview?.url ? (
                  <img
                    src={preview.url}
                    alt={file.name}
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-surface-muted text-fg-subtle">
                    <FileTextIcon size={28} aria-hidden />
                  </div>
                )}

                <div className="min-w-0 px-2.5 py-2">
                  <p className="truncate text-[12px] font-medium text-fg" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[11px] text-fg-subtle">{formatSize(file.size)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}