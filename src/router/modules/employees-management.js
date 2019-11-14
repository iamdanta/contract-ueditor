// import ProcessClassificationManagement from '@/views/business-config/process-classification-management'; // 流程分类管理

//从业主体变更
import EmployeesChangeManagement from '@/views/employees-management/employees-change-management';
//从业主体注销
import EmployeesCancellationManagement from '@/views/employees-management/employees-cancellation-management';
//从业主体信息详细
import EmployeesDetailManagement from '@/views/employees-management/employees-detail-management';
/**
 * 业务配置路由配置
 */
export default {
  path: '/home/employees-management',
  name: 'employees-management',
  meta: {
    label: '从业主体管理',
    icon: 's-grid'
  },
  component: {
    render: (h) => h('router-view')
  },
  redirect: '/home/employees-management/index',
  children: [
    {
      path: '/home/employees-management/employees-change-management',
      name: 'employees-change-management',
      component: EmployeesChangeManagement,
      meta: {
        label: '从业主体变更',
        icon: 'document'
      }
    },
    {
      path: '/home/employees-management/employees-cancellation-management',
      name: 'employees-cancellation-management',
      component: EmployeesCancellationManagement,
      meta: {
        label: '从业主体注销',
        icon: 'document'
      }
    },
    {
      path: '/home/employees-management/employees-detail-management',
      name: 'employees-detail-management',
      component: EmployeesDetailManagement,
      meta: {
        label: '从业主体信息详细',
        icon: 'document'
      }
    }
  ]
};
