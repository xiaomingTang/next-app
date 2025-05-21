import { encodeToId } from './utils'

import { Toc, useTocList } from '../Toc'

import Anchor from '@/components/Anchor'
import { AnchorProvider } from '@/components/AnchorProvider'
import { useDefaultAsideDetail } from '@/layout/utils'
import { onAnchorClick } from '@/components/Anchor/utils'

import {
  ClickAwayListener,
  IconButton,
  NoSsr,
  Tooltip,
  useEventCallback,
} from '@mui/material'
import { createElement, useEffect } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import ListIcon from '@mui/icons-material/List'

type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>

function EscListener({ onEsc }: { onEsc: (e: KeyboardEvent) => void }) {
  const handler = useEventCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEsc(e)
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [handler])

  return <></>
}

export function geneHeading(tag: `h${number}`) {
  return function Heading(props: HeadingProps) {
    const { visible: asideVisible } = useDefaultAsideDetail()
    const tocList = useTocList()
    const propsWithDefault: HeadingProps = {
      ...props,
      tabIndex: props.tabIndex ?? -1,
      className: 'user-heading',
    }
    const id = encodeToId(propsWithDefault.children?.toString())
    const elementHash = `#${id}`

    if (!id) {
      return createElement(tag, propsWithDefault, propsWithDefault.children)
    }
    return createElement(
      tag,
      propsWithDefault,
      <>
        <Anchor
          id={id}
          href={elementHash}
          aria-label='超链接, 指向页面内 heading'
          className='user-anchor'
          onClick={onAnchorClick}
        >
          <LinkIcon className='align-baseline' />
        </Anchor>
        <span className='user-heading-text'>{propsWithDefault.children}</span>
        <NoSsr>
          {/* TODO: setAnchorEl(null) after hash change */}
          {tocList.length > 0 && !asideVisible && (
            <AnchorProvider>
              {(anchorEl, setAnchorEl) => (
                <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                  <span
                    style={{
                      display: 'inline-flex',
                    }}
                  >
                    <Tooltip
                      open={!!anchorEl}
                      title={<Toc onClick={() => setAnchorEl(null)} />}
                    >
                      <IconButton
                        sx={{
                          p: 0,
                          ml: '4px',
                        }}
                        aria-label='目录'
                        className='user-heading-menu-trigger'
                        onClick={(e) => {
                          setAnchorEl((prev) => {
                            if (!prev) {
                              return e.currentTarget
                            }
                            return null
                          })
                        }}
                      >
                        <ListIcon />
                        <EscListener onEsc={() => setAnchorEl(null)} />
                      </IconButton>
                    </Tooltip>
                  </span>
                </ClickAwayListener>
              )}
            </AnchorProvider>
          )}
        </NoSsr>
      </>
    )
  }
}
