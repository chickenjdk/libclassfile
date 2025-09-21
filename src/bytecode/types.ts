import { Expand } from "@chickenjdk/common";
import { constantPoolEntry, PoolType } from "../constantPool/index.js";

interface mnemonic {
  mnemonic: string;
  format: string;
  wideFormat: string | null;
  resultType: string;
  stackEffect: number;
  canTrap: boolean;
  enumName: string;
  opcode: number;
}

// prettier-ignore
export const opcodeMnemonics = [{"mnemonic":"nop","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":0,"canTrap":false,"enumName":"_nop","opcode":0},{"mnemonic":"aconst_null","format":"","wideFormat":null,"resultType":"T_OBJECT","stackEffect":1,"canTrap":false,"enumName":"_aconst_null","opcode":1},{"mnemonic":"iconst_m1","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iconst_m1","opcode":2},{"mnemonic":"iconst_0","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iconst_0","opcode":3},{"mnemonic":"iconst_1","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iconst_1","opcode":4},{"mnemonic":"iconst_2","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iconst_2","opcode":5},{"mnemonic":"iconst_3","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iconst_3","opcode":6},{"mnemonic":"iconst_4","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iconst_4","opcode":7},{"mnemonic":"iconst_5","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iconst_5","opcode":8},{"mnemonic":"lconst_0","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":2,"canTrap":false,"enumName":"_lconst_0","opcode":9},{"mnemonic":"lconst_1","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":2,"canTrap":false,"enumName":"_lconst_1","opcode":10},{"mnemonic":"fconst_0","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":1,"canTrap":false,"enumName":"_fconst_0","opcode":11},{"mnemonic":"fconst_1","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":1,"canTrap":false,"enumName":"_fconst_1","opcode":12},{"mnemonic":"fconst_2","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":1,"canTrap":false,"enumName":"_fconst_2","opcode":13},{"mnemonic":"dconst_0","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":2,"canTrap":false,"enumName":"_dconst_0","opcode":14},{"mnemonic":"dconst_1","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":2,"canTrap":false,"enumName":"_dconst_1","opcode":15},{"mnemonic":"bipush","format":"c","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_bipush","opcode":16},{"mnemonic":"sipush","format":"cc","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_sipush","opcode":17},{"mnemonic":"ldc","format":"k","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":1,"canTrap":true,"enumName":"_ldc","opcode":18},{"mnemonic":"ldc_w","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":1,"canTrap":true,"enumName":"_ldc_w","opcode":19},{"mnemonic":"ldc2_w","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":2,"canTrap":true,"enumName":"_ldc2_w","opcode":20},{"mnemonic":"iload","format":"i","wideFormat":"ii","resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iload","opcode":21},{"mnemonic":"lload","format":"i","wideFormat":"ii","resultType":"T_LONG","stackEffect":2,"canTrap":false,"enumName":"_lload","opcode":22},{"mnemonic":"fload","format":"i","wideFormat":"ii","resultType":"T_FLOAT","stackEffect":1,"canTrap":false,"enumName":"_fload","opcode":23},{"mnemonic":"dload","format":"i","wideFormat":"ii","resultType":"T_DOUBLE","stackEffect":2,"canTrap":false,"enumName":"_dload","opcode":24},{"mnemonic":"aload","format":"i","wideFormat":"ii","resultType":"T_OBJECT","stackEffect":1,"canTrap":false,"enumName":"_aload","opcode":25},{"mnemonic":"iload_0","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iload_0","opcode":26},{"mnemonic":"iload_1","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iload_1","opcode":27},{"mnemonic":"iload_2","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iload_2","opcode":28},{"mnemonic":"iload_3","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":1,"canTrap":false,"enumName":"_iload_3","opcode":29},{"mnemonic":"lload_0","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":2,"canTrap":false,"enumName":"_lload_0","opcode":30},{"mnemonic":"lload_1","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":2,"canTrap":false,"enumName":"_lload_1","opcode":31},{"mnemonic":"lload_2","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":2,"canTrap":false,"enumName":"_lload_2","opcode":32},{"mnemonic":"lload_3","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":2,"canTrap":false,"enumName":"_lload_3","opcode":33},{"mnemonic":"fload_0","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":1,"canTrap":false,"enumName":"_fload_0","opcode":34},{"mnemonic":"fload_1","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":1,"canTrap":false,"enumName":"_fload_1","opcode":35},{"mnemonic":"fload_2","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":1,"canTrap":false,"enumName":"_fload_2","opcode":36},{"mnemonic":"fload_3","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":1,"canTrap":false,"enumName":"_fload_3","opcode":37},{"mnemonic":"dload_0","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":2,"canTrap":false,"enumName":"_dload_0","opcode":38},{"mnemonic":"dload_1","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":2,"canTrap":false,"enumName":"_dload_1","opcode":39},{"mnemonic":"dload_2","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":2,"canTrap":false,"enumName":"_dload_2","opcode":40},{"mnemonic":"dload_3","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":2,"canTrap":false,"enumName":"_dload_3","opcode":41},{"mnemonic":"aload_0","format":"","wideFormat":null,"resultType":"T_OBJECT","stackEffect":1,"canTrap":true,"enumName":"_aload_0","opcode":42},{"mnemonic":"aload_1","format":"","wideFormat":null,"resultType":"T_OBJECT","stackEffect":1,"canTrap":false,"enumName":"_aload_1","opcode":43},{"mnemonic":"aload_2","format":"","wideFormat":null,"resultType":"T_OBJECT","stackEffect":1,"canTrap":false,"enumName":"_aload_2","opcode":44},{"mnemonic":"aload_3","format":"","wideFormat":null,"resultType":"T_OBJECT","stackEffect":1,"canTrap":false,"enumName":"_aload_3","opcode":45},{"mnemonic":"iaload","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":true,"enumName":"_iaload","opcode":46},{"mnemonic":"laload","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":0,"canTrap":true,"enumName":"_laload","opcode":47},{"mnemonic":"faload","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":true,"enumName":"_faload","opcode":48},{"mnemonic":"daload","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":0,"canTrap":true,"enumName":"_daload","opcode":49},{"mnemonic":"aaload","format":"","wideFormat":null,"resultType":"T_OBJECT","stackEffect":-1,"canTrap":true,"enumName":"_aaload","opcode":50},{"mnemonic":"baload","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":true,"enumName":"_baload","opcode":51},{"mnemonic":"caload","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":true,"enumName":"_caload","opcode":52},{"mnemonic":"saload","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":true,"enumName":"_saload","opcode":53},{"mnemonic":"istore","format":"i","wideFormat":"ii","resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_istore","opcode":54},{"mnemonic":"lstore","format":"i","wideFormat":"ii","resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_lstore","opcode":55},{"mnemonic":"fstore","format":"i","wideFormat":"ii","resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_fstore","opcode":56},{"mnemonic":"dstore","format":"i","wideFormat":"ii","resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_dstore","opcode":57},{"mnemonic":"astore","format":"i","wideFormat":"ii","resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_astore","opcode":58},{"mnemonic":"istore_0","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_istore_0","opcode":59},{"mnemonic":"istore_1","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_istore_1","opcode":60},{"mnemonic":"istore_2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_istore_2","opcode":61},{"mnemonic":"istore_3","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_istore_3","opcode":62},{"mnemonic":"lstore_0","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_lstore_0","opcode":63},{"mnemonic":"lstore_1","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_lstore_1","opcode":64},{"mnemonic":"lstore_2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_lstore_2","opcode":65},{"mnemonic":"lstore_3","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_lstore_3","opcode":66},{"mnemonic":"fstore_0","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_fstore_0","opcode":67},{"mnemonic":"fstore_1","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_fstore_1","opcode":68},{"mnemonic":"fstore_2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_fstore_2","opcode":69},{"mnemonic":"fstore_3","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_fstore_3","opcode":70},{"mnemonic":"dstore_0","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_dstore_0","opcode":71},{"mnemonic":"dstore_1","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_dstore_1","opcode":72},{"mnemonic":"dstore_2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_dstore_2","opcode":73},{"mnemonic":"dstore_3","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_dstore_3","opcode":74},{"mnemonic":"astore_0","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_astore_0","opcode":75},{"mnemonic":"astore_1","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_astore_1","opcode":76},{"mnemonic":"astore_2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_astore_2","opcode":77},{"mnemonic":"astore_3","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_astore_3","opcode":78},{"mnemonic":"iastore","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":true,"enumName":"_iastore","opcode":79},{"mnemonic":"lastore","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-4,"canTrap":true,"enumName":"_lastore","opcode":80},{"mnemonic":"fastore","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":true,"enumName":"_fastore","opcode":81},{"mnemonic":"dastore","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-4,"canTrap":true,"enumName":"_dastore","opcode":82},{"mnemonic":"aastore","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":true,"enumName":"_aastore","opcode":83},{"mnemonic":"bastore","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":true,"enumName":"_bastore","opcode":84},{"mnemonic":"castore","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":true,"enumName":"_castore","opcode":85},{"mnemonic":"sastore","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":true,"enumName":"_sastore","opcode":86},{"mnemonic":"pop","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_pop","opcode":87},{"mnemonic":"pop2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_pop2","opcode":88},{"mnemonic":"dup","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":1,"canTrap":false,"enumName":"_dup","opcode":89},{"mnemonic":"dup_x1","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":1,"canTrap":false,"enumName":"_dup_x1","opcode":90},{"mnemonic":"dup_x2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":1,"canTrap":false,"enumName":"_dup_x2","opcode":91},{"mnemonic":"dup2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":2,"canTrap":false,"enumName":"_dup2","opcode":92},{"mnemonic":"dup2_x1","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":2,"canTrap":false,"enumName":"_dup2_x1","opcode":93},{"mnemonic":"dup2_x2","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":2,"canTrap":false,"enumName":"_dup2_x2","opcode":94},{"mnemonic":"swap","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":0,"canTrap":false,"enumName":"_swap","opcode":95},{"mnemonic":"iadd","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_iadd","opcode":96},{"mnemonic":"ladd","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":false,"enumName":"_ladd","opcode":97},{"mnemonic":"fadd","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":false,"enumName":"_fadd","opcode":98},{"mnemonic":"dadd","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":-2,"canTrap":false,"enumName":"_dadd","opcode":99},{"mnemonic":"isub","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_isub","opcode":100},{"mnemonic":"lsub","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":false,"enumName":"_lsub","opcode":101},{"mnemonic":"fsub","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":false,"enumName":"_fsub","opcode":102},{"mnemonic":"dsub","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":-2,"canTrap":false,"enumName":"_dsub","opcode":103},{"mnemonic":"imul","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_imul","opcode":104},{"mnemonic":"lmul","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":false,"enumName":"_lmul","opcode":105},{"mnemonic":"fmul","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":false,"enumName":"_fmul","opcode":106},{"mnemonic":"dmul","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":-2,"canTrap":false,"enumName":"_dmul","opcode":107},{"mnemonic":"idiv","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":true,"enumName":"_idiv","opcode":108},{"mnemonic":"ldiv","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":true,"enumName":"_ldiv","opcode":109},{"mnemonic":"fdiv","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":false,"enumName":"_fdiv","opcode":110},{"mnemonic":"ddiv","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":-2,"canTrap":false,"enumName":"_ddiv","opcode":111},{"mnemonic":"irem","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":true,"enumName":"_irem","opcode":112},{"mnemonic":"lrem","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":true,"enumName":"_lrem","opcode":113},{"mnemonic":"frem","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":false,"enumName":"_frem","opcode":114},{"mnemonic":"drem","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":-2,"canTrap":false,"enumName":"_drem","opcode":115},{"mnemonic":"ineg","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":0,"canTrap":false,"enumName":"_ineg","opcode":116},{"mnemonic":"lneg","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":0,"canTrap":false,"enumName":"_lneg","opcode":117},{"mnemonic":"fneg","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":0,"canTrap":false,"enumName":"_fneg","opcode":118},{"mnemonic":"dneg","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":0,"canTrap":false,"enumName":"_dneg","opcode":119},{"mnemonic":"ishl","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_ishl","opcode":120},{"mnemonic":"lshl","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-1,"canTrap":false,"enumName":"_lshl","opcode":121},{"mnemonic":"ishr","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_ishr","opcode":122},{"mnemonic":"lshr","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-1,"canTrap":false,"enumName":"_lshr","opcode":123},{"mnemonic":"iushr","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_iushr","opcode":124},{"mnemonic":"lushr","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-1,"canTrap":false,"enumName":"_lushr","opcode":125},{"mnemonic":"iand","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_iand","opcode":126},{"mnemonic":"land","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":false,"enumName":"_land","opcode":127},{"mnemonic":"ior","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_ior","opcode":128},{"mnemonic":"lor","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":false,"enumName":"_lor","opcode":129},{"mnemonic":"ixor","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_ixor","opcode":130},{"mnemonic":"lxor","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":false,"enumName":"_lxor","opcode":131},{"mnemonic":"iinc","format":"ic","wideFormat":"iicc","resultType":"T_VOID","stackEffect":0,"canTrap":false,"enumName":"_iinc","opcode":132},{"mnemonic":"i2l","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":1,"canTrap":false,"enumName":"_i2l","opcode":133},{"mnemonic":"i2f","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":0,"canTrap":false,"enumName":"_i2f","opcode":134},{"mnemonic":"i2d","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":1,"canTrap":false,"enumName":"_i2d","opcode":135},{"mnemonic":"l2i","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_l2i","opcode":136},{"mnemonic":"l2f","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":false,"enumName":"_l2f","opcode":137},{"mnemonic":"l2d","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":0,"canTrap":false,"enumName":"_l2d","opcode":138},{"mnemonic":"f2i","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":0,"canTrap":false,"enumName":"_f2i","opcode":139},{"mnemonic":"f2l","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":1,"canTrap":false,"enumName":"_f2l","opcode":140},{"mnemonic":"f2d","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":1,"canTrap":false,"enumName":"_f2d","opcode":141},{"mnemonic":"d2i","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":false,"enumName":"_d2i","opcode":142},{"mnemonic":"d2l","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":0,"canTrap":false,"enumName":"_d2l","opcode":143},{"mnemonic":"d2f","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":false,"enumName":"_d2f","opcode":144},{"mnemonic":"i2b","format":"","wideFormat":null,"resultType":"T_BYTE","stackEffect":0,"canTrap":false,"enumName":"_i2b","opcode":145},{"mnemonic":"i2c","format":"","wideFormat":null,"resultType":"T_CHAR","stackEffect":0,"canTrap":false,"enumName":"_i2c","opcode":146},{"mnemonic":"i2s","format":"","wideFormat":null,"resultType":"T_SHORT","stackEffect":0,"canTrap":false,"enumName":"_i2s","opcode":147},{"mnemonic":"lcmp","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":false,"enumName":"_lcmp","opcode":148},{"mnemonic":"fcmpl","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_fcmpl","opcode":149},{"mnemonic":"fcmpg","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_fcmpg","opcode":150},{"mnemonic":"dcmpl","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":false,"enumName":"_dcmpl","opcode":151},{"mnemonic":"dcmpg","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-3,"canTrap":false,"enumName":"_dcmpg","opcode":152},{"mnemonic":"ifeq","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_ifeq","opcode":153},{"mnemonic":"ifne","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_ifne","opcode":154},{"mnemonic":"iflt","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_iflt","opcode":155},{"mnemonic":"ifge","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_ifge","opcode":156},{"mnemonic":"ifgt","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_ifgt","opcode":157},{"mnemonic":"ifle","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_ifle","opcode":158},{"mnemonic":"if_icmpeq","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_if_icmpeq","opcode":159},{"mnemonic":"if_icmpne","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_if_icmpne","opcode":160},{"mnemonic":"if_icmplt","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_if_icmplt","opcode":161},{"mnemonic":"if_icmpge","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_if_icmpge","opcode":162},{"mnemonic":"if_icmpgt","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_if_icmpgt","opcode":163},{"mnemonic":"if_icmple","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_if_icmple","opcode":164},{"mnemonic":"if_acmpeq","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_if_acmpeq","opcode":165},{"mnemonic":"if_acmpne","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-2,"canTrap":false,"enumName":"_if_acmpne","opcode":166},{"mnemonic":"goto","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":0,"canTrap":false,"enumName":"_goto","opcode":167},{"mnemonic":"jsr","format":"oo","wideFormat":null,"resultType":"T_INT","stackEffect":0,"canTrap":false,"enumName":"_jsr","opcode":168},{"mnemonic":"ret","format":"i","wideFormat":"ii","resultType":"T_VOID","stackEffect":0,"canTrap":false,"enumName":"_ret","opcode":169},{"mnemonic":"tableswitch","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_tableswitch","opcode":170},{"mnemonic":"lookupswitch","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_lookupswitch","opcode":171},{"mnemonic":"ireturn","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":-1,"canTrap":true,"enumName":"_ireturn","opcode":172},{"mnemonic":"lreturn","format":"","wideFormat":null,"resultType":"T_LONG","stackEffect":-2,"canTrap":true,"enumName":"_lreturn","opcode":173},{"mnemonic":"freturn","format":"","wideFormat":null,"resultType":"T_FLOAT","stackEffect":-1,"canTrap":true,"enumName":"_freturn","opcode":174},{"mnemonic":"dreturn","format":"","wideFormat":null,"resultType":"T_DOUBLE","stackEffect":-2,"canTrap":true,"enumName":"_dreturn","opcode":175},{"mnemonic":"areturn","format":"","wideFormat":null,"resultType":"T_OBJECT","stackEffect":-1,"canTrap":true,"enumName":"_areturn","opcode":176},{"mnemonic":"return","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":0,"canTrap":true,"enumName":"_return","opcode":177},{"mnemonic":"getstatic","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":1,"canTrap":true,"enumName":"_getstatic","opcode":178},{"mnemonic":"putstatic","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":-1,"canTrap":true,"enumName":"_putstatic","opcode":179},{"mnemonic":"getfield","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":0,"canTrap":true,"enumName":"_getfield","opcode":180},{"mnemonic":"putfield","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":-2,"canTrap":true,"enumName":"_putfield","opcode":181},{"mnemonic":"invokevirtual","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":-1,"canTrap":true,"enumName":"_invokevirtual","opcode":182},{"mnemonic":"invokespecial","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":-1,"canTrap":true,"enumName":"_invokespecial","opcode":183},{"mnemonic":"invokestatic","format":"kk","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":0,"canTrap":true,"enumName":"_invokestatic","opcode":184},{"mnemonic":"invokeinterface","format":"kkb_","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":-1,"canTrap":true,"enumName":"_invokeinterface","opcode":185},{"mnemonic":"invokedynamic","format":"kk__","wideFormat":null,"resultType":"T_ILLEGAL","stackEffect":0,"canTrap":true,"enumName":"_invokedynamic","opcode":186},{"mnemonic":"new","format":"kk","wideFormat":null,"resultType":"T_OBJECT","stackEffect":1,"canTrap":true,"enumName":"_new","opcode":187},{"mnemonic":"newarray","format":"c","wideFormat":null,"resultType":"T_OBJECT","stackEffect":0,"canTrap":true,"enumName":"_newarray","opcode":188},{"mnemonic":"anewarray","format":"kk","wideFormat":null,"resultType":"T_OBJECT","stackEffect":0,"canTrap":true,"enumName":"_anewarray","opcode":189},{"mnemonic":"arraylength","format":"","wideFormat":null,"resultType":"T_INT","stackEffect":0,"canTrap":true,"enumName":"_arraylength","opcode":190},{"mnemonic":"athrow","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":true,"enumName":"_athrow","opcode":191},{"mnemonic":"checkcast","format":"kk","wideFormat":null,"resultType":"T_OBJECT","stackEffect":0,"canTrap":true,"enumName":"_checkcast","opcode":192},{"mnemonic":"instanceof","format":"kk","wideFormat":null,"resultType":"T_INT","stackEffect":0,"canTrap":true,"enumName":"_instanceof","opcode":193},{"mnemonic":"monitorenter","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":true,"enumName":"_monitorenter","opcode":194},{"mnemonic":"monitorexit","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":true,"enumName":"_monitorexit","opcode":195},{"mnemonic":"wide","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":0,"canTrap":false,"enumName":"_wide","opcode":196},{"mnemonic":"multianewarray","format":"kkc","wideFormat":null,"resultType":"T_OBJECT","stackEffect":1,"canTrap":true,"enumName":"_multianewarray","opcode":197},{"mnemonic":"ifnull","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_ifnull","opcode":198},{"mnemonic":"ifnonnull","format":"oo","wideFormat":null,"resultType":"T_VOID","stackEffect":-1,"canTrap":false,"enumName":"_ifnonnull","opcode":199},{"mnemonic":"goto_w","format":"oooo","wideFormat":null,"resultType":"T_VOID","stackEffect":0,"canTrap":false,"enumName":"_goto_w","opcode":200},{"mnemonic":"jsr_w","format":"oooo","wideFormat":null,"resultType":"T_INT","stackEffect":0,"canTrap":false,"enumName":"_jsr_w","opcode":201},{"mnemonic":"breakpoint","format":"","wideFormat":null,"resultType":"T_VOID","stackEffect":0,"canTrap":true,"enumName":"_breakpoint","opcode":202}] as const;

// Actual types
export const typeMapping = {
  b: "number",
  c: "number",
  k: "number",
  i: "number",
  s: "number",
  u: "number",
  n: "number",
  l: "bigint",
  o: "number",
  J: "number",
  _: "never",
  w: "never",
} as const;

// Format char types
export interface SignedByteOperand {
  type: "signedByte";
  size: 1;
  value: number;
  signed: true;
  description: "A signed byte (-128 to 127)";
  formatChar: "c";
}
export interface UnsignedByteOperand {
  type: "unsignedByte";
  size: 1;
  value: number;
  signed: false;
  description: "An unsigned byte (0 to 255)";
  formatChar: "b";
}
export interface BranchByteOperand {
  type: "branchByte";
  size: 1;
  value: number;
  signed: true;
  description: "A signed byte used for branch offsets (-128 to 127)";
  formatChar: "o";
}
export interface ConstantPoolEntryOperandShort {
  type: "constantPoolEntryShort";
  size: 1;
  value: constantPoolEntry;
  signed: false;
  description: "A constant pool entry (index 0 to 255)";
  formatChar: "k";
}
export interface ConstantPoolEntryOperand {
  type: "constantPoolEntry";
  size: 2;
  value: constantPoolEntry;
  signed: false;
  description: "A constant pool entry (index 0 to 65535)";
  formatChar: "kk";
}
export interface LocalVariableIndexOperand {
  type: "localVariableIndex";
  size: 1;
  value: number;
  signed: false;
  description: "An index into the local variable array (0 to 255)";
  formatChar: "i";
}
export interface SignedShortOperand {
  type: "signedShort";
  size: 2;
  value: number;
  signed: true;
  description: "A signed short (-32768 to 32767)";
  formatChar: "s";
}
export interface UnsignedShortOperand {
  type: "unsignedShort";
  size: 2;
  value: number;
  signed: false;
  description: "An unsigned short (0 to 65535)";
  formatChar: "u";
}
export interface SignedIntOperand {
  type: "signedInt";
  size: 4;
  value: number;
  signed: true;
  description: "A signed integer (-2147483648 to 2147483647)";
  formatChar: "n";
}
export interface SignedLongOperand {
  type: "signedLong";
  size: 8;
  value: bigint;
  signed: true;
  description: "A signed long integer (-2^63 to 2^63-1)";
  formatChar: "l";
}
// Special operands
export interface JumpOffsettsOperand {
  type: "jumpOffsets";
  size: number;
  value: SignedIntOperand[];
  signed: true;
  description: "A list of jump offsets (used in the tableswitch instruction)";
  formatChar: undefined;
}
export interface MatchOffsetPairsOperand {
  type: "matchOffsetPairs";
  size: number;
  value: [SignedIntOperand, SignedIntOperand][];
  signed: true;
  description: "A list of match-offset pairs (used in the lookupswitch instruction)";
  formatChar: undefined;
}
export type operands =
  | SignedByteOperand
  | UnsignedByteOperand
  | BranchByteOperand
  | ConstantPoolEntryOperandShort
  | ConstantPoolEntryOperand
  | LocalVariableIndexOperand
  | SignedShortOperand
  | UnsignedShortOperand
  | SignedIntOperand
  | SignedLongOperand
  | JumpOffsettsOperand
  | MatchOffsetPairsOperand;
type formatCharMapping = {
  [K in Extract<operands["formatChar"], string>]: Extract<
    operands,
    { formatChar: K }
  >;
};
// Join ks
export type remapBytecodeFormat<
  T extends string,
  lastWasK extends boolean = false
> = T extends `${infer first extends keyof typeMapping}${infer rest}`
  ? lastWasK extends true
    ? first extends "k"
      ? ["kk", ...remapBytecodeFormat<rest, false>]
      : ["k", first, ...remapBytecodeFormat<rest, false>]
    : first extends "k"
    ? remapBytecodeFormat<rest, true>
    : [first, ...remapBytecodeFormat<rest, false>]
  : lastWasK extends true
  ? ["k"]
  : [];
type formatParseHelper2<T extends string[]> = T extends [
  infer first,
  ...infer rest extends string[]
]
  ? first extends keyof formatCharMapping
  ? [formatCharMapping[first], ...formatParseHelper2<rest>]
  : formatParseHelper2<rest>
  : [];
type formatParse<T extends string> = formatParseHelper2<remapBytecodeFormat<T>>;
// new key: old key
type keyMappings<wide extends boolean> = {
  opcode: "opcode";
  mnemonic: "mnemonic";
  resultType: "resultType";
  stackEffect: "stackEffect";
  canTrap: "canTrap";
} & (wide extends true ? { operands: "format" } : { operands: "format" });
type distributed<
  T extends (typeof opcodeMnemonics)[number] = (typeof opcodeMnemonics)[number]
> = T extends any
  ?
      | {
          [K in keyof keyMappings<false>]: keyMappings<true>[K] extends infer v extends keyof T
            ? T[v]
            : never;
        }
      | (T["wideFormat"] extends null
          ? never
          : {
              [K in keyof keyMappings<true>]: keyMappings<true>[K] extends infer v extends keyof T
                ? T[v]
                : never;
            })
  : never;
type distributed2<T extends distributed = distributed> = T extends any
  ? T & { pos: number; wide: boolean }
  : never;
type specialCasesv2 = {
  0xaa: [
    SignedIntOperand,
    SignedIntOperand,
    SignedIntOperand,
    JumpOffsettsOperand
  ];
  0xab: [SignedIntOperand, MatchOffsetPairsOperand];
};
type distributed3<T extends distributed2 = distributed2> = T extends any
  ? Omit<T, "operands"> & { operands: formatParse<T["operands"]> }
  : never;
type distributed4<T extends distributed3 = distributed3> = T extends any
  ? T["opcode"] extends keyof specialCasesv2
    ? Omit<T, "operands"> & { operands: specialCasesv2[T["opcode"]] }
    : T
  : never;

export type typeMapping = {
  [K in keyof typeof typeMapping]: (typeof typeMapping)[K] extends "number"
    ? number
    : (typeof typeMapping)[K] extends "bigint"
    ? bigint
    : never;
};
/**
 * A union of the bytecode inctruction types possible
 */
export type BytecodeInstruction = Expand<distributed4, constantPoolEntry | operands>;