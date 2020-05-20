<template>
	<Modal opened-state="export" small="true">
		<Exporter />
	</Modal>
</template>

<script>
import Modal from '../modal/Modal.vue';
import Exporter from './Exporter.vue';

// Note : Exporter is isolated in a single component to insure
// that the file and it's url is generated only on demand
// and not each time a change is made in the drawing
export default {
	name: 'ExportModal',
	components: {
		Modal,
		Exporter
	}
};
</script>
