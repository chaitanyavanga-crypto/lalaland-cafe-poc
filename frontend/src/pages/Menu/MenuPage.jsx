import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { fetchCategories, fetchItems } from '../../redux/slices/menuSlice';
import useDebounce from '../../hooks/useDebounce';
import HeroBanner from '../../components/layout/HeroBanner';
import FoodCard from '../../components/common/FoodCard';
import { FoodCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export default function MenuPage() {
  const dispatch = useDispatch();
  const { categories, items, status, error } = useSelector((state) => state.menu);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchItems({ search: debouncedSearch, categoryId, page: 1, limit: 20 }));
  }, [dispatch, debouncedSearch, categoryId]);

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <Container>
      <HeroBanner />

      <div className="lc-subheader mb-4">
        <Form.Group className="mb-3" controlId="menuSearch">
          <Form.Label visuallyHidden>Search drinks</Form.Label>
          <Form.Control
            type="search"
            size="lg"
            placeholder="Search for milk tea, matcha, coffee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-pill"
          />
        </Form.Group>

        <div className="lc-category-scroll" role="tablist" aria-label="Menu categories">
          <Button
            variant={categoryId === null ? 'primary' : 'outline-secondary'}
            className="lc-category-chip"
            role="tab"
            aria-selected={categoryId === null}
            onClick={() => setCategoryId(null)}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c.category_id}
              variant={categoryId === c.category_id ? 'primary' : 'outline-secondary'}
              className="lc-category-chip"
              role="tab"
              aria-selected={categoryId === c.category_id}
              onClick={() => setCategoryId(c.category_id)}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      {status === 'failed' ? (
        <EmptyState
          icon="⚠️"
          title="Couldn't load the menu"
          message={error || 'Something went wrong talking to the server.'}
          actionLabel="Retry"
          onAction={() => dispatch(fetchItems({ search: debouncedSearch, categoryId, page: 1, limit: 20 }))}
        />
      ) : isLoading ? (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Col key={i}><FoodCardSkeleton /></Col>
          ))}
        </Row>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No drinks found"
          message="Try a different search term or category."
        />
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4 pb-4">
          {items.map((item) => (
            <Col key={item.item_id}>
              <FoodCard item={item} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
