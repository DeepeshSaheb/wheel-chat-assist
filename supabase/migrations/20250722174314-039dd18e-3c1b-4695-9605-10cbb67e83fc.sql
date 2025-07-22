-- Add the current predefined questions to the database
INSERT INTO public.domain_questions (question, category, is_active) VALUES
  ('What are the different scooter models available?', 'Product Information', true),
  ('How long does the battery last?', 'Technical Specifications', true),
  ('How do I charge my scooter?', 'Usage Instructions', true),
  ('What''s the maximum speed and range?', 'Technical Specifications', true),
  ('How do I troubleshoot if my scooter won''t start?', 'Troubleshooting', true),
  ('What''s covered under warranty?', 'Warranty & Support', true),
  ('How do I check my order status?', 'Orders & Shipping', true),
  ('What safety gear do you recommend?', 'Safety', true);