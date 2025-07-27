-- Create orders table for electric scooter orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  product_model TEXT NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'Order Accepted',
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  shipping_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample orders for testing
INSERT INTO public.orders (user_id, product_name, product_model, order_number, status, shipping_address, total_amount, order_date) VALUES
(auth.uid(), 'ElectroSpeed Pro', 'ES-2024-PRO', 'ORD-001', 'Order Accepted', '123 Main St, City, State 12345', 899.99, now() - interval '2 days'),
(auth.uid(), 'ElectroUrban Lite', 'EU-2024-LITE', 'ORD-002', 'Shipped', '456 Oak Ave, City, State 12345', 599.99, now() - interval '5 days'),
(auth.uid(), 'ElectroCruiser Max', 'EC-2024-MAX', 'ORD-003', 'In Transit', '789 Pine Rd, City, State 12345', 1299.99, now() - interval '7 days'),
(auth.uid(), 'ElectroCommuter', 'ECM-2024', 'ORD-004', 'Delivered', '321 Elm St, City, State 12345', 749.99, now() - interval '14 days');