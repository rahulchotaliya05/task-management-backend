import { Board } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const isOwner = asyncHandler(async (req, res, next) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    throw ApiError.notFound('Board not found');
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only board owner can perform this action');
  }

  req.board = board;
  next();
});

export const isMember = asyncHandler(async (req, res, next) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    throw ApiError.notFound('Board not found');
  }

  const isOwner = board.owner.toString() === req.user._id.toString();
  const isMember = board.members.some(
    (member) => member.toString() === req.user._id.toString()
  );

  if (!isOwner && !isMember) {
    throw ApiError.forbidden('You are not a member of this board');
  }

  req.board = board;
  next();
});
