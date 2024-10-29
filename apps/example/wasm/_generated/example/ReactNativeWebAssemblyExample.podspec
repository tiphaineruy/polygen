require "json"

project_dir = Pathname.new(__dir__)
project_dir = project_dir.parent until
  File.exist?("#{project_dir}/package.json") ||
  project_dir.expand_path.to_s == '/'

package = JSON.parse(File.read(File.join(project_dir, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactNativeWebAssemblyExample"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]
  s.source       = { :git => package["repository"]["url"], :tag => "#{s.version}" }

  s.platforms    = { :ios => min_ios_version_supported }
  s.source_files = "*.{h,c,cpp}"

#   s.compiler_flags = "-shared"
  s.pod_target_xcconfig = {
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
      "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
  }
end
