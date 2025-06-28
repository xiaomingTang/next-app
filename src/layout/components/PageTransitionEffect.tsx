'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useContext, useRef } from 'react'

import type { MotionProps } from 'framer-motion'

function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {})
  const frozen = useRef(context).current

  if (!frozen) {
    return <>{props.children}</>
  }

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {props.children}
    </LayoutRouterContext.Provider>
  )
}

export type PageTransitionEffectConfig = Omit<MotionProps, 'children' | 'key'>
export type PageTransitionEffectProps = PageTransitionEffectConfig & {
  children: React.ReactNode
}

const defaultProps = {
  initial: 'hidden',
  animate: 'enter',
  exit: 'exit',
  variants: {
    hidden: { opacity: 0, x: 10 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  },
  transition: { ease: 'easeInOut', duration: 0.5 },
} satisfies PageTransitionEffectConfig

export function PageTransitionEffect({
  children,
  ...props
}: PageTransitionEffectProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode='popLayout'>
      <motion.main {...defaultProps} {...props} key={pathname}>
        <FrozenRouter>{children}</FrozenRouter>
      </motion.main>
    </AnimatePresence>
  )
}
