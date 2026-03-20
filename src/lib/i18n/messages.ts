import type { Locale } from "../db/types";

export type MessageKey =
  | "disclosure.open"
  | "disclosure.close"
  | "disclosure.showMore"
  | "disclosure.showLess"
  | "nav.home"
  | "nav.wardrobe"
  | "nav.register"
  | "nav.lookbook"
  | "nav.settings"
  | "app.title"
  | "app.boot"
  | "app.loadingView"
  | "badge.local"
  | "home.heroTitle"
  | "home.heroBody"
  | "home.heroEyebrow"
  | "home.todayLook"
  | "home.todayLookEmpty"
  | "home.todayLookEmptyBody"
  | "home.lookbooksMore"
  | "home.lookbooksLess"
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
  | "home.stats.lookbooks"
  | "home.stats.favorites"
  | "wardrobe.title"
  | "wardrobe.search"
  | "wardrobe.searchLabel"
  | "wardrobe.empty"
  | "wardrobe.favorites"
  | "wardrobe.showArchived"
  | "wardrobe.sortNewest"
  | "wardrobe.sortFavorites"
  | "wardrobe.sortName"
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
  | "wardrobe.colorRangeDark"
  | "wardrobe.colorRangeLight"
  | "wardrobe.colorRangeHint"
  | "wardrobe.colorRangeAll"
  | "register.title"
  | "register.captureTitle"
  | "register.editingTitle"
  | "register.saveDraft"
  | "register.saveItem"
  | "register.heroImage"
  | "register.heroBody"
  | "register.replaceImage"
  | "register.removeImage"
  | "register.palette"
  | "register.addColor"
  | "register.metaAssetType"
  | "register.metaAssets"
  | "register.addMetaImage"
  | "register.pickFromImage"
  | "register.pickFromImageActive"
  | "register.noMetaAssets"
  | "register.removeAsset"
  | "register.name"
  | "register.category"
  | "register.materials"
  | "register.storageLocation"
  | "register.occasionTags"
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
  | "lookbook.title"
  | "lookbook.save"
  | "lookbook.export"
  | "lookbook.addHeadline"
  | "lookbook.addNote"
  | "lookbook.addShape"
  | "lookbook.newBoard"
  | "lookbook.inspector"
  | "lookbook.selectElement"
  | "lookbook.width"
  | "lookbook.height"
  | "lookbook.rotation"
  | "lookbook.layer"
  | "lookbook.text"
  | "lookbook.lock"
  | "lookbook.unlock"
  | "lookbook.delete"
  | "lookbook.forward"
  | "lookbook.backward"
  | "lookbook.drawer"
  | "lookbook.drawerTitle"
  | "lookbook.savedBoards"
  | "lookbook.savedBoardsTitle"
  | "lookbook.defaultHeadline"
  | "lookbook.defaultBody"
  | "lookbook.noBoards"
  | "lookbook.untitled"
  | "lookbook.fileName"
  | "lookbook.layers"
  | "lookbook.validationItem"
  | "lookbook.clearError"
  | "lookbook.backgroundPaper"
  | "lookbook.backgroundMist"
  | "lookbook.backgroundSand"
  | "lookbook.backgroundOlive"
  | "lookbook.transform"
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
  | "settings.localDataSection";

type Catalog = Record<MessageKey, string>;

const base: Catalog = {
  "disclosure.open": "Open",
  "disclosure.close": "Close",
  "disclosure.showMore": "Show more",
  "disclosure.showLess": "Show less",
  "nav.home": "Home",
  "nav.wardrobe": "My Wardrobe",
  "nav.register": "Register Item",
  "nav.lookbook": "Lookbook Maker",
  "nav.settings": "Settings",
  "app.title": "The Atelier",
  "app.boot": "Building your local wardrobe studio...",
  "app.loadingView": "Loading view...",
  "badge.local": "Local-only storage",
  "home.heroTitle": "Curating your digital closet.",
  "home.heroBody": "A gallery-first wardrobe studio built for private collections and expressive lookbooks.",
  "home.heroEyebrow": "Editorial wardrobe studio",
  "home.todayLook": "My Lookbooks",
  "home.todayLookEmpty": "No saved lookbook yet",
  "home.todayLookEmptyBody": "Save a composition in Lookbook Maker to see it featured here.",
  "home.lookbooksMore": "Show more lookbooks",
  "home.lookbooksLess": "Show fewer lookbooks",
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
  "home.stats.lookbooks": "Lookbooks",
  "home.stats.favorites": "Favorites",
  "wardrobe.title": "Your Digital Sanctuary",
  "wardrobe.search": "Search your collection...",
  "wardrobe.searchLabel": "Search wardrobe",
  "wardrobe.empty": "No pieces match this combination yet.",
  "wardrobe.favorites": "Favorites",
  "wardrobe.showArchived": "Show archived",
  "wardrobe.sortNewest": "Newest",
  "wardrobe.sortFavorites": "Favorites first",
  "wardrobe.sortName": "Name",
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
  "wardrobe.colorRangeDark": "Black side",
  "wardrobe.colorRangeLight": "White side",
  "wardrobe.colorRangeHint": "Use stored garment colors to narrow the wardrobe from darker tones to lighter ones.",
  "wardrobe.colorRangeAll": "All saved colors",
  "register.title": "Register Item",
  "register.captureTitle": "Capture a new piece",
  "register.editingTitle": "Editing",
  "register.saveDraft": "Save draft",
  "register.saveItem": "Save to closet",
  "register.heroImage": "Hero Image",
  "register.heroBody": "Upload a garment image or continue as a draft.",
  "register.replaceImage": "Replace image",
  "register.removeImage": "Remove image",
  "register.palette": "Palette",
  "register.addColor": "Add color",
  "register.metaAssetType": "Meta asset type",
  "register.metaAssets": "Meta Assets",
  "register.addMetaImage": "Add image",
  "register.pickFromImage": "Pick from image",
  "register.pickFromImageActive": "Click inside the uploaded image to sample a color.",
  "register.noMetaAssets": "No meta assets yet.",
  "register.removeAsset": "Remove asset",
  "register.name": "Name",
  "register.category": "Category",
  "register.materials": "Materials",
  "register.storageLocation": "Storage location",
  "register.occasionTags": "Occasion / tags",
  "register.styleNotes": "Style notes",
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
  "register.metaSection": "Meta assets",
  "lookbook.title": "Lookbook Maker",
  "lookbook.save": "Save lookbook",
  "lookbook.export": "Export PNG",
  "lookbook.addHeadline": "Add headline",
  "lookbook.addNote": "Add note",
  "lookbook.addShape": "Add shape",
  "lookbook.newBoard": "New board",
  "lookbook.inspector": "Inspector",
  "lookbook.selectElement": "Select an element",
  "lookbook.width": "Width",
  "lookbook.height": "Height",
  "lookbook.rotation": "Rotation",
  "lookbook.layer": "Layer",
  "lookbook.text": "Text",
  "lookbook.lock": "Lock",
  "lookbook.unlock": "Unlock",
  "lookbook.delete": "Delete",
  "lookbook.forward": "Bring forward",
  "lookbook.backward": "Send backward",
  "lookbook.drawer": "Closet drawer",
  "lookbook.drawerTitle": "Add wardrobe items",
  "lookbook.savedBoards": "Saved boards",
  "lookbook.savedBoardsTitle": "Reload compositions",
  "lookbook.defaultHeadline": "NEW STORY",
  "lookbook.defaultBody": "Add a note for this composition.",
  "lookbook.noBoards": "No saved lookbooks yet.",
  "lookbook.untitled": "Untitled lookbook",
  "lookbook.fileName": "lookbook",
  "lookbook.layers": "layers",
  "lookbook.validationItem": "Add at least one garment to save this lookbook.",
  "lookbook.clearError": "Dismiss validation message",
  "lookbook.backgroundPaper": "paper",
  "lookbook.backgroundMist": "mist",
  "lookbook.backgroundSand": "sand",
  "lookbook.backgroundOlive": "olive",
  "lookbook.transform": "Transform details",
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
  "settings.resetBody": "Clears wardrobe items, lookbooks, cached weather, and uploaded images from this device.",
  "settings.resetAction": "Clear local data",
  "settings.resetConfirm": "Clear all wardrobe data stored on this device?",
  "settings.resetDone": "Local wardrobe data cleared.",
  "settings.sampleAction": "Load sample data",
  "settings.sampleDone": "Sample wardrobe data loaded.",
  "settings.localDataSection": "Local data management"
};

export const messages: Record<Locale, Catalog> = {
  en: base,
  ko: {
    ...base,
    "disclosure.open": "열기",
    "disclosure.close": "닫기",
    "disclosure.showMore": "더 보기",
    "disclosure.showLess": "접기",
    "nav.home": "홈",
    "nav.wardrobe": "나의 옷장",
    "nav.register": "아이템 등록",
    "nav.lookbook": "룩북 메이커",
    "nav.settings": "설정",
    "app.boot": "로컬 옷장 스튜디오를 준비하는 중입니다...",
    "app.loadingView": "화면을 불러오는 중입니다...",
    "badge.local": "브라우저 로컬 저장",
    "home.heroTitle": "당신의 디지털 옷장을 큐레이팅합니다.",
    "home.heroBody": "개인 컬렉션을 위한 갤러리 중심 옷장 스튜디오입니다.",
    "home.heroEyebrow": "에디토리얼 옷장 스튜디오",
    "home.todayLook": "내 룩북",
    "home.todayLookEmpty": "저장된 룩북이 없습니다",
    "home.todayLookEmptyBody": "룩북 메이커에서 구성을 저장하면 여기에 표시됩니다.",
    "home.lookbooksMore": "룩북 더 보기",
    "home.lookbooksLess": "룩북 접기",
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
    "wardrobe.title": "당신의 디지털 생추어리",
    "wardrobe.search": "컬렉션 검색...",
    "wardrobe.searchLabel": "옷장 검색",
    "wardrobe.empty": "조건에 맞는 아이템이 없습니다.",
    "wardrobe.favorites": "즐겨찾기",
    "wardrobe.showArchived": "보관 항목 표시",
    "wardrobe.sortNewest": "최신순",
    "wardrobe.sortFavorites": "즐겨찾기 우선",
    "wardrobe.sortName": "이름순",
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
    "wardrobe.colorRangeDark": "검정 쪽",
    "wardrobe.colorRangeLight": "흰색 쪽",
    "wardrobe.colorRangeHint": "저장된 의류 팔레트를 기준으로 어두운 색부터 밝은 색까지 범위를 좁혀보세요.",
    "wardrobe.colorRangeAll": "저장된 전체 색상",
    "register.title": "아이템 등록",
    "register.captureTitle": "새 아이템 등록",
    "register.editingTitle": "편집 중",
    "register.saveDraft": "임시 저장",
    "register.saveItem": "옷장에 저장",
    "register.heroImage": "대표 이미지",
    "register.heroBody": "의류 이미지를 올리거나 드래프트로 계속 진행하세요.",
    "register.replaceImage": "이미지 교체",
    "register.removeImage": "이미지 제거",
    "register.palette": "팔레트",
    "register.addColor": "색상 추가",
    "register.metaAssetType": "메타 자산 유형",
    "register.metaAssets": "메타 자산",
    "register.addMetaImage": "이미지 추가",
    "register.pickFromImage": "이미지에서 추출",
    "register.pickFromImageActive": "업로드된 이미지 안을 클릭해 색상을 추출하세요.",
    "register.noMetaAssets": "메타 자산이 아직 없습니다.",
    "register.removeAsset": "자산 제거",
    "register.name": "이름",
    "register.category": "카테고리",
    "register.materials": "소재",
    "register.storageLocation": "보관 위치",
    "register.occasionTags": "상황 / 태그",
    "register.styleNotes": "스타일 노트",
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
    "register.metaSection": "메타 자산",
    "lookbook.title": "룩북 메이커",
    "lookbook.save": "룩북 저장",
    "lookbook.export": "PNG 내보내기",
    "lookbook.addHeadline": "헤드라인 추가",
    "lookbook.addNote": "노트 추가",
    "lookbook.addShape": "도형 추가",
    "lookbook.newBoard": "새 보드",
    "lookbook.inspector": "인스펙터",
    "lookbook.selectElement": "요소를 선택하세요",
    "lookbook.width": "너비",
    "lookbook.height": "높이",
    "lookbook.rotation": "회전",
    "lookbook.layer": "레이어",
    "lookbook.text": "텍스트",
    "lookbook.lock": "잠금",
    "lookbook.unlock": "잠금 해제",
    "lookbook.delete": "삭제",
    "lookbook.forward": "앞으로",
    "lookbook.backward": "뒤로",
    "lookbook.drawer": "옷장 서랍",
    "lookbook.drawerTitle": "옷장 아이템 추가",
    "lookbook.savedBoards": "저장된 보드",
    "lookbook.savedBoardsTitle": "구성 다시 불러오기",
    "lookbook.defaultHeadline": "새 이야기",
    "lookbook.defaultBody": "이 구성에 대한 메모를 추가하세요.",
    "lookbook.noBoards": "저장된 룩북이 아직 없습니다.",
    "lookbook.untitled": "제목 없는 룩북",
    "lookbook.fileName": "lookbook",
    "lookbook.layers": "레이어",
    "lookbook.validationItem": "룩북을 저장하려면 의류를 1개 이상 추가하세요.",
    "lookbook.clearError": "검증 메시지 닫기",
    "lookbook.backgroundPaper": "페이퍼",
    "lookbook.backgroundMist": "미스트",
    "lookbook.backgroundSand": "샌드",
    "lookbook.backgroundOlive": "올리브",
    "lookbook.transform": "변형 세부 조정",
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
    "settings.resetBody": "이 기기에 저장된 옷장 아이템, 룩북, 캐시된 날씨, 업로드 이미지를 삭제합니다.",
    "settings.resetAction": "로컬 데이터 삭제",
    "settings.resetConfirm": "이 기기에 저장된 옷장 데이터를 모두 삭제할까요?",
    "settings.resetDone": "로컬 옷장 데이터를 삭제했습니다.",
    "settings.sampleAction": "샘플 데이터 불러오기",
    "settings.sampleDone": "샘플 옷장 데이터를 불러왔습니다.",
    "settings.localDataSection": "로컬 데이터 관리"
  },
  ja: {
    ...base,
    "nav.home": "ホーム",
    "nav.wardrobe": "ワードローブ",
    "nav.register": "アイテム登録",
    "nav.lookbook": "ルックブック",
    "nav.settings": "設定"
  },
  fr: {
    ...base,
    "nav.home": "Accueil",
    "nav.wardrobe": "Garde-robe",
    "nav.register": "Ajouter",
    "nav.lookbook": "Lookbook",
    "nav.settings": "Paramètres"
  },
  es: {
    ...base,
    "nav.home": "Inicio",
    "nav.wardrobe": "Armario",
    "nav.register": "Registrar",
    "nav.lookbook": "Lookbook",
    "nav.settings": "Ajustes"
  },
  de: {
    ...base,
    "nav.home": "Start",
    "nav.wardrobe": "Garderobe",
    "nav.register": "Erfassen",
    "nav.lookbook": "Lookbook",
    "nav.settings": "Einstellungen"
  },
  "zh-CN": {
    ...base,
    "nav.home": "首页",
    "nav.wardrobe": "衣橱",
    "nav.register": "登记单品",
    "nav.lookbook": "造型册",
    "nav.settings": "设置"
  }
};
