declare type BoundingRect = Rect | null


// find the smallest rectangular area that contains all visible page children
async function getVisibleContentBoundaries() {
  const contentBounds = {
    x: 0,  x2: 0,  width: 0,
    y: 0,  y2: 0,  height: 0,
  }

  for (const child of figma.currentPage.children) {
    const childBounds = await getNodeBounds(child)
    if (!childBounds) { continue }

    // ignore invisible children
    if ('visible' in child) {
      if (!child.visible) { continue }
    }

    const { x, y, width, height } = childBounds
    const x2 = x + width
    const y2 = y + height

    contentBounds.x = Math.min(x, contentBounds.x)
    contentBounds.y = Math.min(y, contentBounds.y)

    contentBounds.x2 = Math.max(x2, contentBounds.x2)
    contentBounds.y2 = Math.max(y2, contentBounds.y2)
  }

  return contentBounds
}


async function getNodeBounds(node: any): Promise<BoundingRect> {
  // if node can clip content but doesn't 
  // (i.e., children might overflow parent boundaries)
  if (('clipsContent' in node) && !node.clipsContent) {
    if ('absoluteRenderBounds' in node) { 
      return node.absoluteRenderBounds
    }
  }

  if ('absoluteBoundingBox' in node) { 
    return node.absoluteBoundingBox
  }

  // fails to provide useful data 
  return null
}



export {
  getNodeBounds,
  getVisibleContentBoundaries,
}
