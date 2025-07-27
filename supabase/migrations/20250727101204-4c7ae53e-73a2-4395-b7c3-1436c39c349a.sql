-- Insert sample user roles for testing
-- Note: These user_ids should be replaced with actual user IDs after authentication
-- For now, using placeholder UUIDs that can be updated after users sign up

-- Sample admin user role
INSERT INTO public.user_roles (user_id, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'user'),
  ('00000000-0000-0000-0000-000000000003', 'user');

-- Sample orders for testing
INSERT INTO public.orders (
  user_id, 
  order_number, 
  product_name, 
  product_model, 
  total_amount, 
  status, 
  shipping_address,
  delivery_date
) VALUES 
  (
    '00000000-0000-0000-0000-000000000002',
    'ORD-2024-001',
    'ElectroScooter Pro',
    'ESP-2024-X1',
    45999.00,
    'Delivered',
    '123 MG Road, Bangalore, Karnataka 560001',
    '2024-01-15 10:30:00+00'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'ORD-2024-002',
    'ElectroScooter Lite',
    'ESL-2024-Y2',
    29999.00,
    'In Transit',
    '123 MG Road, Bangalore, Karnataka 560001',
    '2024-01-25 14:00:00+00'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'ORD-2024-003',
    'ElectroScooter Max',
    'ESM-2024-Z3',
    59999.00,
    'Order Accepted',
    '456 Park Street, Kolkata, West Bengal 700016',
    '2024-02-01 11:00:00+00'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'ORD-2024-004',
    'ElectroScooter Pro',
    'ESP-2024-X1',
    45999.00,
    'Delivered',
    '456 Park Street, Kolkata, West Bengal 700016',
    '2023-12-20 09:15:00+00'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'ORD-2024-005',
    'ElectroScooter Eco',
    'ESE-2024-W4',
    24999.00,
    'Cancelled',
    '123 MG Road, Bangalore, Karnataka 560001',
    NULL
  );