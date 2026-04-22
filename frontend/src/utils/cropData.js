export const CROP_INFO = {
  rice:         { emoji: '🌾', color: '#E8C547', desc: 'Staple grain, thrives in wet paddies' },
  maize:        { emoji: '🌽', color: '#F4D03F', desc: 'Versatile cereal crop' },
  chickpea:     { emoji: '🫘', color: '#D4A017', desc: 'Protein-rich legume' },
  kidneybeans:  { emoji: '🫘', color: '#922B21', desc: 'High-protein legume' },
  pigeonpeas:   { emoji: '🌿', color: '#7D6608', desc: 'Drought-tolerant legume' },
  mothbeans:    { emoji: '🌱', color: '#A9760D', desc: 'Arid-region legume' },
  mungbean:     { emoji: '🫘', color: '#1E8449', desc: 'Short-duration legume' },
  blackgram:    { emoji: '⚫', color: '#212121', desc: 'Nutritious pulse crop' },
  lentil:       { emoji: '🫘', color: '#E67E22', desc: 'Protein-rich pulse' },
  pomegranate:  { emoji: '🍎', color: '#C0392B', desc: 'Antioxidant-rich fruit' },
  banana:       { emoji: '🍌', color: '#F1C40F', desc: 'Tropical fruit crop' },
  mango:        { emoji: '🥭', color: '#E67E22', desc: 'King of tropical fruits' },
  grapes:       { emoji: '🍇', color: '#8E44AD', desc: 'Vine fruit for wine & eating' },
  watermelon:   { emoji: '🍉', color: '#E74C3C', desc: 'Summer cooling fruit' },
  muskmelon:    { emoji: '🍈', color: '#F0E68C', desc: 'Sweet aromatic melon' },
  apple:        { emoji: '🍏', color: '#27AE60', desc: 'Temperate zone fruit' },
  orange:       { emoji: '🍊', color: '#E67E22', desc: 'Citrus fruit rich in Vitamin C' },
  papaya:       { emoji: '🍈', color: '#F39C12', desc: 'Fast-growing tropical fruit' },
  coconut:      { emoji: '🥥', color: '#7D4D1D', desc: 'Versatile tropical palm' },
  cotton:       { emoji: '🌸', color: '#ECF0F1', desc: 'Cash crop for textiles' },
  jute:         { emoji: '🌿', color: '#8B7355', desc: 'Natural fiber crop' },
  coffee:       { emoji: '☕', color: '#6F4E37', desc: 'Aromatic beverage crop' },
};

export const getCropInfo = (name) => {
  const key = name?.toLowerCase().replace(/\s+/g, '');
  return CROP_INFO[key] || { emoji: '🌱', color: '#4A7C59', desc: 'Recommended crop for your soil' };
};
