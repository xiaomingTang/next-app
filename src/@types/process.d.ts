declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_ORIGIN: string
    NEXT_PUBLIC_PEER_SERVER: string
    MYSQLDB_URI: string
    NEXT_PUBLIC_LAST_COMMIT_MESSAGE: string
    JWT_SECRET: string
    ADMIN_EMAIL: string
    ADMIN_PASSWORD: string
    PASSWORD_SALT: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    NEXTAUTH_SECRET: string
    C_AWS_REGION: string
    C_AWS_BUCKET: string
    C_AWS_ACCESS_KEY_ID: string
    C_AWS_SECRET_ACCESS_KEY: string
    GA_ID: string
    DINGTALK_WEB_HOOK: string
    DINGTALK_SECRET: string
  }
}
