const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { placeOrderSchema, updateOrderStatusSchema } = require('../validators/schemas');

// Placing an order is allowed for guests (QR table ordering) as well as logged-in customers.
router.post('/', validate(placeOrderSchema), controller.placeOrder);
router.get('/:orderId', controller.getOrder);

// Staff-only: kitchen/queue operations
router.get('/', authenticate, authorize('BARISTA', 'MANAGER', 'ADMIN'), controller.getQueue);
router.patch('/:orderId/status', authenticate, authorize('BARISTA', 'MANAGER', 'ADMIN'), validate(updateOrderStatusSchema), controller.updateStatus);

// Manager/Admin-only: reporting
router.get('/reports/sales', authenticate, authorize('MANAGER', 'ADMIN'), controller.salesReport);

module.exports = router;
