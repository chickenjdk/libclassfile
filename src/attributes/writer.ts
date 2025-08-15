import { writableBuffer } from "@chickenjdk/byteutils";
import { attribute, customAssertInfoType, knownAttribute } from "./types";
import { loadableTags, utf8Info } from "../constantPool/types";
import { flushSinkWritableBuffer } from "../customBuffers";
import { log } from "@chickenjdk/common";
import { writeBytecode } from "../bytecode/writer";
import {
  assertAttributeType,
  writeAnnotation,
  writeElementValue,
  writeStackMapFrames,
  writeTypeAnnotation,
} from "./helpers";
import { PoolRegister } from "../constantPool/writer";
import {
  writeInnerClassAccessFlags,
  writeMethodParametersAccessFlags,
  writeModuleAttributeAccessFlags,
  writeModuleAttributeExportsFlags,
  writeModuleAttributeOpensFlags,
  writeModuleAttributeRequiresAccessFlags,
} from "../accessFlags";
import { writer } from "../signature";
import {
  assembleFieldDescriptor,
  assembleFieldTypeSignature,
} from "../signature/writer";
import { predefinedValidClassFileAttributesMap } from "../common";

export function writeAttribute(
  buffer: writableBuffer | flushSinkWritableBuffer,
  attribute: attribute,
  customAssertInfoType: customAssertInfoType,
  enclosingStructure:
    | "ClassFile"
    | "method_info"
    | "field_info"
    | "record_component_info"
    | "Code",
  // A set because the order is not yet known
  constantPool: PoolRegister
): void {
  // Generate the attribute
  // Main flushBuff
  const flushBuff = new flushSinkWritableBuffer();
  // flushBuff for sub-use within attributes
  const flushBuff2 = new flushSinkWritableBuffer();

  if (!attribute.known) {
    log(
      "verbose",
      `Unknown attribute: ${attribute.name.value} in ${enclosingStructure}, writing raw bytes`
    );
    flushBuff.writeUint8Array(attribute.rawData);
  } else {
    attribute = attribute as knownAttribute;
    const {
      name: { value: name },
    } = attribute;
    switch (name) {
      case "ConstantValue": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        constantPool.registerEntry(attribute.value);
        flushBuff.writeUnsignedInt(attribute.value.index, 2);
        break;
      }
      case "Code": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.maxStack, 2);
        flushBuff.writeUnsignedInt(attribute.maxLocals, 2);
        const buff = new writableBuffer();

        writeBytecode(buff, attribute.code, constantPool);
        flushBuff.writeUnsignedInt(buff.length, 4);
        flushBuff.writeWriteableBuffer(buff);
        flushBuff.writeUnsignedInt(attribute.exceptionTable.length, 2)
        for (const exception of attribute.exceptionTable) {
          flushBuff.writeUnsignedInt(exception.startPc, 2);
          flushBuff.writeUnsignedInt(exception.endPc, 2);
          flushBuff.writeUnsignedInt(exception.handlerPc, 2);
          flushBuff.writeUnsignedInt(exception.catchType?.index ?? 0, 2);
          if (exception.catchType) {
            constantPool.registerEntry(exception.catchType);
          }
        }
        flushBuff.writeUnsignedInt(attribute.attributes.length, 2);
        for (const attributeValue of attribute.attributes) {
          assertAttributeType(
            predefinedValidClassFileAttributesMap.Code,
            attributeValue,
            "Code attribute"
          );
          writeAttribute(
            flushBuff,
            attributeValue,
            customAssertInfoType,
            "Code",
            constantPool
          );
        }
        break;
      }
      case "StackMapTable": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        writeStackMapFrames(
          flushBuff,
          attribute.entries,
          constantPool,
          customAssertInfoType
        );
        break;
      }
      case "Exeptions": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.exeptions.length, 2);
        for (const exception of attribute.exeptions) {
          const entryIndex = constantPool.registerEntry(exception);
          flushBuff.writeUnsignedInt(entryIndex, 2);
        }
        break;
      }
      case "InnerClasses": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        for (const innerClass of attribute.classes) {
          // Inner class info
          const innerClassInfoIndex = constantPool.registerEntry(
            innerClass.innerClassInfo
          );
          customAssertInfoType(
            7,
            innerClassInfoIndex,
            innerClass.innerClassInfo
          );
          flushBuff.writeUnsignedInt(innerClassInfoIndex, 2);
          // Outer class info
          if (innerClass.outerClassInfo !== undefined) {
            const outerClassInfoIndex = constantPool.registerEntry(
              innerClass.outerClassInfo
            );
            customAssertInfoType(
              7,
              outerClassInfoIndex,
              innerClass.outerClassInfo
            );
          }
          flushBuff.writeUnsignedInt(innerClass.outerClassInfo?.index ?? 0, 2);
          // Inner name index
          if (innerClass.innerName !== undefined) {
            const innerNameIndex = constantPool.registerEntry(
              innerClass.innerName
            );
            customAssertInfoType(1, innerNameIndex, innerClass.innerName);
          }
          flushBuff.writeUnsignedInt(innerClass.innerName?.index ?? 0, 2);
          // Access flags
          writeInnerClassAccessFlags(
            flushBuff,
            innerClass.innerClassAccessFlags
          );
        }
        break;
      }
      case "EnclosingMethod": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        // Class
        const classIndex = constantPool.registerEntry(attribute.class);
        customAssertInfoType(7, classIndex, attribute.class);
        flushBuff.writeUnsignedInt(classIndex, 2);
        // Method
        if (attribute.method) {
          const methodIndex = constantPool.registerEntry(attribute.method);
          customAssertInfoType(10, methodIndex, attribute.method);
          flushBuff.writeUnsignedInt(methodIndex, 2);
        } else {
          flushBuff.writeUnsignedInt(0, 2); // No method
        }
        break;
      }
      case "Synthetic": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        // Synthetic attributes do not have any data
        break;
      }
      case "Signature": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        const signatureEntry = {
          tag: 1,
          value: writer.assembleSignature(attribute.signature),
          index: 0,
        } as const;
        const signatureIndex = constantPool.registerEntry(signatureEntry);
        // Not needed because we generated the attribute
        //customAssertInfoType(1, signatureIndex, signatureEntry);
        constantPool.registerEntry(signatureEntry);
        flushBuff.writeUnsignedInt(signatureIndex, 2);
        break;
      }
      case "SourceFile": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        const sourceFileIndex = constantPool.registerEntry(
          attribute.sourcefile
        );
        customAssertInfoType(1, sourceFileIndex, attribute.sourcefile);
        flushBuff.writeUnsignedInt(sourceFileIndex, 2);
        break;
      }
      case "SourceDebugExtension": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeString(attribute.debugExtension, true);
        break;
      }
      case "LineNumberTable": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.lineNumberTable.length, 2);
        for (const line of attribute.lineNumberTable) {
          flushBuff.writeUnsignedInt(line.startPc, 2);
          flushBuff.writeUnsignedInt(line.lineNumber, 2);
        }
        break;
      }
      case "LocalVariableTable": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.localVariableTable.length, 2);
        for (const variable of attribute.localVariableTable) {
          flushBuff.writeUnsignedInt(variable.startPc, 2);
          flushBuff.writeUnsignedInt(variable.length, 2);
          const nameIndex = constantPool.registerEntry(variable.name);
          customAssertInfoType(1, nameIndex, variable.name);
          flushBuff.writeUnsignedInt(nameIndex, 2);
          const descriptorEntry: utf8Info = {
            tag: 1,
            value: assembleFieldDescriptor(variable.descriptor),
            index: 0,
          };
          const descriptorIndex = constantPool.registerEntry(descriptorEntry);
          // Not needed because we genereate it ourself
          // customAssertInfoType(1, descriptorIndex, variable.descriptor);
          flushBuff.writeUnsignedInt(descriptorIndex, 2);
          flushBuff.writeUnsignedInt(variable.index, 2);
        }
        break;
      }
      case "LocalVariableTypeTable": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.localVariableTypeTable.length, 2);
        for (const variable_type of attribute.localVariableTypeTable) {
          flushBuff.writeUnsignedInt(variable_type.startPc, 2);
          flushBuff.writeUnsignedInt(variable_type.length, 2);
          const nameIndex = constantPool.registerEntry(variable_type.name);
          customAssertInfoType(1, nameIndex, variable_type.name);
          flushBuff.writeUnsignedInt(nameIndex, 2);
          const signatureEntry: utf8Info = {
            tag: 1,
            value: assembleFieldTypeSignature(variable_type.signature),
            index: 0,
          };
          const signatureIndex = constantPool.registerEntry(signatureEntry);
          // Not needed because we genereate it ourself
          // customAssertInfoType(1, signatureIndex, variable_type.signature);
          flushBuff.writeUnsignedInt(signatureIndex, 2);
          flushBuff.writeUnsignedInt(variable_type.index, 2);
        }
        break;
      }
      case "Deprecated": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        // Contains no data
        break;
      }
      case "RuntimeVisibleAnnotations":
      case "RuntimeInvisibleAnnotations": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.annotations.length, 2);
        for (const annotation of attribute.annotations) {
          writeAnnotation(
            flushBuff,
            annotation,
            constantPool,
            customAssertInfoType
          );
        }
        break;
      }
      case "RuntimeVisibleParameterAnnotations":
      case "RuntimeInvisibleParameterAnnotations": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.push(attribute.parameterAnnotations.length);
        for (const parameter_annotation of attribute.parameterAnnotations) {
          flushBuff.writeUnsignedInt(parameter_annotation.length, 2);
          for (const annotation of parameter_annotation) {
            writeAnnotation(
              flushBuff,
              annotation,
              constantPool,
              customAssertInfoType
            );
          }
        }
        break;
      }

      case "RuntimeVisibleTypeAnnotations":
      case "RuntimeInvisibleTypeAnnotations": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.annotations.length, 2);
        for (const annotation of attribute.annotations) {
          writeTypeAnnotation(
            flushBuff,
            annotation,
            constantPool,
            customAssertInfoType,
            enclosingStructure
          );
        }
        break;
      }

      case "AnnotationDefault": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        writeElementValue(
          flushBuff,
          attribute.defaultValue,
          constantPool,
          customAssertInfoType
        );
        break;
      }
      case "BootstrapMethods": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.bootstrapMethods.length, 2);
        for (const bootstrapMethod of attribute.bootstrapMethods) {
          const bootstrapMethodIndex = constantPool.registerEntry(
            bootstrapMethod.bootstrapMethod
          );
          customAssertInfoType(
            1,
            bootstrapMethodIndex,
            bootstrapMethod.bootstrapMethod
          );
          flushBuff.writeUnsignedInt(bootstrapMethodIndex, 2);
          flushBuff.writeUnsignedInt(
            bootstrapMethod.bootstrapArguments.length,
            2
          );
          for (const bootstrapArgument of bootstrapMethod.bootstrapArguments) {
            const bootstrapArgumentIndex =
              constantPool.registerEntry(bootstrapArgument);
            customAssertInfoType(
              loadableTags,
              bootstrapArgumentIndex,
              bootstrapArgument
            );
            flushBuff.writeUnsignedInt(bootstrapArgumentIndex, 2);
          }
        }
        break;
      }
      case "MethodParameters": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.push(attribute.parameters.length);
        for (const parameter of attribute.parameters) {
          let nameIndex = 0;
          if (parameter.name !== undefined) {
            nameIndex = constantPool.registerEntry(parameter.name);
            customAssertInfoType(loadableTags, nameIndex, parameter.name);
          }
          flushBuff.writeUnsignedInt(nameIndex, 2);
          writeMethodParametersAccessFlags(flushBuff, parameter.accessFlags);
        }
        break;
      }
      case "Module": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.moduleName.index, 2);
        customAssertInfoType(
          7,
          attribute.moduleName.index,
          attribute.moduleName
        );
        writeModuleAttributeAccessFlags(flushBuff, attribute.moduleFlags);

        if (attribute.moduleVersion) {
          const versionIndex = constantPool.registerEntry(
            attribute.moduleVersion
          );
          customAssertInfoType(1, versionIndex, attribute.moduleVersion);
          flushBuff.writeUnsignedInt(versionIndex, 2);
        } else {
          flushBuff.writeUnsignedInt(0, 2); // No version
        }

        // Write requires
        flushBuff.writeUnsignedInt(attribute.requires.length, 2);
        for (const require of attribute.requires) {
          const requireIndex = constantPool.registerEntry(require.requires);
          customAssertInfoType(7, requireIndex, require.requires);
          flushBuff.writeUnsignedInt(requireIndex, 2);
          writeModuleAttributeRequiresAccessFlags(
            flushBuff,
            require.requiresFlags
          );
          if (require.requiresVersion) {
            const requireVersionIndex = constantPool.registerEntry(
              require.requiresVersion
            );
            customAssertInfoType(
              1,
              requireVersionIndex,
              require.requiresVersion
            );
            flushBuff.writeUnsignedInt(requireVersionIndex, 2);
          } else {
            flushBuff.writeUnsignedInt(0, 2); // No version
          }
        }

        // Write exports
        flushBuff.writeUnsignedInt(attribute.exports.length, 2);
        for (const exportEntry of attribute.exports) {
          const exportIndex = constantPool.registerEntry(exportEntry.exports);
          customAssertInfoType(7, exportIndex, exportEntry.exports);
          flushBuff.writeUnsignedInt(exportIndex, 2);
          writeModuleAttributeExportsFlags(flushBuff, exportEntry.exportsFlags);
          flushBuff.writeUnsignedInt(exportEntry.exportsTo.length, 2);
          for (const exportTo of exportEntry.exportsTo) {
            const exportToIndex = constantPool.registerEntry(exportTo);
            customAssertInfoType(7, exportToIndex, exportTo);
            flushBuff.writeUnsignedInt(exportToIndex, 2);
          }
        }

        // Write opens
        flushBuff.writeUnsignedInt(attribute.opens.length, 2);
        for (const open of attribute.opens) {
          const openIndex = constantPool.registerEntry(open.opens);
          customAssertInfoType(7, openIndex, open.opens);
          flushBuff.writeUnsignedInt(openIndex, 2);
          writeModuleAttributeOpensFlags(flushBuff, open.opensFlags);
          flushBuff.writeUnsignedInt(open.opensTo.length, 2);
          for (const opensTo of open.opensTo) {
            const opensToIndex = constantPool.registerEntry(opensTo);
            customAssertInfoType(7, opensToIndex, opensTo);
            flushBuff.writeUnsignedInt(opensToIndex, 2);
          }
        }

        // Write uses
        flushBuff.writeUnsignedInt(attribute.uses.length, 2);
        for (const use of attribute.uses) {
          const useIndex = constantPool.registerEntry(use);
          customAssertInfoType(7, useIndex, use);
          flushBuff.writeUnsignedInt(useIndex, 2);
        }

        // Write provides
        flushBuff.writeUnsignedInt(attribute.provides.length, 2);
        for (const provide of attribute.provides) {
          const provideIndex = constantPool.registerEntry(provide.provides);
          customAssertInfoType(7, provideIndex, provide.provides);
          flushBuff.writeUnsignedInt(provideIndex, 2);
          flushBuff.writeUnsignedInt(provide.providesWith.length, 2);
          for (const provideWith of provide.providesWith) {
            const provideWithIndex = constantPool.registerEntry(provideWith);
            customAssertInfoType(7, provideWithIndex, provideWith);
            flushBuff.writeUnsignedInt(provideWithIndex, 2);
          }
        }
        break;
      }
      case "ModulePackages": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.packages.length, 2);
        for (const package_ of attribute.packages) {
          const packageIndex = constantPool.registerEntry(package_);
          customAssertInfoType(20, packageIndex, package_);
          flushBuff.writeUnsignedInt(packageIndex, 2);
        }
        break;
      }
      case "ModuleMainClass": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        const mainClassIndex = constantPool.registerEntry(attribute.mainClass);
        customAssertInfoType(20, mainClassIndex, attribute.mainClass);
        flushBuff.writeUnsignedInt(mainClassIndex, 2);
        break;
      }
      case "NestHost": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        const hostClassIndex = constantPool.registerEntry(attribute.hostClass);
        customAssertInfoType(7, hostClassIndex, attribute.hostClass);
        flushBuff.writeUnsignedInt(hostClassIndex, 2);
        break;
      }
      case "NestMembers": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.classes.length, 2);
        for (const class_ of attribute.classes) {
          const classIndex = constantPool.registerEntry(class_);
          customAssertInfoType(7, classIndex, class_);
          flushBuff.writeUnsignedInt(classIndex, 2);
        }
        break;
      }
      case "Record": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.components.length, 2);
        for (const component of attribute.components) {
          const nameIndex = constantPool.registerEntry(component.name);
          customAssertInfoType(1, nameIndex, component.name);
          flushBuff.writeUnsignedInt(nameIndex, 2);
          const descriptorIndex = constantPool.registerEntry(
            component.descriptor
          );
          customAssertInfoType(1, descriptorIndex, component.descriptor);
          flushBuff.writeUnsignedInt(descriptorIndex, 2);
          // Attributes
          flushBuff.writeUnsignedInt(component.attributes.length, 2);
          for (const attribute of component.attributes) {
            assertAttributeType(
              predefinedValidClassFileAttributesMap.record_component_info,
              attribute,
              "Record component info structure"
            );
            writeAttribute(
              flushBuff,
              attribute,
              customAssertInfoType,
              "record_component_info",
              constantPool
            );
          }
        }
        break;
      }
      case "PermittedSubclasses": {
        attribute = attribute as Extract<
          attribute,
          { name: { value: typeof name } }
        >;
        flushBuff.writeUnsignedInt(attribute.classes.length, 2);
        for (const class_ of attribute.classes) {
          const classIndex = constantPool.registerEntry(class_);
          customAssertInfoType(7, classIndex, class_);
          flushBuff.writeUnsignedInt(classIndex, 2);
        }
        break;
      }
    }
  }
  // Write metadata
  const nameIndex = constantPool.registerEntry(attribute.name);
  customAssertInfoType(1, nameIndex, attribute.name);
  buffer.writeUnsignedInt(nameIndex, 2);
  buffer.writeUnsignedInt(flushBuff.length, 4);
  // Write attribute
  flushBuff.flush(buffer);
  if (flushBuff2.length > 0) {
    log(
      "warning",
      `Temporary Buffer flushBuff2 has leaked at attribute writer (flushBuff2, attribute dump: ${JSON.stringify(
        attribute
      )})`
    );
  }
}
