#!/usr/bin/env node
/**
 * CHANGELOG 生成脚本（零第三方依赖）。
 *
 * 用法：
 *   node scripts/changelog.mjs [--version x.y.z] [--from <git-ref>] [--to <git-ref>] [--write]
 *
 * 缺省值：
 *   --version  取 packages/webmcp-core/package.json 的 version（与 publish.sh 的版本真相源一致）
 *   --from     取 `git describe --tags --abbrev=0`；仓库无 tag 时取全部历史。
 *              传 `ROOT` 可显式要求"取全部历史"（回填最早那个版本时用）
 *   --to       HEAD
 *   --write    缺省时只打印到 stdout，便于 CI / 人工预览
 *
 * 幂等与手写保护：
 *   CHANGELOG.md 的版本标题一律用**裸版本号**（`## 1.0.0 - YYYY-MM-DD`），与 git tag 的
 *   `v` 前缀有意区分（Keep-a-Changelog 惯例）。脚本按裸版本号定位同版本块，任何位置改成
 *   `## v1.0.0` 都会导致每次 release 重复插入新块。
 *
 *   同版本块内识别两组 HTML 注释标记：
 *     <!-- manual:start --> ... <!-- manual:end -->   人工撰写段，脚本永不覆盖
 *     <!-- auto:start -->   ... <!-- auto:end -->     自动生成段，脚本整段替换
 *   已有块缺 auto 标记时，把自动生成内容追加到 manual 段之后（或块尾）。
 *
 * 顺序契约（重要）：
 *   脚本靠 `<from>..<to>` 取提交范围，所以**本次版本的全部代码改动必须先 commit**，
 *   否则生成的是空条目。publish.sh 会在调用前检查 `git status --porcelain` 并告警。
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');
const VERSION_SOURCE = path.join(ROOT, 'packages/webmcp-core/package.json');

const FIELD_SEP = '\x1f';
const RECORD_SEP = '\x1e';

const CHANGELOG_HEADER = `# Changelog

本文件记录 webmcp-nexus 全部 npm 包的变更。四个包（\`webmcp-nexus-core\`、
\`webmcp-nexus-sdk\`、\`vite-plugin-webmcp-nexus\`、\`webpack-plugin-webmcp-nexus\`）
版本锁步发布，因此这里只有一份统一的变更日志。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循
[语义化版本](https://semver.org/lang/zh-CN/)。版本标题使用裸版本号（\`## 1.0.0\`），
git tag 使用 \`v\` 前缀（\`v1.0.0\`），两者有意区分。

\`<!-- manual:start -->\` 与 \`<!-- manual:end -->\` 之间的内容由人工撰写，
\`scripts/changelog.mjs\` 不会覆盖；\`<!-- auto:start -->\` 与 \`<!-- auto:end -->\`
之间的内容由脚本从 git log 自动生成。
`;

/** 提交类型 → 分组。顺序即渲染顺序 */
const GROUPS = [
  { key: 'breaking', title: '破坏性变更' },
  { key: 'feat', title: '新增', types: ['feat'] },
  { key: 'fix', title: '修复', types: ['fix'] },
  { key: 'perf', title: '优化', types: ['perf', 'refactor'] },
  { key: 'docs', title: '文档', types: ['docs'] },
  {
    key: 'chore',
    title: '维护',
    types: ['chore', 'ci', 'test', 'build', 'style', 'revert'],
  },
  // 兜底桶：仓库历史里存在无 type 前缀的提交（如 "support webpack v4"、
  // "添加embed.js国内镜像"），静默丢弃会让 CHANGELOG 漏条目
  { key: 'other', title: '其他', types: [] },
];

const SUBJECT_RE = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;

function parseArgs(argv) {
  const args = { version: undefined, from: undefined, to: 'HEAD', toExplicit: false, write: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--write') args.write = true;
    else if (arg === '--version') args.version = argv[++i];
    else if (arg === '--from') args.from = argv[++i];
    else if (arg === '--to') {
      args.to = argv[++i];
      args.toExplicit = true;
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        'Usage: node scripts/changelog.mjs [--version x.y.z] [--from <git-ref>] [--to <git-ref>] [--write]\n',
      );
      process.exit(0);
    } else {
      process.stderr.write(`[changelog] Unknown argument: ${arg}\n`);
      process.exit(1);
    }
  }
  return args;
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

function gitSafe(args) {
  try {
    return git(args).trim();
  } catch {
    return '';
  }
}

function resolveVersion(explicit) {
  if (explicit) {
    if (!/^\d+\.\d+\.\d+$/.test(explicit)) {
      process.stderr.write(`[changelog] Invalid --version: ${explicit}\n`);
      process.exit(1);
    }
    return explicit;
  }
  const pkg = JSON.parse(fs.readFileSync(VERSION_SOURCE, 'utf8'));
  return pkg.version;
}

function resolveFrom(explicit) {
  // ROOT 显式表示"取全部历史"，用于回填最早那个版本（它没有更早的 tag）
  if (explicit === 'ROOT' || explicit === 'root') return null;
  if (explicit) return explicit;
  const tag = gitSafe(['describe', '--tags', '--abbrev=0']);
  // 无 tag 时取全部历史
  return tag || null;
}

function readCommits(from, to) {
  const pretty = `%s${FIELD_SEP}%h${FIELD_SEP}%b${RECORD_SEP}`;
  const range = from ? `${from}..${to}` : to;
  const raw = gitSafe(['log', '--no-merges', `--pretty=format:${pretty}`, range]);
  if (!raw) return [];

  return raw
    .split(RECORD_SEP)
    .map(record => record.replace(/^\n+/, ''))
    .filter(record => record.trim().length > 0)
    .map(record => {
      const [subject, hash, body] = record.split(FIELD_SEP);
      return { subject: (subject ?? '').trim(), hash: (hash ?? '').trim(), body: body ?? '' };
    });
}

function groupCommits(commits) {
  const buckets = new Map(GROUPS.map(group => [group.key, []]));
  const unparsed = [];

  for (const commit of commits) {
    const match = commit.subject.match(SUBJECT_RE);
    const isBreakingBody = /^BREAKING[ -]CHANGE:/im.test(commit.body);

    if (!match) {
      buckets.get('other').push({ ...commit, scope: null, text: commit.subject });
      unparsed.push(commit.subject);
      continue;
    }

    const [, type, scope, bang, text] = match;
    const normalizedType = type.toLowerCase();
    const group = GROUPS.find(candidate => candidate.types?.includes(normalizedType));
    const entry = { ...commit, scope: scope ?? null, text: text.trim() };

    if (group) {
      buckets.get(group.key).push(entry);
    } else {
      buckets.get('other').push(entry);
      unparsed.push(commit.subject);
    }

    if (bang || isBreakingBody) {
      buckets.get('breaking').push(entry);
    }
  }

  if (unparsed.length > 0) {
    process.stderr.write(
      `[changelog] ${unparsed.length} commit(s) did not match Conventional Commits and were ` +
        `filed under "其他" (not dropped):\n` +
        unparsed.map(subject => `  - ${subject}`).join('\n') +
        '\n',
    );
  }

  return buckets;
}

function renderEntry(entry) {
  const scope = entry.scope ? `**${entry.scope}**: ` : '';
  const hash = entry.hash ? ` (${entry.hash})` : '';
  return `- ${scope}${entry.text}${hash}`;
}

function renderAutoSection(buckets) {
  const lines = [];
  for (const group of GROUPS) {
    const entries = buckets.get(group.key);
    if (!entries || entries.length === 0) continue;
    lines.push(`### ${group.title}`, '');
    for (const entry of entries) lines.push(renderEntry(entry));
    lines.push('');
  }
  if (lines.length === 0) {
    lines.push('- 无变更记录', '');
  }
  return lines.join('\n').trimEnd();
}

function renderVersionBlock(version, date, autoBody) {
  return [
    `## ${version} - ${date}`,
    '',
    '<!-- auto:start -->',
    autoBody,
    '<!-- auto:end -->',
    '',
  ].join('\n');
}

/** 定位某个版本块的 [start, end) 行号区间；end 指向下一个 `## ` 标题行或文件末尾 */
function findVersionBlock(lines, version) {
  const headingRe = new RegExp(`^## ${version.replace(/\./g, '\\.')}(?:\\s|$)`);
  const start = lines.findIndex(line => headingRe.test(line));
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      end = i;
      break;
    }
  }
  return { start, end };
}

function spliceAutoSection(blockLines, autoBody) {
  const autoStart = blockLines.findIndex(line => line.trim() === '<!-- auto:start -->');
  const autoEnd = blockLines.findIndex(line => line.trim() === '<!-- auto:end -->');

  const rendered = ['<!-- auto:start -->', autoBody, '<!-- auto:end -->', ''];

  // 已有 auto 段：整段替换，manual 段原样保留
  if (autoStart !== -1 && autoEnd !== -1 && autoEnd > autoStart) {
    return [...blockLines.slice(0, autoStart), ...rendered, ...blockLines.slice(autoEnd + 1)];
  }

  // 有 manual 段但无 auto 段：追加到 manual 段之后
  const manualEnd = blockLines.findIndex(line => line.trim() === '<!-- manual:end -->');
  if (manualEnd !== -1) {
    return [
      ...blockLines.slice(0, manualEnd + 1),
      '',
      ...rendered,
      ...blockLines.slice(manualEnd + 1),
    ];
  }

  // 两者都无：保留标题行，其余整体替换为 auto 段
  return [blockLines[0], '', ...rendered];
}

/**
 * 版本块的日期。
 * 显式传了 --to（回填历史版本时指向 tag）则用该 ref 的提交日期；
 * 缺省 --to HEAD（当下发布）则用今天，比 HEAD 的提交日更准确。
 */
function resolveDate(to, toExplicit) {
  if (toExplicit) {
    const refDate = gitSafe(['log', '-1', '--format=%ad', '--date=short', to]);
    if (refDate) return refDate;
  }
  return new Date().toISOString().slice(0, 10);
}

function upsertChangelog(content, version, date, autoBody) {
  const hasContent = content && content.trim().length > 0;
  const base = hasContent ? content : CHANGELOG_HEADER;
  const lines = base.replace(/\n+$/, '').split('\n');

  const block = findVersionBlock(lines, version);
  if (block) {
    const updated = spliceAutoSection(lines.slice(block.start, block.end), autoBody);
    const next = [...lines.slice(0, block.start), ...updated, ...lines.slice(block.end)];
    return (
      next
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trimEnd() + '\n'
    );
  }

  // 新版本块插到第一个 `## ` 标题之前（即 header 前言之后），保持倒序
  const firstVersionHeading = lines.findIndex(line => /^## /.test(line));
  const insertAt = firstVersionHeading === -1 ? lines.length : firstVersionHeading;
  // 前置空行：否则追加到 header 末尾时标题会紧贴前言
  const blockLines = ['', ...renderVersionBlock(version, date, autoBody).split('\n')];
  const next = [...lines.slice(0, insertAt), ...blockLines, ...lines.slice(insertAt)];
  return (
    next
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const version = resolveVersion(args.version);
  const from = resolveFrom(args.from);
  const to = args.to;

  const commits = readCommits(from, to);
  const buckets = groupCommits(commits);
  const autoBody = renderAutoSection(buckets);
  const date = resolveDate(to, args.toExplicit);

  const rangeLabel = from ? `${from}..${to}` : to;
  if (commits.length === 0) {
    process.stderr.write(
      `[changelog] No commits found in ${rangeLabel}. ` +
        `If this release's changes are still uncommitted, commit them first — ` +
        `the generated entry would otherwise be empty.\n`,
    );
  }

  const existing = fs.existsSync(CHANGELOG_PATH) ? fs.readFileSync(CHANGELOG_PATH, 'utf8') : '';
  const next = upsertChangelog(existing, version, date, autoBody);

  if (!args.write) {
    process.stdout.write(next);
    return;
  }

  fs.writeFileSync(CHANGELOG_PATH, next, 'utf8');
  process.stdout.write(
    `[changelog] ${CHANGELOG_PATH} -> ${version} (${commits.length} commit(s) from ${rangeLabel})\n`,
  );
}

main();
