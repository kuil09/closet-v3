import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { atelierDb } from "../../lib/db/app-db";
import { saveClosetItem, saveStoredImage } from "../../lib/db/repository";
import type { ClosetItem, MetaAssetType, TemperatureBand, WeatherCondition } from "../../lib/db/types";
import { useI18n } from "../../lib/i18n/i18n";
import { ingestImage, useStoredImageSource } from "../../lib/media/images";
import { temperatureBandLabel } from "../../lib/utils/format";
import { makeId } from "../../lib/utils/id";
import { DisclosureSection } from "../shared/DisclosureSection";
import { InfoHint } from "../shared/InfoHint";
import { ItemImage } from "../shared/ItemImage";

const categories = ["Outerwear", "Tops", "Bottoms", "Shoes", "Accessories"];
const temperatureOptions: TemperatureBand[] = ["freezing", "cold", "mild", "warm", "hot"];
const weatherOptions: WeatherCondition[] = ["clear", "cloudy", "rain", "snow", "wind"];
const metaAssetTypes: MetaAssetType[] = ["care", "price_tag", "receipt", "extra"];

interface DraftState {
  id: string | null;
  name: string;
  category: string;
  materials: string;
  purchaseDate: string;
  price: string;
  currency: string;
  storageLocation: string;
  paletteColors: string[];
  occasionTags: string;
  styleNotes: string;
  temperatureBand: TemperatureBand[];
  weatherTags: WeatherCondition[];
  heroImage: string | null;
  heroFile: File | null;
  metaFiles: Array<{ id: string; file: File; type: MetaAssetType }>;
  existingMetaAssets: ClosetItem["metaAssets"];
}

function createEmptyDraft(): DraftState {
  return {
    id: null,
    name: "",
    category: "Outerwear",
    materials: "",
    purchaseDate: "",
    price: "",
    currency: "USD",
    storageLocation: "",
    paletteColors: [],
    occasionTags: "",
    styleNotes: "",
    temperatureBand: [],
    weatherTags: [],
    heroImage: null,
    heroFile: null,
    metaFiles: [],
    existingMetaAssets: []
  };
}

function fromItem(item: ClosetItem): DraftState {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    materials: item.materials.join(", "),
    purchaseDate: item.purchaseDate ?? "",
    price: item.price?.toString() ?? "",
    currency: item.currency,
    storageLocation: item.storageLocation,
    paletteColors: item.paletteColors,
    occasionTags: item.occasionTags.join(", "),
    styleNotes: item.styleNotes,
    temperatureBand: item.temperatureBand,
    weatherTags: item.weatherTags,
    heroImage: item.heroImage,
    heroFile: null,
    metaFiles: [],
    existingMetaAssets: item.metaAssets
  };
}

function splitCommaList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function channelToHex(value: number) {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function sampleImageColor(image: HTMLImageElement, clientX: number, clientY: number) {
  const bounds = image.getBoundingClientRect();
  if (bounds.width === 0 || bounds.height === 0 || image.naturalWidth === 0 || image.naturalHeight === 0) {
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

  const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(((clientX - bounds.left) / bounds.width) * canvas.width)));
  const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(((clientY - bounds.top) / bounds.height) * canvas.height)));
  const [red, green, blue, alpha] = context.getImageData(x, y, 1, 1).data;

  if (alpha === 0) {
    return null;
  }

  return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`;
}

function temperatureMessageKey(band: TemperatureBand) {
  switch (band) {
    case "freezing":
      return "register.tempFreezing" as const;
    case "cold":
      return "register.tempCold" as const;
    case "mild":
      return "register.tempMild" as const;
    case "warm":
      return "register.tempWarm" as const;
    case "hot":
      return "register.tempHot" as const;
  }
}

function weatherIcon(condition: WeatherCondition) {
  switch (condition) {
    case "clear":
      return "☀";
    case "cloudy":
      return "☁";
    case "rain":
      return "☂";
    case "snow":
      return "❄";
    case "wind":
      return "〰";
  }
}

export function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const itemId = params.get("item");
  const editingItem = useLiveQuery(() => (itemId ? atelierDb.items.get(itemId) : undefined), [itemId]);
  const [draft, setDraft] = useState<DraftState>(createEmptyDraft());
  const [pendingMetaType, setPendingMetaType] = useState<MetaAssetType>("extra");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSamplingPaletteColor, setIsSamplingPaletteColor] = useState(false);
  const heroImageElementRef = useRef<HTMLImageElement | null>(null);
  const previewUrl = useMemo(() => (draft.heroFile ? URL.createObjectURL(draft.heroFile) : null), [draft.heroFile]);
  const storedUrl = useStoredImageSource(draft.heroImage);

  useEffect(() => {
    if (editingItem) {
      setDraft(fromItem(editingItem));
    } else if (!itemId) {
      setDraft(createEmptyDraft());
    }
  }, [editingItem, itemId]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const heroImageRef = previewUrl ?? storedUrl ?? draft.heroImage;
  const selectedTemperature = draft.temperatureBand[0] ?? null;
  const selectedTemperatureIndex = selectedTemperature ? Math.max(0, temperatureOptions.indexOf(selectedTemperature)) : 2;
  const draftTitle = useMemo(
    () => (draft.id ? `${t("register.editingTitle")} ${draft.name || t("register.title")}` : t("register.captureTitle")),
    [draft.id, draft.name, t]
  );
  const styleSummary = useMemo(
    () => splitCommaList(draft.occasionTags)[0] || draft.styleNotes.trim().slice(0, 24) || "—",
    [draft.occasionTags, draft.styleNotes]
  );
  const weatherSummary = useMemo(
    () =>
      [
        ...(selectedTemperature ? [t(temperatureMessageKey(selectedTemperature))] : []),
        ...draft.weatherTags.map((tag) => `${weatherIcon(tag)} ${tag}`)
      ]
        .slice(0, 3)
        .join(" · ") || t("register.unset"),
    [draft.weatherTags, selectedTemperature, t]
  );
  const paletteSummary = useMemo(() => draft.paletteColors.slice(0, 2).join(" · ") || t("register.unset"), [draft.paletteColors, t]);
  const metaSummary = useMemo(() => {
    const count = draft.existingMetaAssets.length + draft.metaFiles.length;
    return count > 0 ? count : "—";
  }, [draft.existingMetaAssets.length, draft.metaFiles.length]);

  function setPaletteColor(index: number, color: string) {
    setDraft((current) => ({
      ...current,
      paletteColors: current.paletteColors.map((entry, entryIndex) => (entryIndex === index ? color : entry))
    }));
  }

  function handleHeroFileChange(file: File | null | undefined) {
    if (!file) {
      return;
    }

    setIsSamplingPaletteColor(false);
    setDraft((current) => ({ ...current, heroFile: file }));
  }

  function handleImagePaletteSample(event: MouseEvent<HTMLImageElement>) {
    if (!isSamplingPaletteColor || !heroImageElementRef.current) {
      return;
    }

    const sampledColor = sampleImageColor(heroImageElementRef.current, event.clientX, event.clientY);
    if (!sampledColor) {
      setIsSamplingPaletteColor(false);
      return;
    }

    setDraft((current) => ({
      ...current,
      paletteColors: current.paletteColors.includes(sampledColor)
        ? current.paletteColors
        : [...current.paletteColors, sampledColor]
    }));
    setIsSamplingPaletteColor(false);
  }

  function setSelectedTemperature(index: number) {
    const next = temperatureOptions[Math.max(0, Math.min(temperatureOptions.length - 1, index))];
    setDraft((current) => ({
      ...current,
      temperatureBand: [next]
    }));
  }

  async function persist(status: ClosetItem["status"]) {
    if (status === "saved" && !draft.name.trim()) {
      setValidationError(t("register.validationName"));
      return;
    }

    setValidationError(null);

    let heroImage = draft.heroImage;
    if (draft.heroFile) {
      const stored = await ingestImage(draft.heroFile);
      heroImage = await saveStoredImage(stored);
    }

    const metaAssets = [...draft.existingMetaAssets];
    for (const asset of draft.metaFiles) {
      const stored = await ingestImage(asset.file);
      const imageId = await saveStoredImage(stored);
      metaAssets.push({
        id: makeId("asset"),
        itemId: draft.id ?? "pending",
        type: asset.type,
        imageId,
        label: asset.file.name,
        createdAt: new Date().toISOString()
      });
    }

    const itemIdToSave = draft.id ?? makeId("item");
    await saveClosetItem({
      id: itemIdToSave,
      status,
      name: draft.name.trim() || "Untitled piece",
      category: draft.category,
      materials: splitCommaList(draft.materials),
      heroImage,
      galleryImageIds: [],
      paletteColors: draft.paletteColors.filter(Boolean),
      purchaseDate: draft.purchaseDate || null,
      price: draft.price ? Number(draft.price) : null,
      currency: draft.currency,
      storageLocation: draft.storageLocation.trim(),
      temperatureBand: draft.temperatureBand,
      weatherTags: draft.weatherTags,
      occasionTags: splitCommaList(draft.occasionTags),
      usageFrequency: editingItem?.usageFrequency ?? "regularly",
      favorite: editingItem?.favorite ?? false,
      styleNotes: draft.styleNotes.trim(),
      metaAssets: metaAssets.map((asset) => ({ ...asset, itemId: itemIdToSave })),
      createdAt: editingItem?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastWornAt: editingItem?.lastWornAt ?? null
    });

    navigate("/wardrobe");
  }

  return (
    <div className="register-layout">
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <span className="section-tag">{t("register.title")}</span>
            <h2>{draftTitle}</h2>
          </div>
        </div>

        {validationError ? (
          <div className="inline-error">
            <span>{validationError}</span>
            <button className="mini-button" onClick={() => setValidationError(null)}>
              {t("register.clearError")}
            </button>
          </div>
        ) : null}

        <div className="register-primary-grid">
          <div className="image-dropzone">
            {heroImageRef ? (
              <div className={`image-dropzone-action ${isSamplingPaletteColor ? "is-sampling" : ""}`.trim()}>
                <ItemImage
                  imageRef={heroImageRef}
                  alt={draft.name || t("register.heroImage")}
                  className="cover-image"
                  imgRef={heroImageElementRef}
                  onImageClick={handleImagePaletteSample}
                />
              </div>
            ) : (
              <label className="image-dropzone-action">
                <div className="dropzone-copy">
                  <div className="label-with-hint label-with-hint-centered">
                    <strong>{t("register.heroImage")}</strong>
                    <InfoHint label={t("register.heroImage")} content={t("register.heroBody")} align="left" />
                  </div>
                </div>
                <input
                  aria-label={t("register.heroImage")}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => handleHeroFileChange(event.target.files?.[0])}
                />
              </label>
            )}

            <div className="button-row image-dropzone-controls">
              <label className="secondary-button">
                {heroImageRef ? t("register.replaceImage") : t("register.heroImage")}
                <input
                  aria-label={t("register.replaceImage")}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => handleHeroFileChange(event.target.files?.[0])}
                />
              </label>
              <button
                className="secondary-button"
                disabled={!heroImageRef}
                onClick={() => {
                  setIsSamplingPaletteColor(false);
                  setDraft((current) => ({
                    ...current,
                    heroFile: null,
                    heroImage: null
                  }));
                }}
              >
                {t("register.removeImage")}
              </button>
            </div>
          </div>

          <div className="section-stack">
            <div className="subtle-card">
              <span className="section-tag">{t("register.primaryTitle")}</span>
              <div className="form-grid">
                <label>
                  <span>{t("register.name")}</span>
                  <input
                    aria-label={t("register.name")}
                    className="text-input"
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  />
                </label>
                <label>
                  <span>{t("register.category")}</span>
                  <select
                    aria-label={t("register.category")}
                    className="control-select"
                    value={draft.category}
                    onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                  >
                    {categories.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{t("register.materials")}</span>
                  <input
                    aria-label={t("register.materials")}
                    className="text-input"
                    value={draft.materials}
                    onChange={(event) => setDraft((current) => ({ ...current, materials: event.target.value }))}
                  />
                </label>
                <label>
                  <span>{t("register.storageLocation")}</span>
                  <input
                    aria-label={t("register.storageLocation")}
                    className="text-input"
                    value={draft.storageLocation}
                    onChange={(event) => setDraft((current) => ({ ...current, storageLocation: event.target.value }))}
                  />
                </label>
              </div>
            </div>

            <div className="button-row">
              <button className="secondary-button" onClick={() => void persist("draft")}>
                {t("register.saveDraft")}
              </button>
              <button className="primary-button" onClick={() => void persist("saved")}>
                {t("register.saveItem")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className="register-sidebar">
        <DisclosureSection
          screenId="register"
          sectionId="register-style"
          title={t("register.styleSection")}
          summary={styleSummary}
        >
          <div className="form-grid">
            <label className="full-width">
              <span>{t("register.occasionTags")}</span>
              <input
                aria-label={t("register.occasionTags")}
                className="text-input"
                placeholder="Summer, Daily, Workwear"
                value={draft.occasionTags}
                onChange={(event) => setDraft((current) => ({ ...current, occasionTags: event.target.value }))}
              />
            </label>
            <label className="full-width">
              <span>{t("register.styleNotes")}</span>
              <textarea
                aria-label={t("register.styleNotes")}
                className="text-area"
                rows={4}
                value={draft.styleNotes}
                onChange={(event) => setDraft((current) => ({ ...current, styleNotes: event.target.value }))}
              />
            </label>
          </div>
        </DisclosureSection>

        <DisclosureSection
          screenId="register"
          sectionId="register-weather"
          title={t("register.weatherSection")}
          summary={weatherSummary}
        >
          <div className="selector-group">
            <div>
              <span className="section-tag">{t("register.temperature")}</span>
              <div className="temperature-slider-group">
                <div className="temperature-slider-meta">
                  <strong>{selectedTemperature ? t(temperatureMessageKey(selectedTemperature)) : t("register.unset")}</strong>
                  <span>{selectedTemperature ? temperatureBandLabel(selectedTemperature) : "—"}</span>
                </div>
                <input
                  aria-label={t("register.temperature")}
                  className="temperature-slider"
                  type="range"
                  min={0}
                  max={temperatureOptions.length - 1}
                  step={1}
                  value={selectedTemperatureIndex}
                  onChange={(event) => setSelectedTemperature(Number(event.target.value))}
                />
                <div className="temperature-slider-scale">
                  {temperatureOptions.map((option, index) => {
                    const active = selectedTemperature === option;
                    return (
                      <button
                        key={option}
                        className={`temperature-stop ${active ? "is-active" : ""}`}
                        onClick={() => setSelectedTemperature(index)}
                      >
                        {t(temperatureMessageKey(option))}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <span className="section-tag">{t("register.weather")}</span>
              <div className="chip-row">
                {weatherOptions.map((option) => {
                  const active = draft.weatherTags.includes(option);
                  return (
                    <button
                      key={option}
                      className={`chip ${active ? "is-active" : ""}`}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          weatherTags: active
                            ? current.weatherTags.filter((entry) => entry !== option)
                            : [...current.weatherTags, option]
                        }))
                      }
                    >
                      <span aria-hidden="true">{weatherIcon(option)}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DisclosureSection>

        <DisclosureSection
          screenId="register"
          sectionId="register-palette"
          title={t("register.paletteSection")}
          summary={paletteSummary}
        >
          <div className="palette-row">
            {draft.paletteColors.map((color, index) => (
              <div key={`${color}-${index}`} className="palette-editor">
                <button className="palette-dot" style={{ backgroundColor: color }} aria-label={color} />
                <input
                  aria-label={`${t("register.palette")} ${index + 1}`}
                  type="color"
                  value={color}
                  onChange={(event) => setPaletteColor(index, event.target.value)}
                />
                <button
                  className="mini-button"
                  disabled={draft.paletteColors.length <= 1}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      paletteColors: current.paletteColors.filter((_, entryIndex) => entryIndex !== index)
                    }))
                  }
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="palette-adder"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  paletteColors: [...current.paletteColors, "#808080"]
                }))
              }
            >
              {t("register.addColor")}
            </button>
            <button
              className="palette-adder"
              disabled={!heroImageRef}
              onClick={() =>
                setIsSamplingPaletteColor((current) => (heroImageRef ? !current : current))
              }
            >
              {t("register.pickFromImage")}
            </button>
            <InfoHint
              label={t("register.pickFromImage")}
              content={t("register.pickFromImageActive")}
              className="palette-hint"
            />
          </div>
        </DisclosureSection>

        <DisclosureSection
          screenId="register"
          sectionId="register-meta"
          title={t("register.metaSection")}
          summary={metaSummary}
        >
          <div className="detail-stack">
            <div className="meta-upload-row">
              <select
                aria-label={t("register.metaAssetType")}
                className="control-select"
                value={pendingMetaType}
                onChange={(event) => setPendingMetaType(event.target.value as MetaAssetType)}
              >
                {metaAssetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <label className="secondary-button">
                {t("register.addMetaImage")}
                <input
                  aria-label={t("register.addMetaImage")}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    setDraft((current) => ({
                      ...current,
                      metaFiles: [...current.metaFiles, { id: makeId("meta"), file, type: pendingMetaType }]
                    }));
                  }}
                />
              </label>
            </div>

            <ul className="meta-list">
              {draft.existingMetaAssets.map((asset) => (
                <li key={asset.id}>
                  <span>{`${asset.type} · ${asset.label}`}</span>
                  <button
                    className="mini-button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        existingMetaAssets: current.existingMetaAssets.filter((entry) => entry.id !== asset.id)
                      }))
                    }
                  >
                    {t("register.removeAsset")}
                  </button>
                </li>
              ))}
              {draft.metaFiles.map((asset) => (
                <li key={asset.id}>
                  <span>{`${asset.type} · ${asset.file.name}`}</span>
                  <button
                    className="mini-button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        metaFiles: current.metaFiles.filter((entry) => entry.id !== asset.id)
                      }))
                    }
                  >
                    {t("register.removeAsset")}
                  </button>
                </li>
              ))}
              {draft.existingMetaAssets.length === 0 && draft.metaFiles.length === 0 ? (
                <li>{t("register.noMetaAssets")}</li>
              ) : null}
            </ul>
          </div>
        </DisclosureSection>

      </aside>
    </div>
  );
}
