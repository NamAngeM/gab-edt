export const COURSE_PALETTE = [
  { bg: '#ECFDF5', border: '#009E60', text: '#00623C' },
  { bg: '#EFF6FF', border: '#3A75C4', text: '#1E4A8A' },
  { bg: '#FFF7ED', border: '#F97316', text: '#C2410C' },
  { bg: '#F5F3FF', border: '#8B5CF6', text: '#6D28D9' },
  { bg: '#FDF2F8', border: '#EC4899', text: '#BE185D' },
  { bg: '#ECFEFF', border: '#0891B2', text: '#0E7490' },
  { bg: '#FEFCE8', border: '#CA8A04', text: '#A16207' },
  { bg: '#F1F5F9', border: '#475569', text: '#334155' },
];

export const colorIndexFor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(hash) % COURSE_PALETTE.length;
};
