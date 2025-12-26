package com.Blinkbuddy

import com.Blinkbuddy.overlay.OverlayPackage
import com.Blinkbuddy.overlay_cyan.OverlayPackageCyan
import com.Blinkbuddy.overlay_blue.OverlayPackageBlue
import com.Blinkbuddy.overlay_lavender.OverlayPackageLavender
import com.Blinkbuddy.usage.UsagePackage
import com.Blinkbuddy.permission.OverlayPermissionPackage


import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Add the new UsageStatsPackage
            
               add(OverlayPackage())
               add(OverlayPackageCyan())
               add(OverlayPackageBlue())
               add(OverlayPackageLavender())
               add(UsagePackage())
               add(OverlayPermissionPackage())  
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
  }
}
