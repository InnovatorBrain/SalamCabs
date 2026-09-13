import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useDirection } from '@/hooks/useDirection'

interface AccordionItem {
  id: string
  question: string
  answer: string
}

interface AccordionProps {
  items: AccordionItem[]
  defaultOpen?: string
}

export const Accordion = ({ items, defaultOpen }: AccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null)

  return (
    <div>
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className="faq-item">
            <button
              type="button"
              className="faq-question"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              {item.question}
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ color: '#ffc107', flexShrink: 0, display: 'inline-flex' }}
              >
                <Plus size={22} strokeWidth={2} />
              </motion.span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  {item.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export const FadeIn = ({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) => {
  const { direction } = useDirection()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, x: direction * 10 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  )
}

export const StaggerContainer = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.08 } },
    }}
  >
    {children}
  </motion.div>
)

export const StaggerItem = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  const { direction } = useDirection()
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20, x: direction * 15 },
        visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.25 } },
      }}
    >
      {children}
    </motion.div>
  )
}
