/**
 * series.js - 把标记了 series 的文章收成一个"入口页"，并从首页/归档列表里排除，
 * 避免一个系列几十章把首页和归档刷屏。
 *
 * 工作原理
 *   1. 覆盖 hexo-generator-index-pin-top 注册的 index 生成器：
 *      首页分页时只取"没有 series 字段"的文章（置顶排序逻辑保持不变）。
 *   2. 覆盖 hexo-generator-archive 注册的 archive 生成器：
 *      归档页（含按年/月）同样只列非系列文章。
 *   3. 为每个 series 生成一个入口页 /<series>/ ，
 *      内含该系列全部章节的有序列表（按 chapter 字段排序）。
 *
 * 为什么用脚本覆盖而不是改主题模板：
 *   主题模板属于第三方代码（themes/async），升级时会被覆盖；
 *   放在项目自己的 scripts/ 目录里，升级主题不会丢失。
 *
 * 重要：hexo-pagination 出来的 page.posts 必须是 Query 对象（模板里用了
 *       page.posts.each(...)），所以这里统一用 model('Post').Query 重新包装，
 *       不能直接传数组。
 *
 * 说明：系列文章本身仍是正常文章（可在标签页/分类页/站内搜索里检索到），
 *       只是不再出现在首页"最近发布"和归档列表里。
 */

'use strict';

const pagination = require('hexo-pagination');

// 读取 config 里的系列定义
function getSeriesConfig(hexo) {
  return hexo.config.series_config || {};
}

// 文章属于哪个已登记的系列；不属于任何系列则返回 null
function seriesOf(post, names) {
  const s = post.series;
  if (!s) return null;
  return names.indexOf(String(s)) >= 0 ? String(s) : null;
}

// 把文档数组按置顶规则排序（与 hexo-generator-index-pin-top 一致）
function sortByTopThenDate(docs) {
  return docs.slice().sort(function (a, b) {
    if (a.top && b.top) {
      if (a.top === b.top) return b.date - a.date;
      return b.top - a.top;
    } else if (a.top && !b.top) {
      return -1;
    } else if (!a.top && b.top) {
      return 1;
    }
    return b.date - a.date;
  });
}

// ---------- 首页：沿用置顶排序，但过滤掉系列文章 ----------
function indexGenerator(locals) {
  const hexo = this;
  const config = hexo.config;
  const names = Object.keys(getSeriesConfig(hexo));
  const { Query } = hexo.model('Post');

  const docs = locals.posts.toArray().filter(function (post) {
    return post.published !== false && seriesOf(post, names) === null;
  });

  const collection = new Query(sortByTopThenDate(docs));

  return pagination('', collection, {
    perPage: config.index_generator.per_page,
    layout: ['index', 'archive'],
    format: (config.pagination_dir || 'page') + '/%d/',
    data: { __index: true }
  });
}

// ---------- 归档：只列非系列文章 ----------
function archiveGenerator(locals) {
  const hexo = this;
  const config = hexo.config;
  const names = Object.keys(getSeriesConfig(hexo));
  const { Query } = hexo.model('Post');

  const docs = locals.posts.toArray().filter(function (post) {
    return seriesOf(post, names) === null;
  });

  if (!docs.length) return;

  const sorted = Query.sort
    ? new Query(docs).sort(config.archive_generator.order_by || '-date').toArray()
    : docs;

  const archiveDir = config.archive_dir;
  const baseDir = archiveDir[archiveDir.length - 1] === '/' ? archiveDir : archiveDir + '/';
  const paginationDir = config.pagination_dir || 'page';
  const perPage = config.archive_generator.per_page;
  const result = [];

  function generate(path, posts, options) {
    options = options || {};
    options.archive = true;
    result.push.apply(result, pagination(path, posts, {
      perPage: perPage,
      layout: ['archive', 'index'],
      format: paginationDir + '/%d/',
      data: options
    }));
  }

  generate(baseDir, new Query(sorted));

  if (!config.archive_generator.yearly) return result;

  const byYear = {};
  sorted.forEach(function (post) {
    const year = post.date.year();
    const month = post.date.month() + 1;
    if (!byYear[year]) {
      byYear[year] = [];
      for (let i = 0; i < 13; i++) byYear[year].push([]);
    }
    byYear[year][0].push(post);
    byYear[year][month].push(post);
  });

  const fmt = function (n) { return String(n).padStart(2, '0'); };

  Object.keys(byYear).forEach(function (yearKey) {
    const year = +yearKey;
    const data = byYear[yearKey];
    const url = baseDir + year + '/';
    if (!data[0].length) return;

    generate(url, new Query(data[0]), { year: year });

    if (!config.archive_generator.monthly && !config.archive_generator.daily) return;

    for (let month = 1; month <= 12; month++) {
      const monthData = data[month];
      if (!monthData.length) continue;
      if (config.archive_generator.monthly) {
        generate(url + fmt(month) + '/', new Query(monthData), { year: year, month: month });
      }
    }
  });

  return result;
}

// ---------- 系列入口页 /<series>/ ----------
function seriesPageGenerator(locals) {
  const hexo = this;
  const cfg = getSeriesConfig(hexo);
  const pages = [];

  Object.keys(cfg).forEach(function (key) {
    const meta = cfg[key] || {};

    const posts = locals.posts.toArray().filter(function (post) {
      return String(post.series) === key;
    });

    if (!posts.length) return;

    const isAppendix = function (p) {
      return typeof p.chapter === 'number' && p.chapter >= 100;
    };

    function toItem(post, fallback) {
      return {
        title: post.title,
        path: post.path,
        order: typeof post.chapter === 'number' ? post.chapter : fallback,
        desc: post.desc || ''
      };
    }

    const chapters = posts
      .filter(function (p) { return !isAppendix(p); })
      .sort(function (a, b) {
        const ca = typeof a.chapter === 'number' ? a.chapter : 999;
        const cb = typeof b.chapter === 'number' ? b.chapter : 999;
        if (ca !== cb) return ca - cb;
        return a.date - b.date;
      })
      .map(function (p, i) { return toItem(p, i + 1); });

    const appendix = posts
      .filter(isAppendix)
      .sort(function (a, b) { return a.chapter - b.chapter; })
      .map(function (p, i) { return toItem(p, i + 1); });

    pages.push({
      path: key + '/index.html',
      layout: ['series'],
      data: {
        __series: true,
        // title 供 <title> 与 og:title 使用（主题 head.ejs 读 page.title）
        title: meta.title || key,
        // 系列页横幅用专属封面，而不是主题默认图
        banner: { type: 'img', bgurl: meta.cover || '' },
        series_key: key,
        series_title: meta.title || key,
        series_subtitle: meta.subtitle || '',
        series_intro: meta.intro || '',
        // 附录优先取 front-matter 里 chapter>=100 的文章，其次取配置里的手工清单
        series_extra: appendix.length ? appendix : (meta.extra || []),
        chapters: chapters,
        total: chapters.length
      }
    });
  });

  return pages;
}

hexo.extend.generator.register('index', indexGenerator);
hexo.extend.generator.register('archive', archiveGenerator);
hexo.extend.generator.register('series_page', seriesPageGenerator);