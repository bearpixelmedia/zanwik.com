'use strict';
(self.webpackChunkumbrella_dashboard_client =
  self.webpackChunkumbrella_dashboard_client || []).push([
  [211],
  {
    211: (e, t, s) => {
      s.r(t), s.d(t, { default: () => c });
      const a = s(950),
        r = s(414);
      const l = [
          {
            id: 1,
            title: 'High CPU Usage',
            severity: 'Warning',
            service: 'Web Server',
            time: '2 minutes ago',
            status: 'Active',
          },
          {
            id: 2,
            title: 'Database Connection Slow',
            severity: 'Error',
            service: 'Database',
            time: '5 minutes ago',
            status: 'Resolved',
          },
          {
            id: 3,
            title: 'Memory Usage High',
            severity: 'Warning',
            service: 'API Gateway',
            time: '10 minutes ago',
            status: 'Active',
          },
        ],
        c = () => {
          const [e, t] = (0, a.useState)([]),
            [s, c] = (0, a.useState)(!0),
            [i, n] = (0, a.useState)('');
          (0, a.useEffect)(() => {
            c(!0),
              n(''),
              setTimeout(() => {
                t(l), c(!1);
              }, 800);
          }, []);
          const d = e => {
              switch (e) {
                case 'Critical':
                  return 'text-red-600';
                case 'Error':
                  return 'text-orange-600';
                case 'Warning':
                  return 'text-yellow-600';
                case 'Info':
                  return 'text-blue-600';
                default:
                  return 'text-gray-600';
              }
            },
            x = e => {
              switch (e) {
                case 'Active':
                  return 'text-red-600';
                case 'Resolved':
                  return 'text-green-600';
                case 'Acknowledged':
                  return 'text-yellow-600';
                default:
                  return 'text-gray-600';
              }
            };
          return (0, r.jsxs)('div', {
            className: 'max-w-4xl mx-auto p-4',
            children: [
              (0, r.jsx)('h1', {
                className: 'text-2xl font-bold mb-4',
                children: 'Alerts',
              }),
              s
                ? (0, r.jsx)('div', { children: 'Loading...' })
                : i
                ? (0, r.jsx)('div', { className: 'text-red-600', children: i })
                : (0, r.jsxs)('table', {
                    className: 'w-full border',
                    children: [
                      (0, r.jsx)('thead', {
                        children: (0, r.jsxs)('tr', {
                          className: 'bg-gray-100',
                          children: [
                            (0, r.jsx)('th', {
                              className: 'p-2 text-left',
                              children: 'Title',
                            }),
                            (0, r.jsx)('th', {
                              className: 'p-2 text-left',
                              children: 'Severity',
                            }),
                            (0, r.jsx)('th', {
                              className: 'p-2 text-left',
                              children: 'Service',
                            }),
                            (0, r.jsx)('th', {
                              className: 'p-2 text-left',
                              children: 'Time',
                            }),
                            (0, r.jsx)('th', {
                              className: 'p-2 text-left',
                              children: 'Status',
                            }),
                          ],
                        }),
                      }),
                      (0, r.jsx)('tbody', {
                        children: e.map(e =>
                          (0, r.jsxs)(
                            'tr',
                            {
                              className: 'border-t',
                              children: [
                                (0, r.jsx)('td', {
                                  className: 'p-2',
                                  children: e.title,
                                }),
                                (0, r.jsx)('td', {
                                  className: 'p-2 '.concat(d(e.severity)),
                                  children: e.severity,
                                }),
                                (0, r.jsx)('td', {
                                  className: 'p-2',
                                  children: e.service,
                                }),
                                (0, r.jsx)('td', {
                                  className: 'p-2',
                                  children: e.time,
                                }),
                                (0, r.jsx)('td', {
                                  className: 'p-2 '.concat(x(e.status)),
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
          });
        };
    },
  },
]);
