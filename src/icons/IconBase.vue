<template>
	<svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
		<title :id="iconName" lang="en">
			{{ iconName }} icon
		</title>
		<slot />
	</svg>
</template>

<script>
export default {
	props: {
		iconName: {
			type: String,
			default: 'icon'
		},
		width: {
			type: [Number, String],
			default: 24
		},
		height: {
			type: [Number, String],
			default: 24
		}
	}
};
</script>

<style lang="scss">
@import '~@/global.scss';
$gray: #4b4b4b;

svg {
	stroke-width: 2;
	stroke-linecap: round;
	stroke-linejoin: round;
	fill: none;
}

.blueStroke {
	stroke: $blue;
}
.grayStroke {
	stroke: $gray;
}

.blueFill {
	fill: $blue;
}
.grayFill {
	fill: $gray;
}
.whiteFill {
	fill: white;
}

</style>
