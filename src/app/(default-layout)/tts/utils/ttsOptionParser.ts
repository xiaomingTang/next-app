import type { TtsMergeOption } from './tts'

function decode(arg: { options: string }): TtsMergeOption
function decode(arg?: undefined | void | null): null
function decode(
  arg?: { options: string } | undefined | void | null
): TtsMergeOption | null
function decode(
  arg?: { options: string } | undefined | void | null
): TtsMergeOption | null {
  if (!arg?.options) {
    return null
  }
  return JSON.parse(arg.options) as TtsMergeOption
}

export const ttsOptionParser = {
  encode: (arg: TtsMergeOption) => JSON.stringify(arg),
  decode,
}
