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
  }
];
