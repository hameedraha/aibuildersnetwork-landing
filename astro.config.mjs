// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  handleCertificateVerificationRequest,
  loadCertificateRegistry,
} from './lib/certificate-verification.ts';
import {
  COMMUNITY_REGISTRATION_WEBHOOK_URL,
  forwardRegistration,
  parseRegistrationBody,
} from './lib/community-registration.ts';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [communityRegistrationDevPlugin(), certificateVerificationDevPlugin()],
  },
});

function communityRegistrationDevPlugin() {
  return {
    name: 'community-registration-dev',
    configureServer(server) {
      server.middlewares.use('/api/community-registration', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
          const parsed = parseRegistrationBody(body);

          if (!parsed.ok) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'validation failed' }));
            return;
          }

          const response = await forwardRegistration(
            COMMUNITY_REGISTRATION_WEBHOOK_URL,
            parsed.payload
          );
          const payload = await response.json();

          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
        } catch {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'upstream error' }));
        }
      });
    },
  };
}

function loadDevCertificateRegistry() {
  const jsonPath = join(process.cwd(), 'src/data/workshop-certificates.json');
  const raw = readFileSync(jsonPath, 'utf-8');
  return loadCertificateRegistry(JSON.parse(raw));
}

function certificateVerificationDevPlugin() {
  return {
    name: 'certificate-verification-dev',
    configureServer(server) {
      server.middlewares.use('/api/workshop-certificate', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
          const registry = loadDevCertificateRegistry();
          const response = handleCertificateVerificationRequest(body, registry);
          const payload = await response.json();

          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ valid: false, reason: 'not_found' }));
        }
      });
    },
  };
}
