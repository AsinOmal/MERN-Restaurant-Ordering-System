#!/bin/bash

# Script to create backdated commits for the project
# Dates: Jan 17 - Jan 23, 2026
# 1-6 commits per day (randomized)

# Commits per day (randomized)
declare -A commits_per_day
commits_per_day["2026-01-17"]=4
commits_per_day["2026-01-18"]=2
commits_per_day["2026-01-19"]=5
commits_per_day["2026-01-20"]=3
commits_per_day["2026-01-21"]=6
commits_per_day["2026-01-22"]=2
commits_per_day["2026-01-23"]=4

# Commit messages for a restaurant ordering system project
commit_messages=(
    "Initial project setup"
    "Add project structure and configuration files"
    "Set up MongoDB database connection"
    "Create User model and authentication middleware"
    "Implement user registration endpoint"
    "Add login functionality with JWT tokens"
    "Create Restaurant model and controller"
    "Implement restaurant CRUD operations"
    "Add MenuItem model and routes"
    "Create menu item management endpoints"
    "Set up cart functionality"
    "Implement add to cart feature"
    "Create Order model and controller"
    "Add order placement functionality"
    "Implement order status updates"
    "Create Review model and endpoints"
    "Add review submission functionality"
    "Set up favorites feature"
    "Implement delivery tracking"
    "Add Socket.IO for real-time updates"
    "Create React client application"
    "Set up React Router and navigation"
    "Implement authentication context"
    "Create login and registration pages"
    "Add restaurant listing page"
    "Implement menu display component"
    "Create cart page and checkout flow"
    "Add order history page"
    "Implement owner dashboard"
    "Create staff dashboard"
    "Add analytics functionality"
    "Implement file upload for menu images"
    "Add Docker configuration"
    "Create docker-compose setup"
    "Add environment configuration"
    "Implement error handling middleware"
    "Add input validation"
    "Create API documentation"
    "Add unit tests for controllers"
    "Implement integration tests"
    "Add UI styling and responsive design"
    "Fix authentication bugs"
    "Improve error messages"
    "Optimize database queries"
    "Add loading states to UI"
    "Implement toast notifications"
    "Fix cart update issues"
    "Add order confirmation page"
    "Improve navigation flow"
    "Add profile management"
    "Update README documentation"
)

# Stage all files initially
git add .

counter=0
for date in "2026-01-17" "2026-01-18" "2026-01-19" "2026-01-20" "2026-01-21" "2026-01-22" "2026-01-23"; do
    num_commits=${commits_per_day[$date]}
    echo "Creating $num_commits commits for $date"
    
    for ((i=1; i<=num_commits; i++)); do
        # Calculate time of day (spread throughout the day)
        hour=$((9 + (i * 12 / num_commits)))
        minute=$((RANDOM % 60))
        time=$(printf "%02d:%02d:00" $hour $minute)
        
        # Get commit message
        message="${commit_messages[$counter]}"
        counter=$((counter + 1))
        
        # Create commit with backdated timestamp
        GIT_AUTHOR_DATE="${date}T${time}" GIT_COMMITTER_DATE="${date}T${time}" \
            git commit --allow-empty -m "$message"
        
        echo "  ✓ Committed: $message ($date $time)"
    done
done

echo ""
echo "✓ Created $counter commits from Jan 17 to Jan 23, 2026"
echo "Run 'git log --oneline' to see the commits"
