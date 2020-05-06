<template>
	<div>
		<h1>SPACES</h1>
		<ul>
			<MenuItem
				v-for="item in items"
				:key="item.label"
				v-bind="item"
				:opened="item === openedItem"
				@toggleOpening="toggleOpening(item)"
			/>
		</ul>
	</div>
</template>

<script>
import MenuItem from './MenuItem';

import iconNew from './assets/new.svg';
import iconUndo from './assets/undo.svg';
import iconRedo from './assets/redo.svg';
import iconExport from './assets/export.svg';
import iconGuides from './assets/guides.svg';
import iconCurrent from './assets/current.svg';
import iconNext from './assets/next.svg';

export default {
	name: 'Menu',
	components: {
		MenuItem
	},
	data() {
		return {
			openedItem: undefined,
			items: [
				{
					label: 'New',
					icon: iconNew,
					onClick: this.reset
				},
				{
					label: 'Undo',
					icon: iconUndo,
					shortcut: 'ctrl+Z',
					isEnabled: this.canUndo,
					onClick: this.undo
				},
				{
					label: 'Redo',
					icon: iconRedo,
					shortcut: 'ctrl+Y',
					isEnabled: this.canRedo,
					onClick: this.redo
				},
				{
					label: 'Export',
					icon: iconExport,
					isEnabled: () => false
				},
				{
					label: 'Guides',
					icon: iconGuides,
					children: [
						{
							label: 'Add horizontal',
							shortcut: 'H',
							isEnabled: () => false
						},
						{
							label: 'Add vertical',
							shortcut: 'V',
							isEnabled: () => false
						},
						{
							label: 'Clear all',
							shortcut: 'G',
							isEnabled: () => false
						}
					]
				},
				{
					label: 'Current stroke',
					icon: iconCurrent,
					children: [
						{
							label: 'Parallel to line',
							shortcut: 'L',
							isEnabled: () => false
						},
						{
							label: 'Points toward',
							shortcut: 'P',
							isEnabled: () => false
						},
						{
							label: 'Copy length',
							shortcut: 'S',
							isEnabled: () => false
						}
					]
				},
				{
					label: 'Next stroke',
					icon: iconNext,
					children: [
						{
							label: 'Parallel to line…',
							shortcut: 'N',
							isEnabled: () => false
						}
					]
				}
			]
		};
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
		canUndo() {
			return this.$store.getters.canUndo;
		},
		canRedo() {
			return this.$store.getters.canRedo;
		},
		toggleOpening(item) {
			if (this.openedItem === item) {
				this.openedItem = undefined;
			} else {
				this.openedItem = item;
			}
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
}

</style>
