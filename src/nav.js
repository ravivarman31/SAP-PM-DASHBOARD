import {
  LayoutDashboard, Database, ArrowLeftRight, BarChart3, Factory, MapPin, Cog, Gauge,
  BriefcaseBusiness, Boxes, ListChecks, Archive, Ruler, Target, Bell, TriangleAlert,
  ClipboardList, ShieldCheck, CheckCircle2, CircleCheckBig, FileBarChart, History, LineChart,
} from 'lucide-react';

export const NAV = [
  {
    key: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [['dashboard', 'Dashboard', LayoutDashboard]],
  },
  {
    key: 'master',
    label: 'Master data',
    icon: Database,
    items: [
      ['plant', 'Plant', Factory],
      ['functional-location', 'Functional location', MapPin],
      ['equipment', 'Equipment', Cog],
      ['measuring-point', 'Measuring point', Gauge],
      ['work-center', 'Work center', BriefcaseBusiness],
      ['bom', 'Bill of material', Boxes],
      ['task-list', 'Task list', ListChecks],
      ['asset', 'Asset', Archive],
      ['measuring-document', 'Measuring document', Ruler],
      ['maintenance-strategy', 'Maintenance strategy', Target],
    ],
  },
  {
    key: 'transaction',
    label: 'Maintenance work',
    icon: ArrowLeftRight,
    items: [
      ['notifications', 'Notification', Bell],
      ['breakdowns', 'Breakdown', TriangleAlert],
      ['orders', 'Maintenance order', ClipboardList],
      ['permit', 'Permit', ShieldCheck],
      ['confirmation', 'Confirmation', CheckCircle2],
      ['maintenance-completion', 'Completion', CircleCheckBig],
    ],
  },
  {
    key: 'reports',
    label: 'Reporting',
    icon: BarChart3,
    items: [
      ['reports', 'Maintenance reports', FileBarChart],
      ['breakdown-reports', 'Breakdown reports', TriangleAlert],
      ['equipment-history', 'Equipment history', History],
      ['maintenance-analytics', 'Maintenance analytics', LineChart],
    ],
  },
];

/** Flat lookup: page id -> { label, group, icon } */
export const PAGE_INDEX = Object.fromEntries(
  NAV.flatMap((g) => g.items.map(([id, label, icon]) => [id, { id, label, group: g.label, icon }])),
);
