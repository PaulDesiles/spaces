<template>
	<div>
		<h1>SPACES</h1>
		<ul>
			<li :enabled="shapesCount > 0">
				<a>
					<img src="./assets/new.svg" />
					<span>New</span>
				</a>
			</li>
			<li :enabled="canUndo">
				<a>
					<img src="./assets/undo.svg" />
					<span>Undo</span>
					<span class="shortcut">ctrl+Z</span>
				</a>
			</li>
			<li :enabled="canRedo">
				<a>
					<img src="./assets/redo.svg" />
					<span>Redo</span>
					<span class="shortcut">ctrl+Y</span>
				</a>
			</li>
			<li :enabled="shapesCount > 0">
				<a>
					<img src="./assets/export.svg" />
					<span>Export</span>
				</a>
			</li>
			<li :enabled="false">
				<a>
					<img src="./assets/guides.svg" />
					<span>Guides</span>
					<img class="expand" src="./assets/arrow.svg" />
				</a>
			</li>
			<li :enabled="false">
				<a>
					<img src="./assets/current.svg" />
					<span>Current stroke</span>
					<img class="expand" src="./assets/arrow.svg" />
				</a>
			</li>
			<li :enabled="false">
				<a>
					<img src="./assets/next.svg" />
					<span>Next stroke</span>
					<img class="expand" src="./assets/arrow.svg" />
				</a>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	name: 'Menu',
	data() {
		return {
			items: [
			]
		};
	},
	computed: {
		shapesCount() { return 0; },
		canUndo() { return true; },
		canRedo() { return true; }
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
