from setuptools import setup, find_packages

setup(
    name="okada-ai-brain",
    version="1.0.0",
    description="AI Brain for Okada Platform - Cameroon Quick Commerce",
    author="Okada Team",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "tensorflow>=2.15.0",
        "numpy>=1.24.3",
        "pandas>=2.1.1",
        "scikit-learn>=1.3.1",
        "redis>=5.0.1",
        "flask>=3.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "pytest-cov>=4.1.0",
            "black>=23.10.1",
            "flake8>=6.1.0",
            "mypy>=1.6.1",
            "jupyter>=1.0.0",
        ]
    }
)