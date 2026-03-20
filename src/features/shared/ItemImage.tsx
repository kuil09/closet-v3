import type { MouseEventHandler, PointerEventHandler, Ref } from "react";
import { useStoredImageSource } from "../../lib/media/images";
import { isRemoteImage } from "../../lib/media/images";

export function ItemImage({
  imageRef,
  alt,
  className,
  imgRef,
  onImageClick,
  onImagePointerDown
}: {
  imageRef: string | null | undefined;
  alt: string;
  className?: string;
  imgRef?: Ref<HTMLImageElement>;
  onImageClick?: MouseEventHandler<HTMLImageElement>;
  onImagePointerDown?: PointerEventHandler<HTMLImageElement>;
}) {
  if (isRemoteImage(imageRef)) {
    return (
      <img
        ref={imgRef}
        src={imageRef ?? undefined}
        alt={alt}
        className={className}
        onClick={onImageClick}
        onPointerDown={onImagePointerDown}
      />
    );
  }

  const source = useStoredImageSource(imageRef);

  if (!source) {
    return <div className={`image-fallback ${className ?? ""}`.trim()} aria-label={alt} />;
  }

  return <img ref={imgRef} src={source} alt={alt} className={className} onClick={onImageClick} onPointerDown={onImagePointerDown} />;
}
