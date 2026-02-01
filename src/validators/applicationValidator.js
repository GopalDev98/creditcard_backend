import { body, param } from 'express-validator';

export const submitApplicationValidator = [
  // Personal Info
  body('personalInfo.fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('personalInfo.dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date of birth'),
  body('personalInfo.email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('personalInfo.phone')
    .matches(/^(\+91)?[6-9]\d{9}$/)
    .withMessage('Invalid phone number'),
  body('personalInfo.panCard')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN card format (e.g., ABCDE1234F)')
    .toUpperCase(),
  body('personalInfo.address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('personalInfo.address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('personalInfo.address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State is required'),
  body('personalInfo.address.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Invalid pincode'),
  
  // Employment Info
  body('employmentInfo.employmentType')
    .isIn(['salaried', 'self-employed', 'business'])
    .withMessage('Invalid employment type'),
  body('employmentInfo.annualIncome')
    .isNumeric()
    .withMessage('Annual income must be a number')
    .isFloat({ min: 0, max: 100000000 })
    .withMessage('Invalid annual income'),
  body('employmentInfo.companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('employmentInfo.designation')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation must be between 2 and 100 characters'),
];

export const updateApplicationValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID'),
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  body('creditLimit')
    .optional()
    .isNumeric()
    .withMessage('Credit limit must be a number'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must be less than 500 characters'),
];
