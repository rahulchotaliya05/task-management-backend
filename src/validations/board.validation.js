import Joi from 'joi';

export const createBoardSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Board title is required',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Board title is required',
  }),
});

export const updateBoardSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Board title is required',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Board title is required',
  }),
});

export const addMemberSchema = Joi.object({
  userId: Joi.string().trim().required().messages({
    'any.required': 'User ID is required',
  }),
});
