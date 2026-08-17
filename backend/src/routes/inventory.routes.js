const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { restockSchema } = require('../validators/schemas');

router.use(authenticate, authorize('MANAGER', 'ADMIN'));

router.get('/', controller.list);
router.get('/low-stock', controller.lowStock);
router.post('/:ingredientId/restock', validate(restockSchema), controller.restock);

module.exports = router;
