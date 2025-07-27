import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Received message:', message);

    // Initialize Supabase client for order queries
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Check if the message is about orders and get user's orders if relevant
    let orderContext = '';
    const isOrderQuery = /\b(order|orders|purchase|bought|delivery|shipped|status|tracking)\b/i.test(message);
    
    if (isOrderQuery && authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && orders && orders.length > 0) {
            orderContext = `\n\nUser's Order History:\n${orders.map(order => 
              `Order #${order.order_number}: ${order.product_name} (${order.product_model}) - Status: ${order.status} - Ordered: ${new Date(order.order_date).toLocaleDateString()} - Amount: $${order.total_amount}${order.delivery_date ? ` - Delivery: ${new Date(order.delivery_date).toLocaleDateString()}` : ''}`
            ).join('\n')}`;
          }
        }
      } catch (orderError) {
        console.log('Could not fetch orders:', orderError);
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a helpful customer support assistant for an electric scooter company. 
            You help customers with questions about:
            - Scooter models, features, and specifications
            - Battery life, charging, and maintenance
            - Troubleshooting common issues
            - Order status and delivery information (you have access to their order history when they ask)
            - Warranty and repair services
            - Safety tips and riding guidelines
            
            When customers ask about their orders, use the provided order history to give specific, accurate information about their purchases, delivery status, and order details.
            Always be friendly, helpful, and provide clear, accurate information. If you don't know something specific about our scooters, suggest they contact our support team for detailed assistance.${orderContext}`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response:', aiResponse);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});