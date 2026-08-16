import Joi from 'joi';

export const createColumnSchema = Joi.object({
  title: Joi.string().trim().min(1).max(50).required().messages({
    'string.min': 'Column title is required',
    'string.max': 'Title cannot exceed 50 characters',
    'any.required': 'Column title is required',
  }),
});

export const updateColumnSchema = Joi.object({
  title: Joi.string().trim().min(1).max(50).messages({
    'string.min': 'Column title is required',
    'string.max': 'Title cannot exceed 50 characters',
  }),
  position: Joi.number().integer().min(0).messages({
    'number.base': 'Position must be a number',
    'number.min': 'Position cannot be negative',
  }),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});
