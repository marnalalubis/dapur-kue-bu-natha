'use client';

import React, { useState, useId } from 'react';
import { cn } from '@/lib/utils';

export interface DominoLetteringProps {
  text: string;
  className?: string;
  letterClassName?: string;
  stagger?: number; // Delay between each domino letter falling (in seconds, e.g. 0.08)
  cycleDuration?: number; // Duration of full topple & rebuild cycle in seconds (e.g. 3.2)
  variant?: 'tile' | 'clean' | 'gradient';
  direction?: 'right' | 'left' | 'forward';
  interactive?: boolean; // Allows manual replay on click/hover
  autoPlay?: boolean; // Loop continuously (ideal for loading state)
  as?: React.ElementType;
}

export function DominoLettering({
  text,
  className,
  letterClassName,
  stagger = 0.07,
  cycleDuration = 3.2,
  variant = 'tile',
  direction = 'right',
  interactive = true,
  autoPlay = true,
  as: Component = 'div',
}: DominoLetteringProps) {
  const [replayKey, setReplayKey] = useState(0);
  const uniqueId = useId().replace(/[:]/g, '');

  const words = text.split(' ');
  let charCounter = 0;

  const handleTrigger = () => {
    if (interactive) {
      setReplayKey((prev) => prev + 1);
    }
  };

  const animationName =
    direction === 'left'
      ? `dominoToppleLeft_${uniqueId}`
      : direction === 'forward'
      ? `dominoToppleForward_${uniqueId}`
      : `dominoToppleRight_${uniqueId}`;

  const transformOrigin =
    direction === 'left'
      ? 'bottom left'
      : direction === 'forward'
      ? 'bottom center'
      : 'bottom right';

  return (
    <>
      <style>{`
        @keyframes dominoToppleRight_${uniqueId} {
          0%, 12% {
            transform: perspective(600px) rotate3d(0, 0, 1, 0deg) rotateX(0deg) translateY(0) scale(1);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06));
          }
          32%, 58% {
            /* Topple like domino tiles falling to the right */
            transform: perspective(600px) rotate3d(0, 0, 1, 70deg) rotateX(15deg) translateY(6px) scale(0.92);
            filter: drop-shadow(0 6px 12px rgba(180, 83, 9, 0.25));
          }
          72% {
            /* Spring rebuild past upright */
            transform: perspective(600px) rotate3d(0, 0, 1, -8deg) rotateX(-4deg) translateY(-2px) scale(1.03);
          }
          84% {
            /* Settle back */
            transform: perspective(600px) rotate3d(0, 0, 1, 2deg) translateY(0) scale(1);
          }
          92%, 100% {
            /* Upright ready for next cycle */
            transform: perspective(600px) rotate3d(0, 0, 1, 0deg) rotateX(0deg) translateY(0) scale(1);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06));
          }
        }

        @keyframes dominoToppleLeft_${uniqueId} {
          0%, 12% {
            transform: perspective(600px) rotate3d(0, 0, 1, 0deg) translateY(0) scale(1);
          }
          32%, 58% {
            transform: perspective(600px) rotate3d(0, 0, 1, -70deg) rotateX(15deg) translateY(6px) scale(0.92);
          }
          72% {
            transform: perspective(600px) rotate3d(0, 0, 1, 8deg) translateY(-2px) scale(1.03);
          }
          84% {
            transform: perspective(600px) rotate3d(0, 0, 1, -2deg) translateY(0) scale(1);
          }
          92%, 100% {
            transform: perspective(600px) rotate3d(0, 0, 1, 0deg) translateY(0) scale(1);
          }
        }

        @keyframes dominoToppleForward_${uniqueId} {
          0%, 12% {
            transform: perspective(600px) rotateX(0deg) translateY(0) scale(1);
          }
          32%, 58% {
            transform: perspective(600px) rotateX(75deg) translateY(8px) scale(0.9);
          }
          72% {
            transform: perspective(600px) rotateX(-12deg) translateY(-2px) scale(1.04);
          }
          84% {
            transform: perspective(600px) rotateX(3deg) translateY(0) scale(1);
          }
          92%, 100% {
            transform: perspective(600px) rotateX(0deg) translateY(0) scale(1);
          }
        }
      `}</style>

      <Component
        key={replayKey}
        onClick={handleTrigger}
        onMouseEnter={interactive ? handleTrigger : undefined}
        className={cn(
          'inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 select-none perspective-[1000px]',
          interactive && 'cursor-pointer',
          className
        )}
        style={{ perspective: '1000px' }}
      >
        {words.map((word, wordIdx) => (
          <span
            key={`word-${wordIdx}`}
            className="inline-flex items-center gap-1 preserve-3d"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {word.split('').map((char, charIdx) => {
              const overallIndex = charCounter++;
              const delay = `${(overallIndex * stagger).toFixed(3)}s`;

              return (
                <span
                  key={`char-${wordIdx}-${charIdx}`}
                  className={cn(
                    'inline-flex items-center justify-center font-black transition-all transform-gpu',
                    variant === 'tile' &&
                      'w-8 h-10 sm:w-10 sm:h-12 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-stone-900 shadow-md border-b-2 border-amber-700/60 text-lg sm:text-2xl',
                    variant === 'gradient' &&
                      'text-2xl sm:text-4xl tracking-tight bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent px-0.5',
                    variant === 'clean' &&
                      'text-2xl sm:text-4xl tracking-tight text-stone-900 px-0.5',
                    letterClassName
                  )}
                  style={{
                    transformOrigin,
                    transformStyle: 'preserve-3d',
                    animation: autoPlay
                      ? `${animationName} ${cycleDuration}s cubic-bezier(0.34, 1.3, 0.64, 1) infinite`
                      : 'none',
                    animationDelay: delay,
                    willChange: 'transform',
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </Component>
    </>
  );
}

export default DominoLettering;
