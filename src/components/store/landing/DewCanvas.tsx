"use client";

import { useEffect, useRef } from "react";

export function DewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    type Gota = { x: number; y: number; r: number; v: number; o: number; f: number };
    let gotas: Gota[] = [];

    function nova(y?: number): Gota {
      const r = 3 + Math.random() * 15;
      return {
        x: Math.random() * w,
        y: y === undefined ? Math.random() * h : y,
        r,
        v: 0.04 + Math.random() * 0.1,
        o: 0.1 + Math.random() * 0.2,
        f: Math.random() * 6.28,
      };
    }

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function montar() {
      const n = Math.max(8, Math.round(w / 46));
      gotas = [];
      for (let i = 0; i < n; i++) gotas.push(nova());
    }

    function desenhar() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < gotas.length; i++) {
        const g = gotas[i];
        g.y += g.v;
        g.f += 0.004;
        g.x += Math.sin(g.f) * 0.12;
        if (g.y - g.r > h) gotas[i] = nova(-24);

        const gr = ctx.createRadialGradient(
          g.x - g.r * 0.3,
          g.y - g.r * 0.35,
          g.r * 0.08,
          g.x,
          g.y,
          g.r
        );
        gr.addColorStop(0, `rgba(255,255,255,${g.o * 1.6})`);
        gr.addColorStop(0.55, `rgba(143,168,154,${g.o * 0.6})`);
        gr.addColorStop(1, "rgba(143,168,154,0)");
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, 6.2832);
        ctx.fillStyle = gr;
        ctx.fill();
      }
      raf = requestAnimationFrame(desenhar);
    }

    function onResize() {
      medir();
      montar();
    }

    medir();
    montar();
    raf = requestAnimationFrame(desenhar);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="dew"
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
