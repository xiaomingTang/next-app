'use client'

import { usePageTransitionEffect } from './usePageTransitionEffect'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useContext, useEffect, useRef } from 'react'

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
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { ease: 'easeInOut', duration: 0.5 },
} satisfies PageTransitionEffectConfig

const onEnter = () => {
  usePageTransitionEffect.setState({
    exited: false,
  })
}

const onExitComplete = () => {
  usePageTransitionEffect.setState({
    exited: true,
  })
}

export function PageTransitionEffect({
  children,
  ...props
}: PageTransitionEffectProps) {
  const pathname = usePathname()

  useEffect(() => {
    onEnter()
  }, [pathname])

  return (
    <AnimatePresence mode='popLayout' onExitComplete={onExitComplete}>
      <motion.main {...defaultProps} {...props} key={pathname}>
        <FrozenRouter>{children}</FrozenRouter>
      </motion.main>
    </AnimatePresence>
  )
}
