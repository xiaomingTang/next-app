import { ENV_CONFIG } from '@/config'

import Script from 'next/script'

export function GA() {
  const { appEnv, nodeEnv } = ENV_CONFIG.public
  const gaId = process.env.GA_ID
  if (appEnv === 'production' && nodeEnv === 'production' && gaId) {
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
        <Script id='google-analytics'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
   
            gtag('config', '${gaId}');
          `}
        </Script>
      </>
    )
  }
  return <></>
}
