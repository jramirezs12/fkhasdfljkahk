import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
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
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      {
        title: 'One',
        path: paths.home.root,
        icon: ICONS.home,
        info: <Label>v{CONFIG.appVersion}</Label>,
      },
      { title: 'Two', path: paths.home.two, icon: ICONS.ecommerce },
      { title: 'Three', path: paths.home.three, icon: ICONS.analytics },
    ],
  },
  /**
   * Management
   */
  {
    subheader: 'Management',
    items: [
      {
        title: 'Usuario',
        path: paths.home.user.root,
        icon: ICONS.user,
        children: [
          { title: 'Profile', path: paths.home.user.root },
          { title: 'Bodegas', path: paths.home.user.cards },
          { title: 'List', path: paths.home.user.list },
          { title: 'Create', path: paths.home.user.new },
          { title: 'Edit', path: paths.home.user.demo.edit },
          { title: 'Cuenta', path: paths.home.user.account, deepMatch: true },
        ],
      },
      {
        title: 'Product',
        path: paths.home.product.root,
        icon: ICONS.product,
        children: [
          { title: 'List', path: paths.home.product.root },
          { title: 'Details', path: paths.home.product.demo.details },
          { title: 'Create', path: paths.home.product.new },
          { title: 'Edit', path: paths.home.product.demo.edit },
        ],
      },
    ],
  },
];
