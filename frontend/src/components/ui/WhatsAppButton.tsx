import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { WHATSAPP_LINK } from '@/config/contact'

const WHATSAPP_ICON = '/images/whatsapp-icon.svg'

export const WhatsAppButton = () => {
  const { t } = useTranslation()

  return (
    <motion.a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      aria-label={t('common.whatsappChat')}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <span className="whatsapp-fab-ping" aria-hidden="true" />
      <img src={WHATSAPP_ICON} alt="" />
    </motion.a>
  )
}
