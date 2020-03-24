<template>
  <circle :cx="point.x" :cy="point.y" :r="size" :stroke="strokeColor" stroke-width="1" :fill="fillColor" />
</template>

<script>
  import {AnchorType} from './Geometry.js';

  var blue = "#318be7";
  var grey = "#aaa";
  var transp = "transparent";
  class AnchorTypeProperties {
    constructor(size, color, plain, sizeOnHover, colorOnHover) {
      this.size = size;
      this.stroke = plain ? transp : color;
      this.fill = plain ? color : transp;

      this.sizeOnHover = sizeOnHover || size;
      this.strokeOnHover = plain ? transp : (colorOnHover || color);
      this.fillOnHover = plain ? (colorOnHover || color) : transp;
    }
  }

  let props = new Map();
  props.set(AnchorType.cursor, new AnchorTypeProperties(5, blue, false));
  props.set(AnchorType.startPoint, new AnchorTypeProperties(5, blue, true, 7));
  props.set(AnchorType.guide, new AnchorTypeProperties(3, grey, true, 3, transp));

  export default {
    name: 'Anchor',
    props: ['point', 'type'],
    computed: {
      size: function() { 
        if (this.point.isMouseOver)
          return props.get(this.type).sizeOnHover;
        else
          return props.get(this.type).size;
      },
      strokeColor: function() {
        if (this.point.isMouseOver)
          return props.get(this.type).strokeOnHover;
        else
          return props.get(this.type).stroke;
      },
      fillColor: function() {
        if (this.point.isMouseOver)
          return props.get(this.type).fillOnHover;
        else
          return props.get(this.type).fill;
      }
    }
  }
</script>