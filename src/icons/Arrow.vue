<template>
	<IconBase icon-name="arrow" width="10" height="10" :class="rotationClass">
		<path d="M 2 3 h 6 l-3 4z" stroke="#000" fill="#000" />
	</IconBase>
</template>

<script>
import IconBase from './IconBase';
export default {
	components: {
		IconBase
	},
	props: {
		rotate: Boolean
	},
	computed: {
		rotationClass() {
			return this.rotate ? 'rotate' : '';
		}
	}
};
</script>

<style scoped>

svg {
	transition: transform .4s;
}

.rotate {
	transform: rotate(180deg);
}

</style>
