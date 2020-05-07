<template>
	<Transition name="fade">
		<div v-if="opened" id="overlay" @click="close()">
			<div class="contentPanel" @click.stop>
				<slot />
			</div>
		</div>
	</Transition>
</template>

<script>
export default {
	name: 'Modal',
	props: {
		openedState: String
	},
	computed: {
		opened() {
			return this.$store.state.interactionState === this.openedState;
		}
	},
	methods: {
		open() {
			this.$store.commit('setInteractionState', this.openedState);
		},
		close() {
			this.$store.commit('setInteractionState', 'drawing');
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

.contentPanel {
	background: white;
	width: 350px;
	padding: 15px 20px;
	box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.3);
	border-radius: 3px;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .3s ease;
}

.fade-enter, .fade-leave-to {
	opacity: 0;
}

</style>
