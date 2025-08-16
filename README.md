# libclassfile

Parse class files with ease. Nearly completely up to the specs at [https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html](https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html) and strongly typed. [Docs](https://chickenjdk.github.io/libclassfile/docs/v2.1.0)

# Use

First, install @chickenjdk/byteutils

## Example use:

In this example, there is a file called main.class in the dir, with this source code

```java
public class main
{
    public static void main(String[] args)
    {
        System.out.println("Hello, world! Test test!");
    }
}
```

Example use code

```js
const { readClassFile } = require("libclassfile");
const { readFileSync } = require("fs");
const { readableBuffer } = require("@chickenjdk/byteutils");
const testFile = readFileSync("./main.class");
console.log(JSON.stringify(readClassFile(new readableBuffer(testFile))));
```

### Example output:

Parsed class file of source code with this package

```json
{
  "minorVersion": 0,
  "majorVersion": 52,
  "constantPool": {
    "1": {
      "class": {
        "name": { "value": "java/lang/Object", "tag": 1, "index": 4 },
        "tag": 7,
        "index": 2
      },
      "nameAndType": {
        "name": { "value": "<init>", "tag": 1, "index": 5 },
        "descriptor": { "value": "()V", "tag": 1, "index": 6 },
        "tag": 12,
        "index": 3
      },
      "tag": 10,
      "index": 1
    },
    "2": {
      "name": { "value": "java/lang/Object", "tag": 1, "index": 4 },
      "tag": 7,
      "index": 2
    },
    "3": {
      "name": { "value": "<init>", "tag": 1, "index": 5 },
      "descriptor": { "value": "()V", "tag": 1, "index": 6 },
      "tag": 12,
      "index": 3
    },
    "4": { "value": "java/lang/Object", "tag": 1, "index": 4 },
    "5": { "value": "<init>", "tag": 1, "index": 5 },
    "6": { "value": "()V", "tag": 1, "index": 6 },
    "7": {
      "class": {
        "name": { "value": "java/lang/System", "tag": 1, "index": 10 },
        "tag": 7,
        "index": 8
      },
      "nameAndType": {
        "name": { "value": "out", "tag": 1, "index": 11 },
        "descriptor": {
          "value": "Ljava/io/PrintStream;",
          "tag": 1,
          "index": 12
        },
        "tag": 12,
        "index": 9
      },
      "tag": 9,
      "index": 7
    },
    "8": {
      "name": { "value": "java/lang/System", "tag": 1, "index": 10 },
      "tag": 7,
      "index": 8
    },
    "9": {
      "name": { "value": "out", "tag": 1, "index": 11 },
      "descriptor": { "value": "Ljava/io/PrintStream;", "tag": 1, "index": 12 },
      "tag": 12,
      "index": 9
    },
    "10": { "value": "java/lang/System", "tag": 1, "index": 10 },
    "11": { "value": "out", "tag": 1, "index": 11 },
    "12": { "value": "Ljava/io/PrintStream;", "tag": 1, "index": 12 },
    "13": {
      "value": { "value": "Hello, world! Test test!", "tag": 1, "index": 14 },
      "tag": 8,
      "index": 13
    },
    "14": { "value": "Hello, world! Test test!", "tag": 1, "index": 14 },
    "15": {
      "class": {
        "name": { "value": "java/io/PrintStream", "tag": 1, "index": 18 },
        "tag": 7,
        "index": 16
      },
      "nameAndType": {
        "name": { "value": "println", "tag": 1, "index": 19 },
        "descriptor": {
          "value": "(Ljava/lang/String;)V",
          "tag": 1,
          "index": 20
        },
        "tag": 12,
        "index": 17
      },
      "tag": 10,
      "index": 15
    },
    "16": {
      "name": { "value": "java/io/PrintStream", "tag": 1, "index": 18 },
      "tag": 7,
      "index": 16
    },
    "17": {
      "name": { "value": "println", "tag": 1, "index": 19 },
      "descriptor": { "value": "(Ljava/lang/String;)V", "tag": 1, "index": 20 },
      "tag": 12,
      "index": 17
    },
    "18": { "value": "java/io/PrintStream", "tag": 1, "index": 18 },
    "19": { "value": "println", "tag": 1, "index": 19 },
    "20": { "value": "(Ljava/lang/String;)V", "tag": 1, "index": 20 },
    "21": {
      "name": { "value": "main", "tag": 1, "index": 22 },
      "tag": 7,
      "index": 21
    },
    "22": { "value": "main", "tag": 1, "index": 22 },
    "23": { "value": "Code", "tag": 1, "index": 23 },
    "24": { "value": "LineNumberTable", "tag": 1, "index": 24 },
    "25": { "value": "([Ljava/lang/String;)V", "tag": 1, "index": 25 },
    "26": { "value": "SourceFile", "tag": 1, "index": 26 },
    "27": { "value": "main.java", "tag": 1, "index": 27 }
  },
  "accessFlags": {
    "isPublic": true,
    "isFinal": false,
    "isSuper": true,
    "isInterface": false,
    "isAbstract": false,
    "isAnnotation": false,
    "isEnum": false,
    "isModule": false
  },
  "thisClass": {
    "name": { "value": "main", "tag": 1, "index": 22 },
    "tag": 7,
    "index": 21
  },
  "superClass": {
    "name": { "value": "java/lang/Object", "tag": 1, "index": 4 },
    "tag": 7,
    "index": 2
  },
  "interfaces": [],
  "fields": [],
  "methods": [
    {
      "accessFlags": {
        "isPublic": true,
        "isPrivate": false,
        "isProtected": false,
        "isStatic": false,
        "isFinal": false,
        "isSynchronized": false,
        "isBridge": false,
        "isVarargs": false,
        "isNative": false,
        "isAbstract": false,
        "isStrict": false,
        "isSynthetic": false
      },
      "name": { "value": "<init>", "tag": 1, "index": 5 },
      "descriptor": { "value": "()V", "tag": 1, "index": 6 },
      "attributes": [
        {
          "name": { "value": "Code", "tag": 1, "index": 23 },
          "known": true,
          "maxStack": 1,
          "maxLocals": 1,
          "code": [
            {
              "pos": 0,
              "opcode": 42,
              "mnemonic": "aload_0",
              "operands": [],
              "wide": false,
              "ctx": {}
            },
            {
              "pos": 1,
              "opcode": 183,
              "mnemonic": "invokespecial",
              "operands": [0, 1],
              "wide": false,
              "ctx": {
                "1": {
                  "class": {
                    "name": {
                      "value": "java/lang/Object",
                      "tag": 1,
                      "index": 4
                    },
                    "tag": 7,
                    "index": 2
                  },
                  "nameAndType": {
                    "name": { "value": "<init>", "tag": 1, "index": 5 },
                    "descriptor": { "value": "()V", "tag": 1, "index": 6 },
                    "tag": 12,
                    "index": 3
                  },
                  "tag": 10,
                  "index": 1
                }
              }
            },
            {
              "pos": 4,
              "opcode": 177,
              "mnemonic": "return",
              "operands": [],
              "wide": false,
              "ctx": {}
            }
          ],
          "exceptionTable": [],
          "attributes": [
            {
              "name": { "value": "LineNumberTable", "tag": 1, "index": 24 },
              "known": true,
              "lineNumberTable": [{ "startPc": 0, "lineNumber": 1 }]
            }
          ]
        }
      ]
    },
    {
      "accessFlags": {
        "isPublic": true,
        "isPrivate": false,
        "isProtected": false,
        "isStatic": true,
        "isFinal": false,
        "isSynchronized": false,
        "isBridge": false,
        "isVarargs": false,
        "isNative": false,
        "isAbstract": false,
        "isStrict": false,
        "isSynthetic": false
      },
      "name": { "value": "main", "tag": 1, "index": 22 },
      "descriptor": {
        "value": "([Ljava/lang/String;)V",
        "tag": 1,
        "index": 25
      },
      "attributes": [
        {
          "name": { "value": "Code", "tag": 1, "index": 23 },
          "known": true,
          "maxStack": 2,
          "maxLocals": 1,
          "code": [
            {
              "pos": 0,
              "opcode": 178,
              "mnemonic": "getstatic",
              "operands": [0, 7],
              "wide": false,
              "ctx": {
                "7": {
                  "class": {
                    "name": {
                      "value": "java/lang/System",
                      "tag": 1,
                      "index": 10
                    },
                    "tag": 7,
                    "index": 8
                  },
                  "nameAndType": {
                    "name": { "value": "out", "tag": 1, "index": 11 },
                    "descriptor": {
                      "value": "Ljava/io/PrintStream;",
                      "tag": 1,
                      "index": 12
                    },
                    "tag": 12,
                    "index": 9
                  },
                  "tag": 9,
                  "index": 7
                }
              }
            },
            {
              "pos": 3,
              "opcode": 18,
              "mnemonic": "ldc",
              "operands": [13],
              "wide": false,
              "ctx": {
                "13": {
                  "value": {
                    "value": "Hello, world! Test test!",
                    "tag": 1,
                    "index": 14
                  },
                  "tag": 8,
                  "index": 13
                }
              }
            },
            {
              "pos": 5,
              "opcode": 182,
              "mnemonic": "invokevirtual",
              "operands": [0, 15],
              "wide": false,
              "ctx": {
                "15": {
                  "class": {
                    "name": {
                      "value": "java/io/PrintStream",
                      "tag": 1,
                      "index": 18
                    },
                    "tag": 7,
                    "index": 16
                  },
                  "nameAndType": {
                    "name": { "value": "println", "tag": 1, "index": 19 },
                    "descriptor": {
                      "value": "(Ljava/lang/String;)V",
                      "tag": 1,
                      "index": 20
                    },
                    "tag": 12,
                    "index": 17
                  },
                  "tag": 10,
                  "index": 15
                }
              }
            },
            {
              "pos": 8,
              "opcode": 177,
              "mnemonic": "return",
              "operands": [],
              "wide": false,
              "ctx": {}
            }
          ],
          "exceptionTable": [],
          "attributes": [
            {
              "name": { "value": "LineNumberTable", "tag": 1, "index": 24 },
              "known": true,
              "lineNumberTable": [
                { "startPc": 0, "lineNumber": 5 },
                { "startPc": 8, "lineNumber": 6 }
              ]
            }
          ]
        }
      ]
    }
  ],
  "attributes": [
    {
      "name": { "value": "SourceFile", "tag": 1, "index": 26 },
      "known": true,
      "sourcefile": { "value": "main.java", "tag": 1, "index": 27 }
    }
  ]
}
```
