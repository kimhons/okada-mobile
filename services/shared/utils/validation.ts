import Joi from 'joi';
import { UserRole, Locale } from '../types/common';

// Cameroon phone number validation
export const cameroonPhoneSchema = Joi.string()
  .pattern(/^\+237[26][0-9]{8}$/)
  .messages({
    'string.pattern.base': 'Phone number must be a valid Cameroonian number (+237 followed by 9 digits starting with 2 or 6)'
  });

// Password validation - strong password requirements
export const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
  });

// Email validation
export const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .max(254)
  .lowercase()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email address is too long'
  });

// Name validation (supports French and English names)
export const nameSchema = Joi.string()
  .min(2)
  .max(50)
  .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
  .trim()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 50 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes'
  });

// OTP validation
export const otpSchema = Joi.string()
  .length(6)
  .pattern(/^\d{6}$/)
  .messages({
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers'
  });

// Two-factor authentication code validation
export const twoFactorCodeSchema = Joi.string()
  .length(6)
  .pattern(/^\d{6}$/)
  .messages({
    'string.length': 'Two-factor code must be exactly 6 digits',
    'string.pattern.base': 'Two-factor code must contain only numbers'
  });

// UUID validation
export const uuidSchema = Joi.string()
  .uuid({ version: 'uuidv4' })
  .messages({
    'string.guid': 'Must be a valid UUID'
  });

// Common validation schemas
export const validationSchemas = {
  register: Joi.object({
    email: emailSchema.required(),
    phone: cameroonPhoneSchema.required(),
    password: passwordSchema.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Password confirmation must match password'
      }),
    firstName: nameSchema.required(),
    lastName: nameSchema.required(),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .required(),
    language: Joi.string()
      .valid(...Object.values(Locale))
      .default(Locale.FR),
    termsAccepted: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        'any.only': 'You must accept the terms and conditions'
      }),
    privacyPolicyAccepted: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        'any.only': 'You must accept the privacy policy'
      })
  }),

  login: Joi.object({
    identifier: Joi.alternatives()
      .try(emailSchema, cameroonPhoneSchema)
      .required()
      .messages({
        'alternatives.match': 'Please provide a valid email or phone number'
      }),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false),
    twoFactorCode: twoFactorCodeSchema.optional()
  }),

  verifyCode: Joi.object({
    type: Joi.string()
      .valid('email', 'phone', 'password_reset', 'two_factor')
      .required(),
    identifier: Joi.alternatives()
      .try(emailSchema, cameroonPhoneSchema)
      .required(),
    code: otpSchema.required()
  }),

  passwordReset: Joi.object({
    identifier: Joi.alternatives()
      .try(emailSchema, cameroonPhoneSchema)
      .required()
  }),

  passwordResetConfirm: Joi.object({
    token: Joi.string().required(),
    newPassword: passwordSchema.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Password confirmation must match new password'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Password confirmation must match new password'
      })
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  twoFactorSetup: Joi.object({
    password: Joi.string().required()
  }),

  twoFactorVerify: Joi.object({
    code: twoFactorCodeSchema.when('backupCode', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    backupCode: Joi.string().optional()
  }).or('code', 'backupCode')
};

// Helper function to validate request body
export const validateRequest = (schema: Joi.ObjectSchema, data: any): { error?: string; value?: any } => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');
    return { error: errorMessage };
  }

  return { value };
};

// Phone number utilities
export const formatCameroonPhone = (phone: string): string => {
  // Remove any non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Add country code if missing
  if (cleaned.startsWith('6') || cleaned.startsWith('2')) {
    return `+237${cleaned}`;
  }

  if (cleaned.startsWith('237')) {
    return `+${cleaned}`;
  }

  return cleaned;
};

export const isValidCameroonPhone = (phone: string): boolean => {
  const formatted = formatCameroonPhone(phone);
  return /^\+237[26][0-9]{8}$/.test(formatted);
};

export const parseCameroonPhone = (phone: string): { operator: string; formatted: string } | null => {
  const formatted = formatCameroonPhone(phone);

  if (!isValidCameroonPhone(formatted)) {
    return null;
  }

  const number = formatted.substring(4); // Remove +237
  const firstDigit = number[0];
  const secondDigit = number[1];

  let operator = 'Unknown';

  if (firstDigit === '6') {
    if (['5', '6', '7', '8', '9'].includes(secondDigit)) {
      operator = 'MTN';
    } else if (['0', '1', '2', '3', '4'].includes(secondDigit)) {
      operator = 'Orange';
    }
  } else if (firstDigit === '2') {
    if (secondDigit === '2') {
      operator = 'Camtel';
    } else if (secondDigit === '4') {
      operator = 'Nexttel';
    }
  }

  return {
    operator,
    formatted: `${formatted.substring(0, 4)} ${number.substring(0, 1)}${number.substring(1, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
  };
};