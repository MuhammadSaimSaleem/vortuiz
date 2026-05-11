"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Camera,
  Trash2,
  Loader2,
  UserCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";
import { SupabaseClient } from "@supabase/supabase-js";

interface CropState {
  x: number; // % offset from centre (-50 … +50)
  y: number;
  scale: number; // zoom multiplier (0.5 … 3)
}

interface AvatarPickerProps {
  supabaseClient: SupabaseClient;
  /** Current avatar URL (from Supabase Storage) */
  avatarUrl?: string | null;
  /** Initials shown when no image is present */
  initials?: string;
  /** Supabase user id — used for the storage path avatars/{userId}/avatar.png */
  userId: string;
  /** Called after a successful upload with the new public URL */
  onSaved?: (publicUrl: string) => void;
  /** Called when the avatar is removed locally */
  onRemoved?: () => void;
  /**
   * The parent receives the `save()` function here so an external Save button
   * can trigger the actual Supabase upload.
   *
   * @example
   * const saveFnRef = useRef<() => Promise<void>>();
   * <AvatarPicker onSaveFnReady={(fn) => { saveFnRef.current = fn; }} … />
   * <button onClick={() => saveFnRef.current?.()}>Save</button>
   */
  onSaveFnReady?: (saveFn: () => Promise<void>) => void;
}

// ---------------------------------------------------------------------------
// Helper — render a cropped circular PNG blob from an image src
// ---------------------------------------------------------------------------
async function cropImageToBlob(
  imageSrc: string,
  crop: CropState,
  outputSize = 400
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d")!;

      const scaledW = img.naturalWidth * crop.scale;
      const scaledH = img.naturalHeight * crop.scale;
      const offsetX = (crop.x / 100) * img.naturalWidth * crop.scale;
      const offsetY = (crop.y / 100) * img.naturalHeight * crop.scale;

      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(
        img,
        outputSize / 2 - scaledW / 2 + offsetX,
        outputSize / 2 - scaledH / 2 + offsetY,
        scaledW,
        scaledH
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        },
        "image/png",
        0.95
      );
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

// ---------------------------------------------------------------------------
// Crop Modal
// ---------------------------------------------------------------------------
function CropModal({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (crop: CropState) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ mx: number; my: number; cx: number; cy: number } | null>(null);

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  // ── Mouse drag ──────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragOrigin.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging || !dragOrigin.current || !containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      const dx = ((e.clientX - dragOrigin.current.mx) / w) * 100;
      const dy = ((e.clientY - dragOrigin.current.my) / h) * 100;
      setCrop((c) => ({
        ...c,
        x: clamp(dragOrigin.current!.cx - dx, -50, 50),
        y: clamp(dragOrigin.current!.cy - dy, -50, 50),
      }));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  // ── Touch drag ──────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragOrigin.current = { mx: t.clientX, my: t.clientY, cx: crop.x, cy: crop.y };
    setDragging(true);
  };

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (!dragging || !dragOrigin.current || !containerRef.current) return;
      const t = e.touches[0];
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      const dx = ((t.clientX - dragOrigin.current.mx) / w) * 100;
      const dy = ((t.clientY - dragOrigin.current.my) / h) * 100;
      setCrop((c) => ({
        ...c,
        x: clamp(dragOrigin.current!.cx - dx, -50, 50),
        y: clamp(dragOrigin.current!.cy - dy, -50, 50),
      }));
    };
    const onEnd = () => setDragging(false);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [dragging]);

  const imgTransform = `translate(${-crop.x}%, ${-crop.y}%) scale(${crop.scale})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
            Crop Photo
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crop stage */}
        <div className="px-5 pt-5 flex flex-col items-center">
          <div
            ref={containerRef}
            className="relative h-64 w-64 rounded-full overflow-hidden bg-slate-900 ring-4 ring-slate-200 select-none"
            style={{ cursor: dragging ? "grabbing" : "grab" }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Crop preview"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                transform: imgTransform,
                transition: dragging ? "none" : "transform 80ms ease",
              }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">Drag to reposition</p>
        </div>

        {/* Zoom row */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() =>
              setCrop((c) => ({ ...c, scale: Math.max(0.5, c.scale - 0.1) }))
            }
            className="rounded-xl p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <input
            type="range"
            min={0.5}
            max={3}
            step={0.05}
            value={crop.scale}
            onChange={(e) =>
              setCrop((c) => ({ ...c, scale: parseFloat(e.target.value) }))
            }
            className="flex-1 h-1 accent-slate-800"
          />

          <button
            type="button"
            aria-label="Zoom in"
            onClick={() =>
              setCrop((c) => ({ ...c, scale: Math.min(3, c.scale + 0.1) }))
            }
            className="rounded-xl p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Reset"
            onClick={() => setCrop({ x: 0, y: 0, scale: 1 })}
            className="rounded-xl p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(crop)}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AvatarPicker
// ---------------------------------------------------------------------------
export function AvatarPicker({
  avatarUrl,
  initials = "",
  userId,
  supabaseClient,   // ← add
  onSaved,
  onRemoved,
  onSaveFnReady,
}: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  // Displayed image (blob preview or remote URL)
  const [displayUrl, setDisplayUrl] = useState<string | null>(avatarUrl ?? null);

  // Staged cropped blob — only sent to Supabase when save() is called externally
  const stagedBlob = useRef<Blob | null>(null);
  const [hasPendingChange, setHasPendingChange] = useState(false);

  // Crop modal
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Save function (passed to parent via onSaveFnReady) ──────────────────
  const save = useCallback(async () => {
    if (!stagedBlob.current) return;

    setUploading(true);
    setError(null);

    try {
      const path = `avatars/${userId}/avatar.png`;

      // Now upload fresh
      const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(path, stagedBlob.current, {
          contentType: "image/png",
        });

      if (uploadError) throw uploadError;

      const { data } = supabaseClient.storage.from("avatars").getPublicUrl(path);
      // Bust CDN cache with a timestamp
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      setDisplayUrl(publicUrl);
      stagedBlob.current = null;
      setHasPendingChange(false);
      onSaved?.(publicUrl);
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error("[AvatarPicker] upload error:", err);
    } finally {
      setUploading(false);
    }
  }, [userId, onSaved, supabaseClient.storage]);

  // Expose save fn to parent whenever it changes
  useEffect(() => {
    onSaveFnReady?.(save);
  }, [save, onSaveFnReady]);

  // ── File selected → open crop modal ────────────────────────────────────
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }

    setError(null);
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  }

  // ── Crop confirmed → stage blob, show preview ───────────────────────────
  async function handleCropConfirm(crop: CropState) {
    if (!cropSrc) return;
    try {
      const blob = await cropImageToBlob(cropSrc, crop, 400);
      stagedBlob.current = blob;
      setHasPendingChange(true);
      setDisplayUrl(URL.createObjectURL(blob));
    } catch {
      setError("Failed to process image. Please try again.");
    } finally {
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  // ── Remove ──────────────────────────────────────────────────────────────
  function handleRemove() {
    if (displayUrl?.startsWith("blob:")) URL.revokeObjectURL(displayUrl);
    setDisplayUrl(null);
    stagedBlob.current = null;
    setHasPendingChange(false);
    setError(null);
    onRemoved?.();
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="rounded-2xl border border-border bg-white p-6">
        {/* Section title */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Profile Picture
        </p>

        <div className="flex items-center gap-6">
          {/* ── Avatar display ── */}
          <div className="relative shrink-0 group">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 ring-2 ring-border">
              {displayUrl ? (
                <Image
                  src={displayUrl}
                  alt="Avatar"
                  fill
                  unoptimized={displayUrl.startsWith("blob:")}
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-brand-navy to-brand-blue flex items-center justify-center">
                  {initials ? (
                    <span className="text-2xl font-bold text-white select-none">
                      {initials}
                    </span>
                  ) : (
                    <UserCircle className="h-10 w-10 text-white/60" />
                  )}
                </div>
              )}
            </div>

            {/* Camera overlay on hover */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
              title="Change avatar"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Amber dot — unsaved change indicator */}
            {hasPendingChange && !uploading && (
              <span
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white"
                title="Unsaved changes"
              />
            )}
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:opacity-70 transition-opacity disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5" />
                {displayUrl ? "Change Photo" : "Upload Photo"}
              </button>

              {displayUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:opacity-70 transition-opacity disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>

            {hasPendingChange && (
              <p className="text-xs text-amber-600 font-medium">
                Unsaved — click Save to apply.
              </p>
            )}

            {error && (
              <p className="text-xs font-semibold text-red-500">{error}</p>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </>
  );
}
