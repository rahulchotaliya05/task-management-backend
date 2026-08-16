import Joi from 'joi';

export const createCardSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.min': 'Card title is required',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Card title is required',
  }),
  description: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  assignee: Joi.string().trim().allow(null, ''),
  dueDate: Joi.date().allow(null, ''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
});

export const updateCardSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).messages({
    'string.min': 'Card title is required',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().trim().max(2000).allow(''),
  assignee: Joi.string().trim().allow(null, ''),
  dueDate: Joi.date().allow(null, ''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

export const moveCardSchema = Joi.object({
  targetColumnId: Joi.string().trim().required().messages({
    'any.required': 'Target column is required',
  }),
  position: Joi.number().integer().min(0).required().messages({
    'any.required': 'Position is required',
    'number.min': 'Position cannot be negative',
  }),
});
