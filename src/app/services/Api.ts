import axios from "axios";
import { DB_TOKEN, DB_LOGGED_IN_PROFILE, API_URL } from "../../Constants";
import Utils from "./Utils";
import ToastService from "./ToastService";

// Create an axios instance with default configuration
const api = axios.create({
  // baseURL: "https://fabricare.hambren.com/api", // Backend API base URL
  baseURL: API_URL, // Backend API base URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Function to handle user registration
export async function register(email: string, password: string, additionalData?: Record<string, any>) {
  const registerData = { 
    username: email, 
    password,
    email,
    ...additionalData 
  };
  return handleAuth("users/register", registerData);
}

// Function to handle user login
export async function login(email: string, password: string) {
  return handleAuth("users/login", { username: email, password });
}

// Function to request password reset
export async function requestPasswordReset(email: string) {
  try {
    console.log('🔐 Requesting password reset for:', email);
    
    const resp = await http_post('users/login', {
      username: email,
      task: 'request_password_reset'
    });
    
    console.log('🔐 Password reset request response:', resp);
    
    if (resp.code !== 1) {
      console.error('❌ Password reset request failed:', resp);
      throw new Error(resp.message || "Failed to send password reset email");
    }
    
    console.log('✅ Password reset email sent successfully');
    return resp;
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    throw new Error(`Password reset request failed: ${error}`);
  }
}

// Function to reset password with code
export async function resetPassword(email: string, code: string, newPassword: string) {
  try {
    console.log('🔐 Resetting password for:', email);
    
    const resp = await http_post('users/login', {
      email,
      code,
      password: newPassword,
      task: 'reset_password'
    });
    
    console.log('🔐 Password reset response:', resp);
    
    if (resp.code !== 1) {
      console.error('❌ Password reset failed:', resp);
      throw new Error(resp.message || "Failed to reset password");
    }
    
    console.log('✅ Password reset successfully');
    return resp;
  } catch (error) {
    console.error('❌ Password reset error:', error);
    throw new Error(`Password reset failed: ${error}`);
  }
}

// Common function to handle authentication
async function handleAuth(path: string, params: Record<string, any>) {
  try {
    console.log(`🔐 Attempting ${path} with params:`, { username: params.username, password: '[HIDDEN]' });
    
    const resp = await http_post(path, params);
    console.log('🔐 Auth response received:', resp);
    
    // Check if response is successful
    if (resp.code !== 1) {
      console.error('❌ Auth failed with response:', resp);
      throw new Error(resp.message || "Authentication failed");
    }
    
    console.log('✅ Auth successful, saving user data...');
    saveUserData(resp.data);
    return resp;
  } catch (error) {
    console.error('❌ Auth error:', error);
    throw new Error(`${path.split("/").pop()} failed: ${error}`);
  }
}

// Save user data to local storage
interface UserResponse {
  remember_token?: string;
  token?: string;
  access_token?: string;
  [key: string]: any;
}

function saveUserData(resp: UserResponse) {
  // Try different token field names that might be returned by the API
  const token = resp.remember_token || resp.token || resp.access_token;
  
  console.log('Attempting to save user data:', resp);
  console.log('Token found:', token ? `${token.substring(0, 10)}...` : 'NO TOKEN');
  
  if (!token || token.length <= 5) {
    console.error('Invalid or missing token in response:', resp);
    throw new Error("No authentication token received from server");
  }
  
  try {
    Utils.saveToDatabase(DB_TOKEN, token);
    Utils.saveToDatabase(DB_LOGGED_IN_PROFILE, resp);
    console.log('✅ User data saved successfully');
  } catch (error) {
    console.error('❌ Failed to save user data:', error);
    throw new Error("Failed to save data to local storage: " + error);
  }
}

// Add an interceptor for request authorization
api.interceptors.request.use(
  (config) => {
    const token = Utils.loadFromDatabase(DB_TOKEN);
    const u = Utils.loadFromDatabase(DB_LOGGED_IN_PROFILE);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (u && u.id) {
      // Add all user identification headers like Dart implementation
      config.headers['User-Id'] = u.id.toString();
      config.headers['HTTP_USER_ID'] = u.id.toString();
      config.headers['user_id'] = u.id.toString();
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    
    // Handle Unauthenticated like Dart implementation
    if (error.response?.data?.message === 'Unauthenticated') {
      ToastService.error("You are not logged in.");
      // Utils.logout(); // Uncomment when logout function is available
      return Promise.reject(error);
    }
    
    // Show appropriate toast based on error type
    if (!error.response) {
      // Network error
      ToastService.networkError();
    } else if (error.response.status >= 500) {
      // Server error
      ToastService.serverError();
    } else if (error.response.status === 401) {
      // Unauthorized - could handle logout here
      ToastService.error("Session expired. Please login again.");
    }
    
    return Promise.reject(error);
  }
);

// Function to make a POST request
export const http_post = async (path: string, params: Record<string, any>) => {
  try {
    const u = Utils.loadFromDatabase(DB_LOGGED_IN_PROFILE);
    
    console.log(`📡 POST ${path}:`, { 
      hasUser: !!u, 
      userId: u?.id,
      params: Object.keys(params)
    });
    
    // Add user identification to body parameters like Dart implementation
    if (u && u.id) {
      params.user = u.id.toString();
      params['User-Id'] = u.id.toString();
      params.user_id = u.id.toString();
    }
    
    // Use FormData like Dart implementation for consistency
    const formData = new FormData();
    Object.keys(params).forEach(key => {
      formData.append(key, params[key]);
    });
    
    const response = await api.post(path, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });
    
    console.log(`✅ POST ${path} response:`, response.status, response.statusText);
    return handleResponse(response);
  } catch (error) {
    console.error(`❌ POST ${path} failed:`, error);
    return {
      code: 0,
      message: "Failed because " + (error as Error).message,
      data: null
    };
  }
};

// Function to make a GET request
export const http_get = async (path: string, params?: Record<string, any>) => {
  try {
    const u = Utils.loadFromDatabase(DB_LOGGED_IN_PROFILE);
    
    if (!params) params = {};
    
    // Add user identification to query parameters like Dart implementation
    if (u && u.id) {
      params.user = u.id.toString();
      params['User-Id'] = u.id.toString();
      params.user_id = u.id.toString();
    }

    const response = await api.get(path, { params });
    return handleResponse(response);
  } catch (error) {
    console.error("GET request failed:", error);
    return {
      code: 0,
      message: "GET request failed: " + error,
      data: null
    };
  }
};

// Handle API response - updated to match Dart RespondModel behavior
function handleResponse(response: any) {
  if (!response) {
    return {
      code: 0,
      message: "Failed to connect to internet. Check your connection and try again",
      data: null
    };
  }
  
  let { data } = response;
  if (!data) {
    return {
      code: 0,
      message: "Failed to fetch data because data is null",
      data: null
    };
  }
  
  // Handle different response formats
  let resp = data;
  
  // If data is a string, try to parse it as JSON
  if (typeof data === 'string') {
    try {
      resp = JSON.parse(data);
    } catch (e) {
      resp = { code: 0, message: data.toString(), data: null };
    }
  }
  
  // Handle Unauthenticated like Dart implementation
  if (resp.message === 'Unauthenticated') {
    ToastService.error("You are not logged in.");
    // Utils.logout(); // Uncomment when logout function is available
    return {
      code: 0,
      message: "You are not logged in.",
      data: null
    };
  }
  
  // Return the response in the same format as Dart
  const result = {
    code: parseInt(resp.code || resp.status || '0', 10),
    message: resp.message || "Request completed",
    data: resp.data || resp
  };
  
  return result;
}

export default api;
