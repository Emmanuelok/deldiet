export type BlendAsset = {
  preview: string;
  original?: string;
  width: number;
  height: number;
  alt: string;
};

export type Blend = {
  id: string;
  name: string;
  collection: string;
  description?: string;
  notes?: string;
  origin?: string;
  roast?: string;
  pack?: string;
  media?: BlendAsset;
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function filterBlends(blends: readonly Blend[], query: string, collection = "") {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return blends.filter((blend) => {
    if (collection && blend.collection !== collection) return false;
    const haystack = normalize(
      [blend.name, blend.collection, blend.description, blend.notes, blend.origin, blend.roast, blend.pack]
        .filter(Boolean).join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}
