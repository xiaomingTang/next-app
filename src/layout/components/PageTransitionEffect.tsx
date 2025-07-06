'use client'

import { usePageTransitionEffect } from './usePageTransitionEffect'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useListen } from '@/hooks/useListen'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useContext, useEffect, useRef, useState } from 'react'
import { merge } from 'lodash-es'

import type { HTMLAttributes } from 'react'
import type { TargetAndTransition } from 'framer-motion'

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

interface LimitedAnimationOptions {
  initial?: TargetAndTransition
  animate?: TargetAndTransition
  exit?: TargetAndTransition
}

export type PageTransitionEffectProps = LimitedAnimationOptions &
  Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onAnimationStart'
    | 'onAnimationComplete'
  >

const defaultProps = {
  initial: { opacity: 0, transition: { duration: 1.5 } },
  animate: { opacity: 1, transition: { duration: 1.5 } },
  exit: { opacity: 0, transition: { duration: 1.5 } },
} satisfies LimitedAnimationOptions

const hardReloadAddonProps: LimitedAnimationOptions = {
  initial: { transition: { duration: 0 } },
  animate: { transition: { duration: 0 } },
}

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
  initial,
  animate,
  exit,
  ...divProps
}: PageTransitionEffectProps) {
  const hasHydrated = useHasHydrated()
  const pathname = usePathname()
  const animProps = merge({}, defaultProps, {
    initial,
    animate,
    exit,
  })
  // 使用 useRef 来避免每次渲染都重新计算 duration
  const animAnimateDuration = useRef(
    animProps.animate?.transition?.duration ??
      defaultProps.animate.transition.duration
  ).current
  const [appliedAnimProps, setAppliedAnimProps] = useState(
    merge({}, animProps, hardReloadAddonProps)
  )

  useListen(animAnimateDuration, () => {
    setTimeout(() => {
      setAppliedAnimProps(animProps)
      // 在动画结束后，删除 hardReloadAddonProps 中的属性,
      // 防止在 layout 切换时触发硬重载动画
      delete hardReloadAddonProps.initial
      delete hardReloadAddonProps.animate
    }, animAnimateDuration * 1000)
  })

  useEffect(() => {
    onEnter()
  }, [pathname])

  if (!hasHydrated) {
    // 初始加载时，不要动画，避免 opacity: 0 初始样式
    return <main {...divProps}>{children}</main>
  }

  return (
    <AnimatePresence mode='popLayout' onExitComplete={onExitComplete}>
      <motion.main {...appliedAnimProps} {...divProps} key={pathname}>
        <FrozenRouter>{children}</FrozenRouter>
      </motion.main>
    </AnimatePresence>
  )
}
