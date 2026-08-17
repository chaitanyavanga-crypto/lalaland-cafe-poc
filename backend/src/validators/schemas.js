const Joi = require('joi');

exports.registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{7,20}$/).allow('', null),
  password: Joi.string().min(8).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

exports.resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

exports.placeOrderSchema = Joi.object({
  tableId: Joi.number().integer().allow(null),
  channel: Joi.string().valid('QR', 'WEB', 'COUNTER').required(),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).max(20).required(),
        optionValueIds: Joi.array().items(Joi.number().integer()).default([]),
      })
    )
    .min(1)
    .required(),
});

exports.updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED').required(),
});

exports.createMenuItemSchema = Joi.object({
  categoryId: Joi.number().integer().required(),
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().allow('', null),
  basePrice: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().allow('', null),
  isCustomizable: Joi.boolean().default(true),
});

exports.restockSchema = Joi.object({
  quantity: Joi.number().positive().required(),
});
