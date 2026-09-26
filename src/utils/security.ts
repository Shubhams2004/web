/**
 * Application Security Utility
 * Centralizes URL validation, sanitization, XSS mitigation, and safe link generation.
 */

import type { AnchorHTMLAttributes, MouseEvent } from 'react';

// Only allow safe web protocols for external resources
const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['https:']);

/**
 * Validates and normalizes an external URL.
 * Only permits valid `https://` URLs. Rejects javascript:, data:, vbscript:, etc.
 */
export function sanitizeExternalUrl(urlInput: unknown): string | null {
  if (typeof urlInput !== 'string') return null;
  const trimmed = urlInput.trim();
  if (!trimmed) return null;

  // Block obvious dangerous schemes immediately
  if (/^(javascript|data|vbscript|file|blob):/i.test(trimmed)) {
    return null;
  }

  // Remove control characters
  const clean = trimmed.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  try {
    const parsed = new URL(clean);
    if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    // Prevent host spoofing or empty host
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return null;
    }
    return parsed.toString();
  } catch {
    // If not a valid absolute URL, it's not a safe external URL
    return null;
  }
}

/**
 * Safe external link props helper.
 * Enforces `target="_blank"` and `rel="noopener noreferrer"`.
 * Returns '#' with safe inert click if URL fails validation.
 */
export function safeExternalLinkProps(urlInput: unknown): AnchorHTMLAttributes<HTMLAnchorElement> {
  const safeUrl = sanitizeExternalUrl(urlInput);
  if (!safeUrl) {
    return {
      href: '#',
      onClick: (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
      rel: 'noopener noreferrer',
      'aria-disabled': true,
    };
  }

  return {
    href: safeUrl,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

/**
 * Safely opens an external link in a new window with noopener and noreferrer.
 * Prevents execution if the URL fails validation.
 */
export function safeOpenExternal(urlInput: unknown): boolean {
  const safeUrl = sanitizeExternalUrl(urlInput);
  if (!safeUrl || typeof window === 'undefined') {
    return false;
  }

  const newWindow = window.open(safeUrl, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
    return true;
  }
  return false;
}

/**
 * Sanitizes input strings, strips control characters, and enforces length limits.
 */
export function sanitizeInputText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}
