import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { fetchItemDetail, clearSelectedItem } from '../../redux/slices/menuSlice';
import { addLine } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import FoodImage from '../../components/common/FoodImage';
import { useCartDrawer } from '../../context/CartDrawerContext';
import {
  getItemMachineCode,
  getSelectionCodes,
  joinSelectionCodes,
  buildQrPayload,
} from '../../utils/machineCode';

export default function DrinkCustomize() {
  const { itemId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openCartDrawer } = useCartDrawer();
  const item = useSelector((state) => state.menu.selectedItem);
  const itemDetailStatus = useSelector((state) => state.menu.itemDetailStatus);
  const itemDetailError = useSelector((state) => state.menu.itemDetailError);
  const [selections, setSelections] = useState({}); // optionGroupId -> [optionValueId,...]
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchItemDetail(itemId));
    return () => dispatch(clearSelectedItem());
  }, [dispatch, itemId]);

  // Pre-select the first value of every single-select group so the machine
  // code panel and QR preview always have something to show, mirroring the
  // kiosk's default state (Normal Sweet / Standard Ice / Small already chosen).
  useEffect(() => {
    if (!item?.optionGroups) return;
    setSelections((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const group of item.optionGroups) {
        if (group.maxSelectable === 1 && !next[group.optionGroupId]?.length && group.values?.length) {
          next[group.optionGroupId] = [group.values[0].optionValueId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [item]);

  const totalPrice = useMemo(() => {
    if (!item) return 0;
    let price = Number(item.base_price);
    if (item.optionGroups) {
      for (const group of item.optionGroups) {
        for (const valueId of selections[group.optionGroupId] || []) {
          const val = group.values.find((v) => v.optionValueId === valueId);
          if (val) price += val.priceDelta;
        }
      }
    }
    return price * quantity;
  }, [item, selections, quantity]);

  const machineCode = useMemo(() => getItemMachineCode(item), [item]);
  const selectionCodes = useMemo(() => getSelectionCodes(item, selections), [item, selections]);
  const codePart = useMemo(() => joinSelectionCodes(selectionCodes), [selectionCodes]);
  const payloadPreview = useMemo(
    () => buildQrPayload({ itemCode: machineCode || '------', codePart, timestamp: null }),
    [machineCode, codePart]
  );

  const handleSelect = (group, valueId) => {
    setSelections((prev) => {
      const current = prev[group.optionGroupId] || [];
      if (group.maxSelectable === 1) {
        return { ...prev, [group.optionGroupId]: [valueId] };
      }
      const exists = current.includes(valueId);
      const next = exists ? current.filter((v) => v !== valueId) : [...current, valueId];
      if (next.length > group.maxSelectable) return prev; // respect max-selectable business rule
      return { ...prev, [group.optionGroupId]: next };
    });
  };

  const getMissingRequired = () =>
    (item.optionGroups || []).find(
      (g) => g.isRequired && (!selections[g.optionGroupId] || selections[g.optionGroupId].length === 0)
    );

  const selectedOptionLabels = () =>
    (item.optionGroups || [])
      .flatMap((g) => g.values.filter((v) => (selections[g.optionGroupId] || []).includes(v.optionValueId)))
      .map((v) => v.label);

  const handleAddToCart = () => {
    const missingRequired = getMissingRequired();
    if (missingRequired) {
      toast.error(`Please select ${missingRequired.name}`);
      return;
    }

    const optionValueIds = Object.values(selections).flat();
    const optionLabels = selectedOptionLabels();

    dispatch(
      addLine({
        itemId: item.item_id,
        name: item.name,
        quantity,
        unitPrice: totalPrice / quantity,
        optionValueIds,
        optionLabels,
      })
    );
    toast.success(`${item.name} added to cart`);
    openCartDrawer();
  };

  const handleGenerateQrCode = () => {
    const missingRequired = getMissingRequired();
    if (missingRequired) {
      toast.error(`Please select ${missingRequired.name}`);
      return;
    }

    navigate(`/item/${item.item_id}/qr`, {
      state: {
        item: {
          item_id: item.item_id,
          name: item.name,
          image_url: item.image_url,
        },
        machineCode,
        codePart,
        optionLabels: selectedOptionLabels(),
        timestamp: Date.now(),
      },
    });
  };

  if (itemDetailStatus === 'failed') {
    return (
      <Container style={{ maxWidth: 640 }}>
        <EmptyState
          icon="⚠️"
          title="Couldn't load this drink"
          message={itemDetailError || 'Is the backend API running and reachable?'}
          actionLabel="Try again"
          onAction={() => dispatch(fetchItemDetail(itemId))}
        />
        <div className="text-center">
          <Link to="/">Back to menu</Link>
        </div>
      </Container>
    );
  }

  if (!item) return <Loader label="Loading drink details..." />;

  return (
    <Container style={{ maxWidth: 640 }}>
      <Card className="lc-card">
        <div className="lc-food-card-img-wrap" style={{ aspectRatio: '16 / 9' }}>
          <FoodImage src={item.image_url} alt={item.name} />
        </div>
        <Card.Body>
          <Card.Title as="h1" className="h4 text-center">{item.name}</Card.Title>
          {item.description && <Card.Text className="text-muted text-center">{item.description}</Card.Text>}

          {(item.optionGroups || []).map((group) => (
            <fieldset key={group.optionGroupId} className="mb-3">
              <legend className="lc-option-legend">
                {group.name} {group.isRequired && <span className="text-danger">*</span>}
              </legend>
              <div className="lc-option-grid">
                {group.values.map((val) => {
                  const checked = (selections[group.optionGroupId] || []).includes(val.optionValueId);
                  return (
                    <button
                      type="button"
                      key={val.optionValueId}
                      className={`lc-option-pill${checked ? ' lc-option-pill-selected' : ''}`}
                      aria-pressed={checked}
                      onClick={() => handleSelect(group, val.optionValueId)}
                    >
                      {val.label}
                      {val.priceDelta ? ` (+${formatCurrency(val.priceDelta)})` : ''}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <Form.Group className="mb-3" style={{ maxWidth: 140 }} controlId="quantity">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={20}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </Form.Group>

          {/* ---------- Machine code panel ---------- */}
          <div className="lc-machine-panel mb-3">
            <div className="lc-machine-panel-header">
              <span className="lc-machine-panel-label">Machine Code</span>
              <span className="lc-machine-badge">{machineCode || '------'}</span>
            </div>
            <div className="lc-machine-codes-row">
              {selectionCodes.map(({ groupId, group, code }) => (
                <div className="lc-machine-code-box" key={groupId}>
                  <div className="lc-machine-code-label">{group.name}</div>
                  <div className="lc-machine-code-value">{code || '---'}</div>
                </div>
              ))}
            </div>
            <div className="lc-machine-panel-label mt-3 mb-1">QR Payload Format</div>
            <div className="lc-machine-payload">{payloadPreview}</div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <strong className="fs-5">{formatCurrency(totalPrice)}</strong>
            <Button onClick={handleAddToCart} variant="outline-primary" className="rounded-pill px-4">
              Add to Cart
            </Button>
          </div>

          <Button onClick={handleGenerateQrCode} className="lc-generate-qr-btn w-100">
            Generate QR Code
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
