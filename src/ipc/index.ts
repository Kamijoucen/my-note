import { registerDialogHandlers } from './dialog';
import { registerProjectHandlers } from './project';
import { registerConfigHandlers } from './config';
import { registerCardHandlers } from './card';
import { registerSummaryHandlers } from './summary';
import { registerAnalysisDocHandlers } from './analysisDoc';

/**
 * 统一注册所有 IPC handlers
 * 在 app ready 之后调用
 */
export function registerAllHandlers() {
  registerConfigHandlers();
  registerDialogHandlers();
  registerProjectHandlers();
  registerCardHandlers();
  registerSummaryHandlers();
  registerAnalysisDocHandlers();
}
