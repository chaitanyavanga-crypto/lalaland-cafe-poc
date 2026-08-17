import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import FoodImage from './FoodImage';
import { formatCurrency } from '../../utils/formatCurrency';

export default function FoodCard({ item }) {
  return (
    <Link to={`/item/${item.item_id}`} className="lc-food-card-link">
      <div className="lc-food-card">
        <div className="lc-food-card-img-wrap">
          <FoodImage src={item.image_url} alt={item.name} />
        </div>
        <div className="p-3 d-flex flex-column flex-grow-1">
          <h3 className="h6 mb-1">{item.name}</h3>
          <p className="text-muted small flex-grow-1" style={{ minHeight: '2.5em' }}>
            {item.description}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="lc-food-card-price">{formatCurrency(item.base_price)}</span>
            <Button as="span" size="sm" variant="primary" className="rounded-pill px-3">
              Customize
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
