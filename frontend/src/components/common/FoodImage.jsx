import React, { useState } from 'react';

/**
 * Image with a guaranteed-to-render fallback. If `src` is missing or fails
 * to load (broken URL, offline, etc.), this swaps to an inline SVG data URI
 * generated on the fly — no network request, so it can never itself 404.
 * This is what satisfies "no product card should show a broken image."
 */
function placeholderDataUri(label) {
  const initials = (label || 'Lalaland Cafe')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e8f0ea"/>
          <stop offset="100%" stop-color="#f3e9dc"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#g)"/>
      <circle cx="300" cy="190" r="70" fill="#6f4e37" opacity="0.15"/>
      <text x="300" y="205" font-family="Segoe UI, sans-serif" font-size="48" font-weight="700"
            fill="#6f4e37" text-anchor="middle">${initials}</text>
      <text x="300" y="320" font-family="Segoe UI, sans-serif" font-size="20" fill="#7a6a5f" text-anchor="middle">
        Image unavailable
      </text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function FoodImage({ src, alt, className = '', style = {} }) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? placeholderDataUri(alt) : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
