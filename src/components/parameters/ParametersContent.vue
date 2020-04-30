<template>
	<div>
		<p>min stroke size : {{ localMinStroke }}</p>
		<input
			v-model="localMinStroke"
			type="range"
			class="slider"
			min="0"
			max="100"
			@change="setMinStroke(parseInt($event.target.value, 10))"
		/>

		<p>max stroke size : {{ localMaxStroke }}</p>
		<input
			v-model="localMaxStroke"
			type="range"
			class="slider"
			min="20"
			max="1000"
			@change="setMaxStroke(parseInt($event.target.value, 10))"
		/>

		<p>min Angle : {{ localMinAngle }}°</p>
		<input
			v-model="localMinAngle"
			type="range"
			class="slider"
			min="0"
			max="90"
			@change="setMinAngle(toRad($event.target.value))"
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
	name: 'ParametersContent',
	data() {
		return {
			localMinStroke: this.$store.state.parameters.minStroke,
			localMaxStroke: this.$store.state.parameters.maxStroke,
			localMinAngle: this.toDeg(this.$store.state.parameters.minAngle),
			localAngleStep: this.toDeg(this.$store.state.parameters.selectedAngleStep),
			angleValues: [5, 10, 15]
		};
	},
	methods: {
		getStepClass(angle) {
			const classes = ['option'];
			if (this.toDeg(this.$store.state.parameters.selectedAngleStep) === angle) {
				classes.push('selectedOption');
			}

			return classes;
		},
		toDeg(rad) {
			return Math.round(rad / Math.PI * 180);
		},
		toRad(deg) {
			return deg / 180 * Math.PI;
		},
		setMinStroke(value) {
			if (this.localMaxStroke < value) {
				this.localMaxStroke = value;
			}

			this.$store.commit('parameters/setMinStroke', value);
		},
		setMaxStroke(value) {
			if (this.localMinStroke > value) {
				this.localMinStroke = value;
			}

			this.$store.commit('parameters/setMaxStroke', value);
		},
		setMinAngle(value) {
			this.$store.commit('parameters/setMinAngle', value);
		},
		setStep(value) {
			this.$store.commit('parameters/setSelectedAngleStep', this.toRad(value));
		}
	}
};
</script>

<style scoped>
p {
	margin: 2px;
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
