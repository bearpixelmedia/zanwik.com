'use strict';
(self.webpackChunkumbrella_dashboard_client =
  self.webpackChunkumbrella_dashboard_client || []).push([
  [335],
  {
    335: (e, t, s) => {
      s.r(t), s.d(t, { default: () => r });
      const a = s(950),
        l = s(414);
      const d = [
          { id: 1, name: 'Postgres DB', type: 'Database', status: 'Healthy' },
          { id: 2, name: 'API Gateway', type: 'API', status: 'Healthy' },
          {
            id: 3,
            name: 'Object Storage',
            type: 'Storage',
            status: 'Degraded',
          },
        ],
        r = () => {
          const [e, t] = (0, a.useState)([]),
            [s, r] = (0, a.useState)(!0),
            [c, n] = (0, a.useState)('');
          return (
            (0, a.useEffect)(() => {
              r(!0),
                n(''),
                setTimeout(() => {
                  t(d), r(!1);
                }, 800);
            }, []),
            (0, l.jsxs)('div', {
              className: 'max-w-md mx-auto p-4',
              children: [
                (0, l.jsx)('h1', {
                  className: 'text-2xl font-bold mb-4',
                  children: 'Infrastructure',
                }),
                s
                  ? (0, l.jsx)('div', { children: 'Loading...' })
                  : c
                  ? (0, l.jsx)('div', {
                      className: 'text-red-600',
                      children: c,
                    })
                  : (0, l.jsxs)('table', {
                      className: 'w-full border',
                      children: [
                        (0, l.jsx)('thead', {
                          children: (0, l.jsxs)('tr', {
                            className: 'bg-gray-100',
                            children: [
                              (0, l.jsx)('th', {
                                className: 'p-2 text-left',
                                children: 'Name',
                              }),
                              (0, l.jsx)('th', {
                                className: 'p-2 text-left',
                                children: 'Type',
                              }),
                              (0, l.jsx)('th', {
                                className: 'p-2 text-left',
                                children: 'Status',
                              }),
                            ],
                          }),
                        }),
                        (0, l.jsx)('tbody', {
                          children: e.map(e =>
                            (0, l.jsxs)(
                              'tr',
                              {
                                className: 'border-t',
                                children: [
                                  (0, l.jsx)('td', {
                                    className: 'p-2',
                                    children: e.name,
                                  }),
                                  (0, l.jsx)('td', {
                                    className: 'p-2',
                                    children: e.type,
                                  }),
                                  (0, l.jsx)('td', {
                                    className: 'p-2 '.concat(
                                      'Healthy' === e.status
                                        ? 'text-green-600'
                                        : 'text-yellow-600'
                                    ),
                                    children: e.status,
                                  }),
                                ],
                              },
                              e.id
                            )
                          ),
                        }),
                      ],
                    }),
              ],
            })
          );
        };
    },
  },
]);
