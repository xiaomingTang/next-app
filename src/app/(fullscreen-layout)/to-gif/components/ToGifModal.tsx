import { getPreferredSize, isInteger, toOdd, shouldStretch } from './utils'
import { CropGif } from './CropGif'

import { getFFmpeg } from '../getFFmpeg'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { numberFormat } from '@/utils/numberFormat'
import Anchor from '@/components/Anchor'
import { AnchorProvider } from '@/components/AnchorProvider'
import { friendlySize } from '@/utils/transformer'

import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import CloseIcon from '@mui/icons-material/Close'
import PaletteIcon from '@mui/icons-material/Palette'
import { useMemo, useState } from 'react'
import { noop } from 'lodash-es'
import Image from 'next/image'
import toast from 'react-hot-toast'

import type { ImageInfo } from '../store'
import type { CropParams } from '@/components/Crop'

interface ToGifModalProps {
  images: ImageInfo[]
}

interface GifConfig {
  /**
   * 是否保持原图比例
   * @default true
   */
  keepOriginalRatio: boolean
  size: {
    width: number
    height: number
  }
  /**
   * 单位: s
   */
  duration: number
  /**
   * - 0: 无限循环
   * - 1: 循环一次（播放两次，原始 1 次 + 1）
   * - N: 播放 N + 1 次
   * @warning ffmpeg 不支持仅播放一次，如果你需要仅播放一次，请使用其他工具
   */
  loop: number
  /**
   * @default '000000'
   */
  backgroundColor: string
  cropParams: CropParams
}

interface GifInfo {
  url: string
  size: number
}

const OUTPUT_NAME = 'output.gif'

const ToGifModal = NiceModal.create(({ images }: ToGifModalProps) => {
  const preferredSize = useMemo(() => getPreferredSize(images), [images])
  const modal = useModal()
  const [loading, withLoading] = useLoading()
  const [gif, setGif] = useState<GifInfo | null>(null)
  const defaultConfig: GifConfig = useMemo(
    () => ({
      keepOriginalRatio: true,
      size: preferredSize,
      duration: 0.5,
      loop: 0,
      backgroundColor: '000000',
      cropParams: {
        x: 0,
        y: 0,
        w: preferredSize.width,
        h: preferredSize.height,
      },
    }),
    [preferredSize]
  )
  const { handleSubmit, control, setValue, getValues, clearErrors, trigger } =
    useForm<GifConfig>({
      defaultValues: defaultConfig,
    })
  const onSubmit = handleSubmit(
    withLoading(
      cat(async (e) => {
        const { duration, loop, cropParams: crop } = e
        // '0xCCCCCC'
        const bg = `0x${e.backgroundColor}`
        let {
          size: { width: w, height: h },
        } = e
        const toastMsgForOdd = []
        // fix: 奇数尺寸下 pad 滤镜会报错
        if (w % 2 !== 0) {
          w = toOdd(w)
          toastMsgForOdd.push('宽度不是偶数，已自动加 1')
        }
        if (h % 2 !== 0) {
          h = toOdd(h)
          toastMsgForOdd.push('高度不是偶数，已自动加 1')
        }
        if (toastMsgForOdd.length > 0) {
          toast(toastMsgForOdd.join('，'))
        }
        const ffmpeg = getFFmpeg()
        await ffmpeg.createDir('raw-images').catch(noop)
        await ffmpeg.createDir('images').catch(noop)
        // 把所有图片写入 raw-images, 并把非 jpg 图片转成 jpg, 移动到 images 目录中
        await Promise.all(
          images.map(async (img, i) => {
            const { width: iw, height: ih } = img
            const ext = img.propertyExt
            const f = new Uint8Array(await img.rawFile.arrayBuffer())
            const willStretch = shouldStretch(
              { width: w, height: h },
              { width: iw, height: ih }
            )
            if (ext === 'jpg' && !willStretch) {
              await ffmpeg.writeFile(`images/${i}.jpg`, f)
              return
            }
            await ffmpeg.writeFile(`raw-images/${i}.${ext}`, f)
            let cmds: string[] = []
            if (willStretch) {
              cmds = [
                '-i',
                `raw-images/${i}.${ext}`,
                '-filter_complex',
                `scale=${w}:${h},format=rgba,colorchannelmixer=aa=1[scaled];color=c=${bg}:s=${w}x${h}:d=1[bg];[bg][scaled]overlay=shortest=1`,
                '-frames:v',
                '1',
                '-pix_fmt',
                'yuvj420p',
                `images/${i}.jpg`,
              ]
            } else {
              cmds = [
                '-i',
                `raw-images/${i}.${ext}`,
                '-f',
                'lavfi',
                '-i',
                `color=c=${bg}:s=${iw}x${ih}:d=1`,
                '-filter_complex',
                '[1][0]overlay=(W-w)/2:(H-h):format=auto',
                '-frames:v',
                '1',
                '-pix_fmt',
                'yuvj420p',
                `images/${i}.jpg`,
              ]
            }
            console.log('to-jpg parameters: ', cmds)
            await ffmpeg.exec(cmds)
          })
        )
        let inputTxt = images
          .map((img, i) => `file 'images/${i}.jpg'\nduration ${duration}`)
          .join('\n')
        const lastImgIndex = images.length - 1
        // 最后一张图需要重复一次（gpt 说 FFmpeg bug 避免最后帧消失）
        inputTxt += `\nfile 'images/${lastImgIndex}.${images[lastImgIndex].propertyExt}'`
        console.log('input.txt: ', inputTxt)
        await ffmpeg.writeFile('input.txt', inputTxt)
        const cmds = [
          '-y',
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          'input.txt',
          '-vf',
          `scale=w=${w}:h=${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=${bg},crop=${crop.w}:${crop.h}:${crop.x}:${crop.y}`,
          '-loop',
          `${loop}`,
          OUTPUT_NAME,
        ]
        console.log('to-gif parameters: ', cmds)
        await ffmpeg.exec(cmds)
        const data = await ffmpeg.readFile(OUTPUT_NAME)
        const outputFile = new File(
          [(data as Uint8Array).buffer],
          OUTPUT_NAME,
          {
            type: 'image/gif',
          }
        )
        setGif({
          url: URL.createObjectURL(outputFile),
          size: outputFile.size,
        })
      })
    )
  )
  useInjectHistory(modal.visible, () => {
    modal.reject(new SilentError('操作已取消'))
    void modal.hide()
  })

  return (
    <Dialog
      {...muiDialogV5(modal)}
      fullWidth
      maxWidth='sm'
      onClose={() => {
        if (loading) {
          return
        }
        modal.reject(new SilentError('操作已取消'))
        void modal.hide()
      }}
    >
      <fieldset disabled={loading}>
        <AppBar sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              gif 配置
            </Typography>
            <IconButton
              edge='end'
              onClick={() => {
                modal.reject(new SilentError('操作已取消'))
                void modal.hide()
              }}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <form className='flex flex-col' onSubmit={onSubmit}>
            <Alert severity='info' sx={{ mb: 2 }} icon={false}>
              <Typography>
                *{' '}
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
                          title={
                            <>
                              <Typography>
                                ffmpeg
                                不支持仅播放一次，如果你需要仅播放一次，请使用其他工具。
                              </Typography>
                              <Typography sx={{ mt: 1 }}>
                                - 0: 无限循环
                              </Typography>
                              <Typography>
                                - 1: 循环一次（原始 1 次 + 1，即播放两次）
                              </Typography>
                              <Typography>- N: 播放 N + 1 次</Typography>
                            </>
                          }
                        >
                          <Anchor
                            underline
                            onClick={(e) => {
                              setAnchorEl((prev) => {
                                if (!prev) {
                                  return e.currentTarget
                                }
                                return null
                              })
                            }}
                          >
                            查看循环次数的说明
                          </Anchor>
                        </Tooltip>
                      </span>
                    </ClickAwayListener>
                  )}
                </AnchorProvider>
              </Typography>
              <Typography>
                * 输出尺寸会影响 GIF 的大小和质量，按需选择输出尺寸
              </Typography>
              <Typography>* 建议使用原图尺寸，且宽高均 2000 以内</Typography>
            </Alert>
            <Stack direction='row' spacing={1}>
              <Controller
                name='loop'
                control={control}
                defaultValue={0}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    label='循环次数 (0: 无限循环)'
                    type='number'
                    error={!!error}
                    helperText={error?.message ?? ' '}
                    sx={{ width: '100%' }}
                    {...field}
                    onChange={(e) => {
                      const newValue = numberFormat(e.target.value)
                      setValue(field.name, newValue)
                      void trigger(field.name)
                    }}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: '必填项',
                  },
                  min: {
                    value: 0,
                    message: '最小值为 0',
                  },
                  max: {
                    value: 100,
                    message: '最大值为 100',
                  },
                  validate: {
                    isInteger,
                  },
                }}
              />
              <Controller
                name='duration'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    label='每帧持续时间 (s)'
                    type='number'
                    error={!!error}
                    helperText={error?.message ?? ' '}
                    sx={{ width: '100%' }}
                    {...field}
                    onChange={(e) => {
                      const newValue = numberFormat(e.target.value)
                      setValue(field.name, newValue)
                      void trigger(field.name)
                    }}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: '必填项',
                  },
                  min: {
                    value: 0,
                    message: '最小值为 0',
                  },
                  max: {
                    value: 10,
                    message: '最大值为 10',
                  },
                }}
              />
            </Stack>
            <Stack direction='row' spacing={1}>
              <Controller
                name='size.width'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    label='输出宽度 (px)'
                    type='number'
                    error={!!error}
                    helperText={error?.message ?? ' '}
                    sx={{ width: '100%' }}
                    {...field}
                    onBlur={(e) => {
                      const nextValue = numberFormat(e.target.value)
                      if (getValues('keepOriginalRatio')) {
                        const { width, height } = preferredSize
                        const ratio = width / height
                        setValue('size.height', Math.round(nextValue / ratio))
                      }
                    }}
                    onChange={(e) => {
                      const newValue = numberFormat(e.target.value)
                      setValue(field.name, newValue)
                      void trigger(field.name)
                    }}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: '必填项',
                  },
                  min: {
                    value: 1,
                    message: '最小值为 1',
                  },
                  max: {
                    value: 20000,
                    message: '最大值为 20000',
                  },
                  validate: {
                    isInteger,
                  },
                }}
              />
              <Controller
                name='size.height'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    label='输出高度 (px)'
                    type='number'
                    error={!!error}
                    helperText={error?.message ?? ' '}
                    sx={{ width: '100%' }}
                    {...field}
                    onBlur={(e) => {
                      const nextValue = numberFormat(e.target.value)
                      if (getValues('keepOriginalRatio')) {
                        const { width, height } = preferredSize
                        const ratio = width / height
                        setValue('size.width', Math.round(nextValue * ratio))
                      }
                    }}
                    onChange={(e) => {
                      const newValue = numberFormat(e.target.value)
                      setValue(field.name, newValue)
                      void trigger(field.name)
                    }}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: '必填项',
                  },
                  min: {
                    value: 1,
                    message: '最小值为 1',
                  },
                  max: {
                    value: 20000,
                    message: '最大值为 20000',
                  },
                  validate: {
                    isInteger,
                  },
                }}
              />
            </Stack>
            <Stack direction='row' spacing={2} sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Controller
                    name='keepOriginalRatio'
                    control={control}
                    render={({ field }) => (
                      <Checkbox checked={field.value} {...field} />
                    )}
                  />
                }
                label='保持原图比例'
                value='end'
                labelPlacement='end'
              />
              <Button
                size='small'
                color='primary'
                sx={{ textDecoration: 'underline', fontWeight: 'bold' }}
                onClick={() => {
                  clearErrors(['size.width', 'size.height'])
                  const { width, height } = preferredSize
                  setValue('size.width', width)
                  setValue('size.height', height)
                  void trigger(['size.width', 'size.height'])
                }}
              >
                使用原图尺寸
              </Button>
            </Stack>
            <Box>
              <Controller
                name='backgroundColor'
                control={control}
                render={({ field }) => (
                  <Button
                    sx={{
                      position: 'relative',
                      fontVariant: 'body2',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: 'inherit',
                      fontFamily: 'inherit',
                    }}
                  >
                    <Typography component='span'>背景色</Typography>
                    <PaletteIcon
                      sx={{
                        color: `#${field.value}`,
                        ml: 1,
                      }}
                    />
                    <input
                      type='color'
                      value={`#${field.value}`}
                      onChange={(e) => {
                        const color = e.target.value
                          .replace('#', '')
                          .replace('0x', '')
                        if (color) {
                          setValue('backgroundColor', color)
                        }
                      }}
                      style={{
                        opacity: 0,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    />
                  </Button>
                )}
              />
            </Box>
            <Box sx={{ mt: 1, mb: 2 }}>
              <Controller
                name='cropParams'
                control={control}
                render={({ field }) => (
                  <CropGif
                    realSize={preferredSize}
                    images={images}
                    cropParams={field.value}
                    onChange={(value) => {
                      setValue('cropParams', value)
                    }}
                  />
                )}
              />
            </Box>

            <Button
              variant='outlined'
              color='primary'
              type='submit'
              loading={loading}
            >
              确定
            </Button>
            {gif && (
              <>
                <Controller
                  name='size'
                  control={control}
                  render={({ field }) => (
                    <Image
                      unoptimized
                      src={gif.url}
                      alt={`生成的 gif`}
                      className='w-full h-[500px] object-contain p-1 my-2'
                      style={{
                        maxHeight: field.value.height,
                      }}
                      width={field.value.width}
                      height={field.value.height}
                    />
                  )}
                />
                <Button
                  ref={(e) => {
                    if (e) {
                      e.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'nearest',
                        block: 'nearest',
                      })
                    }
                  }}
                  variant='contained'
                  color='primary'
                  loading={loading}
                  LinkComponent={Anchor}
                  href={gif.url}
                  download={OUTPUT_NAME}
                >
                  保存 （{friendlySize(gif.size)}）
                </Button>
              </>
            )}
          </form>
        </DialogContent>
      </fieldset>
    </Dialog>
  )
})

export function toGif(props: ToGifModalProps): Promise<void> {
  return NiceModal.show(ToGifModal, props)
}
