import 'client-only'
import { random } from 'lodash-es'
import { toast } from 'react-hot-toast'

export async function customConfirm(message: string) {
  const a = random(1, 10, false)
  const b = random(1, 10, false)
  const inputStr =
    // eslint-disable-next-line no-alert
    window.prompt(`${message}\n如果确定, 请输入【${a} + ${b}】的结果:`) ?? ''
  const sum = Number(inputStr)
  if (sum === a + b) {
    return true
  }
  toast.error('输入有误')
  return false
}
