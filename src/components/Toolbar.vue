<template>
	<div id="toolbar">
		<p>min stroke size : {{ localMinSize }}</p>
		<input
			type="range"
			class="slider"
			min="0"
			max="100"
			v-model="localMinSize"
			@change="update('minSize', parseInt($event.target.value, 10))"
		/>

		<p>max stroke size : {{ localMaxSize }}</p>
		<input
			type="range"
			class="slider"
			min="20"
			max="1000"
			v-model="localMaxSize"
			@change="update('maxSize', parseInt($event.target.value, 10))"
		/>

		<p>min Angle : {{ localMinAngle }}°</p>
		<input
			type="range"
			class="slider"
			min="0"
			max="90"
			v-model="localMinAngle"
			@change="update('minAngleRad', toRad($event.target.value))"
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
		minAngleRad: Number,
		angleStepRad: Number
	},
	data() {
		return {
			localMinSize: this.minSize,
			localMaxSize: this.maxSize,
			localMinAngle: this.toDeg(this.minAngleRad),
			localAngleStep: this.toDeg(this.angleStepRad),
			angleValues: [0, 5, 10, 15]
		};
	},
	methods: {
		getStepClass(angle) {
			return ['option', this.toDeg(this.angleStepRad) === angle ? 'selectedOption' : ''];
		},
		setStep(value) {
			const radValue = this.toRad(value);
			this.updateParameter('angleStepRad', radValue);
		},
		toDeg(rad) {
			return Math.round(rad / Math.PI * 180);
		},
		toRad(deg) {
			return deg / 180 * Math.PI;
		},
		update(name, value) {
			if (name === 'minSize' && this.localMaxSize < value) {
				this.localMaxSize = value;
			} else if (name === 'maxSize' && this.localMinSize > value) {
				this.localMinSize = value;
			}

			this.updateParameter(name, value);
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
