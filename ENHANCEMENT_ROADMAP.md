# FinMate Enhancement Roadmap

## ✅ **Completed (Just Now)**
1. ✅ Dynamic month display on HomeScreen
2. ✅ Dynamic greeting based on time of day

---

## 🚀 **Phase 1: Critical Fixes (Priority: HIGH)**

### **Issue #2: Separate Income vs Expense Forms**
- **Status**: Ready to implement
- **Changes**:
  - Modify `AddTransactionScreen` to show different categories for income
  - Income categories: Salary, Freelance, Investment, Gift, Refund, Other
  - Expense categories: Keep existing (Food, Groceries, Transport, etc.)

### **Issue #5: Transaction Detail Screen**
- **Status**: Ready to implement
- **New Screen**: `TransactionDetailScreen.tsx`
- **Features**:
  - Full transaction details
  - Receipt upload section
  - Emoji feedback (😊 😐 😞 😡)
  - Edit/Delete options

### **Issue #6: Add Budget Functionality**
- **Status**: Ready to implement
- **New Screen**: `AddBudgetScreen.tsx`
- **Features**:
  - Category selector
  - Amount input
  - Period selector (Monthly/Weekly/Yearly)
  - Date range picker

---

## 🎨 **Phase 2: Visual Enhancements (Priority: HIGH)**

### **Issue #3: Charts on HomeScreen**
- **Status**: Needs Victory Native setup
- **Charts to Add**:
  1. **Category-wise Pie Chart** - Expense breakdown
  2. **Weekly Line Chart** - Spending trend
- **Library**: `victory-native` + `react-native-svg`

### **Issue #4: Smart Suggestions**
- **Status**: Algorithm ready
- **Features**:
  - Budget adherence feedback
  - Spending pattern analysis
  - Motivational messages
  - Warnings for overspending

### **Issue #7: Suggested Budget Plan**
- **Status**: Algorithm ready
- **Rules**:
  - 50/30/20 rule (Needs 50%, Wants 30%, Savings 20%)
  - Based on last 3 months average
  - Category-wise recommendations

---

## 🔧 **Phase 3: Profile & Settings (Priority: MEDIUM)**

### **Issue #8-10: Profile Screen Functionality**
- **Screens to Create**:
  - `EditProfileScreen.tsx`
  - `BankAccountsScreen.tsx`
  - `CategoriesManagementScreen.tsx`
  - `NotificationSettingsScreen.tsx`
  - `CurrencySelectionScreen.tsx`

### **Issue #11: Export Data**
- **Status**: Ready to implement
- **Formats**: CSV, PDF
- **Options**:
  - Expense statements
  - Budget reports
  - Weekly/Monthly summaries

### **Issue #12: Import Transactions (CSV)**
- **Status**: Ready to implement
- **Features**:
  - CSV file picker
  - Auto-categorization
  - Preview before import
  - Duplicate detection

### **Issue #13: Clear All Data**
- **Status**: Ready to implement
- **Features**:
  - Confirmation dialog
  - Option to backup before clear
  - Reset to initial state

---

## 🔐 **Phase 4: Authentication Flow (Priority: HIGH)**

### **Issue #15-19: Complete Auth System**

**New Screens**:
1. **LandingScreen.tsx** - App intro with animated logo
2. **PermissionsScreen.tsx** - Request SMS, Notifications, Storage
3. **LoginScreen.tsx** - Login options
4. **SignupScreen.tsx** - Registration
5. **OnboardingScreen.tsx** - First-time user tutorial

**Auth Methods**:
- Google Sign-In
- Email/Password
- Phone Number (OTP)
- Guest Mode

**Session Management**:
- AsyncStorage for token persistence
- Auto-login on app restart
- Logout clears session
- Protected routes

**User Flow**:
```
First Time User:
Landing → Permissions → Signup → Onboarding → Home

Returning User:
Auto-login → Home

After Logout:
Login → Home
```

---

## 📊 **Implementation Priority**

### **Week 1: Critical Features**
- [x] Dynamic month/greeting
- [ ] Transaction Detail Screen
- [ ] Add Budget Screen
- [ ] Separate Income/Expense forms

### **Week 2: Visual Enhancements**
- [ ] Install Victory Native
- [ ] Category-wise pie chart
- [ ] Weekly spending line chart
- [ ] Smart suggestions algorithm

### **Week 3: Profile & Settings**
- [ ] Make all profile buttons functional
- [ ] Bank accounts management
- [ ] Categories management
- [ ] Export/Import data

### **Week 4: Authentication**
- [ ] Landing & Permissions screens
- [ ] Login/Signup screens
- [ ] Session management
- [ ] Protected navigation

---

## 🛠️ **Technical Requirements**

### **New Dependencies Needed**:
```json
{
  "victory-native": "^36.x",
  "react-native-svg": "^13.x",
  "react-native-document-picker": "^9.x",
  "react-native-fs": "^2.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "@react-native-google-signin/google-signin": "^10.x",
  "react-native-permissions": "^3.x"
}
```

### **Database Schema Updates**:
```sql
-- Add users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT,
  authProvider TEXT,
  createdAt TEXT
);

-- Add receipts table
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  transactionId TEXT,
  imageUri TEXT,
  uploadedAt TEXT,
  FOREIGN KEY (transactionId) REFERENCES transactions(id)
);

-- Add feedback table
CREATE TABLE transaction_feedback (
  id TEXT PRIMARY KEY,
  transactionId TEXT,
  emoji TEXT,
  createdAt TEXT,
  FOREIGN KEY (transactionId) REFERENCES transactions(id)
);
```

---

## 📝 **Notes**

- All features will maintain the existing design system
- Dynamic updates across all screens
- Proper error handling and loading states
- Offline-first approach
- Data persistence in SQLite

---

## 🎯 **Current Status**

**Completed**: 2/19 issues
**In Progress**: 0/19 issues
**Pending**: 17/19 issues

**Next Up**: Transaction Detail Screen + Add Budget Screen
