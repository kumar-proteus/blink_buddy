package com.Blinkbuddy.overlay

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.*
import android.util.Log
import android.view.*
import android.widget.ImageView
import androidx.core.app.NotificationCompat
import com.Blinkbuddy.MainActivity
import android.graphics.BitmapFactory
import androidx.core.app.NotificationCompat.BigPictureStyle

import com.Blinkbuddy.R
import com.bumptech.glide.Glide
import android.content.pm.ServiceInfo

class OverlayService : Service() {

    companion object {
        private const val CHANNEL_ID = "overlay_service_channel"
        private const val NOTIFICATION_ID = 12345
        private const val TAG = "OverlayService"
    }

    private val reminderIntervalMillis = 20 * 60 * 1000L // 20 minutes
    private val reminderHandler = Handler(Looper.getMainLooper())
    private val reminderRunnable = object : Runnable {
        override fun run() {
            showBlinkReminderNotification()
            reminderHandler.postDelayed(this, reminderIntervalMillis)
        }
    }

    private var windowManager: WindowManager? = null
    private var overlayRoot: View? = null
    private var overlayVisibleView: View? = null
    private var overlayHiddenView: View? = null
    private lateinit var layoutParams: WindowManager.LayoutParams

    private val handler = Handler(Looper.getMainLooper())
    private var showingHidden = false

    private var onDuration: Long = 3000L
    private var offDuration: Long = 3000L

    private val switchRunnable = object : Runnable {
        override fun run() {
            showingHidden = !showingHidden
            toggleVisibility(showingHidden)

            val delay = if (showingHidden) offDuration else onDuration
            handler.postDelayed(this, delay)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    Log.i(TAG, "Service starting...")

    onDuration = intent?.getLongExtra("onDuration", 3000L) ?: 3000L
    offDuration = intent?.getLongExtra("offDuration", 3000L) ?: 3000L
    val sizeInDp = intent?.getFloatExtra("sizeInDp", 50f) ?: 50f // Default size 50dp
    val color = intent?.getStringExtra("color") ?: "blue" // Default color to "blue" if not passed

    Log.i(TAG, "onDuration = $onDuration ms, offDuration = $offDuration ms, sizeInDp = $sizeInDp dp, color = $color")

    createNotificationChannel()
    val notification = createNotification()

    try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        Log.i(TAG, "Foreground service started")
    } catch (e: Exception) {
        Log.e(TAG, "Failed to start foreground service", e)
    }

    setupOverlay(sizeInDp, color) // Pass color to setupOverlay method
    handler.postDelayed(switchRunnable, onDuration)
    reminderHandler.postDelayed(reminderRunnable, reminderIntervalMillis)

    return START_STICKY
}


    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Overlay Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
            Log.i(TAG, "Notification channel created")
        }
    }

    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
                PendingIntent.FLAG_MUTABLE else 0
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("BlinkBuddy is running")
            .setContentText("Digital well-being for your eyes")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun showBlinkReminderNotification() {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channelId = "blink_reminder_channel"
        val channelName = "Blink Reminders"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                channelName,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Reminders to blink"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 400, 200, 400)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val reminderMessages = listOf(
            "👀 Eyes tired? Look 20 feet away for 20 seconds!",
            "Time for a 20-20-20 break! Your eyes will thank you.",
            "Pause. Blink. Look away. Reset your eyes now!",
            "Don't forget to look far away for 20 seconds!",
            "Give your eyes a breather – look 20ft away.",
            "Blink 10 times and look around – it helps!",
            "Too much screen time? Time to look away 👁️",
            "Quick break! Follow the 20-20-20 rule.",
            "Focus far to focus better – take a blink break.",
            "Look outside for 20 seconds. It's worth it!",
            "Just 20 seconds – blink and reset your focus.",
            "Vision recharge time – step back mentally.",
            "Keep your eyes comfy. Look into the distance.",
            "Work hard, blink harder – relax your eyes.",
            "💡 Blink to hydrate. Look away for clarity.",
            "Let your eyes rest – gaze at something green 🌿",
            "20-20-20 isn't a rule, it's self-care.",
            "You've earned a 20-sec vacation. Take it now!",
            "BlinkBuddy says: break time! 👁️",
            "Take a step back – your eyes need it.",
            "Give your screen the cold shoulder. 😎",
            "Your focus needs a refresh. Look away.",
            "Close eyes, open, and look far. Refresh!",
            "Be kind to your vision. Blink + look away.",
            "Superheroes blink. You should too.",
            "Better vision starts with tiny habits.",
            "Hey! Look far away. Relax your eyes.",
            "🧠 Brain & eyes need a moment. Take it.",
            "A quick break keeps eye strain away.",
            "Don't just stare. Blink and reset!"
        )

        val randomMessage = reminderMessages.random()

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("👁️ BlinkBuddy Reminder")
            .setContentText(randomMessage)
            .setStyle(NotificationCompat.BigTextStyle().bigText(randomMessage))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(longArrayOf(0, 400, 200, 400))
            .build()

        notificationManager.notify(45678, notification)
    }

  // Inside setupOverlay() method
private fun setupOverlay(sizeInDp: Float, color: String) {
    windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

    val scale = resources.displayMetrics.density
    val sizeInPx = (sizeInDp * scale + 0.5f).toInt()  // Convert size from dp to pixels
    val yPosPx = (200 * scale + 0.5f).toInt()

    layoutParams = WindowManager.LayoutParams(
        sizeInPx,  // width
        sizeInPx,  // height
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            WindowManager.LayoutParams.TYPE_PHONE,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
        PixelFormat.TRANSLUCENT
    ).apply {
        gravity = Gravity.TOP or Gravity.END
        x = 0
        y = yPosPx
    }

    // Dynamically load the layout based on the color
    val inflater = LayoutInflater.from(this)
    overlayRoot = inflater.inflate(R.layout.overlay_root, null)

    // Determine which color layout to load
    val colorLayoutResId = when (color.toLowerCase()) {
        "blue" -> R.layout.overlay_view_blue
        "purple" -> R.layout.overlay_view_purple
        "brown" -> R.layout.overlay_view_brown
        "pink" -> R.layout.overlay_view_pink
        "green" -> R.layout.overlay_view_green
        "grey" -> R.layout.overlay_view_grey
        else -> R.layout.overlay_view_blue // Default to blue if color is not recognized
    }

    overlayVisibleView = inflater.inflate(colorLayoutResId, null)
    overlayHiddenView = inflater.inflate(R.layout.overlay_view_hidden, null)

    // Add the views to the root layout
    (overlayRoot as? android.widget.FrameLayout)?.apply {
        addView(overlayVisibleView)
        addView(overlayHiddenView)
    }

    overlayVisibleView?.visibility = View.VISIBLE
    overlayHiddenView?.visibility = View.GONE

    overlayVisibleView?.findViewById<ImageView>(R.id.eyeGif)?.let {
        val gifResId = getGifResourceForColor(color)
        Glide.with(this).asGif().load(gifResId).into(it)
        it.setOnTouchListener(dragTouchListener)
    }

    try {
        windowManager?.addView(overlayRoot, layoutParams)
        Log.i(TAG, "Overlay added to window")
    } catch (e: Exception) {
        Log.e(TAG, "Failed to add overlay", e)
    }
}


private fun getGifResourceForColor(color: String): Int {
    return when (color.toLowerCase()) {
        "blue" -> R.raw.blue
        "purple" -> R.raw.purple
        "brown" -> R.raw.brown
        "pink" -> R.raw.pink
        "green" -> R.raw.green
        "grey" -> R.raw.grey
        else -> R.raw.blue // Default gif if color is not recognized
    }
}


    private val dragTouchListener = View.OnTouchListener { _, event ->
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                initialX = layoutParams.x
                initialY = layoutParams.y
                initialTouchX = event.rawX
                initialTouchY = event.rawY
                true
            }

            MotionEvent.ACTION_MOVE -> {
                layoutParams.x = initialX - (event.rawX - initialTouchX).toInt()
                layoutParams.y = initialY + (event.rawY - initialTouchY).toInt()
                windowManager?.updateViewLayout(overlayRoot, layoutParams)
                true
            }

            else -> false
        }
    }

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f

    private fun toggleVisibility(hidden: Boolean) {
        overlayVisibleView?.visibility = if (hidden) View.GONE else View.VISIBLE
        overlayHiddenView?.visibility = if (hidden) View.VISIBLE else View.GONE
        Log.i(TAG, "Switched to ${if (hidden) "HIDDEN" else "VISIBLE"}")
    }

    override fun onDestroy() {
        handler.removeCallbacks(switchRunnable)
        reminderHandler.removeCallbacks(reminderRunnable)

        overlayRoot?.let {
            windowManager?.removeView(it)
            overlayRoot = null
            Log.i(TAG, "Overlay removed")
        }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
