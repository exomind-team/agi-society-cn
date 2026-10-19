// Shared semantic glyph registry: geometry lives here, never in page content.
export const uiIcons = {
  book: { viewBox: '0 0 24 24', paths: ['M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V6Z'] },
  experiment: { viewBox: '0 0 24 24', paths: ['M9 3h6M10 3v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10'] },
  code: { viewBox: '0 0 24 24', paths: ['m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18'] },
  environment: { viewBox: '0 0 24 24', paths: ['M5 3h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z','M8 21h8m-4-5v5M7 7h4v5H7Zm7 0h3m-3 5h3'] },
  processor: { viewBox: '0 0 24 24', paths: ['M8 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z','M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4M10 10h4v4h-4Z'] },
  inputArrow: { viewBox: '0 0 100 16', paths: ['M2 8h94m-7-6 7 6-7 6'] },
  outputArrow: { viewBox: '0 0 100 16', paths: ['M98 8H4m7-6-7 6 7 6'] },
} as const
export type UiIconName = keyof typeof uiIcons
