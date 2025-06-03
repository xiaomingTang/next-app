export type ContentCategory =
  | 'General'
  | 'News'
  | 'Novel'
  | 'Cartoon'
  | 'Sports'
  | 'Dialect'
  | 'Conversation'

export type VoicePersonality =
  | 'Friendly'
  | 'Positive'
  | 'Warm'
  | 'Passion'
  | 'Cute'
  | 'Professional'
  | 'Reliable'
  | 'Humorous'
  | 'Bright'
  | 'Confident'
  | 'Authority'
  | 'Rational'
  | 'Considerate'
  | 'Comfort'
  | 'Pleasant'
  | 'Lively'
  | 'Sunshine'

export const contentCategoriesMap: Record<ContentCategory, string> = {
  General: '通用',
  News: '新闻',
  Novel: '小说',
  Cartoon: '卡通',
  Sports: '体育',
  Dialect: '方言',
  Conversation: '对话',
}

export const voicePersonalitiesMap: Record<VoicePersonality, string> = {
  Friendly: '友好',
  Positive: '积极',
  Warm: '温暖',
  Passion: '热情',
  Cute: '可爱',
  Professional: '专业',
  Reliable: '可靠',
  Humorous: '幽默',
  Bright: '开朗',
  Confident: '自信',
  Authority: '权威',
  Rational: '理性',
  Considerate: '体贴',
  Comfort: '舒适',
  Pleasant: '愉快',
  Lively: '活泼',
  Sunshine: '阳光',
}

export interface VoiceItem {
  /**
   * 语音名
   */
  voice: string
  gender: 'male' | 'female'
  locale: string
  contentCategories: ContentCategory[]
  voicePersonalities: VoicePersonality[]
  name: string
}

/**
 * edge-tts --list-voices 运行失败，一直挂起，可以在[这里](https://gist.github.com/BettyJJ/17cbaa1de96235a7f5773b8690a20462)查看所有可用 voices.
 */
export const voices = [
  {
    voice: 'zh-CN-YunjianNeural',
    gender: 'male',
    locale: 'zh-CN',
    contentCategories: ['Sports', 'Novel'],
    voicePersonalities: ['Passion'],
    name: '普通话男声·云健',
  },
  {
    voice: 'zh-CN-YunxiNeural',
    gender: 'male',
    locale: 'zh-CN',
    contentCategories: ['Novel'],
    voicePersonalities: ['Lively', 'Sunshine'],
    name: '普通话男声·云希',
  },
  {
    voice: 'zh-CN-YunxiaNeural',
    gender: 'male',
    locale: 'zh-CN',
    contentCategories: ['Cartoon', 'Novel'],
    voicePersonalities: ['Cute'],
    name: '普通话男声·云夏',
  },
  {
    voice: 'zh-CN-YunyangNeural',
    gender: 'male',
    locale: 'zh-CN',
    contentCategories: ['News'],
    voicePersonalities: ['Professional', 'Reliable'],
    name: '普通话男声·云阳',
  },
  {
    voice: 'zh-CN-XiaoxiaoNeural',
    gender: 'female',
    locale: 'zh-CN',
    contentCategories: ['News', 'Novel'],
    voicePersonalities: ['Warm'],
    name: '普通话女声·晓晓',
  },
  {
    voice: 'zh-CN-XiaoyiNeural',
    gender: 'female',
    locale: 'zh-CN',
    contentCategories: ['Cartoon', 'Novel'],
    voicePersonalities: ['Lively'],
    name: '普通话女声·晓依',
  },
  {
    voice: 'zh-HK-WanLungNeural',
    gender: 'male',
    locale: 'zh-HK',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '粤语男声·云龙',
  },
  {
    voice: 'zh-HK-HiuGaaiNeural',
    gender: 'female',
    locale: 'zh-HK',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '粤语女声·晓佳',
  },
  {
    voice: 'zh-HK-HiuMaanNeural',
    gender: 'female',
    locale: 'zh-HK',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '粤语女声·晓雯',
  },
  {
    voice: 'zh-CN-liaoning-XiaobeiNeural',
    gender: 'female',
    locale: 'zh-CN-liaoning',
    contentCategories: ['Dialect'],
    voicePersonalities: ['Humorous'],
    name: '辽宁方言女声·晓贝',
  },
  {
    voice: 'zh-CN-shaanxi-XiaoniNeural',
    gender: 'female',
    locale: 'zh-CN-shaanxi',
    contentCategories: ['Dialect'],
    voicePersonalities: ['Bright'],
    name: '陕西方言女声·晓妮',
  },
  {
    voice: 'zh-TW-YunJheNeural',
    gender: 'male',
    locale: 'zh-TW',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '台语男声·云哲',
  },
  {
    voice: 'zh-TW-HsiaoChenNeural',
    gender: 'female',
    locale: 'zh-TW',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '台语女声·小晨',
  },
  {
    voice: 'zh-TW-HsiaoYuNeural',
    gender: 'female',
    locale: 'zh-TW',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '台语女声·小语',
  },
  {
    voice: 'en-GB-ThomasNeural',
    gender: 'male',
    locale: 'en-GB',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '英音男声-Thomas',
  },
  {
    voice: 'en-GB-RyanNeural',
    gender: 'male',
    locale: 'en-GB',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '英音男声-Ryan',
  },
  {
    voice: 'en-GB-LibbyNeural',
    gender: 'female',
    locale: 'en-GB',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '英音女声-Libby',
  },
  {
    voice: 'en-GB-MaisieNeural',
    gender: 'female',
    locale: 'en-GB',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '英音女声-Maisie',
  },
  {
    voice: 'en-GB-SoniaNeural',
    gender: 'female',
    locale: 'en-GB',
    contentCategories: ['General'],
    voicePersonalities: ['Friendly', 'Positive'],
    name: '英音女声-Sonia',
  },
  {
    voice: 'en-US-ChristopherNeural',
    gender: 'male',
    locale: 'en-US',
    contentCategories: ['News', 'Novel'],
    voicePersonalities: ['Reliable', 'Authority'],
    name: '美音男声-Christopher',
  },
  {
    voice: 'en-US-EricNeural',
    gender: 'male',
    locale: 'en-US',
    contentCategories: ['News', 'Novel'],
    voicePersonalities: ['Rational'],
    name: '美音男声-Eric',
  },
  {
    voice: 'en-US-GuyNeural',
    gender: 'male',
    locale: 'en-US',
    contentCategories: ['News', 'Novel'],
    voicePersonalities: ['Passion'],
    name: '美音男声-Guy',
  },
  {
    voice: 'en-US-RogerNeural',
    gender: 'male',
    locale: 'en-US',
    contentCategories: ['News', 'Novel'],
    voicePersonalities: ['Lively'],
    name: '美音男声-Roger',
  },
  {
    voice: 'en-US-SteffanNeural',
    gender: 'male',
    locale: 'en-US',
    contentCategories: ['News', 'Novel'],
    voicePersonalities: ['Rational'],
    name: '美音男声-Steffan',
  },
  {
    voice: 'en-US-AriaNeural',
    gender: 'female',
    locale: 'en-US',
    contentCategories: ['News', 'Novel'],
    voicePersonalities: ['Positive', 'Confident'],
    name: '美音女声-Aria',
  },
  {
    voice: 'en-US-AnaNeural',
    gender: 'female',
    locale: 'en-US',
    contentCategories: ['Cartoon', 'Conversation'],
    voicePersonalities: ['Cute'],
    name: '美音女声-Ana',
  },
  {
    voice: 'en-US-JennyNeural',
    gender: 'female',
    locale: 'en-US',
    contentCategories: ['Conversation', 'News'],
    voicePersonalities: ['Friendly', 'Considerate', 'Comfort'],
    name: '美音女声-Jenny',
  },
  {
    voice: 'en-US-MichelleNeural',
    gender: 'female',
    locale: 'en-US',
    contentCategories: ['News', 'Novel'],
    voicePersonalities: ['Friendly', 'Pleasant'],
    name: '美音女声-Michelle',
  },
] satisfies VoiceItem[]
