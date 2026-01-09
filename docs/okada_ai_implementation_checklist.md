# Executive Summary: Okada AI-Native Implementation Plan

## Project Overview

The Okada platform represents a transformative quick commerce solution for Cameroon, built with AI at its core. This implementation plan provides a comprehensive roadmap for developing an AI-native platform that includes a customer mobile app, rider mobile app, merchant web platform, and a central AI Brain that powers intelligence across all components of the system.

## Strategic Approach

Our implementation strategy focuses on building a platform that is:

1. **AI-Native**: Intelligence is embedded throughout the platform, not added as an afterthought.
2. **Cameroon-Optimized**: Designed specifically for Cameroon's infrastructure challenges and market conditions.
3. **Offline-First**: Critical functionality works without constant internet connectivity.
4. **Resource-Efficient**: Optimized for the devices and network conditions common in the target market.
5. **Culturally Relevant**: Incorporates Cameroonian branding, languages, and business practices.

## Key Components

The implementation plan covers the development of four key components:

1. **AI Brain**: A central intelligence system that powers features across all platform components, with both cloud-based and on-device capabilities.

2. **Customer App**: A Flutter-based mobile application that provides an intuitive shopping experience with AI-powered personalization, search, and recommendations.

3. **Rider App**: A Flutter-based mobile application that optimizes delivery operations with AI-powered route optimization, order prioritization, and earnings predictions.

4. **Merchant Platform**: A Next.js-based web application that empowers dark store operators with AI-powered inventory management, demand forecasting, and operational optimization.

## Implementation Approach

The plan adopts a phased implementation approach:

1. **Foundation Phase**: Set up development environments, core infrastructure, and basic functionality.
2. **MVP Phase**: Implement essential features with basic AI capabilities.
3. **Enhanced Features Phase**: Add advanced AI features and optimize performance.
4. **Market Expansion Phase**: Scale the platform and refine AI models with real-world data.

## Technology Stack

The implementation leverages modern technologies optimized for the Cameroonian context:

- **Mobile Apps**: Flutter for cross-platform development with offline capabilities
- **Web Platform**: Next.js with React for a responsive merchant interface
- **Backend**: Node.js with Express for scalable API services
- **AI Infrastructure**: TensorFlow for model training and TFLite for on-device inference
- **Database**: PostgreSQL for relational data with MongoDB for flexible schemas
- **Cloud Infrastructure**: AWS with edge computing strategy for improved performance

## Cameroon-Specific Adaptations

The implementation plan includes specific adaptations for the Cameroonian market:

- Offline functionality for intermittent connectivity
- Lightweight app design for limited device storage
- Integration with MTN Mobile Money and Orange Money
- Bilingual support (French and English)
- Optimization for entry-level Android devices
- Cameroon flag colors (green, red, yellow) for branding

## Timeline and Resources

The implementation plan outlines an 8-month development timeline with resource allocation recommendations for each phase. The plan is designed to be executable by a team of 12-15 developers, including mobile, web, backend, and AI specialists.

This comprehensive implementation checklist provides all the technical details needed for any development team to successfully build the Okada AI-native platform for the Cameroonian market.
# Okada AI-Native Implementation Checklist

## Table of Contents

### 1. Executive Summary
- Project Overview
- Strategic Approach
- Key Components
- Implementation Approach
- Technology Stack
- Cameroon-Specific Adaptations
- Timeline and Resources

### 2. Development Environment Setup
- Development Workstation Configuration
- Version Control Setup
- CI/CD Pipeline Configuration
- Cloud Infrastructure Setup
- Local Development Environment
- AI Development Environment
- Collaboration Tools Setup

### 3. AI Brain Architecture
- Core AI Services
- Model Architecture
- Data Pipeline
- API Layer
- Offline AI Capabilities
- AI Monitoring System
- Security and Privacy Framework

### 4. Backend Services Implementation
- API Gateway
- Authentication Service
- User Service
- Product Service
- Order Service
- Payment Service
- Notification Service
- Analytics Service
- AI Integration Points

### 5. Customer App Implementation
- Project Setup
- Core Implementation
- Feature Implementation
- AI Feature Implementation
- Offline Functionality
- Performance Optimization
- Localization

### 6. Rider App Implementation
- Project Setup
- Core Implementation
- Feature Implementation
- AI Feature Implementation
- Offline Functionality
- Performance Optimization
- Localization

### 7. Merchant Platform Implementation
- Project Setup
- Core Implementation
- Feature Implementation
- AI Feature Implementation
- Performance Optimization
- Localization

### 8. Testing, Training, and Deployment
- AI Model Testing
- AI Model Training
- AI Deployment
- Cameroon-Specific Considerations
- Final Verification Checklist
- Launch Readiness Checklist

### 9. Implementation Timeline
- Phase 1: Foundation (Months 1-2)
- Phase 2: MVP (Months 3-4)
- Phase 3: Enhanced Features (Months 5-6)
- Phase 4: Market Expansion (Months 7-8)

### 10. Resource Allocation
- Team Structure
- Skill Requirements
- Hardware Requirements
- Software Requirements
- Budget Considerations

### 11. Risk Management
- Technical Risks
- Market Risks
- Operational Risks
- Mitigation Strategies

### 12. Appendices
- API Documentation
- Data Schema
- AI Model Specifications
- UI/UX Guidelines
- Coding Standards
# Development Environment Setup with AI Infrastructure

## 1. Basic Development Environment

### 1.1. Operating System Setup
- [ ] Install Ubuntu 22.04 LTS or macOS Monterey (or later) as the primary development OS
- [ ] Update the operating system to the latest version
- [ ] Install essential system utilities:
  ```bash
  # For Ubuntu
  sudo apt update
  sudo apt install -y build-essential git curl wget zip unzip python3 python3-pip python3-venv
  
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
  echo "# Okada AI Platform" > README.md
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
        
    rabbitmq:
      image: rabbitmq:3-management
      ports:
        - "5672:5672"
        - "15672:15672"
      environment:
        - RABBITMQ_DEFAULT_USER=okada
        - RABBITMQ_DEFAULT_PASS=okada_dev
  
  volumes:
    postgres_data:
  ```

## 2. AI Infrastructure Setup

### 2.1. Python Environment for AI Services
- [ ] Set up Python virtual environment:
  ```bash
  mkdir -p okada-ai-brain
  cd okada-ai-brain
  python3 -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```
- [ ] Install essential AI/ML packages:
  ```bash
  pip install --upgrade pip
  pip install numpy pandas scikit-learn tensorflow torch torchvision torchaudio
  pip install transformers sentence-transformers fastapi uvicorn pydantic
  pip install python-dotenv psycopg2-binary redis elasticsearch
  pip install pytest pytest-cov black isort flake8
  ```
- [ ] Create requirements.txt file:
  ```bash
  pip freeze > requirements.txt
  ```

### 2.2. AI Brain Service Containerization
- [ ] Create Dockerfile for AI Brain service:
  ```dockerfile
  FROM python:3.11-slim
  
  WORKDIR /app
  
  RUN apt-get update && apt-get install -y \
      build-essential \
      libpq-dev \
      && rm -rf /var/lib/apt/lists/*
  
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  
  COPY . .
  
  EXPOSE 8000
  
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```
- [ ] Add AI Brain service to docker-compose.yml:
  ```yaml
  ai-brain:
    build:
      context: ./okada-ai-brain
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./okada-ai-brain:/app
    environment:
      - DATABASE_URL=postgresql://okada:okada_dev@postgres:5432/okada_dev
      - REDIS_URL=redis://redis:6379/0
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - RABBITMQ_URL=amqp://okada:okada_dev@rabbitmq:5672/
      - MODEL_CACHE_DIR=/app/model_cache
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
      - elasticsearch
      - rabbitmq
  ```

### 2.3. Model Registry Setup
- [ ] Create model registry directory structure:
  ```bash
  mkdir -p okada-ai-brain/model_registry/{recommendation,demand_forecast,route_optimization,sentiment_analysis,image_recognition,nlp}
  ```
- [ ] Create model registry configuration file:
  ```bash
  cat > okada-ai-brain/model_registry/config.json << EOF
  {
    "models": {
      "recommendation": {
        "default": "hybrid_recommender_v1",
        "versions": {
          "hybrid_recommender_v1": {
            "path": "recommendation/hybrid_recommender_v1",
            "type": "pytorch",
            "input_format": "json",
            "output_format": "json",
            "description": "Hybrid recommendation model combining collaborative filtering and content-based approaches"
          }
        }
      },
      "demand_forecast": {
        "default": "time_series_forecast_v1",
        "versions": {
          "time_series_forecast_v1": {
            "path": "demand_forecast/time_series_forecast_v1",
            "type": "tensorflow",
            "input_format": "json",
            "output_format": "json",
            "description": "Time series forecasting model for predicting product demand"
          }
        }
      },
      "route_optimization": {
        "default": "delivery_route_optimizer_v1",
        "versions": {
          "delivery_route_optimizer_v1": {
            "path": "route_optimization/delivery_route_optimizer_v1",
            "type": "custom",
            "input_format": "json",
            "output_format": "json",
            "description": "Delivery route optimization algorithm considering traffic, distance, and order priority"
          }
        }
      },
      "sentiment_analysis": {
        "default": "customer_feedback_analyzer_v1",
        "versions": {
          "customer_feedback_analyzer_v1": {
            "path": "sentiment_analysis/customer_feedback_analyzer_v1",
            "type": "transformers",
            "input_format": "text",
            "output_format": "json",
            "description": "Sentiment analysis model for customer feedback and reviews"
          }
        }
      },
      "image_recognition": {
        "default": "product_image_classifier_v1",
        "versions": {
          "product_image_classifier_v1": {
            "path": "image_recognition/product_image_classifier_v1",
            "type": "pytorch",
            "input_format": "image",
            "output_format": "json",
            "description": "Image recognition model for product classification and verification"
          }
        }
      },
      "nlp": {
        "default": "multilingual_text_processor_v1",
        "versions": {
          "multilingual_text_processor_v1": {
            "path": "nlp/multilingual_text_processor_v1",
            "type": "transformers",
            "input_format": "text",
            "output_format": "json",
            "description": "Multilingual NLP model for text processing in French and English"
          }
        }
      }
    }
  }
  EOF
  ```

### 2.4. AI Model Download Scripts
- [ ] Create script to download pre-trained models:
  ```bash
  cat > okada-ai-brain/download_models.py << EOF
  import os
  import json
  import torch
  import tensorflow as tf
  from transformers import AutoTokenizer, AutoModel, pipeline
  
  # Create model cache directory
  os.makedirs("model_cache", exist_ok=True)
  
  # Load model registry config
  with open("model_registry/config.json", "r") as f:
      config = json.load(f)
  
  # Download and cache models
  def download_models():
      print("Downloading pre-trained models...")
      
      # Recommendation model (PyTorch based)
      print("Setting up recommendation model...")
      os.makedirs("model_registry/recommendation/hybrid_recommender_v1", exist_ok=True)
      
      # Demand forecasting model (TensorFlow based)
      print("Setting up demand forecasting model...")
      os.makedirs("model_registry/demand_forecast/time_series_forecast_v1", exist_ok=True)
      
      # Route optimization algorithm
      print("Setting up route optimization algorithm...")
      os.makedirs("model_registry/route_optimization/delivery_route_optimizer_v1", exist_ok=True)
      
      # Sentiment analysis model (Transformers based)
      print("Setting up sentiment analysis model...")
      sentiment_model_path = "model_registry/sentiment_analysis/customer_feedback_analyzer_v1"
      os.makedirs(sentiment_model_path, exist_ok=True)
      sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
      sentiment_analyzer.save_pretrained(sentiment_model_path)
      
      # Image recognition model (PyTorch based)
      print("Setting up image recognition model...")
      os.makedirs("model_registry/image_recognition/product_image_classifier_v1", exist_ok=True)
      
      # Multilingual NLP model (Transformers based)
      print("Setting up multilingual NLP model...")
      nlp_model_path = "model_registry/nlp/multilingual_text_processor_v1"
      os.makedirs(nlp_model_path, exist_ok=True)
      tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-base")
      model = AutoModel.from_pretrained("xlm-roberta-base")
      tokenizer.save_pretrained(nlp_model_path)
      model.save_pretrained(nlp_model_path)
      
      print("All models downloaded and cached successfully!")
  
  if __name__ == "__main__":
      download_models()
  EOF
  ```
- [ ] Run the model download script:
  ```bash
  cd okada-ai-brain
  python download_models.py
  ```

### 2.5. AI Brain API Structure
- [ ] Create FastAPI application structure:
  ```bash
  mkdir -p okada-ai-brain/app/{api,core,db,models,services,utils}
  touch okada-ai-brain/app/__init__.py
  touch okada-ai-brain/app/main.py
  touch okada-ai-brain/app/api/__init__.py
  touch okada-ai-brain/app/core/__init__.py
  touch okada-ai-brain/app/db/__init__.py
  touch okada-ai-brain/app/models/__init__.py
  touch okada-ai-brain/app/services/__init__.py
  touch okada-ai-brain/app/utils/__init__.py
  ```
- [ ] Create main FastAPI application file:
  ```bash
  cat > okada-ai-brain/app/main.py << EOF
  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
  
  app = FastAPI(
      title="Okada AI Brain",
      description="Central AI service for the Okada platform",
      version="1.0.0",
  )
  
  # Configure CORS
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],  # Restrict in production
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  
  @app.get("/")
  async def root():
      return {"message": "Welcome to Okada AI Brain"}
  
  @app.get("/health")
  async def health_check():
      return {"status": "healthy"}
  
  # Import and include API routers
  # This will be expanded as we implement the AI services
  
  if __name__ == "__main__":
      import uvicorn
      uvicorn.run(app, host="0.0.0.0", port=8000)
  EOF
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

### 3.4. Flutter Project Setup with AI Integration
- [ ] Create Flutter projects for customer and rider apps:
  ```bash
  # Customer App
  flutter create --org com.okada --platforms=android,ios okada_customer
  
  # Rider App
  flutter create --org com.okada --platforms=android,ios okada_rider
  ```
- [ ] Configure Flutter projects for null safety:
  - Update pubspec.yaml for both projects to include:
    ```yaml
    environment:
      sdk: ">=2.17.0 <3.0.0"
      flutter: ">=3.0.0"
    ```
- [ ] Add AI integration packages to pubspec.yaml for both projects:
  ```yaml
  dependencies:
    flutter:
      sdk: flutter
    cupertino_icons: ^1.0.5
    # State management
    flutter_bloc: ^8.1.2
    provider: ^6.0.5
    # Networking
    dio: ^5.1.2
    connectivity_plus: ^4.0.1
    # Local storage
    hive: ^2.2.3
    hive_flutter: ^1.1.0
    shared_preferences: ^2.1.1
    # UI components
    flutter_screenutil: ^5.8.4
    cached_network_image: ^3.2.3
    shimmer: ^3.0.0
    # Location and maps
    google_maps_flutter: ^2.2.8
    location: ^4.4.0
    # AI integration
    tflite_flutter: ^0.10.1
    flutter_pytorch: ^1.0.1
    # ML Kit for on-device ML
    google_mlkit_text_recognition: ^0.8.0
    google_mlkit_image_labeling: ^0.8.0
    google_mlkit_face_detection: ^0.8.0
    # Camera
    camera: ^0.10.5+2
    # Internationalization
    flutter_localizations:
      sdk: flutter
    intl: ^0.18.0
    # Utils
    logger: ^1.3.0
    path_provider: ^2.0.15
    permission_handler: ^10.2.0
    # Testing
    mockito: ^5.4.0
    
  dev_dependencies:
    flutter_test:
      sdk: flutter
    flutter_lints: ^2.0.1
    build_runner: ^2.4.4
    hive_generator: ^2.0.0
    flutter_launcher_icons: ^0.13.1
    flutter_native_splash: ^2.3.0
  ```

### 3.5. Flutter Project Structure for AI Integration
- [ ] Create enhanced project structure for both apps:
  ```bash
  # For both okada_customer and okada_rider
  mkdir -p lib/{core,data,domain,presentation,ai_integration}
  mkdir -p lib/core/{config,constants,errors,network,storage,utils}
  mkdir -p lib/data/{datasources,models,repositories}
  mkdir -p lib/domain/{entities,repositories,usecases}
  mkdir -p lib/presentation/{bloc,pages,widgets}
  mkdir -p lib/ai_integration/{models,services,utils}
  ```
- [ ] Create AI integration configuration:
  ```bash
  # For both projects
  mkdir -p assets/{ml_models,images,icons,fonts}
  ```

## 4. Backend Development Environment

### 4.1. Node.js Setup
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

### 4.2. Backend Project Setup with AI Brain Integration
- [ ] Create backend project structure:
  ```bash
  mkdir -p okada-backend
  cd okada-backend
  npm init -y
  ```
- [ ] Install essential backend dependencies:
  ```bash
  npm install express cors helmet dotenv bcrypt jsonwebtoken winston express-validator
  npm install pg prisma @prisma/client redis elasticsearch amqplib
  npm install axios node-fetch@2 socket.io
  npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/amqplib ts-node-dev
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
  
  # Elasticsearch
  ELASTICSEARCH_URL="http://localhost:9200"
  
  # RabbitMQ
  RABBITMQ_URL="amqp://okada:okada_dev@localhost:5672/"
  
  # AI Brain
  AI_BRAIN_URL="http://localhost:8000"
  
  # JWT
  JWT_SECRET="your-secret-key-change-in-production"
  JWT_EXPIRES_IN="7d"
  
  # Server
  PORT=4000
  NODE_ENV="development"
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
- [ ] Create a Postman collection for the Okada API and AI Brain API

### 5.3. AI Development and Testing Tools
- [ ] Install TensorBoard for model visualization:
  ```bash
  pip install tensorboard
  ```
- [ ] Install Jupyter for interactive model development:
  ```bash
  pip install jupyter
  ```
- [ ] Install MLflow for experiment tracking:
  ```bash
  pip install mlflow
  ```
- [ ] Configure MLflow:
  ```bash
  mkdir -p okada-ai-brain/mlflow
  cat > okada-ai-brain/mlflow_config.py << EOF
  import os
  import mlflow
  
  os.environ["MLFLOW_TRACKING_URI"] = "file:./mlflow"
  mlflow.set_tracking_uri("file:./mlflow")
  EOF
  ```

### 5.4. Code Quality Tools
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

## 6. Continuous Integration Setup

### 6.1. GitHub Actions for AI Components
- [ ] Create GitHub Actions workflow file for AI Brain:
  ```bash
  mkdir -p .github/workflows
  ```
- [ ] Create ai-brain-ci.yml:
  ```yaml
  name: AI Brain CI
  
  on:
    push:
      branches: [ main ]
      paths:
        - 'okada-ai-brain/**'
    pull_request:
      branches: [ main ]
      paths:
        - 'okada-ai-brain/**'
  
  jobs:
    build:
      runs-on: ubuntu-latest
      
      steps:
        - uses: actions/checkout@v3
        
        - name: Set up Python
          uses: actions/setup-python@v4
          with:
            python-version: '3.11'
            cache: 'pip'
            
        - name: Install dependencies
          working-directory: okada-ai-brain
          run: |
            python -m pip install --upgrade pip
            if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
            pip install pytest pytest-cov flake8 black isort
            
        - name: Lint with flake8
          working-directory: okada-ai-brain
          run: |
            flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
            flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
            
        - name: Check formatting with black
          working-directory: okada-ai-brain
          run: |
            black --check .
            
        - name: Check imports with isort
          working-directory: okada-ai-brain
          run: |
            isort --check-only --profile black .
            
        - name: Test with pytest
          working-directory: okada-ai-brain
          run: |
            pytest --cov=app
  ```

### 6.2. GitHub Actions for Flutter Apps
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

### 6.3. GitHub Actions for Backend
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
            AI_BRAIN_URL: http://localhost:8000
  ```

## 7. Project Documentation Setup

### 7.1. Documentation Structure
- [ ] Create documentation directory structure:
  ```bash
  mkdir -p docs/{ai-brain,backend,customer-app,rider-app,api,deployment,ml-models}
  ```
- [ ] Create main README.md file:
  ```markdown
  # Okada AI Platform
  
  AI-native quick commerce platform for Cameroon.
  
  ## Components
  
  - [AI Brain](./okada-ai-brain/README.md) - Central AI service
  - [Backend API](./okada-backend/README.md) - Backend services
  - [Customer Mobile App](./okada_customer/README.md) - Flutter customer app
  - [Rider Mobile App](./okada_rider/README.md) - Flutter rider app
  
  ## Development
  
  See [Development Guide](./docs/development-guide.md) for setup instructions.
  
  ## AI Features
  
  - Personalized product recommendations
  - Demand forecasting and inventory optimization
  - Intelligent route optimization for deliveries
  - Natural language processing for search and support
  - Computer vision for product recognition and quality control
  - Sentiment analysis for customer feedback
  
  ## API Documentation
  
  API documentation is available at [API Docs](./docs/api/README.md).
  
  ## License
  
  Copyright (c) 2025 Okada. All rights reserved.
  ```
- [ ] Create AI Brain README.md:
  ```markdown
  # Okada AI Brain
  
  Central AI service for the Okada platform.
  
  ## Features
  
  - Recommendation Engine
  - Demand Forecasting
  - Route Optimization
  - Sentiment Analysis
  - Image Recognition
  - Natural Language Processing
  
  ## Setup
  
  1. Install dependencies: `pip install -r requirements.txt`
  2. Download models: `python download_models.py`
  3. Start the service: `uvicorn app.main:app --reload`
  
  ## API Documentation
  
  API documentation is available at http://localhost:8000/docs when the service is running.
  
  ## Model Registry
  
  The model registry contains all AI models used by the platform. See [Model Registry](./model_registry/README.md) for details.
  ```

### 7.2. API Documentation Setup
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

## 8. Development Environment Verification

### 8.1. AI Brain Verification
- [ ] Start the AI Brain service:
  ```bash
  cd okada-ai-brain
  source venv/bin/activate
  uvicorn app.main:app --reload
  ```
- [ ] Verify AI Brain API is running at http://localhost:8000
- [ ] Verify Swagger documentation is available at http://localhost:8000/docs

### 8.2. Backend Verification
- [ ] Start the backend services:
  ```bash
  docker-compose up -d
  cd okada-backend
  npm run dev
  ```
- [ ] Verify API server is running at http://localhost:4000/api
- [ ] Verify Swagger documentation is available at http://localhost:4000/api-docs

### 8.3. Flutter Verification
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

## 9. Next Steps

- [ ] Proceed to AI Brain architecture and implementation
- [ ] Proceed to backend services implementation with AI integration
- [ ] Proceed to Flutter customer app implementation with AI features
- [ ] Proceed to Flutter rider app implementation with AI features
# AI Brain Architecture and Implementation Checklist

## 1. AI Brain Core Architecture

### 1.1. System Architecture Overview

- [ ] Create the AI Brain core architecture diagram:
  ```bash
  mkdir -p okada-ai-brain/docs/architecture
  touch okada-ai-brain/docs/architecture/ai_brain_architecture.md
  ```

- [ ] Define the AI Brain architecture with the following components:

  ```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                           OKADA AI BRAIN                                │
  │                                                                         │
  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐  │
  │  │ API Gateway │────│ AI Workflow │────│ Model       │────│ Model    │  │
  │  │ Layer       │    │ Orchestrator│    │ Registry    │    │ Serving  │  │
  │  └─────────────┘    └─────────────┘    └─────────────┘    └──────────┘  │
  │         │                  │                  │                │        │
  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐  │
  │  │ Security &  │    │ AI Service  │    │ Feature     │    │ Model    │  │
  │  │ Auth Layer  │    │ Modules     │    │ Store       │    │ Training │  │
  │  └─────────────┘    └─────────────┘    └─────────────┘    └──────────┘  │
  │         │                  │                  │                │        │
  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐  │
  │  │ Monitoring  │    │ Data        │    │ Knowledge   │    │ Event    │  │
  │  │ & Logging   │    │ Pipeline    │    │ Graph       │    │ Bus      │  │
  │  └─────────────┘    └─────────────┘    └─────────────┘    └──────────┘  │
  │                                                                         │
  └─────────────────────────────────────────────────────────────────────────┘
  ```

### 1.2. Define AI Brain Color Scheme (Cameroon Flag Colors)

- [ ] Create a color scheme configuration file:
  ```bash
  mkdir -p okada-ai-brain/app/core/config
  touch okada-ai-brain/app/core/config/branding.py
  ```

- [ ] Define the Cameroon flag color scheme:
  ```python
  # app/core/config/branding.py
  
  # Cameroon Flag Colors
  BRAND_GREEN = "#007A5E"  # Green
  BRAND_RED = "#CE1126"    # Red
  BRAND_YELLOW = "#FCD116" # Yellow
  
  # Extended Color Palette
  BRAND_DARK_GREEN = "#005E48"
  BRAND_LIGHT_GREEN = "#00A67E"
  BRAND_DARK_RED = "#A50D1F"
  BRAND_LIGHT_RED = "#E73E51"
  BRAND_DARK_YELLOW = "#DBAD00"
  BRAND_LIGHT_YELLOW = "#FFDE59"
  
  # Neutral Colors
  BRAND_BLACK = "#000000"
  BRAND_WHITE = "#FFFFFF"
  BRAND_GRAY_DARK = "#333333"
  BRAND_GRAY_MEDIUM = "#666666"
  BRAND_GRAY_LIGHT = "#CCCCCC"
  
  # Semantic Colors
  SUCCESS_COLOR = BRAND_GREEN
  ERROR_COLOR = BRAND_RED
  WARNING_COLOR = BRAND_YELLOW
  INFO_COLOR = "#3498DB"
  
  # Color Scheme for UI Components
  UI_PRIMARY_COLOR = BRAND_GREEN
  UI_SECONDARY_COLOR = BRAND_YELLOW
  UI_ACCENT_COLOR = BRAND_RED
  UI_BACKGROUND_COLOR = BRAND_WHITE
  UI_TEXT_COLOR = BRAND_BLACK
  ```

## 2. AI Brain Core Components Implementation

### 2.1. API Gateway Layer

- [ ] Create API gateway module structure:
  ```bash
  mkdir -p okada-ai-brain/app/api/v1
  touch okada-ai-brain/app/api/v1/__init__.py
  touch okada-ai-brain/app/api/v1/api.py
  ```

- [ ] Implement API router:
  ```python
  # app/api/v1/api.py
  from fastapi import APIRouter
  
  from app.api.v1.endpoints import (
      recommendation,
      demand_forecast,
      route_optimization,
      sentiment_analysis,
      image_recognition,
      nlp,
      health,
  )
  
  api_router = APIRouter()
  
  api_router.include_router(health.router, prefix="/health", tags=["health"])
  api_router.include_router(recommendation.router, prefix="/recommendation", tags=["recommendation"])
  api_router.include_router(demand_forecast.router, prefix="/demand-forecast", tags=["demand-forecast"])
  api_router.include_router(route_optimization.router, prefix="/route-optimization", tags=["route-optimization"])
  api_router.include_router(sentiment_analysis.router, prefix="/sentiment-analysis", tags=["sentiment-analysis"])
  api_router.include_router(image_recognition.router, prefix="/image-recognition", tags=["image-recognition"])
  api_router.include_router(nlp.router, prefix="/nlp", tags=["nlp"])
  ```

- [ ] Create endpoint modules:
  ```bash
  mkdir -p okada-ai-brain/app/api/v1/endpoints
  touch okada-ai-brain/app/api/v1/endpoints/__init__.py
  touch okada-ai-brain/app/api/v1/endpoints/health.py
  touch okada-ai-brain/app/api/v1/endpoints/recommendation.py
  touch okada-ai-brain/app/api/v1/endpoints/demand_forecast.py
  touch okada-ai-brain/app/api/v1/endpoints/route_optimization.py
  touch okada-ai-brain/app/api/v1/endpoints/sentiment_analysis.py
  touch okada-ai-brain/app/api/v1/endpoints/image_recognition.py
  touch okada-ai-brain/app/api/v1/endpoints/nlp.py
  ```

- [ ] Implement health check endpoint:
  ```python
  # app/api/v1/endpoints/health.py
  from fastapi import APIRouter, Depends
  from pydantic import BaseModel
  
  from app.core.config import settings
  from app.services.model_registry import ModelRegistry
  
  router = APIRouter()
  
  
  class HealthResponse(BaseModel):
      status: str
      version: str
      environment: str
      model_registry_status: str
  
  
  @router.get("", response_model=HealthResponse)
  async def health_check(model_registry: ModelRegistry = Depends()):
      """
      Health check endpoint to verify the AI Brain service is running correctly.
      """
      return HealthResponse(
          status="healthy",
          version=settings.VERSION,
          environment=settings.ENVIRONMENT,
          model_registry_status=model_registry.status,
      )
  ```

### 2.2. Security & Auth Layer

- [ ] Create security module:
  ```bash
  mkdir -p okada-ai-brain/app/core/security
  touch okada-ai-brain/app/core/security/__init__.py
  touch okada-ai-brain/app/core/security/api_key.py
  touch okada-ai-brain/app/core/security/jwt.py
  ```

- [ ] Implement API key authentication:
  ```python
  # app/core/security/api_key.py
  from fastapi import Security, HTTPException, Depends
  from fastapi.security.api_key import APIKeyHeader
  from starlette.status import HTTP_403_FORBIDDEN
  
  from app.core.config import settings
  
  api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
  
  
  async def get_api_key(api_key_header: str = Security(api_key_header)):
      if api_key_header == settings.API_KEY:
          return api_key_header
      raise HTTPException(
          status_code=HTTP_403_FORBIDDEN, detail="Could not validate API key"
      )
  ```

- [ ] Implement JWT authentication:
  ```python
  # app/core/security/jwt.py
  from datetime import datetime, timedelta
  from typing import Any, Optional
  
  import jwt
  from fastapi import Depends, HTTPException, Security
  from fastapi.security import OAuth2PasswordBearer
  from jwt import PyJWTError
  from pydantic import BaseModel
  from starlette.status import HTTP_401_UNAUTHORIZED
  
  from app.core.config import settings
  
  oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
  
  
  class TokenPayload(BaseModel):
      sub: str
      exp: int
  
  
  def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
      if expires_delta:
          expire = datetime.utcnow() + expires_delta
      else:
          expire = datetime.utcnow() + timedelta(
              minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
          )
      to_encode = {"exp": expire, "sub": subject}
      encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
      return encoded_jwt
  
  
  async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
      try:
          payload = jwt.decode(
              token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
          )
          token_data = TokenPayload(**payload)
      except PyJWTError:
          raise HTTPException(
              status_code=HTTP_401_UNAUTHORIZED,
              detail="Could not validate credentials",
          )
  
      return token_data.sub
  ```

### 2.3. AI Workflow Orchestrator

- [ ] Create workflow orchestrator module:
  ```bash
  mkdir -p okada-ai-brain/app/core/workflow
  touch okada-ai-brain/app/core/workflow/__init__.py
  touch okada-ai-brain/app/core/workflow/orchestrator.py
  touch okada-ai-brain/app/core/workflow/workflow.py
  ```

- [ ] Implement workflow orchestrator:
  ```python
  # app/core/workflow/orchestrator.py
  from typing import Dict, Any, List, Type
  
  from app.core.workflow.workflow import Workflow
  
  
  class WorkflowOrchestrator:
      """
      Orchestrates AI workflows by managing their execution, dependencies, and state.
      """
  
      def __init__(self):
          self.workflows: Dict[str, Type[Workflow]] = {}
  
      def register_workflow(self, workflow_id: str, workflow_class: Type[Workflow]):
          """Register a workflow with the orchestrator."""
          self.workflows[workflow_id] = workflow_class
  
      async def execute_workflow(
          self, workflow_id: str, input_data: Dict[str, Any]
      ) -> Dict[str, Any]:
          """Execute a workflow with the given input data."""
          if workflow_id not in self.workflows:
              raise ValueError(f"Workflow {workflow_id} not found")
  
          workflow = self.workflows[workflow_id]()
          result = await workflow.execute(input_data)
          return result
  
      async def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
          """Get the status of a registered workflow."""
          if workflow_id not in self.workflows:
              raise ValueError(f"Workflow {workflow_id} not found")
  
          workflow_class = self.workflows[workflow_id]
          return {
              "id": workflow_id,
              "name": workflow_class.__name__,
              "description": workflow_class.__doc__,
              "steps": workflow_class.get_steps(),
          }
  
      def list_workflows(self) -> List[Dict[str, Any]]:
          """List all registered workflows."""
          return [
              {
                  "id": workflow_id,
                  "name": workflow_class.__name__,
                  "description": workflow_class.__doc__,
              }
              for workflow_id, workflow_class in self.workflows.items()
          ]
  ```

- [ ] Implement workflow base class:
  ```python
  # app/core/workflow/workflow.py
  from abc import ABC, abstractmethod
  from typing import Dict, Any, List, ClassVar
  
  
  class Workflow(ABC):
      """
      Base class for AI workflows.
      """
  
      name: ClassVar[str]
      description: ClassVar[str]
      steps: ClassVar[List[str]]
  
      @abstractmethod
      async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
          """Execute the workflow with the given input data."""
          pass
  
      @classmethod
      def get_steps(cls) -> List[str]:
          """Get the steps of the workflow."""
          return cls.steps
  ```

### 2.4. Model Registry

- [ ] Create model registry module:
  ```bash
  mkdir -p okada-ai-brain/app/services/model_registry
  touch okada-ai-brain/app/services/model_registry/__init__.py
  touch okada-ai-brain/app/services/model_registry/registry.py
  touch okada-ai-brain/app/services/model_registry/model.py
  ```

- [ ] Implement model registry:
  ```python
  # app/services/model_registry/registry.py
  import json
  import os
  from typing import Dict, Any, Optional, List
  
  from app.services.model_registry.model import Model
  
  
  class ModelRegistry:
      """
      Registry for AI models used by the AI Brain.
      """
  
      def __init__(self, config_path: str = "model_registry/config.json"):
          self.config_path = config_path
          self.models: Dict[str, Dict[str, Model]] = {}
          self.status = "initializing"
          self._load_config()
  
      def _load_config(self):
          """Load model registry configuration from file."""
          try:
              with open(self.config_path, "r") as f:
                  config = json.load(f)
  
              for model_type, model_config in config["models"].items():
                  self.models[model_type] = {}
                  default_version = model_config["default"]
  
                  for version, version_config in model_config["versions"].items():
                      model = Model(
                          model_type=model_type,
                          version=version,
                          path=version_config["path"],
                          model_format=version_config["type"],
                          input_format=version_config["input_format"],
                          output_format=version_config["output_format"],
                          description=version_config["description"],
                          is_default=(version == default_version),
                      )
                      self.models[model_type][version] = model
  
              self.status = "ready"
          except Exception as e:
              self.status = f"error: {str(e)}"
              raise
  
      def get_model(
          self, model_type: str, version: Optional[str] = None
      ) -> Model:
          """
          Get a model from the registry.
          If version is not specified, returns the default version.
          """
          if model_type not in self.models:
              raise ValueError(f"Model type {model_type} not found in registry")
  
          if version is None:
              # Find default version
              for model in self.models[model_type].values():
                  if model.is_default:
                      return model
              # If no default is marked, return the first one
              return next(iter(self.models[model_type].values()))
  
          if version not in self.models[model_type]:
              raise ValueError(
                  f"Model version {version} not found for type {model_type}"
              )
  
          return self.models[model_type][version]
  
      def list_models(self) -> Dict[str, List[Dict[str, Any]]]:
          """List all models in the registry."""
          result = {}
          for model_type, models in self.models.items():
              result[model_type] = [
                  {
                      "version": model.version,
                      "description": model.description,
                      "is_default": model.is_default,
                  }
                  for model in models.values()
              ]
          return result
  
      def register_model(self, model: Model):
          """Register a new model or update an existing one."""
          if model.model_type not in self.models:
              self.models[model.model_type] = {}
  
          self.models[model.model_type][model.version] = model
  
          # Update config file
          self._update_config()
  
      def _update_config(self):
          """Update the config file with the current registry state."""
          config = {"models": {}}
  
          for model_type, models in self.models.items():
              default_version = next(
                  (m.version for m in models.values() if m.is_default),
                  next(iter(models.values())).version if models else None,
              )
  
              config["models"][model_type] = {
                  "default": default_version,
                  "versions": {},
              }
  
              for version, model in models.items():
                  config["models"][model_type]["versions"][version] = {
                      "path": model.path,
                      "type": model.model_format,
                      "input_format": model.input_format,
                      "output_format": model.output_format,
                      "description": model.description,
                  }
  
          # Ensure directory exists
          os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
  
          with open(self.config_path, "w") as f:
              json.dump(config, f, indent=2)
  ```

- [ ] Implement model class:
  ```python
  # app/services/model_registry/model.py
  from typing import Optional, Dict, Any, Union
  import os
  
  
  class Model:
      """
      Represents an AI model in the registry.
      """
  
      def __init__(
          self,
          model_type: str,
          version: str,
          path: str,
          model_format: str,
          input_format: str,
          output_format: str,
          description: str,
          is_default: bool = False,
      ):
          self.model_type = model_type
          self.version = version
          self.path = path
          self.model_format = model_format
          self.input_format = input_format
          self.output_format = output_format
          self.description = description
          self.is_default = is_default
          self._model_instance = None
  
      def get_full_path(self) -> str:
          """Get the full path to the model files."""
          return os.path.join("model_registry", self.path)
  
      async def load(self):
          """Load the model into memory."""
          if self._model_instance is not None:
              return
  
          if self.model_format == "pytorch":
              await self._load_pytorch_model()
          elif self.model_format == "tensorflow":
              await self._load_tensorflow_model()
          elif self.model_format == "transformers":
              await self._load_transformers_model()
          elif self.model_format == "custom":
              await self._load_custom_model()
          else:
              raise ValueError(f"Unsupported model format: {self.model_format}")
  
      async def _load_pytorch_model(self):
          """Load a PyTorch model."""
          import torch
          try:
              self._model_instance = torch.load(
                  os.path.join(self.get_full_path(), "model.pt")
              )
          except FileNotFoundError:
              # Model file doesn't exist yet, will be created during training
              pass
  
      async def _load_tensorflow_model(self):
          """Load a TensorFlow model."""
          import tensorflow as tf
          try:
              self._model_instance = tf.keras.models.load_model(self.get_full_path())
          except (FileNotFoundError, IOError):
              # Model file doesn't exist yet, will be created during training
              pass
  
      async def _load_transformers_model(self):
          """Load a Transformers model."""
          from transformers import AutoModel, AutoTokenizer
          try:
              self._model_instance = {
                  "model": AutoModel.from_pretrained(self.get_full_path()),
                  "tokenizer": AutoTokenizer.from_pretrained(self.get_full_path()),
              }
          except (FileNotFoundError, IOError):
              # Model file doesn't exist yet, will be created during training
              pass
  
      async def _load_custom_model(self):
          """Load a custom model implementation."""
          import importlib.util
          try:
              spec = importlib.util.spec_from_file_location(
                  "model", os.path.join(self.get_full_path(), "model.py")
              )
              module = importlib.util.module_from_spec(spec)
              spec.loader.exec_module(module)
              self._model_instance = module.Model()
          except FileNotFoundError:
              # Model file doesn't exist yet, will be created during training
              pass
  
      async def predict(
          self, input_data: Union[Dict[str, Any], str, bytes]
      ) -> Dict[str, Any]:
          """
          Make a prediction using the model.
          """
          if self._model_instance is None:
              await self.load()
  
          if self._model_instance is None:
              raise RuntimeError(f"Model {self.model_type}/{self.version} failed to load")
  
          # Process input based on format
          processed_input = self._preprocess_input(input_data)
  
          # Make prediction
          if self.model_format == "pytorch":
              result = await self._predict_pytorch(processed_input)
          elif self.model_format == "tensorflow":
              result = await self._predict_tensorflow(processed_input)
          elif self.model_format == "transformers":
              result = await self._predict_transformers(processed_input)
          elif self.model_format == "custom":
              result = await self._predict_custom(processed_input)
          else:
              raise ValueError(f"Unsupported model format: {self.model_format}")
  
          # Process output
          return self._postprocess_output(result)
  
      def _preprocess_input(self, input_data: Union[Dict[str, Any], str, bytes]):
          """Preprocess input data based on the model's input format."""
          # Implementation depends on the specific model requirements
          return input_data
  
      def _postprocess_output(self, output):
          """Postprocess model output to the expected format."""
          # Implementation depends on the specific model requirements
          return output
  
      async def _predict_pytorch(self, processed_input):
          """Make prediction with PyTorch model."""
          import torch
          with torch.no_grad():
              return self._model_instance(processed_input)
  
      async def _predict_tensorflow(self, processed_input):
          """Make prediction with TensorFlow model."""
          return self._model_instance.predict(processed_input)
  
      async def _predict_transformers(self, processed_input):
          """Make prediction with Transformers model."""
          tokenizer = self._model_instance["tokenizer"]
          model = self._model_instance["model"]
          inputs = tokenizer(processed_input, return_tensors="pt")
          outputs = model(**inputs)
          return outputs
  
      async def _predict_custom(self, processed_input):
          """Make prediction with custom model."""
          return self._model_instance.predict(processed_input)
  ```

### 2.5. Model Serving

- [ ] Create model serving module:
  ```bash
  mkdir -p okada-ai-brain/app/services/model_serving
  touch okada-ai-brain/app/services/model_serving/__init__.py
  touch okada-ai-brain/app/services/model_serving/service.py
  ```

- [ ] Implement model serving service:
  ```python
  # app/services/model_serving/service.py
  from typing import Dict, Any, Optional, Union
  
  from app.services.model_registry import ModelRegistry
  
  
  class ModelServingService:
      """
      Service for serving AI models.
      """
  
      def __init__(self, model_registry: ModelRegistry):
          self.model_registry = model_registry
  
      async def predict(
          self,
          model_type: str,
          input_data: Union[Dict[str, Any], str, bytes],
          version: Optional[str] = None,
      ) -> Dict[str, Any]:
          """
          Make a prediction using a model.
          """
          model = self.model_registry.get_model(model_type, version)
          result = await model.predict(input_data)
          return result
  ```

## 3. AI Service Modules Implementation

### 3.1. Recommendation Engine

- [ ] Create recommendation service module:
  ```bash
  mkdir -p okada-ai-brain/app/services/recommendation
  touch okada-ai-brain/app/services/recommendation/__init__.py
  touch okada-ai-brain/app/services/recommendation/service.py
  touch okada-ai-brain/app/services/recommendation/models.py
  ```

- [ ] Implement recommendation service:
  ```python
  # app/services/recommendation/service.py
  from typing import List, Dict, Any, Optional
  
  from app.services.model_serving.service import ModelServingService
  from app.services.recommendation.models import (
      ProductRecommendationRequest,
      ProductRecommendationResponse,
      RecommendationItem,
  )
  
  
  class RecommendationService:
      """
      Service for generating personalized product recommendations.
      """
  
      def __init__(self, model_serving_service: ModelServingService):
          self.model_serving_service = model_serving_service
  
      async def get_product_recommendations(
          self, request: ProductRecommendationRequest
      ) -> ProductRecommendationResponse:
          """
          Get personalized product recommendations for a user.
          """
          # Prepare input data for the model
          input_data = {
              "user_id": request.user_id,
              "product_id": request.product_id,
              "category_id": request.category_id,
              "limit": request.limit,
              "context": request.context.dict() if request.context else {},
          }
  
          # Get recommendations from the model
          result = await self.model_serving_service.predict(
              "recommendation", input_data
          )
  
          # Process the model output
          recommendations = [
              RecommendationItem(
                  product_id=item["product_id"],
                  score=item["score"],
                  reason=item["reason"],
              )
              for item in result.get("recommendations", [])
          ]
  
          return ProductRecommendationResponse(
              recommendations=recommendations,
              request_id=result.get("request_id", ""),
              model_version=result.get("model_version", ""),
          )
  ```

- [ ] Implement recommendation models:
  ```python
  # app/services/recommendation/models.py
  from typing import List, Dict, Any, Optional
  from pydantic import BaseModel
  
  
  class RecommendationContext(BaseModel):
      """Context information for recommendation requests."""
      location: Optional[str] = None
      time_of_day: Optional[str] = None
      day_of_week: Optional[str] = None
      weather: Optional[str] = None
      recent_searches: Optional[List[str]] = None
      recent_views: Optional[List[str]] = None
      device_type: Optional[str] = None
  
  
  class ProductRecommendationRequest(BaseModel):
      """Request model for product recommendations."""
      user_id: str
      product_id: Optional[str] = None
      category_id: Optional[str] = None
      limit: int = 10
      context: Optional[RecommendationContext] = None
  
  
  class RecommendationItem(BaseModel):
      """A single recommendation item."""
      product_id: str
      score: float
      reason: str
  
  
  class ProductRecommendationResponse(BaseModel):
      """Response model for product recommendations."""
      recommendations: List[RecommendationItem]
      request_id: str
      model_version: str
  ```

- [ ] Implement recommendation endpoint:
  ```python
  # app/api/v1/endpoints/recommendation.py
  from fastapi import APIRouter, Depends, HTTPException
  
  from app.services.model_serving.service import ModelServingService
  from app.services.recommendation.models import (
      ProductRecommendationRequest,
      ProductRecommendationResponse,
  )
  from app.services.recommendation.service import RecommendationService
  
  router = APIRouter()
  
  
  @router.post("/products", response_model=ProductRecommendationResponse)
  async def get_product_recommendations(
      request: ProductRecommendationRequest,
      recommendation_service: RecommendationService = Depends(),
  ):
      """
      Get personalized product recommendations for a user.
      """
      try:
          return await recommendation_service.get_product_recommendations(request)
      except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
  ```

### 3.2. Demand Forecasting

- [ ] Create demand forecasting service module:
  ```bash
  mkdir -p okada-ai-brain/app/services/demand_forecast
  touch okada-ai-brain/app/services/demand_forecast/__init__.py
  touch okada-ai-brain/app/services/demand_forecast/service.py
  touch okada-ai-brain/app/services/demand_forecast/models.py
  ```

- [ ] Implement demand forecasting service:
  ```python
  # app/services/demand_forecast/service.py
  from typing import List, Dict, Any
  
  from app.services.model_serving.service import ModelServingService
  from app.services.demand_forecast.models import (
      DemandForecastRequest,
      DemandForecastResponse,
      ForecastItem,
  )
  
  
  class DemandForecastService:
      """
      Service for forecasting product demand.
      """
  
      def __init__(self, model_serving_service: ModelServingService):
          self.model_serving_service = model_serving_service
  
      async def forecast_demand(
          self, request: DemandForecastRequest
      ) -> DemandForecastResponse:
          """
          Forecast demand for products.
          """
          # Prepare input data for the model
          input_data = {
              "product_ids": request.product_ids,
              "store_id": request.store_id,
              "horizon": request.horizon,
              "features": request.features.dict() if request.features else {},
          }
  
          # Get forecast from the model
          result = await self.model_serving_service.predict(
              "demand_forecast", input_data
          )
  
          # Process the model output
          forecasts = [
              ForecastItem(
                  product_id=item["product_id"],
                  timestamp=item["timestamp"],
                  quantity=item["quantity"],
                  confidence_interval=item["confidence_interval"],
              )
              for item in result.get("forecasts", [])
          ]
  
          return DemandForecastResponse(
              forecasts=forecasts,
              request_id=result.get("request_id", ""),
              model_version=result.get("model_version", ""),
          )
  ```

- [ ] Implement demand forecasting models:
  ```python
  # app/services/demand_forecast/models.py
  from typing import List, Dict, Any, Optional
  from datetime import datetime
  from pydantic import BaseModel
  
  
  class ForecastFeatures(BaseModel):
      """Additional features for demand forecasting."""
      weather_forecast: Optional[Dict[str, Any]] = None
      events: Optional[List[Dict[str, Any]]] = None
      promotions: Optional[List[Dict[str, Any]]] = None
      holidays: Optional[List[str]] = None
  
  
  class DemandForecastRequest(BaseModel):
      """Request model for demand forecasting."""
      product_ids: List[str]
      store_id: str
      horizon: int  # Number of time periods to forecast
      features: Optional[ForecastFeatures] = None
  
  
  class ForecastItem(BaseModel):
      """A single forecast item."""
      product_id: str
      timestamp: datetime
      quantity: float
      confidence_interval: List[float]  # [lower_bound, upper_bound]
  
  
  class DemandForecastResponse(BaseModel):
      """Response model for demand forecasting."""
      forecasts: List[ForecastItem]
      request_id: str
      model_version: str
  ```

- [ ] Implement demand forecasting endpoint:
  ```python
  # app/api/v1/endpoints/demand_forecast.py
  from fastapi import APIRouter, Depends, HTTPException
  
  from app.services.demand_forecast.models import (
      DemandForecastRequest,
      DemandForecastResponse,
  )
  from app.services.demand_forecast.service import DemandForecastService
  
  router = APIRouter()
  
  
  @router.post("", response_model=DemandForecastResponse)
  async def forecast_demand(
      request: DemandForecastRequest,
      demand_forecast_service: DemandForecastService = Depends(),
  ):
      """
      Forecast demand for products.
      """
      try:
          return await demand_forecast_service.forecast_demand(request)
      except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
  ```

### 3.3. Route Optimization

- [ ] Create route optimization service module:
  ```bash
  mkdir -p okada-ai-brain/app/services/route_optimization
  touch okada-ai-brain/app/services/route_optimization/__init__.py
  touch okada-ai-brain/app/services/route_optimization/service.py
  touch okada-ai-brain/app/services/route_optimization/models.py
  ```

- [ ] Implement route optimization service:
  ```python
  # app/services/route_optimization/service.py
  from typing import List, Dict, Any
  
  from app.services.model_serving.service import ModelServingService
  from app.services.route_optimization.models import (
      RouteOptimizationRequest,
      RouteOptimizationResponse,
      OptimizedRoute,
      RouteStop,
  )
  
  
  class RouteOptimizationService:
      """
      Service for optimizing delivery routes.
      """
  
      def __init__(self, model_serving_service: ModelServingService):
          self.model_serving_service = model_serving_service
  
      async def optimize_routes(
          self, request: RouteOptimizationRequest
      ) -> RouteOptimizationResponse:
          """
          Optimize delivery routes.
          """
          # Prepare input data for the model
          input_data = request.dict()
  
          # Get optimized routes from the model
          result = await self.model_serving_service.predict(
              "route_optimization", input_data
          )
  
          # Process the model output
          routes = []
          for route_data in result.get("routes", []):
              stops = [
                  RouteStop(
                      order_id=stop["order_id"],
                      location=stop["location"],
                      estimated_arrival_time=stop["estimated_arrival_time"],
                      estimated_departure_time=stop["estimated_departure_time"],
                  )
                  for stop in route_data.get("stops", [])
              ]
  
              routes.append(
                  OptimizedRoute(
                      rider_id=route_data["rider_id"],
                      stops=stops,
                      total_distance=route_data["total_distance"],
                      total_time=route_data["total_time"],
                      start_time=route_data["start_time"],
                      end_time=route_data["end_time"],
                  )
              )
  
          return RouteOptimizationResponse(
              routes=routes,
              request_id=result.get("request_id", ""),
              model_version=result.get("model_version", ""),
          )
  ```

- [ ] Implement route optimization models:
  ```python
  # app/services/route_optimization/models.py
  from typing import List, Dict, Any, Optional
  from datetime import datetime
  from pydantic import BaseModel
  
  
  class Location(BaseModel):
      """A geographic location."""
      latitude: float
      longitude: float
      address: Optional[str] = None
  
  
  class Order(BaseModel):
      """An order to be delivered."""
      order_id: str
      pickup_location: Location
      delivery_location: Location
      ready_time: datetime
      delivery_deadline: Optional[datetime] = None
      priority: int = 1  # Higher number means higher priority
      weight: Optional[float] = None
      volume: Optional[float] = None
  
  
  class Rider(BaseModel):
      """A delivery rider."""
      rider_id: str
      current_location: Location
      available_from: datetime
      available_until: Optional[datetime] = None
      max_weight: Optional[float] = None
      max_volume: Optional[float] = None
      vehicle_type: str
  
  
  class RouteOptimizationRequest(BaseModel):
      """Request model for route optimization."""
      orders: List[Order]
      riders: List[Rider]
      optimize_for: str = "time"  # "time", "distance", or "balanced"
      traffic_conditions: Optional[str] = None  # "light", "moderate", "heavy"
      weather_conditions: Optional[str] = None  # "clear", "rain", "storm"
  
  
  class RouteStop(BaseModel):
      """A stop in an optimized route."""
      order_id: str
      location: Location
      estimated_arrival_time: datetime
      estimated_departure_time: datetime
  
  
  class OptimizedRoute(BaseModel):
      """An optimized delivery route for a rider."""
      rider_id: str
      stops: List[RouteStop]
      total_distance: float  # in kilometers
      total_time: int  # in minutes
      start_time: datetime
      end_time: datetime
  
  
  class RouteOptimizationResponse(BaseModel):
      """Response model for route optimization."""
      routes: List[OptimizedRoute]
      request_id: str
      model_version: str
  ```

- [ ] Implement route optimization endpoint:
  ```python
  # app/api/v1/endpoints/route_optimization.py
  from fastapi import APIRouter, Depends, HTTPException
  
  from app.services.route_optimization.models import (
      RouteOptimizationRequest,
      RouteOptimizationResponse,
  )
  from app.services.route_optimization.service import RouteOptimizationService
  
  router = APIRouter()
  
  
  @router.post("", response_model=RouteOptimizationResponse)
  async def optimize_routes(
      request: RouteOptimizationRequest,
      route_optimization_service: RouteOptimizationService = Depends(),
  ):
      """
      Optimize delivery routes.
      """
      try:
          return await route_optimization_service.optimize_routes(request)
      except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
  ```

### 3.4. Sentiment Analysis

- [ ] Create sentiment analysis service module:
  ```bash
  mkdir -p okada-ai-brain/app/services/sentiment_analysis
  touch okada-ai-brain/app/services/sentiment_analysis/__init__.py
  touch okada-ai-brain/app/services/sentiment_analysis/service.py
  touch okada-ai-brain/app/services/sentiment_analysis/models.py
  ```

- [ ] Implement sentiment analysis service:
  ```python
  # app/services/sentiment_analysis/service.py
  from typing import List, Dict, Any
  
  from app.services.model_serving.service import ModelServingService
  from app.services.sentiment_analysis.models import (
      SentimentAnalysisRequest,
      SentimentAnalysisResponse,
      SentimentResult,
      AspectSentiment,
  )
  
  
  class SentimentAnalysisService:
      """
      Service for analyzing sentiment in text.
      """
  
      def __init__(self, model_serving_service: ModelServingService):
          self.model_serving_service = model_serving_service
  
      async def analyze_sentiment(
          self, request: SentimentAnalysisRequest
      ) -> SentimentAnalysisResponse:
          """
          Analyze sentiment in text.
          """
          # Get sentiment analysis from the model
          result = await self.model_serving_service.predict(
              "sentiment_analysis", request.text
          )
  
          # Process the model output
          aspects = [
              AspectSentiment(
                  aspect=aspect["aspect"],
                  sentiment=aspect["sentiment"],
                  confidence=aspect["confidence"],
              )
              for aspect in result.get("aspects", [])
          ]
  
          sentiment_result = SentimentResult(
              sentiment=result["sentiment"],
              confidence=result["confidence"],
              aspects=aspects if aspects else None,
          )
  
          return SentimentAnalysisResponse(
              result=sentiment_result,
              request_id=result.get("request_id", ""),
              model_version=result.get("model_version", ""),
              language_detected=result.get("language_detected", ""),
          )
  ```

- [ ] Implement sentiment analysis models:
  ```python
  # app/services/sentiment_analysis/models.py
  from typing import List, Optional
  from pydantic import BaseModel
  
  
  class SentimentAnalysisRequest(BaseModel):
      """Request model for sentiment analysis."""
      text: str
      language: Optional[str] = None  # ISO 639-1 code, e.g., "en", "fr"
  
  
  class AspectSentiment(BaseModel):
      """Sentiment for a specific aspect mentioned in the text."""
      aspect: str
      sentiment: str  # "positive", "negative", "neutral"
      confidence: float
  
  
  class SentimentResult(BaseModel):
      """Result of sentiment analysis."""
      sentiment: str  # "positive", "negative", "neutral"
      confidence: float
      aspects: Optional[List[AspectSentiment]] = None
  
  
  class SentimentAnalysisResponse(BaseModel):
      """Response model for sentiment analysis."""
      result: SentimentResult
      request_id: str
      model_version: str
      language_detected: str
  ```

- [ ] Implement sentiment analysis endpoint:
  ```python
  # app/api/v1/endpoints/sentiment_analysis.py
  from fastapi import APIRouter, Depends, HTTPException
  
  from app.services.sentiment_analysis.models import (
      SentimentAnalysisRequest,
      SentimentAnalysisResponse,
  )
  from app.services.sentiment_analysis.service import SentimentAnalysisService
  
  router = APIRouter()
  
  
  @router.post("", response_model=SentimentAnalysisResponse)
  async def analyze_sentiment(
      request: SentimentAnalysisRequest,
      sentiment_analysis_service: SentimentAnalysisService = Depends(),
  ):
      """
      Analyze sentiment in text.
      """
      try:
          return await sentiment_analysis_service.analyze_sentiment(request)
      except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
  ```

### 3.5. Image Recognition

- [ ] Create image recognition service module:
  ```bash
  mkdir -p okada-ai-brain/app/services/image_recognition
  touch okada-ai-brain/app/services/image_recognition/__init__.py
  touch okada-ai-brain/app/services/image_recognition/service.py
  touch okada-ai-brain/app/services/image_recognition/models.py
  ```

- [ ] Implement image recognition service:
  ```python
  # app/services/image_recognition/service.py
  import base64
  from typing import List, Dict, Any, Optional
  
  from app.services.model_serving.service import ModelServingService
  from app.services.image_recognition.models import (
      ImageRecognitionRequest,
      ImageRecognitionResponse,
      RecognitionResult,
      ObjectDetection,
  )
  
  
  class ImageRecognitionService:
      """
      Service for recognizing objects and features in images.
      """
  
      def __init__(self, model_serving_service: ModelServingService):
          self.model_serving_service = model_serving_service
  
      async def recognize_image(
          self, request: ImageRecognitionRequest
      ) -> ImageRecognitionResponse:
          """
          Recognize objects and features in an image.
          """
          # Prepare input data for the model
          if request.image_url:
              input_data = {"image_url": request.image_url}
          else:
              input_data = {"image_base64": request.image_base64}
  
          # Add task type
          input_data["task"] = request.task
  
          # Get recognition results from the model
          result = await self.model_serving_service.predict(
              "image_recognition", input_data
          )
  
          # Process the model output
          objects = None
          if "objects" in result:
              objects = [
                  ObjectDetection(
                      label=obj["label"],
                      confidence=obj["confidence"],
                      bounding_box=obj["bounding_box"],
                  )
                  for obj in result["objects"]
              ]
  
          recognition_result = RecognitionResult(
              task=request.task,
              classification=result.get("classification"),
              confidence=result.get("confidence"),
              objects=objects,
              attributes=result.get("attributes"),
              text=result.get("text"),
          )
  
          return ImageRecognitionResponse(
              result=recognition_result,
              request_id=result.get("request_id", ""),
              model_version=result.get("model_version", ""),
              processing_time=result.get("processing_time", 0),
          )
  ```

- [ ] Implement image recognition models:
  ```python
  # app/services/image_recognition/models.py
  from typing import List, Dict, Any, Optional
  from pydantic import BaseModel, validator
  
  
  class ImageRecognitionRequest(BaseModel):
      """Request model for image recognition."""
      image_url: Optional[str] = None
      image_base64: Optional[str] = None
      task: str = "classification"  # "classification", "object_detection", "ocr", "attribute_detection"
  
      @validator("image_url", "image_base64")
      def check_image_source(cls, v, values):
          if "image_url" not in values and "image_base64" not in values:
              raise ValueError("Either image_url or image_base64 must be provided")
          return v
  
  
  class BoundingBox(BaseModel):
      """Bounding box for object detection."""
      x: float
      y: float
      width: float
      height: float
  
  
  class ObjectDetection(BaseModel):
      """Detected object in an image."""
      label: str
      confidence: float
      bounding_box: BoundingBox
  
  
  class RecognitionResult(BaseModel):
      """Result of image recognition."""
      task: str
      classification: Optional[str] = None
      confidence: Optional[float] = None
      objects: Optional[List[ObjectDetection]] = None
      attributes: Optional[Dict[str, Any]] = None
      text: Optional[str] = None
  
  
  class ImageRecognitionResponse(BaseModel):
      """Response model for image recognition."""
      result: RecognitionResult
      request_id: str
      model_version: str
      processing_time: float  # in seconds
  ```

- [ ] Implement image recognition endpoint:
  ```python
  # app/api/v1/endpoints/image_recognition.py
  from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
  import base64
  
  from app.services.image_recognition.models import (
      ImageRecognitionRequest,
      ImageRecognitionResponse,
  )
  from app.services.image_recognition.service import ImageRecognitionService
  
  router = APIRouter()
  
  
  @router.post("", response_model=ImageRecognitionResponse)
  async def recognize_image(
      request: ImageRecognitionRequest,
      image_recognition_service: ImageRecognitionService = Depends(),
  ):
      """
      Recognize objects and features in an image using URL or base64.
      """
      try:
          return await image_recognition_service.recognize_image(request)
      except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
  
  
  @router.post("/upload", response_model=ImageRecognitionResponse)
  async def recognize_uploaded_image(
      task: str = Form("classification"),
      image: UploadFile = File(...),
      image_recognition_service: ImageRecognitionService = Depends(),
  ):
      """
      Recognize objects and features in an uploaded image.
      """
      try:
          contents = await image.read()
          image_base64 = base64.b64encode(contents).decode("utf-8")
          request = ImageRecognitionRequest(image_base64=image_base64, task=task)
          return await image_recognition_service.recognize_image(request)
      except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
  ```

### 3.6. Natural Language Processing

- [ ] Create NLP service module:
  ```bash
  mkdir -p okada-ai-brain/app/services/nlp
  touch okada-ai-brain/app/services/nlp/__init__.py
  touch okada-ai-brain/app/services/nlp/service.py
  touch okada-ai-brain/app/services/nlp/models.py
  ```

- [ ] Implement NLP service:
  ```python
  # app/services/nlp/service.py
  from typing import List, Dict, Any, Optional
  
  from app.services.model_serving.service import ModelServingService
  from app.services.nlp.models import (
      NLPRequest,
      NLPResponse,
      TextClassificationResult,
      EntityRecognitionResult,
      Entity,
      TextGenerationResult,
      TranslationResult,
  )
  
  
  class NLPService:
      """
      Service for natural language processing tasks.
      """
  
      def __init__(self, model_serving_service: ModelServingService):
          self.model_serving_service = model_serving_service
  
      async def process_text(self, request: NLPRequest) -> NLPResponse:
          """
          Process text using NLP.
          """
          # Prepare input data for the model
          input_data = {
              "text": request.text,
              "task": request.task,
              "source_language": request.source_language,
              "target_language": request.target_language,
              "options": request.options.dict() if request.options else {},
          }
  
          # Get NLP results from the model
          result = await self.model_serving_service.predict("nlp", input_data)
  
          # Process the model output based on the task
          if request.task == "classification":
              task_result = TextClassificationResult(
                  category=result["category"],
                  confidence=result["confidence"],
                  all_categories=result.get("all_categories", []),
              )
          elif request.task == "entity_recognition":
              entities = [
                  Entity(
                      text=entity["text"],
                      type=entity["type"],
                      start=entity["start"],
                      end=entity["end"],
                      confidence=entity["confidence"],
                  )
                  for entity in result.get("entities", [])
              ]
              task_result = EntityRecognitionResult(entities=entities)
          elif request.task == "generation":
              task_result = TextGenerationResult(
                  generated_text=result["generated_text"],
                  tokens_generated=result.get("tokens_generated", 0),
              )
          elif request.task == "translation":
              task_result = TranslationResult(
                  translated_text=result["translated_text"],
                  source_language=result.get("detected_source_language", request.source_language),
                  target_language=request.target_language,
              )
          else:
              raise ValueError(f"Unsupported task: {request.task}")
  
          return NLPResponse(
              task=request.task,
              result=task_result,
              request_id=result.get("request_id", ""),
              model_version=result.get("model_version", ""),
              processing_time=result.get("processing_time", 0),
          )
  ```

- [ ] Implement NLP models:
  ```python
  # app/services/nlp/models.py
  from typing import List, Dict, Any, Optional, Union
  from pydantic import BaseModel
  
  
  class NLPOptions(BaseModel):
      """Options for NLP tasks."""
      max_length: Optional[int] = None
      temperature: Optional[float] = None
      top_p: Optional[float] = None
      top_k: Optional[int] = None
      num_beams: Optional[int] = None
      no_repeat_ngram_size: Optional[int] = None
  
  
  class NLPRequest(BaseModel):
      """Request model for NLP tasks."""
      text: str
      task: str  # "classification", "entity_recognition", "generation", "translation"
      source_language: Optional[str] = None  # ISO 639-1 code, e.g., "en", "fr"
      target_language: Optional[str] = None  # ISO 639-1 code, e.g., "en", "fr"
      options: Optional[NLPOptions] = None
  
  
  class TextClassificationResult(BaseModel):
      """Result of text classification."""
      category: str
      confidence: float
      all_categories: Optional[List[Dict[str, Any]]] = None
  
  
  class Entity(BaseModel):
      """Named entity recognized in text."""
      text: str
      type: str
      start: int
      end: int
      confidence: float
  
  
  class EntityRecognitionResult(BaseModel):
      """Result of entity recognition."""
      entities: List[Entity]
  
  
  class TextGenerationResult(BaseModel):
      """Result of text generation."""
      generated_text: str
      tokens_generated: int
  
  
  class TranslationResult(BaseModel):
      """Result of text translation."""
      translated_text: str
      source_language: str
      target_language: str
  
  
  class NLPResponse(BaseModel):
      """Response model for NLP tasks."""
      task: str
      result: Union[
          TextClassificationResult,
          EntityRecognitionResult,
          TextGenerationResult,
          TranslationResult,
      ]
      request_id: str
      model_version: str
      processing_time: float  # in seconds
  ```

- [ ] Implement NLP endpoint:
  ```python
  # app/api/v1/endpoints/nlp.py
  from fastapi import APIRouter, Depends, HTTPException
  
  from app.services.nlp.models import NLPRequest, NLPResponse
  from app.services.nlp.service import NLPService
  
  router = APIRouter()
  
  
  @router.post("", response_model=NLPResponse)
  async def process_text(
      request: NLPRequest,
      nlp_service: NLPService = Depends(),
  ):
      """
      Process text using NLP.
      """
      try:
          return await nlp_service.process_text(request)
      except Exception as e:
          raise HTTPException(status_code=500, detail=str(e))
  ```

## 4. Feature Store Implementation

### 4.1. Feature Store Service

- [ ] Create feature store module:
  ```bash
  mkdir -p okada-ai-brain/app/services/feature_store
  touch okada-ai-brain/app/services/feature_store/__init__.py
  touch okada-ai-brain/app/services/feature_store/service.py
  touch okada-ai-brain/app/services/feature_store/models.py
  ```

- [ ] Implement feature store service:
  ```python
  # app/services/feature_store/service.py
  from typing import Dict, Any, List, Optional
  import json
  import redis
  from datetime import datetime
  
  from app.core.config import settings
  from app.services.feature_store.models import (
      FeatureSet,
      Feature,
      FeatureValue,
  )
  
  
  class FeatureStoreService:
      """
      Service for storing and retrieving features for AI models.
      """
  
      def __init__(self):
          self.redis_client = redis.Redis.from_url(settings.REDIS_URL)
  
      async def get_feature_set(
          self, entity_type: str, entity_id: str, feature_set_name: str
      ) -> Optional[FeatureSet]:
          """
          Get a feature set for an entity.
          """
          key = f"feature:{entity_type}:{entity_id}:{feature_set_name}"
          data = self.redis_client.get(key)
  
          if not data:
              return None
  
          feature_data = json.loads(data)
          features = [
              Feature(
                  name=name,
                  value=FeatureValue(
                      value=value["value"],
                      value_type=value["value_type"],
                      timestamp=datetime.fromisoformat(value["timestamp"]),
                  ),
              )
              for name, value in feature_data["features"].items()
          ]
  
          return FeatureSet(
              entity_type=entity_type,
              entity_id=entity_id,
              name=feature_set_name,
              features=features,
              created_at=datetime.fromisoformat(feature_data["created_at"]),
              updated_at=datetime.fromisoformat(feature_data["updated_at"]),
          )
  
      async def set_feature_set(self, feature_set: FeatureSet) -> bool:
          """
          Store a feature set for an entity.
          """
          key = f"feature:{feature_set.entity_type}:{feature_set.entity_id}:{feature_set.name}"
  
          # Convert features to dictionary
          features_dict = {}
          for feature in feature_set.features:
              features_dict[feature.name] = {
                  "value": feature.value.value,
                  "value_type": feature.value.value_type,
                  "timestamp": feature.value.timestamp.isoformat(),
              }
  
          data = {
              "features": features_dict,
              "created_at": feature_set.created_at.isoformat(),
              "updated_at": feature_set.updated_at.isoformat(),
          }
  
          return self.redis_client.set(key, json.dumps(data))
  
      async def update_feature(
          self,
          entity_type: str,
          entity_id: str,
          feature_set_name: str,
          feature_name: str,
          feature_value: Any,
          value_type: str = None,
      ) -> bool:
          """
          Update a single feature in a feature set.
          """
          # Get existing feature set or create new one
          feature_set = await self.get_feature_set(entity_type, entity_id, feature_set_name)
          now = datetime.utcnow()
  
          if not feature_set:
              feature_set = FeatureSet(
                  entity_type=entity_type,
                  entity_id=entity_id,
                  name=feature_set_name,
                  features=[],
                  created_at=now,
                  updated_at=now,
              )
  
          # Determine value type if not provided
          if value_type is None:
              if isinstance(feature_value, int):
                  value_type = "int"
              elif isinstance(feature_value, float):
                  value_type = "float"
              elif isinstance(feature_value, bool):
                  value_type = "bool"
              elif isinstance(feature_value, str):
                  value_type = "string"
              elif isinstance(feature_value, list):
                  value_type = "list"
              elif isinstance(feature_value, dict):
                  value_type = "dict"
              else:
                  value_type = "unknown"
  
          # Update or add feature
          feature_found = False
          for feature in feature_set.features:
              if feature.name == feature_name:
                  feature.value = FeatureValue(
                      value=feature_value,
                      value_type=value_type,
                      timestamp=now,
                  )
                  feature_found = True
                  break
  
          if not feature_found:
              feature_set.features.append(
                  Feature(
                      name=feature_name,
                      value=FeatureValue(
                          value=feature_value,
                          value_type=value_type,
                          timestamp=now,
                      ),
                  )
              )
  
          feature_set.updated_at = now
  
          # Store updated feature set
          return await self.set_feature_set(feature_set)
  
      async def get_feature(
          self, entity_type: str, entity_id: str, feature_set_name: str, feature_name: str
      ) -> Optional[Feature]:
          """
          Get a single feature from a feature set.
          """
          feature_set = await self.get_feature_set(entity_type, entity_id, feature_set_name)
  
          if not feature_set:
              return None
  
          for feature in feature_set.features:
              if feature.name == feature_name:
                  return feature
  
          return None
  
      async def delete_feature_set(
          self, entity_type: str, entity_id: str, feature_set_name: str
      ) -> bool:
          """
          Delete a feature set.
          """
          key = f"feature:{entity_type}:{entity_id}:{feature_set_name}"
          return self.redis_client.delete(key) > 0
  ```

- [ ] Implement feature store models:
  ```python
  # app/services/feature_store/models.py
  from typing import List, Any, Optional
  from datetime import datetime
  from pydantic import BaseModel
  
  
  class FeatureValue(BaseModel):
      """Value of a feature with metadata."""
      value: Any
      value_type: str  # "int", "float", "bool", "string", "list", "dict", etc.
      timestamp: datetime
  
  
  class Feature(BaseModel):
      """A single feature."""
      name: str
      value: FeatureValue
  
  
  class FeatureSet(BaseModel):
      """A set of features for an entity."""
      entity_type: str  # "user", "product", "store", etc.
      entity_id: str
      name: str
      features: List[Feature]
      created_at: datetime
      updated_at: datetime
  
  
  class FeatureSetRequest(BaseModel):
      """Request model for feature set operations."""
      entity_type: str
      entity_id: str
      feature_set_name: str
  
  
  class FeatureRequest(BaseModel):
      """Request model for feature operations."""
      entity_type: str
      entity_id: str
      feature_set_name: str
      feature_name: str
      feature_value: Optional[Any] = None
      value_type: Optional[str] = None
  ```

## 5. Knowledge Graph Implementation

### 5.1. Knowledge Graph Service

- [ ] Create knowledge graph module:
  ```bash
  mkdir -p okada-ai-brain/app/services/knowledge_graph
  touch okada-ai-brain/app/services/knowledge_graph/__init__.py
  touch okada-ai-brain/app/services/knowledge_graph/service.py
  touch okada-ai-brain/app/services/knowledge_graph/models.py
  ```

- [ ] Implement knowledge graph service:
  ```python
  # app/services/knowledge_graph/service.py
  from typing import Dict, Any, List, Optional
  from elasticsearch import AsyncElasticsearch
  
  from app.core.config import settings
  from app.services.knowledge_graph.models import (
      Entity,
      Relationship,
      EntityType,
      RelationshipType,
      KnowledgeGraphQuery,
      KnowledgeGraphQueryResult,
  )
  
  
  class KnowledgeGraphService:
      """
      Service for managing the knowledge graph.
      """
  
      def __init__(self):
          self.es_client = AsyncElasticsearch([settings.ELASTICSEARCH_URL])
  
      async def create_entity(self, entity: Entity) -> str:
          """
          Create a new entity in the knowledge graph.
          """
          document = entity.dict()
          response = await self.es_client.index(
              index="kg_entities", id=entity.id, document=document
          )
          return response["_id"]
  
      async def get_entity(self, entity_id: str) -> Optional[Entity]:
          """
          Get an entity from the knowledge graph.
          """
          try:
              response = await self.es_client.get(index="kg_entities", id=entity_id)
              return Entity(**response["_source"])
          except Exception:
              return None
  
      async def update_entity(self, entity: Entity) -> bool:
          """
          Update an entity in the knowledge graph.
          """
          document = entity.dict()
          response = await self.es_client.update(
              index="kg_entities", id=entity.id, doc=document
          )
          return response["result"] == "updated"
  
      async def delete_entity(self, entity_id: str) -> bool:
          """
          Delete an entity from the knowledge graph.
          """
          try:
              response = await self.es_client.delete(index="kg_entities", id=entity_id)
              return response["result"] == "deleted"
          except Exception:
              return False
  
      async def create_relationship(self, relationship: Relationship) -> str:
          """
          Create a new relationship in the knowledge graph.
          """
          document = relationship.dict()
          response = await self.es_client.index(
              index="kg_relationships", id=relationship.id, document=document
          )
          return response["_id"]
  
      async def get_relationship(self, relationship_id: str) -> Optional[Relationship]:
          """
          Get a relationship from the knowledge graph.
          """
          try:
              response = await self.es_client.get(
                  index="kg_relationships", id=relationship_id
              )
              return Relationship(**response["_source"])
          except Exception:
              return None
  
      async def update_relationship(self, relationship: Relationship) -> bool:
          """
          Update a relationship in the knowledge graph.
          """
          document = relationship.dict()
          response = await self.es_client.update(
              index="kg_relationships", id=relationship.id, doc=document
          )
          return response["result"] == "updated"
  
      async def delete_relationship(self, relationship_id: str) -> bool:
          """
          Delete a relationship from the knowledge graph.
          """
          try:
              response = await self.es_client.delete(
                  index="kg_relationships", id=relationship_id
              )
              return response["result"] == "deleted"
          except Exception:
              return False
  
      async def query_knowledge_graph(
          self, query: KnowledgeGraphQuery
      ) -> KnowledgeGraphQueryResult:
          """
          Query the knowledge graph.
          """
          # Build Elasticsearch query
          es_query = self._build_elasticsearch_query(query)
  
          # Execute query
          response = await self.es_client.search(
              index=["kg_entities", "kg_relationships"],
              body=es_query,
              size=query.limit,
              from_=query.offset,
          )
  
          # Process results
          entities = []
          relationships = []
  
          for hit in response["hits"]["hits"]:
              if hit["_index"] == "kg_entities":
                  entities.append(Entity(**hit["_source"]))
              elif hit["_index"] == "kg_relationships":
                  relationships.append(Relationship(**hit["_source"]))
  
          return KnowledgeGraphQueryResult(
              entities=entities,
              relationships=relationships,
              total_entities=response["hits"]["total"]["value"],
              total_relationships=len(relationships),
          )
  
      def _build_elasticsearch_query(self, query: KnowledgeGraphQuery) -> Dict[str, Any]:
          """
          Build an Elasticsearch query from a knowledge graph query.
          """
          must_clauses = []
  
          if query.entity_types:
              must_clauses.append(
                  {"terms": {"type": [et.value for et in query.entity_types]}}
              )
  
          if query.relationship_types:
              must_clauses.append(
                  {"terms": {"type": [rt.value for rt in query.relationship_types]}}
              )
  
          if query.entity_ids:
              must_clauses.append({"terms": {"id": query.entity_ids}})
  
          if query.text_search:
              must_clauses.append(
                  {
                      "multi_match": {
                          "query": query.text_search,
                          "fields": ["name", "description", "properties.*"],
                      }
                  }
              )
  
          return {
              "query": {"bool": {"must": must_clauses}} if must_clauses else {"match_all": {}}
          }
  ```

- [ ] Implement knowledge graph models:
  ```python
  # app/services/knowledge_graph/models.py
  from typing import Dict, Any, List, Optional
  from enum import Enum
  from datetime import datetime
  from pydantic import BaseModel, Field
  import uuid
  
  
  class EntityType(str, Enum):
      """Types of entities in the knowledge graph."""
      USER = "user"
      PRODUCT = "product"
      CATEGORY = "category"
      STORE = "store"
      RIDER = "rider"
      LOCATION = "location"
      ORDER = "order"
  
  
  class RelationshipType(str, Enum):
      """Types of relationships in the knowledge graph."""
      PURCHASED = "purchased"
      CONTAINS = "contains"
      BELONGS_TO = "belongs_to"
      LOCATED_AT = "located_at"
      DELIVERED_BY = "delivered_by"
      RATED = "rated"
      VIEWED = "viewed"
      SEARCHED_FOR = "searched_for"
  
  
  class Entity(BaseModel):
      """An entity in the knowledge graph."""
      id: str = Field(default_factory=lambda: str(uuid.uuid4()))
      type: EntityType
      name: str
      description: Optional[str] = None
      properties: Dict[str, Any] = {}
      created_at: datetime = Field(default_factory=datetime.utcnow)
      updated_at: datetime = Field(default_factory=datetime.utcnow)
  
  
  class Relationship(BaseModel):
      """A relationship between entities in the knowledge graph."""
      id: str = Field(default_factory=lambda: str(uuid.uuid4()))
      type: RelationshipType
      source_id: str
      target_id: str
      properties: Dict[str, Any] = {}
      created_at: datetime = Field(default_factory=datetime.utcnow)
      updated_at: datetime = Field(default_factory=datetime.utcnow)
  
  
  class KnowledgeGraphQuery(BaseModel):
      """A query for the knowledge graph."""
      entity_types: Optional[List[EntityType]] = None
      relationship_types: Optional[List[RelationshipType]] = None
      entity_ids: Optional[List[str]] = None
      text_search: Optional[str] = None
      limit: int = 100
      offset: int = 0
  
  
  class KnowledgeGraphQueryResult(BaseModel):
      """Result of a knowledge graph query."""
      entities: List[Entity]
      relationships: List[Relationship]
      total_entities: int
      total_relationships: int
  ```

## 6. Event Bus Implementation

### 6.1. Event Bus Service

- [ ] Create event bus module:
  ```bash
  mkdir -p okada-ai-brain/app/services/event_bus
  touch okada-ai-brain/app/services/event_bus/__init__.py
  touch okada-ai-brain/app/services/event_bus/service.py
  touch okada-ai-brain/app/services/event_bus/models.py
  ```

- [ ] Implement event bus service:
  ```python
  # app/services/event_bus/service.py
  import json
  import asyncio
  import aio_pika
  from typing import Dict, Any, Callable, Awaitable, List
  
  from app.core.config import settings
  from app.services.event_bus.models import Event, EventType
  
  
  class EventBusService:
      """
      Service for publishing and subscribing to events.
      """
  
      def __init__(self):
          self.connection = None
          self.channel = None
          self.exchange = None
          self.subscribers: Dict[EventType, List[Callable[[Event], Awaitable[None]]]] = {}
  
      async def connect(self):
          """
          Connect to the RabbitMQ server.
          """
          if self.connection is None:
              self.connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
              self.channel = await self.connection.channel()
              self.exchange = await self.channel.declare_exchange(
                  "okada_events", aio_pika.ExchangeType.TOPIC
              )
  
      async def publish(self, event: Event):
          """
          Publish an event to the event bus.
          """
          await self.connect()
  
          # Convert event to JSON
          event_data = json.dumps(event.dict()).encode()
  
          # Create message
          message = aio_pika.Message(
              body=event_data,
              content_type="application/json",
              delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
          )
  
          # Publish message
          await self.exchange.publish(
              message, routing_key=event.type.value
          )
  
      async def subscribe(
          self, event_type: EventType, callback: Callable[[Event], Awaitable[None]]
      ):
          """
          Subscribe to events of a specific type.
          """
          await self.connect()
  
          # Create queue
          queue_name = f"okada_events_{event_type.value}"
          queue = await self.channel.declare_queue(queue_name, durable=True)
  
          # Bind queue to exchange
          await queue.bind(self.exchange, routing_key=event_type.value)
  
          # Add callback to subscribers
          if event_type not in self.subscribers:
              self.subscribers[event_type] = []
          self.subscribers[event_type].append(callback)
  
          # Start consuming
          await queue.consume(self._on_message_received)
  
      async def _on_message_received(self, message: aio_pika.IncomingMessage):
          """
          Handle received messages.
          """
          async with message.process():
              # Parse message body
              event_data = json.loads(message.body.decode())
              event = Event(**event_data)
  
              # Call subscribers
              if event.type in self.subscribers:
                  for callback in self.subscribers[event.type]:
                      try:
                          await callback(event)
                      except Exception as e:
                          # Log error but continue processing
                          print(f"Error in event subscriber: {e}")
  ```

- [ ] Implement event bus models:
  ```python
  # app/services/event_bus/models.py
  from typing import Dict, Any, Optional
  from enum import Enum
  from datetime import datetime
  from pydantic import BaseModel, Field
  import uuid
  
  
  class EventType(str, Enum):
      """Types of events in the system."""
      USER_CREATED = "user.created"
      USER_UPDATED = "user.updated"
      PRODUCT_VIEWED = "product.viewed"
      PRODUCT_ADDED_TO_CART = "product.added_to_cart"
      ORDER_CREATED = "order.created"
      ORDER_UPDATED = "order.updated"
      ORDER_COMPLETED = "order.completed"
      RIDER_LOCATION_UPDATED = "rider.location_updated"
      RECOMMENDATION_GENERATED = "recommendation.generated"
      FORECAST_GENERATED = "forecast.generated"
      ROUTE_OPTIMIZED = "route.optimized"
      SENTIMENT_ANALYZED = "sentiment.analyzed"
      IMAGE_RECOGNIZED = "image.recognized"
      TEXT_PROCESSED = "text.processed"
  
  
  class Event(BaseModel):
      """An event in the system."""
      id: str = Field(default_factory=lambda: str(uuid.uuid4()))
      type: EventType
      data: Dict[str, Any]
      metadata: Dict[str, Any] = {}
      timestamp: datetime = Field(default_factory=datetime.utcnow)
      source: str = "ai-brain"
  ```

## 7. Data Pipeline Implementation

### 7.1. Data Pipeline Service

- [ ] Create data pipeline module:
  ```bash
  mkdir -p okada-ai-brain/app/services/data_pipeline
  touch okada-ai-brain/app/services/data_pipeline/__init__.py
  touch okada-ai-brain/app/services/data_pipeline/service.py
  touch okada-ai-brain/app/services/data_pipeline/models.py
  ```

- [ ] Implement data pipeline service:
  ```python
  # app/services/data_pipeline/service.py
  from typing import Dict, Any, List, Optional, Callable, Awaitable
  import asyncio
  import json
  from datetime import datetime
  
  from app.core.config import settings
  from app.services.data_pipeline.models import (
      Pipeline,
      PipelineStage,
      PipelineExecution,
      PipelineStatus,
  )
  from app.services.event_bus.service import EventBusService
  from app.services.event_bus.models import Event, EventType
  
  
  class DataPipelineService:
      """
      Service for managing data pipelines.
      """
  
      def __init__(self, event_bus_service: EventBusService):
          self.event_bus_service = event_bus_service
          self.pipelines: Dict[str, Pipeline] = {}
          self.executions: Dict[str, PipelineExecution] = {}
  
      def register_pipeline(self, pipeline: Pipeline):
          """
          Register a data pipeline.
          """
          self.pipelines[pipeline.id] = pipeline
  
      async def execute_pipeline(
          self, pipeline_id: str, input_data: Dict[str, Any]
      ) -> str:
          """
          Execute a data pipeline with the given input data.
          Returns the execution ID.
          """
          if pipeline_id not in self.pipelines:
              raise ValueError(f"Pipeline {pipeline_id} not found")
  
          pipeline = self.pipelines[pipeline_id]
  
          # Create execution
          execution_id = f"{pipeline_id}_{datetime.utcnow().isoformat()}"
          execution = PipelineExecution(
              id=execution_id,
              pipeline_id=pipeline_id,
              status=PipelineStatus.RUNNING,
              input_data=input_data,
              output_data={},
              start_time=datetime.utcnow(),
              end_time=None,
              current_stage=0,
              logs=[],
          )
  
          self.executions[execution_id] = execution
  
          # Start execution in background
          asyncio.create_task(self._run_pipeline(execution))
  
          return execution_id
  
      async def get_execution_status(self, execution_id: str) -> Optional[PipelineExecution]:
          """
          Get the status of a pipeline execution.
          """
          return self.executions.get(execution_id)
  
      async def _run_pipeline(self, execution: PipelineExecution):
          """
          Run a pipeline execution.
          """
          pipeline = self.pipelines[execution.pipeline_id]
          current_data = execution.input_data
  
          try:
              # Execute each stage
              for i, stage in enumerate(pipeline.stages):
                  execution.current_stage = i
                  execution.logs.append(f"Starting stage {i}: {stage.name}")
  
                  # Execute stage
                  stage_output = await stage.process_func(current_data)
  
                  # Update current data
                  current_data = stage_output
  
                  execution.logs.append(f"Completed stage {i}: {stage.name}")
  
              # Update execution with success
              execution.status = PipelineStatus.COMPLETED
              execution.output_data = current_data
              execution.end_time = datetime.utcnow()
  
              # Publish completion event
              await self.event_bus_service.publish(
                  Event(
                      type=EventType.PIPELINE_COMPLETED,
                      data={
                          "pipeline_id": pipeline.id,
                          "execution_id": execution.id,
                          "output_data": current_data,
                      },
                  )
              )
  
          except Exception as e:
              # Update execution with failure
              execution.status = PipelineStatus.FAILED
              execution.end_time = datetime.utcnow()
              execution.logs.append(f"Error: {str(e)}")
  
              # Publish failure event
              await self.event_bus_service.publish(
                  Event(
                      type=EventType.PIPELINE_FAILED,
                      data={
                          "pipeline_id": pipeline.id,
                          "execution_id": execution.id,
                          "error": str(e),
                      },
                  )
              )
  ```

- [ ] Implement data pipeline models:
  ```python
  # app/services/data_pipeline/models.py
  from typing import Dict, Any, List, Optional, Callable, Awaitable
  from enum import Enum
  from datetime import datetime
  from pydantic import BaseModel, Field
  
  
  class PipelineStatus(str, Enum):
      """Status of a pipeline execution."""
      PENDING = "pending"
      RUNNING = "running"
      COMPLETED = "completed"
      FAILED = "failed"
  
  
  class PipelineStage:
      """A stage in a data pipeline."""
  
      def __init__(
          self,
          name: str,
          process_func: Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]],
      ):
          self.name = name
          self.process_func = process_func
  
  
  class Pipeline:
      """A data pipeline."""
  
      def __init__(self, id: str, name: str, description: str, stages: List[PipelineStage]):
          self.id = id
          self.name = name
          self.description = description
          self.stages = stages
  
  
  class PipelineExecution(BaseModel):
      """Execution of a data pipeline."""
      id: str
      pipeline_id: str
      status: PipelineStatus
      input_data: Dict[str, Any]
      output_data: Dict[str, Any]
      start_time: datetime
      end_time: Optional[datetime] = None
      current_stage: int
      logs: List[str]
  ```

## 8. Monitoring & Logging Implementation

### 8.1. Monitoring Service

- [ ] Create monitoring module:
  ```bash
  mkdir -p okada-ai-brain/app/services/monitoring
  touch okada-ai-brain/app/services/monitoring/__init__.py
  touch okada-ai-brain/app/services/monitoring/service.py
  touch okada-ai-brain/app/services/monitoring/models.py
  ```

- [ ] Implement monitoring service:
  ```python
  # app/services/monitoring/service.py
  from typing import Dict, Any, List, Optional
  import time
  from datetime import datetime
  import logging
  
  from app.services.monitoring.models import (
      Metric,
      MetricType,
      LogLevel,
      LogEntry,
  )
  
  
  class MonitoringService:
      """
      Service for monitoring and logging.
      """
  
      def __init__(self):
          self.logger = logging.getLogger("ai-brain")
          self.metrics: Dict[str, List[Metric]] = {}
          self.logs: List[LogEntry] = []
  
      def record_metric(
          self,
          name: str,
          value: float,
          metric_type: MetricType = MetricType.GAUGE,
          labels: Optional[Dict[str, str]] = None,
      ):
          """
          Record a metric.
          """
          metric = Metric(
              name=name,
              value=value,
              type=metric_type,
              timestamp=datetime.utcnow(),
              labels=labels or {},
          )
  
          if name not in self.metrics:
              self.metrics[name] = []
  
          self.metrics[name].append(metric)
  
          # Limit the number of stored metrics
          if len(self.metrics[name]) > 1000:
              self.metrics[name] = self.metrics[name][-1000:]
  
      def get_metrics(self, name: str) -> List[Metric]:
          """
          Get metrics by name.
          """
          return self.metrics.get(name, [])
  
      def log(
          self,
          message: str,
          level: LogLevel = LogLevel.INFO,
          context: Optional[Dict[str, Any]] = None,
      ):
          """
          Log a message.
          """
          log_entry = LogEntry(
              message=message,
              level=level,
              timestamp=datetime.utcnow(),
              context=context or {},
          )
  
          self.logs.append(log_entry)
  
          # Limit the number of stored logs
          if len(self.logs) > 10000:
              self.logs = self.logs[-10000:]
  
          # Also log to Python logger
          if level == LogLevel.DEBUG:
              self.logger.debug(message)
          elif level == LogLevel.INFO:
              self.logger.info(message)
          elif level == LogLevel.WARNING:
              self.logger.warning(message)
          elif level == LogLevel.ERROR:
              self.logger.error(message)
          elif level == LogLevel.CRITICAL:
              self.logger.critical(message)
  
      def get_logs(
          self,
          level: Optional[LogLevel] = None,
          start_time: Optional[datetime] = None,
          end_time: Optional[datetime] = None,
          limit: int = 100,
      ) -> List[LogEntry]:
          """
          Get logs filtered by level and time range.
          """
          filtered_logs = self.logs
  
          if level is not None:
              filtered_logs = [log for log in filtered_logs if log.level == level]
  
          if start_time is not None:
              filtered_logs = [
                  log for log in filtered_logs if log.timestamp >= start_time
              ]
  
          if end_time is not None:
              filtered_logs = [log for log in filtered_logs if log.timestamp <= end_time]
  
          # Sort by timestamp (newest first) and limit
          return sorted(
              filtered_logs, key=lambda log: log.timestamp, reverse=True
          )[:limit]
  
      def start_timer(self, name: str) -> int:
          """
          Start a timer for measuring execution time.
          Returns a timer ID.
          """
          timer_id = int(time.time() * 1000)
          self.log(
              f"Timer started: {name}",
              level=LogLevel.DEBUG,
              context={"timer_id": timer_id, "timer_name": name},
          )
          return timer_id
  
      def stop_timer(self, timer_id: int, name: str):
          """
          Stop a timer and record the execution time as a metric.
          """
          elapsed_time = (int(time.time() * 1000) - timer_id) / 1000.0
          self.record_metric(
              f"execution_time_{name}",
              elapsed_time,
              metric_type=MetricType.HISTOGRAM,
              labels={"name": name},
          )
          self.log(
              f"Timer stopped: {name}, elapsed: {elapsed_time:.3f}s",
              level=LogLevel.DEBUG,
              context={"timer_id": timer_id, "timer_name": name, "elapsed_time": elapsed_time},
          )
          return elapsed_time
  ```

- [ ] Implement monitoring models:
  ```python
  # app/services/monitoring/models.py
  from typing import Dict, Any, Optional
  from enum import Enum
  from datetime import datetime
  from pydantic import BaseModel
  
  
  class MetricType(str, Enum):
      """Types of metrics."""
      COUNTER = "counter"
      GAUGE = "gauge"
      HISTOGRAM = "histogram"
      SUMMARY = "summary"
  
  
  class LogLevel(str, Enum):
      """Log levels."""
      DEBUG = "debug"
      INFO = "info"
      WARNING = "warning"
      ERROR = "error"
      CRITICAL = "critical"
  
  
  class Metric(BaseModel):
      """A metric measurement."""
      name: str
      value: float
      type: MetricType
      timestamp: datetime
      labels: Dict[str, str] = {}
  
  
  class LogEntry(BaseModel):
      """A log entry."""
      message: str
      level: LogLevel
      timestamp: datetime
      context: Dict[str, Any] = {}
  ```

## 9. Configuration and Dependency Injection

### 9.1. Configuration

- [ ] Create configuration module:
  ```bash
  mkdir -p okada-ai-brain/app/core/config
  touch okada-ai-brain/app/core/config/__init__.py
  touch okada-ai-brain/app/core/config/settings.py
  ```

- [ ] Implement settings:
  ```python
  # app/core/config/settings.py
  import os
  from typing import Any, Dict, List, Optional, Union
  from pydantic import BaseSettings, PostgresDsn, validator
  
  
  class Settings(BaseSettings):
      """Application settings."""
  
      # API settings
      API_V1_STR: str = "/api/v1"
      PROJECT_NAME: str = "Okada AI Brain"
      VERSION: str = "1.0.0"
      ENVIRONMENT: str = "development"
  
      # Security settings
      SECRET_KEY: str = "your-secret-key-change-in-production"
      API_KEY: str = "your-api-key-change-in-production"
      ALGORITHM: str = "HS256"
      ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
  
      # Database settings
      DATABASE_URL: str = "postgresql://okada:okada_dev@postgres:5432/okada_dev"
  
      # Redis settings
      REDIS_URL: str = "redis://redis:6379/0"
  
      # Elasticsearch settings
      ELASTICSEARCH_URL: str = "http://elasticsearch:9200"
  
      # RabbitMQ settings
      RABBITMQ_URL: str = "amqp://okada:okada_dev@rabbitmq:5672/"
  
      # Model settings
      MODEL_CACHE_DIR: str = "model_cache"
      OPENAI_API_KEY: Optional[str] = None
  
      # CORS settings
      CORS_ORIGINS: List[str] = ["*"]
  
      # Branding settings (Cameroon flag colors)
      BRAND_GREEN: str = "#007A5E"  # Green
      BRAND_RED: str = "#CE1126"    # Red
      BRAND_YELLOW: str = "#FCD116" # Yellow
  
      class Config:
          env_file = ".env"
          case_sensitive = True
  
  
  settings = Settings()
  ```

### 9.2. Dependency Injection

- [ ] Create dependencies module:
  ```bash
  mkdir -p okada-ai-brain/app/api/deps
  touch okada-ai-brain/app/api/deps/__init__.py
  touch okada-ai-brain/app/api/deps/services.py
  ```

- [ ] Implement service dependencies:
  ```python
  # app/api/deps/services.py
  from typing import Generator
  
  from fastapi import Depends
  
  from app.services.model_registry.registry import ModelRegistry
  from app.services.model_serving.service import ModelServingService
  from app.services.recommendation.service import RecommendationService
  from app.services.demand_forecast.service import DemandForecastService
  from app.services.route_optimization.service import RouteOptimizationService
  from app.services.sentiment_analysis.service import SentimentAnalysisService
  from app.services.image_recognition.service import ImageRecognitionService
  from app.services.nlp.service import NLPService
  from app.services.feature_store.service import FeatureStoreService
  from app.services.knowledge_graph.service import KnowledgeGraphService
  from app.services.event_bus.service import EventBusService
  from app.services.data_pipeline.service import DataPipelineService
  from app.services.monitoring.service import MonitoringService
  from app.core.workflow.orchestrator import WorkflowOrchestrator
  
  
  # Singleton instances
  _model_registry = ModelRegistry()
  _event_bus_service = EventBusService()
  _monitoring_service = MonitoringService()
  _workflow_orchestrator = WorkflowOrchestrator()
  
  
  def get_model_registry() -> ModelRegistry:
      return _model_registry
  
  
  def get_model_serving_service(
      model_registry: ModelRegistry = Depends(get_model_registry),
  ) -> ModelServingService:
      return ModelServingService(model_registry)
  
  
  def get_recommendation_service(
      model_serving_service: ModelServingService = Depends(get_model_serving_service),
  ) -> RecommendationService:
      return RecommendationService(model_serving_service)
  
  
  def get_demand_forecast_service(
      model_serving_service: ModelServingService = Depends(get_model_serving_service),
  ) -> DemandForecastService:
      return DemandForecastService(model_serving_service)
  
  
  def get_route_optimization_service(
      model_serving_service: ModelServingService = Depends(get_model_serving_service),
  ) -> RouteOptimizationService:
      return RouteOptimizationService(model_serving_service)
  
  
  def get_sentiment_analysis_service(
      model_serving_service: ModelServingService = Depends(get_model_serving_service),
  ) -> SentimentAnalysisService:
      return SentimentAnalysisService(model_serving_service)
  
  
  def get_image_recognition_service(
      model_serving_service: ModelServingService = Depends(get_model_serving_service),
  ) -> ImageRecognitionService:
      return ImageRecognitionService(model_serving_service)
  
  
  def get_nlp_service(
      model_serving_service: ModelServingService = Depends(get_model_serving_service),
  ) -> NLPService:
      return NLPService(model_serving_service)
  
  
  def get_feature_store_service() -> FeatureStoreService:
      return FeatureStoreService()
  
  
  def get_knowledge_graph_service() -> KnowledgeGraphService:
      return KnowledgeGraphService()
  
  
  def get_event_bus_service() -> EventBusService:
      return _event_bus_service
  
  
  def get_data_pipeline_service(
      event_bus_service: EventBusService = Depends(get_event_bus_service),
  ) -> DataPipelineService:
      return DataPipelineService(event_bus_service)
  
  
  def get_monitoring_service() -> MonitoringService:
      return _monitoring_service
  
  
  def get_workflow_orchestrator() -> WorkflowOrchestrator:
      return _workflow_orchestrator
  ```

## 10. Main Application Setup

### 10.1. Update Main Application

- [ ] Update main application file:
  ```python
  # app/main.py
  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
  
  from app.api.v1.api import api_router
  from app.core.config.settings import settings
  
  app = FastAPI(
      title=settings.PROJECT_NAME,
      description="Central AI service for the Okada platform",
      version=settings.VERSION,
      openapi_url=f"{settings.API_V1_STR}/openapi.json",
  )
  
  # Configure CORS
  app.add_middleware(
      CORSMiddleware,
      allow_origins=settings.CORS_ORIGINS,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  
  # Include API router
  app.include_router(api_router, prefix=settings.API_V1_STR)
  
  
  @app.get("/")
  async def root():
      return {
          "name": settings.PROJECT_NAME,
          "version": settings.VERSION,
          "environment": settings.ENVIRONMENT,
          "docs_url": f"{settings.API_V1_STR}/docs",
      }
  
  
  @app.get("/health")
  async def health_check():
      return {"status": "healthy"}
  
  
  if __name__ == "__main__":
      import uvicorn
      uvicorn.run(app, host="0.0.0.0", port=8000)
  ```

### 10.2. Update API Router

- [ ] Update API router:
  ```python
  # app/api/v1/api.py
  from fastapi import APIRouter
  
  from app.api.v1.endpoints import (
      recommendation,
      demand_forecast,
      route_optimization,
      sentiment_analysis,
      image_recognition,
      nlp,
      health,
  )
  
  api_router = APIRouter()
  
  api_router.include_router(health.router, prefix="/health", tags=["health"])
  api_router.include_router(recommendation.router, prefix="/recommendation", tags=["recommendation"])
  api_router.include_router(demand_forecast.router, prefix="/demand-forecast", tags=["demand-forecast"])
  api_router.include_router(route_optimization.router, prefix="/route-optimization", tags=["route-optimization"])
  api_router.include_router(sentiment_analysis.router, prefix="/sentiment-analysis", tags=["sentiment-analysis"])
  api_router.include_router(image_recognition.router, prefix="/image-recognition", tags=["image-recognition"])
  api_router.include_router(nlp.router, prefix="/nlp", tags=["nlp"])
  ```

## 11. Next Steps

- [ ] Implement model training pipelines
- [ ] Implement model evaluation and monitoring
- [ ] Implement A/B testing framework
- [ ] Implement feature engineering pipelines
- [ ] Implement data quality monitoring
- [ ] Implement model versioning and rollback
- [ ] Implement model explainability
- [ ] Implement model fairness and bias detection
- [ ] Implement model performance monitoring
- [ ] Implement model drift detection
# Backend Services Implementation Checklist with AI Integration

## 1. Core Backend Services Architecture

### 1.1. Project Structure Setup

- [ ] Create the backend services project structure:
  ```bash
  mkdir -p okada-backend
  cd okada-backend
  flutter create --template=package okada_core
  mkdir -p okada_api
  mkdir -p okada_services
  ```

- [ ] Set up the backend project with proper folder structure:
  ```bash
  cd okada_api
  mkdir -p lib/src/{controllers,models,routes,middleware,utils,config}
  touch lib/src/app.dart
  touch lib/src/server.dart
  ```

### 1.2. Backend Dependencies Setup

- [ ] Create the backend API pubspec.yaml file:
  ```bash
  cat > okada_api/pubspec.yaml << 'EOL'
  name: okada_api
  description: Okada backend API services
  version: 1.0.0
  
  environment:
    sdk: '>=3.0.0 <4.0.0'
  
  dependencies:
    shelf: ^1.4.1
    shelf_router: ^1.1.4
    postgres: ^2.6.1
    redis: ^3.1.0
    jwt_decoder: ^2.0.1
    dotenv: ^4.1.0
    logging: ^1.2.0
    http: ^1.1.0
    uuid: ^3.0.7
    intl: ^0.18.1
    okada_core:
      path: ../okada_core
    shelf_cors_headers: ^0.1.5
    mongo_dart: ^0.9.1
    shelf_multipart: ^1.0.0
    image: ^4.0.17
    path: ^1.8.3
    crypto: ^3.0.3
    googleapis: ^11.4.0
    googleapis_auth: ^1.4.1
    grpc: ^3.2.4
    protobuf: ^3.1.0
    firebase_admin: ^0.2.0
    shelf_static: ^1.1.2
  
  dev_dependencies:
    lints: ^2.1.1
    test: ^1.24.3
    mockito: ^5.4.2
    build_runner: ^2.4.6
  EOL
  ```

- [ ] Create the core services pubspec.yaml file:
  ```bash
  cat > okada_core/pubspec.yaml << 'EOL'
  name: okada_core
  description: Okada core services and models
  version: 1.0.0
  
  environment:
    sdk: '>=3.0.0 <4.0.0'
  
  dependencies:
    equatable: ^2.0.5
    json_annotation: ^4.8.1
    uuid: ^3.0.7
    http: ^1.1.0
    intl: ^0.18.1
    logging: ^1.2.0
    meta: ^1.9.1
    path: ^1.8.3
    crypto: ^3.0.3
    collection: ^1.17.2
    googleapis: ^11.4.0
    googleapis_auth: ^1.4.1
    grpc: ^3.2.4
    protobuf: ^3.1.0
  
  dev_dependencies:
    lints: ^2.1.1
    test: ^1.24.3
    build_runner: ^2.4.6
    json_serializable: ^6.7.1
  EOL
  ```

### 1.3. Database Schema Setup

- [ ] Create database schema migration script:
  ```bash
  mkdir -p okada_api/db/migrations
  touch okada_api/db/migrations/001_initial_schema.sql
  ```

- [ ] Define the initial database schema:
  ```sql
  -- 001_initial_schema.sql
  
  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Users table
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    profile_image_url VARCHAR(255),
    fcm_token VARCHAR(255),
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE
  );
  
  -- User addresses table
  CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Cameroon',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    label VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Categories table
  CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Products table
  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    category_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    brand VARCHAR(100),
    tax_rate DECIMAL(5, 2) DEFAULT 0.00
  );
  
  -- Product images table
  CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Dark stores table
  CREATE TABLE dark_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Cameroon',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    operating_hours VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    coverage_radius_km DECIMAL(5, 2) DEFAULT 5.00
  );
  
  -- Store inventory table
  CREATE TABLE store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES dark_stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    last_restock_date TIMESTAMP WITH TIME ZONE,
    restock_threshold INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, product_id)
  );
  
  -- Riders table
  CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL,
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    rating DECIMAL(3, 2),
    total_deliveries INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_store_id UUID REFERENCES dark_stores(id),
    status VARCHAR(50) DEFAULT 'offline'
  );
  
  -- Orders table
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    store_id UUID NOT NULL REFERENCES dark_stores(id),
    rider_id UUID REFERENCES riders(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    delivery_address_id UUID REFERENCES user_addresses(id),
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    order_code VARCHAR(20) UNIQUE NOT NULL
  );
  
  -- Order items table
  CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Order status history table
  CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
  );
  
  -- User ratings table
  CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    rider_id UUID REFERENCES riders(id),
    product_id UUID REFERENCES products(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- User search history table
  CREATE TABLE user_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- User product views table
  CREATE TABLE user_product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    view_count INT DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Promotions table
  CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    promo_code VARCHAR(50) UNIQUE
  );
  
  -- AI recommendation logs table
  CREATE TABLE ai_recommendation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    items JSONB NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(100),
    is_clicked BOOLEAN DEFAULT FALSE,
    clicked_item_id UUID,
    clicked_at TIMESTAMP WITH TIME ZONE
  );
  
  -- AI demand forecast table
  CREATE TABLE ai_demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES dark_stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    forecast_quantity INT NOT NULL,
    confidence_lower DECIMAL(10, 2),
    confidence_upper DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    model_version VARCHAR(50),
    actual_quantity INT,
    UNIQUE(store_id, product_id, forecast_date)
  );
  
  -- AI route optimization logs table
  CREATE TABLE ai_route_optimization_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
    orders JSONB NOT NULL,
    optimized_route JSONB NOT NULL,
    optimization_params JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_distance DECIMAL(10, 2),
    estimated_time INT,
    actual_time INT,
    model_version VARCHAR(50)
  );
  
  -- Create indexes
  CREATE INDEX idx_users_phone_number ON users(phone_number);
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
  CREATE INDEX idx_products_category_id ON products(category_id);
  CREATE INDEX idx_products_is_active ON products(is_active);
  CREATE INDEX idx_store_inventory_store_id ON store_inventory(store_id);
  CREATE INDEX idx_store_inventory_product_id ON store_inventory(product_id);
  CREATE INDEX idx_orders_user_id ON orders(user_id);
  CREATE INDEX idx_orders_store_id ON orders(store_id);
  CREATE INDEX idx_orders_rider_id ON orders(rider_id);
  CREATE INDEX idx_orders_status ON orders(status);
  CREATE INDEX idx_order_items_order_id ON order_items(order_id);
  CREATE INDEX idx_order_items_product_id ON order_items(product_id);
  CREATE INDEX idx_ratings_user_id ON ratings(user_id);
  CREATE INDEX idx_user_search_history_user_id ON user_search_history(user_id);
  CREATE INDEX idx_user_product_views_user_id ON user_product_views(user_id);
  CREATE INDEX idx_user_product_views_product_id ON user_product_views(product_id);
  CREATE INDEX idx_ai_recommendation_logs_user_id ON ai_recommendation_logs(user_id);
  CREATE INDEX idx_ai_demand_forecasts_store_product ON ai_demand_forecasts(store_id, product_id);
  CREATE INDEX idx_ai_route_optimization_logs_rider_id ON ai_route_optimization_logs(rider_id);
  ```

### 1.4. Environment Configuration

- [ ] Create environment configuration file:
  ```bash
  cat > okada_api/.env.example << 'EOL'
  # Server Configuration
  PORT=8080
  HOST=0.0.0.0
  ENV=development
  
  # Database Configuration
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=okada_db
  DB_USER=okada_user
  DB_PASSWORD=okada_password
  
  # Redis Configuration
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  
  # JWT Configuration
  JWT_SECRET=your_jwt_secret_key_change_in_production
  JWT_EXPIRY=86400
  
  # AI Brain Configuration
  AI_BRAIN_URL=http://localhost:8000
  AI_BRAIN_API_KEY=your_api_key_change_in_production
  
  # Firebase Configuration
  FIREBASE_CREDENTIALS_FILE=firebase-credentials.json
  
  # Storage Configuration
  STORAGE_TYPE=local
  STORAGE_LOCAL_PATH=./uploads
  STORAGE_BUCKET=okada-storage
  
  # SMS Gateway Configuration
  SMS_PROVIDER=twilio
  SMS_API_KEY=your_sms_api_key
  SMS_SENDER_ID=OKADA
  
  # Payment Gateway Configuration
  PAYMENT_PROVIDER=stripe
  PAYMENT_API_KEY=your_payment_api_key
  PAYMENT_SECRET_KEY=your_payment_secret_key
  
  # Mobile Money Configuration
  MOMO_PROVIDER=mtn
  MOMO_API_KEY=your_momo_api_key
  MOMO_SECRET_KEY=your_momo_secret_key
  
  # Logging Configuration
  LOG_LEVEL=info
  LOG_FILE=logs/okada.log
  
  # Cameroon Flag Colors (Branding)
  BRAND_GREEN=#007A5E
  BRAND_RED=#CE1126
  BRAND_YELLOW=#FCD116
  EOL
  ```

- [ ] Create the actual environment file:
  ```bash
  cp okada_api/.env.example okada_api/.env
  ```

## 2. Core Models Implementation

### 2.1. Base Models

- [ ] Create base model class:
  ```bash
  mkdir -p okada_core/lib/src/models
  touch okada_core/lib/src/models/base_model.dart
  ```

- [ ] Implement base model:
  ```dart
  // okada_core/lib/src/models/base_model.dart
  import 'package:equatable/equatable.dart';
  import 'package:json_annotation/json_annotation.dart';
  import 'package:meta/meta.dart';
  
  /// Base class for all models in the application
  @immutable
  abstract class BaseModel extends Equatable {
    /// Unique identifier for the model
    final String id;
  
    /// Timestamp when the model was created
    final DateTime? createdAt;
  
    /// Timestamp when the model was last updated
    final DateTime? updatedAt;
  
    /// Creates a new instance of [BaseModel]
    const BaseModel({
      required this.id,
      this.createdAt,
      this.updatedAt,
    });
  
    /// Converts the model to a JSON map
    Map<String, dynamic> toJson();
  
    @override
    List<Object?> get props => [id];
  }
  ```

### 2.2. User Models

- [ ] Create user model:
  ```bash
  touch okada_core/lib/src/models/user.dart
  ```

- [ ] Implement user model:
  ```dart
  // okada_core/lib/src/models/user.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'user.g.dart';
  
  /// Status of a user account
  enum UserStatus {
    /// User account is active
    active,
    
    /// User account is inactive
    inactive,
    
    /// User account is suspended
    suspended,
    
    /// User account is pending verification
    pending
  }
  
  /// User model representing a user in the system
  @JsonSerializable()
  class User extends BaseModel {
    /// Phone number of the user
    final String phoneNumber;
    
    /// Email address of the user
    final String? email;
    
    /// First name of the user
    final String firstName;
    
    /// Last name of the user
    final String lastName;
    
    /// Status of the user account
    final UserStatus status;
    
    /// URL to the user's profile image
    final String? profileImageUrl;
    
    /// Firebase Cloud Messaging token for push notifications
    final String? fcmToken;
    
    /// Whether the user's phone number is verified
    final bool isPhoneVerified;
    
    /// Whether the user's email is verified
    final bool isEmailVerified;
    
    /// Timestamp of the user's last login
    final DateTime? lastLogin;
  
    /// Creates a new instance of [User]
    const User({
      required super.id,
      required this.phoneNumber,
      this.email,
      required this.firstName,
      required this.lastName,
      this.status = UserStatus.active,
      this.profileImageUrl,
      this.fcmToken,
      this.isPhoneVerified = false,
      this.isEmailVerified = false,
      this.lastLogin,
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [User] from JSON
    factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$UserToJson(this);
  
    /// Gets the full name of the user
    String get fullName => '$firstName $lastName';
  
    /// Creates a copy of this user with the given fields replaced
    User copyWith({
      String? id,
      String? phoneNumber,
      String? email,
      String? firstName,
      String? lastName,
      UserStatus? status,
      String? profileImageUrl,
      String? fcmToken,
      bool? isPhoneVerified,
      bool? isEmailVerified,
      DateTime? lastLogin,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return User(
        id: id ?? this.id,
        phoneNumber: phoneNumber ?? this.phoneNumber,
        email: email ?? this.email,
        firstName: firstName ?? this.firstName,
        lastName: lastName ?? this.lastName,
        status: status ?? this.status,
        profileImageUrl: profileImageUrl ?? this.profileImageUrl,
        fcmToken: fcmToken ?? this.fcmToken,
        isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
        isEmailVerified: isEmailVerified ?? this.isEmailVerified,
        lastLogin: lastLogin ?? this.lastLogin,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          phoneNumber,
          email,
          firstName,
          lastName,
          status,
          profileImageUrl,
          fcmToken,
          isPhoneVerified,
          isEmailVerified,
          lastLogin,
          createdAt,
          updatedAt,
        ];
  }
  ```

### 2.3. Product Models

- [ ] Create product model:
  ```bash
  touch okada_core/lib/src/models/product.dart
  ```

- [ ] Implement product model:
  ```dart
  // okada_core/lib/src/models/product.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'product.g.dart';
  
  /// Product model representing a product in the system
  @JsonSerializable()
  class Product extends BaseModel {
    /// Name of the product
    final String name;
    
    /// Description of the product
    final String? description;
    
    /// Regular price of the product
    final double price;
    
    /// Sale price of the product (if on sale)
    final double? salePrice;
    
    /// Stock Keeping Unit (SKU) of the product
    final String? sku;
    
    /// Barcode of the product
    final String? barcode;
    
    /// ID of the category this product belongs to
    final String categoryId;
    
    /// Whether the product is active
    final bool isActive;
    
    /// Weight of the product
    final double? weight;
    
    /// Unit of weight measurement
    final String? weightUnit;
    
    /// Current stock quantity
    final int stockQuantity;
    
    /// Threshold for low stock warning
    final int lowStockThreshold;
    
    /// Whether the product is featured
    final bool isFeatured;
    
    /// Brand of the product
    final String? brand;
    
    /// Tax rate applied to the product
    final double taxRate;
    
    /// List of image URLs for the product
    final List<ProductImage> images;
  
    /// Creates a new instance of [Product]
    const Product({
      required super.id,
      required this.name,
      this.description,
      required this.price,
      this.salePrice,
      this.sku,
      this.barcode,
      required this.categoryId,
      this.isActive = true,
      this.weight,
      this.weightUnit = 'kg',
      this.stockQuantity = 0,
      this.lowStockThreshold = 5,
      this.isFeatured = false,
      this.brand,
      this.taxRate = 0.0,
      this.images = const [],
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [Product] from JSON
    factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$ProductToJson(this);
  
    /// Gets the current price of the product (sale price if available, otherwise regular price)
    double get currentPrice => salePrice ?? price;
  
    /// Checks if the product is on sale
    bool get isOnSale => salePrice != null && salePrice! < price;
  
    /// Checks if the product is in stock
    bool get isInStock => stockQuantity > 0;
  
    /// Checks if the product has low stock
    bool get hasLowStock => stockQuantity <= lowStockThreshold;
  
    /// Gets the primary image URL of the product
    String? get primaryImageUrl {
      final primaryImage = images.firstWhere(
        (image) => image.isPrimary,
        orElse: () => images.isNotEmpty ? images.first : const ProductImage(imageUrl: ''),
      );
      return primaryImage.imageUrl.isNotEmpty ? primaryImage.imageUrl : null;
    }
  
    /// Creates a copy of this product with the given fields replaced
    Product copyWith({
      String? id,
      String? name,
      String? description,
      double? price,
      double? salePrice,
      String? sku,
      String? barcode,
      String? categoryId,
      bool? isActive,
      double? weight,
      String? weightUnit,
      int? stockQuantity,
      int? lowStockThreshold,
      bool? isFeatured,
      String? brand,
      double? taxRate,
      List<ProductImage>? images,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return Product(
        id: id ?? this.id,
        name: name ?? this.name,
        description: description ?? this.description,
        price: price ?? this.price,
        salePrice: salePrice ?? this.salePrice,
        sku: sku ?? this.sku,
        barcode: barcode ?? this.barcode,
        categoryId: categoryId ?? this.categoryId,
        isActive: isActive ?? this.isActive,
        weight: weight ?? this.weight,
        weightUnit: weightUnit ?? this.weightUnit,
        stockQuantity: stockQuantity ?? this.stockQuantity,
        lowStockThreshold: lowStockThreshold ?? this.lowStockThreshold,
        isFeatured: isFeatured ?? this.isFeatured,
        brand: brand ?? this.brand,
        taxRate: taxRate ?? this.taxRate,
        images: images ?? this.images,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          name,
          description,
          price,
          salePrice,
          sku,
          barcode,
          categoryId,
          isActive,
          weight,
          weightUnit,
          stockQuantity,
          lowStockThreshold,
          isFeatured,
          brand,
          taxRate,
          images,
          createdAt,
          updatedAt,
        ];
  }
  
  /// Product image model
  @JsonSerializable()
  class ProductImage {
    /// URL of the image
    final String imageUrl;
    
    /// Whether this is the primary image
    final bool isPrimary;
    
    /// Display order of the image
    final int displayOrder;
  
    /// Creates a new instance of [ProductImage]
    const ProductImage({
      required this.imageUrl,
      this.isPrimary = false,
      this.displayOrder = 0,
    });
  
    /// Creates a [ProductImage] from JSON
    factory ProductImage.fromJson(Map<String, dynamic> json) => _$ProductImageFromJson(json);
  
    /// Converts the image to a JSON map
    Map<String, dynamic> toJson() => _$ProductImageToJson(this);
  }
  ```

### 2.4. Order Models

- [ ] Create order model:
  ```bash
  touch okada_core/lib/src/models/order.dart
  ```

- [ ] Implement order model:
  ```dart
  // okada_core/lib/src/models/order.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'order.g.dart';
  
  /// Status of an order
  enum OrderStatus {
    /// Order is pending
    pending,
    
    /// Order is confirmed
    confirmed,
    
    /// Order is being prepared
    preparing,
    
    /// Order is ready for pickup
    readyForPickup,
    
    /// Order is out for delivery
    outForDelivery,
    
    /// Order is delivered
    delivered,
    
    /// Order is cancelled
    cancelled,
    
    /// Order is returned
    returned
  }
  
  /// Status of a payment
  enum PaymentStatus {
    /// Payment is pending
    pending,
    
    /// Payment is completed
    completed,
    
    /// Payment failed
    failed,
    
    /// Payment is refunded
    refunded,
    
    /// Payment is partially refunded
    partiallyRefunded
  }
  
  /// Payment method for an order
  enum PaymentMethod {
    /// Cash on delivery
    cashOnDelivery,
    
    /// Credit card
    creditCard,
    
    /// Mobile money
    mobileMoney,
    
    /// Bank transfer
    bankTransfer
  }
  
  /// Order model representing an order in the system
  @JsonSerializable()
  class Order extends BaseModel {
    /// ID of the user who placed the order
    final String userId;
    
    /// ID of the store fulfilling the order
    final String storeId;
    
    /// ID of the rider delivering the order
    final String? riderId;
    
    /// Status of the order
    final OrderStatus status;
    
    /// Total amount of the order
    final double totalAmount;
    
    /// Delivery fee for the order
    final double deliveryFee;
    
    /// Tax amount for the order
    final double taxAmount;
    
    /// Discount amount applied to the order
    final double discountAmount;
    
    /// Payment method used for the order
    final PaymentMethod paymentMethod;
    
    /// Status of the payment
    final PaymentStatus paymentStatus;
    
    /// ID of the delivery address
    final String deliveryAddressId;
    
    /// Notes for delivery
    final String? deliveryNotes;
    
    /// Estimated delivery time
    final DateTime? estimatedDeliveryTime;
    
    /// Actual delivery time
    final DateTime? actualDeliveryTime;
    
    /// Order code (for tracking)
    final String orderCode;
    
    /// Items in the order
    final List<OrderItem> items;
    
    /// Status history of the order
    final List<OrderStatusHistory> statusHistory;
  
    /// Creates a new instance of [Order]
    const Order({
      required super.id,
      required this.userId,
      required this.storeId,
      this.riderId,
      this.status = OrderStatus.pending,
      required this.totalAmount,
      required this.deliveryFee,
      required this.taxAmount,
      this.discountAmount = 0.0,
      required this.paymentMethod,
      this.paymentStatus = PaymentStatus.pending,
      required this.deliveryAddressId,
      this.deliveryNotes,
      this.estimatedDeliveryTime,
      this.actualDeliveryTime,
      required this.orderCode,
      this.items = const [],
      this.statusHistory = const [],
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates an [Order] from JSON
    factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$OrderToJson(this);
  
    /// Gets the subtotal of the order (before tax, delivery fee, and discounts)
    double get subtotal => items.fold(0, (sum, item) => sum + item.totalPrice);
  
    /// Gets the total number of items in the order
    int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
  
    /// Checks if the order is in a final state (delivered, cancelled, or returned)
    bool get isCompleted => status == OrderStatus.delivered || 
                           status == OrderStatus.cancelled || 
                           status == OrderStatus.returned;
  
    /// Creates a copy of this order with the given fields replaced
    Order copyWith({
      String? id,
      String? userId,
      String? storeId,
      String? riderId,
      OrderStatus? status,
      double? totalAmount,
      double? deliveryFee,
      double? taxAmount,
      double? discountAmount,
      PaymentMethod? paymentMethod,
      PaymentStatus? paymentStatus,
      String? deliveryAddressId,
      String? deliveryNotes,
      DateTime? estimatedDeliveryTime,
      DateTime? actualDeliveryTime,
      String? orderCode,
      List<OrderItem>? items,
      List<OrderStatusHistory>? statusHistory,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return Order(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        storeId: storeId ?? this.storeId,
        riderId: riderId ?? this.riderId,
        status: status ?? this.status,
        totalAmount: totalAmount ?? this.totalAmount,
        deliveryFee: deliveryFee ?? this.deliveryFee,
        taxAmount: taxAmount ?? this.taxAmount,
        discountAmount: discountAmount ?? this.discountAmount,
        paymentMethod: paymentMethod ?? this.paymentMethod,
        paymentStatus: paymentStatus ?? this.paymentStatus,
        deliveryAddressId: deliveryAddressId ?? this.deliveryAddressId,
        deliveryNotes: deliveryNotes ?? this.deliveryNotes,
        estimatedDeliveryTime: estimatedDeliveryTime ?? this.estimatedDeliveryTime,
        actualDeliveryTime: actualDeliveryTime ?? this.actualDeliveryTime,
        orderCode: orderCode ?? this.orderCode,
        items: items ?? this.items,
        statusHistory: statusHistory ?? this.statusHistory,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          userId,
          storeId,
          riderId,
          status,
          totalAmount,
          deliveryFee,
          taxAmount,
          discountAmount,
          paymentMethod,
          paymentStatus,
          deliveryAddressId,
          deliveryNotes,
          estimatedDeliveryTime,
          actualDeliveryTime,
          orderCode,
          items,
          statusHistory,
          createdAt,
          updatedAt,
        ];
  }
  
  /// Order item model
  @JsonSerializable()
  class OrderItem {
    /// ID of the order item
    final String id;
    
    /// ID of the product
    final String productId;
    
    /// Name of the product
    final String productName;
    
    /// Quantity of the product
    final int quantity;
    
    /// Unit price of the product
    final double unitPrice;
    
    /// Total price for this item
    final double totalPrice;
  
    /// Creates a new instance of [OrderItem]
    const OrderItem({
      required this.id,
      required this.productId,
      required this.productName,
      required this.quantity,
      required this.unitPrice,
      required this.totalPrice,
    });
  
    /// Creates an [OrderItem] from JSON
    factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
  
    /// Converts the order item to a JSON map
    Map<String, dynamic> toJson() => _$OrderItemToJson(this);
  }
  
  /// Order status history model
  @JsonSerializable()
  class OrderStatusHistory {
    /// ID of the status history entry
    final String id;
    
    /// Status of the order
    final OrderStatus status;
    
    /// Notes about the status change
    final String? notes;
    
    /// Timestamp when the status was changed
    final DateTime createdAt;
    
    /// ID of the user who changed the status
    final String? createdBy;
  
    /// Creates a new instance of [OrderStatusHistory]
    const OrderStatusHistory({
      required this.id,
      required this.status,
      this.notes,
      required this.createdAt,
      this.createdBy,
    });
  
    /// Creates an [OrderStatusHistory] from JSON
    factory OrderStatusHistory.fromJson(Map<String, dynamic> json) => _$OrderStatusHistoryFromJson(json);
  
    /// Converts the status history to a JSON map
    Map<String, dynamic> toJson() => _$OrderStatusHistoryToJson(this);
  }
  ```

### 2.5. Store and Inventory Models

- [ ] Create store model:
  ```bash
  touch okada_core/lib/src/models/store.dart
  ```

- [ ] Implement store model:
  ```dart
  // okada_core/lib/src/models/store.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'store.g.dart';
  
  /// Dark store model representing a physical store location
  @JsonSerializable()
  class DarkStore extends BaseModel {
    /// Name of the store
    final String name;
    
    /// Address of the store
    final String address;
    
    /// City where the store is located
    final String city;
    
    /// State/province where the store is located
    final String? state;
    
    /// Postal code of the store location
    final String? postalCode;
    
    /// Country where the store is located
    final String country;
    
    /// Latitude coordinate of the store
    final double latitude;
    
    /// Longitude coordinate of the store
    final double longitude;
    
    /// Contact phone number for the store
    final String? contactPhone;
    
    /// Contact email for the store
    final String? contactEmail;
    
    /// Whether the store is active
    final bool isActive;
    
    /// Operating hours of the store
    final String? operatingHours;
    
    /// Coverage radius in kilometers
    final double coverageRadiusKm;
  
    /// Creates a new instance of [DarkStore]
    const DarkStore({
      required super.id,
      required this.name,
      required this.address,
      required this.city,
      this.state,
      this.postalCode,
      this.country = 'Cameroon',
      required this.latitude,
      required this.longitude,
      this.contactPhone,
      this.contactEmail,
      this.isActive = true,
      this.operatingHours,
      this.coverageRadiusKm = 5.0,
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [DarkStore] from JSON
    factory DarkStore.fromJson(Map<String, dynamic> json) => _$DarkStoreFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$DarkStoreToJson(this);
  
    /// Gets the full address of the store
    String get fullAddress {
      final parts = [
        address,
        city,
        if (state != null) state,
        if (postalCode != null) postalCode,
        country,
      ];
      return parts.join(', ');
    }
  
    /// Creates a copy of this store with the given fields replaced
    DarkStore copyWith({
      String? id,
      String? name,
      String? address,
      String? city,
      String? state,
      String? postalCode,
      String? country,
      double? latitude,
      double? longitude,
      String? contactPhone,
      String? contactEmail,
      bool? isActive,
      String? operatingHours,
      double? coverageRadiusKm,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return DarkStore(
        id: id ?? this.id,
        name: name ?? this.name,
        address: address ?? this.address,
        city: city ?? this.city,
        state: state ?? this.state,
        postalCode: postalCode ?? this.postalCode,
        country: country ?? this.country,
        latitude: latitude ?? this.latitude,
        longitude: longitude ?? this.longitude,
        contactPhone: contactPhone ?? this.contactPhone,
        contactEmail: contactEmail ?? this.contactEmail,
        isActive: isActive ?? this.isActive,
        operatingHours: operatingHours ?? this.operatingHours,
        coverageRadiusKm: coverageRadiusKm ?? this.coverageRadiusKm,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          name,
          address,
          city,
          state,
          postalCode,
          country,
          latitude,
          longitude,
          contactPhone,
          contactEmail,
          isActive,
          operatingHours,
          coverageRadiusKm,
          createdAt,
          updatedAt,
        ];
  }
  
  /// Store inventory model
  @JsonSerializable()
  class StoreInventory extends BaseModel {
    /// ID of the store
    final String storeId;
    
    /// ID of the product
    final String productId;
    
    /// Quantity in stock
    final int quantity;
    
    /// Date of last restock
    final DateTime? lastRestockDate;
    
    /// Threshold for restock alerts
    final int restockThreshold;
  
    /// Creates a new instance of [StoreInventory]
    const StoreInventory({
      required super.id,
      required this.storeId,
      required this.productId,
      required this.quantity,
      this.lastRestockDate,
      this.restockThreshold = 5,
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [StoreInventory] from JSON
    factory StoreInventory.fromJson(Map<String, dynamic> json) => _$StoreInventoryFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$StoreInventoryToJson(this);
  
    /// Checks if the inventory needs restocking
    bool get needsRestock => quantity <= restockThreshold;
  
    /// Creates a copy of this inventory with the given fields replaced
    StoreInventory copyWith({
      String? id,
      String? storeId,
      String? productId,
      int? quantity,
      DateTime? lastRestockDate,
      int? restockThreshold,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return StoreInventory(
        id: id ?? this.id,
        storeId: storeId ?? this.storeId,
        productId: productId ?? this.productId,
        quantity: quantity ?? this.quantity,
        lastRestockDate: lastRestockDate ?? this.lastRestockDate,
        restockThreshold: restockThreshold ?? this.restockThreshold,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          storeId,
          productId,
          quantity,
          lastRestockDate,
          restockThreshold,
          createdAt,
          updatedAt,
        ];
  }
  ```

### 2.6. Rider Models

- [ ] Create rider model:
  ```bash
  touch okada_core/lib/src/models/rider.dart
  ```

- [ ] Implement rider model:
  ```dart
  // okada_core/lib/src/models/rider.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'rider.g.dart';
  
  /// Status of a rider
  enum RiderStatus {
    /// Rider is offline
    offline,
    
    /// Rider is online and available
    available,
    
    /// Rider is busy with a delivery
    busy,
    
    /// Rider is on break
    onBreak,
    
    /// Rider is inactive
    inactive
  }
  
  /// Type of vehicle used by the rider
  enum VehicleType {
    /// Motorcycle
    motorcycle,
    
    /// Bicycle
    bicycle,
    
    /// Car
    car,
    
    /// On foot
    onFoot
  }
  
  /// Rider model representing a delivery person
  @JsonSerializable()
  class Rider extends BaseModel {
    /// ID of the user associated with this rider
    final String userId;
    
    /// Type of vehicle used by the rider
    final VehicleType vehicleType;
    
    /// License number of the rider's vehicle
    final String? licenseNumber;
    
    /// Whether the rider is active
    final bool isActive;
    
    /// Current latitude of the rider
    final double? currentLatitude;
    
    /// Current longitude of the rider
    final double? currentLongitude;
    
    /// Timestamp of the last location update
    final DateTime? lastLocationUpdate;
    
    /// Average rating of the rider
    final double? rating;
    
    /// Total number of deliveries completed
    final int totalDeliveries;
    
    /// ID of the store the rider is assigned to
    final String? assignedStoreId;
    
    /// Current status of the rider
    final RiderStatus status;
  
    /// Creates a new instance of [Rider]
    const Rider({
      required super.id,
      required this.userId,
      required this.vehicleType,
      this.licenseNumber,
      this.isActive = true,
      this.currentLatitude,
      this.currentLongitude,
      this.lastLocationUpdate,
      this.rating,
      this.totalDeliveries = 0,
      this.assignedStoreId,
      this.status = RiderStatus.offline,
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [Rider] from JSON
    factory Rider.fromJson(Map<String, dynamic> json) => _$RiderFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$RiderToJson(this);
  
    /// Checks if the rider is currently available for deliveries
    bool get isAvailable => isActive && status == RiderStatus.available;
  
    /// Checks if the rider has a valid location
    bool get hasValidLocation => currentLatitude != null && currentLongitude != null;
  
    /// Creates a copy of this rider with the given fields replaced
    Rider copyWith({
      String? id,
      String? userId,
      VehicleType? vehicleType,
      String? licenseNumber,
      bool? isActive,
      double? currentLatitude,
      double? currentLongitude,
      DateTime? lastLocationUpdate,
      double? rating,
      int? totalDeliveries,
      String? assignedStoreId,
      RiderStatus? status,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return Rider(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        vehicleType: vehicleType ?? this.vehicleType,
        licenseNumber: licenseNumber ?? this.licenseNumber,
        isActive: isActive ?? this.isActive,
        currentLatitude: currentLatitude ?? this.currentLatitude,
        currentLongitude: currentLongitude ?? this.currentLongitude,
        lastLocationUpdate: lastLocationUpdate ?? this.lastLocationUpdate,
        rating: rating ?? this.rating,
        totalDeliveries: totalDeliveries ?? this.totalDeliveries,
        assignedStoreId: assignedStoreId ?? this.assignedStoreId,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          userId,
          vehicleType,
          licenseNumber,
          isActive,
          currentLatitude,
          currentLongitude,
          lastLocationUpdate,
          rating,
          totalDeliveries,
          assignedStoreId,
          status,
          createdAt,
          updatedAt,
        ];
  }
  ```

### 2.7. AI Models

- [ ] Create AI recommendation model:
  ```bash
  touch okada_core/lib/src/models/ai_recommendation.dart
  ```

- [ ] Implement AI recommendation model:
  ```dart
  // okada_core/lib/src/models/ai_recommendation.dart
  import 'package:json_annotation/json_annotation.dart';
  
  part 'ai_recommendation.g.dart';
  
  /// Types of recommendations
  enum RecommendationType {
    /// Product recommendations
    product,
    
    /// Category recommendations
    category,
    
    /// Store recommendations
    store,
    
    /// Search query recommendations
    searchQuery
  }
  
  /// AI recommendation request model
  @JsonSerializable()
  class RecommendationRequest {
    /// ID of the user to get recommendations for
    final String? userId;
    
    /// ID of the product to get similar recommendations for
    final String? productId;
    
    /// ID of the category to get recommendations within
    final String? categoryId;
    
    /// Type of recommendation to get
    final RecommendationType type;
    
    /// Maximum number of recommendations to return
    final int limit;
    
    /// Context information for the recommendation
    final RecommendationContext? context;
  
    /// Creates a new instance of [RecommendationRequest]
    const RecommendationRequest({
      this.userId,
      this.productId,
      this.categoryId,
      required this.type,
      this.limit = 10,
      this.context,
    });
  
    /// Creates a [RecommendationRequest] from JSON
    factory RecommendationRequest.fromJson(Map<String, dynamic> json) => _$RecommendationRequestFromJson(json);
  
    /// Converts the request to a JSON map
    Map<String, dynamic> toJson() => _$RecommendationRequestToJson(this);
  }
  
  /// Context information for recommendations
  @JsonSerializable()
  class RecommendationContext {
    /// Current location of the user
    final LocationContext? location;
    
    /// Time of day (morning, afternoon, evening, night)
    final String? timeOfDay;
    
    /// Day of the week
    final String? dayOfWeek;
    
    /// Weather conditions
    final String? weather;
    
    /// Recent search queries
    final List<String>? recentSearches;
    
    /// Recently viewed products
    final List<String>? recentViews;
    
    /// Type of device being used
    final String? deviceType;
    
    /// Current cart items
    final List<String>? cartItems;
  
    /// Creates a new instance of [RecommendationContext]
    const RecommendationContext({
      this.location,
      this.timeOfDay,
      this.dayOfWeek,
      this.weather,
      this.recentSearches,
      this.recentViews,
      this.deviceType,
      this.cartItems,
    });
  
    /// Creates a [RecommendationContext] from JSON
    factory RecommendationContext.fromJson(Map<String, dynamic> json) => _$RecommendationContextFromJson(json);
  
    /// Converts the context to a JSON map
    Map<String, dynamic> toJson() => _$RecommendationContextToJson(this);
  }
  
  /// Location context for recommendations
  @JsonSerializable()
  class LocationContext {
    /// Latitude coordinate
    final double latitude;
    
    /// Longitude coordinate
    final double longitude;
    
    /// City name
    final String? city;
    
    /// Neighborhood name
    final String? neighborhood;
  
    /// Creates a new instance of [LocationContext]
    const LocationContext({
      required this.latitude,
      required this.longitude,
      this.city,
      this.neighborhood,
    });
  
    /// Creates a [LocationContext] from JSON
    factory LocationContext.fromJson(Map<String, dynamic> json) => _$LocationContextFromJson(json);
  
    /// Converts the location context to a JSON map
    Map<String, dynamic> toJson() => _$LocationContextToJson(this);
  }
  
  /// Recommendation item model
  @JsonSerializable()
  class RecommendationItem {
    /// ID of the recommended item
    final String id;
    
    /// Type of the recommended item
    final RecommendationType type;
    
    /// Score/confidence of the recommendation
    final double score;
    
    /// Reason for the recommendation
    final String? reason;
  
    /// Creates a new instance of [RecommendationItem]
    const RecommendationItem({
      required this.id,
      required this.type,
      required this.score,
      this.reason,
    });
  
    /// Creates a [RecommendationItem] from JSON
    factory RecommendationItem.fromJson(Map<String, dynamic> json) => _$RecommendationItemFromJson(json);
  
    /// Converts the recommendation item to a JSON map
    Map<String, dynamic> toJson() => _$RecommendationItemToJson(this);
  }
  
  /// AI recommendation response model
  @JsonSerializable()
  class RecommendationResponse {
    /// List of recommended items
    final List<RecommendationItem> items;
    
    /// ID of the request
    final String requestId;
    
    /// Version of the model used
    final String modelVersion;
  
    /// Creates a new instance of [RecommendationResponse]
    const RecommendationResponse({
      required this.items,
      required this.requestId,
      required this.modelVersion,
    });
  
    /// Creates a [RecommendationResponse] from JSON
    factory RecommendationResponse.fromJson(Map<String, dynamic> json) => _$RecommendationResponseFromJson(json);
  
    /// Converts the response to a JSON map
    Map<String, dynamic> toJson() => _$RecommendationResponseToJson(this);
  }
  ```

- [ ] Create AI demand forecast model:
  ```bash
  touch okada_core/lib/src/models/ai_demand_forecast.dart
  ```

- [ ] Implement AI demand forecast model:
  ```dart
  // okada_core/lib/src/models/ai_demand_forecast.dart
  import 'package:json_annotation/json_annotation.dart';
  
  part 'ai_demand_forecast.g.dart';
  
  /// AI demand forecast request model
  @JsonSerializable()
  class DemandForecastRequest {
    /// List of product IDs to forecast demand for
    final List<String> productIds;
    
    /// ID of the store to forecast demand for
    final String storeId;
    
    /// Number of time periods to forecast
    final int horizon;
    
    /// Additional features for forecasting
    final ForecastFeatures? features;
  
    /// Creates a new instance of [DemandForecastRequest]
    const DemandForecastRequest({
      required this.productIds,
      required this.storeId,
      required this.horizon,
      this.features,
    });
  
    /// Creates a [DemandForecastRequest] from JSON
    factory DemandForecastRequest.fromJson(Map<String, dynamic> json) => _$DemandForecastRequestFromJson(json);
  
    /// Converts the request to a JSON map
    Map<String, dynamic> toJson() => _$DemandForecastRequestToJson(this);
  }
  
  /// Additional features for demand forecasting
  @JsonSerializable()
  class ForecastFeatures {
    /// Weather forecast data
    final Map<String, dynamic>? weatherForecast;
    
    /// Upcoming events that may affect demand
    final List<Map<String, dynamic>>? events;
    
    /// Upcoming promotions that may affect demand
    final List<Map<String, dynamic>>? promotions;
    
    /// Upcoming holidays that may affect demand
    final List<String>? holidays;
  
    /// Creates a new instance of [ForecastFeatures]
    const ForecastFeatures({
      this.weatherForecast,
      this.events,
      this.promotions,
      this.holidays,
    });
  
    /// Creates [ForecastFeatures] from JSON
    factory ForecastFeatures.fromJson(Map<String, dynamic> json) => _$ForecastFeaturesFromJson(json);
  
    /// Converts the features to a JSON map
    Map<String, dynamic> toJson() => _$ForecastFeaturesToJson(this);
  }
  
  /// Forecast item model
  @JsonSerializable()
  class ForecastItem {
    /// ID of the product
    final String productId;
    
    /// Timestamp of the forecast
    final DateTime timestamp;
    
    /// Forecasted quantity
    final double quantity;
    
    /// Confidence interval [lower_bound, upper_bound]
    final List<double> confidenceInterval;
  
    /// Creates a new instance of [ForecastItem]
    const ForecastItem({
      required this.productId,
      required this.timestamp,
      required this.quantity,
      required this.confidenceInterval,
    });
  
    /// Creates a [ForecastItem] from JSON
    factory ForecastItem.fromJson(Map<String, dynamic> json) => _$ForecastItemFromJson(json);
  
    /// Converts the forecast item to a JSON map
    Map<String, dynamic> toJson() => _$ForecastItemToJson(this);
  }
  
  /// AI demand forecast response model
  @JsonSerializable()
  class DemandForecastResponse {
    /// List of forecast items
    final List<ForecastItem> forecasts;
    
    /// ID of the request
    final String requestId;
    
    /// Version of the model used
    final String modelVersion;
  
    /// Creates a new instance of [DemandForecastResponse]
    const DemandForecastResponse({
      required this.forecasts,
      required this.requestId,
      required this.modelVersion,
    });
  
    /// Creates a [DemandForecastResponse] from JSON
    factory DemandForecastResponse.fromJson(Map<String, dynamic> json) => _$DemandForecastResponseFromJson(json);
  
    /// Converts the response to a JSON map
    Map<String, dynamic> toJson() => _$DemandForecastResponseToJson(this);
  }
  ```

- [ ] Create AI route optimization model:
  ```bash
  touch okada_core/lib/src/models/ai_route_optimization.dart
  ```

- [ ] Implement AI route optimization model:
  ```dart
  // okada_core/lib/src/models/ai_route_optimization.dart
  import 'package:json_annotation/json_annotation.dart';
  
  part 'ai_route_optimization.g.dart';
  
  /// AI route optimization request model
  @JsonSerializable()
  class RouteOptimizationRequest {
    /// List of orders to optimize routes for
    final List<OrderForRouting> orders;
    
    /// List of available riders
    final List<RiderForRouting> riders;
    
    /// What to optimize for (time, distance, or balanced)
    final String optimizeFor;
    
    /// Traffic conditions (light, moderate, heavy)
    final String? trafficConditions;
    
    /// Weather conditions (clear, rain, storm)
    final String? weatherConditions;
  
    /// Creates a new instance of [RouteOptimizationRequest]
    const RouteOptimizationRequest({
      required this.orders,
      required this.riders,
      this.optimizeFor = 'balanced',
      this.trafficConditions,
      this.weatherConditions,
    });
  
    /// Creates a [RouteOptimizationRequest] from JSON
    factory RouteOptimizationRequest.fromJson(Map<String, dynamic> json) => _$RouteOptimizationRequestFromJson(json);
  
    /// Converts the request to a JSON map
    Map<String, dynamic> toJson() => _$RouteOptimizationRequestToJson(this);
  }
  
  /// Order information for routing
  @JsonSerializable()
  class OrderForRouting {
    /// ID of the order
    final String orderId;
    
    /// Pickup location
    final LocationForRouting pickupLocation;
    
    /// Delivery location
    final LocationForRouting deliveryLocation;
    
    /// Time when the order will be ready for pickup
    final DateTime readyTime;
    
    /// Deadline for delivery
    final DateTime? deliveryDeadline;
    
    /// Priority of the order (higher number means higher priority)
    final int priority;
    
    /// Weight of the order
    final double? weight;
    
    /// Volume of the order
    final double? volume;
  
    /// Creates a new instance of [OrderForRouting]
    const OrderForRouting({
      required this.orderId,
      required this.pickupLocation,
      required this.deliveryLocation,
      required this.readyTime,
      this.deliveryDeadline,
      this.priority = 1,
      this.weight,
      this.volume,
    });
  
    /// Creates an [OrderForRouting] from JSON
    factory OrderForRouting.fromJson(Map<String, dynamic> json) => _$OrderForRoutingFromJson(json);
  
    /// Converts the order to a JSON map
    Map<String, dynamic> toJson() => _$OrderForRoutingToJson(this);
  }
  
  /// Rider information for routing
  @JsonSerializable()
  class RiderForRouting {
    /// ID of the rider
    final String riderId;
    
    /// Current location of the rider
    final LocationForRouting currentLocation;
    
    /// Time when the rider becomes available
    final DateTime availableFrom;
    
    /// Time until the rider is available
    final DateTime? availableUntil;
    
    /// Maximum weight the rider can carry
    final double? maxWeight;
    
    /// Maximum volume the rider can carry
    final double? maxVolume;
    
    /// Type of vehicle the rider uses
    final String vehicleType;
  
    /// Creates a new instance of [RiderForRouting]
    const RiderForRouting({
      required this.riderId,
      required this.currentLocation,
      required this.availableFrom,
      this.availableUntil,
      this.maxWeight,
      this.maxVolume,
      required this.vehicleType,
    });
  
    /// Creates a [RiderForRouting] from JSON
    factory RiderForRouting.fromJson(Map<String, dynamic> json) => _$RiderForRoutingFromJson(json);
  
    /// Converts the rider to a JSON map
    Map<String, dynamic> toJson() => _$RiderForRoutingToJson(this);
  }
  
  /// Location information for routing
  @JsonSerializable()
  class LocationForRouting {
    /// Latitude coordinate
    final double latitude;
    
    /// Longitude coordinate
    final double longitude;
    
    /// Address as text
    final String? address;
  
    /// Creates a new instance of [LocationForRouting]
    const LocationForRouting({
      required this.latitude,
      required this.longitude,
      this.address,
    });
  
    /// Creates a [LocationForRouting] from JSON
    factory LocationForRouting.fromJson(Map<String, dynamic> json) => _$LocationForRoutingFromJson(json);
  
    /// Converts the location to a JSON map
    Map<String, dynamic> toJson() => _$LocationForRoutingToJson(this);
  }
  
  /// Stop in an optimized route
  @JsonSerializable()
  class RouteStop {
    /// ID of the order
    final String orderId;
    
    /// Location of the stop
    final LocationForRouting location;
    
    /// Estimated arrival time
    final DateTime estimatedArrivalTime;
    
    /// Estimated departure time
    final DateTime estimatedDepartureTime;
  
    /// Creates a new instance of [RouteStop]
    const RouteStop({
      required this.orderId,
      required this.location,
      required this.estimatedArrivalTime,
      required this.estimatedDepartureTime,
    });
  
    /// Creates a [RouteStop] from JSON
    factory RouteStop.fromJson(Map<String, dynamic> json) => _$RouteStopFromJson(json);
  
    /// Converts the stop to a JSON map
    Map<String, dynamic> toJson() => _$RouteStopToJson(this);
  }
  
  /// Optimized route for a rider
  @JsonSerializable()
  class OptimizedRoute {
    /// ID of the rider
    final String riderId;
    
    /// List of stops in the route
    final List<RouteStop> stops;
    
    /// Total distance in kilometers
    final double totalDistance;
    
    /// Total time in minutes
    final int totalTime;
    
    /// Start time of the route
    final DateTime startTime;
    
    /// End time of the route
    final DateTime endTime;
  
    /// Creates a new instance of [OptimizedRoute]
    const OptimizedRoute({
      required this.riderId,
      required this.stops,
      required this.totalDistance,
      required this.totalTime,
      required this.startTime,
      required this.endTime,
    });
  
    /// Creates an [OptimizedRoute] from JSON
    factory OptimizedRoute.fromJson(Map<String, dynamic> json) => _$OptimizedRouteFromJson(json);
  
    /// Converts the route to a JSON map
    Map<String, dynamic> toJson() => _$OptimizedRouteToJson(this);
  }
  
  /// AI route optimization response model
  @JsonSerializable()
  class RouteOptimizationResponse {
    /// List of optimized routes
    final List<OptimizedRoute> routes;
    
    /// ID of the request
    final String requestId;
    
    /// Version of the model used
    final String modelVersion;
  
    /// Creates a new instance of [RouteOptimizationResponse]
    const RouteOptimizationResponse({
      required this.routes,
      required this.requestId,
      required this.modelVersion,
    });
  
    /// Creates a [RouteOptimizationResponse] from JSON
    factory RouteOptimizationResponse.fromJson(Map<String, dynamic> json) => _$RouteOptimizationResponseFromJson(json);
  
    /// Converts the response to a JSON map
    Map<String, dynamic> toJson() => _$RouteOptimizationResponseToJson(this);
  }
  ```

### 2.8. Generate Model Files

- [ ] Run build_runner to generate JSON serialization code:
  ```bash
  cd okada_core
  flutter pub get
  flutter pub run build_runner build --delete-conflicting-outputs
  ```

## 3. API Controllers Implementation

### 3.1. Base Controller

- [ ] Create base controller:
  ```bash
  mkdir -p okada_api/lib/src/controllers
  touch okada_api/lib/src/controllers/base_controller.dart
  ```

- [ ] Implement base controller:
  ```dart
  // okada_api/lib/src/controllers/base_controller.dart
  import 'dart:convert';
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  import 'package:logging/logging.dart';
  
  /// Base controller class for API endpoints
  abstract class BaseController {
    /// Logger instance for this controller
    final Logger logger;
  
    /// Creates a new instance of [BaseController]
    BaseController(String name) : logger = Logger(name);
  
    /// Gets the router for this controller
    Router get router;
  
    /// Creates a JSON response
    Response jsonResponse(dynamic body, {int statusCode = 200}) {
      return Response(
        statusCode,
        body: json.encode(body),
        headers: {'content-type': 'application/json'},
      );
    }
  
    /// Creates a success response
    Response success(dynamic data, {String? message, int statusCode = 200}) {
      return jsonResponse({
        'success': true,
        'message': message,
        'data': data,
      }, statusCode: statusCode);
    }
  
    /// Creates an error response
    Response error(String message, {int statusCode = 400, dynamic details}) {
      return jsonResponse({
        'success': false,
        'message': message,
        'details': details,
      }, statusCode: statusCode);
    }
  
    /// Handles exceptions and returns an appropriate error response
    Response handleException(Object e, StackTrace stackTrace) {
      logger.severe('Exception caught', e, stackTrace);
  
      if (e is FormatException) {
        return error('Invalid request format', statusCode: 400);
      }
  
      return error('Internal server error', statusCode: 500);
    }
  
    /// Parses the request body as JSON
    Future<Map<String, dynamic>> parseJsonBody(Request request) async {
      final body = await request.readAsString();
      if (body.isEmpty) {
        return {};
      }
      return json.decode(body) as Map<String, dynamic>;
    }
  }
  ```

### 3.2. Auth Controller

- [ ] Create auth controller:
  ```bash
  touch okada_api/lib/src/controllers/auth_controller.dart
  ```

- [ ] Implement auth controller:
  ```dart
  // okada_api/lib/src/controllers/auth_controller.dart
  import 'dart:convert';
  import 'package:crypto/crypto.dart';
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  import 'package:uuid/uuid.dart';
  import 'package:jwt_decoder/jwt_decoder.dart';
  
  import '../services/user_service.dart';
  import '../services/auth_service.dart';
  import 'base_controller.dart';
  
  /// Controller for authentication endpoints
  class AuthController extends BaseController {
    /// User service instance
    final UserService _userService;
    
    /// Auth service instance
    final AuthService _authService;
  
    /// Creates a new instance of [AuthController]
    AuthController(this._userService, this._authService) : super('AuthController');
  
    @override
    Router get router {
      final router = Router();
  
      // Register a new user
      router.post('/register', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['phoneNumber', 'firstName', 'lastName', 'password'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null || body[field].toString().isEmpty) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Check if user already exists
          final existingUser = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (existingUser != null) {
            return error('User with this phone number already exists', statusCode: 409);
          }
  
          // Create user
          final userId = const Uuid().v4();
          final hashedPassword = _hashPassword(body['password']);
  
          final user = await _userService.createUser(
            id: userId,
            phoneNumber: body['phoneNumber'],
            email: body['email'],
            firstName: body['firstName'],
            lastName: body['lastName'],
            passwordHash: hashedPassword,
          );
  
          // Generate verification code and send SMS
          await _authService.sendVerificationCode(user.phoneNumber);
  
          return success({
            'userId': user.id,
            'phoneNumber': user.phoneNumber,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'requiresVerification': true,
          }, message: 'User registered successfully', statusCode: 201);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Login
      router.post('/login', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber') || !body.containsKey('password')) {
            return error('Phone number and password are required', statusCode: 400);
          }
  
          // Find user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('Invalid credentials', statusCode: 401);
          }
  
          // Verify password
          final hashedPassword = _hashPassword(body['password']);
          final isValid = await _authService.verifyPassword(user.id, hashedPassword);
          if (!isValid) {
            return error('Invalid credentials', statusCode: 401);
          }
  
          // Generate token
          final token = await _authService.generateToken(user.id);
  
          // Update last login
          await _userService.updateLastLogin(user.id);
  
          return success({
            'token': token,
            'user': {
              'id': user.id,
              'phoneNumber': user.phoneNumber,
              'firstName': user.firstName,
              'lastName': user.lastName,
              'email': user.email,
              'profileImageUrl': user.profileImageUrl,
              'isPhoneVerified': user.isPhoneVerified,
            },
          }, message: 'Login successful');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Verify phone number
      router.post('/verify-phone', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber') || !body.containsKey('code')) {
            return error('Phone number and verification code are required', statusCode: 400);
          }
  
          // Verify code
          final isValid = await _authService.verifyCode(body['phoneNumber'], body['code']);
          if (!isValid) {
            return error('Invalid verification code', statusCode: 400);
          }
  
          // Update user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          await _userService.markPhoneAsVerified(user.id);
  
          // Generate token
          final token = await _authService.generateToken(user.id);
  
          return success({
            'token': token,
            'user': {
              'id': user.id,
              'phoneNumber': user.phoneNumber,
              'firstName': user.firstName,
              'lastName': user.lastName,
              'email': user.email,
              'profileImageUrl': user.profileImageUrl,
              'isPhoneVerified': true,
            },
          }, message: 'Phone number verified successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Resend verification code
      router.post('/resend-verification', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber')) {
            return error('Phone number is required', statusCode: 400);
          }
  
          // Find user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          // Generate and send verification code
          await _authService.sendVerificationCode(user.phoneNumber);
  
          return success(null, message: 'Verification code sent successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Forgot password
      router.post('/forgot-password', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber')) {
            return error('Phone number is required', statusCode: 400);
          }
  
          // Find user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          // Generate and send reset code
          await _authService.sendPasswordResetCode(user.phoneNumber);
  
          return success(null, message: 'Password reset code sent successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Reset password
      router.post('/reset-password', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber') || 
              !body.containsKey('code') || 
              !body.containsKey('newPassword')) {
            return error('Phone number, code, and new password are required', statusCode: 400);
          }
  
          // Verify code
          final isValid = await _authService.verifyResetCode(body['phoneNumber'], body['code']);
          if (!isValid) {
            return error('Invalid reset code', statusCode: 400);
          }
  
          // Find user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          // Update password
          final hashedPassword = _hashPassword(body['newPassword']);
          await _userService.updatePassword(user.id, hashedPassword);
  
          return success(null, message: 'Password reset successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Change password
      router.post('/change-password', (Request request) async {
        try {
          // Verify token
          final userId = await _getUserIdFromRequest(request);
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('currentPassword') || !body.containsKey('newPassword')) {
            return error('Current password and new password are required', statusCode: 400);
          }
  
          // Verify current password
          final hashedCurrentPassword = _hashPassword(body['currentPassword']);
          final isValid = await _authService.verifyPassword(userId, hashedCurrentPassword);
          if (!isValid) {
            return error('Current password is incorrect', statusCode: 400);
          }
  
          // Update password
          final hashedNewPassword = _hashPassword(body['newPassword']);
          await _userService.updatePassword(userId, hashedNewPassword);
  
          return success(null, message: 'Password changed successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Refresh token
      router.post('/refresh-token', (Request request) async {
        try {
          // Verify token
          final userId = await _getUserIdFromRequest(request);
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          // Generate new token
          final token = await _authService.generateToken(userId);
  
          return success({
            'token': token,
          }, message: 'Token refreshed successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  
    /// Hashes a password using SHA-256
    String _hashPassword(String password) {
      final bytes = utf8.encode(password);
      final digest = sha256.convert(bytes);
      return digest.toString();
    }
  
    /// Gets the user ID from the request's authorization header
    Future<String?> _getUserIdFromRequest(Request request) async {
      final authHeader = request.headers['authorization'];
      if (authHeader == null || !authHeader.startsWith('Bearer ')) {
        return null;
      }
  
      final token = authHeader.substring(7);
      try {
        final decodedToken = JwtDecoder.decode(token);
        return decodedToken['sub'] as String?;
      } catch (e) {
        return null;
      }
    }
  }
  ```

### 3.3. User Controller

- [ ] Create user controller:
  ```bash
  touch okada_api/lib/src/controllers/user_controller.dart
  ```

- [ ] Implement user controller:
  ```dart
  // okada_api/lib/src/controllers/user_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/user_service.dart';
  import '../middleware/auth_middleware.dart';
  import 'base_controller.dart';
  
  /// Controller for user endpoints
  class UserController extends BaseController {
    /// User service instance
    final UserService _userService;
  
    /// Creates a new instance of [UserController]
    UserController(this._userService) : super('UserController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get current user profile
      router.get('/me', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final user = await _userService.findById(userId);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          return success({
            'id': user.id,
            'phoneNumber': user.phoneNumber,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'profileImageUrl': user.profileImageUrl,
            'isPhoneVerified': user.isPhoneVerified,
            'isEmailVerified': user.isEmailVerified,
            'createdAt': user.createdAt?.toIso8601String(),
            'lastLogin': user.lastLogin?.toIso8601String(),
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update user profile
      router.put('/me', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Update user
          final updatedUser = await _userService.updateUser(
            userId,
            firstName: body['firstName'],
            lastName: body['lastName'],
            email: body['email'],
          );
  
          return success({
            'id': updatedUser.id,
            'phoneNumber': updatedUser.phoneNumber,
            'firstName': updatedUser.firstName,
            'lastName': updatedUser.lastName,
            'email': updatedUser.email,
            'profileImageUrl': updatedUser.profileImageUrl,
            'isPhoneVerified': updatedUser.isPhoneVerified,
            'isEmailVerified': updatedUser.isEmailVerified,
          }, message: 'Profile updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update profile image
      router.put('/me/profile-image', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('imageUrl') || body['imageUrl'] == null) {
            return error('Image URL is required', statusCode: 400);
          }
  
          // Update profile image
          await _userService.updateProfileImage(userId, body['imageUrl']);
  
          return success(null, message: 'Profile image updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update FCM token
      router.put('/me/fcm-token', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('fcmToken') || body['fcmToken'] == null) {
            return error('FCM token is required', statusCode: 400);
          }
  
          // Update FCM token
          await _userService.updateFcmToken(userId, body['fcmToken']);
  
          return success(null, message: 'FCM token updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get user addresses
      router.get('/me/addresses', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final addresses = await _userService.getUserAddresses(userId);
  
          return success(addresses);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Add user address
      router.post('/me/addresses', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['addressLine1', 'city', 'country', 'latitude', 'longitude'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Add address
          final address = await _userService.addUserAddress(
            userId,
            addressLine1: body['addressLine1'],
            addressLine2: body['addressLine2'],
            city: body['city'],
            state: body['state'],
            postalCode: body['postalCode'],
            country: body['country'],
            latitude: body['latitude'],
            longitude: body['longitude'],
            isDefault: body['isDefault'] ?? false,
            label: body['label'],
          );
  
          return success(address, message: 'Address added successfully', statusCode: 201);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update user address
      router.put('/me/addresses/<addressId>', (Request request, String addressId) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Update address
          final address = await _userService.updateUserAddress(
            userId,
            addressId,
            addressLine1: body['addressLine1'],
            addressLine2: body['addressLine2'],
            city: body['city'],
            state: body['state'],
            postalCode: body['postalCode'],
            country: body['country'],
            latitude: body['latitude'],
            longitude: body['longitude'],
            isDefault: body['isDefault'],
            label: body['label'],
          );
  
          if (address == null) {
            return error('Address not found', statusCode: 404);
          }
  
          return success(address, message: 'Address updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Delete user address
      router.delete('/me/addresses/<addressId>', (Request request, String addressId) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          // Delete address
          final success = await _userService.deleteUserAddress(userId, addressId);
          if (!success) {
            return error('Address not found', statusCode: 404);
          }
  
          return this.success(null, message: 'Address deleted successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Set default address
      router.put('/me/addresses/<addressId>/default', (Request request, String addressId) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          // Set default address
          final success = await _userService.setDefaultAddress(userId, addressId);
          if (!success) {
            return error('Address not found', statusCode: 404);
          }
  
          return this.success(null, message: 'Default address updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.4. Product Controller

- [ ] Create product controller:
  ```bash
  touch okada_api/lib/src/controllers/product_controller.dart
  ```

- [ ] Implement product controller:
  ```dart
  // okada_api/lib/src/controllers/product_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/product_service.dart';
  import '../services/ai_service.dart';
  import 'base_controller.dart';
  
  /// Controller for product endpoints
  class ProductController extends BaseController {
    /// Product service instance
    final ProductService _productService;
    
    /// AI service instance
    final AIService _aiService;
  
    /// Creates a new instance of [ProductController]
    ProductController(this._productService, this._aiService) : super('ProductController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get all products with pagination and filtering
      router.get('/', (Request request) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '20') ?? 20;
          
          // Parse filtering parameters
          final categoryId = queryParams['categoryId'];
          final query = queryParams['query'];
          final minPrice = double.tryParse(queryParams['minPrice'] ?? '');
          final maxPrice = double.tryParse(queryParams['maxPrice'] ?? '');
          final sortBy = queryParams['sortBy'] ?? 'name';
          final sortOrder = queryParams['sortOrder'] ?? 'asc';
          final featured = queryParams['featured'] == 'true';
          
          // Get products
          final result = await _productService.getProducts(
            page: page,
            limit: limit,
            categoryId: categoryId,
            query: query,
            minPrice: minPrice,
            maxPrice: maxPrice,
            sortBy: sortBy,
            sortOrder: sortOrder,
            featured: featured,
          );
  
          return success({
            'products': result.products,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get product by ID
      router.get('/<id>', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          
          final product = await _productService.getProductById(id);
          if (product == null) {
            return error('Product not found', statusCode: 404);
          }
  
          // Log product view if user is logged in
          if (userId != null) {
            await _productService.logProductView(userId, id);
          }
  
          return success(product);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get products by category
      router.get('/category/<categoryId>', (Request request, String categoryId) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '20') ?? 20;
          
          // Get products by category
          final result = await _productService.getProductsByCategory(
            categoryId,
            page: page,
            limit: limit,
          );
  
          return success({
            'products': result.products,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get featured products
      router.get('/featured', (Request request) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse limit parameter
          final limit = int.tryParse(queryParams['limit'] ?? '10') ?? 10;
          
          // Get featured products
          final products = await _productService.getFeaturedProducts(limit: limit);
  
          return success(products);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Search products
      router.get('/search', (Request request) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse parameters
          final query = queryParams['q'];
          if (query == null || query.isEmpty) {
            return error('Search query is required', statusCode: 400);
          }
          
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '20') ?? 20;
          final userId = request.context['userId'] as String?;
          
          // Search products
          final result = await _productService.searchProducts(
            query,
            page: page,
            limit: limit,
          );
  
          // Log search if user is logged in
          if (userId != null) {
            await _productService.logSearch(userId, query);
          }
  
          return success({
            'products': result.products,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get product recommendations
      router.get('/recommendations', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
          
          final queryParams = request.url.queryParameters;
          
          // Parse parameters
          final productId = queryParams['productId'];
          final categoryId = queryParams['categoryId'];
          final limit = int.tryParse(queryParams['limit'] ?? '10') ?? 10;
          
          // Get recommendations from AI service
          final recommendations = await _aiService.getProductRecommendations(
            userId: userId,
            productId: productId,
            categoryId: categoryId,
            limit: limit,
          );
  
          // Get full product details for recommended products
          final products = await _productService.getProductsByIds(
            recommendations.map((r) => r.id).toList(),
          );
  
          return success({
            'products': products,
            'requestId': recommendations.requestId,
            'modelVersion': recommendations.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get all categories
      router.get('/categories', (Request request) async {
        try {
          final categories = await _productService.getAllCategories();
          return success(categories);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get category by ID
      router.get('/categories/<id>', (Request request, String id) async {
        try {
          final category = await _productService.getCategoryById(id);
          if (category == null) {
            return error('Category not found', statusCode: 404);
          }
  
          return success(category);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.5. Order Controller

- [ ] Create order controller:
  ```bash
  touch okada_api/lib/src/controllers/order_controller.dart
  ```

- [ ] Implement order controller:
  ```dart
  // okada_api/lib/src/controllers/order_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/order_service.dart';
  import '../services/store_service.dart';
  import '../services/ai_service.dart';
  import 'base_controller.dart';
  
  /// Controller for order endpoints
  class OrderController extends BaseController {
    /// Order service instance
    final OrderService _orderService;
    
    /// Store service instance
    final StoreService _storeService;
    
    /// AI service instance
    final AIService _aiService;
  
    /// Creates a new instance of [OrderController]
    OrderController(this._orderService, this._storeService, this._aiService) : super('OrderController');
  
    @override
    Router get router {
      final router = Router();
  
      // Create a new order
      router.post('/', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['storeId', 'deliveryAddressId', 'items', 'paymentMethod'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Validate items
          final items = body['items'] as List<dynamic>;
          if (items.isEmpty) {
            return error('Order must contain at least one item', statusCode: 400);
          }
  
          for (final item in items) {
            if (!item.containsKey('productId') || !item.containsKey('quantity')) {
              return error('Each item must have productId and quantity', statusCode: 400);
            }
          }
  
          // Create order
          final order = await _orderService.createOrder(
            userId: userId,
            storeId: body['storeId'],
            deliveryAddressId: body['deliveryAddressId'],
            items: items.map((item) => {
              'productId': item['productId'],
              'quantity': item['quantity'],
            }).toList(),
            paymentMethod: body['paymentMethod'],
            deliveryNotes: body['deliveryNotes'],
          );
  
          // Assign rider using AI route optimization
          final nearbyRiders = await _storeService.getNearbyRiders(body['storeId']);
          if (nearbyRiders.isNotEmpty) {
            final optimizedRoute = await _aiService.optimizeRoute(
              orders: [order],
              riders: nearbyRiders,
            );
  
            if (optimizedRoute.routes.isNotEmpty) {
              final riderId = optimizedRoute.routes.first.riderId;
              await _orderService.assignRider(order.id, riderId);
            }
          }
  
          return success(order, message: 'Order created successfully', statusCode: 201);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get user orders with pagination
      router.get('/my-orders', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '10') ?? 10;
          
          // Parse filtering parameters
          final status = queryParams['status'];
          
          // Get orders
          final result = await _orderService.getUserOrders(
            userId,
            page: page,
            limit: limit,
            status: status,
          );
  
          return success({
            'orders': result.orders,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get order by ID
      router.get('/<id>', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final order = await _orderService.getOrderById(id);
          if (order == null) {
            return error('Order not found', statusCode: 404);
          }
  
          // Check if the order belongs to the user
          if (order.userId != userId) {
            return error('Unauthorized', statusCode: 403);
          }
  
          return success(order);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Cancel order
      router.post('/<id>/cancel', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final order = await _orderService.getOrderById(id);
          if (order == null) {
            return error('Order not found', statusCode: 404);
          }
  
          // Check if the order belongs to the user
          if (order.userId != userId) {
            return error('Unauthorized', statusCode: 403);
          }
  
          // Check if the order can be cancelled
          if (order.status != 'pending' && order.status != 'confirmed') {
            return error('Order cannot be cancelled at this stage', statusCode: 400);
          }
  
          // Cancel order
          await _orderService.cancelOrder(id, userId);
  
          return success(null, message: 'Order cancelled successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Rate order
      router.post('/<id>/rate', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('rating') || body['rating'] == null) {
            return error('Rating is required', statusCode: 400);
          }
  
          final rating = body['rating'] as int;
          if (rating < 1 || rating > 5) {
            return error('Rating must be between 1 and 5', statusCode: 400);
          }
  
          final order = await _orderService.getOrderById(id);
          if (order == null) {
            return error('Order not found', statusCode: 404);
          }
  
          // Check if the order belongs to the user
          if (order.userId != userId) {
            return error('Unauthorized', statusCode: 403);
          }
  
          // Check if the order is delivered
          if (order.status != 'delivered') {
            return error('Only delivered orders can be rated', statusCode: 400);
          }
  
          // Rate order
          await _orderService.rateOrder(
            orderId: id,
            userId: userId,
            rating: rating,
            review: body['review'],
            riderId: order.riderId,
          );
  
          return success(null, message: 'Order rated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Track order
      router.get('/<id>/track', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final order = await _orderService.getOrderById(id);
          if (order == null) {
            return error('Order not found', statusCode: 404);
          }
  
          // Check if the order belongs to the user
          if (order.userId != userId) {
            return error('Unauthorized', statusCode: 403);
          }
  
          // Get tracking information
          final tracking = await _orderService.getOrderTracking(id);
  
          return success(tracking);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.6. Store Controller

- [ ] Create store controller:
  ```bash
  touch okada_api/lib/src/controllers/store_controller.dart
  ```

- [ ] Implement store controller:
  ```dart
  // okada_api/lib/src/controllers/store_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/store_service.dart';
  import 'base_controller.dart';
  
  /// Controller for store endpoints
  class StoreController extends BaseController {
    /// Store service instance
    final StoreService _storeService;
  
    /// Creates a new instance of [StoreController]
    StoreController(this._storeService) : super('StoreController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get all stores
      router.get('/', (Request request) async {
        try {
          final stores = await _storeService.getAllStores();
          return success(stores);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get store by ID
      router.get('/<id>', (Request request, String id) async {
        try {
          final store = await _storeService.getStoreById(id);
          if (store == null) {
            return error('Store not found', statusCode: 404);
          }
  
          return success(store);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get nearby stores
      router.get('/nearby', (Request request) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse parameters
          final latitude = double.tryParse(queryParams['latitude'] ?? '');
          final longitude = double.tryParse(queryParams['longitude'] ?? '');
          
          if (latitude == null || longitude == null) {
            return error('Latitude and longitude are required', statusCode: 400);
          }
          
          final radius = double.tryParse(queryParams['radius'] ?? '5.0') ?? 5.0;
          
          // Get nearby stores
          final stores = await _storeService.getNearbyStores(
            latitude: latitude,
            longitude: longitude,
            radiusKm: radius,
          );
  
          return success(stores);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get store inventory
      router.get('/<id>/inventory', (Request request, String id) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '20') ?? 20;
          
          // Parse filtering parameters
          final categoryId = queryParams['categoryId'];
          final query = queryParams['query'];
          
          // Get store inventory
          final result = await _storeService.getStoreInventory(
            storeId: id,
            page: page,
            limit: limit,
            categoryId: categoryId,
            query: query,
          );
  
          return success({
            'products': result.products,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Check product availability in store
      router.get('/<storeId>/products/<productId>/availability', (Request request, String storeId, String productId) async {
        try {
          final availability = await _storeService.checkProductAvailability(storeId, productId);
          
          return success({
            'available': availability.available,
            'quantity': availability.quantity,
            'storeId': storeId,
            'productId': productId,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.7. Rider Controller

- [ ] Create rider controller:
  ```bash
  touch okada_api/lib/src/controllers/rider_controller.dart
  ```

- [ ] Implement rider controller:
  ```dart
  // okada_api/lib/src/controllers/rider_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/rider_service.dart';
  import '../services/ai_service.dart';
  import 'base_controller.dart';
  
  /// Controller for rider endpoints
  class RiderController extends BaseController {
    /// Rider service instance
    final RiderService _riderService;
    
    /// AI service instance
    final AIService _aiService;
  
    /// Creates a new instance of [RiderController]
    RiderController(this._riderService, this._aiService) : super('RiderController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get rider profile
      router.get('/me', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          return success(rider);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update rider status
      router.put('/me/status', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('status') || body['status'] == null) {
            return error('Status is required', statusCode: 400);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Update status
          await _riderService.updateRiderStatus(rider.id, body['status']);
  
          return success(null, message: 'Status updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update rider location
      router.put('/me/location', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('latitude') || !body.containsKey('longitude')) {
            return error('Latitude and longitude are required', statusCode: 400);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Update location
          await _riderService.updateRiderLocation(
            rider.id,
            latitude: body['latitude'],
            longitude: body['longitude'],
          );
  
          return success(null, message: 'Location updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get rider's current orders
      router.get('/me/orders', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          final orders = await _riderService.getRiderOrders(rider.id);
  
          return success(orders);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get rider's order history
      router.get('/me/order-history', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '10') ?? 10;
          
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          final result = await _riderService.getRiderOrderHistory(
            rider.id,
            page: page,
            limit: limit,
          );
  
          return success({
            'orders': result.orders,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update order status
      router.put('/me/orders/<orderId>/status', (Request request, String orderId) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('status') || body['status'] == null) {
            return error('Status is required', statusCode: 400);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Check if the order is assigned to this rider
          final order = await _riderService.getOrderById(orderId);
          if (order == null || order.riderId != rider.id) {
            return error('Order not found or not assigned to you', statusCode: 404);
          }
  
          // Update order status
          await _riderService.updateOrderStatus(
            orderId,
            status: body['status'],
            notes: body['notes'],
            riderId: rider.id,
          );
  
          return success(null, message: 'Order status updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get optimized route for current orders
      router.get('/me/optimized-route', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Get current orders
          final orders = await _riderService.getRiderOrders(rider.id);
          if (orders.isEmpty) {
            return success({
              'routes': [],
              'message': 'No active orders to optimize',
            });
          }
  
          // Get optimized route from AI service
          final optimizedRoute = await _aiService.optimizeRoute(
            orders: orders,
            riders: [rider],
          );
  
          return success({
            'route': optimizedRoute.routes.isNotEmpty ? optimizedRoute.routes.first : null,
            'requestId': optimizedRoute.requestId,
            'modelVersion': optimizedRoute.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get rider earnings
      router.get('/me/earnings', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final queryParams = request.url.queryParameters;
          
          // Parse parameters
          final period = queryParams['period'] ?? 'week'; // day, week, month, year
          
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Get earnings
          final earnings = await _riderService.getRiderEarnings(rider.id, period: period);
  
          return success(earnings);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.8. AI Controller

- [ ] Create AI controller:
  ```bash
  touch okada_api/lib/src/controllers/ai_controller.dart
  ```

- [ ] Implement AI controller:
  ```dart
  // okada_api/lib/src/controllers/ai_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/ai_service.dart';
  import 'base_controller.dart';
  
  /// Controller for AI endpoints
  class AIController extends BaseController {
    /// AI service instance
    final AIService _aiService;
  
    /// Creates a new instance of [AIController]
    AIController(this._aiService) : super('AIController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get product recommendations
      router.post('/recommendations/products', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Get recommendations
          final recommendations = await _aiService.getProductRecommendations(
            userId: userId,
            productId: body['productId'],
            categoryId: body['categoryId'],
            limit: body['limit'] ?? 10,
            context: body['context'],
          );
  
          return success({
            'recommendations': recommendations.items,
            'requestId': recommendations.requestId,
            'modelVersion': recommendations.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get demand forecast
      router.post('/forecast/demand', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['storeId', 'productIds', 'horizon'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Get forecast
          final forecast = await _aiService.getDemandForecast(
            storeId: body['storeId'],
            productIds: List<String>.from(body['productIds']),
            horizon: body['horizon'],
            features: body['features'],
          );
  
          return success({
            'forecasts': forecast.forecasts,
            'requestId': forecast.requestId,
            'modelVersion': forecast.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Optimize routes
      router.post('/optimize/routes', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['orders', 'riders'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Optimize routes
          final optimizedRoutes = await _aiService.optimizeRouteFromJson(body);
  
          return success({
            'routes': optimizedRoutes.routes,
            'requestId': optimizedRoutes.requestId,
            'modelVersion': optimizedRoutes.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace
# Flutter Customer App Implementation Checklist with AI Features

## 1. Project Setup and Configuration

### 1.1. Create Flutter Project

- [ ] Create a new Flutter project for the customer app:
  ```bash
  flutter create --org com.okada --project-name okada_customer --platforms android,ios okada_customer
  cd okada_customer
  ```

- [ ] Set up project structure:
  ```bash
  mkdir -p lib/src/{config,constants,core,data,domain,presentation,utils}
  mkdir -p lib/src/core/{error,network,storage,theme}
  mkdir -p lib/src/data/{datasources,models,repositories}
  mkdir -p lib/src/domain/{entities,repositories,usecases}
  mkdir -p lib/src/presentation/{blocs,pages,widgets}
  ```

### 1.2. Configure Dependencies

- [ ] Update pubspec.yaml with required dependencies:
  ```yaml
  name: okada_customer
  description: Okada quick commerce customer app for Cameroon
  
  publish_to: 'none'
  version: 1.0.0+1
  
  environment:
    sdk: '>=3.0.0 <4.0.0'
  
  dependencies:
    flutter:
      sdk: flutter
    flutter_localizations:
      sdk: flutter
  
    # State Management
    flutter_bloc: ^8.1.3
    equatable: ^2.0.5
    provider: ^6.0.5
  
    # Network
    dio: ^5.3.2
    connectivity_plus: ^4.0.2
    http: ^1.1.0
  
    # Local Storage
    shared_preferences: ^2.2.1
    sqflite: ^2.3.0
    path_provider: ^2.1.1
    flutter_secure_storage: ^9.0.0
    hive: ^2.2.3
    hive_flutter: ^1.1.0
  
    # UI Components
    flutter_svg: ^2.0.7
    cached_network_image: ^3.2.3
    shimmer: ^3.0.0
    lottie: ^2.6.0
    flutter_spinkit: ^5.2.0
    carousel_slider: ^4.2.1
    pull_to_refresh: ^2.0.0
    flutter_staggered_grid_view: ^0.7.0
    flutter_rating_bar: ^4.0.1
    flutter_slidable: ^3.0.0
    skeletons: ^0.0.3
    flutter_screenutil: ^5.9.0
    google_fonts: ^5.1.0
  
    # Location
    geolocator: ^10.0.1
    geocoding: ^2.1.0
    google_maps_flutter: ^2.5.0
    flutter_polyline_points: ^1.0.0
  
    # Authentication
    firebase_auth: ^4.9.0
    google_sign_in: ^6.1.5
    flutter_facebook_auth: ^6.0.1
  
    # Firebase
    firebase_core: ^2.15.1
    firebase_messaging: ^14.6.7
    firebase_analytics: ^10.4.5
    firebase_crashlytics: ^3.3.5
    cloud_firestore: ^4.9.1
  
    # Utils
    intl: ^0.18.1
    uuid: ^3.0.7
    logger: ^2.0.2
    url_launcher: ^6.1.14
    package_info_plus: ^4.1.0
    device_info_plus: ^9.0.3
    permission_handler: ^10.4.5
    image_picker: ^1.0.4
    image_cropper: ^5.0.0
    share_plus: ^7.1.0
    flutter_local_notifications: ^15.1.1
    flutter_native_splash: ^2.3.2
    flutter_launcher_icons: ^0.13.1
    flutter_dotenv: ^5.1.0
    timeago: ^3.5.0
    flutter_html: ^3.0.0-beta.2
    flutter_markdown: ^0.6.17
    qr_flutter: ^4.1.0
    qr_code_scanner: ^1.0.1
  
    # Payment
    flutter_stripe: ^9.3.0
    flutter_paystack: ^1.0.7
  
    # AI Features
    tflite_flutter: ^0.10.1
    google_ml_kit: ^0.16.2
    camera: ^0.10.5+4
    speech_to_text: ^6.3.0
    flutter_tts: ^3.8.3
    dialogflow_flutter: ^1.0.0
  
    # Cameroon Flag Colors (Branding)
    cameroon_flag_colors: ^1.0.0
  
  dev_dependencies:
    flutter_test:
      sdk: flutter
    flutter_lints: ^2.0.3
    build_runner: ^2.4.6
    flutter_gen_runner: ^5.3.1
    mockito: ^5.4.2
    bloc_test: ^9.1.4
    integration_test:
      sdk: flutter
    flutter_driver:
      sdk: flutter
  
  flutter:
    uses-material-design: true
    assets:
      - assets/images/
      - assets/icons/
      - assets/animations/
      - assets/translations/
      - assets/ml_models/
      - .env
  ```

- [ ] Create .env file for environment variables:
  ```bash
  touch .env
  echo "API_URL=https://api.okada.com" >> .env
  echo "GOOGLE_MAPS_API_KEY=your_google_maps_api_key" >> .env
  echo "AI_BRAIN_URL=https://ai-brain.okada.com" >> .env
  echo "AI_BRAIN_API_KEY=your_ai_brain_api_key" >> .env
  ```

### 1.3. Configure App Theme with Cameroon Flag Colors

- [ ] Create theme configuration file:
  ```bash
  touch lib/src/core/theme/app_theme.dart
  ```

- [ ] Implement theme with Cameroon flag colors:
  ```dart
  // lib/src/core/theme/app_theme.dart
  import 'package:flutter/material.dart';
  import 'package:google_fonts/google_fonts.dart';
  
  class AppColors {
    // Cameroon Flag Colors
    static const Color green = Color(0xFF007A5E);
    static const Color red = Color(0xFFCE1126);
    static const Color yellow = Color(0xFFFCD116);
    
    // App Colors
    static const Color primary = green;
    static const Color secondary = red;
    static const Color accent = yellow;
    
    static const Color background = Color(0xFFF8F9FA);
    static const Color surface = Colors.white;
    static const Color error = Color(0xFFB00020);
    
    static const Color textPrimary = Color(0xFF212121);
    static const Color textSecondary = Color(0xFF757575);
    static const Color textHint = Color(0xFFBDBDBD);
    
    static const Color divider = Color(0xFFEEEEEE);
    static const Color disabled = Color(0xFFE0E0E0);
    
    static const Color success = Color(0xFF4CAF50);
    static const Color info = Color(0xFF2196F3);
    static const Color warning = Color(0xFFFFC107);
  }
  
  class AppTheme {
    static ThemeData get lightTheme {
      return ThemeData(
        primaryColor: AppColors.primary,
        colorScheme: ColorScheme.light(
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          surface: AppColors.surface,
          background: AppColors.background,
          error: AppColors.error,
        ),
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.primary,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        textTheme: GoogleFonts.poppinsTextTheme(),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            textStyle: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            textStyle: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
            textStyle: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.divider),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.divider),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.error),
          ),
          hintStyle: GoogleFonts.poppins(
            color: AppColors.textHint,
            fontSize: 14,
          ),
        ),
        cardTheme: CardTheme(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          color: AppColors.surface,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textSecondary,
          type: BottomNavigationBarType.fixed,
          elevation: 8,
        ),
        dividerTheme: const DividerThemeData(
          color: AppColors.divider,
          thickness: 1,
          space: 1,
        ),
        chipTheme: ChipThemeData(
          backgroundColor: AppColors.primary.withOpacity(0.1),
          disabledColor: AppColors.disabled,
          selectedColor: AppColors.primary,
          secondarySelectedColor: AppColors.secondary,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          labelStyle: GoogleFonts.poppins(
            fontSize: 12,
            color: AppColors.primary,
          ),
          secondaryLabelStyle: GoogleFonts.poppins(
            fontSize: 12,
            color: Colors.white,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        progressIndicatorTheme: const ProgressIndicatorThemeData(
          color: AppColors.primary,
          circularTrackColor: AppColors.divider,
          linearTrackColor: AppColors.divider,
        ),
      );
    }
  }
  ```

### 1.4. Configure App Localization

- [ ] Create localization files:
  ```bash
  mkdir -p assets/translations
  touch assets/translations/en.json
  touch assets/translations/fr.json
  ```

- [ ] Add English translations (abbreviated for brevity):
  ```json
  {
    "app": {
      "name": "Okada",
      "tagline": "Your Market, Delivered in Minutes"
    },
    "common": {
      "loading": "Loading...",
      "retry": "Retry",
      "cancel": "Cancel"
    },
    "auth": {
      "login": "Login",
      "register": "Register"
    },
    "home": {
      "title": "Home",
      "welcome": "Welcome"
    },
    "product": {
      "price": "Price",
      "quantity": "Quantity"
    },
    "ai": {
      "voiceSearch": "Voice Search",
      "voiceAssistant": "Voice Assistant",
      "personalizedRecommendations": "Personalized for You"
    }
  }
  ```

- [ ] Add French translations (abbreviated for brevity):
  ```json
  {
    "app": {
      "name": "Okada",
      "tagline": "Votre Marché, Livré en Minutes"
    },
    "common": {
      "loading": "Chargement...",
      "retry": "Réessayer",
      "cancel": "Annuler"
    },
    "auth": {
      "login": "Connexion",
      "register": "S'inscrire"
    },
    "home": {
      "title": "Accueil",
      "welcome": "Bienvenue"
    },
    "product": {
      "price": "Prix",
      "quantity": "Quantité"
    },
    "ai": {
      "voiceSearch": "Recherche vocale",
      "voiceAssistant": "Assistant vocal",
      "personalizedRecommendations": "Personnalisé pour vous"
    }
  }
  ```

- [ ] Create localization service:
  ```bash
  mkdir -p lib/src/core/localization
  touch lib/src/core/localization/app_localizations.dart
  ```

- [ ] Implement localization service (abbreviated for brevity):
  ```dart
  // lib/src/core/localization/app_localizations.dart
  import 'dart:convert';
  import 'package:flutter/material.dart';
  import 'package:flutter/services.dart';
  
  class AppLocalizations {
    final Locale locale;
    
    AppLocalizations(this.locale);
    
    static AppLocalizations of(BuildContext context) {
      return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
    }
    
    static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();
    
    late Map<String, dynamic> _localizedStrings;
    
    Future<bool> load() async {
      String jsonString = await rootBundle.loadString('assets/translations/${locale.languageCode}.json');
      Map<String, dynamic> jsonMap = json.decode(jsonString);
      
      _localizedStrings = jsonMap;
      
      return true;
    }
    
    String translate(String key) {
      List<String> keys = key.split('.');
      dynamic value = _localizedStrings;
      
      for (String k in keys) {
        if (value is! Map<String, dynamic> || !value.containsKey(k)) {
          return key;
        }
        value = value[k];
      }
      
      return value.toString();
    }
  }
  
  class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
    const _AppLocalizationsDelegate();
    
    @override
    bool isSupported(Locale locale) {
      return ['en', 'fr'].contains(locale.languageCode);
    }
    
    @override
    Future<AppLocalizations> load(Locale locale) async {
      AppLocalizations localizations = AppLocalizations(locale);
      await localizations.load();
      return localizations;
    }
    
    @override
    bool shouldReload(_AppLocalizationsDelegate old) => false;
  }
  
  // Extension method for easier access to translations
  extension TranslateX on BuildContext {
    String tr(String key) {
      return AppLocalizations.of(this).translate(key);
    }
  }
  ```

### 1.5. Configure App Icons and Splash Screen

- [ ] Create app icon configuration:
  ```bash
  touch flutter_launcher_icons.yaml
  ```

- [ ] Configure app icons with Cameroon flag colors:
  ```yaml
  # flutter_launcher_icons.yaml
  flutter_launcher_icons:
  android: "launcher_icon"
  ios: true
  image_path: "assets/icons/app_icon.png"
  min_sdk_android: 21
  web:
    generate: true
    image_path: "assets/icons/app_icon.png"
    background_color: "#007A5E"
    theme_color: "#007A5E"
  windows:
    generate: false
  macos:
    generate: false
  ```

- [ ] Create splash screen configuration:
  ```bash
  touch flutter_native_splash.yaml
  ```

- [ ] Configure splash screen with Cameroon flag colors:
  ```yaml
  # flutter_native_splash.yaml
  flutter_native_splash:
  color: "#007A5E"
  image: assets/images/splash_logo.png
  color_dark: "#007A5E"
  image_dark: assets/images/splash_logo.png
  
  android_12:
    image: assets/images/splash_logo.png
    icon_background_color: "#007A5E"
    image_dark: assets/images/splash_logo.png
    icon_background_color_dark: "#007A5E"
  
  web: false
  ```

## 2. AI Brain Integration

### 2.1. AI Brain Client Setup

- [ ] Create AI Brain client:
  ```bash
  mkdir -p lib/src/core/ai
  touch lib/src/core/ai/ai_brain_client.dart
  ```

- [ ] Implement AI Brain client:
  ```dart
  // lib/src/core/ai/ai_brain_client.dart
  import 'package:dio/dio.dart';
  import 'package:flutter_dotenv/flutter_dotenv.dart';
  
  class AIBrainClient {
    final Dio _dio;
  
    AIBrainClient({required Dio dio}) : _dio = dio {
      _dio.options.baseUrl = dotenv.env['AI_BRAIN_URL'] ?? 'https://ai-brain.okada.com';
      _dio.options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': dotenv.env['AI_BRAIN_API_KEY'] ?? '',
      };
    }
  
    // Set user ID for personalization
    void setUserId(String userId) {
      _dio.options.headers['X-User-ID'] = userId;
    }
  
    // Get personalized recommendations
    Future<Map<String, dynamic>> getPersonalizedRecommendations({
      required String userId,
      int limit = 10,
    }) async {
      final response = await _dio.get(
        '/recommendations/personalized',
        queryParameters: {
          'userId': userId,
          'limit': limit,
        },
      );
      return response.data;
    }
  
    // Process voice command
    Future<Map<String, dynamic>> processVoiceCommand({
      required String audioBase64,
      String? language,
    }) async {
      final response = await _dio.post(
        '/voice/process',
        data: {
          'audio': audioBase64,
          'language': language ?? 'en',
        },
      );
      return response.data;
    }
  
    // Process image search
    Future<Map<String, dynamic>> processImageSearch({
      required String imageBase64,
      int limit = 10,
    }) async {
      final response = await _dio.post(
        '/image/search',
        data: {
          'image': imageBase64,
          'limit': limit,
        },
      );
      return response.data;
    }
  }
  ```

### 2.2. Offline AI Service

- [ ] Create offline AI service:
  ```bash
  touch lib/src/core/ai/offline_ai_service.dart
  ```

- [ ] Implement offline AI service:
  ```dart
  // lib/src/core/ai/offline_ai_service.dart
  import 'dart:io';
  import 'package:tflite_flutter/tflite_flutter.dart';
  import 'package:path_provider/path_provider.dart';
  
  class OfflineAIService {
    // Model paths
    static const String _productRecommendationModel = 'product_recommendation';
    static const String _imageRecognitionModel = 'image_recognition';
    static const String _voiceCommandModel = 'voice_command';
    
    // Load model
    Future<Interpreter?> _loadModel(String modelName) async {
      try {
        final appDir = await getApplicationDocumentsDirectory();
        final modelPath = '${appDir.path}/ai_models/$modelName.tflite';
        
        if (await File(modelPath).exists()) {
          return Interpreter.fromFile(File(modelPath));
        }
        
        return null;
      } catch (e) {
        print('Error loading model: $e');
        return null;
      }
    }
    
    // Get product recommendations
    Future<List<String>> getProductRecommendations({
      required String productId,
      int limit = 5,
    }) async {
      final interpreter = await _loadModel(_productRecommendationModel);
      if (interpreter == null) {
        return [];
      }
      
      try {
        // Simplified example - in a real app, you would have proper input processing
        final input = [productId.hashCode % 1000 / 1000.0];
        final output = List<double>.filled(10, 0);
        
        interpreter.run([input], [output]);
        
        // Process output to get product IDs
        final recommendations = <String>[];
        for (int i = 0; i < limit && i < output.length; i++) {
          recommendations.add('product_${(output[i] * 1000).round()}');
        }
        
        interpreter.close();
        return recommendations;
      } catch (e) {
        print('Error getting recommendations: $e');
        interpreter.close();
        return [];
      }
    }
    
    // Recognize image
    Future<String?> recognizeImage(List<int> imageBytes) async {
      final interpreter = await _loadModel(_imageRecognitionModel);
      if (interpreter == null) {
        return null;
      }
      
      try {
        // Simplified example - in a real app, you would process the image properly
        final input = List<double>.filled(224 * 224 * 3, 0);
        final output = List<double>.filled(10, 0);
        
        interpreter.run([input], [output]);
        
        // Find the category with highest confidence
        int maxIndex = 0;
        double maxValue = output[0];
        for (int i = 1; i < output.length; i++) {
          if (output[i] > maxValue) {
            maxValue = output[i];
            maxIndex = i;
          }
        }
        
        // Map index to category
        final categories = ['apple', 'banana', 'orange', 'tomato', 'potato', 'carrot', 'onion', 'broccoli', 'cucumber', 'pepper'];
        
        interpreter.close();
        return categories[maxIndex];
      } catch (e) {
        print('Error recognizing image: $e');
        interpreter.close();
        return null;
      }
    }
    
    // Process voice command
    Future<Map<String, dynamic>?> processVoiceCommand(List<int> audioBytes) async {
      final interpreter = await _loadModel(_voiceCommandModel);
      if (interpreter == null) {
        return null;
      }
      
      try {
        // Simplified example - in a real app, you would process the audio properly
        final input = List<double>.filled(16000, 0);
        final output = List<double>.filled(10, 0);
        
        interpreter.run([input], [output]);
        
        // Find the command with highest confidence
        int maxIndex = 0;
        double maxValue = output[0];
        for (int i = 1; i < output.length; i++) {
          if (output[i] > maxValue) {
            maxValue = output[i];
            maxIndex = i;
          }
        }
        
        // Map index to command
        final commands = ['search', 'add_to_cart', 'checkout', 'help', 'cancel', 'show_orders', 'show_cart', 'show_profile', 'show_categories', 'show_home'];
        
        interpreter.close();
        return {
          'command': commands[maxIndex],
          'confidence': maxValue,
        };
      } catch (e) {
        print('Error processing voice command: $e');
        interpreter.close();
        return null;
      }
    }
  }
  ```

### 2.3. AI Features Manager

- [ ] Create AI features manager:
  ```bash
  touch lib/src/core/ai/ai_features_manager.dart
  ```

- [ ] Implement AI features manager:
  ```dart
  // lib/src/core/ai/ai_features_manager.dart
  import 'dart:convert';
  import 'dart:io';
  import 'package:flutter/foundation.dart';
  import 'package:okada_customer/src/core/ai/ai_brain_client.dart';
  import 'package:okada_customer/src/core/ai/offline_ai_service.dart';
  import 'package:okada_customer/src/core/network/network_info.dart';
  import 'package:okada_customer/src/core/storage/preferences_service.dart';
  import 'package:image_picker/image_picker.dart';
  import 'package:speech_to_text/speech_to_text.dart';
  import 'package:flutter_tts/flutter_tts.dart';
  
  class AIFeaturesManager {
    final AIBrainClient _aiBrainClient;
    final OfflineAIService _offlineAIService;
    final NetworkInfo _networkInfo;
    final PreferencesService _preferencesService;
    final SpeechToText _speechToText;
    final FlutterTts _flutterTts;
    
    AIFeaturesManager({
      required AIBrainClient aiBrainClient,
      required OfflineAIService offlineAIService,
      required NetworkInfo networkInfo,
      required PreferencesService preferencesService,
    }) : _aiBrainClient = aiBrainClient,
         _offlineAIService = offlineAIService,
         _networkInfo = networkInfo,
         _preferencesService = preferencesService,
         _speechToText = SpeechToText(),
         _flutterTts = FlutterTts();
    
    // Initialize speech recognition
    Future<bool> initSpeechRecognition() async {
      return await _speechToText.initialize();
    }
    
    // Start listening for voice commands
    Future<void> startListening({
      required Function(String) onResult,
      required Function(String) onError,
      String? language,
    }) async {
      if (await _speechToText.initialize()) {
        await _speechToText.listen(
          onResult: (result) {
            if (result.finalResult) {
              onResult(result.recognizedWords);
            }
          },
          localeId: language ?? 'en_US',
          listenFor: const Duration(seconds: 30),
          pauseFor: const Duration(seconds: 3),
          onError: (error) => onError(error.errorMsg),
        );
      } else {
        onError('Speech recognition not available');
      }
    }
    
    // Stop listening
    Future<void> stopListening() async {
      await _speechToText.stop();
    }
    
    // Process voice command
    Future<Map<String, dynamic>> processVoiceCommand({
      required String audioBase64,
      String? language,
    }) async {
      final isConnected = await _networkInfo.isConnected;
      final isOfflineAIEnabled = _preferencesService.isOfflineAIEnabled();
      
      if (isConnected) {
        try {
          return await _aiBrainClient.processVoiceCommand(
            audioBase64: audioBase64,
            language: language,
          );
        } catch (e) {
          if (isOfflineAIEnabled) {
            final result = await _offlineAIService.processVoiceCommand(
              base64Decode(audioBase64),
            );
            if (result != null) {
              return result;
            }
          }
          rethrow;
        }
      } else if (isOfflineAIEnabled) {
        final result = await _offlineAIService.processVoiceCommand(
          base64Decode(audioBase64),
        );
        if (result != null) {
          return result;
        }
        throw Exception('Offline processing failed');
      } else {
        throw Exception('No internet connection and offline AI is disabled');
      }
    }
    
    // Process image search
    Future<Map<String, dynamic>> processImageSearch({
      required XFile imageFile,
      int limit = 10,
    }) async {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);
      
      final isConnected = await _networkInfo.isConnected;
      final isOfflineAIEnabled = _preferencesService.isOfflineAIEnabled();
      
      if (isConnected) {
        try {
          return await _aiBrainClient.processImageSearch(
            imageBase64: base64Image,
            limit: limit,
          );
        } catch (e) {
          if (isOfflineAIEnabled) {
            final category = await _offlineAIService.recognizeImage(bytes);
            if (category != null) {
              return {
                'category': category,
                'products': [],
              };
            }
          }
          rethrow;
        }
      } else if (isOfflineAIEnabled) {
        final category = await _offlineAIService.recognizeImage(bytes);
        if (category != null) {
          return {
            'category': category,
            'products': [],
          };
        }
        throw Exception('Offline processing failed');
      } else {
        throw Exception('No internet connection and offline AI is disabled');
      }
    }
    
    // Get personalized recommendations
    Future<List<String>> getPersonalizedRecommendations({
      required String userId,
      String? productId,
      int limit = 10,
    }) async {
      final isConnected = await _networkInfo.isConnected;
      final isOfflineAIEnabled = _preferencesService.isOfflineAIEnabled();
      
      if (isConnected) {
        try {
          final result = await _aiBrainClient.getPersonalizedRecommendations(
            userId: userId,
            limit: limit,
          );
          return List<String>.from(result['recommendations'] ?? []);
        } catch (e) {
          if (isOfflineAIEnabled && productId != null) {
            return await _offlineAIService.getProductRecommendations(
              productId: productId,
              limit: limit,
            );
          }
          return [];
        }
      } else if (isOfflineAIEnabled && productId != null) {
        return await _offlineAIService.getProductRecommendations(
          productId: productId,
          limit: limit,
        );
      } else {
        return [];
      }
    }
    
    // Speak text
    Future<void> speak({
      required String text,
      String? language,
    }) async {
      await _flutterTts.setLanguage(language ?? 'en-US');
      await _flutterTts.setPitch(1.0);
      await _flutterTts.speak(text);
    }
    
    // Stop speaking
    Future<void> stopSpeaking() async {
      await _flutterTts.stop();
    }
  }
  ```

## 3. Core Features Implementation

### 3.1. Authentication

- [ ] Create authentication repository:
  ```bash
  touch lib/src/data/repositories/auth_repository.dart
  ```

- [ ] Implement authentication repository:
  ```dart
  // lib/src/data/repositories/auth_repository.dart
  import 'package:firebase_auth/firebase_auth.dart';
  import 'package:google_sign_in/google_sign_in.dart';
  import 'package:okada_customer/src/core/error/exceptions.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/storage/secure_storage.dart';
  import 'package:okada_customer/src/data/models/user_model.dart';
  
  class AuthRepository {
    final FirebaseAuth _firebaseAuth;
    final GoogleSignIn _googleSignIn;
    final ApiClient _apiClient;
    final SecureStorageService _secureStorage;
    
    AuthRepository({
      required FirebaseAuth firebaseAuth,
      required GoogleSignIn googleSignIn,
      required ApiClient apiClient,
      required SecureStorageService secureStorage,
    }) : _firebaseAuth = firebaseAuth,
         _googleSignIn = googleSignIn,
         _apiClient = apiClient,
         _secureStorage = secureStorage;
    
    // Sign in with phone number
    Future<void> signInWithPhone({
      required String phoneNumber,
      required Function(String, int?) codeSent,
      required Function(UserModel) verificationCompleted,
      required Function(String) verificationFailed,
      required Function(String) codeAutoRetrievalTimeout,
    }) async {
      await _firebaseAuth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          // Sign in with credential
          final userCredential = await _firebaseAuth.signInWithCredential(credential);
          final user = userCredential.user;
          
          if (user != null) {
            // Get user data from API
            final userData = await _getUserData(user.uid);
            
            // Save auth data
            await _secureStorage.saveAuthData(
              token: await user.getIdToken() ?? '',
              userId: user.uid,
              refreshToken: user.refreshToken ?? '',
            );
            
            // Set API client auth token
            _apiClient.setAuthToken(await user.getIdToken() ?? '');
            
            verificationCompleted(userData);
          } else {
            verificationFailed('User is null');
          }
        },
        verificationFailed: (FirebaseAuthException e) {
          verificationFailed(e.message ?? 'Verification failed');
        },
        codeSent: (String verificationId, int? resendToken) {
          codeSent(verificationId, resendToken);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          codeAutoRetrievalTimeout(verificationId);
        },
        timeout: const Duration(seconds: 60),
      );
    }
    
    // Verify phone number with code
    Future<UserModel> verifyPhoneCode({
      required String verificationId,
      required String smsCode,
    }) async {
      try {
        // Create credential
        final credential = PhoneAuthProvider.credential(
          verificationId: verificationId,
          smsCode: smsCode,
        );
        
        // Sign in with credential
        final userCredential = await _firebaseAuth.signInWithCredential(credential);
        final user = userCredential.user;
        
        if (user != null) {
          // Get user data from API
          final userData = await _getUserData(user.uid);
          
          // Save auth data
          await _secureStorage.saveAuthData(
            token: await user.getIdToken() ?? '',
            userId: user.uid,
            refreshToken: user.refreshToken ?? '',
          );
          
          // Set API client auth token
          _apiClient.setAuthToken(await user.getIdToken() ?? '');
          
          return userData;
        } else {
          throw AuthenticationException('User is null');
        }
      } on FirebaseAuthException catch (e) {
        throw AuthenticationException(e.message ?? 'Verification failed');
      } catch (e) {
        throw AuthenticationException(e.toString());
      }
    }
    
    // Sign in with Google
    Future<UserModel> signInWithGoogle() async {
      try {
        // Sign in with Google
        final googleUser = await _googleSignIn.signIn();
        if (googleUser == null) {
          throw AuthenticationException('Google sign in aborted');
        }
        
        // Get auth
        final googleAuth = await googleUser.authentication;
        
        // Create credential
        final credential = GoogleAuthProvider.credential(
          accessToken: googleAuth.accessToken,
          idToken: googleAuth.idToken,
        );
        
        // Sign in with credential
        final userCredential = await _firebaseAuth.signInWithCredential(credential);
        final user = userCredential.user;
        
        if (user != null) {
          // Get user data from API
          final userData = await _getUserData(user.uid);
          
          // Save auth data
          await _secureStorage.saveAuthData(
            token: await user.getIdToken() ?? '',
            userId: user.uid,
            refreshToken: user.refreshToken ?? '',
          );
          
          // Set API client auth token
          _apiClient.setAuthToken(await user.getIdToken() ?? '');
          
          return userData;
        } else {
          throw AuthenticationException('User is null');
        }
      } catch (e) {
        throw AuthenticationException(e.toString());
      }
    }
    
    // Sign out
    Future<void> signOut() async {
      try {
        await _firebaseAuth.signOut();
        await _googleSignIn.signOut();
        await _secureStorage.clearAuthData();
        _apiClient.clearAuthToken();
      } catch (e) {
        throw AuthenticationException(e.toString());
      }
    }
    
    // Check if user is signed in
    Future<bool> isSignedIn() async {
      final token = await _secureStorage.getAuthToken();
      return token != null && token.isNotEmpty;
    }
    
    // Get current user
    Future<UserModel?> getCurrentUser() async {
      try {
        final userId = await _secureStorage.getUserId();
        if (userId == null) {
          return null;
        }
        
        return await _getUserData(userId);
      } catch (e) {
        return null;
      }
    }
    
    // Get user data from API
    Future<UserModel> _getUserData(String userId) async {
      try {
        final response = await _apiClient.get('/users/$userId');
        return UserModel.fromJson(response['data']);
      } catch (e) {
        // If API fails, create a basic user model from Firebase user
        final user = _firebaseAuth.currentUser;
        if (user != null) {
          return UserModel(
            id: user.uid,
            phoneNumber: user.phoneNumber ?? '',
            email: user.email,
            firstName: user.displayName?.split(' ').first ?? '',
            lastName: user.displayName?.split(' ').last ?? '',
            profileImageUrl: user.photoURL,
            isPhoneVerified: user.phoneNumber != null,
            isEmailVerified: user.emailVerified,
          );
        } else {
          throw AuthenticationException('User not found');
        }
      }
    }
  }
  ```

### 3.2. Product Repository

- [ ] Create product repository:
  ```bash
  touch lib/src/data/repositories/product_repository.dart
  ```

- [ ] Implement product repository:
  ```dart
  // lib/src/data/repositories/product_repository.dart
  import 'package:okada_customer/src/core/error/exceptions.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/network/network_info.dart';
  import 'package:okada_customer/src/core/storage/local_database.dart';
  import 'package:okada_customer/src/data/models/product_model.dart';
  import 'package:okada_customer/src/data/models/category_model.dart';
  
  class ProductRepository {
    final ApiClient _apiClient;
    final NetworkInfo _networkInfo;
    final LocalDatabase _localDatabase;
    final RecentlyViewedDao _recentlyViewedDao;
    
    ProductRepository({
      required ApiClient apiClient,
      required NetworkInfo networkInfo,
      required LocalDatabase localDatabase,
      required RecentlyViewedDao recentlyViewedDao,
    }) : _apiClient = apiClient,
         _networkInfo = networkInfo,
         _localDatabase = localDatabase,
         _recentlyViewedDao = recentlyViewedDao;
    
    // Get featured products
    Future<List<ProductModel>> getFeaturedProducts() async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/products/featured');
        final products = List<Map<String, dynamic>>.from(response['data']);
        
        return products.map((product) => ProductModel.fromJson(product)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get product by ID
    Future<ProductModel> getProductById(String id) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/products/$id');
        final product = ProductModel.fromJson(response['data']);
        
        // Add to recently viewed
        await _recentlyViewedDao.addRecentlyViewed(id);
        
        return product;
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get products by category
    Future<List<ProductModel>> getProductsByCategory(String categoryId, {int page = 1, int limit = 20}) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get(
          '/products',
          queryParameters: {
            'categoryId': categoryId,
            'page': page,
            'limit': limit,
          },
        );
        
        final products = List<Map<String, dynamic>>.from(response['data']);
        
        return products.map((product) => ProductModel.fromJson(product)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Search products
    Future<List<ProductModel>> searchProducts(String query, {int page = 1, int limit = 20}) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get(
          '/products/search',
          queryParameters: {
            'query': query,
            'page': page,
            'limit': limit,
          },
        );
        
        final products = List<Map<String, dynamic>>.from(response['data']);
        
        return products.map((product) => ProductModel.fromJson(product)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get categories
    Future<List<CategoryModel>> getCategories() async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/categories');
        final categories = List<Map<String, dynamic>>.from(response['data']);
        
        return categories.map((category) => CategoryModel.fromJson(category)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get recently viewed products
    Future<List<ProductModel>> getRecentlyViewedProducts({int limit = 10}) async {
      try {
        // Get recently viewed product IDs
        final productIds = await _recentlyViewedDao.getRecentlyViewed(limit: limit);
        
        if (productIds.isEmpty) {
          return [];
        }
        
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        // Get products by IDs
        final response = await _apiClient.post(
          '/products/batch',
          data: {
            'ids': productIds,
          },
        );
        
        final products = List<Map<String, dynamic>>.from(response['data']);
        
        return products.map((product) => ProductModel.fromJson(product)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
  }
  ```

### 3.3. Cart Repository

- [ ] Create cart repository:
  ```bash
  touch lib/src/data/repositories/cart_repository.dart
  ```

- [ ] Implement cart repository:
  ```dart
  // lib/src/data/repositories/cart_repository.dart
  import 'package:okada_customer/src/core/storage/local_database.dart';
  import 'package:okada_customer/src/data/models/product_model.dart';
  import 'package:uuid/uuid.dart';
  
  class CartItem {
    final String id;
    final String productId;
    final String productName;
    final double price;
    final int quantity;
    final String? imageUrl;
    final DateTime createdAt;
    
    CartItem({
      required this.id,
      required this.productId,
      required this.productName,
      required this.price,
      required this.quantity,
      this.imageUrl,
      DateTime? createdAt,
    }) : createdAt = createdAt ?? DateTime.now();
    
    factory CartItem.fromMap(Map<String, dynamic> map) {
      return CartItem(
        id: map['id'],
        productId: map['product_id'],
        productName: map['product_name'],
        price: map['price'],
        quantity: map['quantity'],
        imageUrl: map['image_url'],
        createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at']),
      );
    }
    
    Map<String, dynamic> toMap() {
      return {
        'id': id,
        'product_id': productId,
        'product_name': productName,
        'price': price,
        'quantity': quantity,
        'image_url': imageUrl,
        'created_at': createdAt.millisecondsSinceEpoch,
      };
    }
    
    CartItem copyWith({
      String? id,
      String? productId,
      String? productName,
      double? price,
      int? quantity,
      String? imageUrl,
      DateTime? createdAt,
    }) {
      return CartItem(
        id: id ?? this.id,
        productId: productId ?? this.productId,
        productName: productName ?? this.productName,
        price: price ?? this.price,
        quantity: quantity ?? this.quantity,
        imageUrl: imageUrl ?? this.imageUrl,
        createdAt: createdAt ?? this.createdAt,
      );
    }
  }
  
  class CartRepository {
    final CartDao _cartDao;
    final Uuid _uuid;
    
    CartRepository({
      required CartDao cartDao,
    }) : _cartDao = cartDao,
         _uuid = const Uuid();
    
    // Add product to cart
    Future<void> addToCart(ProductModel product, {int quantity = 1}) async {
      await _cartDao.addToCart(
        id: _uuid.v4(),
        productId: product.id,
        productName: product.name,
        price: product.currentPrice,
        quantity: quantity,
        imageUrl: product.primaryImageUrl,
      );
    }
    
    // Get cart items
    Future<List<CartItem>> getCartItems() async {
      final items = await _cartDao.getCartItems();
      return items.map((item) => CartItem.fromMap(item)).toList();
    }
    
    // Update cart item quantity
    Future<void> updateQuantity(String productId, int quantity) async {
      await _cartDao.updateQuantity(productId, quantity);
    }
    
    // Remove item from cart
    Future<void> removeFromCart(String productId) async {
      await _cartDao.removeFromCart(productId);
    }
    
    // Clear cart
    Future<void> clearCart() async {
      await _cartDao.clearCart();
    }
    
    // Get cart count
    Future<int> getCartCount() async {
      return await _cartDao.getCartCount();
    }
    
    // Get cart total
    Future<double> getCartTotal() async {
      return await _cartDao.getCartTotal();
    }
  }
  ```

### 3.4. Order Repository

- [ ] Create order repository:
  ```bash
  touch lib/src/data/repositories/order_repository.dart
  ```

- [ ] Implement order repository:
  ```dart
  // lib/src/data/repositories/order_repository.dart
  import 'dart:convert';
  
  import 'package:okada_customer/src/core/error/exceptions.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/network/network_info.dart';
  import 'package:okada_customer/src/core/storage/local_database.dart';
  import 'package:okada_customer/src/data/repositories/cart_repository.dart';
  import 'package:uuid/uuid.dart';
  
  class OrderRepository {
    final ApiClient _apiClient;
    final NetworkInfo _networkInfo;
    final LocalDatabase _localDatabase;
    final CartRepository _cartRepository;
    final Uuid _uuid;
    
    OrderRepository({
      required ApiClient apiClient,
      required NetworkInfo networkInfo,
      required LocalDatabase localDatabase,
      required CartRepository cartRepository,
    }) : _apiClient = apiClient,
         _networkInfo = networkInfo,
         _localDatabase = localDatabase,
         _cartRepository = cartRepository,
         _uuid = const Uuid();
    
    // Place order
    Future<Map<String, dynamic>> placeOrder({
      required String addressId,
      required String paymentMethod,
      String? couponCode,
      String? notes,
    }) async {
      try {
        // Get cart items
        final cartItems = await _cartRepository.getCartItems();
        
        if (cartItems.isEmpty) {
          throw ValidationException('Cart is empty');
        }
        
        // Check internet connection
        if (!await _networkInfo.isConnected) {
          // Save order offline
          final orderId = _uuid.v4();
          final orderData = {
            'id': orderId,
            'addressId': addressId,
            'paymentMethod': paymentMethod,
            'couponCode': couponCode,
            'notes': notes,
            'items': cartItems.map((item) => item.toMap()).toList(),
            'createdAt': DateTime.now().toIso8601String(),
          };
          
          final db = await _localDatabase.database;
          await db.insert(
            'offline_orders',
            {
              'id': orderId,
              'data': jsonEncode(orderData),
              'status': 'pending',
              'created_at': DateTime.now().millisecondsSinceEpoch,
            },
          );
          
          // Clear cart
          await _cartRepository.clearCart();
          
          return {
            'id': orderId,
            'status': 'pending',
            'message': 'Order saved offline. It will be processed when you are back online.',
            'isOffline': true,
          };
        }
        
        // Place order online
        final response = await _apiClient.post(
          '/orders',
          data: {
            'addressId': addressId,
            'paymentMethod': paymentMethod,
            'couponCode': couponCode,
            'notes': notes,
            'items': cartItems.map((item) => {
              'productId': item.productId,
              'quantity': item.quantity,
              'price': item.price,
            }).toList(),
          },
        );
        
        // Clear cart
        await _cartRepository.clearCart();
        
        return response['data'];
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get order by ID
    Future<Map<String, dynamic>> getOrderById(String id) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/orders/$id');
        return response['data'];
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get user orders
    Future<List<Map<String, dynamic>>> getUserOrders({int page = 1, int limit = 10}) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get(
          '/orders',
          queryParameters: {
            'page': page,
            'limit': limit,
          },
        );
        
        return List<Map<String, dynamic>>.from(response['data']);
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Track order
    Future<Map<String, dynamic>> trackOrder(String id) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/orders/$id/track');
        return response['data'];
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Cancel order
    Future<void> cancelOrder(String id, {String? reason}) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        await _apiClient.post(
          '/orders/$id/cancel',
          data: {
            'reason': reason,
          },
        );
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Sync offline orders
    Future<void> syncOfflineOrders() async {
      try {
        if (!await _networkInfo.isConnected) {
          return;
        }
        
        final db = await _localDatabase.database;
        final offlineOrders = await db.query('offline_orders', where: 'status = ?', whereArgs: ['pending']);
        
        for (final order in offlineOrders) {
          try {
            final orderData = jsonDecode(order['data'] as String);
            
            // Place order online
            final response = await _apiClient.post(
              '/orders',
              data: {
                'id': orderData['id'],
                'addressId': orderData['addressId'],
                'paymentMethod': orderData['paymentMethod'],
                'couponCode': orderData['couponCode'],
                'notes': orderData['notes'],
                'items': (orderData['items'] as List).map((item) => {
                  'productId': item['product_id'],
                  'quantity': item['quantity'],
                  'price': item['price'],
                }).toList(),
                'createdAt': orderData['createdAt'],
              },
            );
            
            // Update offline order status
            await db.update(
              'offline_orders',
              {
                'status': 'synced',
                'data': jsonEncode({
                  ...orderData,
                  'onlineOrderId': response['data']['id'],
                }),
              },
              where: 'id = ?',
              whereArgs: [order['id']],
            );
          } catch (e) {
            // Update offline order status
            await db.update(
              'offline_orders',
              {'status': 'failed'},
              where: 'id = ?',
              whereArgs: [order['id']],
            );
          }
        }
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
  }
  ```

## 4. UI Implementation

### 4.1. Common Widgets

- [ ] Create app bar widget:
  ```bash
  mkdir -p lib/src/presentation/widgets/common
  touch lib/src/presentation/widgets/common/app_bar.dart
  ```

- [ ] Implement app bar widget:
  ```dart
  // lib/src/presentation/widgets/common/app_bar.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  
  class OkadaAppBar extends StatelessWidget implements PreferredSizeWidget {
    final String title;
    final List<Widget>? actions;
    final bool showBackButton;
    final VoidCallback? onBackPressed;
    final Widget? leading;
    final bool centerTitle;
    final double elevation;
    final Color? backgroundColor;
    
    const OkadaAppBar({
      Key? key,
      required this.title,
      this.actions,
      this.showBackButton = true,
      this.onBackPressed,
      this.leading,
      this.centerTitle = true,
      this.elevation = 0,
      this.backgroundColor,
    }) : super(key: key);
    
    @override
    Widget build(BuildContext context) {
      return AppBar(
        title: Text(title),
        actions: actions,
        leading: showBackButton
            ? leading ??
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios),
                  onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
                )
            : leading,
        centerTitle: centerTitle,
        elevation: elevation,
        backgroundColor: backgroundColor ?? AppColors.primary,
      );
    }
    
    @override
    Size get preferredSize => const Size.fromHeight(kToolbarHeight);
  }
  ```

- [ ] Create loading widget:
  ```bash
  touch lib/src/presentation/widgets/common/loading_widget.dart
  ```

- [ ] Implement loading widget:
  ```dart
  // lib/src/presentation/widgets/common/loading_widget.dart
  import 'package:flutter/material.dart';
  import 'package:flutter_spinkit/flutter_spinkit.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  
  class LoadingWidget extends StatelessWidget {
    final double size;
    final Color? color;
    
    const LoadingWidget({
      Key? key,
      this.size = 50.0,
      this.color,
    }) : super(key: key);
    
    @override
    Widget build(BuildContext context) {
      return Center(
        child: SpinKitDoubleBounce(
          color: color ?? AppColors.primary,
          size: size,
        ),
      );
    }
  }
  ```

- [ ] Create error widget:
  ```bash
  touch lib/src/presentation/widgets/common/error_widget.dart
  ```

- [ ] Implement error widget:
  ```dart
  // lib/src/presentation/widgets/common/error_widget.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  
  class ErrorDisplayWidget extends StatelessWidget {
    final String message;
    final VoidCallback? onRetry;
    
    const ErrorDisplayWidget({
      Key? key,
      required this.message,
      this.onRetry,
    }) : super(key: key);
    
    @override
    Widget build(BuildContext context) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                color: AppColors.error,
                size: 60,
              ),
              const SizedBox(height: 16),
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                ),
              ),
              if (onRetry != null) ...[
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: onRetry,
                  child: const Text('Retry'),
                ),
              ],
            ],
          ),
        ),
      );
    }
  }
  ```

### 4.2. AI Feature Widgets

- [ ] Create voice search widget:
  ```bash
  mkdir -p lib/src/presentation/widgets/ai
  touch lib/src/presentation/widgets/ai/voice_search_widget.dart
  ```

- [ ] Implement voice search widget:
  ```dart
  // lib/src/presentation/widgets/ai/voice_search_widget.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:lottie/lottie.dart';
  
  class VoiceSearchWidget extends StatefulWidget {
    final AIFeaturesManager aiManager;
    final Function(String) onResult;
    final Function(String) onError;
    final String? language;
    
    const VoiceSearchWidget({
      Key? key,
      required this.aiManager,
      required this.onResult,
      required this.onError,
      this.language,
    }) : super(key: key);
    
    @override
    State<VoiceSearchWidget> createState() => _VoiceSearchWidgetState();
  }
  
  class _VoiceSearchWidgetState extends State<VoiceSearchWidget> with SingleTickerProviderStateMixin {
    bool _isListening = false;
    String _statusText = 'Tap to speak';
    late AnimationController _animationController;
    
    @override
    void initState() {
      super.initState();
      _animationController = AnimationController(
        vsync: this,
        duration: const Duration(seconds: 2),
      );
    }
    
    @override
    void dispose() {
      _animationController.dispose();
      if (_isListening) {
        widget.aiManager.stopListening();
      }
      super.dispose();
    }
    
    void _toggleListening() async {
      if (_isListening) {
        setState(() {
          _isListening = false;
          _statusText = 'Processing...';
        });
        _animationController.stop();
        await widget.aiManager.stopListening();
      } else {
        final available = await widget.aiManager.initSpeechRecognition();
        if (available) {
          setState(() {
            _isListening = true;
            _statusText = 'Listening...';
          });
          _animationController.repeat();
          
          await widget.aiManager.startListening(
            onResult: (result) {
              setState(() {
                _isListening = false;
                _statusText = 'Tap to speak';
              });
              _animationController.stop();
              widget.onResult(result);
            },
            onError: (error) {
              setState(() {
                _isListening = false;
                _statusText = 'Tap to speak';
              });
              _animationController.stop();
              widget.onError(error);
            },
            language: widget.language,
          );
        } else {
          widget.onError('Speech recognition not available');
        }
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: _toggleListening,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isListening ? AppColors.primary : AppColors.primary.withOpacity(0.8),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: _isListening
                  ? Lottie.asset(
                      'assets/animations/voice_animation.json',
                      controller: _animationController,
                      width: 60,
                      height: 60,
                    )
                  : const Icon(
                      Icons.mic,
                      color: Colors.white,
                      size: 40,
                    ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            _statusText,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 16,
            ),
          ),
        ],
      );
    }
  }
  ```

- [ ] Create image search widget:
  ```bash
  touch lib/src/presentation/widgets/ai/image_search_widget.dart
  ```

- [ ] Implement image search widget:
  ```dart
  // lib/src/presentation/widgets/ai/image_search_widget.dart
  import 'dart:io';
  
  import 'package:flutter/material.dart';
  import 'package:image_picker/image_picker.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/presentation/widgets/common/loading_widget.dart';
  
  class ImageSearchWidget extends StatefulWidget {
    final AIFeaturesManager aiManager;
    final Function(Map<String, dynamic>) onResult;
    final Function(String) onError;
    
    const ImageSearchWidget({
      Key? key,
      required this.aiManager,
      required this.onResult,
      required this.onError,
    }) : super(key: key);
    
    @override
    State<ImageSearchWidget> createState() => _ImageSearchWidgetState();
  }
  
  class _ImageSearchWidgetState extends State<ImageSearchWidget> {
    bool _isProcessing = false;
    XFile? _image;
    final ImagePicker _picker = ImagePicker();
    
    Future<void> _getImage(ImageSource source) async {
      try {
        final XFile? image = await _picker.pickImage(
          source: source,
          maxWidth: 800,
          maxHeight: 800,
          imageQuality: 80,
        );
        
        if (image != null) {
          setState(() {
            _image = image;
            _isProcessing = true;
          });
          
          try {
            final result = await widget.aiManager.processImageSearch(
              imageFile: image,
            );
            
            widget.onResult(result);
          } catch (e) {
            widget.onError(e.toString());
          } finally {
            if (mounted) {
              setState(() {
                _isProcessing = false;
              });
            }
          }
        }
      } catch (e) {
        widget.onError('Failed to pick image: ${e.toString()}');
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_image != null && !_isProcessing)
            Container(
              width: 200,
              height: 200,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                image: DecorationImage(
                  image: FileImage(File(_image!.path)),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          if (_isProcessing) ...[
            const SizedBox(height: 16),
            const LoadingWidget(size: 40),
            const SizedBox(height: 16),
            Text(
              'Processing image...',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 16,
              ),
            ),
          ] else ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildOptionButton(
                  icon: Icons.camera_alt,
                  label: 'Take Photo',
                  onTap: () => _getImage(ImageSource.camera),
                ),
                const SizedBox(width: 24),
                _buildOptionButton(
                  icon: Icons.photo_library,
                  label: 'Gallery',
                  onTap: () => _getImage(ImageSource.gallery),
                ),
              ],
            ),
          ],
        ],
      );
    }
    
    Widget _buildOptionButton({
      required IconData icon,
      required String label,
      required VoidCallback onTap,
    }) {
      return GestureDetector(
        onTap: onTap,
        child: Column(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primary,
              ),
              child: Icon(
                icon,
                color: Colors.white,
                size: 30,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }
  }
  ```

- [ ] Create AI recommendations widget:
  ```bash
  touch lib/src/presentation/widgets/ai/ai_recommendations_widget.dart
  ```

- [ ] Implement AI recommendations widget:
  ```dart
  // lib/src/presentation/widgets/ai/ai_recommendations_widget.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/models/product_model.dart';
  import 'package:okada_customer/src/data/repositories/product_repository.dart';
  import 'package:okada_customer/src/presentation/widgets/common/error_widget.dart';
  import 'package:okada_customer/src/presentation/widgets/common/loading_widget.dart';
  import 'package:okada_customer/src/presentation/widgets/product/product_card.dart';
  
  class AIRecommendationsWidget extends StatefulWidget {
    final AIFeaturesManager aiManager;
    final ProductRepository productRepository;
    final String userId;
    final String? productId;
    final String title;
    final int limit;
    
    const AIRecommendationsWidget({
      Key? key,
      required this.aiManager,
      required this.productRepository,
      required this.userId,
      this.productId,
      required this.title,
      this.limit = 10,
    }) : super(key: key);
    
    @override
    State<AIRecommendationsWidget> createState() => _AIRecommendationsWidgetState();
  }
  
  class _AIRecommendationsWidgetState extends State<AIRecommendationsWidget> {
    late Future<List<ProductModel>> _recommendationsFuture;
    
    @override
    void initState() {
      super.initState();
      _loadRecommendations();
    }
    
    void _loadRecommendations() {
      _recommendationsFuture = _getRecommendations();
    }
    
    Future<List<ProductModel>> _getRecommendations() async {
      try {
        // Get recommended product IDs from AI Brain
        final recommendedIds = await widget.aiManager.getPersonalizedRecommendations(
          userId: widget.userId,
          productId: widget.productId,
          limit: widget.limit,
        );
        
        if (recommendedIds.isEmpty) {
          return [];
        }
        
        // Get product details for each ID
        final products = <ProductModel>[];
        for (final id in recommendedIds) {
          try {
            final product = await widget.productRepository.getProductById(id);
            products.add(product);
          } catch (e) {
            // Skip products that couldn't be fetched
            continue;
          }
        }
        
        return products;
      } catch (e) {
        throw Exception('Failed to load recommendations: ${e.toString()}');
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    // Navigate to all recommendations
                  },
                  child: const Text('See All'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 220,
            child: FutureBuilder<List<ProductModel>>(
              future: _recommendationsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const LoadingWidget(size: 30);
                } else if (snapshot.hasError) {
                  return ErrorDisplayWidget(
                    message: 'Failed to load recommendations',
                    onRetry: () {
                      setState(() {
                        _loadRecommendations();
                      });
                    },
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(
                    child: Text('No recommendations available'),
                  );
                } else {
                  final products = snapshot.data!;
                  return ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: SizedBox(
                          width: 140,
                          child: ProductCard(
                            product: products[index],
                            onTap: () {
                              // Navigate to product details
                            },
                          ),
                        ),
                      );
                    },
                  );
                }
              },
            ),
          ),
        ],
      );
    }
  }
  ```

### 4.3. Main App Pages

- [ ] Create splash screen:
  ```bash
  mkdir -p lib/src/presentation/pages
  touch lib/src/presentation/pages/splash_screen.dart
  ```

- [ ] Implement splash screen:
  ```dart
  // lib/src/presentation/pages/splash_screen.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  
  class SplashScreen extends StatefulWidget {
    final AuthRepository authRepository;
    
    const SplashScreen({
      Key? key,
      required this.authRepository,
    }) : super(key: key);
    
    @override
    State<SplashScreen> createState() => _SplashScreenState();
  }
  
  class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
    late AnimationController _animationController;
    late Animation<double> _fadeAnimation;
    
    @override
    void initState() {
      super.initState();
      _animationController = AnimationController(
        vsync: this,
        duration: const Duration(seconds: 2),
      );
      
      _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Curves.easeIn,
        ),
      );
      
      _animationController.forward();
      
      _checkAuthStatus();
    }
    
    Future<void> _checkAuthStatus() async {
      await Future.delayed(const Duration(seconds: 2));
      
      final isSignedIn = await widget.authRepository.isSignedIn();
      
      if (mounted) {
        if (isSignedIn) {
          Navigator.of(context).pushReplacementNamed('/home');
        } else {
          Navigator.of(context).pushReplacementNamed('/onboarding');
        }
      }
    }
    
    @override
    void dispose() {
      _animationController.dispose();
      super.dispose();
    }
    
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        backgroundColor: AppColors.primary,
        body: Center(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/images/logo.png',
                  width: 150,
                  height: 150,
                ),
                const SizedBox(height: 24),
                const Text(
                  'Okada',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Your Market, Delivered in Minutes',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }
  }
  ```

- [ ] Create onboarding screen:
  ```bash
  touch lib/src/presentation/pages/onboarding_screen.dart
  ```

- [ ] Implement onboarding screen:
  ```dart
  // lib/src/presentation/pages/onboarding_screen.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/core/storage/preferences_service.dart';
  
  class OnboardingScreen extends StatefulWidget {
    final PreferencesService preferencesService;
    
    const OnboardingScreen({
      Key? key,
      required this.preferencesService,
    }) : super(key: key);
    
    @override
    State<OnboardingScreen> createState() => _OnboardingScreenState();
  }
  
  class _OnboardingScreenState extends State<OnboardingScreen> {
    final PageController _pageController = PageController();
    int _currentPage = 0;
    
    final List<Map<String, String>> _onboardingData = [
      {
        'title': 'Welcome to Okada',
        'description': 'Your market, delivered in minutes. Get fresh groceries and essentials delivered to your doorstep.',
        'image': 'assets/images/onboarding_1.png',
      },
      {
        'title': 'Fast Delivery',
        'description': 'Experience lightning-fast delivery within minutes. Our dark stores are strategically located to serve you quickly.',
        'image': 'assets/images/onboarding_2.png',
      },
      {
        'title': 'AI-Powered Experience',
        'description': 'Enjoy personalized recommendations and smart features powered by our AI Brain technology.',
        'image': 'assets/images/onboarding_3.png',
      },
    ];
    
    @override
    void dispose() {
      _pageController.dispose();
      super.dispose();
    }
    
    void _onPageChanged(int page) {
      setState(() {
        _currentPage = page;
      });
    }
    
    void _completeOnboarding() async {
      await widget.preferencesService.setOnboardingCompleted(true);
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/auth');
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: _onPageChanged,
                  itemCount: _onboardingData.length,
                  itemBuilder: (context, index) {
                    return _buildPage(
                      title: _onboardingData[index]['title']!,
                      description: _onboardingData[index]['description']!,
                      image: _onboardingData[index]['image']!,
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Page indicators
                    Row(
                      children: List.generate(
                        _onboardingData.length,
                        (index) => Container(
                          margin: const EdgeInsets.only(right: 8),
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _currentPage == index
                                ? AppColors.primary
                                : AppColors.divider,
                          ),
                        ),
                      ),
                    ),
                    // Next or Get Started button
                    ElevatedButton(
                      onPressed: () {
                        if (_currentPage == _onboardingData.length - 1) {
                          _completeOnboarding();
                        } else {
                          _pageController.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeIn,
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                      ),
                      child: Text(
                        _currentPage == _onboardingData.length - 1
                            ? 'Get Started'
                            : 'Next',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    Widget _buildPage({
      required String title,
      required String description,
      required String image,
    }) {
      return Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              image,
              height: 300,
            ),
            const SizedBox(height: 40),
            Text(
              title,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              description,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }
  }
  ```

- [ ] Create authentication screen:
  ```bash
  touch lib/src/presentation/pages/auth_screen.dart
  ```

- [ ] Implement authentication screen:
  ```dart
  // lib/src/presentation/pages/auth_screen.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  import 'package:okada_customer/src/presentation/widgets/common/loading_widget.dart';
  
  class AuthScreen extends StatefulWidget {
    final AuthRepository authRepository;
    
    const AuthScreen({
      Key? key,
      required this.authRepository,
    }) : super(key: key);
    
    @override
    State<AuthScreen> createState() => _AuthScreenState();
  }
  
  class _AuthScreenState extends State<AuthScreen> {
    final _phoneController = TextEditingController();
    final _formKey = GlobalKey<FormState>();
    bool _isLoading = false;
    String? _errorMessage;
    
    @override
    void dispose() {
      _phoneController.dispose();
      super.dispose();
    }
    
    Future<void> _signInWithPhone() async {
      if (!_formKey.currentState!.validate()) {
        return;
      }
      
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      
      try {
        await widget.authRepository.signInWithPhone(
          phoneNumber: _phoneController.text,
          codeSent: (verificationId, resendToken) {
            setState(() {
              _isLoading = false;
            });
            
            Navigator.of(context).pushNamed(
              '/verify-phone',
              arguments: {
                'verificationId': verificationId,
                'phoneNumber': _phoneController.text,
                'resendToken': resendToken,
              },
            );
          },
          verificationCompleted: (user) {
            setState(() {
              _isLoading = false;
            });
            
            Navigator.of(context).pushReplacementNamed('/home');
          },
          verificationFailed: (error) {
            setState(() {
              _isLoading = false;
              _errorMessage = error;
            });
          },
          codeAutoRetrievalTimeout: (verificationId) {
            // Auto retrieval timeout
          },
        );
      } catch (e) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
    
    Future<void> _signInWithGoogle() async {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      
      try {
        await widget.authRepository.signInWithGoogle();
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } catch (e) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  Image.asset(
                    'assets/images/logo.png',
                    height: 100,
                  ),
                  const SizedBox(height: 40),
                  const Text(
                    'Welcome to Okada',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sign in to continue',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            labelText: 'Phone Number',
                            hintText: '+237 6XX XXX XXX',
                            prefixIcon: Icon(Icons.phone),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your phone number';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        if (_errorMessage != null) ...[
                          Text(
                            _errorMessage!,
                            style: TextStyle(
                              color: AppColors.error,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                        ],
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _signInWithPhone,
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text('Continue'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      const Expanded(child: Divider()),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'OR',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      const Expanded(child: Divider()),
                    ],
                  ),
                  const SizedBox(height: 24),
                  OutlinedButton.icon(
                    onPressed: _isLoading ? null : _signInWithGoogle,
                    icon: Image.asset(
                      'assets/icons/google_icon.png',
                      height: 24,
                    ),
                    label: const Text('Continue with Google'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 40),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                      children: [
                        const TextSpan(
                          text: 'By continuing, you agree to our ',
                        ),
                        TextSpan(
                          text: 'Terms of Service',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const TextSpan(
                          text: ' and ',
                        ),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }
  }
  ```

- [ ] Create home screen:
  ```bash
  touch lib/src/presentation/pages/home_screen.dart
  ```

- [ ] Implement home screen:
  ```dart
  // lib/src/presentation/pages/home_screen.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/models/user_model.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  import 'package:okada_customer/src/data/repositories/product_repository.dart';
  import 'package:okada_customer/src/presentation/widgets/ai/ai_recommendations_widget.dart';
  import 'package:okada_customer/src/presentation/widgets/ai/voice_search_widget.dart';
  import 'package:okada_customer/src/presentation/widgets/common/loading_widget.dart';
  
  class HomeScreen extends StatefulWidget {
    final AuthRepository authRepository;
    final ProductRepository productRepository;
    final AIFeaturesManager aiManager;
    
    const HomeScreen({
      Key? key,
      required this.authRepository,
      required this.productRepository,
      required this.aiManager,
    }) : super(key: key);
    
    @override
    State<HomeScreen> createState() => _HomeScreenState();
  }
  
  class _HomeScreenState extends State<HomeScreen> {
    late Future<UserModel?> _userFuture;
    late Future<List<dynamic>> _homeFuture;
    bool _isVoiceSearchActive = false;
    
    @override
    void initState() {
      super.initState();
      _userFuture = widget.authRepository.getCurrentUser();
      _loadHomeData();
    }
    
    void _loadHomeData() {
      _homeFuture = Future.wait([
        widget.productRepository.getFeaturedProducts(),
        widget.productRepository.getCategories(),
        widget.productRepository.getRecentlyViewedProducts(),
      ]);
    }
    
    void _handleVoiceSearchResult(String result) {
      setState(() {
        _isVoiceSearchActive = false;
      });
      
      if (result.isNotEmpty) {
        Navigator.of(context).pushNamed(
          '/search',
          arguments: {'query': result},
        );
      }
    }
    
    void _handleVoiceSearchError(String error) {
      setState(() {
        _isVoiceSearchActive = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Voice search error: $error'),
          backgroundColor: AppColors.error,
        ),
      );
    }
    
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        appBar: AppBar(
          title: Image.asset(
            'assets/images/logo_horizontal.png',
            height: 30,
          ),
          centerTitle: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                Navigator.of(context).pushNamed('/search');
              },
            ),
            IconButton(
              icon: const Icon(Icons.mic),
              onPressed: () {
                setState(() {
                  _isVoiceSearchActive = true;
                });
                showModalBottomSheet(
                  context: context,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(20),
                    ),
                  ),
                  builder: (context) {
                    return Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: VoiceSearchWidget(
                        aiManager: widget.aiManager,
                        onResult: _handleVoiceSearchResult,
                        onError: _handleVoiceSearchError,
                      ),
                    );
                  },
                ).then((_) {
                  setState(() {
                    _isVoiceSearchActive = false;
                  });
                });
              },
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: () async {
            setState(() {
              _loadHomeData();
            });
          },
          child: FutureBuilder<UserModel?>(
            future: _userFuture,
            builder: (context, userSnapshot) {
              if (userSnapshot.connectionState == ConnectionState.waiting) {
                return const LoadingWidget();
              }
              
              final user = userSnapshot.data;
              
              return FutureBuilder<List<dynamic>>(
                future: _homeFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const LoadingWidget();
                  } else if (snapshot.hasError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Error loading data: ${snapshot.error}',
                            style: TextStyle(color: AppColors.error),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              setState(() {
                                _loadHomeData();
                              });
                            },
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    );
                  }
                  
                  final featuredProducts = snapshot.data![0];
                  final categories = snapshot.data![1];
                  final recentlyViewed = snapshot.data![2];
                  
                  return ListView(
                    children: [
                      // Address bar
                      Container(
                        padding: const EdgeInsets.all(16),
                        color: AppColors.primary.withOpacity(0.1),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              color: AppColors.primary,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Delivery to',
                                    style: TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const Text(
                                    'Douala, Cameroon',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pushNamed('/addresses');
                              },
                              child: const Text('Change'),
                            ),
                          ],
                        ),
                      ),
                      
                      // Welcome message
                      if (user != null)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            'Welcome, ${user.firstName}!',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      
                      // AI Recommendations
                      if (user != null)
                        AIRecommendationsWidget(
                          aiManager: widget.aiManager,
                          productRepository: widget.productRepository,
                          userId: user.id,
                          title: 'Recommended for You',
                        ),
                      
                      // Categories
                      _buildCategoriesSection(categories),
                      
                      // Featured Products
                      _buildProductsSection(
                        title: 'Featured Products',
                        products: featuredProducts,
                      ),
                      
                      // Recently Viewed
                      if (recentlyViewed.isNotEmpty)
                        _buildProductsSection(
                          title: 'Recently Viewed',
                          products: recentlyViewed,
                        ),
                    ],
                  );
                },
              );
            },
          ),
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.category),
              label: 'Categories',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_cart),
              label: 'Cart',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
          onTap: (index) {
            switch (index) {
              case 0:
                // Already on home
                break;
              case 1:
                Navigator.of(context).pushNamed('/categories');
                break;
              case 2:
                Navigator.of(context).pushNamed('/cart');
                break;
              case 3:
                Navigator.of(context).pushNamed('/profile');
                break;
            }
          },
        ),
      );
    }
    
    Widget _buildCategoriesSection(List<dynamic> categories) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Categories',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pushNamed('/categories');
                  },
                  child: const Text('See All'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.of(context).pushNamed(
                      '/category',
                      arguments: {'category': category},
                    );
                  },
                  child: Container(
                    width: 80,
                    margin: const EdgeInsets.only(right: 12),
                    child: Column(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: category.imageUrl != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(30),
                                  child: Image.network(
                                    category.imageUrl!,
                                    fit: BoxFit.cover,
                                  ),
                                )
                              : Icon(
                                  Icons.category,
                                  color: AppColors.primary,
                                ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          category.name,
                          style: const TextStyle(fontSize: 12),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      );
    }
    
    Widget _buildProductsSection({
      required String title,
      required List<dynamic> products,
    }) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    // Navigate to all products
                  },
                  child: const Text('See All'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 220,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.of(context).pushNamed(
                      '/product',
                      arguments: {'product': product},
                    );
                  },
                  child: Container(
                    width: 140,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.divider),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(8),
                          ),
                          child: product.primaryImageUrl != null
                              ? Image.network(
                                  product.primaryImageUrl!,
                                  height: 120,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                )
                              : Container(
                                  height: 120,
                                  color: AppColors.divider,
                                  child: const Icon(Icons.image),
                                ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                product.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '\$${product.currentPrice.toStringAsFixed(2)}',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (product.isOnSale) ...[
                                const SizedBox(height: 2),
                                Text(
                                  '\$${product.price.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                    decoration: TextDecoration.lineThrough,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
      );
    }
  }
  ```

## 5. Main App Entry Point

- [ ] Create main.dart file:
  ```bash
  touch lib/main.dart
  ```

- [ ] Implement main.dart:
  ```dart
  // lib/main.dart
  import 'package:flutter/material.dart';
  import 'package:flutter/services.dart';
  import 'package:flutter_dotenv/flutter_dotenv.dart';
  import 'package:firebase_core/firebase_core.dart';
  import 'package:connectivity_plus/connectivity_plus.dart';
  import 'package:dio/dio.dart';
  import 'package:shared_preferences/shared_preferences.dart';
  import 'package:okada_customer/src/core/ai/ai_brain_client.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/ai/offline_ai_service.dart';
  import 'package:okada_customer/src/core/localization/app_localizations.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/network/network_info.dart';
  import 'package:okada_customer/src/core/storage/local_database.dart';
  import 'package:okada_customer/src/core/storage/preferences_service.dart';
  import 'package:okada_customer/src/core/storage/secure_storage.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  import 'package:okada_customer/src/data/repositories/cart_repository.dart';
  import 'package:okada_customer/src/data/repositories/product_repository.dart';
  import 'package:okada_customer/src/presentation/pages/splash_screen.dart';
  import 'package:okada_customer/src/presentation/pages/onboarding_screen.dart';
  import 'package:okada_customer/src/presentation/pages/auth_screen.dart';
  import 'package:okada_customer/src/presentation/pages/home_screen.dart';
  
  void main() async {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Load environment variables
    await dotenv.load();
    
    // Initialize Firebase
    await Firebase.initializeApp();
    
    // Set preferred orientations
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    
    // Initialize services
    final sharedPreferences = await SharedPreferences.getInstance();
    final preferencesService = PreferencesService(sharedPreferences);
    
    final connectivity = Connectivity();
    final networkInfo = NetworkInfoImpl(connectivity);
    
    final secureStorage = SecureStorageService();
    
    final apiClient = ApiClient(
      dio: Dio(),
      networkInfo: networkInfo,
    );
    
    final aiBrainClient = AIBrainClient(
      dio: Dio(),
      networkInfo: networkInfo,
    );
    
    final localDatabase = LocalDatabase();
    final cartDao = CartDao(localDatabase);
    final recentlyViewedDao = RecentlyViewedDao(localDatabase);
    final offlineAIModelsDao = OfflineAIModelsDao(localDatabase);
    
    final offlineAIService = OfflineAIService(offlineAIModelsDao);
    
    final aiManager = AIFeaturesManager(
      aiBrainClient: aiBrainClient,
      offlineAIService: offlineAIService,
      networkInfo: networkInfo,
      preferencesService: preferencesService,
    );
    
    final authRepository = AuthRepository(
      firebaseAuth: FirebaseAuth.instance,
      googleSignIn: GoogleSignIn(),
      apiClient: apiClient,
      secureStorage: secureStorage,
    );
    
    final productRepository = ProductRepository(
      apiClient: apiClient,
      networkInfo: networkInfo,
      localDatabase: localDatabase,
      recentlyViewedDao: recentlyViewedDao,
    );
    
    final cartRepository = CartRepository(
      cartDao: cartDao,
    );
    
    // Check if token exists and set it to API client
    final token = await secureStorage.getAuthToken();
    if (token != null) {
      apiClient.setAuthToken(token);
    }
    
    // Get user language preference
    final language = preferencesService.getLanguage();
    
    runApp(OkadaApp(
      preferencesService: preferencesService,
      authRepository: authRepository,
      productRepository: productRepository,
      cartRepository: cartRepository,
      aiManager: aiManager,
      initialLanguage: language,
    ));
  }
  
  class OkadaApp extends StatelessWidget {
    final PreferencesService preferencesService;
    final AuthRepository authRepository;
    final ProductRepository productRepository;
    final CartRepository cartRepository;
    final AIFeaturesManager aiManager;
    final String initialLanguage;
    
    const OkadaApp({
      Key? key,
      required this.preferencesService,
      required this.authRepository,
      required this.productRepository,
      required this.cartRepository,
      required this.aiManager,
      required this.initialLanguage,
    }) : super(key: key);
    
    @override
    Widget build(BuildContext context) {
      return MaterialApp(
        title: 'Okada',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en', ''),
          Locale('fr', ''),
        ],
        locale: Locale(initialLanguage),
        home: SplashScreen(authRepository: authRepository),
        routes: {
          '/onboarding': (context) => OnboardingScreen(
                preferencesService: preferencesService,
              ),
          '/auth': (context) => AuthScreen(
                authRepository: authRepository,
              ),
          '/home': (context) => HomeScreen(
                authRepository: authRepository,
                productRepository: productRepository,
                aiManager: aiManager,
              ),
          // Add other routes here
        },
      );
    }
  }
  ```

## 6. Testing

### 6.1. Unit Tests

- [ ] Create test directory:
  ```bash
  mkdir -p test/unit
  ```

- [ ] Create auth repository test:
  ```bash
  touch test/unit/auth_repository_test.dart
  ```

- [ ] Implement auth repository test:
  ```dart
  // test/unit/auth_repository_test.dart
  import 'package:flutter_test/flutter_test.dart';
  import 'package:mockito/mockito.dart';
  import 'package:mockito/annotations.dart';
  import 'package:firebase_auth/firebase_auth.dart';
  import 'package:google_sign_in/google_sign_in.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/storage/secure_storage.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  
  @GenerateMocks([
    FirebaseAuth,
    GoogleSignIn,
    ApiClient,
    SecureStorageService,
    UserCredential,
    User,
  ])
  void main() {
    late AuthRepository authRepository;
    late MockFirebaseAuth mockFirebaseAuth;
    late MockGoogleSignIn mockGoogleSignIn;
    late MockApiClient mockApiClient;
    late MockSecureStorageService mockSecureStorage;
    
    setUp(() {
      mockFirebaseAuth = MockFirebaseAuth();
      mockGoogleSignIn = MockGoogleSignIn();
      mockApiClient = MockApiClient();
      mockSecureStorage = MockSecureStorageService();
      
      authRepository = AuthRepository(
        firebaseAuth: mockFirebaseAuth,
        googleSignIn: mockGoogleSignIn,
        apiClient: mockApiClient,
        secureStorage: mockSecureStorage,
      );
    });
    
    group('isSignedIn', () {
      test('should return true when token exists', () async {
        // Arrange
        when(mockSecureStorage.getAuthToken()).thenAnswer((_) async => 'token');
        
        // Act
        final result = await authRepository.isSignedIn();
        
        // Assert
        expect(result, true);
        verify(mockSecureStorage.getAuthToken()).called(1);
      });
      
      test('should return false when token does not exist', () async {
        // Arrange
        when(mockSecureStorage.getAuthToken()).thenAnswer((_) async => null);
        
        // Act
        final result = await authRepository.isSignedIn();
        
        // Assert
        expect(result, false);
        verify(mockSecureStorage.getAuthToken()).called(1);
      });
    });
    
    // Add more tests for other methods
  }
  ```

### 6.2. Widget Tests

- [ ] Create widget test directory:
  ```bash
  mkdir -p test/widget
  ```

- [ ] Create voice search widget test:
  ```bash
  touch test/widget/voice_search_widget_test.dart
  ```

- [ ] Implement voice search widget test:
  ```dart
  // test/widget/voice_search_widget_test.dart
  import 'package:flutter/material.dart';
  import 'package:flutter_test/flutter_test.dart';
  import 'package:mockito/mockito.dart';
  import 'package:mockito/annotations.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/presentation/widgets/ai/voice_search_widget.dart';
  
  @GenerateMocks([AIFeaturesManager])
  void main() {
    late MockAIFeaturesManager mockAiManager;
    
    setUp(() {
      mockAiManager = MockAIFeaturesManager();
    });
    
    testWidgets('VoiceSearchWidget displays correctly', (WidgetTester tester) async {
      // Arrange
      when(mockAiManager.initSpeechRecognition()).thenAnswer((_) async => true);
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VoiceSearchWidget(
              aiManager: mockAiManager,
              onResult: (result) {},
              onError: (error) {},
            ),
          ),
        ),
      );
      
      // Assert
      expect(find.text('Tap to speak'), findsOneWidget);
      expect(find.byIcon(Icons.mic), findsOneWidget);
    });
    
    // Add more widget tests
  }
  ```

### 6.3. Integration Tests

- [ ] Create integration test directory:
  ```bash
  mkdir -p integration_test
  ```

- [ ] Create app test:
  ```bash
  touch integration_test/app_test.dart
  ```

- [ ] Implement app test:
  ```dart
  // integration_test/app_test.dart
  import 'package:flutter_test/flutter_test.dart';
  import 'package:integration_test/integration_test.dart';
  import 'package:okada_customer/main.dart' as app;
  
  void main() {
    IntegrationTestWidgetsFlutterBinding.ensureInitialized();
    
    group('end-to-end test', () {
      testWidgets('tap on the floating action button, verify counter',
          (tester) async {
        // Load app widget
        app.main();
        
        // Wait for app to load
        await tester.pumpAndSettle();
        
        // Verify splash screen is displayed
        expect(find.byType(app.SplashScreen), findsOneWidget);
        
        // Wait for navigation
        await tester.pumpAndSettle(const Duration(seconds: 3));
        
        // Add more test steps
      });
    });
  }
  ```

## 7. Build and Deploy

### 7.1. Build Configuration

- [ ] Create build configuration for Android:
  ```bash
  touch android/app/build.gradle
  ```

- [ ] Update Android build configuration:
  ```gradle
  // android/app/build.gradle
  def localProperties = new Properties()
  def localPropertiesFile = rootProject.file('local.properties')
  if (localPropertiesFile.exists()) {
      localPropertiesFile.withReader('UTF-8') { reader ->
          localProperties.load(reader)
      }
  }
  
  def flutterRoot = localProperties.getProperty('flutter.sdk')
  if (flutterRoot == null) {
      throw new GradleException("Flutter SDK not found. Define location with flutter.sdk in the local.properties file.")
  }
  
  def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
  if (flutterVersionCode == null) {
      flutterVersionCode = '1'
  }
  
  def flutterVersionName = localProperties.getProperty('flutter.versionName')
  if (flutterVersionName == null) {
      flutterVersionName = '1.0'
  }
  
  apply plugin: 'com.android.application'
  apply plugin: 'kotlin-android'
  apply from: "$flutterRoot/packages/flutter_tools/gradle/flutter.gradle"
  apply plugin: 'com.google.gms.google-services'
  
  android {
      compileSdkVersion 33
      
      compileOptions {
          sourceCompatibility JavaVersion.VERSION_1_8
          targetCompatibility JavaVersion.VERSION_1_8
      }
      
      kotlinOptions {
          jvmTarget = '1.8'
      }
      
      sourceSets {
          main.java.srcDirs += 'src/main/kotlin'
      }
      
      defaultConfig {
          applicationId "com.okada.customer"
          minSdkVersion 21
          targetSdkVersion 33
          versionCode flutterVersionCode.toInteger()
          versionName flutterVersionName
          multiDexEnabled true
      }
      
      buildTypes {
          release {
              signingConfig signingConfigs.debug
              minifyEnabled true
              shrinkResources true
              proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
          }
      }
  }
  
  flutter {
      source '../..'
  }
  
  dependencies {
      implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
      implementation platform('com.google.firebase:firebase-bom:30.0.0')
      implementation 'com.google.firebase:firebase-analytics'
      implementation 'com.android.support:multidex:1.0.3'
  }
  ```

### 7.2. Release Commands

- [ ] Create release build script:
  ```bash
  touch build_release.sh
  ```

- [ ] Implement release build script:
  ```bash
  #!/bin/bash
  
  # Generate app icons
  flutter pub run flutter_launcher_icons
  
  # Generate splash screen
  flutter pub run flutter_native_splash:create
  
  # Build Android release
  flutter build apk --release
  
  # Build iOS release
  # flutter build ios --release
  
  echo "Build completed successfully!"
  ```

- [ ] Make script executable:
  ```bash
  chmod +x build_release.sh
  ```

## 8. Documentation

### 8.1. Create README.md

- [ ] Create README.md:
  ```bash
  touch README.md
  ```

- [ ] Implement README.md:
  ```markdown
  # Okada Customer App
  
  A Flutter-based quick commerce application for the Okada platform in Cameroon.
  
  ## Features
  
  - AI-powered personalized recommendations
  - Voice search and image search capabilities
  - Offline functionality for low-connectivity areas
  - Multi-language support (English and French)
  - Dark store-based quick commerce model
  
  ## Getting Started
  
  ### Prerequisites
  
  - Flutter SDK (3.0.0 or higher)
  - Dart SDK (3.0.0 or higher)
  - Android Studio / Xcode
  - Firebase project
  
  ### Installation
  
  1. Clone the repository:
  
  ```bash
  git clone https://github.com/okada/customer-app.git
  cd customer-app
  ```
  
  2. Install dependencies:
  
  ```bash
  flutter pub get
  ```
  
  3. Create a `.env` file in the root directory with the following content:
  
  ```
  API_URL=https://api.okada.com
  GOOGLE_MAPS_API_KEY=your_google_maps_api_key
  AI_BRAIN_URL=https://ai-brain.okada.com
  AI_BRAIN_API_KEY=your_ai_brain_api_key
  ```
  
  4. Run the app:
  
  ```bash
  flutter run
  ```
  
  ## Architecture
  
  The app follows a clean architecture approach with the following layers:
  
  - **Presentation**: UI components, screens, and widgets
  - **Domain**: Business logic and use cases
  - **Data**: Repositories, data sources, and models
  - **Core**: Shared utilities, services, and configurations
  
  ## AI Features
  
  The app includes several AI-powered features:
  
  - **Personalized Recommendations**: AI-driven product recommendations based on user behavior

# Flutter Rider App Implementation Checklist with AI Features

## Overview
This document provides a comprehensive implementation checklist for developing the Okada rider app using Flutter with integrated AI capabilities. The app will connect to the central AI Brain for intelligent features while maintaining optimal performance on low-end devices common in Cameroon.

## Branding Guidelines
- **Primary Color (Green)**: `#007A5E` (Cameroon flag green)
- **Secondary Color (Red)**: `#CE1126` (Cameroon flag red)
- **Accent Color (Yellow)**: `#FCD116` (Cameroon flag yellow)
- **Text on Dark**: `#FFFFFF`
- **Text on Light**: `#333333`

## Project Setup

### 1. Initialize Flutter Project
```bash
flutter create --org cm.okada --project-name okada_rider --platforms android,ios -a kotlin -i swift okada_rider
cd okada_rider
```

### 2. Configure Project Structure
```
lib/
├── api/                  # API service connections
├── blocs/                # Business Logic Components
├── config/               # Configuration files
├── constants/            # App constants
├── data/                 # Data models and repositories
├── di/                   # Dependency injection
├── features/             # Feature modules
├── l10n/                 # Localization
├── services/             # Services including AI services
├── theme/                # App theme
├── utils/                # Utility functions
└── widgets/              # Reusable widgets
```

### 3. Add Essential Dependencies
Update `pubspec.yaml` with:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  # State Management
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  # Networking
  dio: ^5.3.2
  connectivity_plus: ^4.0.2
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.1
  # Location Services
  geolocator: ^10.0.1
  google_maps_flutter: ^2.5.0
  # UI Components
  flutter_svg: ^2.0.7
  cached_network_image: ^3.2.3
  shimmer: ^3.0.0
  # AI Integration
  tflite_flutter: ^0.10.1
  # Firebase Services
  firebase_core: ^2.15.1
  firebase_messaging: ^14.6.7
  firebase_analytics: ^10.4.5
  # Utils
  intl: ^0.18.1
  logger: ^2.0.1
  package_info_plus: ^4.1.0
  url_launcher: ^6.1.14
  # Audio
  just_audio: ^0.9.35
  # Biometrics
  local_auth: ^2.1.7
  # Permissions
  permission_handler: ^10.4.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.3
  build_runner: ^2.4.6
  hive_generator: ^2.0.1
  flutter_launcher_icons: ^0.13.1
  flutter_native_splash: ^2.3.2
```

## Core Implementation

### 1. Theme Configuration
Create `lib/theme/app_theme.dart`:

```dart
import 'package:flutter/material.dart';

class AppTheme {
  static const primaryColor = Color(0xFF007A5E); // Green
  static const secondaryColor = Color(0xFFCE1126); // Red
  static const accentColor = Color(0xFFFCD116); // Yellow
  
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: primaryColor,
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      // Add more theme configurations
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      primaryColor: primaryColor,
      colorScheme: ColorScheme.dark(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
      ),
      // Add more dark theme configurations
    );
  }
}
```

### 2. Localization Setup
Create `lib/l10n/app_localizations.dart` for English and French support.

### 3. API Service Configuration
Create `lib/api/api_service.dart` with Dio configuration and interceptors.

### 4. AI Service Integration
Create `lib/services/ai_service.dart` to connect with the AI Brain:

```dart
import 'package:dio/dio.dart';

class AIService {
  final Dio _dio;
  
  AIService(this._dio);
  
  // Route optimization
  Future<List<Map<String, dynamic>>> getOptimizedRoute(
    double startLat, 
    double startLng,
    double endLat,
    double endLng,
    {List<Map<String, dynamic>>? waypoints}
  ) async {
    try {
      final response = await _dio.post('/ai/route-optimization', data: {
        'start': {'lat': startLat, 'lng': startLng},
        'end': {'lat': endLat, 'lng': endLng},
        'waypoints': waypoints ?? [],
      });
      
      return List<Map<String, dynamic>>.from(response.data['route']);
    } catch (e) {
      // Fallback to local calculation if AI service is unavailable
      return _calculateBasicRoute(startLat, startLng, endLat, endLng, waypoints);
    }
  }
  
  // Earnings prediction
  Future<Map<String, dynamic>> predictEarnings(
    int completedOrders,
    double averageRating,
    int hoursOnline
  ) async {
    try {
      final response = await _dio.post('/ai/earnings-prediction', data: {
        'completedOrders': completedOrders,
        'averageRating': averageRating,
        'hoursOnline': hoursOnline,
      });
      
      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      // Fallback to basic calculation
      return {
        'predictedEarnings': completedOrders * 500.0, // Basic estimate
        'confidence': 0.7,
      };
    }
  }
  
  // Local fallback for route calculation
  List<Map<String, dynamic>> _calculateBasicRoute(
    double startLat, 
    double startLng,
    double endLat,
    double endLng,
    List<Map<String, dynamic>>? waypoints
  ) {
    // Simple direct route calculation
    return [
      {'lat': startLat, 'lng': startLng},
      {'lat': endLat, 'lng': endLng},
    ];
  }
  
  // Order priority recommendation
  Future<List<Map<String, dynamic>>> getOrderPriorities(
    List<Map<String, dynamic>> availableOrders,
    Map<String, dynamic> riderProfile
  ) async {
    try {
      final response = await _dio.post('/ai/order-priorities', data: {
        'orders': availableOrders,
        'riderProfile': riderProfile,
      });
      
      return List<Map<String, dynamic>>.from(response.data['prioritizedOrders']);
    } catch (e) {
      // Sort by distance as fallback
      availableOrders.sort((a, b) => 
        (a['distance'] as num).compareTo(b['distance'] as num));
      return availableOrders;
    }
  }
}
```

### 5. Local AI Model Integration
Create `lib/services/local_ai_service.dart` for offline AI capabilities:

```dart
import 'package:tflite_flutter/tflite_flutter.dart';

class LocalAIService {
  Interpreter? _routeOptimizer;
  Interpreter? _orderPrioritizer;
  
  Future<void> initialize() async {
    try {
      _routeOptimizer = await Interpreter.fromAsset('assets/models/route_optimizer.tflite');
      _orderPrioritizer = await Interpreter.fromAsset('assets/models/order_prioritizer.tflite');
    } catch (e) {
      print('Failed to load TFLite models: $e');
    }
  }
  
  List<List<double>> optimizeRouteOffline(
    double startLat, 
    double startLng,
    double endLat,
    double endLng
  ) {
    if (_routeOptimizer == null) {
      return [
        [startLat, startLng],
        [endLat, endLng]
      ];
    }
    
    // Input shape: [1, 4] (start_lat, start_lng, end_lat, end_lng)
    var input = [
      [startLat, startLng, endLat, endLng]
    ];
    
    // Output shape depends on model, e.g., [1, 10, 2] for 10 waypoints
    var output = List.generate(
      1, 
      (_) => List.generate(
        10, 
        (_) => List.generate(2, (_) => 0.0)
      )
    );
    
    _routeOptimizer!.run(input, output);
    
    // Convert output to list of coordinates
    List<List<double>> route = [];
    for (var point in output[0]) {
      if (point[0] != 0.0 || point[1] != 0.0) {
        route.add([point[0], point[1]]);
      }
    }
    
    return route;
  }
  
  // Add more offline AI methods as needed
}
```

## Feature Implementation

### 1. Authentication Module
Create authentication screens and logic:
- Login screen
- OTP verification
- Profile setup
- Biometric authentication

### 2. Home Screen
Create `lib/features/home/home_screen.dart` with:
- Order request cards
- AI-powered order recommendations
- Earnings summary
- Online/Offline toggle
- Performance metrics

### 3. Order Management
Create order management screens:
- Order details screen
- Order acceptance/rejection
- Navigation to pickup
- Order pickup confirmation
- Navigation to delivery
- Delivery confirmation
- Issue reporting

### 4. Navigation and Maps
Implement map functionality:
- Google Maps integration
- AI-optimized route display
- Turn-by-turn navigation
- Offline map caching
- Voice guidance

### 5. Earnings and Analytics
Create earnings screens:
- Daily/weekly/monthly earnings
- AI-powered earnings predictions
- Performance analytics
- Incentive tracking

### 6. Profile and Settings
Implement profile management:
- Personal information
- Vehicle details
- Document verification
- App settings
- Language selection (English/French)
- Notification preferences

### 7. Offline Mode
Implement robust offline functionality:
- Order caching
- Offline navigation
- Data synchronization when back online
- Local AI model execution

## AI Feature Implementation

### 1. Smart Order Recommendation
Implement BLoC for AI-powered order recommendations:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../services/ai_service.dart';

// Events
abstract class OrderRecommendationEvent extends Equatable {
  @override
  List<Object> get props => [];
}

class FetchOrderRecommendations extends OrderRecommendationEvent {
  final List<Map<String, dynamic>> availableOrders;
  final Map<String, dynamic> riderProfile;
  
  FetchOrderRecommendations(this.availableOrders, this.riderProfile);
  
  @override
  List<Object> get props => [availableOrders, riderProfile];
}

// States
abstract class OrderRecommendationState extends Equatable {
  @override
  List<Object> get props => [];
}

class OrderRecommendationInitial extends OrderRecommendationState {}
class OrderRecommendationLoading extends OrderRecommendationState {}
class OrderRecommendationLoaded extends OrderRecommendationState {
  final List<Map<String, dynamic>> prioritizedOrders;
  
  OrderRecommendationLoaded(this.prioritizedOrders);
  
  @override
  List<Object> get props => [prioritizedOrders];
}
class OrderRecommendationError extends OrderRecommendationState {
  final String message;
  
  OrderRecommendationError(this.message);
  
  @override
  List<Object> get props => [message];
}

// BLoC
class OrderRecommendationBloc extends Bloc<OrderRecommendationEvent, OrderRecommendationState> {
  final AIService aiService;
  
  OrderRecommendationBloc(this.aiService) : super(OrderRecommendationInitial()) {
    on<FetchOrderRecommendations>(_onFetchOrderRecommendations);
  }
  
  Future<void> _onFetchOrderRecommendations(
    FetchOrderRecommendations event,
    Emitter<OrderRecommendationState> emit
  ) async {
    emit(OrderRecommendationLoading());
    
    try {
      final prioritizedOrders = await aiService.getOrderPriorities(
        event.availableOrders,
        event.riderProfile
      );
      
      emit(OrderRecommendationLoaded(prioritizedOrders));
    } catch (e) {
      emit(OrderRecommendationError(e.toString()));
    }
  }
}
```

### 2. Intelligent Route Optimization
Implement route optimization with AI:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../services/ai_service.dart';
import '../../services/local_ai_service.dart';
import '../../services/connectivity_service.dart';

// Events, States, and BLoC implementation for route optimization
// Similar structure to OrderRecommendationBloc
```

### 3. Earnings Prediction
Implement earnings prediction with AI:

```dart
// Similar BLoC pattern for earnings prediction
```

### 4. Offline AI Capabilities
Implement service to manage offline AI models:

```dart
// Service to download, update, and manage offline AI models
```

## Testing Checklist

### 1. Unit Tests
Create tests for:
- AI service integration
- Local AI model execution
- Data models
- BLoC logic

### 2. Widget Tests
Create tests for:
- UI components
- Screen flows
- User interactions

### 3. Integration Tests
Create tests for:
- End-to-end order flow
- Authentication flow
- Offline functionality

## Deployment Preparation

### 1. App Icons and Splash Screen
Configure app icons with Cameroon flag colors:

```yaml
flutter_icons:
  android: true
  ios: true
  image_path: "assets/icons/app_icon.png"
  adaptive_icon_background: "#007A5E"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"

flutter_native_splash:
  color: "#007A5E"
  image: assets/images/splash.png
  android: true
  ios: true
```

### 2. Performance Optimization
- Implement memory optimization
- Configure image caching
- Optimize startup time
- Reduce app size

### 3. Release Configuration
Create `android/app/build.gradle` configurations for release build.

## Final Checklist

### 1. Pre-Launch Verification
- Verify all AI features work as expected
- Test offline functionality
- Verify localization (English and French)
- Check performance on low-end devices

### 2. Documentation
- Create API documentation
- Document AI model specifications
- Create user manual

### 3. Monitoring Setup
- Configure crash reporting
- Set up analytics
- Prepare for user feedback collection

## Implementation Notes

- Prioritize offline functionality for Cameroon's connectivity challenges
- Ensure the app works efficiently on low-end Android devices
- Optimize battery usage for areas with unreliable electricity
- Implement progressive loading for better user experience
- Use the Cameroon flag colors (green, red, yellow) consistently throughout the UI
# Merchant Web Platform Implementation Checklist with AI Capabilities

## Overview
This document provides a comprehensive implementation checklist for developing the Okada merchant web platform using Next.js with integrated AI capabilities. The platform will connect to the central AI Brain for intelligent inventory management, demand forecasting, and operational optimization.

## Branding Guidelines
- **Primary Color (Green)**: `#007A5E` (Cameroon flag green)
- **Secondary Color (Red)**: `#CE1126` (Cameroon flag red)
- **Accent Color (Yellow)**: `#FCD116` (Cameroon flag yellow)
- **Text on Dark**: `#FFFFFF`
- **Text on Light**: `#333333`

## Project Setup

### 1. Initialize Next.js Project
```bash
npx create-next-app@latest okada-merchant-platform --typescript --tailwind --eslint
cd okada-merchant-platform
```

### 2. Configure Project Structure
```
├── public/                # Static assets
├── src/
│   ├── app/               # App router pages
│   ├── components/        # Reusable components
│   │   ├── common/        # Common UI components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── inventory/     # Inventory components
│   │   ├── orders/        # Order management components
│   │   ├── analytics/     # Analytics components
│   │   └── settings/      # Settings components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── services/          # API and service functions
│   │   ├── api/           # API client
│   │   ├── ai/            # AI service integration
│   │   └── auth/          # Authentication services
│   ├── store/             # State management
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
└── ...                    # Config files
```

### 3. Add Essential Dependencies
Update `package.json` with:

```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "@tanstack/react-query": "^4.35.3",
    "@tanstack/react-table": "^8.10.1",
    "axios": "^1.5.0",
    "chart.js": "^4.4.0",
    "date-fns": "^2.30.0",
    "formik": "^2.4.5",
    "i18next": "^23.5.1",
    "jotai": "^2.4.2",
    "next": "13.5.2",
    "next-auth": "^4.23.1",
    "next-i18next": "^14.0.3",
    "next-pwa": "^5.6.0",
    "react": "18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "18.2.0",
    "react-dropzone": "^14.2.3",
    "react-i18next": "^13.2.2",
    "react-toastify": "^9.1.3",
    "socket.io-client": "^4.7.2",
    "swr": "^2.2.2",
    "yup": "^1.2.0",
    "zod": "^3.22.2"
  },
  "devDependencies": {
    "@types/node": "20.6.3",
    "@types/react": "18.2.22",
    "@types/react-dom": "18.2.7",
    "autoprefixer": "10.4.15",
    "eslint": "8.49.0",
    "eslint-config-next": "13.5.2",
    "postcss": "8.4.30",
    "tailwindcss": "3.3.3",
    "typescript": "5.2.2"
  }
}
```

## Core Implementation

### 1. Theme Configuration
Create `src/styles/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#007A5E', // Green
    secondary: '#CE1126', // Red
    accent: '#FCD116', // Yellow
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: {
      primary: '#333333',
      secondary: '#6B7280',
      onDark: '#FFFFFF',
    },
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  fonts: {
    sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
};
```

Configure Tailwind in `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007A5E',
        secondary: '#CE1126',
        accent: '#FCD116',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 2. Localization Setup
Configure i18n for English and French support in `next-i18next.config.js`.

### 3. API Service Configuration
Create `src/services/api/apiClient.ts`:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
              { refreshToken }
            );
            
            const { token } = response.data;
            localStorage.setItem('auth_token', token);
            
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = ApiClient.getInstance();
```

### 4. AI Service Integration
Create `src/services/ai/aiService.ts`:

```typescript
import { apiClient } from '../api/apiClient';

export interface DemandForecastParams {
  productId: string;
  storeId: string;
  daysAhead: number;
  includeHistorical?: boolean;
}

export interface InventoryOptimizationParams {
  storeId: string;
  categories?: string[];
  budget?: number;
}

export interface PricingRecommendationParams {
  productId: string;
  storeId: string;
  competitorPrices?: { [competitor: string]: number };
  costPrice: number;
}

export interface StaffingOptimizationParams {
  storeId: string;
  date: string;
  currentStaff: number;
}

class AIService {
  // Demand forecasting
  async getDemandForecast(params: DemandForecastParams) {
    try {
      return await apiClient.post('/ai/demand-forecast', params);
    } catch (error) {
      console.error('Error fetching demand forecast:', error);
      // Fallback to basic forecasting
      return this.generateBasicForecast(params);
    }
  }

  // Inventory optimization
  async getInventoryOptimization(params: InventoryOptimizationParams) {
    try {
      return await apiClient.post('/ai/inventory-optimization', params);
    } catch (error) {
      console.error('Error fetching inventory optimization:', error);
      // Fallback to basic optimization
      return this.generateBasicInventoryRecommendation(params);
    }
  }

  // Dynamic pricing recommendations
  async getPricingRecommendations(params: PricingRecommendationParams) {
    try {
      return await apiClient.post('/ai/pricing-recommendations', params);
    } catch (error) {
      console.error('Error fetching pricing recommendations:', error);
      // Fallback to basic pricing
      return {
        recommendedPrice: params.costPrice * 1.3, // 30% markup
        confidence: 0.7,
        priceRange: {
          min: params.costPrice * 1.2,
          max: params.costPrice * 1.4,
        },
      };
    }
  }

  // Staffing optimization
  async getStaffingOptimization(params: StaffingOptimizationParams) {
    try {
      return await apiClient.post('/ai/staffing-optimization', params);
    } catch (error) {
      console.error('Error fetching staffing optimization:', error);
      // Fallback to basic staffing recommendation
      return {
        recommendedStaff: params.currentStaff,
        confidence: 0.6,
        hourlyBreakdown: this.generateBasicStaffingBreakdown(),
      };
    }
  }

  // Fallback methods for offline operation
  private generateBasicForecast(params: DemandForecastParams) {
    // Simple forecasting logic based on historical data
    return {
      forecast: Array(params.daysAhead).fill(0).map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        quantity: Math.floor(Math.random() * 50) + 10,
        confidence: 0.6,
      })),
      confidence: 0.6,
    };
  }

  private generateBasicInventoryRecommendation(params: InventoryOptimizationParams) {
    // Simple inventory recommendation
    return {
      recommendations: [
        { productId: 'sample-1', currentStock: 10, recommendedStock: 15 },
        { productId: 'sample-2', currentStock: 20, recommendedStock: 18 },
        { productId: 'sample-3', currentStock: 5, recommendedStock: 12 },
      ],
      confidence: 0.6,
    };
  }

  private generateBasicStaffingBreakdown() {
    // Simple hourly staffing breakdown
    return Array(24).fill(0).map((_, hour) => {
      // More staff during peak hours (8am-8pm)
      const isPeakHour = hour >= 8 && hour <= 20;
      return {
        hour,
        recommendedStaff: isPeakHour ? 3 : 1,
      };
    });
  }
}

export const aiService = new AIService();
```

## Feature Implementation

### 1. Authentication Module
Create authentication screens and logic:
- Login page
- Password reset
- Two-factor authentication
- Role-based access control

### 2. Dashboard
Create `src/app/dashboard/page.tsx` with:
- Key performance indicators
- AI-powered insights
- Recent orders
- Inventory alerts
- Staff performance

### 3. Order Management
Create order management screens:
- Order list with filtering and sorting
- Order details
- Order status updates
- Batch order processing
- AI-powered order prioritization

### 4. Inventory Management
Implement inventory management:
- Product catalog
- Stock levels
- AI-powered inventory optimization
- Low stock alerts
- Batch inventory updates
- Barcode scanning integration

### 5. Analytics and Reporting
Create analytics screens:
- Sales performance
- Product performance
- AI-powered demand forecasting
- Customer insights
- Operational efficiency metrics
- Custom report generation

### 6. Dark Store Management
Implement dark store management:
- Store setup and configuration
- Zone management
- Staff assignment
- AI-powered layout optimization
- Equipment tracking

### 7. Staff Management
Create staff management screens:
- Staff profiles
- Performance tracking
- AI-powered staffing optimization
- Shift scheduling
- Role management

### 8. Settings and Configuration
Implement settings screens:
- Account settings
- Store settings
- Notification preferences
- Integration settings
- System configuration

## AI Feature Implementation

### 1. Demand Forecasting Dashboard
Create `src/components/analytics/DemandForecastingDashboard.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartData
} from 'chart.js';
import { aiService, DemandForecastParams } from '../../services/ai/aiService';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

interface DemandForecastingDashboardProps {
  storeId: string;
  productId?: string;
}

export const DemandForecastingDashboard: React.FC<DemandForecastingDashboardProps> = ({ 
  storeId, 
  productId 
}) => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [daysAhead, setDaysAhead] = useState<number>(7);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(productId);
  const [includeHistorical, setIncludeHistorical] = useState<boolean>(true);

  useEffect(() => {
    const fetchForecastData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params: DemandForecastParams = {
          storeId,
          productId: selectedProduct || 'all',
          daysAhead,
          includeHistorical
        };
        
        const data = await aiService.getDemandForecast(params);
        setForecastData(data);
      } catch (err) {
        setError('Failed to fetch forecast data. Please try again later.');
        console.error('Error fetching forecast data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchForecastData();
  }, [storeId, selectedProduct, daysAhead, includeHistorical]);

  const prepareChartData = (): ChartData<'line'> => {
    if (!forecastData || !forecastData.forecast) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    return {
      labels: forecastData.forecast.map((item: any) => item.date),
      datasets: [
        {
          label: 'Forecasted Demand',
          data: forecastData.forecast.map((item: any) => item.quantity),
          borderColor: '#007A5E', // Primary color (green)
          backgroundColor: 'rgba(0, 122, 94, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        ...(forecastData.historical ? [{
          label: 'Historical Demand',
          data: forecastData.historical.map((item: any) => item.quantity),
          borderColor: '#CE1126', // Secondary color (red)
          backgroundColor: 'rgba(206, 17, 38, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.3,
          fill: false,
        }] : [])
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const confidence = forecastData?.forecast?.[context.dataIndex]?.confidence;
            
            if (label === 'Forecasted Demand' && confidence) {
              return `${label}: ${value} (Confidence: ${(confidence * 100).toFixed(1)}%)`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Quantity'
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Demand Forecast</h2>
        
        <div className="flex space-x-4">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={daysAhead}
            onChange={(e) => setDaysAhead(Number(e.target.value))}
          >
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
          
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={includeHistorical} 
              onChange={(e) => setIncludeHistorical(e.target.checked)}
              className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Include historical data</span>
          </label>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          <div className="h-80">
            <Line data={prepareChartData()} options={chartOptions} />
          </div>
          
          {forecastData && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">AI Insights</h3>
              <p className="text-gray-600">
                Overall forecast confidence: <span className="font-semibold">{(forecastData.confidence * 100).toFixed(1)}%</span>
              </p>
              {forecastData.insights && (
                <ul className="mt-2 space-y-1">
                  {forecastData.insights.map((insight: string, index: number) => (
                    <li key={index} className="text-gray-600 flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

### 2. Inventory Optimization
Create inventory optimization component:

```tsx
// Similar structure to DemandForecastingDashboard
// Implement AI-powered inventory optimization recommendations
```

### 3. Dynamic Pricing Engine
Create dynamic pricing component:

```tsx
// Implement AI-powered pricing recommendations
```

### 4. Staffing Optimization
Create staffing optimization component:

```tsx
// Implement AI-powered staffing recommendations
```

### 5. AI Insights Dashboard
Create AI insights dashboard:

```tsx
// Implement dashboard showing all AI-powered insights in one place
```

## Testing Checklist

### 1. Unit Tests
Create tests for:
- AI service integration
- Data fetching hooks
- UI components
- State management

### 2. Integration Tests
Create tests for:
- Authentication flow
- Order management flow
- Inventory management flow
- AI feature integration

### 3. End-to-End Tests
Create tests for:
- Complete user journeys
- Cross-browser compatibility
- Responsive design

## Deployment Preparation

### 1. Performance Optimization
- Implement code splitting
- Configure image optimization
- Set up caching strategies
- Optimize bundle size

### 2. SEO and Metadata
- Configure metadata
- Implement SEO best practices
- Set up sitemap

### 3. Analytics and Monitoring
- Set up error tracking
- Configure performance monitoring
- Implement user analytics

## Final Checklist

### 1. Pre-Launch Verification
- Verify all AI features work as expected
- Test with real data
- Verify localization (English and French)
- Check performance on various devices and browsers

### 2. Documentation
- Create API documentation
- Document AI model specifications
- Create user manual

### 3. Security Audit
- Perform security audit
- Implement security best practices
- Set up regular security scanning

## Implementation Notes

- Ensure the platform is responsive and works well on tablets for in-store use
- Optimize for low-bandwidth connections common in Cameroon
- Implement progressive loading for better user experience
- Use the Cameroon flag colors (green, red, yellow) consistently throughout the UI
- Ensure all AI features have fallback mechanisms for when the AI Brain is unavailable
# Testing, Training, and Deployment Checklist for AI Components

## Overview
This document provides a comprehensive checklist for testing, training, and deploying the AI components of the Okada platform. The focus is on ensuring the AI Brain and its integrations with the customer app, rider app, and merchant platform function correctly, provide value, and operate efficiently in the Cameroonian context.

## AI Model Testing

### 1. Unit Testing for AI Services

- [ ] **Test AI Brain API Endpoints**
  ```bash
  # Example test command
  npm run test:ai-services
  ```
  - Verify all endpoints return expected response formats
  - Test error handling and fallback mechanisms
  - Validate input parameter validation

- [ ] **Test AI Model Wrappers**
  - Verify model input preprocessing functions
  - Test output post-processing functions
  - Validate error handling and logging

- [ ] **Test Local AI Models**
  - Verify TFLite model loading and execution
  - Test model quantization impact on accuracy
  - Validate memory usage and performance

### 2. Integration Testing for AI Components

- [ ] **Test AI Brain Integration with Backend Services**
  ```bash
  # Example test command
  npm run test:integration:ai-backend
  ```
  - Verify data flow between services
  - Test authentication and authorization
  - Validate event handling and asynchronous operations

- [ ] **Test AI Integration with Customer App**
  ```bash
  # Example test command
  flutter test integration_test/ai_features_test.dart
  ```
  - Verify product recommendations functionality
  - Test search enhancement features
  - Validate personalization features

- [ ] **Test AI Integration with Rider App**
  ```bash
  # Example test command
  flutter test integration_test/ai_routing_test.dart
  ```
  - Verify route optimization functionality
  - Test order prioritization features
  - Validate earnings prediction accuracy

- [ ] **Test AI Integration with Merchant Platform**
  ```bash
  # Example test command
  npm run test:integration:ai-merchant
  ```
  - Verify demand forecasting functionality
  - Test inventory optimization features
  - Validate dynamic pricing recommendations

### 3. Performance Testing for AI Components

- [ ] **Test AI Response Times**
  ```bash
  # Example test command
  npm run test:performance:ai-response
  ```
  - Measure average response time for each AI endpoint
  - Test under various load conditions
  - Identify performance bottlenecks

- [ ] **Test AI Model Inference Speed**
  - Measure inference time on target devices
  - Test with various batch sizes
  - Validate memory usage during inference

- [ ] **Test Offline AI Performance**
  - Measure performance of on-device models
  - Test battery impact of local inference
  - Validate storage requirements for offline models

### 4. Accuracy Testing for AI Models

- [ ] **Test Recommendation Accuracy**
  - Calculate precision, recall, and F1 scores
  - Compare against baseline models
  - Validate on Cameroon-specific test data

- [ ] **Test Forecasting Accuracy**
  - Calculate RMSE, MAE, and MAPE metrics
  - Test with historical Cameroon market data
  - Validate seasonal prediction accuracy

- [ ] **Test Route Optimization Accuracy**
  - Compare against optimal routes
  - Test with Cameroon road network data
  - Validate time estimation accuracy

## AI Model Training

### 1. Data Collection and Preparation

- [ ] **Collect Training Data**
  - Gather relevant data from Cameroon market
  - Ensure data diversity and representativeness
  - Validate data quality and completeness

- [ ] **Preprocess Training Data**
  ```bash
  # Example preprocessing command
  python scripts/preprocess_data.py --input data/raw --output data/processed
  ```
  - Clean and normalize data
  - Handle missing values
  - Perform feature engineering

- [ ] **Create Train/Validation/Test Splits**
  ```bash
  # Example split command
  python scripts/create_data_splits.py --input data/processed --output data/splits
  ```
  - Ensure proper stratification
  - Maintain temporal coherence for time-series data
  - Validate split distributions

### 2. Model Training

- [ ] **Train Base Models**
  ```bash
  # Example training command
  python scripts/train_model.py --config configs/base_model.yaml
  ```
  - Train on general e-commerce data
  - Validate on holdout datasets
  - Save model checkpoints

- [ ] **Fine-tune Models with Cameroon Data**
  ```bash
  # Example fine-tuning command
  python scripts/finetune_model.py --base-model models/base --config configs/finetune.yaml
  ```
  - Use transfer learning techniques
  - Apply regularization to prevent overfitting
  - Validate on Cameroon-specific test data

- [ ] **Train Ensemble Models**
  ```bash
  # Example ensemble training command
  python scripts/train_ensemble.py --models models/list.txt --config configs/ensemble.yaml
  ```
  - Combine multiple model predictions
  - Optimize ensemble weights
  - Validate ensemble performance

### 3. Model Optimization

- [ ] **Quantize Models for Mobile Deployment**
  ```bash
  # Example quantization command
  python scripts/quantize_model.py --input models/full --output models/quantized
  ```
  - Apply post-training quantization
  - Validate accuracy impact
  - Measure size reduction

- [ ] **Prune Models for Efficiency**
  ```bash
  # Example pruning command
  python scripts/prune_model.py --input models/full --output models/pruned --sparsity 0.7
  ```
  - Apply weight pruning techniques
  - Validate accuracy impact
  - Measure inference speed improvement

- [ ] **Optimize Models for Edge Devices**
  ```bash
  # Example optimization command
  python scripts/optimize_for_edge.py --input models/pruned --output models/edge
  ```
  - Apply architecture-specific optimizations
  - Test on target devices
  - Validate battery and memory impact

### 4. Model Evaluation

- [ ] **Evaluate Model Accuracy**
  ```bash
  # Example evaluation command
  python scripts/evaluate_model.py --model models/final --data data/test
  ```
  - Calculate relevant metrics
  - Compare against baselines
  - Generate confusion matrices

- [ ] **Evaluate Model Fairness**
  ```bash
  # Example fairness evaluation command
  python scripts/evaluate_fairness.py --model models/final --data data/test
  ```
  - Test for demographic biases
  - Validate equal performance across user segments
  - Identify and mitigate unfair predictions

- [ ] **Evaluate Model Robustness**
  ```bash
  # Example robustness test command
  python scripts/test_robustness.py --model models/final --data data/adversarial
  ```
  - Test with adversarial examples
  - Validate performance with noisy inputs
  - Test with edge cases

## AI Deployment

### 1. Model Packaging

- [ ] **Convert Models to Deployment Format**
  ```bash
  # Example conversion commands
  python scripts/convert_to_tflite.py --input models/final --output models/tflite
  python scripts/convert_to_onnx.py --input models/final --output models/onnx
  ```
  - Create TFLite versions for mobile
  - Create ONNX versions for web
  - Validate converted model accuracy

- [ ] **Package Models for Distribution**
  ```bash
  # Example packaging command
  python scripts/package_models.py --input models/deployment --output packages/
  ```
  - Create versioned packages
  - Include metadata and documentation
  - Validate package integrity

- [ ] **Prepare Model Update Mechanism**
  - Implement model versioning
  - Create delta update packages
  - Test update process

### 2. AI Infrastructure Deployment

- [ ] **Deploy AI Brain to Cloud**
  ```bash
  # Example deployment command
  terraform apply -var-file=environments/production.tfvars
  ```
  - Set up Kubernetes cluster
  - Deploy model serving containers
  - Configure auto-scaling

- [ ] **Configure CDN for Model Distribution**
  - Set up edge caching for models
  - Configure regional distribution
  - Test download speeds from Cameroon

- [ ] **Set Up Monitoring and Logging**
  ```bash
  # Example monitoring setup
  helm install prometheus-stack prometheus-community/kube-prometheus-stack
  ```
  - Configure model performance monitoring
  - Set up alerting for anomalies
  - Implement detailed logging

### 3. CI/CD for AI Components

- [ ] **Set Up Automated Testing Pipeline**
  ```yaml
  # Example GitHub Actions workflow
  name: AI Model Testing
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Set up Python
          uses: actions/setup-python@v4
          with:
            python-version: '3.10'
        - name: Install dependencies
          run: pip install -r requirements-dev.txt
        - name: Run tests
          run: pytest tests/ai/
  ```
  - Configure unit test automation
  - Set up integration test workflows
  - Implement performance regression testing

- [ ] **Create Model Training Pipeline**
  ```yaml
  # Example training workflow
  name: AI Model Training
  on:
    schedule:
      - cron: '0 0 * * 0'  # Weekly
    workflow_dispatch:
  jobs:
    train:
      runs-on: [self-hosted, gpu]
      steps:
        - uses: actions/checkout@v3
        - name: Train models
          run: python scripts/train_pipeline.py
        - name: Upload artifacts
          uses: actions/upload-artifact@v3
          with:
            name: trained-models
            path: models/output/
  ```
  - Set up scheduled retraining
  - Configure GPU resources
  - Implement artifact storage

- [ ] **Implement Model Deployment Pipeline**
  ```yaml
  # Example deployment workflow
  name: AI Model Deployment
  on:
    workflow_run:
      workflows: ["AI Model Training"]
      types:
        - completed
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Download artifacts
          uses: actions/download-artifact@v3
          with:
            name: trained-models
            path: models/
        - name: Deploy models
          run: python scripts/deploy_models.py
  ```
  - Configure automatic deployment
  - Implement rollback mechanisms
  - Set up approval workflows

### 4. A/B Testing Framework

- [ ] **Set Up A/B Testing Infrastructure**
  ```bash
  # Example setup command
  helm install experiment-service ./charts/experiment-service
  ```
  - Configure experiment management
  - Set up user segmentation
  - Implement metrics collection

- [ ] **Create Model Experimentation Framework**
  - Implement champion/challenger pattern
  - Configure traffic allocation
  - Set up statistical analysis

- [ ] **Implement Feedback Collection**
  - Create user feedback mechanisms
  - Set up implicit feedback tracking
  - Implement feedback aggregation

## Cameroon-Specific Considerations

### 1. Network Resilience

- [ ] **Test AI Features with Poor Connectivity**
  - Simulate various network conditions
  - Validate graceful degradation
  - Test recovery mechanisms

- [ ] **Implement Offline-First AI Features**
  - Ensure critical AI features work offline
  - Test synchronization when connectivity returns
  - Validate storage requirements

- [ ] **Optimize for Low Bandwidth**
  - Implement progressive model loading
  - Compress API payloads
  - Prioritize critical AI features

### 2. Device Compatibility

- [ ] **Test on Common Cameroon Devices**
  - Validate performance on entry-level Android phones
  - Test memory usage on low-RAM devices
  - Verify battery impact

- [ ] **Optimize for Older Android Versions**
  - Test compatibility with Android 6.0+
  - Implement fallbacks for missing APIs
  - Validate UI rendering

- [ ] **Test with Varying Screen Sizes**
  - Verify UI adaptation to different screens
  - Test touch targets for usability
  - Validate text readability

### 3. Localization and Cultural Adaptation

- [ ] **Adapt AI Models for Local Context**
  - Fine-tune recommendations for Cameroonian preferences
  - Adapt language models for local French and English dialects
  - Validate cultural appropriateness

- [ ] **Test with Bilingual Content**
  - Verify AI features work with both French and English
  - Test language switching
  - Validate mixed-language content handling

- [ ] **Adapt to Local Business Practices**
  - Configure AI for local pricing strategies
  - Adapt inventory recommendations for local supply chains
  - Validate payment method integration

## Final Verification Checklist

### 1. Security Audit

- [ ] **Perform AI Security Assessment**
  ```bash
  # Example security scan command
  python scripts/security_scan.py --model models/final
  ```
  - Test for model inversion attacks
  - Validate input sanitization
  - Check for data leakage

- [ ] **Audit Data Privacy Compliance**
  - Verify GDPR compliance
  - Validate data minimization
  - Check consent management

- [ ] **Test API Security**
  - Validate authentication mechanisms
  - Test authorization controls
  - Check for common vulnerabilities

### 2. Performance Verification

- [ ] **Conduct Load Testing**
  ```bash
  # Example load test command
  k6 run load_tests/ai_endpoints.js
  ```
  - Test with expected peak traffic
  - Validate auto-scaling
  - Measure response times under load

- [ ] **Verify Resource Utilization**
  - Monitor CPU/GPU usage
  - Track memory consumption
  - Validate cost efficiency

- [ ] **Test Battery Impact**
  - Measure battery drain during AI operations
  - Compare against baseline usage
  - Optimize high-impact features

### 3. User Acceptance Testing

- [ ] **Conduct Pilot Testing in Cameroon**
  - Select representative user group
  - Collect qualitative feedback
  - Measure key performance indicators

- [ ] **Perform Usability Testing**
  - Test AI feature discoverability
  - Validate user understanding
  - Measure task completion rates

- [ ] **Gather Stakeholder Feedback**
  - Present to business stakeholders
  - Collect merchant feedback
  - Incorporate rider suggestions

## Launch Readiness Checklist

### 1. Documentation

- [ ] **Create AI Feature Documentation**
  - Document user-facing AI features
  - Create technical documentation
  - Prepare training materials

- [ ] **Document Model Specifications**
  - Document model architectures
  - Create data dictionaries
  - Document performance characteristics

- [ ] **Prepare Operational Runbooks**
  - Create incident response procedures
  - Document troubleshooting guides
  - Prepare scaling guidelines

### 2. Monitoring Setup

- [ ] **Configure AI Performance Dashboards**
  ```bash
  # Example dashboard setup
  kubectl apply -f monitoring/dashboards/ai-performance.yaml
  ```
  - Set up real-time monitoring
  - Configure historical analytics
  - Create executive dashboards

- [ ] **Set Up Alerting**
  ```bash
  # Example alert configuration
  kubectl apply -f monitoring/alerts/ai-alerts.yaml
  ```
  - Configure accuracy degradation alerts
  - Set up performance threshold alerts
  - Implement on-call rotation

- [ ] **Implement Feedback Loops**
  - Set up user feedback collection
  - Configure automated retraining triggers
  - Implement A/B test analysis

### 3. Rollout Strategy

- [ ] **Create Phased Rollout Plan**
  - Define rollout phases
  - Set success criteria for each phase
  - Prepare contingency plans

- [ ] **Configure Feature Flags**
  ```bash
  # Example feature flag setup
  kubectl apply -f config/feature-flags.yaml
  ```
  - Set up gradual feature enablement
  - Configure kill switches
  - Implement percentage-based rollouts

- [ ] **Prepare Communication Plan**
  - Create user communication templates
  - Prepare merchant training materials
  - Draft rider onboarding guides

## Implementation Notes

- Prioritize offline functionality for Cameroon's connectivity challenges
- Ensure AI models are optimized for low-end devices common in the market
- Implement progressive loading and graceful degradation for better user experience
- Use the Cameroon flag colors (green, red, yellow) consistently in visualizations and UI
- Ensure all AI features have clear fallback mechanisms for when AI services are unavailable
# Implementation Timeline

This section outlines the phased implementation approach for the Okada AI-native platform, spanning 8 months divided into four distinct phases. Each phase builds upon the previous one, allowing for incremental development, testing, and refinement.

## Phase 1: Foundation (Months 1-2)

The Foundation phase focuses on establishing the core infrastructure, development environments, and basic functionality across all platform components.

### Month 1: Infrastructure and Core Setup

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | Development Environment | - Development workstation setup<br>- Version control repository<br>- CI/CD pipeline configuration<br>- Cloud infrastructure provisioning |
| 2 | Backend Foundation | - API gateway implementation<br>- Authentication service<br>- Database schema design<br>- Basic API endpoints |
| 3 | Mobile App Foundation | - Flutter project setup for customer and rider apps<br>- Core UI components<br>- Navigation structure<br>- Theme implementation |
| 4 | Merchant Platform Foundation | - Next.js project setup<br>- Core UI components<br>- Authentication flow<br>- Basic dashboard structure |

### Month 2: Basic Functionality and AI Infrastructure

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | AI Infrastructure | - AI Brain architecture setup<br>- Data pipeline foundation<br>- Model training environment<br>- Basic model deployment pipeline |
| 2 | Customer App Basic Features | - Product browsing<br>- Cart functionality<br>- User profile<br>- Basic checkout flow |
| 3 | Rider App Basic Features | - Authentication flow<br>- Order acceptance<br>- Basic navigation<br>- Earnings tracking |
| 4 | Merchant Platform Basic Features | - Inventory management<br>- Order processing<br>- Basic analytics<br>- Staff management |

## Phase 2: MVP (Months 3-4)

The MVP phase focuses on implementing essential features with basic AI capabilities, creating a minimum viable product that can be tested with real users.

### Month 3: Core Features and Basic AI Integration

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | AI Model Development | - Product recommendation model<br>- Demand forecasting model<br>- Route optimization model<br>- Basic model training |
| 2 | Customer App AI Integration | - Basic product recommendations<br>- Search functionality<br>- Order tracking<br>- Payment integration |
| 3 | Rider App AI Integration | - Basic route optimization<br>- Order prioritization<br>- Offline map support<br>- Delivery confirmation |
| 4 | Merchant Platform AI Integration | - Basic demand forecasting<br>- Inventory alerts<br>- Performance dashboards<br>- Order management workflow |

### Month 4: MVP Refinement and Testing

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | Backend Services Completion | - Notification service<br>- Payment processing<br>- Analytics service<br>- API optimization |
| 2 | Integration Testing | - End-to-end testing<br>- Performance testing<br>- Security testing<br>- Bug fixing |
| 3 | Offline Functionality | - Customer app offline mode<br>- Rider app offline navigation<br>- Data synchronization<br>- Offline AI inference |
| 4 | MVP Preparation | - Final MVP testing<br>- Deployment preparation<br>- Documentation<br>- Internal demo |

## Phase 3: Enhanced Features (Months 5-6)

The Enhanced Features phase focuses on adding advanced AI capabilities and optimizing performance based on initial feedback.

### Month 5: Advanced AI Features

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | Advanced AI Models | - Personalized recommendations<br>- Dynamic pricing model<br>- Staffing optimization model<br>- Enhanced route optimization |
| 2 | Customer App Enhancements | - Personalized home screen<br>- Voice search<br>- Smart reordering<br>- Enhanced product discovery |
| 3 | Rider App Enhancements | - Predictive earnings<br>- Smart scheduling<br>- Enhanced navigation<br>- Performance optimization |
| 4 | Merchant Platform Enhancements | - Advanced inventory optimization<br>- Dynamic pricing tools<br>- Staffing recommendations<br>- Enhanced analytics |

### Month 6: Performance Optimization and Localization

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | Performance Optimization | - App size reduction<br>- API response optimization<br>- Battery usage optimization<br>- Memory usage optimization |
| 2 | Localization | - French language support<br>- Cultural adaptations<br>- Regional pricing<br>- Local payment methods |
| 3 | A/B Testing Framework | - Experiment infrastructure<br>- User segmentation<br>- Metrics collection<br>- Analysis dashboard |
| 4 | Enhanced Testing | - Cameroon-specific device testing<br>- Network resilience testing<br>- Security audit<br>- Accessibility testing |

## Phase 4: Market Expansion (Months 7-8)

The Market Expansion phase focuses on scaling the platform and refining AI models with real-world data from initial operations.

### Month 7: Scaling and Monitoring

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | Infrastructure Scaling | - Database scaling<br>- API service scaling<br>- CDN optimization<br>- Monitoring enhancements |
| 2 | AI Model Refinement | - Model retraining with real data<br>- Model optimization<br>- New feature development<br>- Accuracy improvements |
| 3 | Analytics Enhancement | - Business intelligence dashboard<br>- Custom reporting<br>- Data visualization<br>- Predictive analytics |
| 4 | Merchant Tools Expansion | - Bulk operations<br>- Advanced reporting<br>- Integration capabilities<br>- Marketing tools |

### Month 8: Launch Preparation and Future Planning

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| 1 | Final Testing | - End-to-end testing<br>- Performance validation<br>- Security validation<br>- Disaster recovery testing |
| 2 | Documentation | - User documentation<br>- Technical documentation<br>- API documentation<br>- Training materials |
| 3 | Launch Preparation | - Marketing materials<br>- Support infrastructure<br>- Launch plan<br>- Rollout strategy |
| 4 | Future Planning | - Feature roadmap<br>- Scaling plan<br>- AI enhancement plan<br>- Market expansion strategy |

## Critical Path Dependencies

The implementation timeline includes several critical path dependencies that must be managed carefully:

1. **AI Infrastructure**: The AI Brain must be operational before AI features can be integrated into the apps.

2. **Backend Services**: Core backend services must be functional before the apps can implement features that depend on them.

3. **Data Collection**: Initial data collection is necessary for training AI models, which may require synthetic data or partnerships for the first iterations.

4. **Testing in Cameroon**: Real-world testing in Cameroon is essential for validating performance under actual conditions.

## Milestone Review Points

The implementation plan includes formal milestone reviews at the end of each phase:

1. **Foundation Review** (End of Month 2): Validate that the core infrastructure and basic functionality are in place.

2. **MVP Review** (End of Month 4): Evaluate the MVP's readiness for limited user testing.

3. **Enhanced Features Review** (End of Month 6): Assess the platform's performance and AI capabilities.

4. **Launch Readiness Review** (End of Month 8): Determine if the platform is ready for full market launch.

These milestone reviews provide opportunities to adjust the plan based on progress, feedback, and changing requirements.
# Resource Allocation

This section outlines the recommended resource allocation for the Okada AI-native platform implementation, including team structure, skill requirements, hardware and software needs, and budget considerations.

## Team Structure

The implementation of the Okada platform requires a cross-functional team with expertise in mobile development, web development, backend services, AI/ML, and domain knowledge of the quick commerce industry and Cameroonian market.

### Core Team Composition

| Role | Quantity | Primary Responsibilities |
|------|----------|--------------------------|
| Project Manager | 1 | Overall project coordination, timeline management, stakeholder communication |
| Technical Lead | 1 | Technical architecture oversight, technology decisions, code quality |
| Flutter Developers | 3 | Customer app and rider app implementation |
| Frontend Developers | 2 | Merchant web platform implementation |
| Backend Developers | 3 | API services, database design, system integration |
| AI/ML Engineers | 2 | AI Brain development, model training, AI feature implementation |
| DevOps Engineer | 1 | CI/CD pipeline, cloud infrastructure, deployment automation |
| QA Engineers | 2 | Testing strategy, test automation, quality assurance |
| UI/UX Designer | 1 | User interface design, user experience, design system |
| **Total Core Team** | **16** | |

### Extended Team (As Needed)

| Role | Quantity | Primary Responsibilities |
|------|----------|--------------------------|
| Data Engineer | 1 | Data pipeline, data processing, data quality |
| Security Specialist | 1 | Security architecture, vulnerability assessment, compliance |
| Localization Specialist | 1 | Translation, cultural adaptation, regional requirements |
| Business Analyst | 1 | Market research, requirements gathering, business process modeling |
| **Total Extended Team** | **4** | |

### Team Structure by Phase

The team composition will evolve throughout the project phases:

#### Phase 1: Foundation (Months 1-2)
- Full engagement of Technical Lead, DevOps, Backend Developers
- Partial engagement of Flutter and Frontend Developers
- Initial involvement of AI/ML Engineers for infrastructure setup

#### Phase 2: MVP (Months 3-4)
- Full engagement of all core team members
- Increased focus on Flutter and Frontend Developers
- Active involvement of QA Engineers for testing

#### Phase 3: Enhanced Features (Months 5-6)
- Continued full engagement of core team
- Increased focus on AI/ML Engineers for advanced features
- Addition of Localization Specialist

#### Phase 4: Market Expansion (Months 7-8)
- Transition to maintenance mode for some developers
- Increased focus on QA, DevOps for scaling
- Addition of Business Analyst for market expansion planning

## Skill Requirements

### Technical Skills

| Area | Required Skills |
|------|----------------|
| Mobile Development | - Flutter & Dart proficiency<br>- Mobile app architecture<br>- State management (BLoC pattern)<br>- Offline-first development<br>- Performance optimization<br>- Native module integration |
| Web Development | - Next.js & React proficiency<br>- TypeScript<br>- Responsive design<br>- State management<br>- Web performance optimization<br>- Progressive Web App development |
| Backend Development | - Node.js & Express<br>- RESTful API design<br>- Database design (SQL & NoSQL)<br>- Authentication & authorization<br>- Microservices architecture<br>- API security |
| AI/ML | - TensorFlow/PyTorch<br>- Model training & optimization<br>- TFLite for mobile deployment<br>- Recommendation systems<br>- Forecasting algorithms<br>- Route optimization |
| DevOps | - AWS/Cloud infrastructure<br>- CI/CD pipelines<br>- Docker & Kubernetes<br>- Infrastructure as Code<br>- Monitoring & logging<br>- Performance testing |
| QA | - Test automation<br>- Performance testing<br>- Security testing<br>- Mobile app testing<br>- API testing<br>- Accessibility testing |

### Domain Knowledge

| Area | Required Knowledge |
|------|-------------------|
| Quick Commerce | - E-commerce operations<br>- Inventory management<br>- Last-mile delivery<br>- Dark store operations<br>- Order fulfillment processes |
| Cameroon Market | - Local consumer behavior<br>- Payment systems (Mobile Money)<br>- Infrastructure challenges<br>- Regulatory requirements<br>- Cultural considerations |
| Languages | - English proficiency<br>- French proficiency (for localization) |

## Hardware Requirements

### Development Hardware

| Item | Specifications | Quantity | Purpose |
|------|---------------|----------|---------|
| Developer Workstations | - 16GB+ RAM<br>- 6+ core CPU<br>- SSD storage<br>- Modern GPU | 16 | Primary development machines |
| Mobile Test Devices (Android) | - Range of devices from entry-level to high-end<br>- Various screen sizes<br>- Different Android versions (6.0+) | 10-15 | Testing on actual devices common in Cameroon |
| Mobile Test Devices (iOS) | - iPhone SE (2020)<br>- iPhone 11 or newer | 2-3 | Testing on iOS devices (secondary market) |
| Tablets | - Entry-level Android tablets<br>- iPad (for merchant app testing) | 2-3 | Testing tablet interfaces for merchant app |

### Server Hardware (Cloud-Based)

| Environment | Specifications | Purpose |
|-------------|---------------|---------|
| Development | - Small instances (t3.medium)<br>- Minimal database capacity<br>- Basic monitoring | Development and testing |
| Staging | - Medium instances (t3.large)<br>- Moderate database capacity<br>- Full monitoring setup | Pre-production testing |
| Production | - Auto-scaling compute (t3.large to c5.2xlarge)<br>- Optimized database instances<br>- Redundant storage<br>- CDN integration<br>- Full monitoring and alerting | Live production environment |
| AI Training | - GPU instances (p3.2xlarge)<br>- High memory instances<br>- Optimized storage for datasets | Model training and optimization |

## Software Requirements

### Development Tools

| Category | Tools |
|----------|-------|
| IDEs & Editors | - Visual Studio Code<br>- Android Studio<br>- Xcode (for iOS builds) |
| Version Control | - Git<br>- GitHub or GitLab |
| CI/CD | - GitHub Actions<br>- Jenkins<br>- CircleCI |
| Project Management | - Jira<br>- Confluence<br>- Slack or Microsoft Teams |
| Design | - Figma<br>- Adobe XD<br>- Sketch |

### Development SDKs & Frameworks

| Category | Tools |
|----------|-------|
| Mobile | - Flutter SDK<br>- Android SDK<br>- iOS SDK (for builds) |
| Web | - Node.js<br>- Next.js<br>- React |
| Backend | - Node.js<br>- Express.js<br>- NestJS |
| AI/ML | - TensorFlow<br>- PyTorch<br>- TensorFlow Lite<br>- Scikit-learn |
| Database | - PostgreSQL<br>- MongoDB<br>- Redis |

### Cloud Services

| Category | Services |
|----------|----------|
| Compute | - AWS EC2<br>- AWS Lambda |
| Database | - AWS RDS (PostgreSQL)<br>- MongoDB Atlas<br>- Amazon ElastiCache (Redis) |
| Storage | - AWS S3<br>- AWS EBS |
| CDN | - AWS CloudFront |
| AI/ML | - AWS SageMaker<br>- TensorFlow Serving |
| Monitoring | - AWS CloudWatch<br>- Datadog<br>- New Relic |

## Budget Considerations

The following budget considerations are provided as guidelines and should be adjusted based on specific project requirements and regional cost variations.

### Development Costs

| Category | Estimated Cost Range (USD) | Notes |
|----------|----------------------------|-------|
| Core Team Salaries | $40,000 - $60,000 per month | Based on 16-person team with varying skill levels |
| Extended Team Salaries | $10,000 - $15,000 per month | Based on specialists engaged as needed |
| Development Hardware | $30,000 - $50,000 initial | One-time cost for workstations and test devices |
| Software Licenses | $2,000 - $5,000 per month | Development tools, services, and subscriptions |
| Cloud Infrastructure | $3,000 - $8,000 per month | Development and staging environments |

### Production Costs

| Category | Estimated Cost Range (USD) | Notes |
|----------|----------------------------|-------|
| Cloud Infrastructure | $5,000 - $15,000 per month | Production environment with scaling based on usage |
| AI Training | $2,000 - $5,000 per month | GPU instances for model training and optimization |
| CDN & Data Transfer | $1,000 - $3,000 per month | Content delivery and data transfer costs |
| Monitoring & Security | $1,000 - $2,000 per month | Monitoring tools, security services, and compliance |
| Third-Party Services | $2,000 - $5,000 per month | Maps API, payment processing, SMS, etc. |

### Cost Optimization Strategies

1. **Serverless Architecture**: Utilize serverless computing where appropriate to reduce infrastructure costs.

2. **Reserved Instances**: Purchase reserved instances for predictable workloads to reduce cloud costs.

3. **Spot Instances**: Use spot instances for AI training to reduce costs during non-critical training periods.

4. **CDN Optimization**: Implement aggressive caching strategies to reduce data transfer costs.

5. **Local Development**: Maximize local development and testing to reduce cloud resource usage during development.

6. **Phased Hiring**: Align team growth with project phases to optimize personnel costs.

7. **Open Source Tools**: Prioritize open-source tools and frameworks to reduce licensing costs.

8. **Edge Computing**: Implement edge computing strategies to reduce data transfer and improve performance.

## Resource Scaling Plan

As the Okada platform grows, resources should be scaled according to the following guidelines:

### Team Scaling

1. **Initial Launch**: Maintain the core team for stabilization and bug fixing.

2. **User Growth (0-10K)**: Add customer support personnel and QA resources.

3. **User Growth (10K-50K)**: Expand the backend team for infrastructure scaling and the AI team for model refinement.

4. **User Growth (50K+)**: Add specialized roles for optimization, security, and business intelligence.

### Infrastructure Scaling

1. **Initial Launch**: Deploy with moderate capacity and auto-scaling configured.

2. **User Growth (0-10K)**: Scale API services and database read replicas.

3. **User Growth (10K-50K)**: Implement database sharding, enhanced caching, and CDN optimization.

4. **User Growth (50K+)**: Deploy to multiple regions, implement advanced load balancing, and optimize for global scale.

This resource allocation plan provides a comprehensive framework for implementing the Okada AI-native platform, ensuring that the right people, tools, and infrastructure are available at each stage of the project.
