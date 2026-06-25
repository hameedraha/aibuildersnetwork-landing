import {
  handleCertificateVerificationRequest,
  loadCertificateRegistry,
} from '../../lib/certificate-verification.ts';
import registryData from '../../src/data/workshop-certificates.json';

const registry = loadCertificateRegistry(registryData);

export async function onRequestPost({
  request,
}: {
  request: Request;
}): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ valid: false, reason: 'format' }, { status: 400 });
  }

  return handleCertificateVerificationRequest(body, registry);
}
