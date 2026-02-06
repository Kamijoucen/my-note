import { registerDialogHandlers } from './dialog';
import { registerProjectHandlers } from './project';
import { registerConfigHandlers } from './config';

/**
 * 统一注册所有 IPC handlers
 * 在 app ready 之后调用
 */
export function registerAllHandlers() {
  registerConfigHandlers();
  registerDialogHandlers();
  registerProjectHandlers();
}
