'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface MeshLetteringProps {
  text: string;
  colors?: [string, string]; // [silkColor, sheenColor]
  sheen?: number; // Strength of satin-like highlights (0 - 2, default: 1.3)
  gloss?: number; // Sharpness of highlights (0 - 1, default: 0.85)
  iridescence?: number; // Shift toward sheen color at glancing angles (0 - 1, default: 0.6)
  wind?: number; // Breeze speed & ripple intensity (default: 1.0)
  fontSize?: number; // Font size in px (if not specified, auto-scales to container)
  fontWeight?: string | number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'auto';
  interactive?: boolean; // Billow & ripple in response to pointer/touch
  className?: string;
  as?: React.ElementType;
}

function parseHexOrRgb(color: string): [number, number, number] {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const val = parseInt(hex, 16);
    return [((val >> 16) & 255) / 255, ((val >> 8) & 255) / 255, (val & 255) / 255];
  }
  const match = color.match(/\d+/g);
  if (match && match.length >= 3) {
    return [parseInt(match[0], 10) / 255, parseInt(match[1], 10) / 255, parseInt(match[2], 10) / 255];
  }
  return [0.72, 0.42, 0.08]; // fallback amber
}

function getEffectiveFontSize(baseFontSize: number | undefined, containerWidth: number): number {
  if (baseFontSize) {
    // If large headline (e.g. >= 28px), clamp on narrower mobile viewports
    if (baseFontSize >= 28) {
      return Math.min(baseFontSize, Math.max(Math.floor(containerWidth * 0.082), 22));
    }
    // Tagline / body font clamp
    return Math.min(baseFontSize, Math.max(Math.floor(containerWidth * 0.046), 14));
  }
  return Math.min(Math.max(Math.floor(containerWidth * 0.075), 22), 50);
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const w of words) {
    const test = currentLine ? `${currentLine} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = w;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [text];
}

export function MeshLettering({
  text,
  colors = ['#b45309', '#fef08a'], // Warm Golden Amber Silk + Butter Satin Sheen
  sheen = 1.35,
  gloss = 0.85,
  iridescence = 0.6,
  wind = 1.0,
  fontSize,
  fontWeight = '900',
  lineHeight = 1.2,
  textAlign = 'left',
  interactive = true,
  className,
  as: Component = 'div',
}: MeshLetteringProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const pointerPos = useRef({ x: 0.5, y: 0.5 });
  const gustPower = useRef(0);
  const animFrameId = useRef<number | null>(null);

  // Measure text and determine container dimensions
  const updateDimensions = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const w = el.clientWidth || 320;
    const computedFontSize = getEffectiveFontSize(fontSize, w);

    // Measure exact wrap height with offscreen 2D canvas
    const dummy = document.createElement('canvas');
    const dctx = dummy.getContext('2d');
    if (dctx) {
      dctx.font = `${fontWeight} ${computedFontSize}px system-ui, -apple-system, sans-serif`;
      const maxTextWidth = Math.max(w - 12, 100);
      const lines = wrapTextLines(dctx, text, maxTextWidth);
      const calculatedHeight = Math.ceil(lines.length * computedFontSize * lineHeight + 18);
      setContainerSize({ width: w, height: Math.max(calculatedHeight, 36) });
    } else {
      setContainerSize({ width: w, height: 56 });
    }
  }, [text, fontSize, fontWeight, lineHeight]);

  useEffect(() => {
    updateDimensions();
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [updateDimensions]);

  // Main WebGL / Canvas Silk Shader Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || containerSize.width <= 0 || containerSize.height <= 0) return;

    const { width, height } = containerSize;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    // 1. Render text mask to offscreen 2D canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const ctx = offscreen.getContext('2d');

    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const computedFontSize = getEffectiveFontSize(fontSize, width);
    ctx.font = `${fontWeight} ${computedFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';

    const maxTextWidth = Math.max(width - 12, 100);
    const lines = wrapTextLines(ctx, text, maxTextWidth);
    const totalBlockHeight = lines.length * computedFontSize * lineHeight;
    let startY = Math.max((height - totalBlockHeight) / 2, 6);

    const isCenter =
      textAlign === 'center' ||
      (textAlign === 'auto' && (width < 640 || (typeof window !== 'undefined' && window.innerWidth < 1024)));
    const isRight = textAlign === 'right';

    lines.forEach((line) => {
      const lineWidth = ctx.measureText(line).width;
      let startX = 6;
      if (isCenter) {
        startX = Math.max((width - lineWidth) / 2, 4);
      } else if (isRight) {
        startX = Math.max(width - lineWidth - 6, 4);
      }
      ctx.fillText(line, startX, startY);
      startY += computedFontSize * lineHeight;
    });

    // 2. Setup WebGL Context
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });

    // Fallback if WebGL is unavailable: draw offscreen directly with satin gradient
    if (!gl) {
      const fallbackCtx = canvas.getContext('2d');
      if (fallbackCtx) {
        fallbackCtx.drawImage(offscreen, 0, 0);
      }
      return;
    }

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform sampler2D u_textTexture;
      uniform float u_time;
      uniform vec2 u_pointer;
      uniform float u_gust;
      uniform vec3 u_colorSilk;
      uniform vec3 u_colorSheen;
      uniform float u_sheen;
      uniform float u_gloss;
      uniform float u_iridescence;
      uniform float u_wind;
      varying vec2 v_uv;

      void main() {
        vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y); // Invert Y for WebGL texture coordinates

        // Interactive pointer gust ripple
        vec2 toPointer = v_uv - u_pointer;
        float dist = length(toPointer);
        vec2 gustOffset = vec2(0.0);
        if (dist < 0.42) {
          float factor = (1.0 - dist / 0.42) * u_gust;
          gustOffset = normalize(toPointer + vec2(0.001)) * sin(dist * 20.0 - u_time * 6.5) * factor * 0.024;
        }

        // 3D silk wave ripples
        float wave1 = sin(uv.x * 6.8 + uv.y * 3.6 + u_time * 1.5 * u_wind) * 0.011;
        float wave2 = cos(uv.x * 13.5 - uv.y * 6.8 + u_time * 2.0 * u_wind) * 0.006;
        float wave3 = sin((uv.x + uv.y) * 17.0 + u_time * 2.6 * u_wind) * 0.004;
        vec2 displacedUV = uv + vec2(wave1 + wave2, wave2 + wave3) * u_wind + gustOffset;

        // Sample text mask
        vec4 textSample = texture2D(u_textTexture, displacedUV);
        if (textSample.a < 0.06) {
          discard;
        }

        // Calculate surface normal along the silk ripples
        float hL = sin((displacedUV.x - 0.015) * 8.0 + displacedUV.y * 4.0 + u_time * 1.8 * u_wind);
        float hR = sin((displacedUV.x + 0.015) * 8.0 + displacedUV.y * 4.0 + u_time * 1.8 * u_wind);
        float hD = sin(displacedUV.x * 8.0 + (displacedUV.y - 0.015) * 4.0 + u_time * 1.8 * u_wind);
        float hU = sin(displacedUV.x * 8.0 + (displacedUV.y + 0.015) * 4.0 + u_time * 1.8 * u_wind);
        vec3 normal = normalize(vec3((hL - hR) * 1.8, (hD - hU) * 1.8, 1.0));

        // Light direction roaming slightly with breeze
        vec3 lightDir = normalize(vec3(cos(u_time * 0.4) * 0.6 + 0.4, sin(u_time * 0.3) * 0.4 - 0.5, 1.25));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);

        float diffuse = clamp(dot(normal, lightDir), 0.38, 1.0);
        float spec = pow(clamp(dot(normal, halfDir), 0.0, 1.0), u_gloss * 38.0 + 4.0) * u_sheen;

        // Glancing angle sheen (iridescence)
        float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.2) * u_iridescence;

        // Composite silk base + shimmering satin highlight
        vec3 baseColor = mix(u_colorSilk, u_colorSheen, fresnel * 0.65);
        vec3 finalColor = baseColor * diffuse + u_colorSheen * spec;

        gl_FragColor = vec4(finalColor, textSample.a);
      }
    `;

    function createShader(type: number, source: string) {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Quad geometry
    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Create & bind texture from offscreen canvas
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);

    // Uniforms
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');
    const uGust = gl.getUniformLocation(program, 'u_gust');
    const uSilk = gl.getUniformLocation(program, 'u_colorSilk');
    const uSheen = gl.getUniformLocation(program, 'u_colorSheen');
    const uSheenAmt = gl.getUniformLocation(program, 'u_sheen');
    const uGloss = gl.getUniformLocation(program, 'u_gloss');
    const uIrid = gl.getUniformLocation(program, 'u_iridescence');
    const uWind = gl.getUniformLocation(program, 'u_wind');

    const silkRgb = parseHexOrRgb(colors[0]);
    const sheenRgb = parseHexOrRgb(colors[1]);

    gl.uniform3f(uSilk, silkRgb[0], silkRgb[1], silkRgb[2]);
    gl.uniform3f(uSheen, sheenRgb[0], sheenRgb[1], sheenRgb[2]);
    gl.uniform1f(uSheenAmt, sheen);
    gl.uniform1f(uGloss, gloss);
    gl.uniform1f(uIrid, iridescence);
    gl.uniform1f(uWind, wind);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uPointer, pointerPos.current.x, pointerPos.current.y);
      gl.uniform1f(uGust, gustPower.current);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Decay gust back to calm breeze
      gustPower.current *= 0.94;

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buf);
    };
  }, [containerSize, text, colors, sheen, gloss, iridescence, wind, fontSize, fontWeight, lineHeight, textAlign]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    pointerPos.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    gustPower.current = Math.min(gustPower.current + 0.2, 1.35);
  };

  return (
    <Component
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      className={cn('relative w-full overflow-hidden select-none transition-all duration-200', className)}
      style={{ minHeight: containerSize.height ? `${containerSize.height}px` : 'auto' }}
      aria-label={text}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-auto block pointer-events-none"
        style={{ width: `${containerSize.width}px`, height: `${containerSize.height}px` }}
      />
      {/* Hidden accessible text for Screen Readers & Web Crawlers */}
      <span className="sr-only">{text}</span>
    </Component>
  );
}

export default MeshLettering;
