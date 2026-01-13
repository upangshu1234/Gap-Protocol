import { ModelMetrics } from './types';

// Based on the OCR text provided
export const RESEARCH_METRICS: ModelMetrics[] = [
  {
    name: "Random Forest Classifier",
    accuracy: 1.00,
    precision: 1.00,
    recall: 1.00,
    f1: 1.00
  },
  {
    name: "Support Vector Machine (RBF)",
    accuracy: 0.93,
    precision: 0.94, // Weighted avg from OCR
    recall: 0.98,    // Weighted avg from OCR
    f1: 0.96         // Weighted avg from OCR
  },
  {
    name: "Logistic Regression",
    accuracy: 0.905,
    precision: 0.90,
    recall: 0.91,
    f1: 0.90
  }
];

export const FEATURE_IMPORTANCE_DATA = [
  { name: 'Social Media Usage', value: 0.43, fill: '#3b82f6' },
  { name: 'Gaming Usage', value: 0.25, fill: '#6366f1' },
  { name: 'Daily Screen Time', value: 0.21, fill: '#8b5cf6' },
  { name: 'Productivity Usage', value: 0.03, fill: '#10b981' },
  { name: 'Total App Usage', value: 0.02, fill: '#f59e0b' },
  { name: 'Number of Apps', value: 0.02, fill: '#ef4444' },
];

export const LOCATIONS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];