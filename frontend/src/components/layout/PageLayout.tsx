import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'

interface PageLayoutProps {
  children: ReactNode
  navbarVariant?: 'light' | 'dark'
  hideFooter?: boolean
}

export const PageLayout = ({
  children,
  navbarVariant = 'light',
  hideFooter = false,
}: PageLayoutProps) => (
  <>
    <Navbar variant={navbarVariant} />
    <main>{children}</main>
    {!hideFooter && <Footer />}
    <WhatsAppButton />
  </>
)
