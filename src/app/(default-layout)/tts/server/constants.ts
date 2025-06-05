import { b, n } from '@/config/formatter'

export const ttsEnvConfig = {
  enableUser: b(process.env.TTS_ENABLE_USER),
  enableGuest: b(process.env.TTS_ENABLE_GUEST),
  guestConcurrency: n(process.env.TTS_GUEST_CONCURRENCY),
  userConcurrency: n(process.env.TTS_USER_CONCURRENCY),
  secondlyConcurrency: n(process.env.TTS_SECONDLY_CONCURRENCY),
}
