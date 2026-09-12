export const PRODUCT_CATEGORIES = [
  { value: "gomlek", label: "Gömlek" },
  { value: "elbise", label: "Elbise" },
  { value: "pantolon", label: "Pantolon" },
  { value: "etek", label: "Etek" },
  { value: "bluz", label: "Bluz" },
  { value: "sort", label: "Şort" },
  { value: "tshirt", label: "T-Shirt" },
  { value: "tunik", label: "Tunik" },
  { value: "ceket", label: "Ceket" },
] as const;

export const PRODUCTION_STAGES = [
  { value: "SIPARIS_ALINDI", label: "Sipariş alındı" },
  { value: "DIKIMA_HAZIRLANIYOR", label: "Dikime hazırlanıyor" },
  { value: "URETIM_SURECINDE", label: "Üretim sürecinde" },
  { value: "TESLIME_HAZIR", label: "Ürün teslim alınmaya hazır" },
] as const;

export type ProductionStageValue = (typeof PRODUCTION_STAGES)[number]["value"];
