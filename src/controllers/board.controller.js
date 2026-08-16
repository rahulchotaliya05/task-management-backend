import { Board, User, Column, Card } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const createBoard = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const board = await Board.create({
    title,
    owner: req.user._id,
  });

  return ApiResponse.created(res, 'Board created successfully', { board });
});

export const getBoards = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const query = {
    deletedAt: null,
    $or: [
      { owner: req.user._id },
      { members: req.user._id },
    ],
  };

  if (search && search.trim()) {
    query.title = { $regex: search.trim(), $options: 'i' };
  }

  const boards = await Board.find(query)
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, 'Boards fetched successfully', { boards });
});

export const getBoardById = asyncHandler(async (req, res) => {
  const board = await Board.findOne({ _id: req.params.id, deletedAt: null })
    .populate('owner', 'name email')
    .populate('members', 'name email');

  if (!board) {
    throw ApiError.notFound('Board not found');
  }

  const columns = await Column.find({ board: board._id }).sort({ position: 1 });

  const cards = await Card.find({ board: board._id, deletedAt: null })
    .populate('assignee', 'name email')
    .sort({ position: 1 });

  return ApiResponse.success(res, 'Board fetched successfully', {
    board,
    columns,
    cards,
  });
});

export const updateBoard = asyncHandler(async (req, res) => {
  const { title } = req.body;

  req.board.title = title;
  await req.board.save();

  return ApiResponse.success(res, 'Board updated successfully', { board: req.board });
});

export const deleteBoard = asyncHandler(async (req, res) => {
  req.board.deletedAt = new Date();
  await req.board.save();

  return ApiResponse.success(res, 'Board deleted successfully');
});

export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (req.board.owner.toString() === userId) {
    throw ApiError.badRequest('Owner cannot be added as a member');
  }

  const alreadyMember = req.board.members.some(
    (member) => member.toString() === userId
  );

  if (alreadyMember) {
    throw ApiError.conflict('User is already a member of this board');
  }

  req.board.members.push(userId);
  await req.board.save();

  const board = await Board.findById(req.board._id)
    .populate('owner', 'name email')
    .populate('members', 'name email');

  return ApiResponse.success(res, 'Member added successfully', { board });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const isMember = req.board.members.some(
    (member) => member.toString() === userId
  );

  if (!isMember) {
    throw ApiError.notFound('User is not a member of this board');
  }

  req.board.members = req.board.members.filter(
    (member) => member.toString() !== userId
  );
  await req.board.save();

  const board = await Board.findById(req.board._id)
    .populate('owner', 'name email')
    .populate('members', 'name email');

  return ApiResponse.success(res, 'Member removed successfully', { board });
});
