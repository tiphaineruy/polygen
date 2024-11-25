import { HEADER } from '../common.js';
import { W2CModule } from '../../module.js';
import stripIndent from 'strip-indent';

export function buildStaticLibraryHeader(module: W2CModule) {
  const className = `WASM${module.generatedClassName}Module`;

  return (
    HEADER +
    stripIndent(`
    #pragma once
    #include <ReactNativeWebAssembly/StaticLibraryModule.h>

    namespace facebook::react {

    std::shared_ptr<Module> ${module.moduleFactoryFunctionName}();

    class ${className}: public StaticLibraryModule {
    public:
      ${className}(const std::string& name): StaticLibraryModule(name) {}
      const std::vector<ImportInfo>& getImports() const override;
      const std::vector<ExportInfo>& getExports() const override;
      jsi::Object createInstance(jsi::Runtime& rt, jsi::Object&& importObject) const override;
    };

    }
  `)
  );
}

const symbolTypeMapping: Record<string, string> = {
  Function: 'Module::SymbolKind::Function',
  Memory: 'Module::SymbolKind::Memory',
  Global: 'Module::SymbolKind::Global',
};

export function buildStaticLibrarySource(module: W2CModule) {
  const className = `WASM${module.generatedClassName}Module`;
  const moduleImportsIter = module.imports
    .values()
    .map((i) => `{"${i.module}", "${i.name}", ${symbolTypeMapping[i.type]}}`);
  const moduleImports = [...moduleImportsIter].join(', ');
  const moduleExportsIter = module.exports
    .values()
    .map((e) => `{"${e.name}", ${symbolTypeMapping[e.type]}}`);
  const moduleExports = [...moduleExportsIter].join(', ');

  return (
    HEADER +
    stripIndent(`
  #include "static-module.h"
  #include "jsi-exports-bridge.h"

  namespace facebook::react {

  const std::vector<Module::ImportInfo> imports { ${moduleImports} };
  const std::vector<Module::ExportInfo> exports { ${moduleExports} };

  std::shared_ptr<Module> ${module.moduleFactoryFunctionName}() {
    return std::make_shared<${className}>("${module.name}");
  }

  const std::vector<Module::ImportInfo>& ${className}::getImports() const {
    return imports;
  }

  const std::vector<Module::ExportInfo>& ${className}::getExports() const {
    return exports;
  }

  jsi::Object ${className}::createInstance(jsi::Runtime& rt, jsi::Object&& importObject) const {
    return create${module.generatedClassName}Exports(rt, std::move(importObject));
  }

  }
  `)
  );
}
