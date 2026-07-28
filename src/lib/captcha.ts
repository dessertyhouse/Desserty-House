/**
 * Honeypot CAPTCHA implementation
 * Uses timestamp validation and hidden field detection
 */

export interface CaptchaValidation {
  isValid: boolean;
  error?: string;
}

// Honeypot field name (hidden from real users)
export const HONEYPOT_FIELD = 'website_url';
export const TIMESTAMP_FIELD = 'order_timestamp';
export const TIMESTAMP_MIN_MS = 3000; // Minimum 3 seconds to fill form (bots are faster)
export const TIMESTAMP_MAX_MS = 3600000; // Maximum 1 hour (session timeout)

/**
 * Validates the honeypot CAPTCHA
 * - Checks if honeypot field is empty (bots fill it)
 * - Validates timestamp is within acceptable range
 */
export function validateCaptcha(formData: FormData | Record<string, string>): CaptchaValidation {
  // Check honeypot field (should be empty for humans)
  const honeypot = formData instanceof FormData 
    ? formData.get(HONEYPOT_FIELD) 
    : formData[HONEYPOT_FIELD];
  
  if (honeypot && String(honeypot).trim() !== '') {
    return {
      isValid: false,
      error: 'Invalid submission detected.'
    };
  }

  // Check timestamp
  const timestamp = formData instanceof FormData
    ? formData.get(TIMESTAMP_FIELD)
    : formData[TIMESTAMP_FIELD];

  if (!timestamp) {
    return {
      isValid: false,
      error: 'Invalid form submission. Please try again.'
    };
  }

  const submitTime = parseInt(String(timestamp), 10);
  const now = Date.now();

  // Check if timestamp is too old
  if (now - submitTime > TIMESTAMP_MAX_MS) {
    return {
      isValid: false,
      error: 'Form session expired. Please refresh and try again.'
    };
  }

  // Check if form was filled too quickly (bot behavior)
  if (now - submitTime < TIMESTAMP_MIN_MS) {
    return {
      isValid: false,
      error: 'Please take your time filling out the form.'
    };
  }

  return { isValid: true };
}

/**
 * Generate CAPTCHA form fields to include in the order form
 */
export function getCaptchaFields(): { timestamp: number; fields: string } {
  const timestamp = Date.now();
  
  const fields = `
    <input type="text" name="${HONEYPOT_FIELD}" tabindex="-1" autocomplete="off" 
           style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true" />
    <input type="hidden" name="${TIMESTAMP_FIELD}" value="${timestamp}" />
  `;
  
  return { timestamp, fields };
}
