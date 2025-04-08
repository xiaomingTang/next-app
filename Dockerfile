# docker build -t 16px_cc --progress plain .
# docker run -itdp 3000:3000 16px_cc

FROM --platform=linux/amd64 ubuntu_with_node_22 AS base
ARG PORT=3000
ENV PORT ${PORT}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY package.json /app
RUN npm i -g pnpm@latest-10

WORKDIR /app

FROM base AS builder
COPY . /app
COPY .env.deploy.local /app/.env.local
ARG NEXT_PUBLIC_LAST_COMMIT_MESSAGE
RUN echo \\nNEXT_PUBLIC_LAST_COMMIT_MESSAGE=${NEXT_PUBLIC_LAST_COMMIT_MESSAGE}\\n >> /app/.env.local
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ENV NODE_ENV production
RUN pnpm run build

FROM base AS runner
RUN mkdir .next
COPY --from=builder /app/.env.local ./
COPY --from=builder /app/public ./public
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/launch.sh ./
COPY --from=builder /app/.ssl ./.ssl
COPY --from=builder /app/.bak ./.bak
COPY --from=builder /app/ci ./ci

# 为提取至宿主机做准备，如果不需要提取到宿主机，可以注释掉这一部分
ARG ZIP_PATH=/app/app.zip
RUN zip -r -q ${ZIP_PATH} .
# END: 为提取至宿主机做准备，如果不需要提取到宿主机，可以注释掉这一部分

# MD 明明记得 peer 不能全局安装，否则会失败，不知道怎么在 docker 里面就好了，不管了，反正先这么写着了
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i -g pm2 concurrently peer

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app /pnpm
USER nextjs

EXPOSE ${PORT}
ENV NODE_ENV production

CMD pm2-runtime start launch.sh
