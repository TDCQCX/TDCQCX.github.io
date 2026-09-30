/**
 * sitemap-robots.js - 生成 sitemap.xml 与 robots.txt
 *
 * 为什么手写而不用 hexo-generator-sitemap:
 *   本机在国内, npmjs.org 不可达, 装插件要走镜像且增加依赖面。
 *   这个站点结构固定, 手写生成器零依赖、可控。
 *
 * 输出:
 *   /sitemap.xml  - 含首页、归档、分类、标签、所有文章
 *   /robots.txt   - 允许抓取, 屏蔽分页/搜索索引, 声明 sitemap 地址
 */

hexo.extend.generator.register('sitemap_xml', function (locals) {
  const cfg = hexo.config;
  const base = (cfg.url || '').replace(/\/+$/, '');

  const urls = [];

  const push = (path, date, priority, freq) => {
    let p = path || '/';
    if (!p.startsWith('/')) p = '/' + p;
    urls.push({ loc: base + p, lastmod: date, priority, freq });
  };

  // 首页
  push('/', new Date(), '1.0', 'daily');

  // 所有文章 (按日期倒序)
  locals.posts.sort('-date').forEach(post => {
    push(post.path, post.updated || post.date, '0.8', 'weekly');
  });

  // 独立页面 (关于/友链等) 以及归档/分类/标签索引
  locals.pages.forEach(page => {
    push(page.path, page.updated || page.date, '0.5', 'monthly');
  });

  // 归档与分类标签页
  push('/archives/', new Date(), '0.6', 'weekly');
  locals.categories.forEach(c => push(c.path, new Date(), '0.4', 'weekly'));
  locals.tags.forEach(t => push(t.path, new Date(), '0.4', 'weekly'));

  // 去重
  const seen = new Set();
  const items = urls.filter(u => {
    if (seen.has(u.loc)) return false;
    seen.add(u.loc);
    return true;
  });

  const body = items.map(u => {
    const lm = u.lastmod ? new Date(u.lastmod).toISOString() : '';
    return [
      '  <url>',
      `    <loc>${u.loc}</loc>`,
      lm ? `    <lastmod>${lm}</lastmod>` : '',
      `    <changefreq>${u.freq}</changefreq>`,
      `    <priority>${u.priority}</priority>`,
      '  </url>'
    ].filter(Boolean).join('\n');
  }).join('\n');

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body + '\n</urlset>\n';

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    '# pagination and in-site search index: no need to index (avoid duplicate content)',
    'Disallow: /page/',
    'Disallow: /archives/page/',
    'Disallow: /search.xml',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    ''
  ].join('\n');

  // 注意: robots.txt 原先直接写中文字符串会被 Hexo 按非 UTF-8 落盘导致乱码,
  //       这里统一用 ASCII 注释, 避免编码问题(robots.txt 本身无需本地化)。
  return [
    { path: 'sitemap.xml', data: Buffer.from(xml, 'utf8') },
    { path: 'robots.txt', data: Buffer.from(robots, 'utf8') }
  ];
});
