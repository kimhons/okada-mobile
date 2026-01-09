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
