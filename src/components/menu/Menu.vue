<template>
	<div>
		<h1>SPACES</h1>
		<ul>
			<li>
				<a @click="reset()">
					<img src="./assets/new.svg" />
					<span>New</span>
				</a>
			</li>
			<li>
				<a :class="getClass(canUndo)" @click="undo()">
					<img src="./assets/undo.svg" />
					<span>Undo</span>
					<span class="shortcut">ctrl+Z</span>
				</a>
			</li>
			<li>
				<a :class="getClass(canRedo)" @click="redo()">
					<img src="./assets/redo.svg" />
					<span>Redo</span>
					<span class="shortcut">ctrl+Y</span>
				</a>
			</li>
			<li>
				<a class="disabledLink">
					<img src="./assets/export.svg" />
					<span>Export</span>
				</a>
			</li>
			<li>
				<a class="disabledLink">
					<img src="./assets/guides.svg" />
					<span>Guides</span>
					<img class="expand" src="./assets/arrow.svg" />
				</a>
			</li>
			<li>
				<a class="disabledLink">
					<img src="./assets/current.svg" />
					<span>Current stroke</span>
					<img class="expand" src="./assets/arrow.svg" />
				</a>
			</li>
			<li>
				<a class="disabledLink">
					<img src="./assets/next.svg" />
					<span>Next stroke</span>
					<img class="expand" src="./assets/arrow.svg" />
				</a>
			</li>
		</ul>
	</div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
	name: 'Menu',
	data() {
		return {
			items: [
			]
		};
	},
	computed: {
		...mapGetters([
			'canUndo',
			'canRedo'
		])
	},
	methods: {
		reset() {
			this.$store.commit('reset');
		},
		undo() {
			this.$store.commit('undo');
		},
		redo() {
			this.$store.commit('redo');
		},
		getClass(isEnabled) {
			return isEnabled ? '' : 'disabledLink';
		}
	}
};
</script>

<style scoped>

h1 {
	font-weight: normal;
	margin: 15px;
	font-size: 16px;
	letter-spacing: 4px;
}

ul {
	padding: 0;
	margin: 0;
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

.expand, .shortcut {
	position: absolute;
	right: 10px;
}

.shortcut {
	opacity: 0.3;
}

.expand {
	width: 10px;
	margin: -.5em 0 0 0;
	top: 50%;
}

</style>
