<template>
	<Transition name="fade">
		<div v-if="opened" class="modalOverlay" @click="close()">
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
			const classes = ['modalPanel'];
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
			} else if (key === 'escape') {
				this.close();
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

<style lang="scss" scoped>
@import '~@/global.scss';

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
