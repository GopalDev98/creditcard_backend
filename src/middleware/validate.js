import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
    }));

    throw new ValidationError('Validation failed', details);
  }

  next();
};
