export const LANDING_PAGE_THEMES = [
  {
    id: 'lookbook',
    name: 'Lookbook',
    blurb: 'Premium visual merchandising for watches, sunglasses, and apparel — gallery, swatches, and size guide',
    colors: ['#1C1917', '#B08D57'],
  },
  {
    id: 'product-launch',
    name: 'Problem Solver',
    blurb: 'For products that solve a problem — problem/solution, features & benefits, how it works, and testimonials',
    colors: ['#1C1917', '#B08D57'],
  },
];

export const LANDING_PAGE_THEME_IDS = LANDING_PAGE_THEMES.map((t) => t.id);

export const LANDING_PAGE_THEME_RENDERERS = {
  lookbook: 'lookbook',
  'product-launch': 'product-launch',
};

export const DEFAULT_LANDING_PAGE_THEME_ID = 'lookbook';
