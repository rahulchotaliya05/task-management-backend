import { Column, Card, Board } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const createColumn = asyncHandler(async (req, res) => {
  const { id: boardId } = req.params;
  const { title } = req.body;

  const board = await Board.findById(boardId);

  if (!board) {
    throw ApiError.notFound('Board not found');
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only board owner can create columns');
  }

  const lastColumn = await Column.findOne({ board: boardId }).sort({ position: -1 });
  const position = lastColumn ? lastColumn.position + 1 : 0;

  const column = await Column.create({
    title,
    board: boardId,
    position,
  });

  return ApiResponse.created(res, 'Column created successfully', { column });
});

export const updateColumn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, position } = req.body;

  const column = await Column.findById(id);

  if (!column) {
    throw ApiError.notFound('Column not found');
  }

  const board = await Board.findById(column.board);

  if (!board) {
    throw ApiError.notFound('Board not found');
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only board owner can update columns');
  }

  if (title !== undefined) {
    column.title = title;
  }

  if (position !== undefined) {
    column.position = position;
  }

  await column.save();

  return ApiResponse.success(res, 'Column updated successfully', { column });
});

export const deleteColumn = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const column = await Column.findById(id);

  if (!column) {
    throw ApiError.notFound('Column not found');
  }

  const board = await Board.findById(column.board);

  if (!board) {
    throw ApiError.notFound('Board not found');
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Only board owner can delete columns');
  }

  await Card.updateMany(
    { column: id, deletedAt: null },
    { deletedAt: new Date() }
  );

  column.deletedAt = new Date();
  await column.save();

  return ApiResponse.success(res, 'Column deleted successfully');
});
