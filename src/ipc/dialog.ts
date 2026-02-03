import { ipcMain, dialog } from 'electron';

export function registerDialogHandlers() {
    // 选择单个文件
    ipcMain.handle('dialog:selectFile', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });

    // 选择多个文件
    ipcMain.handle('dialog:selectFiles', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths;
    });

    // 选择文件夹
    ipcMain.handle('dialog:selectFolder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });
}
