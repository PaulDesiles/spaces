<template>
	<div id="parametersPanel" :class="panelClass">
		<Transition name="fade">
			<ParametersContent v-if="opened" id="container" />
		</Transition>
		<div id="toggleButton" @click="toggle()">
			<Transition name="sphereRotation" mode="out-in">
				<i v-if="opened" key="openedIcon" class="las la-chevron-left" />
				<i v-else key="closedIcon" class="las la-cog" />
			</Transition>
		</div>
	</div>
</template>

<script>
import ParametersContent from './ParametersContent';

export default {
	name: 'ParametersPanel',
	components: {
		ParametersContent
	},
	data() {
		return {
			opened: false
		};
	},
	computed: {
		panelClass() {
			return this.opened ? 'openedPanel' : '';
		}
	},
	methods: {
		toggle() {
			this.opened = !this.opened;
		}
	}
};
</script>

<style scoped>

#parametersPanel {
	position: absolute;
	left: 5px;
	bottom: 20px;
	transition: transform .3s ease;
}

.openedPanel {
	transform: translateX(190px);
}

/* Content */

#container {
	background: #9999;
	padding: 7px 10px;
	border-radius: 5px;
	width: 180px;

	position:absolute;
	bottom: 0;
	transform: translateX(-190px);
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .3s ease;
}

.fade-enter, .fade-leave-to {
	opacity: 0;
}

/* Button */

#toggleButton {
	background: #666;
	color: white;
	border-width: 0;
	border-radius: 20px;
	width: 26px;
	height: 26px;
	padding: 0;

	position:absolute;
	bottom: 0;
	text-align: center;
}

.las {
	font-size: 20px;
	position: absolute;
	left: 3px;
	top: 2px;
}

.sphereRotation-enter-active, .sphereRotation-leave-active {
	transition: transform .15s ease;
	transition-delay: .1s;
}
.sphereRotation-enter {
	transform: translateX(12px) rotateY(90deg);
}
.sphereRotation-leave-to {
	transform: translateX(-12px) rotateY(-90deg);
}

</style>
