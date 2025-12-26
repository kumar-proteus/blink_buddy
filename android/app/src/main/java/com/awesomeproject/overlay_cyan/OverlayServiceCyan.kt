package com.Blinkbuddy.overlay_cyan

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.net.Uri
import android.os.*
import android.provider.Settings
import android.util.Log
import android.view.*
import android.widget.ImageView
import androidx.core.app.NotificationCompat
import com.Blinkbuddy.R
import com.bumptech.glide.Glide

class OverlayServiceCyan : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private lateinit var layoutParams: WindowManager.LayoutParams

    private var blinkOnDuration: Long = 1000
    private var blinkOffDuration: Long = 1000
    private var blinkHandler = Handler(Looper.getMainLooper())
    private var blinkRunnable: Runnable? = null

    private val CHANNEL_ID = "overlay_service_channel"
    private val NOTIFICATION_ID = 101

    override fun onCreate() {
        super.onCreate()
        Log.d("OverlayService", "Overlay service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Extract blink durations
        blinkOnDuration = intent?.getIntExtra("onDuration", 1000)?.toLong() ?: 1000L
        blinkOffDuration = intent?.getIntExtra("offDuration", 1000)?.toLong() ?: 1000L

        // Start foreground service with notification
        startForegroundServiceWithNotification()

        // Show overlay
        setupOverlay()

        return START_STICKY
    }

    private fun startForegroundServiceWithNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Overlay Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Overlay is active"
                enableLights(false)
                enableVibration(false)
                setShowBadge(false)
            }

            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Eye Overlay Running")
            .setContentText("The blinking eye is active on screen.")
            .setSmallIcon(R.drawable.ic_eye) // Replace with a valid icon in your `res/drawable`
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    private fun setupOverlay() {
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

        val inflater = LayoutInflater.from(this)
        overlayView = inflater.inflate(R.layout.overlay_view_cyan, null)

        val eyeImageView = overlayView?.findViewById<ImageView>(R.id.eyeGif)

        if (eyeImageView != null) {
            Glide.with(this)
                .asGif()
                .load(R.raw.eye_gif) // Place your eye_gif in res/raw
                .into(eyeImageView)

            eyeImageView.setOnTouchListener(object : View.OnTouchListener {
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
        } else {
            Log.e("OverlayService", "ImageView not found in overlay")
        }

        windowManager?.addView(overlayView, layoutParams)

        startBlinking()
    }

    private fun startBlinking() {
        overlayView?.visibility = View.VISIBLE

        blinkRunnable = object : Runnable {
            override fun run() {
                overlayView?.visibility =
                    if (overlayView?.visibility == View.VISIBLE) View.INVISIBLE else View.VISIBLE

                val nextDelay =
                    if (overlayView?.visibility == View.VISIBLE) blinkOnDuration else blinkOffDuration

                blinkHandler.postDelayed(this, nextDelay)
            }
        }

        blinkHandler.postDelayed(blinkRunnable!!, blinkOnDuration)
    }

    private fun stopBlinking() {
        blinkRunnable?.let { blinkHandler.removeCallbacks(it) }
        overlayView?.visibility = View.VISIBLE
    }

    override fun onDestroy() {
        super.onDestroy()
        stopBlinking()
        overlayView?.let {
            windowManager?.removeView(it)
            overlayView = null
        }
        Log.d("OverlayService", "Overlay service destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
