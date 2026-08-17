import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import FoodImage from '../../components/common/FoodImage';
import { buildQrPayload } from '../../utils/machineCode';

const AUTO_RETURN_SECONDS = 60;

export default function QRCodeDisplay() {
  const { itemId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETURN_SECONDS);

  // Guard against a hard refresh / direct link, where router state is gone.
  useEffect(() => {
    if (!state) {
      navigate(`/item/${itemId}`, { replace: true });
    }
  }, [state, itemId, navigate]);

  useEffect(() => {
    if (!state) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, navigate]);

  if (!state) return null;

  const { item, machineCode, codePart, optionLabels, timestamp } = state;
  const payload = buildQrPayload({ itemCode: machineCode, codePart, timestamp });

  return (
    <Container style={{ maxWidth: 640 }} className="text-center">
      <div className="lc-qr-eyebrow">Ready to Scan</div>
      <h1 className="h4 mb-1">Your {item.name}</h1>
      <p className="text-muted mb-4">Hold this screen up to the scanner on the machine&rsquo;s front panel.</p>

      <div className="lc-qr-frame mx-auto mb-4">
        <QRCodeSVG value={payload} size={256} bgColor="#ffffff" fgColor="#4a3223" level="M" />
      </div>

      <Card className="lc-card text-start">
        <Card.Body className="d-flex align-items-center gap-3">
          <div className="lc-qr-thumb">
            <FoodImage src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold">{item.name}</div>
            <div className="text-muted small mb-2">{machineCode}</div>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {optionLabels.map((label) => (
                <span className="lc-qr-tag" key={label}>{label}</span>
              ))}
            </div>
            <div className="lc-machine-panel-label mb-1">QR Payload (debug)</div>
            <div className="lc-machine-payload">{payload}</div>
          </div>
        </Card.Body>
      </Card>

      <p className="text-muted small mt-4 mb-3">Auto-returning to menu in {secondsLeft}s</p>

      <Button className="lc-generate-qr-btn w-100" onClick={() => navigate('/')}>
        New Order
      </Button>
    </Container>
  );
}
