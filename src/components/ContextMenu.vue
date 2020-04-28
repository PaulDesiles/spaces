<template>
	<div v-if="opened" id="contextMenu" :style="positionStyle">
		<i v-if="showDefaultMessage">
			no action available
		</i>

		<div
			v-for="(action, index) in actions"
			:key="action.id"
			:class="getActionClasses(index)"
			@click="executeAction(action)"
		>
			{{ action.title }}
		</div>
	</div>
</template>

<script>
export default {
	name: 'ContextMenu',
	data() {
		return {
			opened: false,
			position: {x: 0, y: 0},
			actions: []
		};
	},
	computed: {
		positionStyle() {
			return {
				left: this.position.x + 'px',
				top: this.position.y + 'px'
			};
		},
		showDefaultMessage() {
			return this.actions.length === 0;
		}
	},
	methods: {
		initialize(actions, x, y) {
			this.actions = actions;

			const margin = 20;
			const height = (this.actions.length * 22) + 6;
			this.position = {
				x: Math.min(x, document.documentElement.clientWidth - 210 - margin),
				y: Math.min(y, document.documentElement.clientHeight - height - margin)
			};

			this.opened = true;
		},
		close() {
			this.opened = false;
		},
		getActionClasses(actionIndex) {
			const classes = ['action'];
			if (actionIndex === 0) {
				classes.push('firstAction');
			}

			if (actionIndex === this.actions.length - 1) {
				classes.push('lastAction');
			}

			return classes;
		},
		executeAction(action) {
			action.onClick();
			this.opened = false;
		}
	}
};
</script>

<style scoped>
#contextMenu {
	width: 210px;
	min-height: 20px;
	border-radius: 5px;
	background: #ddde;
	border: #999 1px solid;
	box-shadow: 0px 0px 6px #6664;
	color: #444;
	padding: 0px;
	user-select: none;
	position: absolute;
}

i {
	display: inline-block;
	opacity: 0.5;
	margin: 6px 8px;
}

.action {
	padding: 3px 8px;
}

	.action:hover {
		background: #318be766;
		color: #333;
	}

.firstAction {
	padding-top: 6px;
}

.lastAction {
	padding-bottom: 6px;
}

</style>
