import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const realCsv = join(root, 'data/workshop-certificates.csv');
const exampleCsv = join(root, 'data/workshop-certificates.example.csv');
const outJson = join(root, 'src/data/workshop-certificates.json');

const CERTIFICATE_ID_RE = /^CERT\/AIBN\/2026\/W01\/(?:[1-9]|[1-4]\d|50)$/;

function detectDelimiter(headerLine) {
  const tabs = (headerLine.match(/\t/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return tabs > commas ? '\t' : ',';
}

function splitRow(line, delimiter) {
  return line.split(delimiter).map((col) => col.trim());
}

function parseCheckIn(value) {
  const normalized = value.trim().toUpperCase();
  return normalized === 'TRUE' || normalized === '1' || normalized === 'YES';
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const delimiter = detectDelimiter(lines[0]);
  const header = splitRow(lines[0], delimiter).map((col) => col.toLowerCase());
  const nameIdx = header.indexOf('name');
  const checkInIdx = header.indexOf('check_in');
  const idIdx = header.indexOf('certificate_id');

  if (nameIdx === -1 || idIdx === -1) {
    throw new Error('CSV header must include: name, certificate_id');
  }

  return lines.slice(1).map((line, rowIndex) => {
    const cols = splitRow(line, delimiter);
    const name = cols[nameIdx] ?? '';
    const certificateId = (cols[idIdx] ?? '').toUpperCase();
    const checkedIn =
      checkInIdx === -1 ? true : parseCheckIn(cols[checkInIdx] ?? '');

    if (!name || !certificateId) {
      throw new Error(`Row ${rowIndex + 2}: name and certificate_id are required.`);
    }

    if (!CERTIFICATE_ID_RE.test(certificateId)) {
      throw new Error(
        `Row ${rowIndex + 2}: invalid certificate_id "${certificateId}". Expected CERT/AIBN/2026/W01/1–50.`
      );
    }

    return { name, certificateId, checkedIn };
  });
}

function buildRegistry(rows) {
  const registry = {};
  const seen = new Set();

  for (const row of rows) {
    if (!row.checkedIn) continue;

    if (seen.has(row.certificateId)) {
      throw new Error(`Duplicate certificate_id: ${row.certificateId}`);
    }
    seen.add(row.certificateId);
    registry[row.certificateId] = { name: row.name };
  }

  return registry;
}

let sourcePath = realCsv;
if (!existsSync(realCsv)) {
  sourcePath = exampleCsv;
  console.warn(
    '[build-certificates] data/workshop-certificates.csv not found — using example data.'
  );
}

const csvText = readFileSync(sourcePath, 'utf-8');
const rows = parseCsv(csvText);
const registry = buildRegistry(rows);

mkdirSync(dirname(outJson), { recursive: true });
writeFileSync(outJson, `${JSON.stringify(registry, null, 2)}\n`, 'utf-8');

console.log(`[build-certificates] wrote ${Object.keys(registry).length} entries to src/data/workshop-certificates.json`);
