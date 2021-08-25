import { IRoutes } from "../interface";

const routes: IRoutes[] = [
  {
    path: '/login',
    component: 'user/login',
  },
  {
    path: '/index',
    component: 'main',
    authority: ['admin'],
    exact: true
  },
  {
    path: '/404',
    component: 'error/404'
  },
  {
    path: '/500',
    component: 'error/500'
  },
  {
    path: '/create',
    component: 'create',
    exact: false,
    strict: false
  },
  {
    path: '/page',
    component: 'page',
    exact: false,
    strict: false
  }
];

export default routes;
