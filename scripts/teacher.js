// 老师后台：密码验证 + 解码学生报告 + 汇总 + 导出 CSV
(function () {
  const {
    TEACHER_PASSWORD, loadTeacherList, saveTeacherList,
    isTeacherLoggedIn, setTeacherLoggedIn,
    decodeReport, TOPICS
  } = window.PyListApp;

  // ============ 路由钩子：#/teacher ============
  function tryHandleTeacherRoute(route) {
    if (route === 'teacher') {
      renderTeacher();
      return true;
    }
    return false;
  }

  // 暴露到全局供 app.js 调用
  window.PyListApp.tryHandleTeacherRoute = tryHandleTeacherRoute;

  // ============ 渲染入口 ============
  function renderTeacher() {
    const stage = document.getElementById('stage');
    if (isTeacherLoggedIn()) {
      renderDashboard();
    } else {
      renderPasswordPrompt();
    }
  }

  // ============ 密码界面 ============
  function renderPasswordPrompt() {
    const stage = document.getElementById('stage');
    stage.innerHTML = `
      <section class="teacher-wrap">
        <div class="teacher-card login-card">
          <div class="teacher-icon">🔒</div>
          <h1>老师后台</h1>
          <p class="subtitle">仅老师可访问</p>
          <div class="pwd-form">
            <input type="password" id="teacher-pwd" placeholder="请输入老师密码" />
            <button class="btn btn-primary" id="teacher-pwd-btn">进入后台</button>
            <p class="err" id="teacher-pwd-err" style="display:none;">密码错误</p>
          </div>
          <p class="hint">💡 家长/学生不需要这个密码，直接打开首页就能玩。</p>
        </div>
      </section>
    `;
    const input = document.getElementById('teacher-pwd');
    const btn = document.getElementById('teacher-pwd-btn');
    const err = document.getElementById('teacher-pwd-err');
    const tryLogin = () => {
      if (input.value === TEACHER_PASSWORD) {
        setTeacherLoggedIn(true);
        renderDashboard();
      } else {
        err.style.display = '';
        input.value = '';
        input.focus();
      }
    };
    btn.onclick = tryLogin;
    input.onkeydown = (e) => { if (e.key === 'Enter') tryLogin(); };
    input.focus();
  }

  // ============ 后台主面板 ============
  function renderDashboard() {
    const stage = document.getElementById('stage');
    const list = loadTeacherList();
    stage.innerHTML = `
      <section class="teacher-wrap">
        <div class="teacher-header">
          <h1><i class="fa-solid fa-chalkboard-user"></i> 老师后台</h1>
          <div class="teacher-header-actions">
            <button class="btn btn-ghost" id="teacher-export"><i class="fa-solid fa-file-csv"></i> 导出 CSV</button>
            <button class="btn btn-ghost" id="teacher-clear"><i class="fa-regular fa-trash-can"></i> 清空</button>
            <button class="btn btn-ghost" id="teacher-logout"><i class="fa-solid fa-right-from-bracket"></i> 退出</button>
          </div>
        </div>

        <div class="teacher-section">
          <h2><i class="fa-solid fa-paste"></i> 录入学生成绩单</h2>
          <div class="paste-area">
            <textarea id="teacher-paste" placeholder="把学生发来的编码粘到这里…&#10;（以 PYQ1: 开头的字符）" rows="3"></textarea>
            <div class="paste-actions">
              <button class="btn btn-primary" id="teacher-decode"><i class="fa-solid fa-magnifying-glass"></i> 解析并收录</button>
              <span id="teacher-decode-msg" class="paste-msg"></span>
            </div>
          </div>
        </div>

        <div class="teacher-section">
          <h2><i class="fa-solid fa-list"></i> 已收录学生（${list.length}）</h2>
          <div id="teacher-list" class="teacher-list">
            ${renderListHTML(list)}
          </div>
        </div>
      </section>
    `;

    // 事件绑定
    document.getElementById('teacher-logout').onclick = () => {
      if (confirm('确认退出老师后台？')) {
        setTeacherLoggedIn(false);
        renderPasswordPrompt();
      }
    };
    document.getElementById('teacher-clear').onclick = () => {
      if (list.length === 0) return alert('当前没有数据');
      if (confirm(`确认清空全部 ${list.length} 条学生记录？此操作不可恢复！`)) {
        saveTeacherList([]);
        renderDashboard();
      }
    };
    document.getElementById('teacher-export').onclick = () => exportCSV(list);
    document.getElementById('teacher-decode').onclick = handleDecode;
    document.getElementById('teacher-paste').onkeydown = (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleDecode();
    };

    // 列表内按钮
    document.querySelectorAll('[data-act="del"]').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.idx;
        if (!confirm('确认删除这条记录？')) return;
        const arr = loadTeacherList();
        arr.splice(idx, 1);
        saveTeacherList(arr);
        renderDashboard();
      };
    });
    document.querySelectorAll('[data-act="view"]').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.idx;
        const arr = loadTeacherList();
        showReportDetail(arr[idx]);
      };
    });
  }

  // ============ 解析编码 ============
  function handleDecode() {
    const ta = document.getElementById('teacher-paste');
    const msg = document.getElementById('teacher-decode-msg');
    const code = ta.value.trim();
    if (!code) {
      msg.className = 'paste-msg err';
      msg.textContent = '❌ 请先粘贴编码';
      return;
    }
    const report = decodeReport(code);
    if (!report) {
      msg.className = 'paste-msg err';
      msg.textContent = '❌ 编码格式不对，解析失败';
      return;
    }
    // 收录（用时间戳+topic 简单去重）
    const arr = loadTeacherList();
    const dupIdx = arr.findIndex(r => r.code === code);
    if (dupIdx >= 0) {
      msg.className = 'paste-msg warn';
      msg.textContent = `⚠️ 已存在（#${dupIdx + 1}），未重复添加`;
      return;
    }
    arr.unshift({ code, report, receivedAt: Date.now() });
    saveTeacherList(arr);
    msg.className = 'paste-msg ok';
    msg.textContent = `✅ 已收录：${report.name || '匿名学生'} · ${report.correct}/${report.total}`;
    ta.value = '';
    renderDashboard();
  }

  // ============ 列表渲染 ============
  function renderListHTML(list) {
    if (!list.length) {
      return '<div class="empty">还没有学生成绩单。先到学生那一端做完一组题，让学生点"生成成绩单"，把生成的编码发给你，再粘到上面那个框里就行。</div>';
    }
    return list.map((r, i) => {
      const rep = r.report;
      const date = new Date(rep.ts || r.receivedAt);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      const pct = rep.total ? Math.round(rep.correct / rep.total * 100) : 0;
      const dur = rep.duration ? formatDuration(rep.duration) : '-';
      return `
        <div class="teacher-row">
          <div class="tr-info">
            <div class="tr-name">${escapeHTML(rep.name || '匿名学生')} <span class="tr-when">${dateStr}</span></div>
            <div class="tr-meta">
              <span class="tr-topic">${escapeHTML(rep.topicName || '-')}</span>
              <span class="tr-score ${pct >= 80 ? 'good' : pct >= 60 ? 'mid' : 'bad'}">${rep.correct}/${rep.total}（${pct}%）</span>
              <span class="tr-wrong">错 ${rep.wrong} 题</span>
              <span class="tr-dur">用时 ${dur}</span>
            </div>
          </div>
          <div class="tr-actions">
            <button class="btn btn-ghost" data-act="view" data-idx="${i}"><i class="fa-regular fa-eye"></i> 查看</button>
            <button class="btn btn-ghost" data-act="del" data-idx="${i}" style="color:#ef4444;"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============ 详情模态 ============
  function showReportDetail(item) {
    const rep = item.report;
    const pct = rep.total ? Math.round(rep.correct / rep.total * 100) : 0;
    const dur = rep.duration ? formatDuration(rep.duration) : '-';
    const mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true" style="max-width:720px;">
        <button class="modal-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-header">
          <span class="modal-badge">📋 成绩详情</span>
          <h2>${escapeHTML(rep.name || '匿名学生')}</h2>
        </div>
        <div class="modal-body">
          <div class="detail-stats">
            <div class="ds-item"><div class="ds-num">${rep.correct}/${rep.total}</div><div class="ds-lbl">得分（${pct}%）</div></div>
            <div class="ds-item"><div class="ds-num">${rep.wrong}</div><div class="ds-lbl">错题数</div></div>
            <div class="ds-item"><div class="ds-num">${dur}</div><div class="ds-lbl">用时</div></div>
            <div class="ds-item"><div class="ds-num">${escapeHTML(rep.topicName)}</div><div class="ds-lbl">关卡</div></div>
          </div>
          <h3 style="margin:18px 0 10px;">📌 错题清单</h3>
          ${rep.wrongList && rep.wrongList.length ? `
            <ol class="detail-wrong">
              ${rep.wrongList.map(w => `
                <li>
                  <span class="dw-topic">${escapeHTML(w.topicName)}</span>
                  <div class="dw-prompt">${escapeHTML(w.prompt)}</div>
                  <div class="dw-ans">
                    学生答：<b>${escapeHTML((w.userAns || []).join('、') || '（空）')}</b>
                    正确答案：<b style="color:#10b981;">${escapeHTML((w.rightAns || []).join('、'))}</b>
                  </div>
                </li>
              `).join('')}
            </ol>
          ` : '<div class="empty">🎉 全部答对！</div>'}
          <details style="margin-top:16px;">
            <summary style="cursor:pointer;color:#6b7280;">查看原始编码</summary>
            <textarea readonly rows="3" style="width:100%;margin-top:8px;font-family:monospace;font-size:11px;">${escapeHTML(item.code)}</textarea>
          </details>
        </div>
        <div class="modal-footer" style="justify-content:flex-end;">
          <button class="btn btn-ghost modal-close-btn">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(mask);
    const close = () => mask.remove();
    mask.querySelector('.modal-close').onclick = close;
    mask.querySelector('.modal-close-btn').onclick = close;
    mask.addEventListener('click', (e) => { if (e.target === mask) close(); });
  }

  // ============ 导出 CSV ============
  function exportCSV(list) {
    if (!list.length) return alert('当前没有数据可导出');
    // BOM 让 Excel 识别 UTF-8
    const BOM = '\uFEFF';
    const headers = ['姓名', '日期', '关卡', '得分', '总题数', '正确率(%)', '错题数', '用时(秒)', '错题主题汇总', '错题IDs'];
    const rows = list.map(({ report }) => {
      const date = new Date(report.ts);
      const dateStr = date.toLocaleString('zh-CN', { hour12: false });
      const topicSum = {};
      (report.wrongList || []).forEach(w => {
        topicSum[w.topicName] = (topicSum[w.topicName] || 0) + 1;
      });
      const topicSumStr = Object.entries(topicSum).map(([k, v]) => `${k}×${v}`).join(' | ');
      const wrongIds = (report.wrongList || []).map(w => w.id).join(',');
      const pct = report.total ? Math.round(report.correct / report.total * 100) : 0;
      return [
        report.name || '匿名',
        dateStr,
        report.topicName,
        report.correct,
        report.total,
        pct,
        report.wrong,
        report.duration,
        topicSumStr,
        wrongIds
      ];
    });
    const csv = BOM + [headers, ...rows].map(r =>
      r.map(c => {
        const s = String(c == null ? '' : c);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `学生练习情况_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ============ 工具 ============
  function formatDuration(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }
  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // 脚本加载完时，如果当前路由已经是 teacher，立即渲染一次
  if (/^#\/teacher/.test(window.location.hash || '')) {
    tryHandleTeacherRoute('teacher');
  }
  // 之后路由变化也要拦截（app.js 内部会先调用 tryHandleTeacherRoute；
  // 但如果 teacher.js 比 app.js 后到，加载初次的 hashchange 可能错过）
  window.addEventListener('hashchange', () => {
    if (/^#\/teacher/.test(window.location.hash || '')) {
      tryHandleTeacherRoute('teacher');
    }
  });
})();
