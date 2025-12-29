Pod::Spec.new do |s|
  s.name         = 'ReactCodegen'
  s.version      = '0.0.0'
  s.summary      = 'Stubbed ReactCodegen podspec (generated)'
  s.homepage     = 'https://reactnative.dev'
  s.license      = { :type => 'MIT' }
  s.author       = { 'React Native' => 'react-native@example.com' }
  s.platforms    = { :ios => '10.0', :osx => '11.0' }
  s.source       = { :http => 'file://.' }
  s.prepare_command = 'echo "ReactCodegen stub"'
  s.source_files = 'FBReactNativeSpec/**/*.{h,m,mm,cpp,cc,c,hpp}'
end
Pod::Spec.new do |s|
  s.name         = "ReactCodegen"
  s.version      = "0.0.1"
  s.summary      = "Dummy spec for macOS build"
  s.homepage     = "https://reactnative.dev"
  s.license      = "MIT"
  s.author       = "Meta"
  s.platforms    = { :osx => "11.0" }
  s.source       = { :git => "", :tag => "0.0.1" }
  s.source_files = "dummy.h"
end
