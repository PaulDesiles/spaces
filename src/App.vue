<template>
  <div id="app">
    <SvgViewport ref="svgViewport">
      <g ref="mainGroup"
          v-on:click="clic($event)"
          v-on:mousemove="move($event)"
          v-on:keyup.z.ctrl="cancel">
        <rect x="0" y="0" :width="xmax" :height="ymax" fill="white" border="#000" border-width="1" />

        <line v-for="guide in projectedGuides" :x1="guide.x1" :y1="guide.y1" :x2="guide.x2" :y2="guide.y2" stroke-width="1" :stroke="guide.color" />

        <path v-for="shape in shapes" :d="getPath(shape.points, true)" stroke-width="0" fill="black" />
        
        <path :d="currentPath" stroke="black" fill="none" stroke-width="1" />
        
        <template v-for="guide in guides" >
          <anchor v-bind:point="guide.p1" v-bind:type="3" />
          <anchor v-bind:point="guide.p2" v-bind:type="3"/>
        </template>

        <anchor v-if="showStartPoint" v-bind:point="startPoint" v-bind:type="2" />

        <anchor v-bind:point="currentPoint" v-bind:type="1" />
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
      xmax: 1000,
      ymax: 600,
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
    },
    projectedGuides: function () {
      return this.guides.map(g => {
        //compute the guide's function intersections with frame borders
        let intersections = [
          {x: 0, y: g.y(0)}, //i_xmin
          {x: g.x(0), y: 0}, //i_ymin
          {x: this.xmax, y: g.y(this.xmax)}, //i_xmax
          {x: g.x(this.ymax), y: this.ymax} //i_ymax
        ];

        //line 'bounds' are the intersections that are still inside the frame
        let lineBounds = [];
        intersections.forEach(p => 
        {
          if (lineBounds.length < 2
            && p.x >= 0 
            && p.x <= this.xmax
            && p.y >= 0 
            && p.y <= this.ymax)
          {
            lineBounds.push(p);
          }
        });

        return { 
          x1: lineBounds[0].x,
          y1: lineBounds[0].y,
          x2: lineBounds[1].x,
          y2: lineBounds[1].y,
          color: (g.isMouseOver ? "#318be7" : "#aaa")
        }
      });
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
        allAnchors.unshift(this.startPoint);

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
        
        if (updateUI) {
          nearestPoint.isMouseOver = true;

          this.guides
            .filter(g => g.isMouseOver)
            .forEach(g => { g.isMouseOver = false; });
        }
      }
      else {
        let nearestGuide;
        this.guides.forEach(g => {
          if (updateUI)
            g.isMouseOver = false;

          let p = g.getProjection(snappedPoint);
          let d = p.getSqDistanceFrom(snappedPoint);
          if (d < nearestDistance) {
            nearestDistance = d;
            nearestPoint = p;
            nearestGuide = g;
          }
        });

        if (nearestPoint != null) {
          snappedPoint = nearestPoint;
        
          if (updateUI)
            nearestGuide.isMouseOver = true;
        }
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
        this.currentShape.push(snappedPoint.clone());
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
