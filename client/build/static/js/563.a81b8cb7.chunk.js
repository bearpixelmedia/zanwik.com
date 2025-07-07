'use strict';
(self.webpackChunkumbrella_dashboard_client =
  self.webpackChunkumbrella_dashboard_client || []).push([
  [563],
  {
    563: (e, s, t) => {
      t.r(s), t.d(s, { default: () => d });
      const a = t(950),
        l = t(414);
      const d = () => {
        const [e, s] = (0, a.useState)('Deployed'),
          [t, d] = (0, a.useState)(!1),
          [n, c] = (0, a.useState)('');
        return (0, l.jsxs)('div', {
          className: 'max-w-md mx-auto p-4',
          children: [
            (0, l.jsx)('h1', {
              className: 'text-2xl font-bold mb-4',
              children: 'Deployment',
            }),
            (0, l.jsxs)('div', {
              className: 'mb-4',
              children: [
                (0, l.jsx)('span', {
                  className: 'font-semibold',
                  children: 'Status:',
                }),
                ' ',
                e,
              ],
            }),
            n &&
              (0, l.jsx)('div', {
                className: 'text-red-600 mb-2',
                children: n,
              }),
            (0, l.jsx)('button', {
              onClick: async () => {
                d(!0), c('');
                try {
                  await new Promise(e => setTimeout(e, 1200)),
                    s('Deployed (just now)');
                } catch (e) {
                  c('Failed to redeploy');
                }
                d(!1);
              },
              disabled: t,
              className: 'bg-blue-600 text-white px-4 py-2 rounded',
              children: t ? 'Redeploying...' : 'Redeploy',
            }),
          ],
        });
      };
    },
  },
]);
