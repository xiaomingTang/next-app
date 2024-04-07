# docker build -t next-app .
# docker build -t next-app --progress plain .
# docker run -itdp 3000:3000 next-app

FROM ubuntu_with_node_20 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV HUSKY 0
RUN corepack enable pnpm

ARG NEXT_PUBLIC_LAST_COMMIT_MESSAGE
ENV NEXT_PUBLIC_LAST_COMMIT_MESSAGE=${NEXT_PUBLIC_LAST_COMMIT_MESSAGE}

WORKDIR /app

FROM base AS builder
COPY . /app
COPY .env.deploy.local /app/.env.local
RUN echo \\nNEXT_PUBLIC_LAST_COMMIT_MESSAGE=${NEXT_PUBLIC_LAST_COMMIT_MESSAGE}\\n >> /app/.env.local
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ENV NODE_ENV production
RUN pnpm run build

FROM base AS runner
RUN mkdir .next
COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/.env.local ./
COPY --from=builder /app/public ./public
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 为提取至宿主机做准备，如果不需要提取到宿主机，可以注释掉这一部分
COPY ./.ssl ./.ssl
COPY ./.bak ./.bak
COPY ./ci ./ci
COPY ./launch.sh ./
RUN sudo apt-get install -y zip
ARG ZIP_PATH=/app/app.zip
RUN zip -r -q ${ZIP_PATH} .
RUN sudo apt-get remove -y zip
# END: 为提取至宿主机做准备，如果不需要提取到宿主机，可以注释掉这一部分

RUN pnpm i -g pm2 concurrently peer

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

CMD pm2-runtime start launch.sh
