-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_revenue ENABLE ROW LEVEL SECURITY;

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

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 