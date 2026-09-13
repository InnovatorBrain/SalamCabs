import { useTranslation } from 'react-i18next'

export const useDirection = () => {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const direction = isRtl ? 1 : -1
  return { isRtl, direction }
}
