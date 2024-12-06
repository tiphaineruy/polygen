declare module '@webassemblyjs/wasm-parser' {
  interface DecodeOptions {
    ignoreCodeSection?: boolean;
    ignoreDataSection?: boolean;
  }

  interface DecodeResult {
    type: string;
    body: Module[];
  }

  interface Module {
    type: 'module';
    id: string;
    fields: ModuleField[];
    metadata: any;
  }

  type TypeName = 'i32' | 'i64' | 'u32' | 'u64' | 'f32' | 'f64';

  type ModuleField =
    | ModuleFunction
    | ModuleGlobal
    | ModuleTable
    | ModuleMemory
    | ModuleImport
    | ModuleExport;

  interface ModuleFunctionName {
    type: 'Identifier';
    value: string;
    raw: string;
  }

  interface ModuleFunctionSignature {
    type: 'Signature';
    params: { valtype: TypeName }[];
    results: TypeName[];
  }

  interface ModuleGlobalType {
    type: 'GlobalType';
    valtype: TypeName;
    mutability: 'var' | 'const';
  }

  interface ModuleGlobal {
    type: 'Global';
    globalType: ModuleGlobalType;
    name?: DescriptorIdentifier;
  }

  interface ModuleLimits {
    type: 'Limit';
    min: number;
    max?: number;
  }

  interface ModuleTable {
    type: 'Table';
    elementType: 'anyfunc';
    limits: ModuleLimits;
    name: DescriptorIdentifier;
  }

  interface ModuleMemory {
    type: 'Memory';
    limits: ModuleLimits;
    id: DescriptorIdentifier;
  }

  interface ModuleFunction {
    type: 'Func';
    name: ModuleFunctionName;
    signature: ModuleFunctionSignature;
    body: number[];
  }

  type ModuleImportDescriptor =
    | ModuleImportFunctionDescriptor
    | ModuleImportGlobalDescriptor;

  interface ModuleImportFunctionDescriptor {
    type: 'FuncImportDescr';
    id: string;
    signature: ModuleFunctionSignature;
  }

  type ModuleImportGlobalDescriptor = ModuleGlobalType;

  type ModuleExportDescriptor =
    | ModuleExportFunctionDescriptor
    | ModuleExportMemoryDescriptor
    | ModuleExportGlobalDescriptor
    | ModuleExportTableDescriptor;

  interface DescriptorNumericIdentifier {
    type: 'NumberLiteral';
    value: number;
    raw: string;
  }

  interface DescriptorSimpleIdentifier {
    type: 'Identifier';
    value: string;
  }

  type DescriptorIdentifier =
    | DescriptorNumericIdentifier
    | DescriptorSimpleIdentifier;

  interface ModuleExportFunctionDescriptor {
    type: 'FuncExportDescr';
    exportType: string;
    id: DescriptorIdentifier;
  }

  interface ModuleExportMemoryDescriptor {
    type: 'ModuleExportDescr';
    exportType: 'Memory';
    id: DescriptorIdentifier;
  }

  interface ModuleExportGlobalDescriptor {
    type: 'ModuleExportDescr';
    exportType: 'Global';
    id: DescriptorIdentifier;
  }

  interface ModuleExportTableDescriptor {
    type: 'ModuleExportDescr';
    exportType: 'Table';
    id: DescriptorIdentifier;
  }

  interface ModuleImport {
    type: 'ModuleImport';
    module: string;
    name: string;
    descr: ModuleImportDescriptor;
    loc: any;
  }

  interface ModuleExport {
    type: 'ModuleExport';
    name: string;
    descr: ModuleExportDescriptor;
    loc: any;
  }

  function decode(binary: any, options?: DecodeOptions): DecodeResult;
}
