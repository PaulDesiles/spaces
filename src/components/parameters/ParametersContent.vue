<template>
	<div>
		<span>min stroke size : </span><b>{{ localMinStroke }}</b>
		<input
			v-model="localMinStroke"
			type="range"
			min="0"
			max="100"
			@change="setMinStroke(parseInt($event.target.value, 10))"
		/>

		<span>max stroke size : </span><b>{{ localMaxStroke }}</b>
		<input
			v-model="localMaxStroke"
			type="range"
			min="20"
			max="1000"
			@change="setMaxStroke(parseInt($event.target.value, 10))"
		/>

		<span>min Angle : </span><b>{{ localMinAngle }}°</b>
		<input
			v-model="localMinAngle"
			type="range"
			min="0"
			max="90"
			@change="setMinAngle(toRad($event.target.value))"
		/>

		<span>angle steps</span>
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

<style lang="scss" scoped>
@import '~@/global.scss';

span {
	font-size: 9pt;
	opacity: 0.6;
}

.optionLine {
	display: flex;
	margin: 4px -4px 0 -4px;
}

.option {
	border: 0px;
	border-radius: 5px;
	margin: 4px;
	padding: 4px 8px;
	background: #aaa;
	color: #000a;
	width: 33%;
	border: 2px solid transparent;

	&:hover {
		background: $light-blue;
	}

	&:focus {
		outline: none;
		border-color: $dark-blue;
	}

	&::-moz-focus-inner {
		border: 0;
	}
}

.selectedOption {
	background: $blue;
	color: #fff;
}

input[type=range] {
	height: 26px;
	-webkit-appearance: none;
	margin: 0 0 4px 0;
	width: 100%;
	background: transparent;
}
input[type=range]:focus {
	outline: none;
}

@mixin track {
	width: 100%;
	height: 4px;
	cursor: pointer;
	animate: 0.2s;
}

@mixin track-color {
	background: #0006;
	border-radius: 4px;
	border: 0px solid #000;
}

@mixin focused-track-color {
	background: $blue;
}

@mixin thumb {
	box-shadow: 0px 0px 6px #fff;
	height: 14px;
	width: 14px;
	border-radius: 14px;
	background: $blue;
	cursor: pointer;
}

@mixin focused-thumb {
	box-shadow: 0px 0px 6px #0008;
	border: 2px solid #fff;
}

/* Webkit */
input[type=range]::-webkit-slider-runnable-track {
	@include track;
	@include track-color;
}
input[type=range]::-webkit-slider-thumb {
	@include thumb;
	-webkit-appearance: none;
	margin-top: -5px;
}
input[type=range]:focus::-webkit-slider-runnable-track {
	@include focused-track-color;
}
input[type=range]:focus::-webkit-slider-thumb {
	@include focused-thumb;
}

/* Firefox */
input[type=range]::-moz-range-track {
	@include track;
	@include track-color;
}
input[type=range]::-moz-focus-outer {
	border: 0;
}
input[type=range]::-moz-range-thumb {
	@include thumb;
	border: none;
	box-sizing: border-box;
}
input[type=range]:focus::-moz-range-track {
	@include focused-track-color;
}
input[type=range]:focus::-moz-range-thumb {
	@include focused-thumb;
}

/* MS */
input[type=range]::-ms-track {
	@include track;
	background: transparent;
	border-color: transparent;
	color: transparent;
}
input[type=range]::-ms-fill-lower {
	@include track-color;
}
input[type=range]::-ms-fill-upper {
	@include track-color;
}
input[type=range]::-ms-thumb {
	@include thumb;
	margin-top: 1px;
}
input[type=range]:focus::-ms-fill-lower {
	@include focused-track-color;
}
input[type=range]:focus::-ms-fill-upper {
	@include focused-track-color;
}
input[type=range]:focus::-ms-thumb {
	@include focused-thumb;
}

</style>
