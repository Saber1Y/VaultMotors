import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="VaultMotors - The premium Sonic-powered car marketplace. Buy, sell, and trade luxury vehicles with instant finality and ultra-low fees."
        />
        <meta
          name="keywords"
          content="car marketplace, blockchain cars, Sonic, NFT vehicles, luxury cars, decentralized trading"
        />
        <meta name="author" content="VaultMotors" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="VaultMotors - Sonic-Powered Car Marketplace" />
        <meta
          property="og:description"
          content="The premium blockchain car marketplace with instant finality and ultra-low fees."
        />
        <meta property="og:image" content="/images/assets/hero-banner.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="VaultMotors - Sonic-Powered Car Marketplace" />
        <meta
          property="twitter:description"
          content="The premium blockchain car marketplace with instant finality and ultra-low fees."
        />
        <meta property="twitter:image" content="/images/assets/hero-banner.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-gradient-to-r from-gray-900 to-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
