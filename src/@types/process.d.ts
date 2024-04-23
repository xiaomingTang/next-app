declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_ORIGIN: string
    NEXT_PUBLIC_PEER_SERVER: string
    NEXT_PUBLIC_LAST_COMMIT_MESSAGE: string

    ANALYZE: string
    WRITE_DOT_ENV: string

    SYSTEM_CONFIG_PEER_AUTH_REQUIRED: string

    JWT_SECRET: string
    ADMIN_EMAIL: string
    ADMIN_PASSWORD: string
    PASSWORD_SALT: string

    MYSQLDB_URI: string

    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string

    C_AWS_REGION: string
    C_AWS_BUCKET: string
    C_AWS_ACCESS_KEY_ID: string
    C_AWS_SECRET_ACCESS_KEY: string

    GA_ID: string

    DINGTALK_WEB_HOOK: string
    DINGTALK_SECRET: string

    NEXT_PUBLIC_CDN_ROOT: string
    TC_COS_SECRET_ID: string
    TC_COS_SECRET_KEY: string
    NEXT_PUBLIC_TC_COS_BUCKET: string
    NEXT_PUBLIC_TC_COS_REGION: string
  }
}
