'use strict';
(self.webpackChunkumbrella_dashboard_client =
  self.webpackChunkumbrella_dashboard_client || []).push([
  [561],
  {
    561: (e, a, l) => {
      l.r(a), l.d(a, { default: () => n });
      const s = l(950),
        t = l(813),
        d = l(543),
        i = l(414);
      const n = () => {
        const { user: e } = (0, d.A)(),
          [a, l] = (0, s.useState)(''),
          [n, r] = (0, s.useState)(!0),
          [m, c] = (0, s.useState)(!1),
          [u, o] = (0, s.useState)(''),
          [b, h] = (0, s.useState)('');
        (0, s.useEffect)(() => {
          e &&
            (r(!0),
            o(''),
            t.db.profiles
              .getById(e.id)
              .then(e => {
                l((null === e || void 0 === e ? void 0 : e.name) || '');
              })
              .catch(() => o('Failed to load profile'))
              .finally(() => r(!1)));
        }, [e]);
        return n
          ? (0, i.jsx)('div', { children: 'Loading...' })
          : (0, i.jsxs)('div', {
              className: 'max-w-md mx-auto p-4',
              children: [
                (0, i.jsx)('h1', {
                  className: 'text-2xl font-bold mb-4',
                  children: 'Settings',
                }),
                u &&
                  (0, i.jsx)('div', {
                    className: 'text-red-600 mb-4',
                    children: u,
                  }),
                b &&
                  (0, i.jsx)('div', {
                    className: 'text-green-600 mb-4',
                    children: b,
                  }),
                (0, i.jsxs)('form', {
                  onSubmit: async l => {
                    l.preventDefault(), c(!0), o(''), h('');
                    try {
                      await t.db.profiles.update(e.id, { name: a }),
                        h('Profile updated successfully');
                    } catch (s) {
                      o('Failed to update profile');
                    }
                    c(!1);
                  },
                  className: 'space-y-4',
                  children: [
                    (0, i.jsxs)('div', {
                      children: [
                        (0, i.jsx)('label', {
                          htmlFor: 'email',
                          className: 'block text-sm font-medium mb-1',
                          children: 'Email',
                        }),
                        (0, i.jsx)('input', {
                          id: 'email',
                          type: 'email',
                          value: e.email,
                          disabled: !0,
                          className: 'w-full border p-2 rounded bg-gray-100',
                        }),
                      ],
                    }),
                    (0, i.jsxs)('div', {
                      children: [
                        (0, i.jsx)('label', {
                          htmlFor: 'name',
                          className: 'block text-sm font-medium mb-1',
                          children: 'Display Name',
                        }),
                        (0, i.jsx)('input', {
                          id: 'name',
                          type: 'text',
                          value: a,
                          onChange: e => l(e.target.value),
                          className: 'w-full border p-2 rounded',
                        }),
                      ],
                    }),
                    (0, i.jsx)('button', {
                      type: 'submit',
                      disabled: m,
                      className: 'bg-blue-600 text-white px-4 py-2 rounded',
                      children: m ? 'Saving...' : 'Save Changes',
                    }),
                  ],
                }),
              ],
            });
      };
    },
  },
]);
