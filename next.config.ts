import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: `
  //             default-src 'self' trusted-bear-71.accounts.dev trusted-bear-71.clerk.accounts.dev cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com *.ingest.sentry.io challenges.cloudflare.com scdn.clerk.com segapi.clerk.com;
  //             script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.accounts.dev;
  //             connect-src 'self' https://trusted-bear-71.clerk.accounts.dev;
  //             img-src 'self' https://img.clerk.com;
  //             style-src 'self' 'unsafe-inline';
  //             frame-src 'self' https://challenges.cloudflare.com;
  //             form-action 'self';
  //           `.replace(/\s{2,}/g, " ").trim(),
  //         },
  //       ],
  //     },
  //   ];
  // },
};
