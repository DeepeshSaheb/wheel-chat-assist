# Test Data Setup Guide

## Step 1: Create Test Users

Since Supabase manages authentication, you'll need to create users through the app's login flow:

### Test Users to Create:

1. **Admin User**
   - Mobile: `9876543210`
   - Use the app's OTP login to create this user

2. **Regular Customer 1** 
   - Mobile: `9876543211`
   - Use the app's OTP login to create this user

3. **Regular Customer 2**
   - Mobile: `9876543212` 
   - Use the app's OTP login to create this user

## Step 2: Update User Roles & Add Orders

After creating the users above, run this SQL in Supabase SQL Editor to assign roles and add sample orders:

```sql
-- First, get the user IDs from the auth.users table
-- Replace the UUIDs below with the actual user IDs after users sign up

-- Example: If your admin user ID is 'abc123...', replace it below
-- You can find user IDs in Supabase Dashboard > Authentication > Users

-- Update user roles (replace UUIDs with actual user IDs)
INSERT INTO public.user_roles (user_id, role) VALUES 
  ('REPLACE_WITH_ADMIN_USER_ID', 'admin'),
  ('REPLACE_WITH_CUSTOMER1_USER_ID', 'user'),
  ('REPLACE_WITH_CUSTOMER2_USER_ID', 'user');

-- Add sample orders (replace user_id values with actual user IDs)
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
    'REPLACE_WITH_CUSTOMER1_USER_ID',
    'ORD-2024-001',
    'ElectroScooter Pro',
    'ESP-2024-X1',
    45999.00,
    'Delivered',
    '123 MG Road, Bangalore, Karnataka 560001',
    '2024-01-15 10:30:00+00'
  ),
  (
    'REPLACE_WITH_CUSTOMER1_USER_ID',
    'ORD-2024-002',
    'ElectroScooter Lite',
    'ESL-2024-Y2',
    29999.00,
    'In Transit',
    '123 MG Road, Bangalore, Karnataka 560001',
    '2024-01-25 14:00:00+00'
  ),
  (
    'REPLACE_WITH_CUSTOMER2_USER_ID',
    'ORD-2024-003',
    'ElectroScooter Max',
    'ESM-2024-Z3',
    59999.00,
    'Order Accepted',
    '456 Park Street, Kolkata, West Bengal 700016',
    '2024-02-01 11:00:00+00'
  ),
  (
    'REPLACE_WITH_CUSTOMER2_USER_ID',
    'ORD-2024-004',
    'ElectroScooter Pro',
    'ESP-2024-X1',
    45999.00,
    'Delivered',
    '456 Park Street, Kolkata, West Bengal 700016',
    '2023-12-20 09:15:00+00'
  ),
  (
    'REPLACE_WITH_CUSTOMER1_USER_ID',
    'ORD-2024-005',
    'ElectroScooter Eco',
    'ESE-2024-W4',
    24999.00,
    'Cancelled',
    '123 MG Road, Bangalore, Karnataka 560001',
    NULL
  );
```

## Step 3: Testing Scenarios

Once set up, you can test:

1. **Regular Customer Login** (`9876543211` or `9876543212`)
   - View their orders in the Orders page
   - Ask chatbot about orders: "What orders do I have?"
   - Ask specific questions: "When will my ElectroScooter Pro be delivered?"

2. **Admin Login** (`9876543210`)
   - Access admin dashboard
   - Manage domain questions
   - View all user queries

## Step 4: Enable Anonymous Users (Optional)

For easier testing without OTP, you can enable anonymous signups in Supabase:
1. Go to Authentication > Settings
2. Enable "Allow anonymous sign-ins"
3. Disable "Confirm email" for faster testing