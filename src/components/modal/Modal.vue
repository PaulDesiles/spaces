<template>
	<Transition name="fade">
		<div v-if="opened" id="overlay" @click="close()">
			<div :class="panelClass" @click.stop>
				<slot />
				<img id="close" :src="closeIcon" @click="close()" />
			</div>
		</div>
	</Transition>
</template>

<script>
import * as states from '../../store/states';
import iconCross from './assets/cross.svg';

export default {
	name: 'Modal',
	props: {
		openedState: {
			type: String,
			default: ''
		},
		small: Boolean
	},
	computed: {
		opened() {
			return this.$store.state.interactionState === this.openedState;
		},
		closeIcon() {
			return iconCross;
		},
		panelClass() {
			const classes = ['contentPanel'];
			if (this.small) {
				classes.push('smallPanel');
			}

			return classes;
		}
	},
	methods: {
		open() {
			this.$store.commit('setInteractionState', this.openedState);
		},
		close() {
			this.$store.commit('setInteractionState', states.DRAWING);
		},
		validate() {
			const eventArguments = {handled: false};
			this.$emit('validateModal', eventArguments);

			if (!eventArguments.handled) {
				this.close();
			}
		},
		toggleKeysListening(activate) {
			if (this.listening !== activate) {
				this.listening = activate;
				const method = activate ? document.addEventListener : document.removeEventListener;
				method('keyup', this.keyUp);
			}
		},
		keyUp(event) {
			const key = event.key.toLowerCase();

			if (key === 'enter') {
				this.validate();
				event.preventDefault();
			} else if (key === 'escape') {
				this.close();
				event.preventDefault();
			}
		}
	},
	watch: {
		opened() {
			this.toggleKeysListening(this.opened);
		}
	},
	mounted() {
		if (this.opened) {
			this.toggleKeysListening(true);
		}
	},
	beforeDestroy() {
		this.toggleKeysListening(false);
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
	position: relative;
}

.smallPanel {
	width: 220px;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .3s ease;
}

.fade-enter, .fade-leave-to {
	opacity: 0;
}

#close {
	position: absolute;
	cursor: pointer;
	top: 8px;
	right: 8px;
	width: 12px;
}

</style>
