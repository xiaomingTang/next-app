declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_ORIGIN: string
    NEXT_PUBLIC_PEER_SERVER: string
    NEXT_PUBLIC_LAST_COMMIT_MESSAGE: string

    ANALYZE: string

    SYSTEM_CONFIG_PEER_AUTH_REQUIRED: string

    ADMIN_EMAIL: string
    ADMIN_PASSWORD: string
    JWT_SECRET: string
    PASSWORD_SALT: string

    MYSQLDB_URI: string

    GA_ID: string

    NEXT_PUBLIC_CDN_ROOT: string
    TC_COS_SECRET_ID: string
    TC_COS_SECRET_KEY: string
    NEXT_PUBLIC_TC_COS_BUCKET: string
    NEXT_PUBLIC_TC_COS_REGION: string

    STUN_SERVER: string
    TURN_SERVER: string
    TURN_SECRET: string
  }
}
