import { HttpResponse, http } from "msw";

const SUCCESS_CODE = '0000000000';

const allMenus = [
  {
    id: 'dashboard',
    code: 'dashboard',
    title: '仪表盘',
    url: '/rap-web-app/dashboard',
    type: 'menu' as const,
    icon: 'layout-dashboard',
    parentId: null,
    parentCode: null,
    hidden: false,
    openMode: 'currentSystemTab' as const,
    isHome: true,
    keepAlive: true,
    permissions: [],
    order: 1,
    isActive: true,
    status: 'enabled' as const
  },
  {
    id: 'overview',
    code: 'overview',
    title: '概览',
    url: '/rap-web-app/overview',
    type: 'menu' as const,
    icon: 'globe',
    parentId: null,
    parentCode: null,
    hidden: false,
    openMode: 'currentSystemTab' as const,
    permissions: [],
    order: 2,
    isActive: true,
    status: 'enabled' as const
  },
  {
    id: 'features',
    code: 'features',
    title: '功能特性',
    url: '/rap-web-app/features',
    type: 'dir' as const,
    icon: 'box',
    parentId: null,
    parentCode: null,
    hidden: false,
    openMode: 'currentSystemTab' as const,
    permissions: [],
    order: 3,
    isActive: true,
    status: 'enabled' as const,
    category: 'application' as const,
    children: [
      {
        id: 'features-move',
        code: 'features-move',
        title: '移动',
        url: '/rap-web-app/features/move',
        type: 'menu' as const,
        icon: 'move',
        parentId: 'features',
        parentCode: 'features',
        hidden: false,
        openMode: 'currentSystemTab' as const,
        permissions: [],
        order: 1,
        isActive: true,
        status: 'enabled' as const
      },
      {
        id: 'features-resize',
        code: 'features-resize',
        title: '调整大小',
        url: '/rap-web-app/features/resize',
        type: 'menu' as const,
        icon: 'resize',
        parentId: 'features',
        parentCode: 'features',
        hidden: false,
        openMode: 'currentSystemTab' as const,
        permissions: [],
        order: 2,
        isActive: true,
        status: 'enabled' as const
      },
      {
        id: 'features-panel-controls',
        code: 'features-panel-controls',
        title: '面板控制',
        url: '/rap-web-app/features/panel-controls',
        type: 'menu' as const,
        icon: 'panel-control',
        parentId: 'features',
        parentCode: 'features',
        hidden: false,
        openMode: 'currentSystemTab' as const,
        permissions: [],
        order: 3,
        isActive: true,
        status: 'enabled' as const
      }
    ]
  }
];

const partialMenus = [
  {
    id: 'dashboard',
    code: 'dashboard',
    title: '仪表盘',
    url: '/rap-web-app/dashboard',
    type: 'menu' as const,
    icon: 'layout-dashboard',
    parentId: null,
    parentCode: null,
    hidden: false,
    openMode: 'currentSystemTab' as const,
    isHome: true,
    keepAlive: true,
    permissions: [],
    order: 1,
    isActive: true,
    status: 'enabled' as const
  },
  {
    id: 'overview',
    code: 'overview',
    title: '概览',
    url: '/rap-web-app/overview',
    type: 'menu' as const,
    icon: 'globe',
    parentId: null,
    parentCode: null,
    hidden: false,
    openMode: 'currentSystemTab' as const,
    permissions: [],
    order: 2,
    isActive: true,
    status: 'enabled' as const
  }
];



export const handlers = [
  http.get("/api/rap/user/menus", ({ request }) => {
		const token = request.headers.get('authorization') ?? '';
		if (!token) {
			return HttpResponse.json({ code: '4010000000', message: 'unauthorized', data: null });
		}
		const username = token.split(' ')[1] || '';
		if (username !== 'admin') {
			return HttpResponse.json({ code: SUCCESS_CODE, message: 'success', data: partialMenus });
		} else {
			return HttpResponse.json({ code: SUCCESS_CODE, message: 'success', data: allMenus });
		}




  }),
];
