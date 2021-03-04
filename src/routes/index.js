import Vue from 'vue';
import VueRouter from 'vue-router';
import App from '../App.vue';

Vue.use(VueRouter);

const routes = [
	{
		path: '/:id?',
		name: 'draw',
		component: App
	}
];

const router = new VueRouter({
	routes
});

export default router;
