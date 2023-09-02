declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string
    NEXT_PUBLIC_APP_ENV: AppEnv
    NEXT_PUBLIC_ORIGIN: string
    MYSQLDB_URI: string
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
