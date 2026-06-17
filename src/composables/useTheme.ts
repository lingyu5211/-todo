import { ref } from 'vue'
import { getThemeSettings, saveThemeSettings } from '@/utils/api'

const DEFAULT_COLOR = '#6366f1'
const STORAGE_KEY = 'themeColor'

const currentColor = ref(DEFAULT_COLOR)

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  )
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

function applyTheme(color: string): void {
  const root = document.documentElement
  root.style.setProperty('--theme-primary', color)
  root.style.setProperty('--el-color-primary', color)
  root.style.setProperty('--el-color-primary-light-3', lighten(color, 0.3))
  root.style.setProperty('--el-color-primary-light-5', lighten(color, 0.5))
  root.style.setProperty('--el-color-primary-light-7', lighten(color, 0.7))
  root.style.setProperty('--el-color-primary-light-9', lighten(color, 0.9))
  root.style.setProperty('--el-color-primary-dark-2', darken(color, 0.2))
  currentColor.value = color
}

export function useTheme() {
  async function setThemeColor(color: string): Promise<void> {
    applyTheme(color)
    localStorage.setItem(STORAGE_KEY, color)
    try {
      const settings = await getThemeSettings()
      await saveThemeSettings({ id: settings.id || 1, color })
    } catch {
      // API save is best-effort; localStorage is the source of truth
    }
  }

  async function initTheme(): Promise<void> {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      applyTheme(saved)
    }
    try {
      const settings = await getThemeSettings()
      if (settings?.color) {
        applyTheme(settings.color)
        localStorage.setItem(STORAGE_KEY, settings.color)
      }
    } catch {
      // API unavailable; use localStorage value already applied
    }
  }

  return { currentColor, setThemeColor, initTheme }
}
