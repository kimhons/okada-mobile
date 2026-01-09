import os
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class ModelConfig:
    """Configuration for AI models"""
    recommendation_model_path: str = "models/recommendation/latest"
    demand_forecast_model_path: str = "models/demand_forecast/latest"
    route_optimization_model_path: str = "models/route_optimization/latest"
    price_optimization_model_path: str = "models/price_optimization/latest"

    batch_size: int = 32
    max_sequence_length: int = 100
    embedding_dim: int = 128

    # Model serving
    serving_port: int = 8501
    grpc_port: int = 8500

    # Feature store
    feast_repo_path: str = "feature_store/"

    # Data paths
    raw_data_path: str = "data/raw"
    processed_data_path: str = "data/processed"
    features_path: str = "data/features"

@dataclass
class CameroonConfig:
    """Cameroon-specific configuration"""
    languages: list = None
    currency: str = "XAF"
    payment_methods: list = None

    # Location bounds for Cameroon
    min_lat: float = 1.65
    max_lat: float = 13.08
    min_lon: float = 8.49
    max_lon: float = 16.19

    # Major cities
    major_cities: list = None

    def __post_init__(self):
        if self.languages is None:
            self.languages = ["en", "fr"]
        if self.payment_methods is None:
            self.payment_methods = ["MTN Mobile Money", "Orange Money", "Cash"]
        if self.major_cities is None:
            self.major_cities = ["Douala", "Yaoundé", "Garoua", "Bamenda", "Maroua"]

@dataclass
class DatabaseConfig:
    """Database configuration"""
    postgres_host: str = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port: int = int(os.getenv("POSTGRES_PORT", 5432))
    postgres_db: str = os.getenv("POSTGRES_DB", "okada_db")
    postgres_user: str = os.getenv("POSTGRES_USER", "okada_user")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "")

    mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    mongodb_db: str = os.getenv("MONGODB_DB", "okada_mongo")

    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = int(os.getenv("REDIS_PORT", 6379))
    redis_db: int = int(os.getenv("REDIS_DB", 0))

class Config:
    """Main configuration class"""
    def __init__(self):
        self.model = ModelConfig()
        self.cameroon = CameroonConfig()
        self.database = DatabaseConfig()
        self.debug = os.getenv("DEBUG", "False").lower() == "true"
        self.environment = os.getenv("ENVIRONMENT", "development")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model": self.model.__dict__,
            "cameroon": self.cameroon.__dict__,
            "database": self.database.__dict__,
            "debug": self.debug,
            "environment": self.environment
        }

config = Config()