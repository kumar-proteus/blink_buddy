import Cocoa
import React

@main
class AppDelegate: NSObject, NSApplicationDelegate {
  var popover = NSPopover()
  var bridge: RCTBridge?
  var window: NSWindow?

  func applicationDidFinishLaunching(_ aNotification: Notification) {
    // Create the React Native bridge
    let jsCodeLocation: URL

    #if DEBUG
    jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")!
    #else
    jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
    #endif

    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "Blinkbuddy", initialProperties: nil, launchOptions: nil)

    // Create the window
    let windowSize = NSSize(width: 480, height: 800)

    window = NSWindow(
      contentRect: NSRect(origin: .zero, size: windowSize),
      styleMask: [.titled, .closable, .miniaturizable, .resizable],
      backing: .buffered,
      defer: false
    )

    window?.center()
    window?.title = "BlinkBuddy"
    window?.contentView = rootView
    window?.makeKeyAndOrderFront(nil)

    // Set minimum window size
    window?.minSize = NSSize(width: 400, height: 600)
  }

  func applicationWillTerminate(_ aNotification: Notification) {
    // Clean up when app terminates
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    return true
  }

  func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
    return true
  }
}
