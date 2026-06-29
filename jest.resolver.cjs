/**
 * Custom Jest resolver that handles ESM-only packages (those that have
 * "type": "module" or only expose "import" export conditions).
 *
 * When the default resolver fails to find an ESM-only package,
 * this resolver falls back to the package's "main" field so that babel-jest
 * can transform the ESM source to CommonJS for the test environment.
 */
'use strict';

const path = require('path');
const fs = require('fs');

// Packages that are ESM-only and need special handling
// Map of package name to their CJS-compatible entry point relative to the package dir
const ESM_PACKAGE_ENTRY_POINTS = {
  '@octokit/rest': 'dist-src/index.js',
  '@octokit/core': 'dist-src/index.js',
  '@octokit/auth-token': 'dist-src/index.js',
  '@octokit/endpoint': 'dist-src/index.js',
  '@octokit/graphql': 'dist-src/index.js',
  '@octokit/request': 'dist-src/index.js',
  '@octokit/request-error': 'dist-src/index.js',
  '@octokit/plugin-paginate-rest': 'dist-src/index.js',
  '@octokit/plugin-request-log': 'dist-src/index.js',
  '@octokit/plugin-rest-endpoint-methods': 'dist-src/index.js',
};

/**
 * For a module request, extract the package name and optional subpath.
 * E.g., "@actions/http-client/lib/auth" -> { pkgName: "@actions/http-client", subpath: "./lib/auth" }
 */
function parseRequest(request) {
  if (request.startsWith('@')) {
    // Scoped package: @scope/name[/subpath]
    const parts = request.split('/');
    if (parts.length >= 2) {
      const pkgName = parts[0] + '/' + parts[1];
      const subpath = parts.length > 2 ? './' + parts.slice(2).join('/') : '.';
      return { pkgName, subpath };
    }
  } else {
    // Unscoped package: name[/subpath]
    const parts = request.split('/');
    const pkgName = parts[0];
    const subpath = parts.length > 1 ? './' + parts.slice(1).join('/') : '.';
    return { pkgName, subpath };
  }
  return null;
}

/**
 * Try to resolve a module by looking at the package's exports map or main field
 * directly, bypassing the OXC resolver's strict condition handling.
 */
function tryFallbackResolve(request, nodeModulesDir) {
  const parsed = parseRequest(request);
  if (!parsed) return null;

  const { pkgName, subpath } = parsed;
  const pkgDir = path.join(nodeModulesDir, pkgName);
  const pkgJsonPath = path.join(pkgDir, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) return null;

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  } catch {
    return null;
  }

  if (subpath === '.') {
    // Top-level import
    // Check our explicit map first (for packages without a main field)
    if (ESM_PACKAGE_ENTRY_POINTS[request]) {
      const entry = path.join(pkgDir, ESM_PACKAGE_ENTRY_POINTS[request]);
      if (fs.existsSync(entry)) return entry;
    }

    // Try exports map with "import" condition
    if (pkg.exports) {
      const rootExport = pkg.exports['.'];
      if (rootExport) {
        const importEntry = typeof rootExport === 'string'
          ? rootExport
          : (rootExport.import || rootExport.default);
        if (importEntry) {
          const entry = path.join(pkgDir, importEntry);
          if (fs.existsSync(entry)) return entry;
        }
      }
    }

    // Fall back to the "main" field
    if (pkg.main) {
      const mainEntry = path.join(pkgDir, pkg.main);
      if (fs.existsSync(mainEntry)) return mainEntry;
    }
  } else {
    // Subpath import (e.g., "./lib/auth")
    // Try exports map with subpath and "import" condition
    if (pkg.exports && pkg.exports[subpath]) {
      const subpathExport = pkg.exports[subpath];
      const importEntry = typeof subpathExport === 'string'
        ? subpathExport
        : (subpathExport.import || subpathExport.default);
      if (importEntry) {
        const entry = path.join(pkgDir, importEntry);
        if (fs.existsSync(entry)) return entry;
      }
    }

    // Try direct subpath resolution (e.g., /node_modules/@actions/http-client/lib/auth.js)
    for (const ext of ['', '.js', '.cjs', '.mjs']) {
      const directPath = path.join(pkgDir, subpath + ext);
      if (fs.existsSync(directPath)) return directPath;
    }
  }

  return null;
}

module.exports = (request, options) => {
  try {
    return options.defaultResolver(request, options);
  } catch {
    // Jest 30 uses OXC resolver which may throw generic errors without error codes.
    // This happens for ESM-only packages that don't have "require" or "default"
    // export conditions. Try to resolve by bypassing the strict exports map.
    const nodeModulesDir = path.join(options.rootDir, 'node_modules');
    const resolved = tryFallbackResolve(request, nodeModulesDir);
    if (resolved) return resolved;

    // Re-try with the default resolver to get the proper error message
    return options.defaultResolver(request, options);
  }
};
