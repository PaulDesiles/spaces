<template>
	<div id="toolbar">
		<p>min stroke size : {{ localMinSize }}</p>
		<input
			type="range"
			class="slider"
			min="0"
			max="100"
			v-model="localMinSize"
			@change="update('minSize', $event)"
		/>

		<p>max stroke size : {{ localMaxSize }}</p>
		<input
			type="range"
			class="slider"
			min="20"
			max="1000"
			v-model="localMaxSize"
			@change="update('maxSize', $event)"
		/>

		<p>min Angle : {{ localMinAngle }}°</p>
		<input
			type="range"
			class="slider"
			min="0"
			max="90"
			v-model="localMinAngle"
			@change="update('minAngle', $event)"
		/>

		<p>angle steps</p>
		<div class="optionLine">
			<button
				v-for="a in angleValues"
				:key="'angleStep' + a"
				:class="getStepClass(a)"
				@click="setStep(a)"
			>
				{{ a === 0 ? 'free' : `${a}°` }}
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Toolbar',
	props: {
		minSize: Number,
		maxSize: Number,
		minAngle: Number,
		angleStep: Number
	},
	data() {
		return {
			localMinSize: this.minSize,
			localMaxSize: this.maxSize,
			localMinAngle: this.minAngle,
			localAngleStep: this.angleStep,
			angleValues: [0, 10, 15, 30, 45]
		};
	},
	methods: {
		getStepClass(angle) {
			return ['option', this.angleStep === angle ? 'selectedOption' : ''];
		},
		setStep(value) {
			this.updateParameter('angleStep', value);
		},
		update(name, event) {
			this.updateParameter(name, parseInt(event.target.value, 10));
		},
		updateParameter(name, value) {
			this.$emit('updateParameter', {
				name,
				value
			});
		}
	}
};
</script>

<style scoped>
p {
	margin: 2px;
}

#toolbar {
	position: absolute;
	left: 5px;
	bottom: 20px;
	background: #9999;
	padding: 7px 10px;
	border-radius: 5px;
	min-width: 180px;
}

.optionLine {
	display: flex;
}

.option {
	border: 0px;
	border-radius: 5px;
	margin: 2px;
	padding: 4px 8px;
	min-width: 30px;
	background: #666;
	color: black;
}

.selectedOption {
	background: #66f;
}
</style>
