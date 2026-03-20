import { useStoredImageSource } from "../../lib/media/images";
import { isRemoteImage } from "../../lib/media/images";

export function ItemImage({
  imageRef,
  alt,
  className
}: {
  imageRef: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (isRemoteImage(imageRef)) {
    return <img src={imageRef ?? undefined} alt={alt} className={className} />;
  }

  const source = useStoredImageSource(imageRef);

  if (!source) {
    return <div className={`image-fallback ${className ?? ""}`.trim()} aria-label={alt} />;
  }

  return <img src={source} alt={alt} className={className} />;
}
