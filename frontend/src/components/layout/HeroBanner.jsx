import React from 'react';
import FoodImage from '../common/FoodImage';

export default function HeroBanner() {
  return (
    <section className="lc-hero mb-4" aria-label="Lalaland Cafe introduction">
      <div className="lc-hero-content">
        <div className="lc-section-eyebrow mb-2">Handcrafted, your way</div>
        <h1 className="lc-hero-title mb-3">A true coffee<br />experience, every cup</h1>
        <p className="lc-hero-subtitle mb-0">
          Milk teas, matcha, and coffee — customize the sweetness, ice, and toppings on every cup.
          Order ahead and skip the line.
        </p>
      </div>
      <FoodImage
        src="/images/menu/lalaland-signature-matcha.jpg"
        alt="Lalaland Signature Matcha"
        className="lc-hero-image d-none d-sm-block"
      />
    </section>
  );
}
