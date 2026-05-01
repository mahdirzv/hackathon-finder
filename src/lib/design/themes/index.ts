import type { ThemePresetName } from '@/config'
import { neutralTheme } from './neutral'
import { vividTheme } from './vivid'

const themes: Record<ThemePresetName, Record<string, string>> = {
  neutral: neutralTheme,
  vivid:   vividTheme,
}

export function getTheme(preset: ThemePresetName): Record<string, string> {
  const theme = themes[preset]
  if (!theme) throw new Error(`Unknown THEME_PRESET: "${preset}". Valid options: neutral | vivid`)
  return theme
}

export { neutralTheme, vividTheme }
