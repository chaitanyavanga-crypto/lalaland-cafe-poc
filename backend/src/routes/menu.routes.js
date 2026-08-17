const express = require('express');
const router = express.Router();
const controller = require('../controllers/menu.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { createMenuItemSchema } = require('../validators/schemas');

// Public: browsing the menu (customer-facing, QR ordering flow)
router.get('/categories', controller.getCategories);
router.get('/items', controller.getItems);
router.get('/items/:itemId', controller.getItemDetail);

// Staff-only: menu management
router.post('/items', authenticate, authorize('ADMIN', 'MANAGER'), validate(createMenuItemSchema), controller.createItem);
router.put('/items/:itemId', authenticate, authorize('ADMIN', 'MANAGER'), controller.updateItem);
router.patch('/items/:itemId/availability', authenticate, authorize('ADMIN', 'MANAGER', 'BARISTA'), controller.toggleAvailability);
router.post(
  '/items/:itemId/image',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  upload.single('image'),
  controller.uploadImage
);

module.exports = router;
