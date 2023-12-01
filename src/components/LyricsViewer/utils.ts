import { parseLRC } from '@/utils/lrc'
import { useListen } from '@/hooks/useListen'

import useSWR from 'swr'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { CustomMP3 } from '@prisma/client'

export function useHasShown(visible: boolean) {
  const [hasShown, setHasShown] = useState(false)

  useListen(visible, () => {
    if (visible) {
      setHasShown(true)
    }
  })

  return hasShown
}

export function useControlsVisible(
  parentVisible: boolean,
  isHovering: boolean
) {
  const timerRef = useRef(-1)
  const [controlsVisible, setControlsVisible] = useState(false)

  useEffect(() => {
    window.clearTimeout(timerRef.current)
    if (parentVisible) {
      setControlsVisible(true)
      timerRef.current = window.setTimeout(() => {
        setControlsVisible(false)
      }, 1500)
    } else {
      setControlsVisible(false)
    }
    return () => {
      window.clearTimeout(timerRef.current)
    }
  }, [parentVisible])

  useEffect(() => {
    window.clearTimeout(timerRef.current)
    if (isHovering) {
      setControlsVisible(true)
    } else {
      timerRef.current = window.setTimeout(() => {
        setControlsVisible(false)
      }, 500)
    }
    return () => {
      window.clearTimeout(timerRef.current)
    }
  }, [isHovering])

  return controlsVisible
}

export function useLyrics({
  enabled,
  mp3,
  playingTime,
}: {
  enabled: boolean
  mp3?: CustomMP3
  playingTime: number
}) {
  const {
    data: lyricsString = '',
    error: lyricsError,
    isValidating: lyricsLoading,
  } = useSWR<string, Error>(['lrc', mp3?.lrc, enabled], async () => {
    if (!enabled) {
      return ''
    }
    if (!mp3?.lrc) {
      throw new Error('没有歌词')
    }
    return fetch(mp3.lrc)
      .then((res) => res.text())
      .catch(() => {
        throw new Error('网络错误，请稍后重试')
      })
  })
  const lyrics = useMemo(() => parseLRC(lyricsString), [lyricsString])
  const reversedLrcData = useMemo(
    () => lyrics.lrcData.slice().reverse(),
    [lyrics.lrcData]
  )

  const activeIndex = useMemo(() => {
    if (reversedLrcData.length <= 1) {
      return 0
    }
    // 返回 lrcData 中最后一条小于 playingTime 的歌词 (所以才用 reversedLrcData)
    const reversedIndex = reversedLrcData.findIndex(
      (item) => item.timestamp <= playingTime
    )
    if (reversedIndex < 0) {
      return 0
    }
    return reversedLrcData.length - 1 - reversedIndex
  }, [playingTime, reversedLrcData])

  const activeText = useMemo(() => {
    if (!mp3) {
      return '-'
    }
    // 保证歌曲标题至少展示 1.5s
    if (playingTime < 1.5) {
      return mp3.name
    }
    if (lyricsLoading) {
      return `${mp3.name} - [加载中]`
    }
    if (lyricsError) {
      return `${mp3.name} - [${lyricsError.message || '未知错误'}]`
    }
    const activeLrcItem = lyrics.lrcData[activeIndex]
    return activeLrcItem?.text ?? `${mp3.name} - [没有歌词]`
  }, [
    mp3,
    lyricsLoading,
    lyricsError,
    lyrics.lrcData,
    activeIndex,
    playingTime,
  ])

  return {
    lyrics,
    lyricsError,
    lyricsLoading,
    activeLyricsItem: {
      index: activeIndex,
      text: activeText,
    },
  }
}
