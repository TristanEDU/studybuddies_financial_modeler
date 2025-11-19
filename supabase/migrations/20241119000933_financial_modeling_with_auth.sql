-- Financial Modeling Platform with Authentication
-- Schema Analysis: Database is empty - FRESH_PROJECT scenario
-- Integration Type: Complete authentication + financial modeling data schema
-- Dependencies: None (fresh project)

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'premium');
CREATE TYPE public.scenario_status AS ENUM ('active', 'archived', 'template');
CREATE TYPE public.cost_category_type AS ENUM ('personnel', 'operations', 'marketing', 'technology', 'custom');

-- 2. Core User Profile Table (Auth Integration)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Financial Scenarios Table
CREATE TABLE public.financial_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status public.scenario_status DEFAULT 'active'::public.scenario_status,
    is_template BOOLEAN DEFAULT false,
    cost_data JSONB NOT NULL DEFAULT '{}',
    pricing_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cost Categories Table
CREATE TABLE public.cost_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    category_type public.cost_category_type NOT NULL,
    enabled BOOLEAN DEFAULT true,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Cost Items Table
CREATE TABLE public.cost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.cost_categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    value DECIMAL(12,2) NOT NULL DEFAULT 0,
    min_value DECIMAL(12,2),
    max_value DECIMAL(12,2),
    step_value DECIMAL(12,2),
    enabled BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Saved Metrics Table
CREATE TABLE public.financial_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    calculation_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- 7. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_financial_scenarios_user_id ON public.financial_scenarios(user_id);
CREATE INDEX idx_financial_scenarios_status ON public.financial_scenarios(status);
CREATE INDEX idx_cost_categories_scenario_id ON public.cost_categories(scenario_id);
CREATE INDEX idx_cost_categories_user_id ON public.cost_categories(user_id);
CREATE INDEX idx_cost_items_category_id ON public.cost_items(category_id);
CREATE INDEX idx_cost_items_user_id ON public.cost_items(user_id);
CREATE INDEX idx_financial_metrics_user_id ON public.financial_metrics(user_id);
CREATE INDEX idx_financial_metrics_scenario_id ON public.financial_metrics(scenario_id);

-- 8. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;

-- 9. Trigger Function for Auto User Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role, company_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role,
        COALESCE(NEW.raw_user_meta_data->>'company_name', '')
    );
    RETURN NEW;
END;
$$;

-- 10. Trigger for Auto Profile Creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 11. RLS Policies

-- User Profiles - Pattern 1 (Core user table)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Financial Scenarios - Pattern 2 (Simple user ownership)
CREATE POLICY "users_manage_own_financial_scenarios"
ON public.financial_scenarios
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Cost Categories - Pattern 2 (Simple user ownership)
CREATE POLICY "users_manage_own_cost_categories"
ON public.cost_categories
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Cost Items - Pattern 2 (Simple user ownership)
CREATE POLICY "users_manage_own_cost_items"
ON public.cost_items
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Financial Metrics - Pattern 2 (Simple user ownership)
CREATE POLICY "users_manage_own_financial_metrics"
ON public.financial_metrics
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 12. Mock Data for Testing
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
    scenario_uuid UUID := gen_random_uuid();
    category1_uuid UUID := gen_random_uuid();
    category2_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete field structure
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@financialmodeling.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin", "company_name": "Financial Modeling Inc"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@financialmodeling.com', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Demo User", "role": "user", "company_name": "StartupCo"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create sample scenario
    INSERT INTO public.financial_scenarios (id, user_id, name, description, cost_data, pricing_data)
    VALUES (
        scenario_uuid, 
        admin_uuid, 
        'Baseline Financial Model',
        'Conservative growth scenario with current cost structure',
        '{"totalCosts": 75000, "lastUpdated": "2024-11-19T00:09:33.757934Z"}'::jsonb,
        '{"activePricing": "standard", "scenarios": [{"id": "standard", "name": "Standard", "price": 49}]}'::jsonb
    );

    -- Create sample cost categories
    INSERT INTO public.cost_categories (id, user_id, scenario_id, category_name, category_type, settings)
    VALUES 
        (category1_uuid, admin_uuid, scenario_uuid, 'Personnel', 'personnel', '{"enabled": true}'::jsonb),
        (category2_uuid, admin_uuid, scenario_uuid, 'Marketing', 'marketing', '{"enabled": true}'::jsonb);

    -- Create sample cost items
    INSERT INTO public.cost_items (category_id, user_id, item_name, value, min_value, max_value, step_value, metadata)
    VALUES 
        (category1_uuid, admin_uuid, 'Senior Developer', 8000.00, 4000.00, 15000.00, 500.00, '{"count": 2}'::jsonb),
        (category1_uuid, admin_uuid, 'UI Designer', 6500.00, 3500.00, 12000.00, 500.00, '{"count": 1}'::jsonb),
        (category2_uuid, admin_uuid, 'Digital Advertising', 15000.00, 1000.00, 100000.00, 1000.00, '{"platform": "Google Ads"}'::jsonb);
END $$;