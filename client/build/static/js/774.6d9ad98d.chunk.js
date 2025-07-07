'use strict';
(self.webpackChunkumbrella_dashboard_client =
  self.webpackChunkumbrella_dashboard_client || []).push([
  [774],
  {
    774: (e, s, t) => {
      t.r(s), t.d(s, { default: () => i });
      const a = t(950),
        c = t(414);
      const l = [
          {
            id: 1,
            type: 'Login',
            timestamp: '2024-01-20 10:30',
            ip: '192.168.1.1',
            location: 'San Francisco, CA',
            status: 'Success',
          },
          {
            id: 2,
            type: 'Failed Login',
            timestamp: '2024-01-20 09:15',
            ip: '203.0.113.1',
            location: 'Unknown',
            status: 'Failed',
          },
          {
            id: 3,
            type: 'Password Change',
            timestamp: '2024-01-19 16:45',
            ip: '192.168.1.1',
            location: 'San Francisco, CA',
            status: 'Success',
          },
        ],
        i = () => {
          const [e, s] = (0, a.useState)([]),
            [t, i] = (0, a.useState)(!0),
            [d, n] = (0, a.useState)('');
          return (
            (0, a.useEffect)(() => {
              i(!0),
                n(''),
                setTimeout(() => {
                  s(l), i(!1);
                }, 800);
            }, []),
            (0, c.jsxs)('div', {
              className: 'max-w-2xl mx-auto p-4',
              children: [
                (0, c.jsx)('h1', {
                  className: 'text-2xl font-bold mb-4',
                  children: 'Security Events',
                }),
                t
                  ? (0, c.jsx)('div', { children: 'Loading...' })
                  : d
                  ? (0, c.jsx)('div', {
                      className: 'text-red-600',
                      children: d,
                    })
                  : (0, c.jsxs)('table', {
                      className: 'w-full border',
                      children: [
                        (0, c.jsx)('thead', {
                          children: (0, c.jsxs)('tr', {
                            className: 'bg-gray-100',
                            children: [
                              (0, c.jsx)('th', {
                                className: 'p-2 text-left',
                                children: 'Type',
                              }),
                              (0, c.jsx)('th', {
                                className: 'p-2 text-left',
                                children: 'Time',
                              }),
                              (0, c.jsx)('th', {
                                className: 'p-2 text-left',
                                children: 'IP',
                              }),
                              (0, c.jsx)('th', {
                                className: 'p-2 text-left',
                                children: 'Location',
                              }),
                              (0, c.jsx)('th', {
                                className: 'p-2 text-left',
                                children: 'Status',
                              }),
                            ],
                          }),
                        }),
                        (0, c.jsx)('tbody', {
                          children: e.map(e =>
                            (0, c.jsxs)(
                              'tr',
                              {
                                className: 'border-t',
                                children: [
                                  (0, c.jsx)('td', {
                                    className: 'p-2',
                                    children: e.type,
                                  }),
                                  (0, c.jsx)('td', {
                                    className: 'p-2',
                                    children: e.timestamp,
                                  }),
                                  (0, c.jsx)('td', {
                                    className: 'p-2',
                                    children: e.ip,
                                  }),
                                  (0, c.jsx)('td', {
                                    className: 'p-2',
                                    children: e.location,
                                  }),
                                  (0, c.jsx)('td', {
                                    className: 'p-2 '.concat(
                                      'Success' === e.status
                                        ? 'text-green-600'
                                        : 'text-red-600'
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
