<template>
	<div id="menu">
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

		<div id="menuBottom">
			<MenuItem
				v-bind="parametersItem"
				:opened="parametersItem === openedItem"
				@toggleOpening="toggleOpening(parametersItem)"
			>
				<ParametersContent class="parameters" />
			</MenuItem>
		</div>
	</div>
</template>

<script>
import MenuItem from './MenuItem';
import ParametersContent from '../parameters/ParametersContent';
import * as states from '../../store/states';

import iconNew from './assets/new.svg';
import iconUndo from './assets/undo.svg';
import iconRedo from './assets/redo.svg';
import iconPreview from './assets/preview.svg';
import iconExport from './assets/export.svg';
import iconGuides from './assets/guides.svg';
import iconCurrent from './assets/current.svg';
import iconNext from './assets/next.svg';
import iconParameters from './assets/parameters.svg';

export default {
	name: 'Menu',
	components: {
		MenuItem,
		ParametersContent
	},
	data() {
		return {
			openedItem: undefined,
			items: [
				{
					label: 'New',
					icon: iconNew,
					onClick: this.new
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
					label: 'Preview result',
					icon: iconPreview,
					shortcut: 'R',
					isEnabled: this.hasShape,
					onPress: this.preview,
					onRelease: this.stopPreview
				},
				{
					label: 'Export',
					icon: iconExport,
					isEnabled: this.hasShape,
					onClick: this.export
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
			],
			parametersItem: {
				label: 'Parameters',
				icon: iconParameters,
				invertArrow: true
			}
		};
	},
	methods: {
		toggleOpening(item) {
			if (this.openedItem === item) {
				this.openedItem = undefined;
			} else {
				this.openedItem = item;
			}
		},
		canUndo() {
			return this.$store.getters.canUndo;
		},
		canRedo() {
			return this.$store.getters.canRedo;
		},
		hasShape() {
			return this.$store.state.shapes.length > 0;
		},

		new() {
			this.$store.commit('setInteractionState', states.NEW);
		},
		undo() {
			this.$store.commit('undo');
		},
		redo() {
			this.$store.commit('redo');
		},
		preview() {
			this.$store.commit('setInteractionState', states.PREVIEW);
		},
		stopPreview() {
			this.$store.commit('setInteractionState', states.DRAWING);
		},
		export() {
			this.$store.commit('setInteractionState', states.EXPORT);
		}
	}
};
</script>

<style scoped>
#menu {
	position: relative;
}

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

#menuBottom {
	position: absolute;
	bottom: 0;
	width: 100%;
}

.parameters {
	padding: 10px 18px 10px 14px;
}

</style>
