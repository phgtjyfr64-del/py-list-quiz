// 图解 SVG 渲染器
// 所有图解通过 renderDiagram(type, data) 返回 HTML 字符串
(function () {

  // ============ 通用：箭头 marker ============
  const ARROW_DEFS = `
    <defs>
      <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#b45309" />
      </marker>
      <marker id="arrowhead-blue" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3776AB" />
      </marker>
      <marker id="big-arrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3776AB" />
      </marker>
    </defs>
  `;

  // ============ 工具：值转字符串 + 着色类 ============
  function valClass(v) {
    if (typeof v === 'string' && v.startsWith("'") && v.endsWith("'")) return 'str';
    if (typeof v === 'string' && v.startsWith('"') && v.endsWith('"')) return 'str';
    if (v === 'True' || v === 'False' || v === true || v === false) return 'bool';
    if (typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v))) return 'num';
    return '';
  }

  function displayVal(v) {
    if (typeof v === 'string') return v;
    if (v === true) return 'True';
    if (v === false) return 'False';
    if (typeof v === 'number') return String(v);
    return String(v);
  }

  // ============ 基础：渲染一排"格子" ============
  // items: array of (string|number) ; opts: {highlight: idx, highlightAll, isStr}
  // returns: { svgBody, width, height, indicesReverse, indicesForward }
  function renderCells(items, opts = {}) {
    const cellW = 64, cellH = 56, gap = 6;
    const totalW = items.length * cellW + (items.length - 1) * gap;
    const startX = (640 - totalW) / 2;
    const cellY = 70;

    let body = '';
    items.forEach((v, i) => {
      const x = startX + i * (cellW + gap);
      let cls = 'dg-cell';
      if (opts.highlight === i) cls += ' hi';
      if (opts.highlightAll) cls += ' hi';
      if (opts.newIndices && opts.newIndices.includes(i)) cls += ' new';
      if (opts.goneIndices && opts.goneIndices.includes(i)) cls += ' gone';
      body += `<rect class="${cls}" x="${x}" y="${cellY}" width="${cellW}" height="${cellH}" rx="8" />`;
      const disp = displayVal(v);
      const vc = valClass(disp);
      const tCls = vc ? `dg-text ${vc}` : 'dg-text';
      // 字符串过长处理
      const t = disp.length > 6 ? disp.slice(0, 6) + '…' : disp;
      body += `<text class="${tCls}" x="${x + cellW / 2}" y="${cellY + cellH / 2 + 1}">${escapeXml(t)}</text>`;
      // 索引
      if (opts.showIndices !== false) {
        body += `<text class="dg-idx" x="${x + cellW / 2}" y="${cellY + cellH + 18}">${i}</text>`;
        const revIdx = i - items.length;
        body += `<text class="dg-idx rev" x="${x + cellW / 2}" y="${cellY + cellH + 32}">${revIdx}</text>`;
      }
    });
    return { body, startX, cellY, cellW, cellH, gap, totalW };
  }

  function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ============ 1) 基础知识 ============
  function diagramBasics(d) {
    const items = d.list || [];
    const c = renderCells(items, { highlightAll: d.highlightAll, showIndices: false });
    return wrapSvg(`
      <text class="dg-title" x="320" y="32">${escapeXml(d.title || 'a = [...]')}</text>
      ${c.body}
      <text class="dg-legend" x="320" y="160" text-anchor="middle">📦 列表就像一排"小盒子"，每个盒子装一个元素</text>
    `);
  }

  // ============ 2) 索引 ============
  function diagramIndexing(d) {
    const items = d.list || [];
    const c = renderCells(items, { highlight: d.highlight, showIndices: true });
    // 找高亮单元格的中心
    const hiIdx = d.highlight >= 0 ? d.highlight : items.length + d.highlight;
    const cx = c.startX + hiIdx * (c.cellW + c.gap) + c.cellW / 2;
    const cy = c.cellY + c.cellH + 50;
    return wrapSvg(`
      <text class="dg-title" x="320" y="28">${escapeXml(d.label || `a[${d.highlight}]`)}</text>
      <text class="dg-idx fwd" x="320" y="50" text-anchor="middle" font-weight="800">正向索引</text>
      ${c.body}
      <text class="dg-callout" x="${cx}" y="${cy - 8}" text-anchor="middle">${escapeXml(d.label || '')}</text>
      <path class="dg-arrow" d="M ${cx} ${cy - 4} Q ${cx} ${cy + 12} ${cx} ${c.cellY + c.cellH + 4}" />
    `);
  }

  // ============ 3) 创建列表 ============
  function diagramCreate(d) {
    if (d.kind === 'empty') {
      return wrapSvg(`
        <text class="dg-title" x="320" y="32">a = [ ]</text>
        <text class="dg-bracket" x="280" y="100">[</text>
        <text class="dg-bracket" x="340" y="100">]</text>
        <text class="dg-legend" x="320" y="160" text-anchor="middle">📭 里面一个元素都没有，就是空列表！</text>
      `);
    }
    if (d.kind === 'range') {
      return wrapSvg(`
        <text class="dg-title" x="320" y="32">list(range(${d.n}))</text>
        ${renderCells([0, 1, 2, 3, 4].slice(0, d.n), { showIndices: false }).body}
        <text class="dg-legend" x="320" y="160" text-anchor="middle">range(n) 从 0 开始，到 n-1 结束（不含 n）</text>
      `);
    }
    if (d.kind === 'split') {
      return wrapSvg(`
        <text class="dg-title" x="320" y="28">list(${escapeXml(d.source)})</text>
        <text class="dg-text str" x="120" y="80" font-size="22">"abc"</text>
        <path class="dg-arrow" d="M 200 100 Q 260 130 320 130" />
        ${renderCells(d.result || ["'a'","'b'","'c'"], { showIndices: false }).body}
        <text class="dg-legend" x="320" y="180" text-anchor="middle">list() 把字符串的每个字符"拆"出来</text>
      `);
    }
    return wrapSvg('<text x="320" y="100" class="dg-title">空数据</text>');
  }

  // ============ 通用：变化对比（append/insert/del/pop/remove/modify/sort）============
  function diagramTransform(d) {
    const before = d.before || [];
    const after = d.after || [];
    const cellW = 56, cellH = 48, gap = 5;
    const startX = (640 - before.length * (cellW + gap) + gap) / 2;
    const afterStartX = (640 - after.length * (cellW + gap) + gap) / 2;
    const beforeY = 60, afterY = 180;
    const newIndices = d.newIndices || [];
    const goneIndices = d.goneIndices || [];

    let body = '';
    body += `<text class="dg-title" x="320" y="28">${escapeXml(d.title || '')}</text>`;

    // before
    body += `<text class="dg-legend" x="60" y="${beforeY + cellH / 2 + 4}" font-weight="800" fill="#64748b">原列表</text>`;
    before.forEach((v, i) => {
      const x = startX + i * (cellW + gap);
      let cls = 'dg-cell';
      if (goneIndices.includes(i)) cls += ' gone';
      body += `<rect class="${cls}" x="${x}" y="${beforeY}" width="${cellW}" height="${cellH}" rx="6" />`;
      const disp = displayVal(v);
      const vc = valClass(disp);
      const tCls = vc ? `dg-text ${vc}` : 'dg-text';
      const t = disp.length > 6 ? disp.slice(0, 6) + '…' : disp;
      body += `<text class="${tCls}" x="${x + cellW / 2}" y="${beforeY + cellH / 2 + 1}">${escapeXml(t)}</text>`;
    });

    // 箭头
    body += `<path class="dg-arrow-big" d="M 320 ${beforeY + cellH + 16} L 320 ${afterY - 16}" />`;
    body += `<text class="dg-callout" x="340" y="${(beforeY + cellH + afterY) / 2 + 4}">${escapeXml(d.action || '执行后')}</text>`;

    // after
    body += `<text class="dg-legend" x="60" y="${afterY + cellH / 2 + 4}" font-weight="800" fill="#64748b">新列表</text>`;
    after.forEach((v, i) => {
      const x = afterStartX + i * (cellW + gap);
      let cls = 'dg-cell';
      if (newIndices.includes(i)) cls += ' new';
      body += `<rect class="${cls}" x="${x}" y="${afterY}" width="${cellW}" height="${cellH}" rx="6" />`;
      const disp = displayVal(v);
      const vc = valClass(disp);
      const tCls = vc ? `dg-text ${vc}` : 'dg-text';
      const t = disp.length > 6 ? disp.slice(0, 6) + '…' : disp;
      body += `<text class="${tCls}" x="${x + cellW / 2}" y="${afterY + cellH / 2 + 1}">${escapeXml(t)}</text>`;
    });

    if (d.legend) {
      body += `<text class="dg-legend" x="320" y="260" text-anchor="middle">${escapeXml(d.legend)}</text>`;
    }
    return wrapSvg(body);
  }

  function diagramAppend(d) {
    const before = d.before || [];
    const after = d.after || [];
    // 新元素索引就是 after 里"超出 before 长度的部分"
    const newIndices = after.map((_, i) => (i >= before.length ? i : -1)).filter(i => i >= 0);
    return diagramTransform({
      ...d,
      before, after, newIndices,
      action: d.action || `append(${displayVal(d.added)}) → 加到末尾`,
      title: d.title || 'append() 添加元素'
    });
  }

  function diagramInsert(d) {
    const before = d.before || [];
    const after = d.after || [];
    // 找到新元素插入的位置
    const newIndices = [];
    for (let i = 0; i < after.length; i++) {
      if (i >= before.length || after[i] !== before[i]) {
        newIndices.push(i);
        if (newIndices.length >= 1) break;
      }
    }
    return diagramTransform({
      ...d,
      before, after, newIndices,
      action: d.action || `insert(${d.insertAt}, ${displayVal(d.value)})`,
      title: d.title || 'insert() 插入元素'
    });
  }

  function diagramDel(d) {
    const before = d.before || [];
    const after = d.after || [];
    const goneIndices = d.mode === 'clear' ? before.map((_, i) => i) : [d.delIndex ?? -1].filter(i => i >= 0);
    return diagramTransform({
      ...d,
      before, after, goneIndices,
      action: d.action || (d.mode === 'clear' ? 'a.clear() → 全部清空' : `del a[${d.delIndex}]`),
      title: d.title || '删除元素'
    });
  }

  function diagramPop(d) {
    return diagramTransform({
      ...d,
      title: d.title || 'pop() 弹出元素',
      action: d.action || `pop() → 弹出最后（返回 ${displayVal(d.popped)}）`
    });
  }

  function diagramRemove(d) {
    const before = d.before || [];
    const after = d.after || [];
    // 找到第一个消失的元素
    const goneIndices = [];
    for (let i = 0; i < before.length; i++) {
      if (!after.includes(before[i]) || before.indexOf(before[i]) !== i) {
        // 用更稳妥的逻辑
      }
    }
    // 简单做法：高亮第一个匹配 value 的位置
    if (d.value !== undefined) {
      const idx = before.findIndex(v => v === d.value);
      if (idx >= 0) goneIndices.push(idx);
    }
    return diagramTransform({
      ...d,
      before, after, goneIndices,
      action: d.action || `remove(${displayVal(d.value)}) → 只删第一个`
    });
  }

  function diagramModify(d) {
    return diagramTransform({
      ...d,
      title: d.title || '修改元素',
      action: d.action || `a[${d.changeIndex}] = ${displayVal(d.to)}`
    });
  }

  // ============ 切片 ============
  function diagramSlice(d) {
    const items = d.list || [];
    const cellW = 60, cellH = 50, gap = 4;
    const totalW = items.length * cellW + (items.length - 1) * gap;
    const startX = (640 - totalW) / 2;
    const y = 90;
    const start = d.start ?? 0;
    const end = d.end ?? items.length;
    const step = d.step ?? 1;

    let body = `<text class="dg-title" x="320" y="30">${escapeXml(d.label || 'a[start:stop:step]')}</text>`;
    items.forEach((v, i) => {
      const x = startX + i * (cellW + gap);
      const inRange = i >= start && i < end && ((i - start) % step === 0);
      const cls = 'dg-cell' + (inRange ? ' hi' : '');
      body += `<rect class="${cls}" x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" />`;
      const disp = displayVal(v);
      const vc = valClass(disp);
      const tCls = vc ? `dg-text ${vc}` : 'dg-text';
      body += `<text class="${tCls}" x="${x + cellW / 2}" y="${y + cellH / 2 + 1}">${escapeXml(disp)}</text>`;
      body += `<text class="dg-idx" x="${x + cellW / 2}" y="${y + cellH + 16}">${i}</text>`;
    });
    // 范围线
    if (items.length > 0) {
      const x1 = startX + start * (cellW + gap);
      const x2 = startX + (end - 1) * (cellW + gap) + cellW;
      body += `<line x1="${x1}" y1="${y - 10}" x2="${x2}" y2="${y - 10}" stroke="#b45309" stroke-width="3" />`;
      body += `<text class="dg-callout" x="${(x1 + x2) / 2}" y="${y - 16}" text-anchor="middle">📍 取这一段</text>`;
    }
    body += `<text class="dg-legend" x="320" y="180" text-anchor="middle">含头不含尾：从 ${start} 开始，到 ${end} 之前停下</text>`;
    if (step > 1) {
      body += `<text class="dg-legend" x="320" y="200" text-anchor="middle">步长 = ${step}：每隔 ${step - 1} 个取一个</text>`;
    }
    return wrapSvg(body);
  }

  // ============ 遍历 ============
  function diagramTraverse(d) {
    const items = d.list || [];
    const cellW = 64, cellH = 50, gap = 6;
    const totalW = items.length * cellW + (items.length - 1) * gap;
    const startX = (640 - totalW) / 2;
    const y = 100;
    const showIdx = d.mode === 'index';

    let body = `<text class="dg-title" x="320" y="30">${d.mode === 'index' ? 'for i in range(len(a))' : 'for x in a'}</text>`;
    items.forEach((v, i) => {
      const x = startX + i * (cellW + gap);
      body += `<rect class="dg-cell hi" x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" />`;
      const disp = displayVal(v);
      const vc = valClass(disp);
      const tCls = vc ? `dg-text ${vc}` : 'dg-text';
      body += `<text class="${tCls}" x="${x + cellW / 2}" y="${y + cellH / 2 + 1}">${escapeXml(disp)}</text>`;
      if (showIdx) {
        body += `<text class="dg-idx active" x="${x + cellW / 2}" y="${y - 6}">i=${i}</text>`;
        body += `<text class="dg-callout" x="${x + cellW / 2}" y="${y + cellH + 22}" text-anchor="middle">→ ${escapeXml(disp)}</text>`;
      } else {
        body += `<text class="dg-callout" x="${x + cellW / 2}" y="${y + cellH + 22}" text-anchor="middle">x</text>`;
      }
    });
    // 遍历箭头（虚线循环）
    if (items.length > 1) {
      const arrowY = y + cellH + 50;
      const x1 = startX - 8;
      const x2 = startX + totalW + 8;
      body += `<path class="dg-traverse" d="M ${x1} ${arrowY} L ${x2} ${arrowY}" marker-end="url(#arrowhead-blue)" />`;
    }
    body += `<text class="dg-legend" x="320" y="220" text-anchor="middle">${d.mode === 'index' ? 'i 拿到索引，再用 a[i] 取元素' : 'x 直接拿到元素'}</text>`;
    return wrapSvg(body);
  }

  // ============ 矩阵（二维列表）============
  function diagramMatrix(d) {
    const rows = d.rows || [];
    if (rows.length === 0) return wrapSvg('<text class="dg-title" x="320" y="100">空</text>');
    const cellW = 64, cellH = 50, gap = 4;
    const cols = rows[0].length;
    const totalW = cols * cellW + (cols - 1) * gap;
    const startX = (640 - totalW) / 2;
    const startY = 80;
    const hi = d.highlight;

    let body = `<text class="dg-title" x="320" y="30">${escapeXml(d.title || '二维列表')}</text>`;

    // 列标签
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cellW + gap) + cellW / 2;
      body += `<text class="dg-col-label" x="${x}" y="${startY - 12}">列 ${c}</text>`;
    }
    // 行
    rows.forEach((row, r) => {
      const y = startY + r * (cellH + gap);
      body += `<text class="dg-row-label" x="${startX - 30}" y="${y + cellH / 2 + 4}" text-anchor="end">行 ${r}</text>`;
      row.forEach((v, c) => {
        const x = startX + c * (cellW + gap);
        let cls = 'dg-matrix-cell';
        if (hi && hi.r === r && hi.c === c) cls += ' hi';
        body += `<rect class="${cls}" x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="4" />`;
        const disp = displayVal(v);
        body += `<text class="dg-text" x="${x + cellW / 2}" y="${y + cellH / 2 + 1}">${escapeXml(disp)}</text>`;
        if (hi && hi.r === r && hi.c === c) {
          body += `<text class="dg-callout" x="${x + cellW / 2}" y="${y - 4}" text-anchor="middle" font-size="12">a[${r}][${c}]</text>`;
        }
      });
    });

    // 遍历路径
    if (d.showTraverse) {
      // 用虚线连接所有格子
      let path = '';
      rows.forEach((row, r) => {
        row.forEach((_, c) => {
          const x = startX + c * (cellW + gap) + cellW / 2;
          const y = startY + r * (cellH + gap) + cellH / 2;
          path += (path ? ' L ' : 'M ') + x + ' ' + y;
        });
      });
      body += `<path d="${path}" class="dg-traverse" marker-end="url(#arrowhead-blue)" />`;
    }

    const totalH = rows.length * (cellH + gap) + 20;
    body += `<text class="dg-legend" x="320" y="${startY + totalH + 10}" text-anchor="middle">外层循环 i 走行，内层循环 j 走列</text>`;
    return wrapSvg(body);
  }

  // ============ 列表计算（+、*、extend）============
  function diagramCalc(d) {
    if (d.op === '+' || d.op === '*' || d.op === 'extend') {
      const a = d.a || [], b = d.b || [], r = d.result || [];
      const cellW = 52, cellH = 44, gap = 4;
      const yA = 50, yB = 50, yR = 180;

      let body = `<text class="dg-title" x="320" y="28">${
        d.op === '+' ? 'a + b：把两个列表拼起来' :
        d.op === '*' ? 'a * n：把列表重复 n 次' :
        'a.extend(b)：把 b 的元素一个个塞进 a 末尾'
      }</text>`;

      // a
      const aW = a.length * cellW + (a.length - 1) * gap;
      const aStart = 200 - aW / 2;
      a.forEach((v, i) => {
        const x = aStart + i * (cellW + gap);
        body += `<rect class="dg-cell" x="${x}" y="${yA}" width="${cellW}" height="${cellH}" rx="4" />`;
        const disp = displayVal(v);
        const tCls = 'dg-text ' + (valClass(disp) || '');
        body += `<text class="${tCls}" x="${x + cellW / 2}" y="${yA + cellH / 2 + 1}">${escapeXml(disp)}</text>`;
      });
      body += `<text class="dg-legend" x="60" y="${yA + cellH / 2 + 4}" font-weight="800">a</text>`;

      // b（+ / extend 时画）
      if (d.op !== '*') {
        const bW = b.length * cellW + (b.length - 1) * gap;
        const bStart = 440 - bW / 2;
        b.forEach((v, i) => {
          const x = bStart + i * (cellW + gap);
          body += `<rect class="dg-cell" x="${x}" y="${yB}" width="${cellW}" height="${cellH}" rx="4" />`;
          const disp = displayVal(v);
          const tCls = 'dg-text ' + (valClass(disp) || '');
          body += `<text class="${tCls}" x="${x + cellW / 2}" y="${yB + cellH / 2 + 1}">${escapeXml(disp)}</text>`;
        });
        body += `<text class="dg-legend" x="580" y="${yB + cellH / 2 + 4}" font-weight="800">b</text>`;
        // 中间运算符
        const op = d.op === '+' ? '+' : 'extend';
        body += `<text class="dg-title" x="320" y="${yA + cellH / 2 + 4}" text-anchor="middle" fill="#3776AB">${op}</text>`;
      } else {
        body += `<text class="dg-title" x="320" y="${yA + cellH / 2 + 4}" text-anchor="middle" fill="#3776AB">× ${b}</text>`;
      }

      // 大箭头
      body += `<path class="dg-arrow-big" d="M 320 110 L 320 160" />`;

      // result
      const rW = r.length * cellW + (r.length - 1) * gap;
      const rStart = (640 - rW) / 2;
      r.forEach((v, i) => {
        const x = rStart + i * (cellW + gap);
        body += `<rect class="dg-cell hi" x="${x}" y="${yR}" width="${cellW}" height="${cellH}" rx="4" />`;
        const disp = displayVal(v);
        const tCls = 'dg-text ' + (valClass(disp) || '');
        body += `<text class="${tCls}" x="${x + cellW / 2}" y="${yR + cellH / 2 + 1}">${escapeXml(disp)}</text>`;
      });
      body += `<text class="dg-legend" x="320" y="${yR + cellH + 24}" text-anchor="middle">结果 = [${r.map(v => displayVal(v)).join(', ')}]</text>`;
      return wrapSvg(body);
    }
    return wrapSvg('<text class="dg-title" x="320" y="100">不支持的操作</text>');
  }

  // ============ 排序 ============
  function diagramSort(d) {
    return diagramTransform({
      ...d,
      before: d.before, after: d.after,
      newIndices: [],
      goneIndices: [],
      action: d.action || (d.order === 'desc' ? 'sort(reverse=True) → 降序' : 'sort() → 升序'),
      title: d.title || '列表排序'
    });
  }

  // ============ 成员运算符 ============
  function diagramOperator(d) {
    const items = d.list || [];
    const cellW = 56, cellH = 48, gap = 5;
    const y = 90;
    let body = `<text class="dg-title" x="320" y="30">${
      d.op === 'in' ? 'x in 列表' : 'x not in 列表'
    }</text>`;

    // 集合框
    body += `<rect class="dg-set-bg" x="80" y="60" width="320" height="120" rx="12" />`;
    body += `<text class="dg-set-text" x="240" y="50" text-anchor="middle">列表</text>`;
    items.forEach((v, i) => {
      const x = 100 + i * (cellW + gap);
      const isTarget = v === d.target;
      const cls = isTarget ? (d.result ? 'dg-cell hi-success' : 'dg-cell hi-error') : 'dg-cell';
      body += `<rect class="${cls}" x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="4" />`;
      const disp = displayVal(v);
      const tCls = 'dg-text ' + (valClass(disp) || '');
      body += `<text class="${tCls}" x="${x + cellW / 2}" y="${y + cellH / 2 + 1}">${escapeXml(disp)}</text>`;
    });

    // 目标
    const disp = displayVal(d.target);
    body += `<rect class="dg-set-bg outside" x="450" y="80" width="120" height="80" rx="12" />`;
    body += `<text class="dg-set-text" x="510" y="70" text-anchor="middle">要找的</text>`;
    body += `<text class="dg-set-elem" x="510" y="130">${escapeXml(disp)}</text>`;

    // 箭头
    body += `<path class="dg-arrow" d="M 450 120 Q 425 120 412 120" />`;

    // 结果
    const yesno = d.result ? 'dg-yesno yes' : 'dg-yesno no';
    const label = d.result ? '✓ True' : '✗ False';
    body += `<text class="${yesno}" x="320" y="230" text-anchor="middle">${label}</text>`;

    return wrapSvg(body);
  }

  // ============ 内置函数 ============
  function diagramBuiltin(d) {
    const items = d.list || [];
    const cellW = 60, cellH = 50, gap = 5;
    const totalW = items.length * cellW + (items.length - 1) * gap;
    const startX = (640 - totalW) / 2;
    const y = 90;
    let body = `<text class="dg-title" x="320" y="30">${escapeXml(d.label || '')}</text>`;

    items.forEach((v, i) => {
      const x = startX + i * (cellW + gap);
      const isMatch = d.highlightValue !== undefined && v === d.highlightValue;
      const cls = isMatch ? 'dg-cell hi' : 'dg-cell';
      body += `<rect class="${cls}" x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" />`;
      const disp = displayVal(v);
      const tCls = 'dg-text ' + (valClass(disp) || '');
      body += `<text class="${tCls}" x="${x + cellW / 2}" y="${y + cellH / 2 + 1}">${escapeXml(disp)}</text>`;
    });

    // 大结果展示
    if (d.value !== undefined) {
      body += `<rect x="270" y="170" width="100" height="50" rx="10" fill="#FFD43B" stroke="#b45309" stroke-width="3" />`;
      body += `<text class="dg-text" x="320" y="202" text-anchor="middle" font-size="24" font-weight="800" fill="#1F2A44">${escapeXml(String(d.value))}</text>`;
      body += `<path class="dg-arrow" d="M 320 142 L 320 168" />`;
    }
    return wrapSvg(body);
  }

  // ============ 通用 wrap ============
  function wrapSvg(body) {
    return `<svg class="diagram" viewBox="0 0 640 280" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      ${ARROW_DEFS}
      ${body}
    </svg>`;
  }

  // ============ 入口 ============
  function renderDiagram(type, data) {
    switch (type) {
      case 'basics':   return diagramBasics(data);
      case 'indexing': return diagramIndexing(data);
      case 'create':   return diagramCreate(data);
      case 'append':   return diagramAppend(data);
      case 'insert':   return diagramInsert(data);
      case 'del':      return diagramDel(data);
      case 'pop':      return diagramPop(data);
      case 'remove':   return diagramRemove(data);
      case 'modify':   return diagramModify(data);
      case 'slice':    return diagramSlice(data);
      case 'traverse': return diagramTraverse(data);
      case 'matrix':   return diagramMatrix(data);
      case 'calc':     return diagramCalc(data);
      case 'sort':     return diagramSort(data);
      case 'operator': return diagramOperator(data);
      case 'builtin':  return diagramBuiltin(data);
      default: return wrapSvg(`<text class="dg-title" x="320" y="100">无图解</text>`);
    }
  }

  window.PyListApp = window.PyListApp || {};
  window.PyListApp.renderDiagram = renderDiagram;
})();
