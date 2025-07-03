#!/bin/bash

# Create .env file for React client
cat > .env << EOF
REACT_APP_API_URL=https://money-production-55af.up.railway.app/api
REACT_APP_SUPABASE_URL=https://fxzwnjmzhdynsatvakim.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4enduam16aGR5bnNhdHZha2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODI4MjUsImV4cCI6MjA2NzE1ODgyNX0.l1fmDYnD8eIszoMqx2S0Cqq28fpz_rSjaim2Ke3YIow
CORS_ORIGIN=https://money-git-main-byronmccluney.vercel.app
FRONTEND_URL=https://money-git-main-byronmccluney.vercel.app
JWT_SECRET=5b3c85f0e109ce486268d6df80da9046f22577f60200400ec0ed661f8adc65123166abd239b98aba0ee32b2ba1198cd55c9ef46cadf506dde461ce548b505aca
EOF

echo "Environment variables set up successfully!"
echo "You can now run: npm start" 