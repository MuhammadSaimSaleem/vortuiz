"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import Image from "next/image";

interface AvatarPickerProps {
  initials: string;
  onImageChange?: (file: File | null) => void;
}

export function AvatarPicker({ initials, onImageChange }: AvatarPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageChange?.(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onImageChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-2xl border border-border bg-white px-7 py-6 flex items-center gap-6">
      {/* Avatar trigger */}
      <div className="relative h-20 w-20 shrink-0 group">
        <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-200">
          {preview ? (
            <Image
              src={preview}
              alt="Avatar"
              fill
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-brand-navy to-brand-blue flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
          )}
        </div>

        {/* Hover overlay — triggers file picker */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          aria-label="Upload photo"
        >
          <Camera className="h-5 w-5 text-white" />
        </button>

        {/* Remove badge — only shown when an image is selected */}
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors z-10"
            aria-label="Remove photo"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      {/* Helper text */}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">Profile photo</p>
        <p className="text-xs text-muted-foreground">
          Click the avatar to upload. JPG, PNG or WebP.
        </p>
      </div>
    </div>
  );
}