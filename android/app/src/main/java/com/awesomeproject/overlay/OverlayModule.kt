    package com.Blinkbuddy.overlay

    import android.content.Intent
    import android.os.Build
    import android.provider.Settings
    import com.facebook.react.bridge.ReactApplicationContext
    import com.facebook.react.bridge.ReactContextBaseJavaModule

    import com.facebook.react.bridge.ReactMethod

    class OverlayModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

        override fun getName(): String = "Overlay"

    @ReactMethod
    fun showOverlay(onDuration: Double, offDuration: Double, size: Double, color: String) {
        val onDurLong = onDuration.toLong()
        val offDurLong = offDuration.toLong()
        val sizeInDp = size.toFloat()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
            val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
            intent.data = android.net.Uri.parse("package:" + reactContext.packageName)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
        } else {
            // Start the overlay service and pass the size and color parameters
            val intent = Intent(reactContext, OverlayService::class.java).apply {
                putExtra("onDuration", onDurLong)
                putExtra("offDuration", offDurLong)
                putExtra("sizeInDp", sizeInDp)  // Pass the size to the service
                putExtra("color", color)        // Pass the color to the service
            }
            reactContext.startService(intent)
        }
    }


        @ReactMethod
        fun hideOverlay() {
            val intent = Intent(reactContext, OverlayService::class.java)
            reactContext.stopService(intent)
        }
    }
