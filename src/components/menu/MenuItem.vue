<template>
	<li>
		<a
			:class="linkClass"
			@click="action()"
			@mousedown="onMouseDown($event)"
			@mouseup="onMouseUpOrLeave($event)"
			@mouseleave="onMouseUpOrLeave($event)"
		>
			<Component :is="icon" class="icon" />

			<span>{{ label }}</span>
			<i v-if="shortcut" class="shortcut">
				{{ shortcut }}
			</i>
			<Arrow v-if="hasChildren" :rotate="opened !== invertArrow" class="arrow" />
		</a>
		<CollapseTransition>
			<div v-if="opened" class="children">
				<slot>
					<ul class="subMenu">
						<MenuItem
							v-for="child in children"
							:key="child.label"
							v-bind="child"
						/>
					</ul>
				</slot>
			</div>
		</CollapseTransition>

		<Transition name="slide">
			<span v-if="showTip" id="tip">
				Hold !
			</span>
		</Transition>
	</li>
</template>

<script>
import {CollapseTransition} from 'vue2-transitions';
import Arrow from '@/icons/Arrow';

const emptyFunction = function () { };

export default {
	name: 'MenuItem',
	components: {
		CollapseTransition,
		Arrow
	},
	props: {
		label: {
			type: String,
			default: () => ''
		},
		icon: {
			type: Object,
			default: () => undefined
		},
		shortcut: {
			type: String,
			default: () => ''
		},
		isEnabled: {
			type: Function,
			default: () => emptyFunction
		},
		onClick: {
			type: Function,
			default: () => emptyFunction
		},
		onPress: {
			type: Function,
			default: () => emptyFunction
		},
		onRelease: {
			type: Function,
			default: () => emptyFunction
		},
		children: {
			type: Array,
			default: () => []
		},
		opened: Boolean,
		invertArrow: Boolean
	},
	data() {
		return {
			pressedTime: undefined,
			showTip: false,
			tipTimeout: undefined
		};
	},
	computed: {
		linkClass() {
			return this.isEnabled() ? '' : 'disabledLink';
		},
		hasChildren() {
			return (this.children && this.children.length > 0) || this.$slots.default;
		}
	},
	methods: {
		action() {
			if (this.hasChildren) {
				this.$emit('toggleOpening');
			} else if (this.onClick) {
				this.onClick();
			}
		},
		onMouseDown(event) {
			if (this.onPress && this.onPress.name !== 'default') {
				this.onPress();
				this.pressedTime = event.timeStamp;
				this.showTip = false;
				if (this.tipTimeout) {
					clearTimeout(this.tipTimeout);
				}
			}
		},
		onMouseUpOrLeave(event) {
			if (this.pressedTime) {
				this.onRelease();

				if (event.timeStamp - this.pressedTime < 500) {
					this.launchTip();
				}

				this.pressedTime = undefined;
			}
		},
		launchTip() {
			this.showTip = true;
			this.tipTimeout = setTimeout(
				() => {
					this.showTip = false;
				},
				2000);
		}
	}
};
</script>

<style lang="scss" scoped>
@import '~@/global.scss';

* {
	font-size: 14px;
}

li {
	list-style: none;
	position: relative;

	.icon {
		margin-right: 8px;
		vertical-align: middle;
	}

	span {
		vertical-align: middle;
	}
}

a {
	display: block;
	line-height: 24px;
	cursor: pointer;
	padding: 8px 10px;
	position: relative;

	&:hover {
		background: #fff6;
		color: $blue;
	}

	&:active {
		background: #fff;
	}
}

.disabledLink {
	opacity: 0.4;
    pointer-events: none;
}

.children {
	background: #0001;
}

.subMenu {
	padding: 0;
	margin: 0;

	a:hover {
		background: #0001;
	}
}

@mixin right-item {
	position: absolute;
	right: 10px;
}

.shortcut {
	@include right-item;
	opacity: 0.3;
}

.arrow {
	@include right-item;
	width: 10px;
	margin: -5px 0 0 0;
	top: 50%;
}

#tip {
	display: block;
	position: absolute;
	right: -50px;
	top: 50%;
	margin-top: -12px;
	width: 45px;
	height: 24px;
	text-align: center;
	line-height: 24px;
	font-size: 9pt;

	background: #3336;
	color: white;
	border-radius: 3px;
}

.slide-enter-active, .slide-leave-active {
	transition: opacity .3s ease, transform .2s ease;
}

.slide-enter, .slide-leave-to {
	opacity: 0;
}

.slide-enter {
	transform: translateX(-30px);
}

</style>
