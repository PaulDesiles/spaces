import Vue from 'vue';
import VueRouter from 'vue-router';
import Tutorial from '../components/tutorial/Tutorial.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Tutorial
  },
  {
    path: '/draw/:id?',
    name: 'draw',
    component() {
      return import(/* webpackChunkName: "drawingApp" */ '../DrawingApp.vue');
    },
  },
];

const router = new VueRouter({
  routes,
});

export default router;
