import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import semver from 'semver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rootPackage = await readPackage('package.json');
const clientPackage = await readPackage('packages/client/package.json');
const playgroundPackage = await readPackage('apps/playground/package.json');

const rootVersion = requireValidSemver(rootPackage.name, rootPackage.version);
const clientVersion = requireValidSemver(clientPackage.name, clientPackage.version);
const playgroundVersion = requireValidSemver(playgroundPackage.name, playgroundPackage.version);

assertEqualVersion(rootPackage.name, rootVersion, clientPackage.name, clientVersion);
assertEqualVersion(rootPackage.name, rootVersion, playgroundPackage.name, playgroundVersion);

const clientDependencyVersion = playgroundPackage.dependencies?.['@vaylix/client'];
if (clientDependencyVersion === undefined) {
  throw new Error('apps/playground must depend on @vaylix/client');
}

if (clientDependencyVersion !== clientVersion) {
  throw new Error(
    `apps/playground depends on @vaylix/client@${clientDependencyVersion}, expected ${clientVersion}`,
  );
}

process.stdout.write(
  [
    `root: ${rootPackage.name}@${rootVersion}`,
    `client: ${clientPackage.name}@${clientVersion}`,
    `playground: ${playgroundPackage.name}@${playgroundVersion}`,
  ].join('\n') + '\n',
);

async function readPackage(relativePath) {
  const contents = await readFile(path.join(rootDir, relativePath), 'utf8');
  return JSON.parse(contents);
}

function requireValidSemver(packageName, version) {
  if (typeof version !== 'string' || semver.valid(version) === null) {
    throw new Error(`${packageName} has invalid semver version: ${String(version)}`);
  }
  return version;
}

function assertEqualVersion(leftName, leftVersion, rightName, rightVersion) {
  if (leftVersion !== rightVersion) {
    throw new Error(`${leftName}@${leftVersion} does not match ${rightName}@${rightVersion}`);
  }
}
