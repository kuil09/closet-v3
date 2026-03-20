import type { ClosetItem } from "./types";

const now = new Date().toISOString();

function makeMetaAssetSvg(title: string, subtitle: string, accent: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
      <rect width="480" height="320" rx="28" fill="#F6F3EE" />
      <rect x="26" y="26" width="428" height="268" rx="22" fill="white" stroke="#D7D0C6" />
      <rect x="54" y="58" width="120" height="18" rx="9" fill="${accent}" opacity="0.86" />
      <rect x="54" y="96" width="220" height="12" rx="6" fill="#D9D4CC" />
      <rect x="54" y="118" width="184" height="12" rx="6" fill="#E5E0D8" />
      <rect x="54" y="170" width="372" height="74" rx="18" fill="#FAF8F4" stroke="#E2DCD3" stroke-dasharray="6 6" />
      <text x="54" y="146" fill="#2D3432" font-family="Arial, sans-serif" font-size="30" font-weight="700">${title}</text>
      <text x="54" y="271" fill="#6B716F" font-family="Arial, sans-serif" font-size="22">${subtitle}</text>
    </svg>
  `)}`;
}

function makeAccessoryHeroSvg(title: string, accent: string, silhouette: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F8F5EF" />
          <stop offset="100%" stop-color="#EEE7DC" />
        </linearGradient>
      </defs>
      <rect width="720" height="960" rx="48" fill="url(#bg)" />
      <rect x="44" y="44" width="632" height="872" rx="36" fill="#FCFAF6" stroke="#DDD4C8" />
      <path d="${silhouette}" fill="${accent}" opacity="0.94" />
      <rect x="132" y="746" width="456" height="2" rx="1" fill="#D8D0C5" />
      <text x="360" y="816" text-anchor="middle" fill="#2E3432" font-family="Arial, sans-serif" font-size="34" font-weight="700">${title}</text>
    </svg>
  `)}`;
}

export const seedItems: ClosetItem[] = [
  {
    id: "item_coat",
    status: "saved",
    name: "Over-Sized Cashmere Coat",
    category: "Outerwear",
    materials: ["Cashmere", "Wool"],
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuATCn-khPxvbRb4OHbQYUBvrAkKgB6v4K69d7z3JflIhqdk4qLHHWlDXyEoV7xd0z2QI64xYmYrgU6Vag5rUtqtrXlKN2tj2KeC7U-D329SQX78_Jq0ajuRHIkMGAU5z5o_IXC8PgiSz-ZR4Qv8uPmAH0Xnmf1z3OJPyGlwQIdcZSESZSBqbOSOqUgsYLD-phu5Al4pUa2fIWc3rp8rQMijQyH7F-LjhU4ACr4zXURFbUXJg4GJH9_j2B4eUPEjTqdw2-Hup9EmQpM",
    galleryImageIds: [],
    paletteColors: ["#C3AE8D", "#E7E4DE"],
    purchaseDate: "2024-10-02",
    price: 420,
    currency: "USD",
    storageLocation: "Main Closet",
    temperatureBand: ["cold", "mild"],
    weatherTags: ["clear", "cloudy", "wind"],
    occasionTags: ["workwear", "formal", "city"],
    usageFrequency: "often",
    favorite: true,
    styleNotes: "Strong outer layer for sharp editorial silhouettes.",
    metaAssets: [
      {
        id: "asset_coat_care",
        itemId: "item_coat",
        type: "care",
        imageId: makeMetaAssetSvg("Care Label", "Dry clean only · Wool blend", "#B1946B"),
        label: "Care label",
        createdAt: now
      },
      {
        id: "asset_coat_receipt",
        itemId: "item_coat",
        type: "receipt",
        imageId: makeMetaAssetSvg("Store Receipt", "October 2, 2024 · Main Street Atelier", "#8A7B62"),
        label: "Store receipt",
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now,
    lastWornAt: now
  },
  {
    id: "item_shirt",
    status: "saved",
    name: "Essential Linen Shirt",
    category: "Tops",
    materials: ["Linen"],
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBP6V1-Jf7AGvr1SLQHHwmxF_ks83aXjxUbplx7odRfz4rJBpoaqyJwesqkw13AX8twqWlsv4JPzUYXL1hwh1ozc7okA2fjqb-E4UUeGaFw3ckBknSeKrmUwO2-aV3c746Y_eoXAj8MFSglUVD_o-cqEs4YxS46YvswO0-UbgzruCVUitNVamGtwO6WwQNV3rTR-HfhdnJzgytqfGGwtwssFbGxvwuWHofYSxjHTlQRbNIqic-WmpmfcHKPPZp9b3hJaCNSeafzaP8",
    galleryImageIds: [],
    paletteColors: ["#F4F2ED", "#D6D0C7"],
    purchaseDate: "2024-05-18",
    price: 98,
    currency: "USD",
    storageLocation: "Rail A",
    temperatureBand: ["mild", "warm"],
    weatherTags: ["clear", "cloudy"],
    occasionTags: ["daily", "summer", "minimal"],
    usageFrequency: "regularly",
    favorite: false,
    styleNotes: "Reliable base layer for soft tailoring and weather picks.",
    metaAssets: [
      {
        id: "asset_blazer_swatches",
        itemId: "item_blazer",
        type: "extra",
        imageId: makeMetaAssetSvg("Fabric Swatch", "Charcoal wool suiting", "#4B4D52"),
        label: "Fabric swatch",
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item_denim",
    status: "saved",
    name: "Raw Indigo Denim",
    category: "Bottoms",
    materials: ["Denim"],
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtKPkJqetrodMtMtgRmxXW2EXvIKsf3Cxs1g3UlGmpkQ9_0d3mmnfmUe9pqGgpaZykwojGL01-5gX1evy804kockmDVPbz8tzSL3CDHTwT6xWDeVPUYixD0JYjRtBIlG8Tf_tsPO4hpiMWVROj9UsR9scl3w17iX9lbcGt2fG4lJnO59ZnOo11-oWnJEWEY3AjkyrDmKxNh9Fd1sBo4rxgaFCUv3cU-V03lWJbzv4grgPqQvzlg0Dqsh6tUiC0A2KaWn6JCSZJd34",
    galleryImageIds: [],
    paletteColors: ["#22406A", "#111F2E"],
    purchaseDate: "2023-11-09",
    price: 150,
    currency: "USD",
    storageLocation: "Drawer B",
    temperatureBand: ["cold", "mild", "warm"],
    weatherTags: ["clear", "cloudy", "wind"],
    occasionTags: ["daily", "heritage"],
    usageFrequency: "often",
    favorite: true,
    styleNotes: "Anchors casual and transitional outfits.",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item_boot",
    status: "saved",
    name: "Terra Chelsea Boots",
    category: "Shoes",
    materials: ["Leather"],
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUEVjPMvvcZcJOpzZbQjBw0o2mAFntqpxo4RK3wsEdKoxzpEXVo7EvVKXOgsYoomDLdG-bYusyuFU6to30UT-tu5K5a3e6gBH4SlqNDKa9-zDSwev6WWdlEm0qezWTlNjMZGcfZpcuOwqII5BQ3SAFNURKOlZeSCOnTklTtXjtaD4GHxSsLwCTAmEz6hZEyo8LlqVy0khCwpYB4rs-DTEYI5iGG-cNNKgWae4tfKv879jygzC9qPVMZOUllGvnS-JhsvJ_ojwomEs",
    galleryImageIds: [],
    paletteColors: ["#A96A34", "#3A240C"],
    purchaseDate: "2023-08-16",
    price: 260,
    currency: "USD",
    storageLocation: "Shoe Rack",
    temperatureBand: ["cold", "mild"],
    weatherTags: ["clear", "cloudy", "rain"],
    occasionTags: ["daily", "workwear"],
    usageFrequency: "regularly",
    favorite: false,
    styleNotes: "Grounds the wardrobe with textured warmth.",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item_blazer",
    status: "draft",
    name: "Structured Wool Blazer",
    category: "Outerwear",
    materials: ["Wool"],
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtpEQO6kGybUp50z9NvNZyPfiwufBP1Run9Y-oL3QyIi69MNFSZksIzF5EzuZwKk35iI6Jlz29h0bBOf8OTZTJ7AwSPs4BGmZ-wsCfD6ZIvtQWFlieD5PeTLC2hk06NIHmecVwA-wtxFlWuSFVUVof6MD6xKeyUDBrTMmIFUeDQdKInqmehgmrM_U8lnlTzUm3oLEGZBG_PWSe16TMYVqsiqWhzG1s5m5Yo4tAJLPBE5QVpb6zqZekDslh7ziLzBDATmjFhCPCF4w",
    galleryImageIds: [],
    paletteColors: ["#252628", "#E8E1D7"],
    purchaseDate: null,
    price: null,
    currency: "USD",
    storageLocation: "Fitting Rail",
    temperatureBand: ["mild", "warm"],
    weatherTags: ["clear", "cloudy"],
    occasionTags: ["formal", "evening"],
    usageFrequency: "rarely",
    favorite: false,
    styleNotes: "Draft entry for tailored evening looks.",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item_hat",
    status: "saved",
    name: "Soft Felt Hat",
    category: "Accessories",
    materials: ["Felt", "Wool"],
    heroImage: makeAccessoryHeroSvg(
      "Soft Felt Hat",
      "#5B4636",
      "M164 402c0-97 88-178 196-178s196 81 196 178v20H164zm-64 72h520c24 0 40 20 32 39-18 43-92 74-292 74S86 556 68 513c-8-19 8-39 32-39Z"
    ),
    galleryImageIds: [],
    paletteColors: ["#5B4636", "#C8B9A2"],
    purchaseDate: "2024-09-07",
    price: 78,
    currency: "USD",
    storageLocation: "Accessory Shelf",
    temperatureBand: ["cold", "mild"],
    weatherTags: ["clear", "wind"],
    occasionTags: ["daily", "travel", "fall"],
    usageFrequency: "regularly",
    favorite: false,
    styleNotes: "Adds softness and structure to layered looks.",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item_earrings",
    status: "saved",
    name: "Gold Drop Earrings",
    category: "Accessories",
    materials: ["Gold"],
    heroImage: makeAccessoryHeroSvg(
      "Gold Drop Earrings",
      "#C99A3A",
      "M252 282c0-31 24-56 54-56s54 25 54 56c0 24-15 44-35 52v64c0 24-19 43-43 43s-43-19-43-43v-64c-20-8-35-28-35-52Zm162 0c0-31 24-56 54-56s54 25 54 56c0 24-15 44-35 52v64c0 24-19 43-43 43s-43-19-43-43v-64c-20-8-35-28-35-52Z"
    ),
    galleryImageIds: [],
    paletteColors: ["#C99A3A", "#F0DFC2"],
    purchaseDate: "2024-03-22",
    price: 64,
    currency: "USD",
    storageLocation: "Jewelry Tray",
    temperatureBand: ["mild", "warm", "hot"],
    weatherTags: ["clear", "cloudy"],
    occasionTags: ["evening", "formal", "occasion"],
    usageFrequency: "regularly",
    favorite: true,
    styleNotes: "Warm metallic accent for dressy styling.",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item_necklace",
    status: "saved",
    name: "Pearl Strand Necklace",
    category: "Accessories",
    materials: ["Pearl", "Silver"],
    heroImage: makeAccessoryHeroSvg(
      "Pearl Strand Necklace",
      "#D8D3CC",
      "M184 318c42 118 131 188 176 188s134-70 176-188c-25 17-58 30-94 38-28 50-58 76-82 76s-54-26-82-76c-36-8-69-21-94-38Zm84 86c0 0 26 44 92 44s92-44 92-44"
    ),
    galleryImageIds: [],
    paletteColors: ["#D8D3CC", "#8E8A86"],
    purchaseDate: "2023-12-12",
    price: 110,
    currency: "USD",
    storageLocation: "Jewelry Tray",
    temperatureBand: ["mild", "warm"],
    weatherTags: ["clear", "cloudy"],
    occasionTags: ["formal", "city", "occasion"],
    usageFrequency: "often",
    favorite: false,
    styleNotes: "Classic neckline piece for refined layers.",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item_bracelet",
    status: "saved",
    name: "Silver Chain Bracelet",
    category: "Accessories",
    materials: ["Silver"],
    heroImage: makeAccessoryHeroSvg(
      "Silver Chain Bracelet",
      "#929AA3",
      "M186 390c0-46 38-84 84-84h180c46 0 84 38 84 84s-38 84-84 84H270c-46 0-84-38-84-84Zm58 0c0 14 12 26 26 26h180c14 0 26-12 26-26s-12-26-26-26H270c-14 0-26 12-26 26Z"
    ),
    galleryImageIds: [],
    paletteColors: ["#929AA3", "#DDE2E8"],
    purchaseDate: "2024-06-02",
    price: 52,
    currency: "USD",
    storageLocation: "Jewelry Tray",
    temperatureBand: ["mild", "warm", "hot"],
    weatherTags: ["clear", "cloudy"],
    occasionTags: ["daily", "minimal", "summer"],
    usageFrequency: "regularly",
    favorite: false,
    styleNotes: "Clean metallic detail for everyday looks.",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item_scarf",
    status: "saved",
    name: "Silk Print Scarf",
    category: "Accessories",
    materials: ["Silk"],
    heroImage: makeAccessoryHeroSvg(
      "Silk Print Scarf",
      "#7D5067",
      "M186 250c96 16 184 16 280 0v168c0 98-75 180-140 246-65-66-140-148-140-246V250Zm70 104c29 10 58 15 88 15s59-5 88-15M256 432c25 9 47 13 70 13s45-4 70-13"
    ),
    galleryImageIds: [],
    paletteColors: ["#7D5067", "#E1C9C5", "#D7B24A"],
    purchaseDate: "2024-04-18",
    price: 86,
    currency: "USD",
    storageLocation: "Accessory Drawer",
    temperatureBand: ["mild", "warm"],
    weatherTags: ["clear", "cloudy", "wind"],
    occasionTags: ["travel", "spring", "city"],
    usageFrequency: "often",
    favorite: false,
    styleNotes: "Adds color and motion around the neckline or bag.",
    metaAssets: [],
    createdAt: now,
    updatedAt: now
  }
];
