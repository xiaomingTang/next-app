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
    AWS_REGION: string
    AWS_BUCKET: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
  }
}
