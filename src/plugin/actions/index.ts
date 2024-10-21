import * as Move from './_move'


const Modules: ActionModule[] = [
  Move,
]


export function canHandleMessage(msg: UIMessage) {
  return Modules.some((mod) => mod.canHandleMessage(msg))
}

export async function handleMessage(msg: UIMessage) {
  if (!canHandleMessage(msg)) { return }

  for (const mod of Modules) {
    if (mod.canHandleMessage(msg)) {
      await mod.handleMessage(msg)
    }
  }
}
