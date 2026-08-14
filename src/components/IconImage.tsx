import { useState } from 'react';

interface IconImageProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

export function IconImage({ src, alt, size = 48, className = '' }: IconImageProps) {
  const [errored, setErrored] = useState(false);
  const dim = { width: size, height: size };

  if (!src || errored) {
    return (
      <div
        style={dim}
        className={`flex items-center justify-center rounded border border-slate-700 bg-slate-800 text-[10px] font-mono text-slate-500 ${className}`}
      >
        ?
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={dim}
      loading="lazy"
      onError={() => setErrored(true)}
      className={`rounded border border-slate-700 bg-slate-800 object-contain ${className}`}
    />
  );
}
