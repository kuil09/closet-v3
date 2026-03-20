import React from "react";
import { afterEach, mock } from "bun:test";
import { cleanup } from "@testing-library/react";
import "../src/lib/testing/setup";
import { atelierDb } from "../src/lib/db/app-db";
import { defaultPreferences, usePreferencesStore } from "../src/lib/state/preferences-store";

mock.module("react-konva", () => {
  const sanitizeProps = (props: Record<string, unknown>) => {
    const next = { ...props };
    delete next.children;
    delete next.cornerRadius;
    delete next.draggable;
    delete next.fill;
    delete next.fontFamily;
    delete next.fontSize;
    delete next.fontStyle;
    delete next.height;
    delete next.image;
    delete next.onDragEnd;
    delete next.onTap;
    delete next.opacity;
    delete next.rotation;
    delete next.shadowBlur;
    delete next.shadowOpacity;
    delete next.stroke;
    delete next.strokeWidth;
    delete next.text;
    delete next.width;
    delete next.x;
    delete next.y;
    return next;
  };

  const Stage = React.forwardRef((_props: Record<string, unknown>, ref: React.ForwardedRef<{ toDataURL: () => string }>) => {
    const { children, ...props } = _props;
    React.useImperativeHandle(ref, () => ({
      toDataURL: () => "data:image/png;base64,stage"
    }));
    return React.createElement("div", sanitizeProps(props), children as React.ReactNode);
  });

  const passthrough = ({ children, ...props }: Record<string, unknown>) =>
    React.createElement("div", sanitizeProps(props), children as React.ReactNode);
  const empty = (props: Record<string, unknown>) => React.createElement("div", sanitizeProps(props));

  return {
    Stage,
    Layer: passthrough,
    Rect: empty,
    Text: empty,
    Image: empty
  };
});

mock.module("use-image", () => ({
  default: () => [null]
}));

afterEach(async () => {
  cleanup();
  localStorage.clear();
  usePreferencesStore.setState(defaultPreferences);
  await atelierDb.transaction(
    "rw",
    atelierDb.items,
    atelierDb.images,
    atelierDb.lookbooks,
    atelierDb.weatherCache,
    async () => {
      await atelierDb.items.clear();
      await atelierDb.images.clear();
      await atelierDb.lookbooks.clear();
      await atelierDb.weatherCache.clear();
    }
  );
});
