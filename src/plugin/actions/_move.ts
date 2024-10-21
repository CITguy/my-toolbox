export const ACTION = 'move'

export function canHandleMessage(msg: UIMessage): boolean {
  return (msg.action === ACTION)
}

export async function handleMessage(msg: UIMessage) {
  if (!canHandleMessage(msg)) { 
    return 
  }

  const node = figma.currentPage?.selection[0]
  if (!node) { return }

  switch(msg.direction) {
    case 'front':
      moveNodeToFront(node)
      break

    case 'back':
      moveNodeToBack(node)
      break

    case 'relative':
      const step = Number(msg?.step)
      moveNodeRelative(node, step)
      break

    default:
      // nothing to do
      break
  }
}



export function moveNodeRelative(node: SceneNode, step: number = 1) {
  //console.log(`[move:${step}] "${node.name}" [${node.id}]`)
  if (!node.parent) { return }
  if (step === 0) { return }

  // When step is positive (moving forward) we have to increase the step by 1 
  // in order to account for post-insertion reindexing needed to free up the old index.
  const actualStep = (step > 0) ? step + 1 : step
  const children = node.parent.children
  const oldIndex = children.indexOf(node)
  const newIndex = Math.max(0, Math.min(children.length, oldIndex + actualStep))

  // insertChild(idx, node)
  //  - idx is the index you aim for BEFORE any reindexing might occur
  //  - reindexing will happen when re-inserting (reordering) existing children
  //  - this only seems to matter when reordering a child to a higher index
  node.parent.insertChild(newIndex, node)
}

// TODO: drop?
export function moveNodeForward(node: SceneNode, step: number = 1) {
  //console.log(`[moveForward:${step}] "${node.name}" [${node.id}]`)
  moveNodeRelative(node, step)
}

// TODO: drop?
export function moveNodeBackward(node: SceneNode, step: number = 1) {
  //console.log(`[moveBackward:${step}] "${node.name}" [${node.id}]`)
  moveNodeRelative(node, 0 - step)
}

export function moveNodeToFront(node: SceneNode) {
  //console.log(`[moveToFront] "${node.name}" [${node.id}]`)
  if (!node.parent) { return }

  const idx = node.parent.children.length // max index (top)
  node.parent.insertChild(idx, node)
}

export function moveNodeToBack(node: SceneNode) {
  //console.log(`[moveToBack] "${node.name}" [${node.id}]`)
  if (!node.parent) { return }

  node.parent.insertChild(0, node)
}
