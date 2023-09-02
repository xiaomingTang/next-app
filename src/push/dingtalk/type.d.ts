export interface At {
  atMobiles?: string[]
  atUserIds?: string[]
  isAtAll?: boolean
}

export interface TextMessage {
  msgtype: 'text'
  at: At
  text: {
    content: string
  }
}

export interface LinkMessage {
  msgtype: 'link'
  link: {
    text: string
    title: string
    picUrl?: string
    messageUrl: string
  }
}

export interface MarkdownMessage {
  msgtype: 'markdown'
  at: At
  markdown: {
    title: string
    text: string
  }
}

export interface ActionCardMessage {
  msgtype: 'actionCard'
  actionCard: {
    title: string
    text: string
    /**
     * - 0: 按钮竖直排列
     * - 1: 按钮横向排列
     */
    btnOrientation?: '0' | '1'
    singleTitle?: string
    singleURL?: string
    btns?: {
      title: string
      actionURL: string
    }[]
  }
}

export interface FeedCardMessage {
  msgtype: 'feedCard'
  feedCard: {
    links: {
      title: string
      messageURL: string
      picURL: string
    }[]
  }
}
