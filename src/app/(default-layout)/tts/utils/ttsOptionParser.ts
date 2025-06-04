import type { TtsMergeOption } from './tts'

export const ttsOptionParser = {
  encode: (arg: TtsMergeOption) => JSON.stringify(arg),
  decode: (arg: { options: string }) =>
    JSON.parse(arg.options) as TtsMergeOption,
}
