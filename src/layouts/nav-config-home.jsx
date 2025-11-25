import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  home: icon('ic-home'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'Overview',
    items: [{ title: 'Inicio', path: paths.home.root, icon: ICONS.home }],
  },
  {
    subheader: 'Management',
    items: [
      {
        title: 'Tienda',
        path: paths.home.store.root,
        icon: ICONS.user,
        allowedRoles: ['dropper'],
      },
      {
        title: 'Mis Productos',
        path: paths.home.product.root,
        icon: ICONS.product,
        children: [
          { title: 'Lista de productos', path: paths.home.product.list },
          { title: 'Nuevo Producto', path: paths.home.product.create },
          { title: 'Cargar Productos', path: paths.home.product.upload },
        ],
      },
      {
        title: 'Mis Ordenes',
        path: paths.home.order.root,
        icon: ICONS.order,
        children: [
          { title: 'Lista de ordenes', path: paths.home.order.root },
        ],
      },
      {
        title: 'Sucursales',
        path: paths.home.warehouse.root,
        icon: ICONS.user,
      },
      {
        title: 'Inter Pay',
        path: paths.home.banking.root,
        icon: ICONS.banking,
      }
    ],
  },
];
