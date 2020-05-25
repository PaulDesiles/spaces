<template>
	<IconBase icon-name="next">
		<path d="M7,20 16,10" class="grayStroke" />
		<circle cx="16" cy="10" r="3" class="whiteFill blueStroke" />
		<g class="grayFill">
			<circle r="1" cx="4" cy="6" />
			<circle r="1" cx="7" cy="7" />
			<circle r="1" cx="10" cy="8" />
		</g>
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
