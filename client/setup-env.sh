#!/bin/bash

# Create .env file for React client
cat > .env << EOF
REACT_APP_SUPABASE_URL=https://ynssliolfybuczopjfgn.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc3NsaW9sZnlidWN6b3BqZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzU0NDIsImV4cCI6MjA2NzA1MTQ0Mn0.gUygOntZpba9_JVvuz4I6OdOjeqz-Bz29PXoerqWb8k
EOF

echo "Environment variables set up successfully!"
echo "You can now run: npm start" 