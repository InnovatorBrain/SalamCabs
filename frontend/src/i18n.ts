import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const STORAGE_KEY = 'salam-cab-lang'

export const getStoredLanguage = (): 'en' | 'ar' => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'ar' ? 'ar' : 'en'
}

export const setStoredLanguage = (lang: 'en' | 'ar') => {
  localStorage.setItem(STORAGE_KEY, lang)
}

const loadLocaleModule = async (lang: 'en' | 'ar') => {
  const module = await import(`./locales/${lang}.json`)
  return module.default as Record<string, unknown>
}

const loadLocale = async (lang: 'en' | 'ar') => {
  const resources = await loadLocaleModule(lang)
  i18n.addResourceBundle(lang, 'translation', resources, true, true)
}

export const applyDocumentLanguage = (lang: 'en' | 'ar') => {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  const bootstrapLink = document.getElementById('bootstrap-css') as HTMLLinkElement | null
  if (bootstrapLink) {
    bootstrapLink.href = lang === 'ar' ? '/bootstrap.rtl.min.css' : '/bootstrap.min.css'
  }
  document.title = lang === 'ar' ? 'سلام كاب' : 'Salam Cab'
}

export const changeLanguage = async (lang: 'en' | 'ar') => {
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    await loadLocale(lang)
  }
  await i18n.changeLanguage(lang)
  setStoredLanguage(lang)
  applyDocumentLanguage(lang)
  const liveRegion = document.getElementById('aria-live-region')
  if (liveRegion) {
    liveRegion.textContent =
      lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English'
  }
}

export const initI18n = async () => {
  const initialLang = getStoredLanguage()
  applyDocumentLanguage(initialLang)
  const resources = await loadLocaleModule(initialLang)

  await i18n.use(initReactI18next).init({
    lng: initialLang,
    fallbackLng: 'en',
    resources: {
      [initialLang]: { translation: resources },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
}

export default i18n
