<template>
	<Modal opened-state="new" :small="true">
		<h1>New drawing</h1>

		<form id="newDrawingForm" ref="form" action="#" />

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
				/>
			</label>
		</div>

		<div class="lastLine">
			<a
				class="buttonLink secondaryButton"
				form="newDrawingForm"
				@click="cancel()"
			>
				cancel
			</a>

			<a
				:class="createButtonClass"
				form="newDrawingForm"
				@click="create()"
			>
				create
			</a>
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
