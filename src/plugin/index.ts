import * as Actions from './actions'
import { getVisibleContentBoundaries } from './_utils'



// This file is the entry point for your plugin logic.
//
// Code loaded in this file has access to the _figma document_ via the `figma` 
// global object.  
//
// Browser APIs can be accessed via logic in your UI code which has a full browser
// environment (see https://www.figma.com/plugin-docs/how-plugins-run).




/* ---------------------------------------- *\
 * UI Setup & Message Handling
\* ---------------------------------------- */
// This will launch an <iframe> containing the HTML page configured in `manifest.json#ui`
figma.showUI(__html__);

// Calls to "parent.postMessage" from the UI will trigger this callback. 
// The callback will be passed the "pluginMessage" property of the posted message.
//
// From trial-and-error, each message should provide an `action` to help route
// plugin logic to the correct functionality.
figma.ui.onmessage = async (msg: UIMessage) => {
  if (Actions.canHandleMessage(msg)) {
    await Actions.handleMessage(msg)
    return
  }

  // WIP actions
  switch(msg.action) {
    case 'show-occupied-area':
      _showOccupiedRect()
      break

    default:
      figma.notify(`Unsupported action: "${msg.action}"`)
      break
  }
}



/* ---------------------------------------- *\
 * Figma Event Handling
\* ---------------------------------------- */
figma.on('selectionchange', function () {
  // FYI: no event object provided
  _syncUI()
})
/*
figma.on('currentpagechange', () => {
  console.log('HEARD: "currentpagechange" event')
  console.log('current page id', figma.currentPage.id)
  //console.log('adding @nodechange event handler')

  _reapplyCurrentPageEventHandlers()
})
*/




function initialize() {
  //_reapplyCurrentPageEventHandlers()

  _syncUI()
}

initialize()


// ----------------------------------------------------------

// Send messages to UI to keep it in sync with Figma events.
function _syncUI() {
  figma.ui.postMessage({
    type: 'selectionchange',
    count: figma.currentPage.selection.length,
  })
}

/*
function _reapplyCurrentPageEventHandlers() {
  // cleanup & reapply currentPage event handlers
  _removeCurrentPageEventHandlers()
  _addCurrentPageEventHandlers()
}
function _removeCurrentPageEventHandlers() {
  figma.currentPage.off('nodechange', _onNodechange)
}
function _addCurrentPageEventHandlers() {
  figma.currentPage.on('nodechange', _onNodechange)
}
function _onNodechange(evt: NodeChangeEvent) {
  console.log('HEARD: "nodechange" event')
  console.log('current page id', figma.currentPage.id)
  //console.log(evt.nodeChanges)
}
*/



/* FIXME
// This persists across pages, which means that nodes in this cache 
// may not exist on the current page.
const RectangleNodeCache = new Map<String, RectangleNode>()
*/


// (proof-of-concept)
// FIXME: only acts on 1st selection (if present)

// (Proof-of-concept)
// Place a 50% opacity, red rectangle on the page to visualize the visibly-occupied 
// area.  This will be helpful for debugging when we want to generate NEW content 
// that doesn't overlap EXISTING content.
async function _showOccupiedRect() {
  const { x, y, x2, y2 } = await getVisibleContentBoundaries()
  const width  = x2 - x
  const height = y2 - y

  // TODO: It'd be nice if we could reuse an existing rect, if it's present.
  //       This would likely require managing a cache of debugging nodes for 
  //       each page in the document. However, doing so would require loading
  //       the entire document in memory (which isn't performant) in order to 
  //       react to page change events.
  const rect = figma.createRectangle()

  rect.name = '[debugging] Occupied Content Area'
  rect.x = x
  rect.y = y

  // Show as red rectangle @ 50%
  rect.fills = [ figma.util.solidPaint('#ff0000') ]
  rect.opacity = 0.5

  rect.visible = true
  rect.resize(width, height)
}


/*
  interface DimensionAndPositionMixin {
    x: number
    y: number
    readonly width: number
    readonly height: number
    minWidth: number | null
    maxWidth: number | null
    minHeight: number | null
    maxHeight: number | null
    relativeTransform: Transform
    readonly absoluteTransform: Transform
    readonly absoluteBoundingBox: Rect | null
  }

  interface AutoLayoutChildrenMixin {
    layoutAlign: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'INHERIT'
    layoutGrow: number
    layoutPositioning: 'AUTO' | 'ABSOLUTE'
  }

  interface LayoutMixin extends DimensionAndPositionMixin, AutoLayoutChildrenMixin {
    readonly absoluteRenderBounds: Rect | null
    constrainProportions: boolean
    rotation: number
    layoutSizingHorizontal: 'FIXED' | 'HUG' | 'FILL'
    layoutSizingVertical: 'FIXED' | 'HUG' | 'FILL'
    resize(width: number, height: number): void
    resizeWithoutConstraints(width: number, height: number): void
    rescale(scale: number): void
  }

  interface BaseFrameMixin
    extends BaseNodeMixin,
      SceneNodeMixin,
      ChildrenMixin,
      ContainerMixin,
      DeprecatedBackgroundMixin,
      GeometryMixin,
      CornerMixin,
      RectangleCornerMixin,
      BlendMixin,
      ConstraintMixin,
      LayoutMixin,
      ExportMixin,
      IndividualStrokesMixin,
      AutoLayoutMixin,
      AnnotationsMixin,
      DevStatusMixin { ... }

  interface DefaultFrameMixin 
    extends BaseFrameMixin, 
      FramePrototypingMixin, 
      ReactionMixin {}

  interface DefaultShapeMixin
    extends BaseNodeMixin,
      SceneNodeMixin,
      ReactionMixin,
      BlendMixin,
      GeometryMixin,
      LayoutMixin,
      ExportMixin {}

  interface OpaqueNodeMixin
    extends BaseNodeMixin,
      SceneNodeMixin,
      ExportMixin,
      DimensionAndPositionMixin {}


  interface BooleanOperationNode
    extends DefaultShapeMixin,
      ChildrenMixin,
      CornerMixin,
      ContainerMixin { ... }

  interface ComponentNode
    extends DefaultFrameMixin,
      PublishableMixin,
      VariantMixin,
      ComponentPropertiesMixin { ... }

  interface ComponentSetNode 
    extends BaseFrameMixin, 
      PublishableMixin, 
      ComponentPropertiesMixin { ... }

  interface FrameNode extends DefaultFrameMixin { ... }

  interface GroupNode
    extends BaseNodeMixin,
      SceneNodeMixin,
      ReactionMixin,
      ChildrenMixin,
      ContainerMixin,
      DeprecatedBackgroundMixin,
      BlendMixin,
      LayoutMixin,
      ExportMixin { ... }

  interface InstanceNode extends DefaultFrameMixin, VariantMixin { ... }

  interface SliceNode 
    extends BaseNodeMixin, 
      SceneNodeMixin, 
      LayoutMixin, 
      ExportMixin { ... }

  - VectorNode < DefaultShapeMixin
  - StarNode < DefaultShapeMixin
  - LineNode < DefaultShapeMixin
  - EllipseNode < DefaultShapeMixin
  - PolygonNode < DefaultShapeMixin
  - RectangleNode < DefaultShapeMixin
  - TextNode > DefaultShapeMixin
  - StampNode < DefaultShapeMixin
  - HighlightNode < DefaultShapeMixin, ...
  - WashiTapeNode < DefaultShapeMixin, StickableMixin
  - StickyNode < OpaqueNodeMixin, MinimalFillsMixin, MinimalBlendMixin
  - ConnectorNode < OpaqueNodeMixin, MinimalFillsMixin, MinimalBlendMixin
  - ShapeWithTextNode < OpaqueNodeMixin, MinimalFillsMixin, MinimalBlendMixin, MinimalStrokesMixin
  - CodeBlockNode < OpaqueNodeMixin, MinimalBlendMixin
  - WidgetNode < OpaqueNodeMixin, StickableMixin
  - EmbedNode < OpaqueNodeMixin
  - LinkUnfurlNode < OpaqueNodeMixin
  - MediaNode < OpaqueNodeMixin
  - SectionNode < ChildrenMixin, MinimalFillsMixin, OpaqueNodeMixin, DevStatusMixin
  - TableNode < OpaqueNodeMixin, MinimalFillsMixin, MinimalBlendMixin

  declare type SceneNode =
    | SliceNode             // LayoutMixin (and DimensionAndPositionMixin)
    | FrameNode             // LayoutMixin (and DimensionAndPositionMixin)
    | GroupNode             // LayoutMixin
    | ComponentSetNode      // LayoutMixin
    | ComponentNode         // LayoutMixin
    | InstanceNode          // 
    | BooleanOperationNode  //
    | VectorNode            // 
    | StarNode              // 
    | LineNode              // 
    | EllipseNode           // 
    | PolygonNode           // 
    | RectangleNode         // 
    | TextNode              // 
    | StickyNode            // 
    | ConnectorNode         // 
    | ShapeWithTextNode     // 
    | CodeBlockNode         // 
    | StampNode             // 
    | WidgetNode            // 
    | EmbedNode             // 
    | LinkUnfurlNode        // 
    | MediaNode             // 
    | SectionNode           // 
    | HighlightNode         // 
    | WashiTapeNode         // 
    | TableNode             // 



  - DimensionAndPositionMixin
    - x, y, width, height, absoluteBoundingBox
  - LayoutMixin < DimensionAndPositionMixin
    - resize(), absoluteRenderBounds
  - BaseFrameMixin < LayoutMixin
    - clipsContent: boolean
  - DefaultFrameMixin < BaseFrameMixin
  - DefaultShapeMixin < LayoutMixin
  - SceneNode (compatible with absoluteRenderBounds)
    - SliceNode < LayoutMixin
  -----
  Figma:


  DOES NOT EXTEND LayoutMixin:
  - OpaqueNodeMixin < BaseNodeMixin, SceneNodeMixin, ExportMixin, DimensionAndPositionMixin
  - MinimalFillsMixin < (nothing)
  - MinimalBlendMixin < (nothing)
  - MinimalStrokesMixin < (nothing)
  - StickableMixin < (nothing)
  - ChildrenMixin < (nothing)
  - DevStatusMixin < (nothing)
  -----
*/
