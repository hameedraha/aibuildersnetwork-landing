// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    server: {
      proxy: buildDevRegistrationProxy(),
    },
  },
});

/** @returns {Record<string, import('vite').ProxyOptions> | undefined} */
function buildDevRegistrationProxy() {
  const webhookUrl = process.env.COMMUNITY_REGISTRATION_WEBHOOK_URL;
  if (!webhookUrl) return undefined;

  const target = new URL(webhookUrl);
  return {
    '/api/community-registration': {
      target: target.origin,
      changeOrigin: true,
      rewrite: () => target.pathname,
    },
  };
}
