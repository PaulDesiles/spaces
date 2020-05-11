<template>
	<div>
		<h1>Export to svg</h1>

		<div id="centerBlock">
			<Transition name="fade" mode="out-in">
				<img
					v-if="loading"
					key="loadingWheel"
					:src="loadingWheel"
				/>

				<a
					v-else
					key="loadedButton"
					class="buttonLink"
					download="export.svg"
					:href="downloadUrl"
				>
					Download
				</a>
			</Transition>
		</div>
	</div>
</template>

<script>
import {createSvgFileFromShapes} from '../../model/SvgHelpers';
import iconLoading from './assets/loadingWheel.svg';

export default {
	name: 'Exporter',
	data() {
		return {
			loading: true,
			downloadUrl: '#'
		};
	},
	computed: {
		loadingWheel() {
			return iconLoading;
		}
	},
	mounted() {
		this.loading = true;

		const textContent = createSvgFileFromShapes(
			this.$store.state.shapes,
			this.$store.state.parameters.drawingSize
		);
		const data = new Blob([textContent], {type: 'text/svg'});
		this.downloadUrl = window.URL.createObjectURL(data);

		// Ensure the animation is displayed at list 1s
		setTimeout(() => {
			this.loading = false;
		}, 1000);
	},
	beforeDestroy() {
		// Clear the blob out of memory
		window.URL.revokeObjectURL(this.downloadUrl);
	}
};
</script>

<style scoped>
h1 {
	font-size: 17pt;
	font-weight: normal;
	margin: 0;
}

#centerBlock {
	display: flex;
	justify-content: center;
	margin-top: 20px;
	height: 50px;
	align-items: center;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .3s ease;
}

.fade-enter, .fade-leave-to {
	opacity: 0;
}

</style>
