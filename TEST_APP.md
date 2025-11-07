# Testing FinMate App - Black Screen Troubleshooting

## Issue
The Android emulator shows a black screen when running the app.

## Possible Causes & Solutions

### 1. **Metro Bundler Not Connected**
**Check**: Is Metro bundler running and showing logs?
```bash
# You should see:
› Metro waiting on exp://...
› Press a │ open Android
```

**Solution**: 
- Make sure Metro is running: `npm start`
- Press `a` in the terminal to open Android
- OR scan QR code with Expo Go app

### 2. **Expo Go Not Installed**
**Check**: Is Expo Go installed in the emulator?

**Solution**:
```bash
# In the emulator, open Play Store
# Search for "Expo Go"
# Install it
# Then press 'a' in terminal again
```

### 3. **Database Initialization Error**
**Check logs for**:
```
❌ App initialization error
❌ Error loading data
```

**Solution**: Clear app data
- In emulator: Settings → Apps → Expo Go → Clear Data
- Restart: `npm start -- --clear`

### 4. **SafeAreaProvider Issue**
**Fixed in latest code** - Added SafeAreaProvider wrapper to SplashScreen

### 5. **Network Connection**
**Check**: Emulator and computer on same network

**Solution**:
- Use `localhost` instead of IP
- Or use tunnel: `npm start -- --tunnel`

## Manual Testing Steps

### Step 1: Verify Metro is Running
```bash
cd mobile
npm start -- --clear
```

You should see QR code and menu.

### Step 2: Open in Emulator
**Option A**: Press `a` in terminal
**Option B**: In emulator, open Expo Go → Scan QR code

### Step 3: Check Logs
Look for:
```
✅ Database initialized successfully
✅ Mock data seeded successfully
📊 Loading home screen data...
✅ Loaded 5 transactions
```

### Step 4: If Still Black Screen

**Try this minimal test**:
1. Stop Metro (Ctrl+C)
2. Run: `npm start -- --clear --reset-cache`
3. Wait for bundling to complete
4. Press `a` to open Android
5. Wait 30 seconds for initial bundle

### Step 5: Check Emulator Logs
In Android Studio:
- View → Tool Windows → Logcat
- Filter by "ReactNativeJS"
- Look for errors

## Quick Fixes

### Fix 1: Reload App
- Shake emulator (Ctrl+M or Cmd+M)
- Tap "Reload"

### Fix 2: Clear Everything
```bash
# Stop Metro
# Then:
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### Fix 3: Use Tunnel Mode
```bash
npm start -- --tunnel
```
This works better with some network configurations.

## Expected Behavior

When working correctly, you should see:

1. **Splash Screen** (2 seconds)
   - 💰 emoji
   - "FinMate" title
   - "Smart UPI Expense Tracker" subtitle
   - Loading spinner

2. **Home Screen**
   - "Good evening! 👋" greeting
   - Spending summary card (blue/teal)
   - "Add Expense" and "View All" buttons
   - Recent transactions list
   - Stats cards at bottom

## Debug Mode

To see detailed logs:

1. In terminal where Metro is running, press `j` for debugger
2. Open Chrome DevTools
3. Check Console tab for errors
4. Look for:
   - Database errors
   - Navigation errors
   - Component render errors

## Still Not Working?

### Create a Simple Test
Replace App.tsx temporarily with:

```typescript
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>FinMate Test</Text>
      <Text>If you see this, React Native is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

If this works, the issue is in our app code.
If this doesn't work, it's an Expo/emulator issue.

## Common Emulator Issues

### Emulator Too Slow
- Increase RAM in AVD Manager
- Enable hardware acceleration
- Use a newer Android version (API 33+)

### Expo Go Crashes
- Update Expo Go in Play Store
- Clear Expo Go data
- Reinstall Expo Go

### Metro Can't Connect
- Check firewall settings
- Try `--tunnel` mode
- Use USB debugging instead

## Contact Points

If none of this works:
1. Check Expo documentation: https://docs.expo.dev
2. Check React Native docs: https://reactnative.dev
3. Expo Discord: https://chat.expo.dev

---

**Most Common Fix**: Clear cache and restart
```bash
npm start -- --clear
# Press 'a' for Android
# Wait 30-60 seconds for initial bundle
```
