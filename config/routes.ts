export default [
  { path: '/login', layout: false, component: './User/Login' },
  { path: '/welcome', name: '欢迎', icon: 'smile', component: './Welcome' },
  { path: '/list', name: '查询表格', icon: 'table', component: './TableList' },
  { path: '/circle', name: '圈子管理', icon: 'table', component: './CircleList' },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
