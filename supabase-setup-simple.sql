-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  type VARCHAR(100),
  url VARCHAR(500),
  github_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  revenue DECIMAL(10,2) DEFAULT 0,
  monthly_revenue DECIMAL(10,2) DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  deployment_status VARCHAR(50) DEFAULT 'not_deployed',
  last_deployment TIMESTAMP WITH TIME ZONE,
  health_status VARCHAR(50) DEFAULT 'healthy'
);

-- Create analytics_overview table
CREATE TABLE IF NOT EXISTS analytics_overview (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  monthly_revenue DECIMAL(10,2) DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  uptime_percentage DECIMAL(5,2) DEFAULT 99.9,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_revenue table
CREATE TABLE IF NOT EXISTS analytics_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  revenue DECIMAL(10,2) DEFAULT 0,
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Allow all users to view analytics (for demo purposes)
CREATE POLICY "Allow all users to view analytics" ON analytics_overview
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to view revenue data" ON analytics_revenue
  FOR SELECT USING (true);

-- Insert sample data
INSERT INTO analytics_overview (total_revenue, monthly_revenue, total_projects, active_projects, total_users, active_users) 
VALUES (12500.00, 3200.00, 10, 8, 1500, 1200)
ON CONFLICT DO NOTHING;

-- Insert sample revenue data for the last 30 days
INSERT INTO analytics_revenue (date, revenue, project_id)
SELECT 
  (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29))::date,
  (RANDOM() * 200 + 50)::DECIMAL(10,2),
  NULL
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO projects (name, description, type, url, revenue, monthly_revenue, total_users, active_users) VALUES
('AI Content Generator', 'SaaS platform for AI-powered content creation', 'SaaS', 'https://ai-content.example.com', 2500.00, 800.00, 500, 450),
('Digital Marketplace', 'E-commerce platform for digital products', 'Marketplace', 'https://marketplace.example.com', 3200.00, 950.00, 800, 720),
('Freelance Platform', 'Platform connecting freelancers with clients', 'Platform', 'https://freelance.example.com', 1800.00, 550.00, 300, 280),
('Subscription Box', 'Monthly subscription service', 'Subscription', 'https://subscription.example.com', 1200.00, 400.00, 200, 180),
('Online Course Platform', 'Educational platform for online courses', 'Education', 'https://courses.example.com', 2800.00, 900.00, 600, 540)
ON CONFLICT DO NOTHING; 