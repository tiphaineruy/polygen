import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <img
          src={`${process.env.DOCS_BASE_PATH ?? ''}/polygen-logo.png`}
          alt="Polygen logo"
          width={32}
        />
        Polygen
      </>
    ),
  },
  githubUrl: 'https://github.com/callstackincubator/polygen',
  links: [
    {
      text: 'Documentation',
      url: '/docs/polygen',
      active: 'nested-url',
    },
  ],
};
