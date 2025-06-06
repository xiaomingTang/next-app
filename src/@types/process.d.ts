declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_ORIGIN: string
    NEXT_PUBLIC_PEER_SERVER: string
    NEXT_PUBLIC_LAST_COMMIT_MESSAGE: string

    ANALYZE: string

    SYSTEM_CONFIG_PEER_AUTH_REQUIRED: string

    TTS_ENABLE_USER: string
    TTS_ENABLE_GUEST: string
    TTS_GUEST_CONCURRENCY: string
    TTS_USER_CONCURRENCY: string
    TTS_SECONDLY_CONCURRENCY: string

    JWT_SECRET: string
    PASSWORD_SALT: string
    ADMIN_EMAIL: string
    ADMIN_PASSWORD: string

    MYSQLDB_URI: string

    GA_ID: string

    NEXT_PUBLIC_CDN_ROOT: string
    TC_COS_SECRET_ID: string
    TC_COS_SECRET_KEY: string
    NEXT_PUBLIC_TC_COS_BUCKET: string
    NEXT_PUBLIC_TC_COS_REGION: string

    DINGTALK_ACCESS_TOKEN: string
    DINGTALK_SECRET: string

    STUN_SERVER: string
    TURN_SERVER: string
    TURN_SECRET: string
  }
}
