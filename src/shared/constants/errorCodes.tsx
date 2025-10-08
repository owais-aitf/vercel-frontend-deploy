/**
 * Centralized Error Codes for the Attendance Management System
 * Format: CATEGORY_SPECIFIC_ERROR
 */

export const ERROR_CODES = {
  // Authentication Errors (1000-1099)
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_1001',
    UNAUTHORIZED: 'AUTH_1002',
    SESSION_EXPIRED: 'AUTH_1003',
    TOKEN_INVALID: 'AUTH_1004',
    TOKEN_EXPIRED: 'AUTH_1005',
    ACCOUNT_LOCKED: 'AUTH_1006',
    ACCOUNT_NOT_FOUND: 'AUTH_1007',
    REGISTRATION_FAILED: 'AUTH_1008',
    EMAIL_ALREADY_EXISTS: 'AUTH_1009',
    WEAK_PASSWORD: 'AUTH_1010',
    PERMISSION_DENIED: 'AUTH_1011',
  },

  // Validation Errors (2000-2099)
  VALIDATION: {
    REQUIRED_FIELD: 'VAL_2001',
    INVALID_EMAIL: 'VAL_2002',
    INVALID_DATE: 'VAL_2003',
    INVALID_TIME: 'VAL_2004',
    INVALID_FORMAT: 'VAL_2005',
    MIN_LENGTH: 'VAL_2006',
    MAX_LENGTH: 'VAL_2007',
    INVALID_RANGE: 'VAL_2008',
    INVALID_PHONE: 'VAL_2009',
    INVALID_NUMBER: 'VAL_2010',
  },

  // Attendance Errors (3000-3099)
  ATTENDANCE: {
    NOT_FOUND: 'ATT_3001',
    DUPLICATE_ENTRY: 'ATT_3002',
    INVALID_DATE_RANGE: 'ATT_3003',
    OVERLAPPING_HOURS: 'ATT_3004',
    PAST_DATE_NOT_ALLOWED: 'ATT_3005',
    FUTURE_DATE_NOT_ALLOWED: 'ATT_3006',
    ALREADY_SUBMITTED: 'ATT_3007',
    MISSING_REQUIRED_FIELDS: 'ATT_3008',
    INVALID_WORK_HOURS: 'ATT_3009',
    BREAK_TIME_EXCEEDS_WORK: 'ATT_3010',
  },

  // Project Errors (4000-4099)
  PROJECT: {
    NOT_FOUND: 'PRJ_4001',
    DUPLICATE_NAME: 'PRJ_4002',
    INVALID_CONTRACT_DATES: 'PRJ_4003',
    CONTRACT_EXPIRED: 'PRJ_4004',
    ALREADY_ASSIGNED: 'PRJ_4005',
    ENGINEER_NOT_ASSIGNED: 'PRJ_4006',
    INVALID_SETTLEMENT_RANGE: 'PRJ_4007',
    INVALID_RATES: 'PRJ_4008',
    CANNOT_DELETE_ACTIVE: 'PRJ_4009',
    CLIENT_NOT_FOUND: 'PRJ_4010',
  },

  // Engineer Errors (5000-5099)
  ENGINEER: {
    NOT_FOUND: 'ENG_5001',
    DUPLICATE_EMAIL: 'ENG_5002',
    ALREADY_ASSIGNED: 'ENG_5003',
    NOT_AVAILABLE: 'ENG_5004',
    PROFILE_INCOMPLETE: 'ENG_5005',
    CANNOT_DELETE_ACTIVE: 'ENG_5006',
    INVALID_STATUS: 'ENG_5007',
  },

  // Report Errors (6000-6099)
  REPORT: {
    GENERATION_FAILED: 'RPT_6001',
    NOT_FOUND: 'RPT_6002',
    NO_DATA_AVAILABLE: 'RPT_6003',
    INVALID_PERIOD: 'RPT_6004',
    ATTENDANCE_INCOMPLETE: 'RPT_6005',
    ALREADY_GENERATED: 'RPT_6006',
    DOWNLOAD_FAILED: 'RPT_6007',
    PREVIEW_FAILED: 'RPT_6008',
  },

  // Billing Errors (7000-7099)
  BILLING: {
    CALCULATION_FAILED: 'BIL_7001',
    INVALID_HOURS: 'BIL_7002',
    SETTLEMENT_ERROR: 'BIL_7003',
    RATE_NOT_FOUND: 'BIL_7004',
    ALREADY_INVOICED: 'BIL_7005',
    INVOICE_NOT_FOUND: 'BIL_7006',
    INVALID_AMOUNT: 'BIL_7007',
  },

  // Network Errors (8000-8099)
  NETWORK: {
    CONNECTION_ERROR: 'NET_8001',
    TIMEOUT: 'NET_8002',
    SERVER_ERROR: 'NET_8003',
    SERVICE_UNAVAILABLE: 'NET_8004',
    BAD_REQUEST: 'NET_8005',
    NOT_FOUND: 'NET_8006',
    CONFLICT: 'NET_8007',
  },

  // File Errors (9000-9099)
  FILE: {
    UPLOAD_FAILED: 'FILE_9001',
    DOWNLOAD_FAILED: 'FILE_9002',
    INVALID_FORMAT: 'FILE_9003',
    FILE_TOO_LARGE: 'FILE_9004',
    FILE_NOT_FOUND: 'FILE_9005',
  },

  // System Errors (10000+)
  SYSTEM: {
    UNKNOWN_ERROR: 'SYS_10001',
    DATABASE_ERROR: 'SYS_10002',
    CONFIGURATION_ERROR: 'SYS_10003',
    MAINTENANCE_MODE: 'SYS_10004',
  },
} as const;

/**
 * Error Code to User-Friendly Message Mapping
 */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  // Auth
  [ERROR_CODES.AUTH.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH.UNAUTHORIZED]:
    'You are not authorized to access this resource',
  [ERROR_CODES.AUTH.SESSION_EXPIRED]:
    'Your session has expired. Please login again',
  [ERROR_CODES.AUTH.TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.AUTH.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ERROR_CODES.AUTH.ACCOUNT_LOCKED]: 'Your account has been locked',
  [ERROR_CODES.AUTH.ACCOUNT_NOT_FOUND]: 'Account not found',
  [ERROR_CODES.AUTH.REGISTRATION_FAILED]:
    'Registration failed. Please try again',
  [ERROR_CODES.AUTH.EMAIL_ALREADY_EXISTS]: 'Email already exists',
  [ERROR_CODES.AUTH.WEAK_PASSWORD]: 'Password is too weak',
  [ERROR_CODES.AUTH.PERMISSION_DENIED]: 'Permission denied',

  // Validation
  [ERROR_CODES.VALIDATION.REQUIRED_FIELD]: 'This field is required',
  [ERROR_CODES.VALIDATION.INVALID_EMAIL]: 'Please enter a valid email address',
  [ERROR_CODES.VALIDATION.INVALID_DATE]: 'Please enter a valid date',
  [ERROR_CODES.VALIDATION.INVALID_TIME]: 'Please enter a valid time',
  [ERROR_CODES.VALIDATION.INVALID_FORMAT]: 'Invalid format',
  [ERROR_CODES.VALIDATION.MIN_LENGTH]: 'Input is too short',
  [ERROR_CODES.VALIDATION.MAX_LENGTH]: 'Input is too long',
  [ERROR_CODES.VALIDATION.INVALID_RANGE]: 'Value is out of valid range',

  // Attendance
  [ERROR_CODES.ATTENDANCE.NOT_FOUND]: 'Attendance record not found',
  [ERROR_CODES.ATTENDANCE.DUPLICATE_ENTRY]:
    'Attendance already exists for this date',
  [ERROR_CODES.ATTENDANCE.INVALID_DATE_RANGE]: 'Invalid date range',
  [ERROR_CODES.ATTENDANCE.OVERLAPPING_HOURS]:
    'Work hours overlap with existing entry',
  [ERROR_CODES.ATTENDANCE.PAST_DATE_NOT_ALLOWED]: 'Cannot edit past attendance',
  [ERROR_CODES.ATTENDANCE.FUTURE_DATE_NOT_ALLOWED]:
    'Cannot enter future attendance',
  [ERROR_CODES.ATTENDANCE.ALREADY_SUBMITTED]: 'Attendance already submitted',
  [ERROR_CODES.ATTENDANCE.INVALID_WORK_HOURS]: 'Invalid work hours',
  [ERROR_CODES.ATTENDANCE.BREAK_TIME_EXCEEDS_WORK]:
    'Break time cannot exceed work hours',

  // Project
  [ERROR_CODES.PROJECT.NOT_FOUND]: 'Project not found',
  [ERROR_CODES.PROJECT.DUPLICATE_NAME]: 'Project name already exists',
  [ERROR_CODES.PROJECT.INVALID_CONTRACT_DATES]: 'Invalid contract dates',
  [ERROR_CODES.PROJECT.CONTRACT_EXPIRED]: 'Contract has expired',
  [ERROR_CODES.PROJECT.ALREADY_ASSIGNED]:
    'Engineer already assigned to this project',
  [ERROR_CODES.PROJECT.ENGINEER_NOT_ASSIGNED]:
    'Engineer not assigned to this project',
  [ERROR_CODES.PROJECT.INVALID_SETTLEMENT_RANGE]: 'Invalid settlement range',
  [ERROR_CODES.PROJECT.INVALID_RATES]: 'Invalid rate configuration',
  [ERROR_CODES.PROJECT.CANNOT_DELETE_ACTIVE]: 'Cannot delete active project',
  [ERROR_CODES.PROJECT.CLIENT_NOT_FOUND]: 'Client not found',

  // Engineer
  [ERROR_CODES.ENGINEER.NOT_FOUND]: 'Engineer not found',
  [ERROR_CODES.ENGINEER.DUPLICATE_EMAIL]: 'Email already registered',
  [ERROR_CODES.ENGINEER.ALREADY_ASSIGNED]: 'Engineer already assigned',
  [ERROR_CODES.ENGINEER.NOT_AVAILABLE]: 'Engineer not available',
  [ERROR_CODES.ENGINEER.PROFILE_INCOMPLETE]: 'Please complete your profile',
  [ERROR_CODES.ENGINEER.CANNOT_DELETE_ACTIVE]: 'Cannot delete active engineer',

  // Report
  [ERROR_CODES.REPORT.GENERATION_FAILED]: 'Report generation failed',
  [ERROR_CODES.REPORT.NOT_FOUND]: 'Report not found',
  [ERROR_CODES.REPORT.NO_DATA_AVAILABLE]: 'No data available for report',
  [ERROR_CODES.REPORT.INVALID_PERIOD]: 'Invalid report period',
  [ERROR_CODES.REPORT.ATTENDANCE_INCOMPLETE]: 'Attendance data is incomplete',
  [ERROR_CODES.REPORT.ALREADY_GENERATED]:
    'Report already generated for this period',

  // Billing
  [ERROR_CODES.BILLING.CALCULATION_FAILED]: 'Billing calculation failed',
  [ERROR_CODES.BILLING.INVALID_HOURS]: 'Invalid work hours for billing',
  [ERROR_CODES.BILLING.SETTLEMENT_ERROR]: 'Settlement calculation error',
  [ERROR_CODES.BILLING.RATE_NOT_FOUND]: 'Rate information not found',
  [ERROR_CODES.BILLING.ALREADY_INVOICED]: 'Already invoiced',

  // Network
  [ERROR_CODES.NETWORK.CONNECTION_ERROR]:
    'Connection error. Please check your internet',
  [ERROR_CODES.NETWORK.TIMEOUT]: 'Request timeout. Please try again',
  [ERROR_CODES.NETWORK.SERVER_ERROR]: 'Server error. Please try again later',
  [ERROR_CODES.NETWORK.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',

  // File
  [ERROR_CODES.FILE.UPLOAD_FAILED]: 'File upload failed',
  [ERROR_CODES.FILE.DOWNLOAD_FAILED]: 'File download failed',
  [ERROR_CODES.FILE.INVALID_FORMAT]: 'Invalid file format',
  [ERROR_CODES.FILE.FILE_TOO_LARGE]: 'File size exceeds limit',
  [ERROR_CODES.FILE.FILE_NOT_FOUND]: 'File not found',

  // System
  [ERROR_CODES.SYSTEM.UNKNOWN_ERROR]: 'An unexpected error occurred',
  [ERROR_CODES.SYSTEM.DATABASE_ERROR]: 'Database error',
  [ERROR_CODES.SYSTEM.MAINTENANCE_MODE]: 'System is under maintenance',
};

/**
 * Helper function to get error message by code
 */
export const getErrorMessage = (errorCode: string): string => {
  return (
    ERROR_CODE_MESSAGES[errorCode] ||
    ERROR_CODE_MESSAGES[ERROR_CODES.SYSTEM.UNKNOWN_ERROR]
  );
};

/**
 * Type for error codes
 */
export type ErrorCode =
  (typeof ERROR_CODES)[keyof typeof ERROR_CODES][keyof (typeof ERROR_CODES)[keyof typeof ERROR_CODES]];
