package com.Blinkbuddy.overlay_blue

import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class OverlayModuleBlue(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "OverlayBlue"

    @ReactMethod
    fun showOverlay(onDuration: Double, offDuration: Double) {
    val onDurLong = onDuration.toLong()
    val offDurLong = offDuration.toLong()

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
        val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
        intent.data = android.net.Uri.parse("package:" + reactContext.packageName)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactContext.startActivity(intent)
    } else {
        val intent = Intent(reactContext, OverlayServiceBlue::class.java).apply {
            putExtra("onDuration", onDurLong)
            putExtra("offDuration", offDurLong)
        }
        reactContext.startService(intent)
    }
}


    @ReactMethod
    fun hideOverlay() {
        val intent = Intent(reactContext, OverlayServiceBlue::class.java)
        reactContext.stopService(intent)
    }
}