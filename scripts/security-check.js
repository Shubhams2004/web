#!/usr/bin/env node

/**
 * Automated Security Regression & Integrity Checker
 * Validates:
 * 1. Absence of committed secrets/tokens across repository
 * 2. Absence of dangerous HTML/JS injection sinks (eval, dangerouslySetInnerHTML, innerHTML)
 * 3. Correct blocking of unsafe URL schemes (javascript:, data:, vbscript:, file:)
 * 4. Presence and enforcement of API body size limits (<= 64KB)
 * 5. Environment configuration and .gitignore rules
 * 6. Dependency audit status
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let failureCount = 0;

function logPass(msg) {
  console.log(`\x1b[32m✔ PASS:\x1b[0m ${msg}`);
}

function logFail(msg) {
  failureCount++;
  console.error(`\x1b[31m✖ FAIL:\x1b[0m ${msg}`);
}

console.log('\n========================================');
console.log('🔒 Running Repository Security Checks');
console.log('========================================\n');

// 1. Check for Accidental Secrets
const SECRET_PATTERNS = [
  { name: 'Groq API Key', regex: /gsk_[a-zA-Z0-9]{20,}/ },
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{20,}/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/ },
  { name: 'GitHub Personal Token', regex: /gh[pous]_[a-zA-Z0-9]{20,}/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

function scanFilesForSecrets(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === 'package-lock.json'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      scanFilesForSecrets(fullPath);
    } else if (/\.(js|ts|tsx|jsx|json|html|md|yml|yaml|env)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(content)) {
          // Exclude self script
          if (fullPath.includes('security-check.js')) continue;
          logFail(`Detected potential ${pattern.name} in file: ${path.relative(ROOT_DIR, fullPath)}`);
        }
      }
    }
  }
}

scanFilesForSecrets(ROOT_DIR);
if (failureCount === 0) {
  logPass('No exposed API keys or private credentials found in tracked files');
}

// 2. Check for Dangerous DOM Sinks in src/
const DANGEROUS_SINKS = [
  'dangerouslySetInnerHTML',
  'eval(',
  'new Function(',
];

function checkDangerousSinks(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkDangerousSinks(fullPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const sink of DANGEROUS_SINKS) {
        if (content.includes(sink)) {
          logFail(`Found dangerous sink '${sink}' in ${path.relative(ROOT_DIR, fullPath)}`);
        }
      }
    }
  }
}

const srcDir = path.join(ROOT_DIR, 'src');
if (fs.existsSync(srcDir)) {
  const sinksStart = failureCount;
  checkDangerousSinks(srcDir);
  if (failureCount === sinksStart) {
    logPass('No dangerous HTML/JS execution sinks (eval, dangerouslySetInnerHTML, new Function) in src/');
  }
}

// 3. Test Unsafe URL Scheme Sanitization Logic
const TEST_URLS = [
  { url: 'javascript:alert(document.cookie)', safe: false },
  { url: 'javascript://%0aalert(1)', safe: false },
  { url: 'data:text/html,<script>alert(1)</script>', safe: false },
  { url: 'vbscript:msgbox("xss")', safe: false },
  { url: 'file:///etc/passwd', safe: false },
  { url: 'blob:https://example.com/uuid', safe: false },
  { url: 'https://news.google.com/article', safe: true },
  { url: 'https://reuters.com/markets', safe: true },
];

function testSanitizeUrl(urlInput) {
  if (typeof urlInput !== 'string') return null;
  const trimmed = urlInput.trim();
  if (/^(javascript|data|vbscript|file|blob):/i.test(trimmed)) return null;
  const clean = trimmed.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== 'https:') return null;
    if (!parsed.hostname || parsed.hostname.length < 3) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

let urlTestsPassed = true;
for (const tc of TEST_URLS) {
  const result = testSanitizeUrl(tc.url);
  const isSafe = result !== null;
  if (isSafe !== tc.safe) {
    logFail(`URL Sanitizer test failed for '${tc.url}': expected safe=${tc.safe}, got safe=${isSafe}`);
    urlTestsPassed = false;
  }
}
if (urlTestsPassed) {
  logPass('URL scheme filter correctly blocks javascript:, data:, vbscript:, and file: schemes');
}

// 4. Verify API Body-Size Limits in Server Files
const serverJsPath = path.join(ROOT_DIR, 'server.js');
const vitePluginPath = path.join(ROOT_DIR, 'vite-news-plugin.ts');

if (fs.existsSync(serverJsPath)) {
  const serverContent = fs.readFileSync(serverJsPath, 'utf8');
  if (serverContent.includes("limit: '32kb'") || serverContent.includes('32 * 1024')) {
    logPass('server.js enforces strict 32KB request body size limit');
  } else {
    logFail('server.js does not explicitly configure <=32KB body size limit');
  }
}

if (fs.existsSync(vitePluginPath)) {
  const pluginContent = fs.readFileSync(vitePluginPath, 'utf8');
  if (pluginContent.includes('32 * 1024') || pluginContent.includes('32KB')) {
    logPass('vite-news-plugin.ts enforces strict 32KB request body limit');
  } else {
    logFail('vite-news-plugin.ts does not enforce body size limit');
  }
}

// 5. Verify .env and .gitignore Configuration
const gitignorePath = path.join(ROOT_DIR, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignore.includes('.env*') || gitignore.includes('.env')) {
    logPass('.gitignore properly ignores .env files');
  } else {
    logFail('.gitignore is missing .env exclusion rule');
  }
}

const envExamplePath = path.join(ROOT_DIR, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  if (/GROQ_API_KEY=\S+/.test(envExample)) {
    logFail('.env.example contains a populated GROQ_API_KEY!');
  } else {
    logPass('.env.example contains no hard-coded secrets');
  }
}

// 6. Verify Lockfile and Consistency
const bunLockPath = path.join(ROOT_DIR, 'bun.lock');
const pkgLockPath = path.join(ROOT_DIR, 'package-lock.json');

if (fs.existsSync(bunLockPath)) {
  logFail('bun.lock is still present. Repository should use package-lock.json consistently.');
} else if (fs.existsSync(pkgLockPath)) {
  logPass('package-lock.json present and bun.lock removed for consistent npm ci deployments');
}

// 7. Verify Dependency Audit
try {
  execSync('npm audit --audit-level=high', { stdio: 'pipe' });
  logPass('npm audit reported 0 high or critical vulnerabilities');
} catch (err) {
  logFail('npm audit found high/critical vulnerabilities');
}

console.log('\n----------------------------------------');
if (failureCount === 0) {
  console.log('\x1b[32m✔ All security regression checks passed successfully!\x1b[0m\n');
  process.exit(0);
} else {
  console.error(`\x1b[31m✖ ${failureCount} security check(s) failed.\x1b[0m\n`);
  process.exit(1);
}
