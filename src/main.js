import Vue from 'vue';
import RootApp from './RootApp.vue';
import store from './store';
import router from './routes';

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render(h) {
		return h(RootApp);
	}
}).$mount('#app');
