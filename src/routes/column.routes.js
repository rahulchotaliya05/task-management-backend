import { Router } from 'express';
import { createColumn, updateColumn, deleteColumn } from '../controllers/column.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createColumnSchema, updateColumnSchema } from '../validations/column.validation.js';

const router = Router();

router.use(protect);

router.post('/boards/:id/columns', validate(createColumnSchema), createColumn);
router.patch('/columns/:id', validate(updateColumnSchema), updateColumn);
router.delete('/columns/:id', deleteColumn);

export default router;
