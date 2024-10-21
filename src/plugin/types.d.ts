/* Custom Typings */
interface UIMessage {
  action: string
  [key: string]: any
}

interface ActionModule {
  canHandleMessage(msg: UIMessage): boolean
  handleMessage(msg: UIMessage): Promise<void>
}
