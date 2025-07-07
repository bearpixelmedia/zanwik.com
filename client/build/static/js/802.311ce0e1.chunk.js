'use strict';
(self.webpackChunkumbrella_dashboard_client =
  self.webpackChunkumbrella_dashboard_client || []).push([
  [802],
  {
    802: (e, s, a) => {
      a.r(s), a.d(s, { default: () => i });
      const l = a(950),
        d = a(813),
        t = a(414);
      const i = () => {
        let e, s;
        const [a, i] = (0, l.useState)(null),
          [r, c] = (0, l.useState)(!0),
          [n, o] = (0, l.useState)('');
        return (
          (0, l.useEffect)(() => {
            (async () => {
              c(!0), o('');
              try {
                const e = await d.db.analytics.getOverview();
                i(e);
              } catch (e) {
                o('Failed to load analytics');
              }
              c(!1);
            })();
          }, []),
          (0, t.jsxs)('div', {
            className: 'max-w-2xl mx-auto p-4',
            children: [
              (0, t.jsx)('h1', {
                className: 'text-2xl font-bold mb-4',
                children: 'Analytics Overview',
              }),
              r
                ? (0, t.jsx)('div', { children: 'Loading...' })
                : n
                ? (0, t.jsx)('div', { className: 'text-red-600', children: n })
                : a
                ? (0, t.jsxs)('div', {
                    className: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                    children: [
                      (0, t.jsxs)('div', {
                        className: 'p-4 border rounded',
                        children: [
                          (0, t.jsx)('div', {
                            className: 'text-gray-500 text-sm',
                            children: 'Total Revenue',
                          }),
                          (0, t.jsxs)('div', {
                            className: 'text-2xl font-bold',
                            children: [
                              '$',
                              (null === (e = a.revenue) || void 0 === e
                                ? void 0
                                : e.toLocaleString()) || 0,
                            ],
                          }),
                        ],
                      }),
                      (0, t.jsxs)('div', {
                        className: 'p-4 border rounded',
                        children: [
                          (0, t.jsx)('div', {
                            className: 'text-gray-500 text-sm',
                            children: 'Total Users',
                          }),
                          (0, t.jsx)('div', {
                            className: 'text-2xl font-bold',
                            children:
                              (null === (s = a.users) || void 0 === s
                                ? void 0
                                : s.toLocaleString()) || 0,
                          }),
                        ],
                      }),
                      (0, t.jsxs)('div', {
                        className: 'p-4 border rounded',
                        children: [
                          (0, t.jsx)('div', {
                            className: 'text-gray-500 text-sm',
                            children: 'Growth',
                          }),
                          (0, t.jsxs)('div', {
                            className: 'text-2xl font-bold',
                            children: [a.growth || 0, '%'],
                          }),
                        ],
                      }),
                    ],
                  })
                : (0, t.jsx)('div', {
                    children: 'No analytics data available.',
                  }),
            ],
          })
        );
      };
    },
  },
]);
