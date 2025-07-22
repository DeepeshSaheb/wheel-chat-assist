-- Clean up chat sessions that have no user messages
-- First, delete messages from sessions that have no user messages
DELETE FROM public.chat_messages 
WHERE session_id IN (
  SELECT cs.id 
  FROM public.chat_sessions cs 
  LEFT JOIN public.chat_messages cm ON cs.id = cm.session_id AND cm.is_user = true
  WHERE cm.id IS NULL
);

-- Then delete the chat sessions that have no user messages
DELETE FROM public.chat_sessions 
WHERE id IN (
  SELECT cs.id 
  FROM public.chat_sessions cs 
  LEFT JOIN public.chat_messages cm ON cs.id = cm.session_id AND cm.is_user = true
  WHERE cm.id IS NULL
);