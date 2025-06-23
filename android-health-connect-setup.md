# Android Health Connect Setup Guide

## 1. Install the Health Connect Plugin

```bash
npm install capacitor-health-connect
npx cap sync android
```

## 2. Update Android Manifest

Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Health Connect permissions -->
    <uses-permission android:name="android.permission.health.READ_STEPS"/>
    <uses-permission android:name="android.permission.health.WRITE_STEPS"/>
    <uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED"/>
    <uses-permission android:name="android.permission.health.READ_DISTANCE"/>
    <uses-permission android:name="android.permission.health.READ_HEART_RATE"/>
    
    <application>
        <activity
            android:exported="true"
            android:launchMode="singleTask"
            android:name=".MainActivity"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <!-- Health Connect permissions intent filter -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW_PERMISSION_USAGE"/>
                <category android:name="android.intent.category.HEALTH_PERMISSIONS"/>
            </intent-filter>
        </activity>
        
        <!-- Privacy policy activity for Health Connect -->
        <activity 
            android:name="androidx.health.connect.client.PermissionController"
            android:exported="true">
            <intent-filter>
                <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## 3. Update build.gradle

Add to `android/app/build.gradle`:

```gradle
android {
    compileSdk 34
    
    defaultConfig {
        targetSdk 34
        minSdk 26  // Health Connect requires API 26+
    }
}

dependencies {
    implementation 'androidx.health.connect:connect-client:1.1.0-alpha07'
}
```

## 4. Google Play Store Requirements

### For Production Apps:
1. **Complete Health Apps Declaration Form** in Google Play Console (deadline: January 22, 2025)
2. **Implement Privacy Policy** explaining health data usage
3. **App Review**: Health Connect permissions require Google approval (up to 7 days)

### Approved Use Cases:
- Fitness and wellness apps
- Health coaching and fitness training
- Corporate wellness programs
- Medical care applications
- Health research
- Wellness games and rewards

## 5. Testing Health Connect

### Development Testing:
1. Install Health Connect app from Google Play Store (Android 13 and below)
2. Android 14+ has Health Connect built-in
3. Use Android emulator with API 30+ for testing
4. Test permission flows and data access

### Sample Test Data:
```typescript
// Add test steps
await healthConnectService.insertStepCount(5000, new Date());

// Read today's steps
const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
const steps = await healthConnectService.getStepCount(startOfDay, endOfDay);
```

## 6. Migration Timeline

- **Google Fit APIs deprecated**: May 1, 2024
- **Google Fit APIs sunset**: June 30, 2025
- **Health Connect mandatory**: For new health apps after January 2025

## 7. Error Handling

```typescript
try {
  const availability = await healthConnectService.checkAvailability();
  if (!availability.isAvailable) {
    // Fallback to manual entry or Google Fit
    console.log('Health Connect not available:', availability.status);
  }
} catch (error) {
  console.error('Health Connect error:', error);
  // Implement fallback strategy
}
```

## 8. Privacy Policy Requirements

Your app must include a privacy policy that explains:
- What health data is collected
- How the data is used
- Data sharing practices
- User rights regarding their data
- Contact information for privacy questions

## 9. Background Sync (Coming Soon)

Future Health Connect versions will support background data reads for automatic syncing.

## 10. Troubleshooting

### Common Issues:
- **Plugin not found**: Ensure `capacitor-health-connect` is installed
- **Permissions denied**: Check Android manifest and user permissions
- **Data not syncing**: Verify Health Connect app is installed and configured
- **Build errors**: Ensure Android API level 26+ and correct dependencies