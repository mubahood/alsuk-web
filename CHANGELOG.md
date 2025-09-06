# AL-SUK Web App Changelog

## Version 1.0.8 (September 6, 2025)

### 🔧 Bug Fixes
- **CORS Issues**: Fixed cross-origin resource sharing problems with backend API
  - Updated Laravel `config/cors.php` to allow all origins
  - Modified custom CORS middleware to be more permissive
  - Changed API URL from HTTP to HTTPS (app.alsukssd.com)

### ✨ Improvements
- **Currency Consistency**: Ensured web app currency matches mobile app
  - All currency values now consistently use "UGX" (Ugandan Shilling)
  - Replaced hardcoded currency values with constants
  - Updated payment formatting across the application
  - Fixed inconsistent currency symbols

### 📁 Files Changed
- `src/Constants.ts` - Updated BASE_URL to use HTTPS
- `src/app/services/ApiService.ts` - Fixed hardcoded IQD currency to UGX
- `src/app/pages/PaymentPage.tsx` - Updated to use CURRENCY constant
- `src/app/pages/account/MyShop.tsx` - Fixed currency formatting
- `src/app/services/PesapalService.ts` - Updated default currency parameter
- Backend CORS configuration updated for production compatibility

### 🚀 Deployment
- New build generated in `dist/` folder
- Ready for cPanel deployment
- Backend API updated to support cross-origin requests
- All API calls now use HTTPS endpoints

### 🔄 Breaking Changes
None - This is a patch release with bug fixes and improvements only.

---

## Version 1.0.7 (Previous)
- Base functionality
- E-commerce features
- Payment integration
- Product management
