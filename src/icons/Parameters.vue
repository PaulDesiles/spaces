<template>
	<IconBase icon-name="parameters">
		<circle cx="12" cy="12" r="4.5" class="grayStroke" stroke-width="3" />
		<path
			id="A"
			class="grayFill grayStroke"
			d="M 11,5 10.447266,7.2539061 A 5,5 0 0 1 12,7 5,5 0 0 1 13.558594,7.251953 L 13,5 Z"
		/>
		<use xlink:href="#A" transform="rotate(60 12 12)" />
		<use xlink:href="#A" transform="rotate(120 12 12)" />
		<use xlink:href="#A" transform="rotate(180 12 12)" />
		<use xlink:href="#A" transform="rotate(240 12 12)" />
		<use xlink:href="#A" transform="rotate(300 12 12)" />
	</IconBase>
</template>

<script>
import IconBase from './IconBase';
export default {
	components: {
		IconBase
	}
};
</script>
