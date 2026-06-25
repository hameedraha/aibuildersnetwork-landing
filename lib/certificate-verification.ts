export const CERTIFICATE_ID_RE = /^CERT\/AIBN\/2026\/W01\/(?:[1-9]|[1-4]\d|50)$/;

export type CertificateRegistry = Record<string, { name: string }>;

export type VerifyCertificateResult =
  | { valid: true; name: string }
  | { valid: false; reason: 'format' | 'not_found' };

export function normalizeCertificateId(input: string): string | null {
  const normalized = input.trim().toUpperCase();
  return CERTIFICATE_ID_RE.test(normalized) ? normalized : null;
}

export function loadCertificateRegistry(data: unknown): CertificateRegistry {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid certificate registry format.');
  }

  const registry = data as CertificateRegistry;

  for (const [id, entry] of Object.entries(registry)) {
    if (!CERTIFICATE_ID_RE.test(id)) {
      throw new Error(`Invalid certificate_id in registry: ${id}`);
    }
    if (!entry || typeof entry.name !== 'string' || !entry.name.trim()) {
      throw new Error(`Invalid name for certificate_id: ${id}`);
    }
  }

  return registry;
}

export function verifyCertificate(
  input: string,
  registry: CertificateRegistry
): VerifyCertificateResult {
  const certificateId = normalizeCertificateId(input);
  if (!certificateId) {
    return { valid: false, reason: 'format' };
  }

  const entry = registry[certificateId];
  if (!entry) {
    return { valid: false, reason: 'not_found' };
  }

  return { valid: true, name: entry.name };
}

export function handleCertificateVerificationRequest(
  body: Record<string, unknown>,
  registry: CertificateRegistry
): Response {
  const certificateId = body.certificateId;
  if (typeof certificateId !== 'string' || !certificateId.trim()) {
    return Response.json({ valid: false, reason: 'format' }, { status: 400 });
  }

  const result = verifyCertificate(certificateId, registry);
  if (!result.valid) {
    return Response.json(result, { status: result.reason === 'format' ? 400 : 404 });
  }

  return Response.json(result);
}
