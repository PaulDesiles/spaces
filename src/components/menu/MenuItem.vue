<template>
	<li>
		<a :class="linkClass" @click="action()">
			<img :src="icon" />
			<span>{{ label }}</span>
			<i v-if="shortcut" class="shortcut">
				{{ shortcut }}
			</i>
			<img v-if="hasChildren" :class="arrowClass" src="./assets/arrow.svg" />
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
	</li>
</template>

<script>
import {CollapseTransition} from 'vue2-transitions';

export default {
	name: 'MenuItem',
	components: {
		CollapseTransition
	},
	props: {
		label: {
			type: String,
			default: () => ''
		},
		icon: {
			type: String,
			default: () => ''
		},
		shortcut: {
			type: String,
			default: () => ''
		},
		isEnabled: {
			type: Function,
			default() {
				return () => true;
			}
		},
		onClick: {
			type: Function,
			default() {
				return () => {};
			}
		},
		children: {
			type: Array,
			default: () => []
		},
		opened: Boolean,
		invertArrow: Boolean
	},
	computed: {
		linkClass() {
			return this.isEnabled() ? '' : 'disabledLink';
		},
		arrowClass() {
			return (this.opened === this.invertArrow) ? 'arrow' : 'arrow turnedArrow';
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
		}
	}
};
</script>

<style scoped>
* {
	font-size: 14px;
}

li {
	list-style: none;
}
	li img {
		width: 24px;
		margin-right: 8px;
		vertical-align: middle;
	}

	li span {
		vertical-align: middle;
	}

a {
	display: block;
	line-height: 24px;
	cursor: pointer;
	padding: 8px 10px;
	position: relative;
}

.disabledLink {
	opacity: 0.4;
    pointer-events: none;
}

a:hover {
	background: #fff6;
	color: #318be7;
}

.children {
	background: #0001;
}

.subMenu {
	padding: 0;
	margin: 0;
}

.subMenu a:hover {
	background: #0001;
}

.arrow, .shortcut {
	position: absolute;
	right: 10px;
}

.shortcut {
	opacity: 0.3;
}

.arrow {
	width: 10px;
	margin: -5px 0 0 0;
	top: 50%;
	transition: transform .4s;
}

.turnedArrow {
	transform: rotate(180deg);
}
</style>
