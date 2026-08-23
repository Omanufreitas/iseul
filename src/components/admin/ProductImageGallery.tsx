"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { PRODUCT_IMAGE_ACCEPT, productImageSpecLabel } from "@/lib/product-image";

type Props = {
  images: string[];
  uploading: boolean;
  disabled?: boolean;
  onAddFiles: (files: File[]) => void;
  onAddUrl: (url: string) => void;
  onRemove: (index: number) => void;
  onSetCover: (index: number) => void;
  onSelect: (index: number) => void;
  selectedIndex: number;
};

export function ProductImageGallery({
  images,
  uploading,
  disabled,
  onAddFiles,
  onAddUrl,
  onRemove,
  onSetCover,
  onSelect,
  selectedIndex,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasImages = images.length > 0;
  const previewUrl = images[selectedIndex] ?? "";
  const isRemoteUrl = Boolean(previewUrl && !previewUrl.startsWith("blob:"));

  useEffect(() => {
    setImageLoaded(false);
  }, [previewUrl]);

  const pickFiles = useCallback(() => {
    if (!disabled && !uploading) inputRef.current?.click();
  }, [disabled, uploading]);

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    onAddFiles(Array.from(files));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (disabled || uploading) return;
    handleFiles(e.dataTransfer.files);
  }

  function submitUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    onAddUrl(url);
    setUrlDraft("");
    setShowUrlField(false);
  }

  return (
    <div className="md:col-span-2 space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        multiple
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {hasImages ? (
        <>
          <div className="group relative overflow-hidden rounded-2xl border border-iseul-line bg-iseul-paper shadow-sm">
            <div className="relative aspect-square w-full max-h-[420px] bg-iseul-areia/30 sm:max-h-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
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
                  <p className="text-sm font-medium text-white">Enviando fotos…</p>
                </div>
              )}

              {selectedIndex === 0 && !uploading && isRemoteUrl && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-iseul-pine shadow-sm ring-1 ring-iseul-line/60">
                  <Star className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                  Capa
                </div>
              )}

              {!uploading && (
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-iseul-ink/55 via-iseul-ink/20 to-transparent p-4 pt-16 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="text-[11px] text-white/80">
                    Foto {selectedIndex + 1} de {images.length}
                  </p>
                  <div className="flex shrink-0 gap-2">
                    {selectedIndex !== 0 && (
                      <button
                        type="button"
                        onClick={() => onSetCover(selectedIndex)}
                        className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-iseul-ink shadow-sm hover:bg-white"
                      >
                        Definir capa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(selectedIndex)}
                      className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/25 hover:bg-white/25"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {images.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => onSelect(index)}
                className={[
                  "relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all",
                  index === selectedIndex
                    ? "border-iseul-pine ring-2 ring-iseul-pine/20"
                    : "border-iseul-line hover:border-iseul-sage",
                ].join(" ")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-iseul-pine px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                    Capa
                  </span>
                )}
              </button>
            ))}

            <button
              type="button"
              onClick={pickFiles}
              disabled={disabled || uploading}
              className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-iseul-sage/50 bg-iseul-dew/30 text-iseul-pine transition hover:border-iseul-pine hover:bg-iseul-dew/60 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
              <span className="text-[9px] font-medium leading-none">Mais</span>
            </button>
          </div>

          <button
            type="button"
            onClick={pickFiles}
            disabled={disabled || uploading}
            className="inline-flex items-center gap-2 rounded-full bg-iseul-pine px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-iseul-pine/90 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Adicionar mais fotos
              </>
            )}
          </button>
        </>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              pickFiles();
            }
          }}
          onClick={pickFiles}
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
            "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
            dragActive
              ? "border-iseul-pine bg-iseul-dew/80 shadow-md scale-[1.01]"
              : "border-dashed border-iseul-sage/50 bg-gradient-to-br from-iseul-paper via-iseul-dew/30 to-iseul-areia/40 hover:border-iseul-pine/40 hover:shadow-sm",
            disabled ? "pointer-events-none opacity-60" : "cursor-pointer",
          ].join(" ")}
        >
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[320px]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-iseul-line/80">
              <ImagePlus className="h-7 w-7 text-iseul-pine" strokeWidth={1.5} />
            </div>
            <p className="font-serif text-lg text-iseul-ink">Adicionar fotos do produto</p>
            <p className="mt-1 max-w-sm text-sm text-iseul-muted">
              Arraste uma ou várias imagens, ou clique para escolher do computador
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-iseul-pine px-4 py-2 text-sm font-medium text-white shadow-sm">
              <Upload className="h-4 w-4" />
              Escolher arquivos
            </span>
            <p className="mt-4 text-xs leading-relaxed text-iseul-muted/90">{productImageSpecLabel()}</p>
          </div>
        </div>
      )}

      {hasImages && !uploading && (
        <div className="flex items-start gap-2 rounded-xl border border-iseul-dew bg-iseul-dew/40 px-3.5 py-3 text-sm text-iseul-pine">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
          <p>
            {images.length === 1
              ? "1 foto pronta. Adicione quantas quiser — a primeira é a capa na loja."
              : `${images.length} fotos prontas. A primeira é a capa. Salve para vincular ao produto.`}
          </p>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowUrlField((v) => !v)}
          className="text-xs font-medium text-iseul-muted underline-offset-2 hover:text-iseul-pine hover:underline"
        >
          {showUrlField ? "Ocultar campo de URL" : "Adicionar foto por URL"}
        </button>
        {showUrlField && (
          <div className="mt-2 flex gap-2">
            <input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              disabled={disabled || uploading}
              className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-iseul-accent/30"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={submitUrl}
              disabled={disabled || uploading || !urlDraft.trim()}
              className="shrink-0 rounded-lg border border-iseul-line px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
