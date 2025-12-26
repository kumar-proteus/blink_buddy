package com.Blinkbuddy.overlay_blue

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import com.Blinkbuddy.R  // 🔴 Make sure this exists
import com.bumptech.glide.Glide
class OverlayServiceBlue : Service() {
    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private lateinit var layoutParams: WindowManager.LayoutParams

    private val handler = Handler(Looper.getMainLooper())
    private var showingHidden = false

    private var onDuration: Long = 3000L    // default 3s visible
    private var offDuration: Long = 3000L   // default 3s hidden

    private val switchRunnable = object : Runnable {
        override fun run() {
            showingHidden = !showingHidden
            updateOverlay(showingHidden)

            val delay = if (showingHidden) offDuration else onDuration
            handler.postDelayed(this, delay)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Read durations from intent extras (in milliseconds)
        onDuration = intent?.getLongExtra("onDuration", 3000L) ?: 3000L
        offDuration = intent?.getLongExtra("offDuration", 3000L) ?: 3000L

        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val scale = resources.displayMetrics.density
        val sizeInPx = (50 * scale + 0.5f).toInt()
        val yPosPx = (200 * scale + 0.5f).toInt()

        layoutParams = WindowManager.LayoutParams(
            sizeInPx,
            sizeInPx,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        )
        layoutParams.gravity = Gravity.TOP or Gravity.END
        layoutParams.x = 0
        layoutParams.y = yPosPx

        // Start with visible overlay first (showingHidden = false)
        showingHidden = false
        updateOverlay(showingHidden)

        // Start switching loop with onDuration delay
        handler.postDelayed(switchRunnable, onDuration)

        return START_STICKY
    }

    private fun updateOverlay(useHidden: Boolean) {
        overlayView?.let { windowManager?.removeView(it) }
        val inflater = LayoutInflater.from(this)
        val layoutId = if (useHidden) R.layout.overlay_view_hidden else R.layout.overlay_view_blue
        overlayView = inflater.inflate(layoutId, null)

        val eyeImageView = overlayView?.findViewById<ImageView>(R.id.eyeGif)
        eyeImageView?.let {
            Glide.with(this).asGif().load(R.raw.eye_gif).into(it)
            it.setOnTouchListener(object : View.OnTouchListener {
                private var initialX = 0
                private var initialY = 0
                private var initialTouchX = 0f
                private var initialTouchY = 0f

                override fun onTouch(v: View, event: MotionEvent): Boolean {
                    when (event.action) {
                        MotionEvent.ACTION_DOWN -> {
                            initialX = layoutParams.x
                            initialY = layoutParams.y
                            initialTouchX = event.rawX
                            initialTouchY = event.rawY
                            return true
                        }
                        MotionEvent.ACTION_MOVE -> {
                            layoutParams.x = initialX - (event.rawX - initialTouchX).toInt()
                            layoutParams.y = initialY + (event.rawY - initialTouchY).toInt()
                            windowManager?.updateViewLayout(overlayView, layoutParams)
                            return true
                        }
                    }
                    return false
                }
            })
        }

        windowManager?.addView(overlayView, layoutParams)
        Log.i("OverlayService", "Switched to ${if (useHidden) "overlay_view_hidden" else "overlay_view_blue"}")
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(switchRunnable)
        overlayView?.let {
            windowManager?.removeView(it)
            overlayView = null
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
