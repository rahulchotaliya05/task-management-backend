import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await User.create({ name, email, password });

  return ApiResponse.created(res, 'User registered successfully. Please login.', {
    user: user.convertToJSON(),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await saveRefreshToken(user._id, refreshToken);
  setRefreshTokenCookie(res, refreshToken);

  return ApiResponse.success(res, 'Login successful', {
    user: user.convertToJSON(),
    accessToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw ApiError.unauthorized('Refresh token not found');
  }

  const storedToken = await RefreshToken.findOne({ token });

  if (!storedToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  await RefreshToken.deleteOne({ _id: storedToken._id });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await saveRefreshToken(user._id, refreshToken);
  setRefreshTokenCookie(res, refreshToken);

  return ApiResponse.success(res, 'Token refreshed successfully', {
    accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await RefreshToken.deleteOne({ token });
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return ApiResponse.success(res, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 'User profile fetched', {
    user: req.user.convertToJSON(),
  });
});
