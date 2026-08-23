"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { PRODUCT_IMAGE_ACCEPT, productImageSpecLabel } from "@/lib/product-image";

type Props = {
  imageUrl: string;
  uploading: boolean;
  fileName?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
};

export function ProductImageUpload({
  imageUrl,
  uploading,
  fileName,
  disabled,
  onFileSelect,
  onUrlChange,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasImage = Boolean(imageUrl);
  const isRemoteUrl = hasImage && !imageUrl.startsWith("blob:");

  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl]);

  const pickFile = useCallback(() => {
    if (!disabled && !uploading) inputRef.current?.click();
  }, [disabled, uploading]);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (disabled || uploading) return;
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="md:col-span-2 space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!hasImage) pickFile();
          }
        }}
        onClick={() => {
          if (!hasImage) pickFile();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={[
          "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
          hasImage
            ? "border-iseul-line bg-iseul-paper shadow-sm"
            : dragActive
              ? "border-iseul-pine bg-iseul-dew/80 shadow-md scale-[1.01]"
              : "border-dashed border-iseul-sage/50 bg-gradient-to-br from-iseul-paper via-iseul-dew/30 to-iseul-areia/40 hover:border-iseul-pine/40 hover:shadow-sm",
          disabled ? "pointer-events-none opacity-60" : "cursor-pointer",
        ].join(" ")}
      >
        {!hasImage ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[320px]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-iseul-line/80">
              <ImagePlus className="h-7 w-7 text-iseul-pine" strokeWidth={1.5} />
            </div>
            <p className="font-serif text-lg text-iseul-ink">Adicionar foto do produto</p>
            <p className="mt-1 max-w-sm text-sm text-iseul-muted">
              Arraste a imagem aqui ou clique para escolher do computador
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-iseul-pine px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-iseul-pine/90">
              <Upload className="h-4 w-4" />
              Escolher arquivo
            </span>
            <p className="mt-4 text-xs leading-relaxed text-iseul-muted/90">{productImageSpecLabel()}</p>
          </div>
        ) : (
          <>
            <div className="relative aspect-square w-full max-h-[420px] bg-iseul-areia/30 sm:max-h-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Foto do produto"
                onLoad={() => setImageLoaded(true)}
                className={[
                  "h-full w-full object-cover transition-all duration-500",
                  imageLoaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
                ].join(" ")}
              />

              {uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-iseul-ink/45 backdrop-blur-[2px]">
                  <Loader2 className="h-9 w-9 animate-spin text-white" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-white">Enviando foto…</p>
                </div>
              )}

              {!uploading && isRemoteUrl && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-iseul-pine shadow-sm ring-1 ring-iseul-line/60 backdrop-blur-sm">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Foto adicionada
                </div>
              )}

              {!uploading && (
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-iseul-ink/55 via-iseul-ink/20 to-transparent p-4 pt-16 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="min-w-0 text-left">
                    {fileName && (
                      <p className="truncate text-xs font-medium text-white/95">{fileName}</p>
                    )}
                    <p className="text-[11px] text-white/75">Como aparecerá na loja</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageLoaded(false);
                        pickFile();
                      }}
                      className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-iseul-ink shadow-sm transition hover:bg-white"
                    >
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageLoaded(false);
                        onRemove();
                      }}
                      className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/25 transition hover:bg-white/25"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {hasImage && !uploading && (
        <div className="flex items-start gap-2 rounded-xl border border-iseul-dew bg-iseul-dew/40 px-3.5 py-3 text-sm text-iseul-pine">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
          <p>
            {isRemoteUrl
              ? "Imagem pronta. Clique em salvar para vincular ao produto."
              : "Pré-visualização local — aguardando envio…"}
          </p>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowUrlField((v) => !v)}
          className="text-xs font-medium text-iseul-muted underline-offset-2 hover:text-iseul-pine hover:underline"
        >
          {showUrlField ? "Ocultar campo de URL" : "Usar URL em vez de arquivo"}
        </button>
        {showUrlField && (
          <div className="mt-2">
            <label className="mb-1 block text-xs font-medium text-neutral-700">URL da imagem</label>
            <input
              name="image_url"
              value={imageUrl.startsWith("blob:") ? "" : imageUrl}
              onChange={(e) => {
                setImageLoaded(false);
                onUrlChange(e.target.value);
              }}
              disabled={disabled || uploading}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iseul-accent/30"
              placeholder="https://..."
            />
          </div>
        )}
        {!showUrlField && (
          <input type="hidden" name="image_url" value={imageUrl.startsWith("blob:") ? "" : imageUrl} readOnly />
        )}
      </div>
    </div>
  );
}
