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

  type ModuleField = ModuleFunction | ModuleImport | ModuleExport;

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

  interface ModuleFunction {
    type: 'Func';
    name: ModuleFunctionName;
    signature: ModuleFunctionSignature;
    body: number[];
  }

  type ModuleImportDescriptor = ModuleFuncImportDescriptor;

  interface ModuleFuncImportDescriptor {
    type: 'FuncImportDescr';
    id: string;
    signature: ModuleFunctionSignature;
  }

  type ModuleExportDescriptor =
    | ModuleExportFunctionDescriptor
    | ModuleExportMemoryDescriptor;

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
