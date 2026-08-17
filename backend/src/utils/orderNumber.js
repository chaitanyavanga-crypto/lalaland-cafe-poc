/**
 * Generates a human-readable, sortable order number: LC-YYYYMMDD-#### 
 */
function generateOrderNumber(sequence) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(sequence).padStart(4, '0');
  return `LC-${y}${m}${d}-${seq}`;
}

module.exports = { generateOrderNumber };
