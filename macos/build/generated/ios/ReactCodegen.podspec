Pod::Spec.new do |s|
  s.name         = "ReactCodegen"
  s.version      = "0.0.1"
  s.summary      = "Dummy spec for macOS build"
  s.homepage     = "https://reactnative.dev"
  s.license      = "MIT"
  s.author       = "Meta"
  s.platforms    = { :ios => "13.0", :osx => "11.0" }
  s.source       = { :git => "", :tag => "0.0.1" }
  s.source_files = "dummy.h"
end
