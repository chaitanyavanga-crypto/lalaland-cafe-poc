const MenuService = require('../services/menu.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await MenuService.listCategories();
  res.json({ success: true, data: categories });
});

exports.getItems = asyncHandler(async (req, res) => {
  const { categoryId, search, page, limit } = req.query;
  const result = await MenuService.listItems({
    categoryId: categoryId ? Number(categoryId) : undefined,
    search,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json({ success: true, ...result });
});

exports.getItemDetail = asyncHandler(async (req, res) => {
  const item = await MenuService.getItemDetail(Number(req.params.itemId));
  res.json({ success: true, data: item });
});

exports.createItem = asyncHandler(async (req, res) => {
  const item = await MenuService.createItem(req.body);
  res.status(201).json({ success: true, data: item });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const item = await MenuService.updateItem(Number(req.params.itemId), req.body);
  res.json({ success: true, data: item });
});

exports.toggleAvailability = asyncHandler(async (req, res) => {
  const item = await MenuService.toggleAvailability(Number(req.params.itemId), req.body.isAvailable);
  res.json({ success: true, data: item });
});

exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image file was uploaded');
  const imageUrl = `/uploads/menu/${req.file.filename}`;
  const item = await MenuService.updateItem(Number(req.params.itemId), { image_url: imageUrl });
  res.json({ success: true, data: item });
});
