import { useState } from 'react'

type SafeImageProps = {
  src: string
  alt: string
  className?: string
}

export function SafeImage({ src, alt, className = '' }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return (
      <span
        className={`${className} image-fallback`}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        ছবি অনুপলব্ধ
      </span>
    )
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailedSrc(src)} />
}
