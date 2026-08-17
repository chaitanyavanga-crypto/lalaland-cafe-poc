const OrderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');

exports.placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.userId : null; // guests can order via QR without an account
  const order = await OrderService.placeOrder({ ...req.body, userId });
  res.status(201).json({ success: true, data: order });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await OrderService.getOrderDetail(Number(req.params.orderId));
  res.json({ success: true, data: order });
});

exports.getQueue = asyncHandler(async (req, res) => {
  const queue = await OrderService.getQueue();
  res.json({ success: true, data: queue });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await OrderService.transitionStatus(Number(req.params.orderId), req.body.status);
  res.json({ success: true, data: order });
});

exports.salesReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const report = await OrderService.salesReport(from, to);
  res.json({ success: true, data: report });
});
