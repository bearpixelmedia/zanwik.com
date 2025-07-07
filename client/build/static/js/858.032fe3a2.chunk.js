'use strict';
(self.webpackChunkumbrella_dashboard_client =
  self.webpackChunkumbrella_dashboard_client || []).push([
  [858],
  {
    858: (e, s, a) => {
      a.r(s), a.d(s, { default: () => c });
      const l = a(950),
        t = a(813),
        r = a(414);
      const c = () => {
        const [e, s] = (0, l.useState)([]),
          [a, c] = (0, l.useState)(!0),
          [d, i] = (0, l.useState)('');
        return (
          (0, l.useEffect)(() => {
            (async () => {
              c(!0), i('');
              try {
                const e = await t.db.users.getAll();
                s(e);
              } catch (e) {
                i('Failed to load users');
              }
              c(!1);
            })();
          }, []),
          (0, r.jsxs)('div', {
            className: 'max-w-2xl mx-auto p-4',
            children: [
              (0, r.jsx)('h1', {
                className: 'text-2xl font-bold mb-4',
                children: 'Users',
              }),
              a
                ? (0, r.jsx)('div', { children: 'Loading...' })
                : d
                ? (0, r.jsx)('div', { className: 'text-red-600', children: d })
                : (0, r.jsxs)('table', {
                    className: 'w-full border',
                    children: [
                      (0, r.jsx)('thead', {
                        children: (0, r.jsxs)('tr', {
                          className: 'bg-gray-100',
                          children: [
                            (0, r.jsx)('th', {
                              className: 'p-2 text-left',
                              children: 'Email',
                            }),
                            (0, r.jsx)('th', {
                              className: 'p-2 text-left',
                              children: 'Role',
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
                                  children: e.email,
                                }),
                                (0, r.jsx)('td', {
                                  className: 'p-2',
                                  children: e.role || 'user',
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
