import { Router } from 'express';
import { createCard, updateCard, deleteCard, moveCard } from '../controllers/card.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCardSchema, updateCardSchema, moveCardSchema } from '../validations/card.validation.js';

const router = Router();

router.use(protect);

router.post('/columns/:id/cards', validate(createCardSchema), createCard);
router.patch('/cards/:id', validate(updateCardSchema), updateCard);
router.delete('/cards/:id', deleteCard);
router.post('/cards/:id/move', validate(moveCardSchema), moveCard);

export default router;
