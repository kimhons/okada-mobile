# Development Environment Setup Checklist

## 1. Basic Development Environment

### 1.1. Operating System Setup
- [ ] Install Ubuntu 22.04 LTS or macOS Monterey (or later) as the primary development OS
- [ ] Update the operating system to the latest version
- [ ] Install essential system utilities:
  ```bash
  # For Ubuntu
  sudo apt update
  sudo apt install -y build-essential git curl wget zip unzip python3 python3-pip
  
  # For macOS
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  brew install git curl wget zip unzip python@3.11
  ```

### 1.2. Git Setup
- [ ] Install Git if not already installed
- [ ] Configure Git with user information:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```
- [ ] Generate and set up SSH keys for GitHub:
  ```bash
  ssh-keygen -t ed25519 -C "your.email@example.com"
  # Add the key to your GitHub account
  ```
- [ ] Create a GitHub repository for the Okada project:
  ```bash
  # Initialize project structure
  mkdir -p okada-platform
  cd okada-platform
  git init
  echo "# Okada Platform" > README.md
  git add README.md
  git commit -m "Initial commit"
  # Create repository on GitHub and push
  git remote add origin git@github.com:yourusername/okada-platform.git
  git push -u origin main
  ```

### 1.3. Docker Setup
- [ ] Install Docker and Docker Compose:
  ```bash
  # For Ubuntu
  sudo apt install -y docker.io docker-compose
  sudo usermod -aG docker $USER
  
  # For macOS
  brew install --cask docker
  ```
- [ ] Verify Docker installation:
  ```bash
  docker --version
  docker-compose --version
  ```
- [ ] Create a basic docker-compose.yml file for development services:
  ```yaml
  version: '3.8'
  
  services:
    postgres:
      image: postgres:14
      environment:
        POSTGRES_USER: okada
        POSTGRES_PASSWORD: okada_dev
        POSTGRES_DB: okada_dev
      ports:
        - "5432:5432"
      volumes:
        - postgres_data:/var/lib/postgresql/data
  
    redis:
      image: redis:7
      ports:
        - "6379:6379"
  
    elasticsearch:
      image: elasticsearch:7.17.9
      environment:
        - discovery.type=single-node
        - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      ports:
        - "9200:9200"
  
  volumes:
    postgres_data:
  ```

## 2. Backend Development Environment

### 2.1. Node.js Setup
- [ ] Install Node.js 18.x LTS using NVM:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  source ~/.bashrc  # or source ~/.zshrc
  nvm install 18
  nvm use 18
  nvm alias default 18
  ```
- [ ] Verify Node.js and npm installation:
  ```bash
  node --version  # Should be v18.x.x
  npm --version   # Should be v8.x.x or higher
  ```
- [ ] Install global Node.js packages:
  ```bash
  npm install -g typescript ts-node nodemon eslint prettier
  ```

### 2.2. Backend Project Setup
- [ ] Create backend project structure:
  ```bash
  mkdir -p okada-backend
  cd okada-backend
  npm init -y
  ```
- [ ] Install essential backend dependencies:
  ```bash
  npm install express cors helmet dotenv bcrypt jsonwebtoken winston express-validator
  npm install pg prisma @prisma/client redis axios
  npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken ts-node-dev
  ```
- [ ] Initialize TypeScript configuration:
  ```bash
  npx tsc --init
  ```
- [ ] Create a basic tsconfig.json file:
  ```json
  {
    "compilerOptions": {
      "target": "es2020",
      "module": "commonjs",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "**/*.test.ts"]
  }
  ```
- [ ] Initialize Prisma:
  ```bash
  npx prisma init
  ```
- [ ] Configure .env file for backend:
  ```
  # Database
  DATABASE_URL="postgresql://okada:okada_dev@localhost:5432/okada_dev"
  
  # Redis
  REDIS_URL="redis://localhost:6379"
  
  # JWT
  JWT_SECRET="your-secret-key-change-in-production"
  JWT_EXPIRES_IN="7d"
  
  # Server
  PORT=4000
  NODE_ENV="development"
  ```

## 3. Flutter Development Environment

### 3.1. Flutter SDK Setup
- [ ] Install Flutter SDK:
  ```bash
  # For Ubuntu
  sudo snap install flutter --classic
  
  # For macOS
  brew install --cask flutter
  ```
- [ ] Verify Flutter installation:
  ```bash
  flutter --version
  flutter doctor
  ```
- [ ] Accept Android licenses:
  ```bash
  flutter doctor --android-licenses
  ```
- [ ] Install Flutter extensions for your IDE (VS Code or Android Studio)
  - For VS Code:
    - Flutter extension
    - Dart extension
  - For Android Studio:
    - Flutter plugin
    - Dart plugin

### 3.2. Android Development Setup
- [ ] Install Android Studio:
  ```bash
  # For Ubuntu
  sudo snap install android-studio --classic
  
  # For macOS
  brew install --cask android-studio
  ```
- [ ] Configure Android SDK:
  - Open Android Studio
  - Go to SDK Manager
  - Install Android SDK Platform 33 (Android 13)
  - Install Android SDK Build-Tools 33.0.0
  - Install Android SDK Command-line Tools
  - Install Android Emulator
- [ ] Create an Android Virtual Device (AVD):
  - Open Android Studio
  - Go to AVD Manager
  - Create a new virtual device (Pixel 4 with Android 13)

### 3.3. iOS Development Setup (macOS only)
- [ ] Install Xcode from the App Store
- [ ] Install Xcode Command Line Tools:
  ```bash
  xcode-select --install
  ```
- [ ] Accept Xcode license:
  ```bash
  sudo xcodebuild -license accept
  ```
- [ ] Install CocoaPods:
  ```bash
  sudo gem install cocoapods
  ```
- [ ] Verify iOS setup:
  ```bash
  flutter doctor
  ```

### 3.4. Flutter Project Setup
- [ ] Create Flutter projects for customer and rider apps:
  ```bash
  # Customer App
  flutter create --org com.okada okada_customer
  
  # Rider App
  flutter create --org com.okada okada_rider
  ```
- [ ] Configure Flutter projects for null safety:
  - Update pubspec.yaml for both projects to include:
    ```yaml
    environment:
      sdk: ">=2.17.0 <3.0.0"
      flutter: ">=3.0.0"
    ```

## 4. Web Development Environment

### 4.1. Next.js Setup
- [ ] Create Next.js project for merchant platform:
  ```bash
  npx create-next-app@latest okada-merchant --typescript
  cd okada-merchant
  ```
- [ ] Install essential web dependencies:
  ```bash
  npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
  npm install react-query axios chart.js react-chartjs-2 date-fns
  npm install -D eslint-config-prettier prettier
  ```
- [ ] Configure .env.local file for web:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:4000/api
  ```

## 5. Development Tools and Utilities

### 5.1. Database Management Tools
- [ ] Install and configure database management tools:
  ```bash
  # For Ubuntu
  sudo apt install -y pgadmin4
  
  # For macOS
  brew install --cask pgadmin4
  ```
- [ ] Install Redis management tools:
  ```bash
  # For Ubuntu
  sudo apt install -y redis-tools
  
  # For macOS
  brew install --cask another-redis-desktop-manager
  ```

### 5.2. API Testing Tools
- [ ] Install Postman:
  ```bash
  # For Ubuntu
  sudo snap install postman
  
  # For macOS
  brew install --cask postman
  ```
- [ ] Create a Postman collection for the Okada API

### 5.3. Code Quality Tools
- [ ] Configure ESLint for backend:
  ```bash
  cd okada-backend
  npm init @eslint/config
  ```
- [ ] Create .eslintrc.js file:
  ```javascript
  module.exports = {
    env: {
      node: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
      // Add custom rules here
    },
  };
  ```
- [ ] Configure Prettier:
  ```bash
  echo '{
    "singleQuote": true,
    "trailingComma": "es5",
    "printWidth": 100,
    "tabWidth": 2,
    "semi": true
  }' > .prettierrc
  ```
- [ ] Configure Flutter linting:
  - Update analysis_options.yaml in both Flutter projects:
    ```yaml
    include: package:flutter_lints/flutter.yaml
    
    linter:
      rules:
        - always_declare_return_types
        - avoid_empty_else
        - avoid_print
        - prefer_const_constructors
        - prefer_final_fields
        - sort_child_properties_last
        - use_key_in_widget_constructors
    
    analyzer:
      errors:
        missing_required_param: error
        missing_return: error
        must_be_immutable: error
    ```

### 5.4. Continuous Integration Setup
- [ ] Create GitHub Actions workflow file:
  ```bash
  mkdir -p .github/workflows
  ```
- [ ] Create backend-ci.yml:
  ```yaml
  name: Backend CI
  
  on:
    push:
      branches: [ main ]
      paths:
        - 'okada-backend/**'
    pull_request:
      branches: [ main ]
      paths:
        - 'okada-backend/**'
  
  jobs:
    build:
      runs-on: ubuntu-latest
      
      services:
        postgres:
          image: postgres:14
          env:
            POSTGRES_USER: okada
            POSTGRES_PASSWORD: okada_test
            POSTGRES_DB: okada_test
          ports:
            - 5432:5432
          options: >-
            --health-cmd pg_isready
            --health-interval 10s
            --health-timeout 5s
            --health-retries 5
            
      steps:
        - uses: actions/checkout@v3
        
        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
            cache-dependency-path: okada-backend/package-lock.json
            
        - name: Install dependencies
          working-directory: okada-backend
          run: npm ci
          
        - name: Lint
          working-directory: okada-backend
          run: npm run lint
          
        - name: Build
          working-directory: okada-backend
          run: npm run build
          
        - name: Test
          working-directory: okada-backend
          run: npm test
          env:
            DATABASE_URL: postgresql://okada:okada_test@localhost:5432/okada_test
            JWT_SECRET: test-secret
            NODE_ENV: test
  ```
- [ ] Create flutter-ci.yml:
  ```yaml
  name: Flutter CI
  
  on:
    push:
      branches: [ main ]
      paths:
        - 'okada_customer/**'
        - 'okada_rider/**'
    pull_request:
      branches: [ main ]
      paths:
        - 'okada_customer/**'
        - 'okada_rider/**'
  
  jobs:
    build:
      runs-on: ubuntu-latest
      
      steps:
        - uses: actions/checkout@v3
        
        - name: Setup Flutter
          uses: subosito/flutter-action@v2
          with:
            flutter-version: '3.10.0'
            channel: 'stable'
            
        - name: Install dependencies (Customer App)
          working-directory: okada_customer
          run: flutter pub get
          
        - name: Analyze (Customer App)
          working-directory: okada_customer
          run: flutter analyze
          
        - name: Test (Customer App)
          working-directory: okada_customer
          run: flutter test
          
        - name: Install dependencies (Rider App)
          working-directory: okada_rider
          run: flutter pub get
          
        - name: Analyze (Rider App)
          working-directory: okada_rider
          run: flutter analyze
          
        - name: Test (Rider App)
          working-directory: okada_rider
          run: flutter test
  ```
- [ ] Create web-ci.yml:
  ```yaml
  name: Web CI
  
  on:
    push:
      branches: [ main ]
      paths:
        - 'okada-merchant/**'
    pull_request:
      branches: [ main ]
      paths:
        - 'okada-merchant/**'
  
  jobs:
    build:
      runs-on: ubuntu-latest
      
      steps:
        - uses: actions/checkout@v3
        
        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
            cache-dependency-path: okada-merchant/package-lock.json
            
        - name: Install dependencies
          working-directory: okada-merchant
          run: npm ci
          
        - name: Lint
          working-directory: okada-merchant
          run: npm run lint
          
        - name: Build
          working-directory: okada-merchant
          run: npm run build
          
        - name: Test
          working-directory: okada-merchant
          run: npm test
  ```

## 6. Project Documentation Setup

### 6.1. Documentation Structure
- [ ] Create documentation directory structure:
  ```bash
  mkdir -p docs/{backend,customer-app,rider-app,merchant-platform,api,deployment}
  ```
- [ ] Create main README.md file:
  ```markdown
  # Okada Platform
  
  Quick commerce platform for Cameroon.
  
  ## Components
  
  - [Backend API](./okada-backend/README.md)
  - [Customer Mobile App](./okada_customer/README.md)
  - [Rider Mobile App](./okada_rider/README.md)
  - [Merchant Web Platform](./okada-merchant/README.md)
  
  ## Development
  
  See [Development Guide](./docs/development-guide.md) for setup instructions.
  
  ## API Documentation
  
  API documentation is available at [API Docs](./docs/api/README.md).
  
  ## License
  
  Copyright (c) 2025 Okada. All rights reserved.
  ```
- [ ] Create development-guide.md:
  ```markdown
  # Development Guide
  
  This document provides instructions for setting up the development environment for the Okada platform.
  
  ## Prerequisites
  
  - Node.js 18.x
  - Flutter 3.10.0+
  - Docker and Docker Compose
  - PostgreSQL 14
  - Redis 7
  
  ## Getting Started
  
  1. Clone the repository
  2. Set up the backend (see [Backend Setup](./backend/setup.md))
  3. Set up the customer app (see [Customer App Setup](./customer-app/setup.md))
  4. Set up the rider app (see [Rider App Setup](./rider-app/setup.md))
  5. Set up the merchant platform (see [Merchant Platform Setup](./merchant-platform/setup.md))
  
  ## Development Workflow
  
  1. Create a feature branch from `main`
  2. Implement your changes
  3. Write tests
  4. Submit a pull request
  
  ## Code Style
  
  - Backend: Follow the TypeScript style guide
  - Flutter: Follow the Dart style guide
  - Web: Follow the Next.js style guide
  ```

### 6.2. API Documentation Setup
- [ ] Install Swagger UI Express for backend:
  ```bash
  cd okada-backend
  npm install swagger-ui-express swagger-jsdoc
  npm install -D @types/swagger-ui-express @types/swagger-jsdoc
  ```
- [ ] Create initial Swagger configuration in backend:
  ```typescript
  // src/config/swagger.ts
  import swaggerJsdoc from 'swagger-jsdoc';
  
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Okada API',
        version: '1.0.0',
        description: 'API documentation for the Okada platform',
      },
      servers: [
        {
          url: 'http://localhost:4000/api',
          description: 'Development server',
        },
      ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
  };
  
  export const specs = swaggerJsdoc(options);
  ```

## 7. Version Control and Project Structure

### 7.1. Git Workflow Setup
- [ ] Create .gitignore files for each project:
  ```bash
  # Backend .gitignore
  echo 'node_modules
  dist
  .env
  .env.local
  .env.development
  .env.test
  .env.production
  coverage
  .DS_Store
  npm-debug.log*' > okada-backend/.gitignore
  
  # Flutter .gitignore (already created by Flutter)
  
  # Web .gitignore
  echo '.next
  node_modules
  .env.local
  .env.development.local
  .env.test.local
  .env.production.local
  npm-debug.log*
  .DS_Store' > okada-merchant/.gitignore
  ```
- [ ] Create branch protection rules on GitHub:
  - Require pull request reviews before merging
  - Require status checks to pass before merging
  - Require branches to be up to date before merging

### 7.2. Project Structure Finalization
- [ ] Create a monorepo structure:
  ```
  okada-platform/
  ├── okada-backend/
  ├── okada_customer/
  ├── okada_rider/
  ├── okada-merchant/
  ├── docs/
  ├── .github/
  ├── docker-compose.yml
  └── README.md
  ```
- [ ] Commit the initial project structure:
  ```bash
  git add .
  git commit -m "Set up project structure and development environment"
  git push origin main
  ```

## 8. Development Environment Verification

### 8.1. Backend Verification
- [ ] Start the backend services:
  ```bash
  docker-compose up -d
  cd okada-backend
  npm run dev
  ```
- [ ] Verify API server is running at http://localhost:4000/api
- [ ] Verify Swagger documentation is available at http://localhost:4000/api-docs

### 8.2. Flutter Verification
- [ ] Run the customer app:
  ```bash
  cd okada_customer
  flutter run
  ```
- [ ] Run the rider app:
  ```bash
  cd okada_rider
  flutter run
  ```
- [ ] Verify both apps build and run successfully on emulator/simulator

### 8.3. Web Verification
- [ ] Start the merchant platform:
  ```bash
  cd okada-merchant
  npm run dev
  ```
- [ ] Verify web application is running at http://localhost:3000

## 9. Team Collaboration Setup

### 9.1. Project Management Setup
- [ ] Set up GitHub Projects for task tracking
- [ ] Create initial project board with columns:
  - Backlog
  - Ready
  - In Progress
  - Review
  - Done
- [ ] Create initial milestones:
  - Foundation Phase
  - MVP Phase
  - Enhanced Features Phase
  - Market Expansion Phase

### 9.2. Communication Channels
- [ ] Set up Slack or Discord workspace for team communication
- [ ] Create channels for:
  - #general
  - #backend
  - #mobile
  - #web
  - #design
  - #deployment

## 10. Next Steps

- [ ] Proceed to backend services implementation
- [ ] Proceed to Flutter customer app implementation
- [ ] Proceed to Flutter rider app implementation
- [ ] Proceed to merchant web platform implementation
