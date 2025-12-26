package com.Blinkbuddy.overlay_lavender

import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.net.Uri
import android.util.Log
import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class OverlayModuleLavender(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "OverlayLavender"

    private val sharedPrefs: SharedPreferences =
        reactContext.getSharedPreferences("OverlayPrefs", Context.MODE_PRIVATE)

    private val OVERLAY_ACTIVE_KEY = "isOverlayActive"

    private var isOverlayActive: Boolean
        get() = sharedPrefs.getBoolean(OVERLAY_ACTIVE_KEY, false)
        set(value) = sharedPrefs.edit().putBoolean(OVERLAY_ACTIVE_KEY, value).apply()

    @ReactMethod
    fun showOverlay() {
        if (!hasOverlayPermission()) {
            openOverlayPermissionSettings()
            return
        }

        if (isOverlayActive) {
            Log.i("OverlayModule", "Overlay already active. showOverlay() ignored.")
            return
        }

        val intent = Intent(reactContext, OverlayServiceLavender::class.java)
        startOverlayService(intent)
        isOverlayActive = true
    }

    @ReactMethod
    fun showOverlayWithBlink(onDuration: Int, offDuration: Int) {
        if (!hasOverlayPermission()) {
            openOverlayPermissionSettings()
            return
        }

        if (isOverlayActive) {
            Log.i("OverlayModule", "Overlay already active. showOverlayWithBlink() ignored.")
            return
        }

        val intent = Intent(reactContext, OverlayServiceLavender::class.java).apply {
            putExtra("onDuration", onDuration)
            putExtra("offDuration", offDuration)
        }

        startOverlayService(intent)
        isOverlayActive = true
    }

    @ReactMethod
    fun hideOverlay() {
        if (!isOverlayActive) {
            Log.i("OverlayModule", "Overlay already inactive. hideOverlay() ignored.")
            return
        }

        val intent = Intent(reactContext, OverlayServiceLavender::class.java)
        reactContext.stopService(intent)
        isOverlayActive = false
    }

    // Optional: expose status to React Native if needed
    @ReactMethod
    fun isOverlayRunning(promise: com.facebook.react.bridge.Promise) {
        promise.resolve(isOverlayActive)
    }

    private fun hasOverlayPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(reactContext)
        } else true
    }

    private fun openOverlayPermissionSettings() {
        val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
            data = Uri.parse("package:${reactContext.packageName}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }

    private fun startOverlayService(intent: Intent) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
        } catch (e: Exception) {
            Log.e("OverlayModule", "Error starting overlay service: ${e.message}", e)
        }
    }
}
