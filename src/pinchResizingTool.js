import go from 'gojs';

class PinchResizingTool extends go.ToolManager {
  constructor(init) {
    super();
    this.originalScale = 1;
    this.startDistance = 0; // how far apart the touches are at the start
    this.isPinching = false;
    if (init) Object.assign(this, init);
  }

  // Initiates pinch-zooming on multi-touch devices.
  standardPinchZoomStart() {
    const { diagram } = this;
    if (diagram === null) return;
    const e = diagram.lastInput;

    const first = e.getMultiTouchViewPoint(0, new go.Point());
    const second = e.getMultiTouchViewPoint(1, new go.Point());
    if (!first.isReal() || !second.isReal()) {
      return;
    }

    // event.isMultiTouch
    // call doCancel to stop the rest of typical toolManager.domousedown/domousemove behavior
    this.doCancel();

    const node = diagram.selection.first();
    if (node === null) return;

    this.originalScale = node.scale;
    this.startDistance = Math.sqrt(first.distanceSquaredPoint(second));
    e.bubbles = false;
    e.handled = true;
    this.isPinching = true;
    window.myDiagram.startTransaction('zoom node');
  }

  // Continues pinch-zooming (started by {@link #standardPinchZoomStart} on multi-touch devices.
  standardPinchZoomMove() {
    const { diagram } = this;
    if (diagram === null) return;
    const e = diagram.lastInput;

    const first = e.getMultiTouchViewPoint(0, new go.Point());
    const second = e.getMultiTouchViewPoint(1, new go.Point());
    if (!first.isReal() || !second.isReal()) {
      return;
    }

    // event.isMultiTouch
    // call doCancel to stop the rest of typical toolManager.domousedown/domousemove behavior
    this.doCancel();

    const dist = Math.sqrt(first.distanceSquaredPoint(second));
    const scale = dist / this.startDistance;
    const node = diagram.selection.first();
    if (node instanceof go.Node) node.scale = this.originalScale * scale;
    e.bubbles = false;
    e.handled = true;
  }

  doMouseUp() {
    if (this.isPinching) {
      window.myDiagram.commitTransaction('zoom node');
      this.isPinching = false;
    }
    super.doMouseUp();
  }
}

export default PinchResizingTool;
