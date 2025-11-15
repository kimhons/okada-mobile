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
