# Deployment Guide

## Supabase Edge Function Deployment

The OpenAI proxy Edge function has been created but needs to be deployed to your Supabase project.

### Prerequisites

1. Supabase CLI installed (already installed via npx)
2. Supabase access token or logged in session
3. OpenAI API key

### Deployment Steps

#### Option 1: Using Supabase Access Token (Recommended)

1. Get your access token from [Supabase Dashboard](https://app.supabase.com/account/tokens)
2. Set the environment variable:

   ```bash
   export SUPABASE_ACCESS_TOKEN=your_access_token_here
   ```

3. Link to your Supabase project:

   ```bash
   npx supabase link --project-ref your_project_ref
   ```

4. Deploy the Edge function:

   ```bash
   npx supabase functions deploy openai-proxy
   ```

5. Set the OpenAI API key as a secret:
   ```bash
   npx supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
   ```

#### Option 2: Using Supabase Login (Interactive)

1. Login to Supabase (requires opening browser):
   ```bash
   npx supabase login
   ```
2. Follow the prompts in your browser

3. Link to your project:

   ```bash
   npx supabase link --project-ref your_project_ref
   ```

4. Deploy the function:

   ```bash
   npx supabase functions deploy openai-proxy
   ```

5. Set the API key secret:
   ```bash
   npx supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
   ```

### Verification

After deployment, test the function:

1. Open your browser console on the app
2. Run this test:

   ```javascript
   const { data, error } = await supabase.functions.invoke("openai-proxy", {
   	body: {
   		messages: [{ role: "user", content: "Say hello" }],
   	},
   });
   console.log("Response:", data);
   console.log("Error:", error);
   ```

3. You should see a response from OpenAI without errors

### Troubleshooting

**Error: "Access token not provided"**

- Set `SUPABASE_ACCESS_TOKEN` environment variable
- Or use `npx supabase login`

**Error: "Function not found" (404)**

- Edge function not deployed yet - follow deployment steps above

**Error: "Unauthorized" from OpenAI**

- Check that `OPENAI_API_KEY` secret is set correctly
- Verify the API key is valid in your OpenAI dashboard

**Error: "Project not linked"**

- Run `npx supabase link --project-ref your_project_ref`
- Find your project ref in Supabase Dashboard → Settings → General

### Security Notes

- Never commit `OPENAI_API_KEY` to source control
- The Edge function securely proxies requests server-side
- Only authenticated users can call the function (via RLS policies)

## Recent Code Fixes

The following issues have been fixed:

### ✅ Async Persistence Pattern

- **Issue**: Calling async `persistCosts()` inside sync `setCosts()` updaters caused race conditions
- **Fix**: Moved `persistCosts()` calls outside `setCosts()` using `setTimeout(() => persistCosts(newCosts), 0)`
- **Impact**: Eliminates race conditions and ensures state updates complete before persistence

### ✅ Debounced Timer Cleanup

- **Issue**: `persistTimerRef` not cleaned up on component unmount
- **Fix**: Added `useEffect` cleanup to clear timer on unmount
- **Impact**: Prevents memory leaks and ensures proper cleanup

### ✅ Quick Actions Persistence

- All quick actions now properly persist changes:
  - `reduceMarketing20` - Reduces marketing costs by 20%
  - `addEmployee` - Adds new employee role
  - `removeItem` - Removes cost items (calls Supabase first)
  - `addCategory` - Adds custom cost category

## Next Steps

1. **Deploy Edge Function** (see above)
2. **Test AI Features**: Try the financial analysis and cost optimization features
3. **Monitor Performance**: Check Supabase logs for any Edge function errors
4. **Rate Limiting**: Consider adding rate limiting for OpenAI calls if needed
