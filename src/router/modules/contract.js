import contractAdd from '@/views/contract/contract-add';
import contractEdit from '@/views/contract/contract-edit';

/**
 * 首页路由配置
 */
export default {
  path: '/home/contract',
  name: 'contract',
  component: {
    render: (h) => h('router-view')
  },
  meta: {
    label: '合同模板',
    icon: 's-grid'
  },
  children: [
    {
      path: '/home/contract/contract-add',
      name: 'contract-add',
      component: contractAdd,
      meta: {
        label: '合同模板新增'
      }
    },
    {
      path: '/home/contract/contract-edit',
      name: 'contract-edit',
      component: contractEdit,
      meta: {
        label: '合同模板使用'
      }
    }
  ]
};
