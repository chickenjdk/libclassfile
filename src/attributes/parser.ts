import type { readableBuffer } from "@chickenjdk/byteutils";
import {
  classInfo,
  loadableTags,
  moduleInfo,
  packageInfo,
  PoolType,
  utf8Info,
} from "../constantPool/types";
import {
  readInnerClassAccessFlags,
  readMethodParametersAccessFlags,
  readModuleAttributeAccessFlags,
  readModuleAttributeRequiresAccessFlags,
  readModuleAttributeExportsFlags,
  readModuleAttributeOpensFlags,
} from "../accessFlags";
import { log } from "@chickenjdk/common";
import {
  annotation,
  attribute,
  bootstrapMethods,
  customAssertInfoType,
  exceptionTable,
  getLegalAttributes,
  innerClasses,
  lineNumberTable,
  localVariableTable,
  localVariableTypeTable,
  methodParameters,
  module,
  record,
  typeAnnotation,
} from "./types";
import {
  assertAttributeType,
  readAnnotation,
  readElementValue,
  readStackMapFrames,
  readTypeAnnotation,
} from "./helpers";
import { predefinedValidClassFileAttributesMap } from "../common";
import { disallowedError } from "../errors";
export function readAttribute(
  allBuffer: readableBuffer,
  constantPool: PoolType,
  customAssertInfoType: customAssertInfoType,
  enclosingStructure:
    | "ClassFile"
    | "method_info"
    | "field_info"
    | "record_component_info"
    | "Code"
): attribute {
  const attributeNameIndex = allBuffer.readUnsignedInt(2);
  const attributeNameEntry = constantPool[attributeNameIndex];
  customAssertInfoType(1, attributeNameIndex, attributeNameEntry);
  const { value: name } = attributeNameEntry;
  const attributeLength = allBuffer.readUnsignedInt(4);
  // Read ENTIRE attribute just in case not all of it is read for some reason sutch as the attribute not being supported and the error is ignored
  const buffer = allBuffer.readReadableBuffer(attributeLength);
  function check() {
    if (buffer.buffer.length > 0) {
      log(
        "warning",
        `Buffer not completly used in attribute ${name} (${buffer.buffer.length} bytes left). Expect possible errors due to invalid allignments.`
      );
    }
  }
  switch (name) {
    case "ConstantValue": {
      const constantValueIndex = buffer.readUnsignedInt(2);
      const constantValue = constantPool[constantValueIndex];
      customAssertInfoType([3, 4, 5, 6, 8], constantValueIndex, constantValue);
      check();
      return { name, value: constantValue };
    }
    case "Code": {
      // TODO: implement type checking
      const maxStack = buffer.readUnsignedInt(2);
      const maxLocals = buffer.readUnsignedInt(2);
      const codeLength = buffer.readUnsignedInt(4);
      const code = buffer.read(codeLength);
      const exceptionTableLength = buffer.readUnsignedInt(2);
      let exceptionTable: exceptionTable = [];
      for (let index = 0; index < exceptionTableLength; index++) {
        const startPc = buffer.readUnsignedInt(2);
        const endPc = buffer.readUnsignedInt(2);
        const handlerPc = buffer.readUnsignedInt(2);
        const catchTypeIndex = buffer.readUnsignedInt(2);
        let catchType: utf8Info | undefined;
        if (catchTypeIndex !== 0) {
          const entry = constantPool[catchTypeIndex];
          customAssertInfoType(7, catchTypeIndex, entry);
          catchType = entry.name;
        }
        exceptionTable[index] = { startPc, endPc, handlerPc, catchType };
      }
      const attributesCount = buffer.readUnsignedInt(2);
      const attributes: getLegalAttributes<"Code"> = [];
      for (let index = 0; index < attributesCount; index++) {
        const entry = readAttribute(
          buffer,
          constantPool,
          customAssertInfoType,
          "Code"
        );
        assertAttributeType(
          predefinedValidClassFileAttributesMap.Code,
          entry,
          "Code attribute"
        );
        attributes[index] = entry;
      }
      check();
      return { name, maxStack, maxLocals, code, exceptionTable, attributes };
    }
    case "StackMapTable": {
      const numberOfEntries = buffer.readUnsignedInt(2);
      return {
        name,
        entries: readStackMapFrames(
          numberOfEntries,
          buffer,
          constantPool,
          customAssertInfoType
        ),
      };
    }
    case "Exeptions": {
      const numberOfExeptions = buffer.readUnsignedInt(2);
      const exeptions: classInfo[] = [];
      for (let index = 0; index < numberOfExeptions; index++) {
        const entryIndex = buffer.readUnsignedInt(2);
        const entry = constantPool[entryIndex];
        customAssertInfoType(7, entryIndex, entry);
        exeptions[index] = entry;
      }
      check();
      return { name, exeptions };
    }
    case "InnerClasses": {
      const numberOfClasses = buffer.readUnsignedInt(2);
      const classes: innerClasses["classes"] = [];
      for (let index = 0; index < numberOfClasses; index++) {
        const innerClassInfoIndex = buffer.readUnsignedInt(2);
        const innerClassInfo = constantPool[innerClassInfoIndex];
        customAssertInfoType(7, innerClassInfoIndex, innerClassInfo);
        const outerClassInfoIndex = buffer.readUnsignedInt(2);
        const outerClassInfo = constantPool[outerClassInfoIndex];
        if (outerClassInfoIndex !== 0) {
          customAssertInfoType(7, outerClassInfoIndex, outerClassInfo);
        }
        const innerNameIndex = buffer.readUnsignedInt(2);
        const innerName = constantPool[innerNameIndex];
        if (innerNameIndex !== 0) {
          customAssertInfoType(1, innerNameIndex, innerName);
        }
        const innerClassAccessFlags = readInnerClassAccessFlags(buffer);
        classes[index] = {
          innerClassInfo,
          // @ts-ignore
          outerClassInfo,
          // @ts-ignore
          innerName,
          innerClassAccessFlags,
        };
      }
      check();
      return { name, classes };
    }
    case "EnclosingMethod": {
      const classIndex = buffer.readUnsignedInt(2);
      const classValue = constantPool[classIndex];
      customAssertInfoType(7, classIndex, classValue);
      const methodIndex = buffer.readUnsignedInt(2);
      const method = constantPool[methodIndex];
      if (methodIndex !== 0) {
        customAssertInfoType(12, methodIndex, method);
      }
      check();
      // Nothing to worry about, typescript does not know that if methodIndex === 0 then method === undefined (With a range type from 1 to 65535 it would most likely work)
      // @ts-ignore
      return { name, class: classValue, method };
    }
    case "Synthetic": {
      check();
      return { name };
    }
    case "Signature": {
      const signatureIndex = buffer.readUnsignedInt(2);
      const signature = constantPool[signatureIndex];
      customAssertInfoType(1, signatureIndex, signature);
      check();

      return { name, signature };
    }
    case "SourceFile": {
      const sourcefileIndex = buffer.readUnsignedInt(2);
      const sourcefile = constantPool[sourcefileIndex];
      customAssertInfoType(1, sourcefileIndex, sourcefile);
      check();
      return { name, sourcefile };
    }
    case "SourceDebugExtension": {
      const debugExtension = buffer.readString(buffer.buffer.length, true);
      check();
      return { name, debugExtension };
    }
    case "LineNumberTable": {
      const lineNumberTableLength = buffer.readUnsignedInt(2);
      const lineNumberTable: lineNumberTable["lineNumberTable"] = [];
      for (let index = 0; index < lineNumberTableLength; index++) {
        const startPc = buffer.readUnsignedInt(2);
        const lineNumber = buffer.readUnsignedInt(2);
        lineNumberTable[index] = { startPc, lineNumber };
      }
      check();
      return { name, lineNumberTable };
    }
    case "LocalVariableTable": {
      const localVariableTableLength = buffer.readUnsignedInt(2);
      const localVariableTable: localVariableTable["localVariableTable"] = [];
      for (let index = 0; index < localVariableTableLength; index++) {
        const startPc = buffer.readUnsignedInt(2);
        const length = buffer.readUnsignedInt(2);
        const nameIndex = buffer.readUnsignedInt(2);
        const name = constantPool[nameIndex];
        customAssertInfoType(1, nameIndex, name);
        const descriptorIndex = buffer.readUnsignedInt(2);
        const descriptor = constantPool[descriptorIndex];
        customAssertInfoType(1, descriptorIndex, descriptor);
        const index = buffer.readUnsignedInt(2);
        localVariableTable.push({ startPc, length, name, descriptor, index });
      }
      check();
      return { name, localVariableTable };
    }
    case "LocalVariableTypeTable": {
      const localVariableTypeTableLength = buffer.readUnsignedInt(2);
      const localVariableTypeTable: localVariableTypeTable["localVariableTypeTable"] =
        [];
      for (let index = 0; index < localVariableTypeTableLength; index++) {
        const startPc = buffer.readUnsignedInt(2);
        const length = buffer.readUnsignedInt(2);
        const nameIndex = buffer.readUnsignedInt(2);
        const name = constantPool[nameIndex];
        customAssertInfoType(1, nameIndex, name);
        const signatureIndex = buffer.readUnsignedInt(2);
        const signature = constantPool[signatureIndex];
        customAssertInfoType(1, signatureIndex, signature);
        const index = buffer.readUnsignedInt(2);
        localVariableTypeTable.push({
          startPc,
          length,
          name,
          signature,
          index,
        });
      }
      check();
      return { name, localVariableTypeTable };
    }
    case "Deprecated": {
      check();
      return { name };
    }
    case "RuntimeVisibleAnnotations":
    case "RuntimeInvisibleAnnotations": {
      const numAnnotations = buffer.readUnsignedInt(2);
      const annotations: annotation[] = [];
      for (let index = 0; index < numAnnotations; index++) {
        annotations[index] = readAnnotation(
          buffer,
          constantPool,
          customAssertInfoType
        );
      }
      check();
      return { name, annotations };
    }
    case "RuntimeVisibleParameterAnnotations":
    case "RuntimeInvisibleParameterAnnotations": {
      const numParameters = buffer.readUnsignedInt(2);
      const parameterAnnotations: annotation[] = [];
      for (let index = 0; index < numParameters; index++) {
        parameterAnnotations[index] = readAnnotation(
          buffer,
          constantPool,
          customAssertInfoType
        );
      }
      check();
      return { name, parameterAnnotations };
    }
    case "RuntimeVisibleTypeAnnotations":
    case "RuntimeInvisibleTypeAnnotations": {
      const numAnnotations = buffer.readUnsignedInt(2);
      const annotations: typeAnnotation[] = [];
      for (let index = 0; index < numAnnotations; index++) {
        annotations[index] = readTypeAnnotation(
          buffer,
          constantPool,
          customAssertInfoType,
          enclosingStructure
        );
      }
      return { name, annotations };
    }
    case "AnnotationDefault": {
      const defaultValue = readElementValue(
        buffer,
        constantPool,
        customAssertInfoType
      );
      return { name, defaultValue };
    }
    case "BootstrapMethods": {
      const numBootstrapMethods = buffer.readUnsignedInt(2);
      const bootstrapMethods: bootstrapMethods["bootstrapMethods"] = [];
      for (let index = 0; index < numBootstrapMethods; index++) {
        const bootstrapMethodRef = buffer.readUnsignedInt(2);
        const bootstrapMethod = constantPool[bootstrapMethodRef];
        customAssertInfoType(15, bootstrapMethodRef, bootstrapMethod);
        const numBootstrapArguments = buffer.readUnsignedInt(2);
        const bootstrapArguments: loadableTags[] = [];
        for (let index = 0; index < numBootstrapArguments; index++) {
          const argumentIndex = buffer.readUnsignedInt(2);
          const argument = constantPool[argumentIndex];
          customAssertInfoType(loadableTags, argumentIndex, argument);
          bootstrapArguments[index] = argument;
        }
        bootstrapMethods[index] = { bootstrapMethod, bootstrapArguments };
      }
    }
    case "MethodParameters": {
      const parametersCount = buffer.shift();
      const parameters: methodParameters["parameters"] = [];
      for (let index = 0; index < parametersCount; index++) {
        const nameIndex = buffer.readUnsignedInt(2);
        const name = constantPool[nameIndex];
        if (nameIndex !== 0) {
          customAssertInfoType(1, nameIndex, name);
        }
        const accessFlags = readMethodParametersAccessFlags(buffer);
        parameters[index] = { name: name as utf8Info | undefined, accessFlags };
      }
    }
    case "Module": {
      const moduleNameIndex = buffer.readUnsignedInt(2);
      const moduleName = constantPool[moduleNameIndex];
      customAssertInfoType(1, moduleNameIndex, moduleName);
      const moduleFlags = readModuleAttributeAccessFlags(buffer);
      const moduleVersionIndex = buffer.readUnsignedInt(2);
      const moduleVersion = constantPool[moduleVersionIndex] as
        | utf8Info
        | undefined;
      if (moduleVersionIndex !== 0) {
        // @ts-ignore
        customAssertInfoType(1, moduleNameIndex, moduleVersion);
      }
      const requiresCount = buffer.readUnsignedInt(2);
      const requiresModules: module["requires"] = [];
      for (let index = 0; index < requiresCount; index++) {
        const requiresIndex = buffer.readUnsignedInt(2);
        const requires = constantPool[requiresIndex];
        customAssertInfoType(19, requiresIndex, requires);
        const requiresFlags = readModuleAttributeRequiresAccessFlags(buffer);
        const requiresVersionIndex = buffer.readUnsignedInt(2);
        const requiresVersion = constantPool[requiresVersionIndex] as
          | utf8Info
          | undefined;
        if (requiresVersionIndex !== 0) {
          // @ts-ignore
          customAssertInfoType(1, requiresVersionIndex, requiresVersion);
        }
        requiresModules[index] = { requires, requiresFlags, requiresVersion };
      }
      const exportsCount = buffer.readUnsignedInt(2);
      const exports: module["exports"] = [];
      for (let index = 0; index < exportsCount; index++) {
        const exportsIndex = buffer.readUnsignedInt(2);
        const exportsPackage = constantPool[exportsIndex];
        customAssertInfoType(20, exportsIndex, exportsPackage);
        const exportsFlags = readModuleAttributeExportsFlags(buffer);
        const exportsToCount = buffer.readUnsignedInt(2);
        const exportsTo: moduleInfo[] = [];
        for (let index = 0; index < exportsToCount; index++) {
          const exportToIndex = buffer.readUnsignedInt(2);
          const exportTo = constantPool[exportToIndex];
          customAssertInfoType(19, exportToIndex, exportTo);
          exportsTo[index] = exportTo;
        }
        exports[index] = { exports: exportsPackage, exportsFlags, exportsTo };
      }
      const opensCount = buffer.readUnsignedInt(2);
      if (moduleFlags.isOpen === true && opensCount !== 0) {
        throw new disallowedError(
          `Open modules opensCount must be zero but got ${opensCount}`
        );
      }
      const opens: module["opens"] = [];
      for (let index = 0; index < opensCount; index++) {
        const opensIndex = buffer.readUnsignedInt(2);
        const opensPackage = constantPool[opensIndex];
        customAssertInfoType(20, opensIndex, opensPackage);
        const opensFlags = readModuleAttributeOpensFlags(buffer);
        const opensToCount = buffer.readUnsignedInt(2);
        const opensTo: moduleInfo[] = [];
        for (let index = 0; index < opensToCount; index++) {
          const openToIndex = buffer.readUnsignedInt(2);
          const openTo = constantPool[openToIndex];
          customAssertInfoType(19, openToIndex, openTo);
          opensTo[index] = openTo;
        }
        opens[index] = { opens: opensPackage, opensFlags, opensTo };
      }
      const usesCount = buffer.readUnsignedInt(2);
      const uses: classInfo[] = [];
      for (let index = 0; index < usesCount; index++) {
        const usesClassIndex = buffer.readUnsignedInt(2);
        const usesClass = constantPool[usesClassIndex];
        customAssertInfoType(7, usesClassIndex, usesClass);
        uses[index] = usesClass;
      }
      const providesCount = buffer.readUnsignedInt(2);
      const provides: module["provides"] = [];
      for (let index = 0; index < providesCount; index++) {
        const providesClassIndex = buffer.readUnsignedInt(2);
        const providesClass = constantPool[providesClassIndex];
        customAssertInfoType(7, providesClassIndex, providesClass);
        const providesWithCount = buffer.readUnsignedInt(2);
        const providesWith: classInfo[] = [];
        for (let index = 0; index < providesWithCount; index++) {
          const provideWithIndex = buffer.readUnsignedInt(2);
          const provideWith = constantPool[provideWithIndex];
          customAssertInfoType(7, provideWithIndex, provideWith);
          providesWith[index] = provideWith;
        }
        provides[index] = { provides: providesClass, providesWith };
      }
      return {
        name,
        moduleName,
        moduleFlags,
        moduleVersion,
        requires: requiresModules,
        exports,
        opens,
        uses,
        provides,
      };
    }
    case "ModulePackages": {
      const packageCount = buffer.readUnsignedInt(2);
      const packages: packageInfo[] = [];
      for (let index = 0; index < packageCount; index++) {
        const packageIndex = buffer.readUnsignedInt(2);
        const Package = constantPool[packageIndex];
        customAssertInfoType(20, packageIndex, Package);
        packages[index] = Package;
      }
      return { name, packages };
    }
    case "ModuleMainClass": {
      const mainClassIndex = buffer.readUnsignedInt(2);
      const mainClass = constantPool[mainClassIndex];
      customAssertInfoType(7, mainClassIndex, mainClass);
      return { name, mainClass };
    }
    case "NestHost": {
      const hostClassIndex = buffer.readUnsignedInt(2);
      const hostClass = constantPool[hostClassIndex];
      customAssertInfoType(7, hostClassIndex, hostClass);
      return { name, hostClass };
    }
    case "NestMembers": {
      const numberOfClasses = buffer.readUnsignedInt(2);
      const classes: classInfo[] = [];
      for (let index = 0; index < numberOfClasses; index++) {
        const classIndex = buffer.readUnsignedInt(2);
        const classValue = constantPool[classIndex];
        customAssertInfoType(7, classIndex, classValue);
        classes[index] = classValue;
      }
      return { name, classes };
    }
    case "Record": {
      const componentsCount = buffer.readUnsignedInt(2);
      const components: record["components"] = [];
      for (let index = 0; index < componentsCount; index++) {
        const nameIndex = buffer.readUnsignedInt(2);
        const name = constantPool[nameIndex];
        customAssertInfoType(1, nameIndex, name);
        const descriptorIndex = buffer.readUnsignedInt(2);
        const descriptor = constantPool[descriptorIndex];
        customAssertInfoType(1, descriptorIndex, descriptor);
        const attributesCount = buffer.readUnsignedInt(2);
        const attributes: getLegalAttributes<"record_component_info"> = [];
        for (let index = 0; index < attributesCount; index++) {
          const attribute = readAttribute(
            buffer,
            constantPool,
            customAssertInfoType,
            "record_component_info"
          );
          assertAttributeType(
            predefinedValidClassFileAttributesMap.record_component_info,
            attribute,
            "Record component info structure"
          );
          attributes[index] = attribute;
        }
        components[index] = { name, descriptor, attributes };
      }
      return { name, components };
    }
    case "PermittedSubclasses": {
      const numberOfClasses = buffer.readUnsignedInt(2);
      const classes: classInfo[] = [];
      for (let index = 0; index < numberOfClasses; index++) {
        const classIndex = buffer.readUnsignedInt(2);
        const classValue = constantPool[classIndex];
        customAssertInfoType(7, classIndex, classValue);
        classes[index] = classValue;
      }
      return { name, classes };
    }
    default: {
      log(
        "verbose",
        `Unknown/unimplemented attribute ${attributeNameEntry.value}`
      );
      return { name };
    }
  }
}
