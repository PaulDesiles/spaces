<template>
	<div id="parametersPanel" :class="panelTransformClass">
		<Transition name="fade">
			<div v-if="opened" id="panel">
				<slot />
			</div>
		</Transition>
		<div id="toggleButton" @click="toggle()">
			<Transition name="fade" mode="out-in">
				<i v-if="opened" key="openedIcon" class="las la-chevron-left" />
				<i v-else key="closedIcon" class="las la-cog" />
			</Transition>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ParametersPanel',
	data() {
		return {
			opened: false
		};
	},
	computed: {
		panelTransformClass() {
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

#panel {
	background: #9999;
	padding: 7px 10px;
	border-radius: 5px;
	width: 180px;

	position:absolute;
	bottom: 0;
	transform: translateX(-190px);
}

.fade-enter-active, .fade-leave-active {
	transition: transform .3s ease;
	transition-delay: .1s;
}
.fade-enter {
	transform: translateX(12px) rotateY(90deg);
}
.fade-leave-to {
	transform: translateX(-12px) rotateY(-90deg);
}

</style>
