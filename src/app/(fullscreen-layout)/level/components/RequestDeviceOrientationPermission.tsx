import Anchor from '@/components/Anchor'
import { cat } from '@/errors/catchAndToast'
import { useRequestDeviceOrientationPermission } from '@/hooks/useRequestDeviceOrientationPermission'

import { Alert, Tooltip, Typography } from '@mui/material'

export function RequestDeviceOrientationPermission() {
  const { permissionState, requestPermission } =
    useRequestDeviceOrientationPermission()

  if (permissionState === 'granted') {
    return <></>
  }

  const anchor = (
    <Anchor
      className='select-none'
      onClick={cat(async () => {
        const res = await requestPermission()
        if (res === 'prompt') {
          throw new Error('你的设备可能不支持陀螺仪')
        }
      })}
    >
      申请权限
    </Anchor>
  )

  const clearDataAnchor = <Anchor className='select-none'>清空本站数据</Anchor>

  const clearDataTip =
    'ios 请转到 “设置” > “Safari” > “高级” > “网站数据”，查找本站并删除本站所有数据。'

  return (
    <Alert
      severity='warning'
      sx={{
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        width: '100%',
      }}
    >
      {permissionState === 'prompt' && <>正在检测陀螺仪 {anchor}</>}
      {permissionState === 'denied' && (
        <>
          <Typography>没有陀螺仪权限，请点击{anchor}并授权；</Typography>
          <Typography>如果申请无效，请尝试重启浏览器后重试；</Typography>
          <Typography>
            <b>如果仍旧无效</b>，可尝试
            <Tooltip title={clearDataTip}>{clearDataAnchor}</Tooltip>
            并重试。
          </Typography>
        </>
      )}
    </Alert>
  )
}
