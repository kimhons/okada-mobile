# Okada Platform Subagents

This directory contains specialized AI subagents designed to efficiently build the Okada AI-native quick commerce platform for Cameroon. Each subagent has specific expertise, clear responsibilities, and the necessary tools to complete their tasks.

## Overview

The Okada platform is an AI-native quick commerce solution designed specifically for the Cameroonian market. It consists of:

1. A customer mobile application for browsing products and placing orders
2. A rider mobile application for delivery partners
3. A merchant web platform for dark store management
4. A central AI Brain that powers intelligence across all components
5. A robust backend infrastructure with microservices architecture

These subagents are designed to work in parallel to efficiently build all components of the platform.

## Subagent Structure

Each subagent is defined in a Markdown file with YAML frontmatter that specifies:

- `name`: Unique identifier for the subagent
- `description`: Description of when this subagent should be invoked
- `tools`: Specific tools the subagent is allowed to use
- `model`: The AI model to use for this subagent (opus for complex tasks)

## Available Subagents

### Core Development Subagents

1. **AI Brain Architect** (`ai_brain_architect.md`)
   - Designs and implements the central AI intelligence system
   - Develops recommendation algorithms, demand forecasting, route optimization
   - Creates on-device AI capabilities for offline functionality

2. **Backend Engineer** (`backend_engineer.md`)
   - Develops microservices architecture for the backend
   - Implements API gateway and service communication
   - Creates authentication, order processing, and payment integration

3. **Flutter Mobile Expert** (`flutter_mobile_expert.md`)
   - Develops the customer and rider mobile applications
   - Implements offline functionality and synchronization
   - Optimizes for low-end devices and intermittent connectivity

4. **Web Platform Developer** (`web_platform_developer.md`)
   - Develops the merchant web platform using Next.js
   - Creates responsive dashboard and analytics interfaces
   - Implements inventory management and order processing workflows

5. **Database Architect** (`database_architect.md`)
   - Designs database schemas for all services
   - Implements data migration strategies
   - Develops data synchronization mechanisms for offline functionality

### Infrastructure and Integration Subagents

6. **DevOps Engineer** (`devops_engineer.md`)
   - Sets up cloud infrastructure on AWS (Africa region)
   - Implements CI/CD pipelines for automated testing and deployment
   - Configures monitoring, logging, and alerting systems

7. **Integration Specialist** (`integration_specialist.md`)
   - Ensures seamless communication between all components
   - Implements event-driven architecture for real-time updates
   - Creates integration tests for end-to-end workflows

8. **QA & Testing Engineer** (`qa_testing_engineer.md`)
   - Develops comprehensive testing strategy
   - Implements automated tests for all components
   - Performs performance testing under various network conditions

9. **Project Coordinator** (`project_coordinator.md`)
   - Manages project timelines and milestones
   - Coordinates between specialized teams and subagents
   - Ensures alignment with business goals and requirements

## Using the Subagents

To use these subagents effectively:

1. **Understand the Project**: Review the project requirements and architecture
2. **Select the Appropriate Subagent**: Choose the subagent with the expertise needed for your current task
3. **Provide Context**: Give the subagent sufficient context about the current state of the project
4. **Review and Integrate**: Review the subagent's output and integrate it with the rest of the project

## Collaboration Strategy

The subagents collaborate through:

1. **Shared API Contracts**: Clear definitions of how components interact
2. **Regular Integration Points**: Scheduled checkpoints to ensure components work together
3. **Dependency Management**: Clear identification of dependencies between components
4. **Parallel Development**: Independent work streams with minimal blocking dependencies
5. **Continuous Integration**: Automated testing to catch integration issues early

## Development Timeline

The development follows a phased approach:

1. **Foundation Phase (Months 1-2)**
   - Set up development environments
   - Implement core infrastructure
   - Develop initial API contracts
   - Create basic functionality for all components

2. **MVP Phase (Months 3-4)**
   - Implement essential features for all components
   - Develop basic AI capabilities
   - Create offline functionality
   - Integrate with payment providers

3. **Enhanced Features Phase (Months 5-6)**
   - Implement advanced AI features
   - Optimize performance for target devices
   - Add localization and cultural adaptations
   - Enhance user experience across all applications

4. **Market Expansion Phase (Months 7-8)**
   - Scale infrastructure for growth
   - Refine AI models with real-world data
   - Implement analytics and business intelligence
   - Prepare for geographic expansion
