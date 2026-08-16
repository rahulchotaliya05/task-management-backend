import mongoose from 'mongoose';
import { Card, Column, Board } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { emitToBoard } from '../socket/index.js';

const verifyBoardMembership = async (boardId, userId) => {
  const board = await Board.findById(boardId);

  if (!board) {
    throw ApiError.notFound('Board not found');
  }

  const isOwner = board.owner.toString() === userId.toString();
  const isMember = board.members.some(
    (member) => member.toString() === userId.toString()
  );

  if (!isOwner && !isMember) {
    throw ApiError.forbidden('You are not a member of this board');
  }

  return board;
};

export const createCard = asyncHandler(async (req, res) => {
  const { id: columnId } = req.params;
  const { title, description, assignee, dueDate, priority } = req.body;

  const column = await Column.findById(columnId);

  if (!column) {
    throw ApiError.notFound('Column not found');
  }

  await verifyBoardMembership(column.board, req.user._id);

  const lastCard = await Card.findOne({ column: columnId, deletedAt: null }).sort({ position: -1 });
  const position = lastCard ? lastCard.position + 1 : 0;

  const card = await Card.create({
    title,
    description: description || '',
    assignee: assignee || null,
    dueDate: dueDate || null,
    priority: priority || 'medium',
    column: columnId,
    board: column.board,
    position,
  });

  const populatedCard = await Card.findById(card._id).populate('assignee', 'name email');

  emitToBoard(column.board.toString(), 'card:created', { card: populatedCard });

  return ApiResponse.created(res, 'Card created successfully', { card: populatedCard });
});

export const updateCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, assignee, dueDate, priority } = req.body;

  const card = await Card.findById(id);

  if (!card) {
    throw ApiError.notFound('Card not found');
  }

  await verifyBoardMembership(card.board, req.user._id);

  if (title !== undefined) card.title = title;
  if (description !== undefined) card.description = description;
  if (assignee !== undefined) card.assignee = assignee || null;
  if (dueDate !== undefined) card.dueDate = dueDate || null;
  if (priority !== undefined) card.priority = priority;

  await card.save();

  const populatedCard = await Card.findById(card._id).populate('assignee', 'name email');

  emitToBoard(card.board.toString(), 'card:updated', { card: populatedCard });

  return ApiResponse.success(res, 'Card updated successfully', { card: populatedCard });
});

export const deleteCard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const card = await Card.findById(id);

  if (!card) {
    throw ApiError.notFound('Card not found');
  }

  await verifyBoardMembership(card.board, req.user._id);

  card.deletedAt = new Date();
  await card.save();

  emitToBoard(card.board.toString(), 'card:deleted', { cardId: id });

  return ApiResponse.success(res, 'Card deleted successfully');
});

export const moveCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetColumnId, position } = req.body;

  const card = await Card.findById(id);

  if (!card) {
    throw ApiError.notFound('Card not found');
  }

  await verifyBoardMembership(card.board, req.user._id);

  const targetColumn = await Column.findById(targetColumnId);

  if (!targetColumn) {
    throw ApiError.notFound('Target column not found');
  }

  if (targetColumn.board.toString() !== card.board.toString()) {
    throw ApiError.badRequest('Cannot move card to a column in a different board');
  }

  const sourceColumnId = card.column.toString();
  const isSameColumn = sourceColumnId === targetColumnId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (isSameColumn) {
      const oldPosition = card.position;

      if (position > oldPosition) {
        await Card.updateMany(
          {
            column: sourceColumnId,
            position: { $gt: oldPosition, $lte: position },
            _id: { $ne: card._id },
            deletedAt: null,
          },
          { $inc: { position: -1 } },
          { session }
        );
      } else if (position < oldPosition) {
        await Card.updateMany(
          {
            column: sourceColumnId,
            position: { $gte: position, $lt: oldPosition },
            _id: { $ne: card._id },
            deletedAt: null,
          },
          { $inc: { position: 1 } },
          { session }
        );
      }
    } else {
      await Card.updateMany(
        {
          column: sourceColumnId,
          position: { $gt: card.position },
          deletedAt: null,
        },
        { $inc: { position: -1 } },
        { session }
      );

      await Card.updateMany(
        {
          column: targetColumnId,
          position: { $gte: position },
          deletedAt: null,
        },
        { $inc: { position: 1 } },
        { session }
      );
    }

    card.column = targetColumnId;
    card.position = position;
    await card.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw ApiError.internal('Failed to move card');
  } finally {
    session.endSession();
  }

  const populatedCard = await Card.findById(card._id).populate('assignee', 'name email');

  emitToBoard(card.board.toString(), 'card:moved', {
    card: populatedCard,
    fromColumn: sourceColumnId,
    toColumn: targetColumnId,
  });

  return ApiResponse.success(res, 'Card moved successfully', { card: populatedCard });
});
