<template>
  <div id="app">
    <SvgViewport ref="svgViewport">
      <g ref="mainGroup"
          v-on:click="clic($event)"
          v-on:mousemove="move($event)"
          v-on:keyup.z.ctrl="cancel">
        <rect x="0" y="0" width="1000" height="600" fill="white" border="black" border-width="1" />

        <path v-for="shape in shapes" :d="getPath(shape.points, true)" stroke="white" fill="black" />
        
        <path :d="currentPath" stroke="black" fill="none" stroke-width="1" />
        
        <template v-for="guide in guides" >
          <anchor v-bind:point="guide.p1" v-bind:type="2" />
          <anchor v-bind:point="guide.p2" v-bind:type="2"/>
        </template>

        <anchor v-if="showStartPoint" v-bind:point="startPoint" v-bind:type="1" />
      </g>
    </SvgViewport>
  </div>
</template>

<script>
import SvgViewport from './components/SvgViewport.vue'
import Anchor from './components/Anchor.vue'
import * as Geo from './components/Geometry.js'

export default {
  name: 'App',
  components: {
    SvgViewport,
    Anchor
  },
  data: function() {
    return {
      snapThreshold: 20,
      currentPoint: new Geo.Point(),
      currentShape: [],
      shapes: [],
    }
  },
  computed: {
    showStartPoint: function () {
      return this.currentShape.length > 2;
    },
    startPoint: function () {
      if (this.currentShape.length <= 0)
        return undefined;

      return this.currentShape[0];
    },
    currentPath: function () {
      return this.getPath(this.currentShape.concat(this.currentPoint));
    },
    guides: function () {
      return this.shapes.map(s => s.guides).flat();
    }
  },
  methods: {
    getPosition: function (event) {
      // let rect = this.$refs.svgViewport.getBoundingClientRect();
      let p = {
        x: event.pageX, // - rect.left,
        y: event.pageY //- rect.top
      };
      let newP = this.$refs.svgViewport.pointToSvg(p);
      return new Geo.Point(newP.x, newP.y);
    },
    getPath: function (shape, closeShape) {
      let path = "";
      shape.forEach(function(s, i) {
        path += (i == 0 ? "M" : "L");
        path += s.x + " " + s.y + " ";
      });
      if (closeShape)
        path += "Z";

      return path;
    },
    isSnappedAtStartPoint: function (point) {
      return this.showStartPoint && point.getSqDistanceFrom(this.currentShape[0]) < this.snapThreshold;
    },
    closeCurrentShape: function () {
      this.shapes.push(new Geo.Shape(this.currentShape));
      this.currentShape = [];
    },
    getSnappedPosition: function (mouseEvent, updateUI) {
      let snappedPoint = this.getPosition(mouseEvent);
      let nearestPoint;
      let nearestDistance = this.snapThreshold;
      let allAnchors = this.guides
        .map(g => [g.p1, g.p2])
        .flat();

      if (this.showStartPoint)
        allAnchors.push(this.startPoint);

      allAnchors.forEach(a => {
        if (updateUI)
          a.isMouseOver = false;

        let d = a.getSqDistanceFrom(snappedPoint);
        if (d < nearestDistance) {
          nearestDistance = d;
          nearestPoint = a;
        }
      });

      if (nearestPoint != null) {
        snappedPoint = nearestPoint;
        
        if (updateUI)
          nearestPoint.isMouseOver = true;
      }

      return snappedPoint;
    },
    move: function (event) {
      this.currentPoint = this.getSnappedPosition(event, true);
    },
    clic: function (event) {
      let snappedPoint = this.getSnappedPosition(event, false);
      if (this.showStartPoint && snappedPoint == this.startPoint)
        this.closeCurrentShape();
      else
        this.currentShape.push(snappedPoint);
    },
    cancel: function () {
      if (this.startPoint !== undefined)
        this.currentShape.pop();
      else
        this.shapes.pop();
    }
  }
}
</script>

<style>
  body { margin: 0px; }
  html, body, #app, #container {
    width:100%; 
    height:100%; 
  }
</style>
