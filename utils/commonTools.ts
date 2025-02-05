import _ from "lodash";
import { v4 } from "uuid";
import { createHash, createHmac } from "crypto";

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const ret: any = {};
  keys.forEach((key) => {
    ret[key] = obj[key];
  });
  return ret;
}

export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const ret: any = { ...obj };
  keys.forEach((key) => {
    delete ret[key];
  });
  return ret;
}

export function deepCopy<T>(obj: T): T {
  if (obj === undefined || obj === null) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export function deepCopyUsingLodash<T>(obj: T): T {
  return _.cloneDeep(obj);
}

export function getConstOfType<T, P extends T>(t: T, x: P): P {
  return x;
}

export function isIn<T extends string, O extends T>(
  target: T | null | undefined,
  options: O[]
): boolean {
  if (!target) return false;
  return options.includes(target as any);
}

export function is<T extends string>(
  target: T | null | undefined
): { in: (...options: T[]) => boolean } {
  return {
    in: (...options: T[]) => isIn(target, options),
  };
}

export function checkType<T>(value: T): T {
  return value;
}

export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function delayMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 记录每个步骤的耗时与总耗时
export function steppedTimeTracer(name: string) {
  const startTime = new Date().getTime();
  let lastStepTime = startTime;
  const step = (stepName: string) => {
    const now = new Date().getTime();
    // 调试时按需启动
    // console.log(`[${name}] ${stepName} (+ ${now - lastStepTime}ms = ${now - startTime}ms)`)
    lastStepTime = now;
  };
  step("start");
  return step;
}

// 生成随机字符串
export function randomString(length: number) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let ret = "";
  for (let i = 0; i < length; i++) {
    ret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ret;
}

// 检查密码
export function checkPasswordStrength(password: string): string {
  if (password.length < 8) {
    return "密码长度至少为8位";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "密码必须包含字母";
  }
  if (!/[0-9]/.test(password)) {
    return "密码必须包含数字";
  }
  // 只能数字字母和部分特殊字符
  const validPassword = /^[a-zA-Z0-9~!@#$%^&*()_+`\-={}[\]|\\:;"'<>,.?/]+$/;
  if (!validPassword.test(password)) {
    return "密码只能包含数字、字母和普通符号（不含空格）";
  }
  return "";
}

export function randomCharInString(str: string) {
  return str.charAt(Math.floor(Math.random() * str.length));
}

export function moneyFloat(money: number | null | undefined) {
  return exists(money) ? _.round(money, 2) : money;
}

export function moneyEqual(
  moneyA: number | null | undefined,
  moneyB: number | null | undefined
) {
  return moneyFloat(moneyA) == moneyFloat(moneyB);
}

// 生成salt
export function generateSalt() {
  return randomString(32);
}

// 生成密码
export function generatePasswordWithSalt(password: string, salt: string) {
  // 根据明文密码和salt生成密码
  const hash = createHmac("sha512", salt); /**使用sha512算法进行hash*/
  hash.update(password);
  const value = hash.digest("hex");
  return {
    salt: salt,
    passwordHash: value,
  };
}

export function generatePassword(password: string) {
  return generatePasswordWithSalt(password, generateSalt());
}
