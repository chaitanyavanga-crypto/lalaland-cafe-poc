import React from 'react';

/**
 * Generic shimmer block — pass a height/width/className to shape it into
 * a card, a text line, an avatar, etc. See FoodCardSkeleton for a composed example.
 */
export default function Skeleton({ height = '1rem', width = '100%', className = '', style = {} }) {
  return (
    <div
      className={`lc-skeleton ${className}`}
      style={{ height, width, ...style }}
      aria-hidden="true"
    />
  );
}

export function FoodCardSkeleton() {
  return (
    <div className="lc-food-card">
      <Skeleton height="0" style={{ paddingBottom: '75%' }} />
      <div className="p-3">
        <Skeleton height="1.1rem" width="70%" className="mb-2" />
        <Skeleton height="0.85rem" width="100%" className="mb-1" />
        <Skeleton height="0.85rem" width="60%" className="mb-3" />
        <div className="d-flex justify-content-between align-items-center">
          <Skeleton height="1.2rem" width="3rem" />
          <Skeleton height="2rem" width="5.5rem" style={{ borderRadius: '999px' }} />
        </div>
      </div>
    </div>
  );
}
