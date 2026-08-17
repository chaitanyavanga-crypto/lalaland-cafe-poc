const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/menu', require('./menu.routes'));
router.use('/orders', require('./order.routes'));
router.use('/inventory', require('./inventory.routes'));

router.get('/health', (req, res) => res.json({ success: true, status: 'UP', timestamp: new Date().toISOString() }));

module.exports = router;
