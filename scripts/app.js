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
    return { route: 'map' };
  }

  function syncRoute() {
    const r = parseRoute();
    state.route = r.route;
    if (r.topicId) state.topicId = r.topicId;
    updateNav();
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
    stage.innerHTML = `
      <section class="map-hero">
        <h1>🐍 Python 列表 · 闯关大冒险</h1>
        <p class="subtitle">12 个知识点 · 44 道图解题 · 玩着学才记得住！</p>
        <div class="quickstart">
          <button class="btn btn-accent" id="btn-start-all">🚀 全部闯关</button>
          <button class="btn btn-ghost" id="btn-review">📒 看看错题本</button>
        </div>
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
            <div style="display:flex; gap:8px;">
              <button class="btn btn-ghost" id="btn-exit"><i class="fa-solid fa-xmark"></i> 退出</button>
              <button class="btn btn-primary" id="btn-submit" disabled>提交答案</button>
              <button class="btn btn-accent" id="btn-explain" style="display:none;"><i class="fa-solid fa-lightbulb"></i> 看图解</button>
              <button class="btn btn-primary" id="btn-next" style="display:none;">下一题 <i class="fa-solid fa-arrow-right"></i></button>
            </div>
          </div>
        </div>
      </section>
    `;

    // 用事件委托：把点击事件挂到 stage 容器上（只挂一次，每次重渲染都生效）
    const optsList = document.getElementById('options-list');
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.dataset.key = opt.key;
      btn.innerHTML = opt.text;
      // 直接绑 click（防止冒泡问题），并用 data-key 索引
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectOption(btn, opt.key);
      });
      optsList.appendChild(btn);
    });

    // 提交/解析/下一题 按钮
    document.getElementById('btn-submit').addEventListener('click', (e) => { e.stopPropagation(); onSubmit(); });
    document.getElementById('btn-explain').addEventListener('click', (e) => { e.stopPropagation(); onExplain(); });
    document.getElementById('btn-next').addEventListener('click', (e) => { e.stopPropagation(); onNext(); });
    document.getElementById('btn-exit').addEventListener('click', (e) => { e.stopPropagation(); navigate('#/map'); });
  }

  function onSelectOption(btn, key) {
    try {
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
