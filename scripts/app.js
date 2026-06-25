// 主应用：路由 + 状态 + 视图渲染
(function () {
  const { TOPICS, QUESTIONS, getQuestionsByTopic, loadProgress, saveProgress, renderDiagram } = window.PyListApp;
  const stage = document.getElementById('stage');

  // ============ 应用状态 ============
  const state = {
    route: 'map',                // map | play | result | review
    topicId: null,
    questions: [],
    currentIdx: 0,
    selected: new Set(),
    submitted: false,
    correctCount: 0,
    startTime: 0,
    endTime: 0,
    wrongQuestions: []           // 本轮答错的题 id 列表
  };

  function persist() { saveProgress({}); /* 占位 */ }

  // ============ 路由 ============
  function navigate(hash) {
    window.location.hash = hash;
  }

  function parseRoute() {
    const hash = window.location.hash || '#/map';
    const parts = hash.replace(/^#\//, '').split('/');
    if (parts[0] === 'play' && parts[1]) {
      return { route: 'play', topicId: parts[1] };
    }
    if (parts[0] === 'result') return { route: 'result' };
    if (parts[0] === 'review') return { route: 'review' };
    if (parts[0] === 'teacher') return { route: 'teacher' };
    return { route: 'map' };
  }

  function syncRoute() {
    const r = parseRoute();
    state.route = r.route;
    if (r.topicId) state.topicId = r.topicId;
    updateNav();
    // 老师后台单独接管 stage
    if (state.route === 'teacher' && window.PyListApp && window.PyListApp.tryHandleTeacherRoute) {
      window.PyListApp.tryHandleTeacherRoute('teacher');
      return;
    }
    if (state.route === 'map') renderMap();
    else if (state.route === 'play') renderPlay();
    else if (state.route === 'result') renderResult();
    else if (state.route === 'review') renderReview();
  }

  function updateNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const route = btn.dataset.route;
      btn.classList.toggle('active', route === state.route || (route === 'map' && state.route === 'play'));
    });
  }

  window.addEventListener('hashchange', syncRoute);

  // ============ 视图：知识地图 ============
  function renderMap() {
    const progress = loadProgress();
    // 累计进度汇总
    let totalDone = 0, totalCorrect = 0;
    const doneTopics = [];
    Object.entries(progress.byTopic || {}).forEach(([tId, t]) => {
      if (t.done > 0) {
        totalDone += t.done;
        totalCorrect += t.correct;
        doneTopics.push(tId);
      }
    });
    const hasProgress = totalDone > 0;
    const overallPct = totalDone ? Math.round(totalCorrect / totalDone * 100) : 0;

    stage.innerHTML = `
      <section class="map-hero">
        <h1>🐍 Python 列表 · 闯关大冒险</h1>
        <p class="subtitle">13 个知识点 · 44 道图解题 · 玩着学才记得住！</p>
        ${hasProgress ? `
          <div class="overall-progress">
            <div class="op-text">累计：<b>${totalDone}</b> 题 · 答对 <b>${totalCorrect}</b> · 正确率 <b>${overallPct}%</b></div>
            <div class="op-bar"><div class="op-fill" style="width:${overallPct}%"></div></div>
          </div>
        ` : ''}
        <div class="quickstart">
          <button class="btn btn-accent" id="btn-start-all">🚀 全部闯关</button>
          <button class="btn btn-ghost" id="btn-review">📒 错题本</button>
          <button class="btn btn-submit-big" id="btn-submit-big" ${hasProgress ? '' : 'disabled'}>
            <i class="fa-solid fa-paper-plane"></i> 提交成绩给老师
          </button>
        </div>
        ${!hasProgress ? '<p class="qs-hint">👆 做完几道题后，"提交成绩"按钮就会亮起来</p>' : ''}
      </section>
      <section class="topic-grid" id="topic-grid"></section>
    `;
    const grid = document.getElementById('topic-grid');
    TOPICS.forEach((t, i) => {
      const qs = getQuestionsByTopic(t.id);
      const done = (progress.byTopic && progress.byTopic[t.id]) || { done: 0, correct: 0 };
      const pct = qs.length ? Math.round(done.done / qs.length * 100) : 0;
      const hasProgress = done.done > 0;
      const card = document.createElement('div');
      card.className = 'topic-card';
      card.style.setProperty('--card-color', t.color);
      card.style.animationDelay = `${i * 50}ms`;
      card.innerHTML = `
        <div class="icon-wrap" style="background:${t.color}"><i class="${t.icon}"></i></div>
        <h3>${t.name}</h3>
        <p class="desc">${t.desc}</p>
        <div class="meta">
          <span class="progress-pill ${hasProgress ? 'has-progress' : ''}">
            <i class="fa-solid ${hasProgress ? 'fa-circle-check' : 'fa-circle'}"></i>
            ${hasProgress ? `${done.done}/${qs.length} · 正确率 ${Math.round(done.correct / done.done * 100) || 0}%` : `${qs.length} 题`}
          </span>
          <span class="arrow" style="background:${t.color}"><i class="fa-solid fa-arrow-right"></i></span>
        </div>
      `;
      card.addEventListener('click', () => navigate(`#/play/${t.id}`));
      grid.appendChild(card);
    });

    document.getElementById('btn-start-all').addEventListener('click', () => navigate('#/play/all'));
    document.getElementById('btn-review').addEventListener('click', () => navigate('#/review'));
    const submitBig = document.getElementById('btn-submit-big');
    if (submitBig) {
      submitBig.addEventListener('click', () => {
        if (submitBig.disabled) {
          showToast('先做几道题再来提交吧～');
        } else {
          openSubmitReportModal();
        }
      });
    }
  }

  // ============ 视图：闯关答题 ============
  function startPlay(topicId) {
    state.topicId = topicId;
    state.questions = getQuestionsByTopic(topicId);
    state.currentIdx = 0;
    state.selected.clear();
    state.submitted = false;
    state.correctCount = 0;
    state.wrongQuestions = [];
    state.startTime = Date.now();
    state.endTime = 0;
  }

  function renderPlay() {
    if (!state.questions || state.questions.length === 0) {
      // 重新初始化（从 map 跳过来时）
      const r = parseRoute();
      startPlay(r.topicId || 'all');
    } else if (state.currentIdx >= state.questions.length) {
      // 已经答完，跳到结果页
      finishPlay();
      return;
    }

    const q = state.questions[state.currentIdx];
    const topic = TOPICS.find(t => t.id === q.topicId);
    const progressPct = ((state.currentIdx) / state.questions.length * 100);
    const isJudge = q.type === 'judge';

    stage.innerHTML = `
      <section class="quiz-wrap">
        <div class="quiz-top">
          <span class="topic-name">
            <span class="topic-icon" style="background:${topic.color}"><i class="${topic.icon}"></i></span>
            ${topic.name}
          </span>
          <div class="progress-bar"><div class="fill" style="width:${progressPct}%"></div></div>
          <span class="counter">第 ${state.currentIdx + 1} / ${state.questions.length} 题</span>
        </div>
        <div class="quiz-card" id="quiz-card">
          <span class="difficulty lv${q.difficulty}">${
            q.difficulty === 1 ? '★ 基础' : q.difficulty === 2 ? '★★ 进阶' : '★★★ 挑战'
          }</span>
          <div class="prompt">${q.prompt}</div>
          ${q.code ? `<pre class="code-block">${window.pyHighlight(q.code)}</pre>` : ''}
          <div class="options-list" id="options-list"></div>
          <div class="quiz-actions">
            <div class="feedback" id="feedback"></div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-ghost" id="btn-exit"><i class="fa-solid fa-xmark"></i> 退出</button>
              <button class="btn btn-primary" id="btn-submit" disabled>提交答案</button>
              <button class="btn btn-accent" id="btn-explain" style="display:none;"><i class="fa-solid fa-lightbulb"></i> 看图解</button>
              <button class="btn btn-primary" id="btn-next" style="display:none;">下一题 <i class="fa-solid fa-arrow-right"></i></button>
            </div>
          </div>
        </div>
      </section>
    `;

    // 用事件委托 + 直接绑的双保险：直接绑到按钮，stage 上也兜底
    const optsList = document.getElementById('options-list');
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.type = 'button';
      btn.dataset.key = opt.key;
      btn.innerHTML = opt.text;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectOption(btn, opt.key);
      });
      optsList.appendChild(btn);
    });

    // 兜底：stage 上事件委托（万一有按钮事件没绑上）
    if (!stage._optionsDelegateBound) {
      stage.addEventListener('click', (e) => {
        const target = e.target.closest('.option');
        if (!target) return;
        const key = target.dataset.key;
        if (key) onSelectOption(target, key);
      });
      stage._optionsDelegateBound = true;
    }

    // 提交/解析/下一题 按钮
    document.getElementById('btn-submit').addEventListener('click', (e) => { e.stopPropagation(); onSubmit(); });
    document.getElementById('btn-explain').addEventListener('click', (e) => { e.stopPropagation(); onExplain(); });
    document.getElementById('btn-next').addEventListener('click', (e) => { e.stopPropagation(); onNext(); });
    document.getElementById('btn-exit').addEventListener('click', (e) => { e.stopPropagation(); navigate('#/map'); });
  }

  function onSelectOption(btn, key) {
    try {
      console.log('[option] 点击', { key, submitted: state.submitted, qid: state.questions[state.currentIdx] && state.questions[state.currentIdx].id, selected: Array.from(state.selected) });
      if (state.submitted) return;
      const q = state.questions[state.currentIdx];
      if (!q) { console.warn('题目为空', state.currentIdx); return; }
      if (q.type === 'multi') {
        if (state.selected.has(key)) state.selected.delete(key);
        else state.selected.add(key);
        btn.classList.toggle('selected', state.selected.has(key));
      } else {
        state.selected.clear();
        state.selected.add(key);
        document.querySelectorAll('.option').forEach(b => {
          b.classList.toggle('selected', b.dataset.key === key);
        });
      }
      const submitBtn = document.getElementById('btn-submit');
      if (submitBtn) submitBtn.disabled = state.selected.size === 0;
    } catch (err) {
      console.error('onSelectOption 异常:', err);
    }
  }

  function onSubmit() {
    try {
      if (state.selected.size === 0) return;
      state.submitted = true;
      const q = state.questions[state.currentIdx];
      if (!q) { console.error('提交时题目为空'); return; }
      const correctKeys = new Set(q.answer);
      const userKeys = state.selected;
      const isCorrect = userKeys.size === correctKeys.size && [...userKeys].every(k => correctKeys.has(k));

      // 标记选项
      document.querySelectorAll('.option').forEach(btn => {
        btn.setAttribute('aria-disabled', 'true');
        if (correctKeys.has(btn.dataset.key)) btn.classList.add('correct');
        if (userKeys.has(btn.dataset.key) && !correctKeys.has(btn.dataset.key)) btn.classList.add('wrong');
      });

      // 反馈
      const fb = document.getElementById('feedback');
      if (isCorrect) {
        fb.innerHTML = '<i class="fa-solid fa-circle-check"></i> 答对啦！';
        fb.className = 'feedback right';
        state.correctCount++;
        launchConfetti();
      } else {
        fb.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> 答错了，正确答案是 <strong>${[...correctKeys].join('、')}</strong>`;
        fb.className = 'feedback wrong';
        state.wrongQuestions.push({ id: q.id, topicId: q.topicId, prompt: q.prompt, userAns: [...userKeys], rightAns: [...correctKeys], code: q.code, ts: Date.now() });
        console.log('已记录错题:', q.id, '，当前轮累计', state.wrongQuestions.length);
      }

      // 切换按钮
      document.getElementById('btn-submit').style.display = 'none';
      document.getElementById('btn-explain').style.display = 'inline-flex';
      document.getElementById('btn-next').style.display = 'inline-flex';
      document.getElementById('btn-explain').textContent = isCorrect ? '📖 看看解析' : '💡 看图解，搞懂它';

      // 答完一题立即持久化：保证首页累计进度/错题本/重置进度 都及时更新
      try {
        const p = loadProgress();
        p.byTopic = p.byTopic || {};
        const tId = q.topicId;
        if (!p.byTopic[tId]) p.byTopic[tId] = { done: 0, correct: 0 };
        p.byTopic[tId].done = (p.byTopic[tId].done || 0) + 1;
        if (isCorrect) p.byTopic[tId].correct = (p.byTopic[tId].correct || 0) + 1;
        if (!isCorrect) {
          p.wrongList = p.wrongList || [];
          p.wrongList.push({ id: q.id, topicId: q.topicId, prompt: q.prompt, userAns: [...userKeys], rightAns: [...correctKeys], code: q.code, ts: Date.now() });
          if (p.wrongList.length > 200) p.wrongList = p.wrongList.slice(-200);
        }
        const ok = saveProgress(p);
        console.log('[onSubmit] 立即保存进度 ok=' + ok + ', byTopic[' + tId + ']=' + JSON.stringify(p.byTopic[tId]) + ', wrongList总数=' + (p.wrongList || []).length);
      } catch (e) { console.error('onSubmit 保存进度失败:', e); }
    } catch (err) {
      console.error('onSubmit 异常:', err);
    }
  }

  function onExplain() {
    const q = state.questions[state.currentIdx];
    openExplainModal(q);
  }

  function onNext() {
    state.currentIdx++;
    state.selected.clear();
    state.submitted = false;
    if (state.currentIdx >= state.questions.length) {
      finishPlay();
    } else {
      renderPlay();
    }
  }

  function finishPlay() {
    try {
      state.endTime = Date.now();
      // 持久化
      const progress = loadProgress();
      progress.byTopic = progress.byTopic || {};
      const tId = state.topicId;
      if (!progress.byTopic[tId]) progress.byTopic[tId] = { done: 0, correct: 0 };
      progress.byTopic[tId].done += state.questions.length;
      progress.byTopic[tId].correct += state.correctCount;
      // 错题合集
      progress.wrongList = (progress.wrongList || []).concat(state.wrongQuestions);
      // 限制错题本大小
      if (progress.wrongList.length > 200) progress.wrongList = progress.wrongList.slice(-200);
      const ok = saveProgress(progress);
      console.log('本轮结束，已保存进度 ok=' + ok + '，本轮错题 ' + state.wrongQuestions.length + '，累计错题 ' + progress.wrongList.length);
      navigate('#/result');
    } catch (err) {
      console.error('finishPlay 异常:', err);
      navigate('#/result');
    }
  }

  // ============ 视图：结算页 ============
  function renderResult() {
    const total = state.questions.length;
    const correct = state.correctCount;
    const wrong = total - correct;
    const seconds = Math.max(1, Math.round((state.endTime - state.startTime) / 1000));
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    const pct = total ? Math.round(correct / total * 100) : 0;
    let grade = '继续努力！';
    let trophy = '🌱';
    if (pct >= 90) { grade = '太厉害啦！列表小博士！'; trophy = '🏆'; }
    else if (pct >= 70) { grade = '棒棒哒！已经掌握大部分啦'; trophy = '🥇'; }
    else if (pct >= 50) { grade = '还差一点点，加油！'; trophy = '🥈'; }

    const topic = TOPICS.find(t => t.id === state.topicId) || { name: '全部', color: '#3776AB' };

    stage.innerHTML = `
      <section class="result-wrap">
        <div class="result-card">
          <div class="trophy">${trophy}</div>
          <div class="result-score">${correct}<span class="total"> / ${total}</span></div>
          <div class="result-grade">${grade}（${pct}%）</div>
          <div class="result-stats">
            <span class="stat-chip success"><i class="fa-solid fa-check"></i> 答对 ${correct}</span>
            <span class="stat-chip error"><i class="fa-solid fa-xmark"></i> 答错 ${wrong}</span>
            <span class="stat-chip time"><i class="fa-regular fa-clock"></i> 用时 ${mm}:${ss}</span>
            <span class="stat-chip" style="background:${topic.color}20;color:${topic.color}"><i class="fa-solid fa-bookmark"></i> ${topic.name}</span>
          </div>
          <div class="result-actions">
            <button class="btn btn-primary" id="btn-retry"><i class="fa-solid fa-rotate"></i> 再来一次</button>
            <button class="btn btn-ghost" id="btn-back-map"><i class="fa-solid fa-map"></i> 返回地图</button>
            ${wrong > 0 ? '<button class="btn btn-accent" id="btn-review-wrong"><i class="fa-solid fa-bookmark"></i> 复习错题</button>' : ''}
            <button class="btn btn-accent" id="btn-report" style="background:linear-gradient(135deg,#F97316,#EC4899);color:#fff;"><i class="fa-solid fa-paper-plane"></i> 生成成绩单</button>
          </div>
        </div>
        <div class="wrong-list" id="wrong-list">
          <h3>📋 本轮错题（${state.wrongQuestions.length}）</h3>
          ${state.wrongQuestions.length === 0 ?
            '<div class="empty">🎉 本轮全部答对！太强啦！</div>' :
            state.wrongQuestions.map(w => {
              const t = TOPICS.find(t => t.id === w.topicId) || {};
              return `
                <div class="wrong-item" data-qid="${w.id}">
                  <span class="wi-topic" style="background:${t.color}20;color:${t.color}">${t.name || ''}</span>
                  <div class="wi-prompt">${w.prompt}</div>
                  <div class="wi-ans">
                    <span class="you">你的答案：${w.userAns.join('、') || '（空）'}</span>
                    <span class="right">正确答案：${w.rightAns.join('、')}</span>
                  </div>
                </div>
              `;
            }).join('')
          }
        </div>
      </section>
    `;

    document.getElementById('btn-retry').addEventListener('click', () => {
      startPlay(state.topicId);
      navigate(`#/play/${state.topicId}`);
    });
    document.getElementById('btn-back-map').addEventListener('click', () => navigate('#/map'));
    const rw = document.getElementById('btn-review-wrong');
    if (rw) rw.addEventListener('click', () => navigate('#/review'));

    // 错题项点击回放
    document.querySelectorAll('.wrong-item').forEach(el => {
      el.addEventListener('click', () => {
        const qid = el.dataset.qid;
        const q = QUESTIONS.find(q => q.id === qid);
        if (q) openExplainModal(q);
      });
    });

    // 生成成绩单
    const br = document.getElementById('btn-report');
    if (br) br.addEventListener('click', openReportModal);
  }

  // ============ 报告生成 ============
  // 报告数据源：当前 session 状态 或 localStorage 累计进度
  // 根据当前所在页面，选用不同源
  function _getReportSource() {
    // 当前 session（学生正在答题 result/play 都算）
    if ((state.route === 'result' || state.route === 'play') && state.questions && state.questions.length) {
      // 答题中：已答部分
      const partial = state.currentIdx + (state.submitted ? 1 : 0);
      const correctSoFar = state.correctCount;
      const wrongSoFar = state.wrongQuestions.length;
      // 答题中：只统计"已答"那部分
      const handledTotal = state.submitted
        ? state.questions.length   // result 页：全部算
        : partial;                // play 页：只算已答
      const handledCorrect = correctSoFar;
      const handledWrong = wrongSoFar;
      return {
        kind: state.submitted ? 'session-done' : 'session-partial',
        topicId: state.topicId,
        topicName: (TOPICS.find(t => t.id === state.topicId) || {}).name || '全关卡',
        total: handledTotal,
        correct: handledCorrect,
        wrong: handledWrong,
        duration: Math.round((Date.now() - state.startTime) / 1000),  // 单位：秒
        wrongList: state.wrongQuestions || [],
        ts: Date.now()
      };
    }
    // 否则用 localStorage 累计（来自之前的关卡）
    const p = loadProgress();
    let total = 0, correct = 0;
    const topicNames = [];
    Object.entries(p.byTopic || {}).forEach(([tId, t]) => {
      if (t.done > 0) {
        total += t.done;
        correct += t.correct;
        const tn = (TOPICS.find(tp => tp.id === tId) || {}).name || tId;
        if (!topicNames.includes(tn)) topicNames.push(tn);
      }
    });
    if (total === 0) return null;
    return {
      kind: 'progress',
      topicId: 'mixed',
      topicName: topicNames.length ? topicNames.join('、') : '累计练习',
      total,
      correct,
      wrong: total - correct,
      duration: 0, // 跨多关时不好算总时长
      wrongList: p.wrongList || [],
      ts: Date.now()
    };
  }

  function buildReport() {
    const src = _getReportSource();
    if (!src) return null;
    return {
      v: 1,
      name: state.studentName || '',
      ts: src.ts,
      topicId: src.topicId,
      topicName: src.topicName,
      total: src.total,
      correct: src.correct,
      wrong: src.wrong,
      duration: src.duration,
      wrongList: (src.wrongList || []).map(w => ({
        id: w.id,
        topicId: w.topicId,
        topicName: (TOPICS.find(t => t.id === w.topicId) || {}).name || '',
        prompt: (w.prompt || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '),
        userAns: w.userAns,
        rightAns: w.rightAns
      }))
    };
  }

  // 任何时候都能调用的"提交成绩"入口
  function openSubmitReportModal() {
    const src = _getReportSource();
    if (!src || src.total === 0) {
      // 还没做过题：提示一下
      showToast('你还没做题呢～先去闯一关吧！');
      return;
    }
    openReportModal();
  }

  function openReportModal() {
    const modal = document.getElementById('report-mask');
    if (!modal) return;
    // 第一次打开：让用户填名字（可选）
    const inputWrap = document.getElementById('report-name-input');
    const nameInput = document.getElementById('report-name');
    if (inputWrap && nameInput) {
      inputWrap.style.display = '';
      nameInput.value = state.studentName || '';
      nameInput.focus();
    }
    document.getElementById('report-code-area').style.display = 'none';
    document.getElementById('report-qr').innerHTML = '';
    document.getElementById('report-generate').onclick = generateAndShowReport;
    document.getElementById('report-close').onclick = closeReportModal;
    const close2 = document.getElementById('report-close-2');
    if (close2) close2.onclick = closeReportModal;
    // 标题根据场景动态变化
    const src = _getReportSource();
    const titleEl = modal.querySelector('.modal-header h2');
    const tagEl = modal.querySelector('.modal-badge');
    if (!src) {
      if (titleEl) titleEl.textContent = '你还没做题呢';
      if (tagEl) tagEl.innerHTML = '⚠️ 提示';
      return;
    }
    if (titleEl) {
      if (src.kind === 'session-partial') titleEl.textContent = `做完 ${src.total} 题，先提交一下？`;
      else if (src.kind === 'session-done') titleEl.textContent = '把本关成绩发给老师';
      else if (src.kind === 'progress') titleEl.textContent = '把累计成绩发给老师';
      else titleEl.textContent = '把成绩发给老师';
    }
    if (tagEl) {
      if (src.kind === 'session-partial') tagEl.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> 部分成绩';
      else if (src.kind === 'session-done') tagEl.innerHTML = '📤 成绩单';
      else if (src.kind === 'progress') tagEl.innerHTML = '<i class="fa-solid fa-layer-group"></i> 累计成绩单';
      else tagEl.innerHTML = '📤 成绩单';
    }
    modal.hidden = false;
  }

  // 简单的顶部浮提示
  function showToast(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 2200);
  }
  function closeReportModal() {
    const modal = document.getElementById('report-mask');
    if (modal) modal.hidden = true;
  }
  function generateAndShowReport() {
    const nameInput = document.getElementById('report-name');
    if (nameInput) state.studentName = nameInput.value.trim();
    const report = buildReport();
    const code = window.PyListApp.encodeReport(report);
    const codeArea = document.getElementById('report-code-area');
    const codeText = document.getElementById('report-code-text');
    codeText.value = code;
    codeArea.style.display = '';
    document.getElementById('report-name-input').style.display = 'none';

    // 二维码（如果库加载失败也不影响）
    try {
      const qrEl = document.getElementById('report-qr');
      qrEl.innerHTML = '';
      if (typeof window.qrcode === 'function') {
        // qrcode-generator 库：先按数据长度估算 typeNumber
        const len = code.length;
        let typeNumber = 0; // 0 = 自动
        const qr = window.qrcode(typeNumber, 'M');
        qr.addData(code);
        qr.make();
        // 用 SVG 渲染（清晰、可缩放、不依赖 canvas）
        qrEl.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 4, scalable: true });
      } else {
        qrEl.innerHTML = '<div style="color:#9ca3af;font-size:13px;">二维码库未加载（仍可复制文本编码）</div>';
      }
    } catch (err) {
      console.warn('QR 异常:', err);
    }

    // 复制按钮
    const copyBtn = document.getElementById('report-copy');
    if (copyBtn) {
      copyBtn.onclick = () => {
        codeText.select();
        try {
          navigator.clipboard.writeText(code).then(() => {
            copyBtn.textContent = '✅ 已复制';
            setTimeout(() => { copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> 复制编码'; }, 1500);
          }).catch(() => {
            document.execCommand('copy');
            copyBtn.textContent = '✅ 已复制';
            setTimeout(() => { copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> 复制编码'; }, 1500);
          });
        } catch { /* ignore */ }
      };
    }
  }

  // ============ 视图：错题本 ============
  function renderReview() {
    const progress = loadProgress();
    const list = (progress.wrongList || []).slice().reverse();
    console.log('错题本加载：累计错题数 =', list.length);
    stage.innerHTML = `
      <section class="review-wrap">
        <div class="review-hero">
          <h1>📒 错题本</h1>
          <p>这里收集了你最近答错的题目，点开就能看图解和讲解。</p>
        </div>
        ${list.length === 0 ?
          `<div class="wrong-list"><div class="empty">🎉 还没有错题！先去做几道题试试看～</div></div>` :
          `<div class="review-list">
            ${list.map((w, i) => {
              const t = TOPICS.find(t => t.id === w.topicId) || {};
              return `
                <div class="review-item" data-qid="${w.id}">
                  <div class="ri-head">
                    <span class="ri-tag" style="background:${t.color}20;color:${t.color}">${t.name || ''}</span>
                    <span class="ri-date">${new Date(w.ts).toLocaleString('zh-CN', { hour12: false })}</span>
                  </div>
                  <div class="ri-prompt">${w.prompt}</div>
                </div>
              `;
            }).join('')}
          </div>`
        }
      </section>
    `;
    document.querySelectorAll('.review-item').forEach(el => {
      el.addEventListener('click', () => {
        const qid = el.dataset.qid;
        const q = QUESTIONS.find(q => q.id === qid);
        if (q) openExplainModal(q);
      });
    });
  }

  // ============ 模态：图解讲解 ============
  function openExplainModal(q) {
    const mask = document.getElementById('modal-mask');
    document.getElementById('modal-title').textContent = '为什么是这个答案？';
    document.getElementById('diagram-stage').innerHTML = renderDiagram(q.explain.diagram, q.explain.diagramData || {});
    document.getElementById('explain-text').innerHTML = q.explain.reason;
    document.getElementById('knowledge-card').innerHTML = q.explain.knowledge || '';
    mask.hidden = false;
  }
  function closeExplainModal() {
    document.getElementById('modal-mask').hidden = true;
  }
  document.getElementById('modal-close').addEventListener('click', closeExplainModal);
  document.getElementById('modal-next').addEventListener('click', () => {
    closeExplainModal();
    onNext();
  });
  document.getElementById('modal-mask').addEventListener('click', (e) => {
    if (e.target.id === 'modal-mask') closeExplainModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('modal-mask').hidden) closeExplainModal();
  });

  // ============ 顶部品牌 / 导航点击 ============
  document.getElementById('brand-home').addEventListener('click', () => navigate('#/map'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = btn.dataset.route;
      if (r === 'map') navigate('#/map');
      if (r === 'review') navigate('#/review');
    });
  });
  // 顶部"提交成绩"按钮：任何页面都能用
  const navSubmit = document.getElementById('nav-submit');
  if (navSubmit) {
    navSubmit.addEventListener('click', (e) => {
      e.stopPropagation();
      openSubmitReportModal();
    });
  }

  // 页脚"重置进度"按钮：发网址给学生前点这个
  const resetBtn = document.getElementById('footer-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!confirm('确定要清空当前设备上的所有练习记录吗？\n\n这个操作不可撤销！\n（建议在把网址发给学生前点这个）')) return;
      // 清掉所有相关 key
      try { localStorage.removeItem('py_list_quiz_progress_v1'); } catch (e) {}
      try { localStorage.removeItem('py_list_quiz_teacher_v1'); } catch (e) {}
      try { localStorage.removeItem('py_list_quiz_teacher_session'); } catch (e) {}
      try { sessionStorage.clear(); } catch (e) {}
      // 重置内存 state
      state = Object.assign(state, {
        route: 'map', currentIdx: 0, questions: [], correctCount: 0,
        wrongQuestions: [], topicId: 'all', startTime: 0, endTime: 0,
        submitted: false, studentName: ''
      });
      showToast('已重置！页面即将刷新…');
      setTimeout(() => location.reload(), 800);
    });
  }

  // ============ 烟花庆祝 ============
  function launchConfetti() {
    const layer = document.getElementById('confetti-layer');
    const colors = ['#FFD43B', '#3776AB', '#10B981', '#E74C3C', '#8B5CF6', '#EC4899'];
    for (let i = 0; i < 32; i++) {
      const p = document.createElement('span');
      p.className = 'confetti';
      const size = 8 + Math.random() * 10;
      const left = 20 + Math.random() * 60;
      const delay = Math.random() * 200;
      const dur = 1200 + Math.random() * 800;
      p.style.cssText = `
        position: fixed;
        top: -20px;
        left: ${left}%;
        width: ${size}px;
        height: ${size * 0.4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 2px;
        transform: rotate(${Math.random() * 360}deg);
        pointer-events: none;
        z-index: 200;
        animation: confettiFall ${dur}ms ease-in ${delay}ms forwards;
      `;
      layer.appendChild(p);
      setTimeout(() => p.remove(), dur + delay + 100);
    }
    // 注入动画 keyframes（一次性）
    if (!document.getElementById('confetti-style')) {
      const s = document.createElement('style');
      s.id = 'confetti-style';
      s.textContent = `
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(s);
    }
  }

  // ============ 启动 ============
  // 拦截进入 play 路由时初始化状态
  function initPlayIfNeeded() {
    if (state.route === 'play') {
      const r = parseRoute();
      if (r.topicId && (state.topicId !== r.topicId || !state.questions.length)) {
        startPlay(r.topicId);
      }
    }
  }
  const origSync = syncRoute;
  window.addEventListener('hashchange', initPlayIfNeeded);
  initPlayIfNeeded();
  syncRoute();
})();
