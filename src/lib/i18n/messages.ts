import type { Locale } from "../db/types";

export type MessageKey =
  | "common.all"
  | "info.open"
  | "info.close"
  | "disclosure.open"
  | "disclosure.close"
  | "disclosure.showMore"
  | "disclosure.showLess"
  | "nav.home"
  | "nav.wardrobe"
  | "nav.register"
  | "nav.settings"
  | "app.title"
  | "app.boot"
  | "app.loadingView"
  | "badge.local"
  | "home.heroTitle"
  | "home.heroBody"
  | "home.heroEyebrow"
  | "home.recommendations"
  | "home.recommendationsTitle"
  | "home.recent"
  | "home.recentTitle"
  | "home.weatherTitle"
  | "home.weatherRefreshing"
  | "home.weatherUnavailable"
  | "home.weatherFallback"
  | "home.recentMore"
  | "home.recentLess"
  | "home.stats.items"
  | "home.stats.favorites"
  | "home.stats.drafts"
  | "home.quickPrimaryContinue"
  | "home.quickPrimaryCapture"
  | "home.quickSecondaryBrowse"
  | "home.heroFootnote"
  | "home.recommendationsEmpty"
  | "home.insightsTitle"
  | "home.insightsBody"
  | "home.insightsCategory"
  | "home.insightsCategoryTitle"
  | "home.insightsCondition"
  | "home.insightsConditionTitle"
  | "home.insightsPalette"
  | "home.insightsPaletteTitle"
  | "home.insightsSeason"
  | "home.insightsWeather"
  | "home.seasonWinter"
  | "home.seasonSpring"
  | "home.seasonSummer"
  | "home.seasonFall"
  | "wardrobe.search"
  | "wardrobe.searchLabel"
  | "wardrobe.empty"
  | "wardrobe.favorites"
  | "wardrobe.showArchived"
  | "wardrobe.sortField"
  | "wardrobe.sortDirection"
  | "wardrobe.sortUpdated"
  | "wardrobe.sortName"
  | "wardrobe.sortColor"
  | "wardrobe.sortAscending"
  | "wardrobe.sortDescending"
  | "wardrobe.favorite"
  | "wardrobe.unfavorite"
  | "wardrobe.archive"
  | "wardrobe.restore"
  | "wardrobe.materialUnknown"
  | "wardrobe.advancedFilters"
  | "wardrobe.edit"
  | "wardrobe.advancedHint"
  | "wardrobe.colorRange"
  | "wardrobe.colorFrom"
  | "wardrobe.colorTo"
  | "wardrobe.colorRangeHint"
  | "wardrobe.colorRangeAll"
  | "wardrobe.title"
  | "wardrobe.body"
  | "wardrobe.addItem"
  | "wardrobe.itemsInView"
  | "weather.clear"
  | "weather.cloudy"
  | "weather.rain"
  | "weather.snow"
  | "weather.wind"
  | "register.title"
  | "register.captureTitle"
  | "register.editingTitle"
  | "register.saveDraft"
  | "register.saveItem"
  | "register.deleteItem"
  | "register.deleteConfirm"
  | "register.heroImage"
  | "register.heroBody"
  | "register.replaceImage"
  | "register.removeImage"
  | "register.palette"
  | "register.addColor"
  | "register.metaAssets"
  | "register.addMetaImage"
  | "register.metaSectionBody"
  | "register.pickFromImage"
  | "register.pickFromImageActive"
  | "register.noMetaAssets"
  | "register.removeAsset"
  | "register.name"
  | "register.category"
  | "register.categoryOuterwear"
  | "register.categoryTops"
  | "register.categoryBottoms"
  | "register.categoryShoes"
  | "register.categoryAccessories"
  | "register.materials"
  | "register.storageLocation"
  | "register.occasionTags"
  | "register.occasionPlaceholder"
  | "register.styleNotes"
  | "register.temperature"
  | "register.tempFreezing"
  | "register.tempCold"
  | "register.tempMild"
  | "register.tempWarm"
  | "register.tempHot"
  | "register.weather"
  | "register.unset"
  | "register.validationName"
  | "register.clearError"
  | "register.primaryTitle"
  | "register.styleSection"
  | "register.weatherSection"
  | "register.paletteSection"
  | "register.metaSection"
  | "register.metaTypeCare"
  | "register.metaTypePriceTag"
  | "register.metaTypeReceipt"
  | "register.metaTypeExtra"
  | "register.untitledPiece"
  | "register.intro"
  | "register.progressTitle"
  | "register.progressBody"
  | "register.progressImage"
  | "register.progressCore"
  | "register.progressStyle"
  | "register.progressWeather"
  | "register.progressMeta"
  | "register.progressReady"
  | "register.progressOptional"
  | "register.progressPending"
  | "settings.title"
  | "settings.productControls"
  | "settings.localOnly"
  | "settings.theme"
  | "settings.language"
  | "settings.units"
  | "settings.themeLight"
  | "settings.themeDark"
  | "settings.unitsC"
  | "settings.unitsF"
  | "settings.resetTitle"
  | "settings.resetBody"
  | "settings.resetAction"
  | "settings.resetConfirm"
  | "settings.resetDone"
  | "settings.sampleAction"
  | "settings.sampleDone"
  | "settings.localDataSection"
  | "settings.localOnlyTitle"
  | "settings.shellControlsSummary"
  | "settings.shellControlsBody"
  | "settings.lookbookTitle"
  | "settings.lookbookSummary"
  | "settings.lookbookBody"
  | "settings.lookbookStepSelect"
  | "settings.lookbookStepCompose"
  | "settings.lookbookStepExport";

type Catalog = Record<MessageKey, string>;

const base: Catalog = {
  "common.all": "All",
  "info.open": "Show help",
  "info.close": "Hide help",
  "disclosure.open": "Open",
  "disclosure.close": "Close",
  "disclosure.showMore": "Show more",
  "disclosure.showLess": "Show less",
  "nav.home": "Home",
  "nav.wardrobe": "My Wardrobe",
  "nav.register": "Register Item",
  "nav.settings": "Settings",
  "app.title": "The Atelier",
  "app.boot": "Building your local wardrobe studio...",
  "app.loadingView": "Loading view...",
  "badge.local": "Local-only storage",
  "home.heroTitle": "Curating your digital closet.",
  "home.heroBody": "A gallery-first wardrobe studio built for private collections.",
  "home.heroEyebrow": "Editorial wardrobe studio",
  "home.recommendations": "Weather Picks",
  "home.recommendationsTitle": "Rule-based weather picks",
  "home.recent": "Recently Added",
  "home.recentTitle": "Fresh additions and drafts",
  "home.weatherTitle": "Live weather",
  "home.weatherRefreshing": "Refreshing conditions...",
  "home.weatherUnavailable": "Weather unavailable",
  "home.weatherFallback": "Automatic weather could not be loaded. Check location permission or network access.",
  "home.recentMore": "Show more pieces",
  "home.recentLess": "Show fewer pieces",
  "home.stats.items": "Total Pieces",
  "home.stats.favorites": "Favorites",
  "home.stats.drafts": "Drafts",
  "home.quickPrimaryContinue": "Continue latest draft",
  "home.quickPrimaryCapture": "Register a new piece",
  "home.quickSecondaryBrowse": "Open wardrobe",
  "home.heroFootnote": "Keep intake moving with drafts first. Weather picks and insights update as you save.",
  "home.recommendationsEmpty": "Save more fit details to unlock stronger rule-based picks.",
  "home.insightsTitle": "Collection patterns",
  "home.insightsBody": "The overview stays nearby, but the next action comes first.",
  "home.insightsCategory": "By category",
  "home.insightsCategoryTitle": "Category breakdown",
  "home.insightsCondition": "Wear conditions",
  "home.insightsConditionTitle": "Season and weather fit",
  "home.insightsPalette": "Palette",
  "home.insightsPaletteTitle": "Color distribution",
  "home.insightsSeason": "Season",
  "home.insightsWeather": "Weather",
  "home.seasonWinter": "Winter",
  "home.seasonSpring": "Spring",
  "home.seasonSummer": "Summer",
  "home.seasonFall": "Fall",
  "wardrobe.search": "Search your collection...",
  "wardrobe.searchLabel": "Search wardrobe",
  "wardrobe.empty": "No pieces match this combination yet.",
  "wardrobe.favorites": "Favorites",
  "wardrobe.showArchived": "Show archived",
  "wardrobe.sortField": "Sort by",
  "wardrobe.sortDirection": "Order",
  "wardrobe.sortUpdated": "Updated",
  "wardrobe.sortName": "Name",
  "wardrobe.sortColor": "Color",
  "wardrobe.sortAscending": "Ascending",
  "wardrobe.sortDescending": "Descending",
  "wardrobe.favorite": "Favorite",
  "wardrobe.unfavorite": "Unfavorite",
  "wardrobe.archive": "Archive",
  "wardrobe.restore": "Restore",
  "wardrobe.materialUnknown": "Unspecified material",
  "wardrobe.advancedFilters": "Advanced filters",
  "wardrobe.edit": "Edit",
  "wardrobe.advancedHint": "Archive and fit filters stay tucked away until you need them.",
  "wardrobe.colorRange": "Palette range",
  "wardrobe.colorFrom": "Darkest color",
  "wardrobe.colorTo": "Lightest color",
  "wardrobe.colorRangeHint": "Use stored garment colors to narrow the wardrobe from darker tones to lighter ones.",
  "wardrobe.colorRangeAll": "All saved colors",
  "wardrobe.title": "Wardrobe studio",
  "wardrobe.body": "Keep browsing fast. Color range stays in view while archive and fit controls stay tucked away.",
  "wardrobe.addItem": "Register piece",
  "wardrobe.itemsInView": "pieces in view",
  "weather.clear": "Clear",
  "weather.cloudy": "Cloudy",
  "weather.rain": "Rain",
  "weather.snow": "Snow",
  "weather.wind": "Wind",
  "register.title": "Register Item",
  "register.captureTitle": "Capture a new piece",
  "register.editingTitle": "Editing",
  "register.saveDraft": "Save draft",
  "register.saveItem": "Save to closet",
  "register.deleteItem": "Delete item",
  "register.deleteConfirm": "Delete this item from your wardrobe?",
  "register.heroImage": "Hero Image",
  "register.heroBody": "Upload a garment image or continue as a draft.",
  "register.replaceImage": "Replace image",
  "register.removeImage": "Remove image",
  "register.palette": "Palette",
  "register.addColor": "Add color",
  "register.metaAssets": "Reference images",
  "register.addMetaImage": "Add reference image",
  "register.metaSectionBody": "Add care labels, price tags, receipts, or any extra detail shots you want to keep with this item.",
  "register.pickFromImage": "Pick from image",
  "register.pickFromImageActive": "Click inside the uploaded image to sample a color.",
  "register.noMetaAssets": "No reference images yet.",
  "register.removeAsset": "Remove asset",
  "register.name": "Name",
  "register.category": "Category",
  "register.categoryOuterwear": "Outerwear",
  "register.categoryTops": "Tops",
  "register.categoryBottoms": "Bottoms",
  "register.categoryShoes": "Shoes",
  "register.categoryAccessories": "Accessories",
  "register.materials": "Materials",
  "register.storageLocation": "Storage location",
  "register.occasionTags": "Occasion / tags",
  "register.occasionPlaceholder": "Summer, Daily, Workwear",
  "register.styleNotes": "Notes",
  "register.temperature": "Temperature",
  "register.tempFreezing": "Freezing",
  "register.tempCold": "Cold",
  "register.tempMild": "Mild",
  "register.tempWarm": "Warm",
  "register.tempHot": "Hot",
  "register.weather": "Weather",
  "register.unset": "Not set",
  "register.validationName": "A saved item needs a name.",
  "register.clearError": "Dismiss validation message",
  "register.primaryTitle": "Core garment details",
  "register.styleSection": "Style information",
  "register.weatherSection": "Weather and temperature fit",
  "register.paletteSection": "Color palette",
  "register.metaSection": "Reference images",
  "register.metaTypeCare": "Care",
  "register.metaTypePriceTag": "Price tag",
  "register.metaTypeReceipt": "Receipt",
  "register.metaTypeExtra": "Extra",
  "register.untitledPiece": "Untitled piece",
  "register.intro": "Start with the photo or skip it. Core details stay in front, and the rest stays tucked into the side rail.",
  "register.progressTitle": "Capture flow",
  "register.progressBody": "Move from core intake to optional notes without losing draft momentum.",
  "register.progressImage": "Hero image",
  "register.progressCore": "Core details",
  "register.progressStyle": "Style notes",
  "register.progressWeather": "Weather fit",
  "register.progressMeta": "References",
  "register.progressReady": "Ready",
  "register.progressOptional": "Optional",
  "register.progressPending": "Needs input",
  "settings.title": "Settings",
  "settings.productControls": "Product controls",
  "settings.localOnly": "All data stays in this browser profile. Cloud sync and backup are intentionally disabled.",
  "settings.theme": "Theme",
  "settings.language": "Language",
  "settings.units": "Units",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.unitsC": "Celsius",
  "settings.unitsF": "Fahrenheit",
  "settings.resetTitle": "Reset local product data",
  "settings.resetBody": "Clears wardrobe items, cached weather, and uploaded images from this device.",
  "settings.resetAction": "Clear local data",
  "settings.resetConfirm": "Clear all wardrobe data stored on this device?",
  "settings.resetDone": "Local wardrobe data cleared.",
  "settings.sampleAction": "Load sample data",
  "settings.sampleDone": "Sample wardrobe data loaded.",
  "settings.localDataSection": "Local data management",
  "settings.localOnlyTitle": "Local-only product rules",
  "settings.shellControlsSummary": "Language, theme, and units live in the header.",
  "settings.shellControlsBody": "Use the top bar for day-to-day viewing defaults. This page stays focused on local storage rules and rare product controls.",
  "settings.lookbookTitle": "Lookbook direction",
  "settings.lookbookSummary": "Select, compose, export locally",
  "settings.lookbookBody": "When lookbook work lands, it should stay narrow and explainable.",
  "settings.lookbookStepSelect": "Select saved pieces from the wardrobe into a temporary board.",
  "settings.lookbookStepCompose": "Arrange them on a simple canvas with notes, order, and spacing controls.",
  "settings.lookbookStepExport": "Export the final board directly on-device without accounts, sync, or background uploads."
};

export const messages: Record<Locale, Catalog> = {
  en: base,
  ko: {
    ...base,
    "common.all": "전체",
    "info.open": "도움말 보기",
    "info.close": "도움말 닫기",
    "disclosure.open": "열기",
    "disclosure.close": "닫기",
    "disclosure.showMore": "더 보기",
    "disclosure.showLess": "접기",
    "nav.home": "홈",
    "nav.wardrobe": "나의 옷장",
    "nav.register": "아이템 등록",
    "nav.settings": "설정",
    "app.boot": "로컬 옷장 스튜디오를 준비하는 중입니다...",
    "app.loadingView": "화면을 불러오는 중입니다...",
    "badge.local": "브라우저 로컬 저장",
    "home.heroTitle": "당신의 디지털 옷장을 큐레이팅합니다.",
    "home.heroBody": "개인 컬렉션을 위한 갤러리 중심 옷장 스튜디오입니다.",
    "home.heroEyebrow": "에디토리얼 옷장 스튜디오",
    "home.recommendations": "날씨 추천",
    "home.recommendationsTitle": "규칙 기반 날씨 추천",
    "home.recent": "최근 추가",
    "home.recentTitle": "최근 추가 및 드래프트",
    "home.weatherTitle": "현재 날씨",
    "home.weatherRefreshing": "날씨를 새로고침하는 중...",
    "home.weatherUnavailable": "날씨 정보를 불러올 수 없습니다",
    "home.weatherFallback": "자동 날씨를 불러오지 못했습니다. 위치 권한이나 네트워크 상태를 확인하세요.",
    "home.recentMore": "아이템 더 보기",
    "home.recentLess": "아이템 접기",
    "home.stats.drafts": "드래프트",
    "home.quickPrimaryContinue": "최근 드래프트 이어서 작업",
    "home.quickPrimaryCapture": "새 아이템 등록",
    "home.quickSecondaryBrowse": "옷장 열기",
    "home.heroFootnote": "먼저 드래프트로 저장하고, 저장이 쌓일수록 날씨 추천과 인사이트가 더 정확해집니다.",
    "home.recommendationsEmpty": "착용 온도와 날씨 정보를 더 저장하면 추천 정확도가 높아집니다.",
    "home.insightsTitle": "컬렉션 패턴",
    "home.insightsBody": "개요는 아래에 남기고, 다음 행동이 먼저 보이도록 정리했습니다.",
    "home.insightsCategory": "카테고리별",
    "home.insightsCategoryTitle": "카테고리 분포",
    "home.insightsCondition": "착용 환경",
    "home.insightsConditionTitle": "계절과 날씨 적합도",
    "home.insightsPalette": "색상",
    "home.insightsPaletteTitle": "색상 분포",
    "home.insightsSeason": "계절",
    "home.insightsWeather": "날씨",
    "home.seasonWinter": "겨울",
    "home.seasonSpring": "봄",
    "home.seasonSummer": "여름",
    "home.seasonFall": "가을",
    "wardrobe.search": "컬렉션 검색...",
    "wardrobe.searchLabel": "옷장 검색",
    "wardrobe.empty": "조건에 맞는 아이템이 없습니다.",
    "wardrobe.favorites": "즐겨찾기",
    "wardrobe.showArchived": "보관 항목 표시",
    "wardrobe.sortField": "정렬 기준",
    "wardrobe.sortDirection": "정렬 방향",
    "wardrobe.sortUpdated": "수정일",
    "wardrobe.sortName": "이름순",
    "wardrobe.sortColor": "색상순",
    "wardrobe.sortAscending": "오름차순",
    "wardrobe.sortDescending": "내림차순",
    "wardrobe.favorite": "즐겨찾기",
    "wardrobe.unfavorite": "즐겨찾기 해제",
    "wardrobe.archive": "보관",
    "wardrobe.restore": "복원",
    "wardrobe.materialUnknown": "소재 미지정",
    "wardrobe.advancedFilters": "고급 필터",
    "wardrobe.edit": "편집",
    "wardrobe.advancedHint": "보관 표시와 착장 적합도 필터는 필요할 때만 펼쳐집니다.",
    "wardrobe.colorRange": "색상 범위",
    "wardrobe.colorFrom": "어두운 쪽 시작",
    "wardrobe.colorTo": "밝은 쪽 끝",
    "wardrobe.colorRangeHint": "저장된 의류 팔레트를 기준으로 어두운 색부터 밝은 색까지 범위를 좁혀보세요.",
    "wardrobe.colorRangeAll": "저장된 전체 색상",
    "wardrobe.title": "옷장 스튜디오",
    "wardrobe.body": "색상 범위는 바로 보이게 두고, 보관 및 착용 적합도 제어는 필요할 때만 펼쳐지도록 유지합니다.",
    "wardrobe.addItem": "아이템 등록",
    "wardrobe.itemsInView": "개 표시 중",
    "weather.clear": "맑음",
    "weather.cloudy": "흐림",
    "weather.rain": "비",
    "weather.snow": "눈",
    "weather.wind": "바람",
    "register.title": "아이템 등록",
    "register.captureTitle": "새 아이템 등록",
    "register.editingTitle": "편집 중",
    "register.saveDraft": "임시 저장",
    "register.saveItem": "옷장에 저장",
    "register.deleteItem": "아이템 삭제",
    "register.deleteConfirm": "이 아이템을 옷장에서 삭제할까요?",
    "register.heroImage": "대표 이미지",
    "register.heroBody": "의류 이미지를 올리거나 드래프트로 계속 진행하세요.",
    "register.replaceImage": "이미지 교체",
    "register.removeImage": "이미지 제거",
    "register.palette": "팔레트",
    "register.addColor": "색상 추가",
    "register.metaAssets": "참고 이미지",
    "register.addMetaImage": "참고 이미지 추가",
    "register.metaSectionBody": "케어 라벨, 가격표, 영수증, 디테일 컷처럼 이 아이템과 함께 보관하고 싶은 이미지를 추가하세요.",
    "register.pickFromImage": "이미지에서 추출",
    "register.pickFromImageActive": "업로드된 이미지 안을 클릭해 색상을 추출하세요.",
    "register.noMetaAssets": "참고 이미지가 아직 없습니다.",
    "register.removeAsset": "자산 제거",
    "register.name": "이름",
    "register.category": "카테고리",
    "register.categoryOuterwear": "아우터",
    "register.categoryTops": "상의",
    "register.categoryBottoms": "하의",
    "register.categoryShoes": "신발",
    "register.categoryAccessories": "액세서리",
    "register.materials": "소재",
    "register.storageLocation": "보관 위치",
    "register.occasionTags": "상황 / 태그",
    "register.occasionPlaceholder": "여름, 데일리, 워크웨어",
    "register.styleNotes": "메모",
    "register.temperature": "온도",
    "register.tempFreezing": "매우 추움",
    "register.tempCold": "추움",
    "register.tempMild": "선선함",
    "register.tempWarm": "따뜻함",
    "register.tempHot": "더움",
    "register.weather": "날씨",
    "register.unset": "미설정",
    "register.validationName": "저장된 아이템에는 이름이 필요합니다.",
    "register.clearError": "검증 메시지 닫기",
    "register.primaryTitle": "핵심 의류 정보",
    "register.styleSection": "스타일 정보",
    "register.weatherSection": "날씨와 온도 적합도",
    "register.paletteSection": "색상 팔레트",
    "register.metaSection": "참고 이미지",
    "register.metaTypeCare": "케어",
    "register.metaTypePriceTag": "가격표",
    "register.metaTypeReceipt": "영수증",
    "register.metaTypeExtra": "추가 자료",
    "register.untitledPiece": "이름 없는 아이템",
    "register.intro": "사진부터 시작해도 되고 건너뛰어도 됩니다. 핵심 정보는 앞에 두고, 나머지는 사이드 레일에 숨겨 둡니다.",
    "register.progressTitle": "등록 흐름",
    "register.progressBody": "핵심 입력부터 선택 메모까지, 드래프트 흐름을 끊지 않고 이어갑니다.",
    "register.progressImage": "대표 이미지",
    "register.progressCore": "핵심 정보",
    "register.progressStyle": "스타일 메모",
    "register.progressWeather": "날씨 적합도",
    "register.progressMeta": "참고 자료",
    "register.progressReady": "준비됨",
    "register.progressOptional": "선택",
    "register.progressPending": "입력 필요",
    "settings.title": "설정",
    "settings.productControls": "제품 설정",
    "settings.localOnly": "모든 데이터는 현재 브라우저 프로필에만 저장됩니다. 클라우드 동기화와 백업은 제공하지 않습니다.",
    "settings.theme": "테마",
    "settings.language": "언어",
    "settings.units": "단위",
    "settings.themeLight": "라이트",
    "settings.themeDark": "다크",
    "settings.unitsC": "섭씨",
    "settings.unitsF": "화씨",
    "settings.resetTitle": "로컬 제품 데이터 초기화",
    "settings.resetBody": "이 기기에 저장된 옷장 아이템, 캐시된 날씨, 업로드 이미지를 삭제합니다.",
    "settings.resetAction": "로컬 데이터 삭제",
    "settings.resetConfirm": "이 기기에 저장된 옷장 데이터를 모두 삭제할까요?",
    "settings.resetDone": "로컬 옷장 데이터를 삭제했습니다.",
    "settings.sampleAction": "샘플 데이터 불러오기",
    "settings.sampleDone": "샘플 옷장 데이터를 불러왔습니다.",
    "settings.localDataSection": "로컬 데이터 관리",
    "settings.localOnlyTitle": "로컬 전용 제품 원칙",
    "settings.shellControlsSummary": "언어, 테마, 단위는 상단 헤더에서 바로 바꿉니다.",
    "settings.shellControlsBody": "일상적인 보기 기본값은 상단 바에서 조정하고, 이 페이지는 로컬 저장 규칙과 드문 제품 제어에 집중합니다.",
    "settings.lookbookTitle": "룩북 방향",
    "settings.lookbookSummary": "선택, 구성, 로컬 내보내기",
    "settings.lookbookBody": "룩북 기능이 들어와도 범위는 좁고 설명 가능해야 합니다.",
    "settings.lookbookStepSelect": "옷장에서 저장된 아이템을 임시 보드로 선택합니다.",
    "settings.lookbookStepCompose": "간단한 캔버스 위에서 순서, 간격, 메모를 조정하며 배치합니다.",
    "settings.lookbookStepExport": "계정, 동기화, 백그라운드 업로드 없이 기기 안에서 바로 결과물을 내보냅니다."
  },
  ja: {
    ...base,
    "nav.home": "ホーム",
    "nav.wardrobe": "ワードローブ",
    "nav.register": "アイテム登録",
    "nav.settings": "設定"
  },
  fr: {
    ...base,
    "nav.home": "Accueil",
    "nav.wardrobe": "Garde-robe",
    "nav.register": "Ajouter",
    "nav.settings": "Paramètres"
  },
  es: {
    ...base,
    "nav.home": "Inicio",
    "nav.wardrobe": "Armario",
    "nav.register": "Registrar",
    "nav.settings": "Ajustes"
  },
  de: {
    ...base,
    "nav.home": "Start",
    "nav.wardrobe": "Garderobe",
    "nav.register": "Erfassen",
    "nav.settings": "Einstellungen"
  },
  "zh-CN": {
    ...base,
    "nav.home": "首页",
    "nav.wardrobe": "衣橱",
    "nav.register": "登记单品",
    "nav.settings": "设置"
  }
};
