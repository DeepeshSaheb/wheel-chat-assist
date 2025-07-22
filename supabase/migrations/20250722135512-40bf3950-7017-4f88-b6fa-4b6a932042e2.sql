-- Enable leaked password protection
UPDATE auth.config 
SET password_pwned_check_enabled = true;