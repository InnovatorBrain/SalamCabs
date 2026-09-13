import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@/i18n'

export const LanguageToggle = () => {
  const { i18n, t } = useTranslation()
  const isAr = i18n.language === 'ar'

  const handleToggle = async () => {
    await changeLanguage(isAr ? 'en' : 'ar')
  }

  return (
    <motion.button
      type="button"
      className="language-toggle"
      onClick={handleToggle}
      aria-label={isAr ? t('language.switchToEn') : t('language.switchTo')}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 72,
        height: 34,
        borderRadius: 50,
        border: '1.5px solid #e5e7eb',
        background: '#f9f7f2',
        padding: 3,
        cursor: 'pointer',
      }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{
          position: 'absolute',
          width: 32,
          height: 26,
          borderRadius: 50,
          background: '#ffc107',
          top: 3,
          insetInlineStart: isAr ? 37 : 3,
        }}
      />
      <span
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
          zIndex: 1,
          color: !isAr ? '#111' : '#6b7280',
        }}
      >
        EN
      </span>
      <span
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
          zIndex: 1,
          color: isAr ? '#111' : '#6b7280',
        }}
      >
        AR
      </span>
    </motion.button>
  )
}
