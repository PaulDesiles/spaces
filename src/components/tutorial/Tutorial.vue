<template>
	<Modal opened-state="tutorial">
		<div>
			<div>
				<img id="drawing" src="./assets/drawing.svg" />
				<h1>SPACES is a vector drawing software with a focus on keeping a constant distance between all shapes.</h1>
			</div>
			<ul>
				<li>
					<img src="./assets/add.svg" />
					click to add points
				</li>
				<li>
					<img src="./assets/end.svg" />
					click on blue circle or <i>[enter]</i> to close the shape
				</li>
				<li>
					<img src="./assets/steps.svg" />
					hold <i>[ctrl]</i> to force angle steps
				</li>
				<li>
					<img src="./assets/zoom.svg" />
					<i>[ctrl]</i> + scroll to zoom in and out
				</li>
				<li>
					<img src="./assets/move.svg" />
					<i>[space]</i> + mouse drag to move the drawing
				</li>
			</ul>

			<template v-if="hasTactileScreen">
				<h2>Please note that you'll need a MOUSE !</h2>
				<span>This is a precision and productivity tool, hence it's not optimized for tactile use or phone screen size...</span>
			</template>

			<div id="lastLine">
				<a class="buttonLink" @click="close()">
					Start
				</a>
			</div>
		</div>
	</Modal>
</template>

<script>
import Modal from '../modal/Modal';
import * as states from '../../store/states';

export default {
	name: 'Tutorial',
	components: {
		Modal
	},
	computed: {
		hasTactileScreen() {
			return navigator.maxTouchPoints > 0;
		}
	},
	methods: {
		close() {
			this.$store.commit('setInteractionState', states.DRAWING);
		}
	}
};
</script>

<style lang="scss" scoped>
@import '~@/global.scss';

#drawing {
	height: 60px;
	float: left;
	margin-right: 10px;
	margin-top: -6px;
}

h1 {
	font-size: 14px;
	font-weight: normal;
}

ul {
	clear: both;
	padding-left: 10px;
	margin-top: 20px;
}

li {
	clear: both;
	list-style: none;
	margin: 8px 0;

	img {
		float: left;
		width: 20px;
		margin-right: 8px;
	}
}

i {
	color: $blue;
	font-style:normal;
}

h2 {
	margin: 20px 0 0 0;
	font-size: 14px;
	font-weight: bold;
	color: #ff541f;
}

#lastLine {
	display: flex;
	justify-content: center;
	margin-top: 20px;
}

</style>
