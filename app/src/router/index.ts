import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
  RouteRecordRaw,
} from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
    component: () => import("@views/layout/index.vue"),
    children: [
      {
        path: "/home",
        name: "home",
        meta: {
          icon: "Message",
        },
        component: () => import("@views/Home.vue"),
      },
      {
        path: "/chart",
        name: "chart",
        meta: {
          icon: "IconMenu",
        },
        component: () => import("@views/router.vue"),
        children: [
          {
            path: "/chart/bar",
            name: "bar",
            component: () => import("@views/About.vue"),
          },
          {
            path: "/chart/xxx",
            name: "xxx",
            component: () => import("@views/Home.vue"),
          },
          {
            path: "/chart/ccc",
            name: "ccc",
            component: () => import("@views/router.vue"),
            children: [
              {
                path: "/chart/ccc/ddd",
                name: "ddd",
                meta: {
                  icon: "IconMenu",
                },
                component: () => import("@views/About.vue"),
              },
            ],
          },
        ],
      },
      {
        path: "/fff",
        name: "fff",
        meta: {
          icon: "UserOutlined",
        },
        component: () => import("@views/About.vue"),
      },
    ],
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
