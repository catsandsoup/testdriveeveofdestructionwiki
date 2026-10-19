// Default Docusaurus classic appearance; visual customization is left to the owner.
module.exports = {
  title: 'Test Drive: Eve of Destruction Wiki',
  tagline: 'Recompilation and reverse-engineering knowledge',
  url: 'https://catsandsoup.github.io',
  baseUrl: '/testdriveeveofdestructionwiki/',
  organizationName: 'catsandsoup',
  projectName: 'testdriveeveofdestructionwiki',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  presets: [['classic', {docs: {routeBasePath: '/', sidebarPath: require.resolve('./sidebars.js')}, blog: false}]],
  themeConfig: {navbar: {title: 'Eve of Destruction Wiki', items: [{href: 'https://github.com/catsandsoup/testdriveeveofdestructionwiki', label: 'GitHub', position: 'right'}]}}
};
