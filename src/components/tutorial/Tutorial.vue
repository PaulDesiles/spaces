<template>
	<Transition name="fade">
		<div v-if="opened" id="overlay" @click="close()">
			<div id="tutorialPanel" @click.stop>
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

				<div id="lastLine">
					<button @click="close()">
						Start
					</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script>
export default {
	name: 'Tutorial',
	data() {
		return {
			opened: true
		};
	},
	methods: {
		close() {
			this.opened = false;
		}
	}
};
</script>

<style scoped>
#overlay {
	background: rgba(0, 0, 0, 0.2);
	width: 100%;
	height: 100%;
	position: fixed;
	top: 0;
	left: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

#tutorialPanel {
	background: white;
	width: 350px;
	padding: 15px 20px;
	box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.3);
	border-radius: 3px;
}

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
}

	li img {
		float: left;
		width: 20px;
		margin-right: 8px;
	}

i {
	color: #318be7;
	font-style:normal;
}

#lastLine {
	display: flex;
	justify-content: center;
	margin-top: 20px;
}

button {
	background: #318be7;
	color: white;
	border-radius: 14px;
	border: 0px;
	height: 28px;
	min-width: 80px;
	box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.3);
	transition: background 0.2s;
	text-transform: none;
}

button:hover {
	background: #559feb;
}

button:focus {
	padding: 0;
	outline: none;
	border: 2px solid #106bc8;
}

button::-moz-focus-inner {
	border: 0;
}

button:active {
	background: #106bc8;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .3s ease;
}

.fade-enter, .fade-leave-to {
	opacity: 0;
}

</style>
