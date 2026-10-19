// Dynamically configure baseUrl and url:
// - Vercel / local development / custom domain: baseUrl = '/'
// - GitHub Pages CI without Vercel: baseUrl = '/testdriveeveofdestructionwiki/' (or env BASE_URL)
const isVercel = Boolean(process.env.VERCEL);
const isGitHubActions = Boolean(process.env.GITHUB_ACTIONS && !isVercel);
const baseUrl = process.env.BASE_URL || (isGitHubActions ? '/testdriveeveofdestructionwiki/' : '/');
const url = process.env.SITE_URL || (isVercel ? 'https://testdriveeveofdestructionwiki.vercel.app' : 'https://catsandsoup.github.io');

module.exports = {
  title: 'Test Drive: Eve of Destruction Wiki',
  tagline: 'PlayStation 2 (SLUS_209.10) Native Recompilation & Reverse-Engineering Hub',
  url,
  baseUrl,
  organizationName: 'catsandsoup',
  projectName: 'testdriveeveofdestructionwiki',
  trailingSlash: false,
  favicon: 'img/favicon.svg',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&family=Permanent+Marker&family=Russo+One&family=Teko:wght@500;600;700&display=swap',
      type: 'text/css',
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'EOD [PS2 RECOMP]',
      logo: {
        alt: 'Test Drive: Eve of Destruction Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/',
          label: 'Demolition Hub',
          position: 'left',
        },
        {
          to: '/ps2/BATTLE_RECOVERY',
          label: 'Battle & Weapons',
          position: 'left',
        },
        {
          to: '/ps2/LOD_RUNTIME',
          label: 'GS & Rendering',
          position: 'left',
        },
        {
          to: '/ps2/INPUT_CONTINUATION',
          label: 'DualShock 2 Input',
          position: 'left',
        },
        {
          to: '/ps2/MODDING_SCOPE',
          label: 'Modding Scope',
          position: 'left',
        },
        {
          href: 'https://github.com/catsandsoup/testdriveeveofdestructionwiki',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'PS2 Subsystems',
          items: [
            { label: 'Battle Recovery & Combat AI', to: '/ps2/BATTLE_RECOVERY' },
            { label: 'GS Packet Replay & LOD', to: '/ps2/LOD_RUNTIME' },
            { label: 'DualShock 2 Input Continuation', to: '/ps2/INPUT_CONTINUATION' },
            { label: 'HUD Edge Anchors & Safe Area', to: '/ps2/HUD_EDGE_ANCHORS' },
          ],
        },
        {
          title: 'Machine Retrieval',
          items: [
            { label: 'Structured Knowledge Index (JSON)', href: 'pathname:///knowledge-index.json' },
            { label: 'LLM Retrieval Entry Point', href: 'pathname:///llms.txt' },
            { label: 'Full Markdown Corpus', href: 'pathname:///llms-full.txt' },
            { label: 'Subsystem Tags', to: '/tags' },
          ],
        },
        {
          title: 'Decompilation Ecosystem',
          items: [
            { label: 'Wiki Repository', href: 'https://github.com/catsandsoup/testdriveeveofdestructionwiki' },
            { label: 'Target: PlayStation 2 (SLUS_209.10)', href: 'https://github.com/catsandsoup/testdriveeveofdestructionwiki' },
          ],
        },
      ],
      copyright: `Test Drive: Eve of Destruction • PlayStation 2 (SLUS_209.10) Native Recompilation Wiki • Built for mud, speed, and demolition derby.`,
    },
  },
};
