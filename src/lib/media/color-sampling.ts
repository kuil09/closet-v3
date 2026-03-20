type BoundsLike = Pick<DOMRect, "left" | "top" | "width" | "height">;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function channelToHex(value: number) {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function normalizeObjectFit(value: string) {
  if (value === "contain" || value === "cover" || value === "fill") {
    return value;
  }

  return "fill";
}

export function mapClientPointToImagePixel({
  bounds,
  naturalWidth,
  naturalHeight,
  clientX,
  clientY,
  objectFit
}: {
  bounds: BoundsLike;
  naturalWidth: number;
  naturalHeight: number;
  clientX: number;
  clientY: number;
  objectFit: string;
}) {
  if (bounds.width <= 0 || bounds.height <= 0 || naturalWidth <= 0 || naturalHeight <= 0) {
    return null;
  }

  const fit = normalizeObjectFit(objectFit);
  if (fit === "fill") {
    return {
      x: clamp(Math.floor(((clientX - bounds.left) / bounds.width) * naturalWidth), 0, naturalWidth - 1),
      y: clamp(Math.floor(((clientY - bounds.top) / bounds.height) * naturalHeight), 0, naturalHeight - 1)
    };
  }

  const scale =
    fit === "contain"
      ? Math.min(bounds.width / naturalWidth, bounds.height / naturalHeight)
      : Math.max(bounds.width / naturalWidth, bounds.height / naturalHeight);
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  const renderedLeft = bounds.left + (bounds.width - renderedWidth) / 2;
  const renderedTop = bounds.top + (bounds.height - renderedHeight) / 2;

  if (
    fit === "contain" &&
    (clientX < renderedLeft ||
      clientX > renderedLeft + renderedWidth ||
      clientY < renderedTop ||
      clientY > renderedTop + renderedHeight)
  ) {
    return null;
  }

  return {
    x: clamp(Math.floor(((clientX - renderedLeft) / renderedWidth) * naturalWidth), 0, naturalWidth - 1),
    y: clamp(Math.floor(((clientY - renderedTop) / renderedHeight) * naturalHeight), 0, naturalHeight - 1)
  };
}

export function sampleImageColor(image: HTMLImageElement, clientX: number, clientY: number) {
  const bounds = image.getBoundingClientRect();
  if (bounds.width === 0 || bounds.height === 0 || image.naturalWidth === 0 || image.naturalHeight === 0) {
    return null;
  }

  const point = mapClientPointToImagePixel({
    bounds,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    clientX,
    clientY,
    objectFit: window.getComputedStyle(image).objectFit
  });
  if (!point) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const [red, green, blue, alpha] = context.getImageData(point.x, point.y, 1, 1).data;
  if (alpha === 0) {
    return null;
  }

  return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`;
}
