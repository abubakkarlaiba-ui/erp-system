"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  currentImage?: string | null;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  className?: string;
  shape?: "circle" | "square";
  size?: "sm" | "md" | "lg";
  fallbackIcon?: React.ReactNode;
}

export function FileUpload({
  accept = "image/*",
  maxSize = 5,
  currentImage,
  onUpload,
  onRemove,
  className,
  shape = "circle",
  size = "lg",
  fallbackIcon,
}: FileUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const displayImage = preview || currentImage;

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      setUploading(true);
      const url = await onUpload(file);
      setPreview(null);
    } catch (err) {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onRemove?.();
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-muted",
          sizeClasses[size],
          shape === "circle" ? "rounded-full" : "rounded-lg"
        )}
      >
        {uploading ? (
          <Loader2 className={cn("animate-spin text-muted-foreground", iconSizes[size])} />
        ) : displayImage ? (
          <img src={displayImage} alt="" className="h-full w-full object-cover" />
        ) : (
          fallbackIcon || <ImageIcon className={cn("text-muted-foreground", iconSizes[size])} />
        )}
        {displayImage && !uploading && onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Max {maxSize}MB. JPG, PNG, GIF, WEBP.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
