package com.Blinkbuddy.usage

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.*

import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import java.io.ByteArrayOutputStream



class UsageModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "UsageModule"
    }

    override fun getName(): String = "Usage"

    @ReactMethod
    fun requestUsagePermission() {
        Log.i(TAG, "requestUsagePermission called")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
            Log.i(TAG, "Opened usage access settings")
        } else {
            Log.w(TAG, "Usage access not supported on this device")
        }
    }

    @ReactMethod
    fun hasUsagePermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            val appOpsManager = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOpsManager.checkOpNoThrow(
                "android:get_usage_stats",
                android.os.Process.myUid(),
                reactContext.packageName
            )
            val granted = mode == AppOpsManager.MODE_ALLOWED
            Log.i(TAG, "Usage permission check: $granted")
            promise.resolve(granted)
        } else {
            Log.i(TAG, "Usage permission check: false (API < KITKAT)")
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getUsageStats(durationDays: Int, promise: Promise) {
        Log.i(TAG, "getUsageStats called with duration: $durationDays days")

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            Log.e(TAG, "Unsupported Android version for usage stats")
            promise.reject("UNSUPPORTED", "Usage stats not supported on this device")
            return
        }

        val usageStatsManager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val endTime = System.currentTimeMillis()
        val startTime = endTime - 1000L * 60 * 60 * 24 * durationDays

        // Choose appropriate interval based on duration
        val interval = when {
            durationDays <= 1 -> UsageStatsManager.INTERVAL_DAILY
            durationDays <= 7 -> UsageStatsManager.INTERVAL_WEEKLY
            else -> UsageStatsManager.INTERVAL_MONTHLY
        }

        Log.i(TAG, "Querying usage stats from $startTime to $endTime with interval $interval")

        val usageStatsList = usageStatsManager.queryUsageStats(
            interval,
            startTime,
            endTime
        )

        if (usageStatsList.isNullOrEmpty()) {
            Log.e(TAG, "No usage data found. Permission might not be granted.")
            promise.reject("NO_DATA", "No usage data available. Make sure permission is granted.")
            return
        }

        Log.i(TAG, "Retrieved ${usageStatsList.size} usage stats entries")

        val resultArray = WritableNativeArray()
        var includedCount = 0

       val packageManager = reactContext.packageManager

for (usageStats in usageStatsList) {
    if (usageStats.totalTimeInForeground > 0) {
        val packageName = usageStats.packageName
       val appName = try {
    val appInfo = packageManager.getApplicationInfo(packageName, PackageManager.GET_META_DATA)
    val label = packageManager.getApplicationLabel(appInfo).toString()
    Log.i(TAG, "App label for $packageName = $label")
    label
} catch (e: Exception) {
    Log.w(TAG, "Failed to get label for $packageName", e)
    packageName
}


        val map = WritableNativeMap().apply {
            putString("appName", appName)
            putString("packageName", packageName)
            putDouble("totalTimeInForeground", usageStats.totalTimeInForeground.toDouble() / 1000)
            putDouble("lastTimeUsed", usageStats.lastTimeUsed.toDouble())
        }

        resultArray.pushMap(map)
    }
}


        Log.i(TAG, "Filtered and included $includedCount apps with usage > 0")

        promise.resolve(resultArray)
    }

    @ReactMethod
    fun getAppIcon(packageName: String, promise: Promise) {
        try {
            val packageManager = reactContext.packageManager
            val drawable = packageManager.getApplicationIcon(packageName)
            val bitmap = drawableToBitmap(drawable)
            val scaledBitmap = scaleBitmap(bitmap, 96)
            val base64 = bitmapToBase64(scaledBitmap)
            Log.d(TAG, "Icon loaded for $packageName, base64 length: ${base64.length}")
            promise.resolve("data:image/png;base64,$base64")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get icon for $packageName", e)
            promise.resolve(null)
        }
    }

    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        // Use a fixed size for consistent rendering
        val size = 96

        // Create a new bitmap and draw the drawable onto it
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, size, size)
        drawable.draw(canvas)
        return bitmap
    }

    private fun scaleBitmap(bitmap: Bitmap, maxSize: Int): Bitmap {
        val width = bitmap.width
        val height = bitmap.height

        if (width <= maxSize && height <= maxSize) {
            return bitmap
        }

        val ratio = minOf(maxSize.toFloat() / width, maxSize.toFloat() / height)
        val newWidth = (width * ratio).toInt()
        val newHeight = (height * ratio).toInt()

        return Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
    }

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 90, outputStream)
        val byteArray = outputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }
}
