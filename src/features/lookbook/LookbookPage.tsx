import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Image as KonvaImage, Layer, Rect, Stage, Text as KonvaText } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { atelierDb } from "../../lib/db/app-db";
import { saveLookbook } from "../../lib/db/repository";
import type { ClosetItem, Lookbook, LookbookElement } from "../../lib/db/types";
import { useI18n } from "../../lib/i18n/i18n";
import { useStoredImageSource } from "../../lib/media/images";
import { makeId } from "../../lib/utils/id";
import { DisclosureSection } from "../shared/DisclosureSection";
import { ItemImage } from "../shared/ItemImage";

const backgroundMap = {
  paper: "#f9f9f7",
  mist: "#ecefec",
  sand: "#f5e7d0",
  olive: "#dee4e0"
} as const;

function createBlankLookbook(title: string, defaultHeadline: string, defaultBody: string): Lookbook {
  const now = new Date().toISOString();
  return {
    id: makeId("look"),
    title,
    description: "",
    backgroundStyle: "paper",
    canvasSize: { width: 520, height: 680 },
    elements: [
      {
        id: makeId("el"),
        type: "headline",
        position: { x: 50, y: 50 },
        size: { width: 250, height: 100 },
        rotation: 0,
        zIndex: 1,
        locked: false,
        style: {
          color: "#5F5E5E",
          fontSize: 34,
          fontFamily: "Manrope",
          fontWeight: 800
        },
        refId: null,
        text: defaultHeadline
      },
      {
        id: makeId("el"),
        type: "bodyText",
        position: { x: 54, y: 150 },
        size: { width: 280, height: 80 },
        rotation: 0,
        zIndex: 2,
        locked: false,
        style: {
          color: "#5F5E5E",
          fontSize: 16,
          fontFamily: "Work Sans",
          fontWeight: 500
        },
        refId: null,
        text: defaultBody
      }
    ],
    sourceItemIds: [],
    thumbnailImageId: null,
    createdAt: now,
    updatedAt: now
  };
}

function normalizeElements(elements: LookbookElement[]): LookbookElement[] {
  return [...elements]
    .sort((left, right) => left.zIndex - right.zIndex)
    .map((element, index) => ({
      ...element,
      zIndex: index + 1
    }));
}

function elementLabel(element: LookbookElement): string {
  if (element.type === "headline" || element.type === "bodyText") {
    return element.text?.slice(0, 24) || element.type;
  }

  return element.type;
}

export function LookbookPage() {
  const { t } = useI18n();
  const untitledTitle = t("lookbook.untitled");
  const items = useLiveQuery(() => atelierDb.items.filter((item) => item.status !== "archived").toArray(), [], []);
  const lookbooks = useLiveQuery(() => atelierDb.lookbooks.toArray(), [], []);
  const [current, setCurrent] = useState<Lookbook>(() =>
    createBlankLookbook(untitledTitle, t("lookbook.defaultHeadline"), t("lookbook.defaultBody"))
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    if (lookbooks.length > 0 && current.title === untitledTitle) {
      setCurrent(lookbooks[0]);
    }
  }, [current.title, lookbooks, untitledTitle]);

  const selectedElement = useMemo(
    () => current.elements.find((element) => element.id === selectedElementId) ?? null,
    [current.elements, selectedElementId]
  );

  function setElements(nextElements: LookbookElement[]) {
    setCurrent((prev) => ({
      ...prev,
      elements: normalizeElements(nextElements),
      updatedAt: new Date().toISOString()
    }));
  }

  function upsertElement(next: LookbookElement) {
    setElements(current.elements.map((element) => (element.id === next.id ? next : element)));
  }

  function addItem(item: ClosetItem) {
    const nextElement: LookbookElement = {
      id: makeId("el"),
      type: "item",
      position: { x: 80 + current.elements.length * 16, y: 220 + current.elements.length * 10 },
      size: { width: 170, height: 220 },
      rotation: current.elements.length % 2 === 0 ? -4 : 5,
      zIndex: current.elements.length + 1,
      locked: false,
      style: {},
      refId: item.id
    };

    setCurrent((prev) => ({
      ...prev,
      sourceItemIds: Array.from(new Set([...prev.sourceItemIds, item.id])),
      elements: normalizeElements([...prev.elements, nextElement]),
      updatedAt: new Date().toISOString()
    }));
    setSelectedElementId(nextElement.id);
  }

  function addText(type: "headline" | "bodyText") {
    const nextElement: LookbookElement = {
      id: makeId("el"),
      type,
      position: { x: 50, y: type === "headline" ? 50 : 140 },
      size: { width: type === "headline" ? 240 : 320, height: type === "headline" ? 100 : 80 },
      rotation: 0,
      zIndex: current.elements.length + 1,
      locked: false,
      style: {
        color: "#5F5E5E",
        fontSize: type === "headline" ? 34 : 16,
        fontFamily: type === "headline" ? "Manrope" : "Work Sans",
        fontWeight: type === "headline" ? 800 : 500
      },
      refId: null,
      text: type === "headline" ? t("lookbook.defaultHeadline") : t("lookbook.defaultBody")
    };

    setElements([...current.elements, nextElement]);
    setSelectedElementId(nextElement.id);
  }

  function addShape() {
    const nextElement: LookbookElement = {
      id: makeId("el"),
      type: "shape",
      position: { x: 340, y: 70 },
      size: { width: 110, height: 110 },
      rotation: 0,
      zIndex: current.elements.length + 1,
      locked: false,
      style: { fill: "#ffffff", opacity: 0.78, borderRadius: 55 },
      refId: null
    };

    setElements([...current.elements, nextElement]);
    setSelectedElementId(nextElement.id);
  }

  function moveSelected(direction: "forward" | "backward") {
    if (!selectedElement) {
      return;
    }

    const sorted = [...current.elements].sort((left, right) => left.zIndex - right.zIndex);
    const index = sorted.findIndex((element) => element.id === selectedElement.id);
    const swapIndex = direction === "forward" ? index + 1 : index - 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) {
      return;
    }

    const next = [...sorted];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setElements(next);
  }

  function removeSelected() {
    if (!selectedElement) {
      return;
    }

    setElements(current.elements.filter((element) => element.id !== selectedElement.id));
    setCurrent((prev) => ({
      ...prev,
      sourceItemIds: prev.sourceItemIds.filter((itemId) =>
        current.elements.some((element) => element.id !== selectedElement.id && element.refId === itemId)
      )
    }));
    setSelectedElementId(null);
  }

  async function persistCurrent() {
    await saveLookbook({ ...current, updatedAt: new Date().toISOString() });
  }

  function exportCurrent() {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (!uri) {
      return;
    }
    const link = document.createElement("a");
    link.href = uri;
    link.download = `${current.title || t("lookbook.fileName")}.png`;
    link.click();
  }

  return (
    <div className="lookbook-layout">
      <section className="panel-card">
        <div className="toolbar">
          <div>
            <span className="section-tag">{t("lookbook.title")}</span>
            <input
              aria-label={t("lookbook.title")}
              className="title-input"
              value={current.title}
              onChange={(event) => setCurrent((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div className="button-row">
            <button className="secondary-button" onClick={() => addText("headline")}>
              {t("lookbook.addHeadline")}
            </button>
            <button className="secondary-button" onClick={() => addText("bodyText")}>
              {t("lookbook.addNote")}
            </button>
            <button className="secondary-button" onClick={addShape}>
              {t("lookbook.addShape")}
            </button>
          </div>
        </div>

        <div className="lookbook-controls">
          <div className="chip-row">
            {Object.keys(backgroundMap).map((key) => (
              <button
                key={key}
                className={`chip ${current.backgroundStyle === key ? "is-active" : ""}`}
                onClick={() => setCurrent((prev) => ({ ...prev, backgroundStyle: key as Lookbook["backgroundStyle"] }))}
              >
                {t(
                  `lookbook.background${key.charAt(0).toUpperCase()}${key.slice(1)}` as
                    | "lookbook.backgroundPaper"
                    | "lookbook.backgroundMist"
                    | "lookbook.backgroundSand"
                    | "lookbook.backgroundOlive"
                )}
              </button>
            ))}
          </div>
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() => {
                const next = createBlankLookbook(untitledTitle, t("lookbook.defaultHeadline"), t("lookbook.defaultBody"));
                setCurrent(next);
                setSelectedElementId(next.elements[0]?.id ?? null);
              }}
            >
              {t("lookbook.newBoard")}
            </button>
            <button className="secondary-button" onClick={() => void persistCurrent()}>
              {t("lookbook.save")}
            </button>
            <button className="primary-button" onClick={exportCurrent}>
              {t("lookbook.export")}
            </button>
          </div>
        </div>

        <div className="lookbook-canvas-shell">
          <Stage width={current.canvasSize.width} height={current.canvasSize.height} ref={stageRef}>
            <Layer>
              <Rect
                x={0}
                y={0}
                width={current.canvasSize.width}
                height={current.canvasSize.height}
                fill={backgroundMap[current.backgroundStyle]}
                cornerRadius={24}
              />
              {[...current.elements]
                .sort((left, right) => left.zIndex - right.zIndex)
                .map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    item={items.find((item) => item.id === element.refId)}
                    selected={element.id === selectedElementId}
                    onSelect={() => setSelectedElementId(element.id)}
                    onChange={upsertElement}
                  />
                ))}
            </Layer>
          </Stage>
        </div>
      </section>

      <aside className="lookbook-sidebar">
        <DisclosureSection
          screenId="lookbook"
          sectionId="lookbook-inspector"
          title={t("lookbook.inspector")}
          summary={selectedElement ? elementLabel(selectedElement) : t("lookbook.selectElement")}
          defaultOpen
          mobileBehavior="sheet"
        >
          {selectedElement ? (
            <div className="inspector-grid">
              {(selectedElement.type === "headline" || selectedElement.type === "bodyText") && (
                <label className="full-width">
                  <span>{t("lookbook.text")}</span>
                  <textarea
                    aria-label={t("lookbook.text")}
                    className="text-area"
                    rows={3}
                    value={selectedElement.text ?? ""}
                    onChange={(event) => upsertElement({ ...selectedElement, text: event.target.value })}
                  />
                </label>
              )}
              <div className="inspector-actions full-width">
                <button className="secondary-button" onClick={() => moveSelected("backward")}>
                  {t("lookbook.backward")}
                </button>
                <button className="secondary-button" onClick={() => moveSelected("forward")}>
                  {t("lookbook.forward")}
                </button>
                <button
                  className="secondary-button"
                  onClick={() => upsertElement({ ...selectedElement, locked: !selectedElement.locked })}
                >
                  {selectedElement.locked ? t("lookbook.unlock") : t("lookbook.lock")}
                </button>
                <button className="primary-button" onClick={removeSelected}>
                  {t("lookbook.delete")}
                </button>
              </div>
              <DisclosureSection
                screenId="lookbook"
                sectionId="lookbook-transform"
                title={t("lookbook.transform")}
                summary={`z${selectedElement.zIndex}`}
                defaultOpen={false}
                mobileBehavior="inline"
                variant="soft"
                className="full-width"
              >
                <div className="form-grid">
                  <label>
                    <span>{t("lookbook.width")}</span>
                    <input
                      aria-label={t("lookbook.width")}
                      className="text-input"
                      type="number"
                      value={selectedElement.size.width}
                      onChange={(event) =>
                        upsertElement({
                          ...selectedElement,
                          size: { ...selectedElement.size, width: Number(event.target.value) || 0 }
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>{t("lookbook.height")}</span>
                    <input
                      aria-label={t("lookbook.height")}
                      className="text-input"
                      type="number"
                      value={selectedElement.size.height}
                      onChange={(event) =>
                        upsertElement({
                          ...selectedElement,
                          size: { ...selectedElement.size, height: Number(event.target.value) || 0 }
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>{t("lookbook.rotation")}</span>
                    <input
                      aria-label={t("lookbook.rotation")}
                      className="text-input"
                      type="number"
                      value={selectedElement.rotation}
                      onChange={(event) =>
                        upsertElement({ ...selectedElement, rotation: Number(event.target.value) || 0 })
                      }
                    />
                  </label>
                  <label>
                    <span>{t("lookbook.layer")}</span>
                    <input
                      aria-label={t("lookbook.layer")}
                      className="text-input"
                      type="number"
                      value={selectedElement.zIndex}
                      onChange={(event) =>
                        upsertElement({ ...selectedElement, zIndex: Number(event.target.value) || 0 })
                      }
                    />
                  </label>
                </div>
              </DisclosureSection>
            </div>
          ) : (
            <p className="muted-copy">{t("lookbook.selectElement")}</p>
          )}
        </DisclosureSection>

        <DisclosureSection
          screenId="lookbook"
          sectionId="lookbook-drawer"
          title={t("lookbook.drawer")}
          summary={items.length}
          mobileBehavior="sheet"
        >
          <div className="closet-drawer-grid">
            {items.map((item) => (
              <button key={item.id} className="drawer-card" onClick={() => addItem(item)}>
                <ItemPreview item={item} />
              </button>
            ))}
          </div>
        </DisclosureSection>

        <DisclosureSection
          screenId="lookbook"
          sectionId="lookbook-saved"
          title={t("lookbook.savedBoards")}
          summary={lookbooks.length}
          mobileBehavior="sheet"
        >
          <div className="saved-lookbook-list">
            {lookbooks.length === 0 ? <p className="muted-copy">{t("lookbook.noBoards")}</p> : null}
            {lookbooks.map((lookbook) => (
              <button key={lookbook.id} className="saved-lookbook-item" onClick={() => setCurrent(lookbook)}>
                <strong>{lookbook.title}</strong>
                <span>{lookbook.description || lookbook.backgroundStyle}</span>
              </button>
            ))}
          </div>
        </DisclosureSection>

        <DisclosureSection
          screenId="lookbook"
          sectionId="lookbook-layers"
          title={t("lookbook.layers")}
          summary={current.elements.length}
          mobileBehavior="sheet"
        >
          <div className="saved-lookbook-list">
            {[...current.elements]
              .sort((left, right) => left.zIndex - right.zIndex)
              .map((element) => (
                <button
                  key={element.id}
                  className={`saved-lookbook-item ${element.id === selectedElementId ? "is-selected" : ""}`}
                  onClick={() => setSelectedElementId(element.id)}
                >
                  <strong>{elementLabel(element)}</strong>
                  <span>{`${element.type} · z${element.zIndex}`}</span>
                </button>
              ))}
          </div>
        </DisclosureSection>
      </aside>
    </div>
  );
}

function ItemPreview({ item }: { item: ClosetItem }) {
  return (
    <>
      <div className="drawer-thumb">
        <ItemImage imageRef={item.heroImage} alt={item.name} className="cover-image" />
      </div>
      <div className="drawer-meta">
        <strong>{item.name}</strong>
        <span>{item.category}</span>
      </div>
    </>
  );
}

function CanvasElement({
  element,
  item,
  selected,
  onSelect,
  onChange
}: {
  element: LookbookElement;
  item?: ClosetItem;
  selected: boolean;
  onSelect: () => void;
  onChange: (element: LookbookElement) => void;
}) {
  const draggable = !element.locked;

  if (element.type === "shape") {
    return (
      <Rect
        x={element.position.x}
        y={element.position.y}
        width={element.size.width}
        height={element.size.height}
        fill={element.style.fill ?? "#ffffff"}
        opacity={element.style.opacity ?? 0.8}
        cornerRadius={element.style.borderRadius ?? 0}
        rotation={element.rotation}
        stroke={selected ? "#5F5E5E" : undefined}
        strokeWidth={selected ? 2 : 0}
        draggable={draggable}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) =>
          onChange({
            ...element,
            position: { x: event.target.x(), y: event.target.y() }
          })
        }
      />
    );
  }

  if (element.type === "headline" || element.type === "bodyText") {
    return (
      <KonvaText
        x={element.position.x}
        y={element.position.y}
        width={element.size.width}
        height={element.size.height}
        rotation={element.rotation}
        text={element.text ?? ""}
        fill={element.style.color ?? "#5F5E5E"}
        fontSize={element.style.fontSize ?? 16}
        fontFamily={element.style.fontFamily ?? "Work Sans"}
        fontStyle={element.style.fontWeight === 800 ? "bold" : "normal"}
        draggable={draggable}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) =>
          onChange({
            ...element,
            position: { x: event.target.x(), y: event.target.y() }
          })
        }
      />
    );
  }

  return (
    <CanvasItemImage
      element={element}
      item={item}
      selected={selected}
      draggable={draggable}
      onSelect={onSelect}
      onChange={onChange}
    />
  );
}

function CanvasItemImage({
  element,
  item,
  selected,
  draggable,
  onSelect,
  onChange
}: {
  element: LookbookElement;
  item?: ClosetItem;
  selected: boolean;
  draggable: boolean;
  onSelect: () => void;
  onChange: (element: LookbookElement) => void;
}) {
  const source = useStoredImageSource(item?.heroImage ?? null);
  const [image] = useImage(source ?? "");

  return (
    <>
      <Rect
        x={element.position.x}
        y={element.position.y}
        width={element.size.width}
        height={element.size.height}
        fill="#ffffff"
        cornerRadius={16}
        shadowBlur={20}
        shadowOpacity={0.08}
      />
      {image ? (
        <KonvaImage
          image={image}
          x={element.position.x}
          y={element.position.y}
          width={element.size.width}
          height={element.size.height}
          rotation={element.rotation}
          cornerRadius={16}
          draggable={draggable}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={(event) =>
            onChange({
              ...element,
              position: { x: event.target.x(), y: event.target.y() }
            })
          }
        />
      ) : null}
      {selected ? (
        <Rect
          x={element.position.x}
          y={element.position.y}
          width={element.size.width}
          height={element.size.height}
          stroke="#5F5E5E"
          strokeWidth={2}
          cornerRadius={16}
        />
      ) : null}
    </>
  );
}
