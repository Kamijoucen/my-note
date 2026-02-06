export type { Protocol } from './types'
export { ElectronProtocol } from './electronProtocol'

import { ElectronProtocol } from './electronProtocol'
import type { Protocol } from './types'

/**
 * 全局 Protocol 单例
 *
 * 当前固定为 ElectronProtocol。后续迁移 Web 时可在此处
 * 根据运行环境切换实现，业务代码无需改动。
 */
export const protocol: Protocol = new ElectronProtocol()
