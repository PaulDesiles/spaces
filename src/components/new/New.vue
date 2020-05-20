<template>
	<Modal opened-state="new" small @validateModal="modalValidation($event)">
		<h1>New drawing</h1>

		<form id="newDrawingForm" ref="form" />

		<div class="inputs">
			<label>
				<span>Width</span>
				<input
					v-model.number="width"
					form="newDrawingForm"
					type="number"
					min="200"
					max="9000"
					required
					@input="updateValidity()"
					@keyup.enter.stop
				/>
			</label>

			<label>
				<span>Height</span>
				<input
					v-model.number="height"
					form="newDrawingForm"
					type="number"
					min="200"
					max="9000"
					required
					@input="updateValidity()"
					@keyup.enter.stop
				/>
			</label>

			<label>
				<span>Shapes gap</span>
				<input
					v-model.number="gap"
					form="newDrawingForm"
					type="number"
					min="2"
					max="900"
					required
					@input="updateValidity()"
					@keyup.enter.stop
				/>
			</label>
		</div>

		<div class="lastLine">
			<button
				class="buttonLink secondaryButton"
				@click="cancel()"
				@keyup.enter.stop
			>
				cancel
			</button>

			<button
				type="submit"
				:class="createButtonClass"
				form="newDrawingForm"
				@click.prevent="create()"
				@keyup.enter.stop
			>
				create
			</button>
		</div>
	</Modal>
</template>

<script>
import Modal from '../modal/Modal.vue';
import * as states from '../../store/states';

export default {
	name: 'New',
	components: {
		Modal
	},
	data() {
		return {
			width: 1000,
			height: 600,
			gap: 10,
			isValid: true
		};
	},
	computed: {
		createButtonClass() {
			const classes = ['buttonLink'];
			if (!this.isValid) {
				classes.push('disabledButton');
			}

			return classes;
		}
	},
	methods: {
		updateValidity() {
			this.isValid = this.$refs.form.checkValidity();
		},
		cancel() {
			this.$store.commit('setInteractionState', states.DRAWING);
		},
		create() {
			this.$store.commit('newDrawing', {
				width: this.width,
				height: this.height,
				gap: this.gap
			});
		},
		modalValidation(event) {
			event.handled = true;
			this.create();
		}
	}
};
</script>

<style lang="scss" scoped>
@import '~@/global.scss';

h1 {
	margin: 0 0 20px 0;
	font-size: 14pt;
}

label {
	margin: 4px 0;
	display: grid;
	grid-template-columns: 80px auto;
	align-items: center;

	span {
		grid-column: 1 / span 1;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		grid-column: 2 / span 1;
	}
}

.lastLine {
	margin-top: 20px;
	display: flex;
	justify-content: space-between;
}
</style>
