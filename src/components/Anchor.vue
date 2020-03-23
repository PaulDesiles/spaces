<template>
  <circle :cx="point.x" :cy="point.y" :r="size" :stroke="strokeColor" stroke-width="1" :fill="fillColor" />
</template>

<script>
  import {AnchorType} from './Geometry.js';

  export default {
    name: 'Anchor',
    props: ['point', 'type'],
    computed: {
      size: function() { return this.point.isMouseOver ? 5 : 3 },
      strokeColor: function() {  
      if (this.type == AnchorType.guide)
          return "#ff0000";
        else
          return "transparent";
      },
      fillColor: function() {
        if (this.type == AnchorType.startPoint) 
          return "#318be7";
        else
          return "transparent";
      }
    }
  }
</script>