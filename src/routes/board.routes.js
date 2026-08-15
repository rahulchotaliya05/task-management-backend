import { Router } from 'express';
import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
} from '../controllers/board.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { isOwner, isMember } from '../middlewares/board.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createBoardSchema, updateBoardSchema, addMemberSchema } from '../validations/board.validation.js';

const router = Router();

router.use(protect);

router.post('/', requireRole('admin'), validate(createBoardSchema), createBoard);
router.get('/', getBoards);
router.get('/:id', isMember, getBoardById);
router.patch('/:id', requireRole('admin'), isOwner, validate(updateBoardSchema), updateBoard);
router.delete('/:id', requireRole('admin'), isOwner, deleteBoard);
router.post('/:id/members', requireRole('admin'), isOwner, validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', requireRole('admin'), isOwner, removeMember);

export default router;
