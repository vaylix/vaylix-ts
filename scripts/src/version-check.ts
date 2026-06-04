import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import semver from "semver";

type PackageManifest = {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
};

async function main(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, "../..");

  const rootPackage = await readPackage(rootDir, "package.json");
  const clientPackage = await readPackage(rootDir, "packages/client/package.json");
  const playgroundApiPackage = await readPackage(rootDir, "apps/playground-api/package.json");
  const playgroundSharedPackage = await readPackage(rootDir, "apps/playground-shared/package.json");
  const playgroundWebPackage = await readPackage(rootDir, "apps/playground-web/package.json");

  const rootVersion = requireValidSemver(rootPackage.name, rootPackage.version);
  const clientVersion = requireValidSemver(clientPackage.name, clientPackage.version);
  const playgroundApiVersion = requireValidSemver(
    playgroundApiPackage.name,
    playgroundApiPackage.version,
  );
  const playgroundSharedVersion = requireValidSemver(
    playgroundSharedPackage.name,
    playgroundSharedPackage.version,
  );
  const playgroundWebVersion = requireValidSemver(
    playgroundWebPackage.name,
    playgroundWebPackage.version,
  );

  assertEqualVersion(rootPackage.name, rootVersion, clientPackage.name, clientVersion);
  assertEqualVersion(rootPackage.name, rootVersion, playgroundApiPackage.name, playgroundApiVersion);
  assertEqualVersion(
    rootPackage.name,
    rootVersion,
    playgroundSharedPackage.name,
    playgroundSharedVersion,
  );
  assertEqualVersion(rootPackage.name, rootVersion, playgroundWebPackage.name, playgroundWebVersion);

  assertWorkspaceDependency(playgroundApiPackage, "@vaylix/client");
  assertWorkspaceDependency(playgroundApiPackage, "@vaylix/playground-shared");
  assertWorkspaceDependency(playgroundWebPackage, "@vaylix/playground-shared");

  process.stdout.write(
    [
      `root: ${rootPackage.name}@${rootVersion}`,
      `client: ${clientPackage.name}@${clientVersion}`,
      `playground-api: ${playgroundApiPackage.name}@${playgroundApiVersion}`,
      `playground-shared: ${playgroundSharedPackage.name}@${playgroundSharedVersion}`,
      `playground-web: ${playgroundWebPackage.name}@${playgroundWebVersion}`,
    ].join("\n") + "\n",
  );
}

async function readPackage(rootDir: string, relativePath: string): Promise<PackageManifest> {
  const contents = await readFile(path.join(rootDir, relativePath), "utf8");
  return JSON.parse(contents) as PackageManifest;
}

function requireValidSemver(packageName: string, version: string): string {
  if (typeof version !== "string" || semver.valid(version) === null) {
    throw new Error(`${packageName} has invalid semver version: ${String(version)}`);
  }
  return version;
}

function assertEqualVersion(
  leftName: string,
  leftVersion: string,
  rightName: string,
  rightVersion: string,
): void {
  if (leftVersion !== rightVersion) {
    throw new Error(`${leftName}@${leftVersion} does not match ${rightName}@${rightVersion}`);
  }
}

function assertWorkspaceDependency(pkg: PackageManifest, dependencyName: string): void {
  const dependencyVersion = pkg.dependencies?.[dependencyName];
  if (dependencyVersion === undefined) {
    throw new Error(`${pkg.name} must depend on ${dependencyName}`);
  }

  if (dependencyVersion !== "workspace:*") {
    throw new Error(
      `${pkg.name} must depend on ${dependencyName}@workspace:*, found ${dependencyVersion}`,
    );
  }
}

void main();
