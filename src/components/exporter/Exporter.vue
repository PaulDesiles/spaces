<template>
	<div>
		<h1>Export</h1>
		<a download="export.svg" :href="downloadUrl">
			Download
		</a>
	</div>
</template>

<script>
import {createSvgFileFromShapes} from '../../model/SvgHelpers';

export default {
	name: 'Exporter',
	computed: {
		downloadUrl() {
			console.log('generate Url');
			const textContent = createSvgFileFromShapes(
				this.$store.state.shapes,
				this.$store.state.parameters.drawingSize
			);
			const data = new Blob([textContent], {type: 'text/svg'});
			return window.URL.createObjectURL(data);
		}
	}
};
</script>

<style scoped>
</style>
