import { registerDialogHandlers } from './dialog';

/**
 * 统一注册所有 IPC handlers
 * 在 app ready 之后调用
 */
export function registerAllHandlers() {
  registerDialogHandlers();
  // 后续添加其他模块:
  // registerFileHandlers();
  // registerSystemHandlers();
}
