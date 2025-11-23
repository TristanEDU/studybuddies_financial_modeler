/**
 * DEPRECATED: OpenAI client has been moved to server-side (Supabase Edge Functions)
 * for security reasons. The API key is no longer exposed in the browser.
 *
 * All OpenAI requests should now go through the Supabase Edge Function proxy.
 * See: supabase/functions/openai-proxy/index.ts
 * Usage: supabase.functions.invoke('openai-proxy', { body: { messages, model, ... } })
 */

console.warn(
	"openaiClient.js is deprecated. Use Supabase Edge Function proxy instead."
);

export default null;
