const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

// Controllers stay thin: parse request, delegate to service, shape response.
exports.register = asyncHandler(async (req, res) => {
  const user = await AuthService.register(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

exports.refresh = asyncHandler(async (req, res) => {
  const result = await AuthService.refresh(req.body);
  res.status(200).json({ success: true, data: result });
});

exports.logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.body);
  res.status(204).send();
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  await AuthService.forgotPassword(req.body.email);
  // Generic response regardless of outcome — see AuthService.forgotPassword for why.
  res.status(200).json({ success: true, message: 'If that email exists, reset instructions have been sent.' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  await AuthService.resetPassword(req.body);
  res.status(200).json({ success: true, message: 'Password updated successfully.' });
});
