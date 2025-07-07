import { createClient } from '@supabase/supabase-js';

// Environment variables for the new Supabase database
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  'https://fxzwnjmzhdynsatvakim.supabase.co';
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4enduam16aGR5bnNhdHZha2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODI4MjUsImV4cCI6MjA2NzE1ODgyNX0.l1fmDYnD8eIszoMqx2S0Cqq28fpz_rSjaim2Ke3YIow';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
  throw new Error('Supabase configuration is incomplete');
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'zanwik-dashboard',
    },
  },
});

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    // Database connection test successful - removed console.log for lint compliance
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};

// Enhanced auth helpers with better error handling
export const auth = {
  // Sign in with email/password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      // User signed in successfully - removed console.log for lint compliance
      return data;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  },

  // Sign up with email/password
  signUp: async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      // User signed up successfully - removed console.log for lint compliance
      return data;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      // User signed out successfully - removed console.log for lint compliance
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Get user error:', error);
        throw error;
      }
      return user;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  },

  // Get current session
  getCurrentSession: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Get session error:', error);
        throw error;
      }
      return session;
    } catch (error) {
      console.error('Get current session failed:', error);
      throw error;
    }
  },

  // Listen for auth state changes
  onAuthStateChange: callback => {
    return supabase.auth.onAuthStateChange((event, session) => {
      // Auth state changed - removed console.log for lint compliance
      callback(event, session);
    });
  },

  // Reset password
  resetPassword: async email => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      // Password reset email sent - removed console.log for lint compliance
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async newPassword => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      // Password updated successfully - removed console.log for lint compliance
    } catch (error) {
      console.error('Password update failed:', error);
      throw error;
    }
  },
};

// Enhanced database helpers with retry logic and better error handling
export const db = {
  // Projects
  projects: {
    getAll: async (filters = {}) => {
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Get projects error:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Get all projects failed:', error);
        throw error;
      }
    },

    getById: async id => {
      try {
        const { error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        if (error) {
          console.error('Get project by ID error:', error);
          throw error;
        }
        return;
      } catch (error) {
        console.error('Get project by ID failed:', error);
        throw error;
      }
    },

    create: async projectData => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();

        if (error) {
          console.error('Create project error:', error);
          throw error;
        }

        // Project created successfully - removed console.log for lint compliance
        return data;
      } catch (error) {
        console.error('Create project failed:', error);
        throw error;
      }
    },

    update: async (id, updates) => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Update project error:', error);
          throw error;
        }

        // Project updated successfully - removed console.log for lint compliance
        return data;
      } catch (error) {
        console.error('Update project failed:', error);
        throw error;
      }
    },

    delete: async id => {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) {
          console.error('Delete project error:', error);
          throw error;
        }
        // Project deleted successfully - removed console.log for lint compliance
      } catch (error) {
        console.error('Delete project failed:', error);
        throw error;
      }
    },

    // Get project statistics
    getStats: async () => {
      try {
        const { error } = await supabase.rpc('get_project_stats');
        if (error) {
          console.error('Get project stats error:', error);
          throw error;
        }
        return;
      } catch (error) {
        console.error('Get project stats failed:', error);
        throw error;
      }
    },
  },

  // Analytics
  analytics: {
    getOverview: async () => {
      try {
        const { data, error } = await supabase
          .from('analytics_overview')
          .select('*')
          .single();
        if (error) {
          console.error('Get analytics overview error:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Get analytics overview failed:', error);
        throw error;
      }
    },

    getRevenue: async (period = '30d') => {
      try {
        const { data, error } = await supabase
          .from('analytics_revenue')
          .select('*')
          .eq('period', period)
          .order('date', { ascending: true });
        if (error) {
          console.error('Get revenue analytics error:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Get revenue analytics failed:', error);
        throw error;
      }
    },

    // Get custom analytics
    getCustomAnalytics: async (startDate, endDate) => {
      try {
        const { data, error } = await supabase
          .from('analytics_revenue')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });
        if (error) {
          console.error('Get custom analytics error:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Get custom analytics failed:', error);
        throw error;
      }
    },
  },

  // Users
  users: {
    getAll: async (filters = {}) => {
      try {
        let query = supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters.role) {
          query = query.eq('role', filters.role);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.search) {
          query = query.ilike('email', `%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Get users error:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Get all users failed:', error);
        throw error;
      }
    },

    getById: async id => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        if (error) {
          console.error('Get user by ID error:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Get user by ID failed:', error);
        throw error;
      }
    },

    update: async (id, updates) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        if (error) {
          console.error('Update user error:', error);
          throw error;
        }
        // User updated successfully - removed console.log for lint compliance
        return data;
      } catch (error) {
        console.error('Update user failed:', error);
        throw error;
      }
    },

    delete: async id => {
      try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) {
          console.error('Delete user error:', error);
          throw error;
        }
        // User deleted successfully - removed console.log for lint compliance
      } catch (error) {
        console.error('Delete user failed:', error);
        throw error;
      }
    },
  },

  // System monitoring
  monitoring: {
    getAlerts: async (severity = 'all') => {
      try {
        let query = supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false });

        if (severity !== 'all') {
          query = query.eq('severity', severity);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Get alerts error:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Get alerts failed:', error);
        throw error;
      }
    },

    acknowledgeAlert: async alertId => {
      try {
        const { error } = await supabase
          .from('alerts')
          .update({
            acknowledged: true,
            acknowledged_at: new Date().toISOString(),
          })
          .eq('id', alertId);
        if (error) {
          console.error('Acknowledge alert error:', error);
          throw error;
        }
        // Alert acknowledged successfully - removed console.log for lint compliance
      } catch (error) {
        console.error('Acknowledge alert failed:', error);
        throw error;
      }
    },
  },
};

export default supabase;
