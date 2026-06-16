// Zdroj pravdy pro volbu typu balení sady.
// Analogicky k `dimensions` v PexesoCreator – plochý příplatek k ceně za kus.

export type PackagingType = 'standard' | 'gift';

/** Příplatek za dárkové balení v Kč (za každý kus). */
export const GIFT_PACKAGING_SURCHARGE = 49;

export interface PackagingOption {
  id: PackagingType;
  label: string;
  desc: string;
  priceAdd: number;
}

export const PACKAGING_OPTIONS: readonly PackagingOption[] = [
  { id: 'standard', label: 'Standardní balení', desc: 'Klasický ochranný obal', priceAdd: 0 },
  {
    id: 'gift',
    label: 'Dárkové balení',
    desc: 'Prémiová dárková krabička se stuhou',
    priceAdd: GIFT_PACKAGING_SURCHARGE,
  },
] as const;

/** Příplatek za zvolený typ balení (Kč za kus). */
export const packagingSurcharge = (packaging?: PackagingType): number =>
  packaging === 'gift' ? GIFT_PACKAGING_SURCHARGE : 0;

/** Lidsky čitelný název balení pro košík/objednávku. */
export const packagingLabel = (packaging?: PackagingType): string =>
  packaging === 'gift' ? 'Dárkové balení' : 'Standardní balení';
