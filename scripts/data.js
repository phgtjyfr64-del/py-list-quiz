// 知识点 + 题库 + 图解数据
// 题目数：44 道（覆盖 13 个知识点）
(function () {

  // ============ 知识点定义（关卡地图）============
  const TOPICS = [
    { id: 'basics',    name: '基础知识',         icon: 'fa-solid fa-circle-info',         color: '#3776AB', desc: '列表是什么？长什么样？' },
    { id: 'indexing',  name: '元素编号（索引）',  icon: 'fa-solid fa-list-ol',             color: '#0EA5E9', desc: '正向 0、1、2... 反向 -1、-2...' },
    { id: 'create',    name: '创建列表',         icon: 'fa-solid fa-plus',                color: '#F59E0B', desc: '[]、list()、range() 都能造列表' },
    { id: 'append',    name: '增加元素',         icon: 'fa-solid fa-square-plus',         color: '#10B981', desc: 'append 末尾加，insert 插中间' },
    { id: 'delete',    name: '删除元素',         icon: 'fa-solid fa-trash-can',           color: '#E74C3C', desc: 'del、pop、remove、clear 哪家强？' },
    { id: 'modify',    name: '修改元素',         icon: 'fa-solid fa-pen-to-square',       color: '#8B5CF6', desc: '给指定位置重新赋值' },
    { id: 'search',    name: '列表查找',         icon: 'fa-solid fa-magnifying-glass',    color: '#EC4899', desc: '索引、切片、count 一网打尽' },
    { id: 'traverse',  name: '列表遍历',         icon: 'fa-solid fa-arrows-rotate',       color: '#06B6D4', desc: 'for 循环玩转每个元素' },
    { id: 'matrix',    name: '二维列表',         icon: 'fa-solid fa-table-cells',         color: '#A855F7', desc: '列表里套列表，就是表格！' },
    { id: 'calc',      name: '列表计算',         icon: 'fa-solid fa-calculator',          color: '#F97316', desc: '+、*、extend 拼接复制' },
    { id: 'sort',      name: '列表排序',         icon: 'fa-solid fa-arrow-down-wide-short', color: '#14B8A6', desc: 'sort() vs sorted()' },
    { id: 'operator',  name: '成员运算符',       icon: 'fa-solid fa-equals',              color: '#84CC16', desc: 'in 和 not in' },
    { id: 'builtin',   name: '常用内置函数',     icon: 'fa-solid fa-toolbox',             color: '#6366F1', desc: 'len、max、min、sum、index' }
  ];

  // ============ 题库 ============
  // type: 'single' 单选 | 'multi' 多选 | 'judge' 判断
  // difficulty: 1 基础 / 2 进阶 / 3 挑战
  // explain.diagram: 图解类型
  // explain.diagramData: 传给图解渲染器的数据

  const QUESTIONS = [
    // ========== 1. 基础知识 ==========
    {
      id: 'b1', topicId: 'basics', type: 'single', difficulty: 1,
      prompt: '下面关于 Python 列表的描述，哪一项是<strong>错误</strong>的？',
      code: 'a = [10, "hi", 3.14, True]',
      options: [
        { key: 'A', text: '列表用方括号 <span class="ic">[ ]</span> 表示' },
        { key: 'B', text: '列表里的元素可以是不同类型' },
        { key: 'C', text: '列表是<strong>不可变</strong>的，一旦创建就不能修改' },
        { key: 'D', text: '列表中的元素按放入顺序排列' }
      ],
      answer: ['C'],
      explain: {
        reason: '列表最大的特点就是<strong>「可变」</strong>！可以随时增删改里面的元素。这也是它和「元组 ( )」的最大区别：元组不可变，列表可变。',
        diagram: 'basics',
        diagramData: { list: [10, '"hi"', 3.14, 'True'], title: 'a = [10, "hi", 3.14, True]' },
        knowledge: '<h4>📚 列表四要素</h4>① 用 <span class="ic">[ ]</span> 包起来<br>② 元素之间用逗号 <span class="ic">,</span> 分隔<br>③ 元素类型可以不同（数字、字符串、布尔都行）<br>④ <strong>可变、有序</strong>：能改、顺序不乱'
      }
    },
    {
      id: 'b2', topicId: 'basics', type: 'single', difficulty: 1,
      prompt: '上面这个列表 <span class="ic">a</span> 中，一共包含几种<strong>不同类型</strong>的元素？',
      code: 'a = [10, "hi", 3.14, True]',
      options: [
        { key: 'A', text: '1 种' },
        { key: 'B', text: '2 种' },
        { key: 'C', text: '3 种' },
        { key: 'D', text: '<strong>4 种</strong>' }
      ],
      answer: ['D'],
      explain: {
        reason: '10 是<strong>整数 (int)</strong>，"hi" 是<strong>字符串 (str)</strong>，3.14 是<strong>浮点数 (float)</strong>，True 是<strong>布尔 (bool)</strong>，刚好 4 种类型！',
        diagram: 'basics',
        diagramData: { list: [10, '"hi"', 3.14, 'True'], title: '4 种类型都装得下！' },
        knowledge: '<h4>📚 列表 vs 数组</h4>其它语言里的"数组"通常要求元素类型相同，但 Python 列表 <strong>「大小通吃」</strong>——什么类型都能放一起。'
      }
    },
    {
      id: 'b3', topicId: 'basics', type: 'single', difficulty: 1,
      prompt: '列表中的每一个数据，专业叫法是？',
      options: [
        { key: 'A', text: '节点' },
        { key: 'B', text: '<strong>元素</strong>' },
        { key: 'C', text: '字段' },
        { key: 'D', text: '属性' }
      ],
      answer: ['B'],
      explain: {
        reason: '列表里装的每一个东西都叫<strong>「元素」(element)</strong>。',
        diagram: 'basics',
        diagramData: { list: [10, '"hi"', 3.14, 'True'], title: '4 个元素', highlightAll: true },
        knowledge: '<h4>📚 三个好朋友</h4><span class="ic">元素</span> = 列表里的每一个数据<br><span class="ic">索引</span> = 元素的位置编号<br><span class="ic">值</span> = 元素具体是什么'
      }
    },

    // ========== 2. 元素编号（索引） ==========
    {
      id: 'i1', topicId: 'indexing', type: 'single', difficulty: 1,
      prompt: '执行下面的代码，输出结果是？',
      code: 'a = [10, 20, 30, 40]\nprint(a[0])',
      options: [
        { key: 'A', text: '<strong>10</strong>' },
        { key: 'B', text: '20' },
        { key: 'C', text: '30' },
        { key: 'D', text: '40' }
      ],
      answer: ['A'],
      explain: {
        reason: '正向索引从 <span class="ic">0</span> 开始数！第 1 个元素的索引是 0，所以 <span class="ic">a[0]</span> 是第一个元素 <span class="ic">10</span>。',
        diagram: 'indexing',
        diagramData: { list: [10, 20, 30, 40], highlight: 0, label: 'a[0]' },
        knowledge: '<h4>📚 重要：索引从 0 开始</h4>第 1 个 → 索引 0<br>第 2 个 → 索引 1<br>第 3 个 → 索引 2<br>第 n 个 → 索引 n-1'
      }
    },
    {
      id: 'i2', topicId: 'indexing', type: 'single', difficulty: 2,
      prompt: '反向索引，<span class="ic">a[-1]</span> 指的是哪个元素？',
      code: 'a = [10, 20, 30, 40]',
      options: [
        { key: 'A', text: '10' },
        { key: 'B', text: '20' },
        { key: 'C', text: '30' },
        { key: 'D', text: '<strong>40</strong>' }
      ],
      answer: ['D'],
      explain: {
        reason: '<span class="ic">-1</span> 表示倒数第 <strong>1</strong> 个，所以是最后一个 <span class="ic">40</span>。',
        diagram: 'indexing',
        diagramData: { list: [10, 20, 30, 40], highlight: 3, label: 'a[-1]' },
        knowledge: '<h4>📚 反向索引规则</h4>a[-1] → 最后一个<br>a[-2] → 倒数第二个<br>a[-n] → 倒数第 n 个'
      }
    },
    {
      id: 'i3', topicId: 'indexing', type: 'single', difficulty: 2,
      prompt: '那 <span class="ic">a[-2]</span> 是哪个元素？',
      code: 'a = [10, 20, 30, 40]',
      options: [
        { key: 'A', text: '10' },
        { key: 'B', text: '20' },
        { key: 'C', text: '<strong>30</strong>' },
        { key: 'D', text: '40' }
      ],
      answer: ['C'],
      explain: {
        reason: '<span class="ic">-2</span> 表示倒数第 <strong>2</strong> 个，所以是 <span class="ic">30</span>。',
        diagram: 'indexing',
        diagramData: { list: [10, 20, 30, 40], highlight: 2, label: 'a[-2]' },
        knowledge: '<h4>📚 正反索引对应</h4>索引 0 ↔ 索引 -4（最左↔最右）<br>索引 1 ↔ 索引 -3<br>索引 2 ↔ 索引 -2<br>索引 3 ↔ 索引 -1'
      }
    },
    {
      id: 'i4', topicId: 'indexing', type: 'single', difficulty: 2,
      prompt: '<span class="ic">a[2]</span> 的值是？',
      code: 'a = [5, 15, 25, 35]',
      options: [
        { key: 'A', text: '5' },
        { key: 'B', text: '15' },
        { key: 'C', text: '<strong>25</strong>' },
        { key: 'D', text: '35' }
      ],
      answer: ['C'],
      explain: {
        reason: '索引 2 指的是第 <strong>3</strong> 个元素（从 0 开始数），所以是 <span class="ic">25</span>。',
        diagram: 'indexing',
        diagramData: { list: [5, 15, 25, 35], highlight: 2, label: 'a[2]' },
        knowledge: '<h4>📚 数数小口诀</h4>a[0] = 第一个，a[1] = 第二个… a[n-1] = 第 n 个'
      }
    },
        // ========== 3. 创建列表 ==========
    {
      id: 'c1', topicId: 'create', type: 'single', difficulty: 1,
      prompt: '下面哪一种写法能创建一个<strong>空列表</strong>？',
      options: [
        { key: 'A', text: 'a = ( )' },
        { key: 'B', text: '<strong>a = [ ]</strong>' },
        { key: 'C', text: 'a = { }' },
        { key: 'D', text: "a = ''" }
      ],
      answer: ['B'],
      explain: {
        reason: '方括号 <span class="ic">[ ]</span> 才是列表的标志！小括号 <span class="ic">( )</span> 是元组，大括号 <span class="ic">{ }</span> 是字典/集合。',
        diagram: 'create',
        diagramData: { kind: 'empty' },
        knowledge: '<h4>📚 各种括号的家</h4><span class="ic">[ ]</span> 列表 (list)<br><span class="ic">( )</span> 元组 (tuple)<br><span class="ic">{ }</span> 字典 (dict) / 集合 (set)<br><span class="ic">{ }</span> 里是 key:value 就是字典'
      }
    },
    {
      id: 'c2', topicId: 'create', type: 'single', difficulty: 1,
      prompt: '<span class="ic">list(range(3))</span> 的结果是？',
      options: [
        { key: 'A', text: '[1, 2, 3]' },
        { key: 'B', text: '<strong>[0, 1, 2]</strong>' },
        { key: 'C', text: '[3]' },
        { key: 'D', text: '[0, 1, 2, 3]' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">range(3)</span> 生成 <span class="ic">0,1,2</span>（不含 3，含头不含尾！），再被 <span class="ic">list()</span> 转成列表。',
        diagram: 'create',
        diagramData: { kind: 'range', n: 3 },
        knowledge: '<h4>📚 range 三种用法</h4><span class="ic">range(5)</span> → 0,1,2,3,4<br><span class="ic">range(2,5)</span> → 2,3,4<br><span class="ic">range(0,10,2)</span> → 0,2,4,6,8<br>记住：<strong>含头不含尾</strong>！'
      }
    },
    {
      id: 'c3', topicId: 'create', type: 'single', difficulty: 2,
      prompt: '<span class="ic">list("abc")</span> 的结果是？',
      options: [
        { key: 'A', text: "['abc']" },
        { key: 'B', text: "<strong>['a', 'b', 'c']</strong>" },
        { key: 'C', text: '[97, 98, 99]' },
        { key: 'D', text: '报错' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">list()</span> 会把字符串里的<strong>每个字符</strong>拆出来当列表元素。',
        diagram: 'create',
        diagramData: { kind: 'split', source: '"abc"', result: ["'a'", "'b'", "'c'"] },
        knowledge: '<h4>📚 list() 的拆解能力</h4><span class="ic">list("abc")</span> → [\'a\',\'b\',\'c\']<br><span class="ic">list((1,2,3))</span> → [1,2,3]<br><span class="ic">list(range(3))</span> → [0,1,2]<br>它能把"可迭代的东西"全转成列表！'
      }
    },

    // ========== 4. 增加元素 ==========
    {
      id: 'a1', topicId: 'append', type: 'single', difficulty: 1,
      prompt: '执行完代码后，列表 a 是什么？',
      code: 'a = [1, 2]\na.append(3)',
      options: [
        { key: 'A', text: '<strong>[1, 2, 3]</strong>' },
        { key: 'B', text: '[3, 1, 2]' },
        { key: 'C', text: '[1, 2, [3]]' },
        { key: 'D', text: '报错' }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">append()</span> 把元素<strong>加到列表末尾</strong>。原列表 <span class="ic">[1,2]</span> → 加 3 → <span class="ic">[1,2,3]</span>。',
        diagram: 'append',
        diagramData: { before: [1, 2], added: 3, after: [1, 2, 3] },
        knowledge: '<h4>📚 append 特点</h4>① <strong>只能加一个</strong>元素<br>② <strong>加在末尾</strong><br>③ 直接修改原列表，<strong>没有返回值</strong>（返回 None）<br>④ 想加多个用 extend()'
      }
    },
    {
      id: 'a2', topicId: 'append', type: 'single', difficulty: 2,
      prompt: '关于 <span class="ic">append()</span> 方法，下面哪个说法<strong>不对</strong>？',
      options: [
        { key: 'A', text: '<strong>可以把元素插入到任意位置</strong>' },
        { key: 'B', text: '只能把元素添加到列表末尾' },
        { key: 'C', text: '一次只能添加一个元素' },
        { key: 'D', text: '会直接修改原列表' }
      ],
      answer: ['A'],
      explain: {
        reason: '想在任意位置插元素是 <span class="ic">insert()</span> 的活儿！<span class="ic">append()</span> 只能加到末尾。',
        diagram: 'append',
        diagramData: { before: [1, 2], added: 3, after: [1, 2, 3] },
        knowledge: '<h4>📚 append vs insert</h4><span class="ic">a.append(x)</span> → 末尾加 x<br><span class="ic">a.insert(i, x)</span> → 第 i 个位置插 x<br>insert 也能加到末尾，但需要写 <span class="ic">insert(len(a), x)</span>'
      }
    },
    {
      id: 'a3', topicId: 'append', type: 'single', difficulty: 2,
      prompt: '执行完代码后，列表 a 是什么？',
      code: "a = ['a', 'c']\na.insert(1, 'b')",
      options: [
        { key: 'A', text: "<strong>['a', 'b', 'c']</strong>" },
        { key: 'B', text: "['b', 'a', 'c']" },
        { key: 'C', text: "['a', 'c', 'b']" },
        { key: 'D', text: "['a', 'c']" }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">insert(1, \'b\')</span> 表示在<strong>索引 1 的位置</strong>插入 <span class="ic">\'b\'</span>，原来的元素自动往后挪。',
        diagram: 'insert',
        diagramData: { before: ['a', 'c'], insertAt: 1, value: 'b', after: ['a', 'b', 'c'] },
        knowledge: '<h4>📚 insert 语法</h4><span class="ic">列表.insert(位置, 元素)</span><br>位置 0 → 最前面<br>位置 1 → 第二个位置<br>位置 len(列表) → 末尾'
      }
    },
    {
      id: 'a4', topicId: 'append', type: 'judge', difficulty: 1,
      prompt: '<span class="ic">a.append([1,2])</span> 之后，a 里面会有 <span class="ic">[1,2]</span> 这<strong>两个</strong>元素。对还是错？',
      options: [
        { key: 'A', text: '✅ 对' },
        { key: 'B', text: '❌ <strong>错</strong>' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">append()</span> 一次只加<strong>一个</strong>元素！传进去的 <span class="ic">[1,2]</span> 会当成<strong>一个整体</strong>放进列表里，列表长度只增加 1。',
        diagram: 'append',
        diagramData: { before: [1, 2], added: '[1,2]', isWhole: true, after: [1, 2, '[1,2]'] },
        knowledge: '<h4>📚 想加多个怎么办？</h4>① <span class="ic">a.extend([3,4])</span> → 把 3 和 4 一个个加进去<br>② <span class="ic">a += [3,4]</span> → 效果一样<br>③ <span class="ic">a.append([3,4])</span> → 把 [3,4] 整个塞进去（列表里多了一个"小列表"）'
      }
    },

    // ========== 5. 删除元素 ==========
    {
      id: 'd1', topicId: 'delete', type: 'single', difficulty: 1,
      prompt: '执行完代码后，列表 a 是什么？',
      code: 'a = [1, 2, 3, 4]\ndel a[0]',
      options: [
        { key: 'A', text: '<strong>[2, 3, 4]</strong>' },
        { key: 'B', text: '[1, 3, 4]' },
        { key: 'C', text: '[1, 2, 3]' },
        { key: 'D', text: '[]' }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">del a[0]</span> 表示<strong>按索引删除</strong>，删掉第 1 个（索引 0）元素 <span class="ic">1</span>。剩下的元素自动往前补位。',
        diagram: 'del',
        diagramData: { before: [1, 2, 3, 4], delIndex: 0, after: [2, 3, 4] },
        knowledge: '<h4>📚 del 三种姿势</h4><span class="ic">del a[0]</span> → 删一个<br><span class="ic">del a[1:4]</span> → 删一段（切片）<br><span class="ic">del a</span> → 把整个列表删掉（a 就没了）'
      }
    },
    {
      id: 'd2', topicId: 'delete', type: 'single', difficulty: 1,
      prompt: '<span class="ic">a.pop()</span> 不传参数时，默认删除哪个元素？',
      code: 'a = [1, 2, 3, 4]',
      options: [
        { key: 'A', text: '第一个元素' },
        { key: 'B', text: '<strong>最后一个元素</strong>' },
        { key: 'C', text: '中间元素' },
        { key: 'D', text: '不删除' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">pop()</span> 默认弹出<strong>最后一个</strong>元素，传索引 <span class="ic">pop(i)</span> 就弹出第 i 个。',
        diagram: 'pop',
        diagramData: { before: [1, 2, 3, 4], popIndex: -1, popped: 4, after: [1, 2, 3] },
        knowledge: '<h4>📚 pop 的小秘密</h4><span class="ic">pop()</span> 不只删除，还会<strong>把删掉的值"返回"出来</strong>：<br><span class="ic">x = a.pop()</span> # x 就是被删掉的那个<br>所以 pop 适合"取出栈顶"的操作（先进后出）'
      }
    },
    {
      id: 'd3', topicId: 'delete', type: 'single', difficulty: 2,
      prompt: '执行完代码后，列表 a 是什么？',
      code: "a = ['x', 'y', 'x', 'z']\na.remove('x')",
      options: [
        { key: 'A', text: "[]" },
        { key: 'B', text: "<strong>['y', 'x', 'z']</strong>" },
        { key: 'C', text: "['y', 'z']" },
        { key: 'D', text: "报错" }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">remove()</span> 按<strong>值</strong>删除，而且<strong>只删第一个</strong>出现的。两个 <span class="ic">\'x\'</span> 里只删最前面那个。',
        diagram: 'remove',
        diagramData: { before: ['x', 'y', 'x', 'z'], value: 'x', after: ['y', 'x', 'z'] },
        knowledge: '<h4>📚 remove vs del vs pop</h4><span class="ic">del a[i]</span> → 按<strong>索引</strong>删<br><span class="ic">a.pop(i)</span> → 按索引删，并返回该值<br><span class="ic">a.remove(x)</span> → 按<strong>值</strong>删，只删第一个<br><span class="ic">a.clear()</span> → 全部清空 → <span class="ic">[]</span>'
      }
    },
    {
      id: 'd4', topicId: 'delete', type: 'single', difficulty: 1,
      prompt: '要把列表 a <strong>完全清空</strong>，最直接的写法是？',
      code: 'a = [1, 2, 3]',
      options: [
        { key: 'A', text: 'del a' },
        { key: 'B', text: '<strong>a.clear()</strong>' },
        { key: 'C', text: 'a.remove(a)' },
        { key: 'D', text: 'a = []' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">a.clear()</span> 会把列表里<strong>所有元素清空</strong>，a 还在，但变成了 <span class="ic">[]</span>。<br><span class="ic">del a</span> 会把 a 整个删掉，a 就<strong>不存在</strong>了。',
        diagram: 'del',
        diagramData: { before: [1, 2, 3], mode: 'clear', after: [] },
        knowledge: '<h4>📚 各种"清空"区别</h4><span class="ic">a.clear()</span> → a 还在，内容变 <span class="ic">[]</span><br><span class="ic">a = []</span> → a 重新指向新空列表（原列表被回收）<br><span class="ic">del a</span> → a 这个名字都没了，再访问 a 会报错'
      }
    },

    // ========== 6. 修改元素 ==========
    {
      id: 'm1', topicId: 'modify', type: 'single', difficulty: 1,
      prompt: '执行完代码后，列表 a 是什么？',
      code: 'a = [1, 2, 3]\na[1] = 99',
      options: [
        { key: 'A', text: '[1, 2, 3]' },
        { key: 'B', text: '<strong>[1, 99, 3]</strong>' },
        { key: 'C', text: '[99, 2, 3]' },
        { key: 'D', text: '[1, 2, 99]' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">a[1] = 99</span> 把<strong>索引 1 的元素</strong>（原本是 2）<strong>替换</strong>成 99，其它位置不变。',
        diagram: 'modify',
        diagramData: { before: [1, 2, 3], changeIndex: 1, from: 2, to: 99, after: [1, 99, 3] },
        knowledge: '<h4>📚 修改的语法</h4><span class="ic">a[i] = 新值</span> → 改一个<br><span class="ic">a[i:j] = [新值列表]</span> → 改一段（元素个数可以不同）<br>修改操作<strong>不会改变列表的长度</strong>（除非切片赋值）'
      }
    },
    {
      id: 'm2', topicId: 'modify', type: 'single', difficulty: 2,
      prompt: '执行完代码后，列表 a 是什么？',
      code: "a = [1, 2, 3, 4]\na[1:3] = ['x', 'y']",
      options: [
        { key: 'A', text: "<strong>[1, 'x', 'y', 4]</strong>" },
        { key: 'B', text: "[1, 'x', 'y']" },
        { key: 'C', text: "[1, 2, 3, 'x', 'y', 4]" },
        { key: 'D', text: "['x', 'y', 4]" }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">a[1:3]</span> 是索引 1、2 那两个元素 <span class="ic">[2,3]</span>，把它们整体替换成 <span class="ic">[\'x\',\'y\']</span>，所以 a 变成 <span class="ic">[1,\'x\',\'y\',4]</span>。',
        diagram: 'modify',
        diagramData: { before: [1, 2, 3, 4], sliceRange: [1, 3], replace: ["'x'", "'y'"], after: [1, "'x'", "'y'", 4] },
        knowledge: '<h4>📚 切片赋值超能力</h4>替换的元素个数可以<strong>和原片段不同</strong>！<br><span class="ic">a[1:3] = [\'x\']</span> → 长度变短<br><span class="ic">a[1:3] = [1,2,3,4]</span> → 长度变长'
      }
    },
    {
      id: 'm3', topicId: 'modify', type: 'judge', difficulty: 1,
      prompt: '"修改列表元素"的本质，是给指定索引的元素<strong>重新赋值</strong>。✅ 还是 ❌？',
      options: [
        { key: 'A', text: '<strong>✅ 对</strong>' },
        { key: 'B', text: '❌ 错' }
      ],
      answer: ['A'],
      explain: {
        reason: '没错！修改就是<strong>在原列表上</strong>把某个位置的值换成新的，并<strong>不会</strong>生成新列表。',
        diagram: 'modify',
        diagramData: { before: [1, 2, 3], changeIndex: 0, from: 1, to: 100, after: [100, 2, 3] },
        knowledge: '<h4>📚 修改 vs 创建</h4><span class="ic">a[0] = 100</span> → 改原列表<br><span class="ic">a = a + [100]</span> → 创建新列表，a 指向新对象'
      }
    },

    // ========== 7. 列表查找 ==========
    {
      id: 's1', topicId: 'search', type: 'single', difficulty: 1,
      prompt: '执行完代码后，a[1:4] 的结果是什么？',
      code: 'a = [10, 20, 30, 40, 50]\nprint(a[1:4])',
      options: [
        { key: 'A', text: '[10, 20, 30]' },
        { key: 'B', text: '<strong>[20, 30, 40]</strong>' },
        { key: 'C', text: '[20, 30, 40, 50]' },
        { key: 'D', text: '[10, 20, 30, 40]' }
      ],
      answer: ['B'],
      explain: {
        reason: '切片 <span class="ic">a[1:4]</span> 包含索引 <strong>1、2、3</strong> 三个元素，<strong>不含 4</strong>。所以是 <span class="ic">[20,30,40]</span>。',
        diagram: 'slice',
        diagramData: { list: [10, 20, 30, 40, 50], start: 1, end: 4, label: 'a[1:4]' },
        knowledge: '<h4>📚 切片含头不含尾</h4><span class="ic">a[1:4]</span> = 从索引 1 开始，到索引 4 之前停下。<br>小口诀：<strong>「含头不含尾」</strong>'
      }
    },
    {
      id: 's2', topicId: 'search', type: 'judge', difficulty: 1,
      prompt: '切片 <span class="ic">a[1:4]</span> 包含终止位置 4 的元素吗？',
      options: [
        { key: 'A', text: '✅ 包含' },
        { key: 'B', text: '❌ <strong>不包含</strong>' }
      ],
      answer: ['B'],
      explain: {
        reason: '切片是「<strong>含头不含尾</strong>」！<span class="ic">a[1:4]</span> 取的是索引 1、2、3，不取 4。',
        diagram: 'slice',
        diagramData: { list: [10, 20, 30, 40, 50], start: 1, end: 4, label: 'a[1:4] 不含 4' },
        knowledge: '<h4>📚 为什么"不含尾"？</h4>这样设计有个好处：<br><span class="ic">a[0:3].len + a[3:6].len = 6</span><br>切两段拼起来刚好是原长度，不会重叠也不会漏！'
      }
    },
    {
      id: 's3', topicId: 'search', type: 'single', difficulty: 3,
      prompt: '执行下面代码，结果是？',
      code: 'a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\nprint(a[0:6:2])',
      options: [
        { key: 'A', text: '<strong>[0, 2, 4]</strong>' },
        { key: 'B', text: '[0, 1, 2, 3, 4, 5]' },
        { key: 'C', text: '[0, 2, 4, 6]' },
        { key: 'D', text: '[2, 4, 6]' }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">a[0:6:2]</span> 表示：从 0 到 6（不含 6），<strong>每隔 2 个取一个</strong>。取到的是 0、2、4。',
        diagram: 'slice',
        diagramData: { list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], start: 0, end: 6, step: 2, label: 'a[0:6:2]' },
        knowledge: '<h4>📚 切片三参数</h4><span class="ic">a[start:stop:step]</span><br>start: 起点（默认 0）<br>stop: 终点（不含，默认到末尾）<br>step: 步长（默认 1）<br><span class="ic">a[::2]</span> → 每隔一个取一个'
      }
    },
    {
      id: 's4', topicId: 'search', type: 'single', difficulty: 2,
      prompt: '<span class="ic">a.count(x)</span> 的作用是什么？',
      code: 'a = [1, 2, 2, 3, 2]',
      options: [
        { key: 'A', text: '查找 x 第一次出现的<strong>位置</strong>' },
        { key: 'B', text: '<strong>统计 x 出现的「次数」</strong>' },
        { key: 'C', text: '把 x 加到列表末尾' },
        { key: 'D', text: '删除所有 x' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">count(x)</span> 返回 x 在列表里<strong>出现的次数</strong>（整数）。<span class="ic">a.count(2)</span> → 3（因为 2 出现了 3 次）。',
        diagram: 'builtin',
        diagramData: { list: [1, 2, 2, 3, 2], highlightValue: 2, count: 3, label: 'count(2) → 3' },
        knowledge: '<h4>📚 找位置用 index()，找次数用 count()</h4><span class="ic">a.index(2)</span> → 1（第一次出现的索引）<br><span class="ic">a.count(2)</span> → 3（出现了 3 次）<br>找不到时 <span class="ic">index()</span> 会报错！'
      }
    },

    // ========== 8. 列表遍历 ==========
    {
      id: 't1', topicId: 'traverse', type: 'single', difficulty: 1,
      prompt: '执行下面代码，输出是？',
      code: 'a = [1, 2, 3]\nfor i in a:\n    print(i)',
      options: [
        { key: 'A', text: '1 2 3（横着）' },
        { key: 'B', text: '<strong>1<br>2<br>3</strong>（每个一行）' },
        { key: 'C', text: 'a' },
        { key: 'D', text: '报错' }
      ],
      answer: ['B'],
      explain: {
        reason: '默认的 <span class="ic">print()</span> 每打印一次会<strong>自动换行</strong>，所以每个数字各占一行。',
        diagram: 'traverse',
        diagramData: { list: [1, 2, 3], mode: 'element' },
        knowledge: '<h4>📚 print 的小细节</h4><span class="ic">print(i)</span> 默认 <span class="ic">end="\\n"</span>，所以会换行。<br>想让它们横着排：<br><span class="ic">print(i, end=" ")</span>'
      }
    },
    {
      id: 't2', topicId: 'traverse', type: 'single', difficulty: 2,
      prompt: '关于 <span class="ic">for i in range(len(a))</span>，下面哪个说法是对的？',
      options: [
        { key: 'A', text: '直接遍历元素，i 就是元素本身' },
        { key: 'B', text: '<strong>通过索引遍历，可以同时获得索引和元素</strong>' },
        { key: 'C', text: '会把列表里所有元素删除' },
        { key: 'D', text: '会创建一个新列表' }
      ],
      answer: ['B'],
      explain: {
        reason: '这种写法里，<span class="ic">i</span> 拿到的是<strong>索引</strong>，要用 <span class="ic">a[i]</span> 才能拿到元素。这样可以同时知道"在第几个"和"是什么"。',
        diagram: 'traverse',
        diagramData: { list: ['a', 'b', 'c', 'd'], mode: 'index' },
        knowledge: '<h4>📚 两种遍历方式</h4><strong>方式一：</strong>直接拿元素<br><span class="ic">for x in a: print(x)</span><br><strong>方式二：</strong>通过索引（推荐！）<br><span class="ic">for i in range(len(a)): print(i, a[i])</span>'
      }
    },
    {
      id: 't3', topicId: 'traverse', type: 'single', difficulty: 2,
      prompt: '哪个代码能<strong>同时</strong>输出索引和元素？',
      code: "a = ['A', 'B', 'C']",
      options: [
        { key: 'A', text: 'for i in a: print(i)' },
        { key: 'B', text: '<strong>for i in range(len(a)): print(i, a[i])</strong>' },
        { key: 'C', text: 'for i in a: print(a[i])' },
        { key: 'D', text: 'print(range(len(a)))' }
      ],
      answer: ['B'],
      explain: {
        reason: 'B 用了 <span class="ic">range(len(a))</span>，<span class="ic">i</span> 是索引，再用 <span class="ic">a[i]</span> 拿到对应元素，<strong>两个都能输出</strong>。',
        diagram: 'traverse',
        diagramData: { list: ['A', 'B', 'C'], mode: 'index', showBoth: true },
        knowledge: '<h4>📚 拓展：enumerate() 也能办到</h4>Python 还有个更优雅的写法：<br><span class="ic">for i, x in enumerate(a):</span><br>    <span class="ic">print(i, x)</span><br>效果完全一样！'
      }
    },
    {
      id: 't4', topicId: 'traverse', type: 'judge', difficulty: 1,
      prompt: '<span class="ic">for i in a:</span> 中，<span class="ic">i</span> 默认代表<strong>元素</strong>。✅ 还是 ❌？',
      options: [
        { key: 'A', text: '<strong>✅ 对</strong>' },
        { key: 'B', text: '❌ 错（i 是索引）' }
      ],
      answer: ['A'],
      explain: {
        reason: '直接遍历时，<span class="ic">i</span> 拿到的就是元素本身；只有用 <span class="ic">range(len(a))</span> 时 i 才是索引。',
        diagram: 'traverse',
        diagramData: { list: [10, 20, 30], mode: 'element' },
        knowledge: '<h4>📚 起名也有讲究</h4>遍历元素时常用 <span class="ic">x / item / value</span>，<br>遍历索引时常用 <span class="ic">i / idx</span>。<br>这样读代码的人一眼就知道你在干嘛！'
      }
    },

    // ========== 9. 二维列表 ==========
    {
      id: 'mt1', topicId: 'matrix', type: 'single', difficulty: 1,
      prompt: '下面哪个是<strong>二维列表</strong>（3行4列）的正确写法？',
      options: [
        { key: 'A', text: 'a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]' },
        { key: 'B', text: '<strong>a = [[1,2,3,4], [5,6,7,8], [9,10,11,12]]</strong>' },
        { key: 'C', text: 'a = ([1,2,3,4], [5,6,7,8])' },
        { key: 'D', text: 'a = {1,2,3,4}' }
      ],
      answer: ['B'],
      explain: {
        reason: '二维列表 = <strong>列表里套列表</strong>。每个内部的小列表就是一行。',
        diagram: 'matrix',
        diagramData: {
          rows: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]],
          highlight: null,
          title: 'a = [[1,2,3,4], [5,6,7,8], [9,10,11,12]]'
        },
        knowledge: '<h4>📚 二维列表 = 表格</h4>想象成 Excel：<br>外层列表 = 整个表格<br>每个内层列表 = 一行<br><span class="ic">len(a)</span> = 行数<br><span class="ic">len(a[0])</span> = 列数'
      }
    },
    {
      id: 'mt2', topicId: 'matrix', type: 'single', difficulty: 2,
      prompt: '下面代码中，<span class="ic">a[1][2]</span> 的值是？',
      code: 'a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]',
      options: [
        { key: 'A', text: '2' },
        { key: 'B', text: '3' },
        { key: 'C', text: '5' },
        { key: 'D', text: '<strong>6</strong>' }
      ],
      answer: ['D'],
      explain: {
        reason: '<span class="ic">a[1][2]</span> = 第 2 行（索引 1）的第 3 列（索引 2）。第 2 行是 <span class="ic">[4,5,6]</span>，第 3 个元素是 <span class="ic">6</span>。',
        diagram: 'matrix',
        diagramData: {
          rows: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
          highlight: { r: 1, c: 2 },
          title: 'a[1][2] = 6'
        },
        knowledge: '<h4>📚 访问语法</h4><span class="ic">a[行][列]</span><br>先行后列！<br>和数学里说的"第几行第几列"顺序一样。'
      }
    },
    {
      id: 'mt3', topicId: 'matrix', type: 'single', difficulty: 1,
      prompt: '访问二维列表元素的正确语法是？',
      options: [
        { key: 'A', text: 'a[行, 列]' },
        { key: 'B', text: '<strong>a[行][列]</strong>' },
        { key: 'C', text: 'a[列][行]' },
        { key: 'D', text: 'a[行+列]' }
      ],
      answer: ['B'],
      explain: {
        reason: '两个方括号连用：<span class="ic">a[行][列]</span>，第一层找"第几行"，第二层找"这一行的第几列"。',
        diagram: 'matrix',
        diagramData: {
          rows: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
          highlight: { r: 0, c: 0 },
          title: 'a[行][列]'
        },
        knowledge: '<h4>📚 为什么是"行 列"？</h4>外层列表先定位"哪一行"，内层列表再定位"这一行里的第几个"。<br>先有行，再有列，所以是 <span class="ic">a[行][列]</span>。'
      }
    },
    {
      id: 'mt4', topicId: 'matrix', type: 'single', difficulty: 2,
      prompt: '用嵌套循环遍历二维列表时，<strong>外层循环</strong>控制的是？',
      code: 'for i in range(len(a)):\n    for j in range(len(a[i])):\n        print(a[i][j])',
      options: [
        { key: 'A', text: '列' },
        { key: 'B', text: '<strong>行</strong>' },
        { key: 'C', text: '元素值' },
        { key: 'D', text: '列表长度' }
      ],
      answer: ['B'],
      explain: {
        reason: '外层循环 <span class="ic">range(len(a))</span> 在数"行"，内层 <span class="ic">range(len(a[i]))</span> 在数"列"。一行一行走，每行里再一列一列走。',
        diagram: 'matrix',
        diagramData: {
          rows: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
          highlight: null,
          showTraverse: true,
          title: '外层走行，内层走列'
        },
        knowledge: '<h4>📚 口诀：外行内列</h4>外层循环 = 行（i 走 0,1,2...）<br>内层循环 = 列（j 走 0,1,2...）<br>打印输出 <span class="ic">a[i][j]</span>：第 i 行第 j 列。'
      }
    },

    // ========== 10. 列表计算 ==========
    {
      id: 'ca1', topicId: 'calc', type: 'single', difficulty: 1,
      prompt: '下面表达式的结果是？',
      code: '[1, 2, 3] + [2, 3, 4]',
      options: [
        { key: 'A', text: '[3, 5, 7]' },
        { key: 'B', text: '<strong>[1, 2, 3, 2, 3, 4]</strong>' },
        { key: 'C', text: '[1, 2, 3, 4]' },
        { key: 'D', text: '报错' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">+</span> 号在列表里是<strong>「拼接」</strong>，不是数学加法。把两个列表<strong>首尾相连</strong>，生成一个新列表。',
        diagram: 'calc',
        diagramData: { op: '+', a: [1, 2, 3], b: [2, 3, 4], result: [1, 2, 3, 2, 3, 4] },
        knowledge: '<h4>📚 列表 + 号用法</h4>① <strong>只能列表 + 列表</strong><br>② 不会去掉重复元素（2,3 都还在）<br>③ 生成新列表，原列表不变<br>想合并去重？用 <span class="ic">set()</span> 或 <span class="ic">extend()</span>'
      }
    },
    {
      id: 'ca2', topicId: 'calc', type: 'single', difficulty: 1,
      prompt: '<span class="ic">[1, 2, 3] * 2</span> 的结果是？',
      options: [
        { key: 'A', text: '[2, 4, 6]' },
        { key: 'B', text: '<strong>[1, 2, 3, 1, 2, 3]</strong>' },
        { key: 'C', text: '[1, 1, 2, 2, 3, 3]' },
        { key: 'D', text: '报错' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">*</span> 号在列表里是<strong>「重复」</strong>，不是数学乘法。把列表<strong>复制 n 份</strong>接起来。',
        diagram: 'calc',
        diagramData: { op: '*', a: [1, 2, 3], b: 2, result: [1, 2, 3, 1, 2, 3] },
        knowledge: '<h4>📚 列表 * 号妙用</h4><span class="ic">[0] * 5</span> → [0,0,0,0,0]<br><span class="ic">[\'-\'] * 10</span> → 10 个横线<br>小技巧：<span class="ic">[\' \'] * n</span> 可以快速造 n 个空格'
      }
    },
    {
      id: 'ca3', topicId: 'calc', type: 'single', difficulty: 2,
      prompt: '关于 <span class="ic">extend()</span>，下面哪个说法<strong>不对</strong>？',
      options: [
        { key: 'A', text: '把另一个列表的元素拼接到当前列表末尾' },
        { key: 'B', text: '直接把另一个列表作为<strong>一个</strong>整体添加' },
        { key: 'C', text: '会修改原列表' },
        { key: 'D', text: '效果类似 <span class="ic">a += b</span>' }
      ],
      answer: ['B'],
      explain: {
        reason: '把另一个列表"作为整体"加进去是 <span class="ic">append()</span> 的活儿！<span class="ic">extend()</span> 是<strong>逐个</strong>加进去的。',
        diagram: 'calc',
        diagramData: { op: 'extend', a: [1, 2, 3], b: [4, 5], result: [1, 2, 3, 4, 5] },
        knowledge: '<h4>📚 append vs extend</h4><span class="ic">a = [1,2]; a.append([3,4])</span> → <span class="ic">[1,2,[3,4]]</span><br><span class="ic">a = [1,2]; a.extend([3,4])</span> → <span class="ic">[1,2,3,4]</span><br>一个塞"小盒子"进去，一个把盒子里的东西倒出来。'
      }
    },

    // ========== 11. 列表排序 ==========
    {
      id: 'so1', topicId: 'sort', type: 'single', difficulty: 1,
      prompt: '执行完代码后，列表 a 是什么？',
      code: 'a = [3, 1, 4, 2]\na.sort()\nprint(a)',
      options: [
        { key: 'A', text: '[3, 1, 4, 2]' },
        { key: 'B', text: '<strong>[1, 2, 3, 4]</strong>' },
        { key: 'C', text: '[2, 4, 1, 3]' },
        { key: 'D', text: '[4, 3, 2, 1]' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">sort()</span> 默认<strong>从小到大（升序）</strong>排，原列表 <span class="ic">[3,1,4,2]</span> → 排好变成 <span class="ic">[1,2,3,4]</span>。',
        diagram: 'sort',
        diagramData: { before: [3, 1, 4, 2], after: [1, 2, 3, 4], order: 'asc' },
        knowledge: '<h4>📚 sort() 三特点</h4>① <strong>原地排序</strong>，直接改原列表<br>② <strong>没有返回值</strong>（返回 None）<br>③ 数字、字符串都能排'
      }
    },
    {
      id: 'so2', topicId: 'sort', type: 'single', difficulty: 2,
      prompt: '<span class="ic">sort()</span> 和 <span class="ic">sorted()</span> 的核心区别是什么？',
      options: [
        { key: 'A', text: '完全一样' },
        { key: 'B', text: '<strong>sort() 原地排序，sorted() 返回新列表</strong>' },
        { key: 'C', text: 'sort() 只能排数字，sorted() 都能排' },
        { key: 'D', text: 'sorted() 速度更快' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">sort()</span> 是列表的<strong>方法</strong>，直接改自己；<span class="ic">sorted()</span> 是<strong>函数</strong>，返回排好序的新列表，原列表不动。',
        diagram: 'sort',
        diagramData: { before: [3, 1, 4, 2], after: [1, 2, 3, 4], order: 'asc', showBoth: true },
        knowledge: '<h4>📚 两种用法的区别</h4><span class="ic">a.sort()</span> → 改 a，a 变了<br><span class="ic">b = sorted(a)</span> → a 不变，b 是新排好的<br>想保留原列表？用 sorted！'
      }
    },
    {
      id: 'so3', topicId: 'sort', type: 'single', difficulty: 2,
      prompt: '怎么把列表 a 按<strong>从大到小（降序）</strong>排？',
      code: 'a = [3, 1, 4, 2]',
      options: [
        { key: 'A', text: 'a.sort()' },
        { key: 'B', text: '<strong>a.sort(reverse=True)</strong>' },
        { key: 'C', text: 'a.reverse()' },
        { key: 'D', text: 'a.desc()' }
      ],
      answer: ['B'],
      explain: {
        reason: '加 <span class="ic">reverse=True</span> 表示「<strong>反过来</strong>」，从小排变成从大排。',
        diagram: 'sort',
        diagramData: { before: [3, 1, 4, 2], after: [4, 3, 2, 1], order: 'desc' },
        knowledge: '<h4>📚 reverse 两种含义</h4><span class="ic">reverse=True</span> 是 sort 的参数，意思是"降序"<br><span class="ic">a.reverse()</span> 是一个独立方法，意思是"把列表<strong>翻转</strong>"，并不排序！<br>这两个容易搞混，记牢～'
      }
    },

    // ========== 12. 成员运算符 ==========
    {
      id: 'op1', topicId: 'operator', type: 'single', difficulty: 1,
      prompt: '<span class="ic">2 in [1, 2, 3, 4]</span> 的结果是？',
      options: [
        { key: 'A', text: '<strong>True</strong>' },
        { key: 'B', text: 'False' },
        { key: 'C', text: '1' },
        { key: 'D', text: '2' }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">in</span> 用来判断"某个东西<strong>是不是在</strong>列表里"。2 确实在 <span class="ic">[1,2,3,4]</span> 里，所以返回 <span class="ic">True</span>（真）。',
        diagram: 'operator',
        diagramData: { list: [1, 2, 3, 4], target: 2, op: 'in', result: true },
        knowledge: '<h4>📚 in 运算符</h4>本质就是"在不在"的问题。<br>结果只有两个：<span class="ic">True</span>（在）或 <span class="ic">False</span>（不在）<br>字符串也能用：<span class="ic">"a" in "abc"</span> → True'
      }
    },
    {
      id: 'op2', topicId: 'operator', type: 'single', difficulty: 1,
      prompt: '<span class="ic">5 not in [1, 2, 3, 4]</span> 的结果是？',
      options: [
        { key: 'A', text: '<strong>True</strong>' },
        { key: 'B', text: 'False' },
        { key: 'C', text: '5' },
        { key: 'D', text: '报错' }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">not in</span> 表示"不在"。5 确实不在 <span class="ic">[1,2,3,4]</span> 里，所以返回 <span class="ic">True</span>。',
        diagram: 'operator',
        diagramData: { list: [1, 2, 3, 4], target: 5, op: 'not in', result: true },
        knowledge: '<h4>📚 in 和 not in 是"反义兄弟"</h4><span class="ic">x in a</span> 等价于 <span class="ic">not (x not in a)</span><br>两个用哪个都行，看哪个更符合你的语意。'
      }
    },
    {
      id: 'op3', topicId: 'operator', type: 'single', difficulty: 2,
      prompt: '<span class="ic">\'a\' in [\'a\', \'b\', \'c\']</span> 的结果是？',
      options: [
        { key: 'A', text: '<strong>True</strong>' },
        { key: 'B', text: 'False' },
        { key: 'C', text: '\'a\'' },
        { key: 'D', text: '报错' }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">\'a\'</span> 在列表 <span class="ic">[\'a\',\'b\',\'c\']</span> 里能找到，返回 <span class="ic">True</span>。<span class="ic">in</span> 不只能找数字，<strong>字符串、布尔都行</strong>。',
        diagram: 'operator',
        diagramData: { list: ['a', 'b', 'c'], target: 'a', op: 'in', result: true, listType: 'str' },
        knowledge: '<h4>📚 in 的常见用途</h4>① 权限判断：<span class="ic">if user in admins: ...</span><br>② 黑名单过滤：<span class="ic">if word in blacklist: ...</span><br>③ 字符检查：<span class="ic">if " " in text: ...</span>'
      }
    },

    // ========== 13. 常用内置函数 ==========
    {
      id: 'bi1', topicId: 'builtin', type: 'single', difficulty: 1,
      prompt: '<span class="ic">len([1, 2, 3, 4, 5])</span> 的结果是？',
      options: [
        { key: 'A', text: '4' },
        { key: 'B', text: '<strong>5</strong>' },
        { key: 'C', text: '6' },
        { key: 'D', text: '1' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">len()</span> 返回列表<strong>元素的个数</strong>。<span class="ic">[1,2,3,4,5]</span> 里有 5 个数字，所以是 5。',
        diagram: 'builtin',
        diagramData: { list: [1, 2, 3, 4, 5], label: 'len()', value: 5 },
        knowledge: '<h4>📚 len() 多用途</h4>字符串、列表、元组、字典都能用：<br><span class="ic">len("hello")</span> → 5（字符数）<br><span class="ic">len([1,2,3])</span> → 3（元素数）<br><span class="ic">len({"a":1})</span> → 1（键值对数）'
      }
    },
    {
      id: 'bi2', topicId: 'builtin', type: 'single', difficulty: 1,
      prompt: '<span class="ic">sum([1, 2, 3, 4])</span> 的结果是？',
      options: [
        { key: 'A', text: '<strong>10</strong>' },
        { key: 'B', text: '4' },
        { key: 'C', text: '\'1234\'' },
        { key: 'D', text: '[1, 2, 3, 4]' }
      ],
      answer: ['A'],
      explain: {
        reason: '<span class="ic">sum()</span> 把列表里所有数字<strong>加起来</strong>，1+2+3+4 = 10。',
        diagram: 'builtin',
        diagramData: { list: [1, 2, 3, 4], label: 'sum()', value: 10 },
        knowledge: '<h4>📚 sum() 注意</h4>① 列表里必须是<strong>数字</strong>，不能是字符串<br>② 还能指定"起始值"：<br><span class="ic">sum([1,2,3], 10)</span> → 16（10 + 1+2+3）'
      }
    },
    {
      id: 'bi3', topicId: 'builtin', type: 'single', difficulty: 2,
      prompt: '执行下面代码，<span class="ic">a.index(3)</span> 的结果是？',
      code: 'a = [12, 2, 3, 2, 1, 2, 2, 3]\nprint(a.index(3))',
      options: [
        { key: 'A', text: '1' },
        { key: 'B', text: '<strong>2</strong>' },
        { key: 'C', text: '3' },
        { key: 'D', text: '7' }
      ],
      answer: ['B'],
      explain: {
        reason: '<span class="ic">index(x)</span> 返回 x <strong>第一次出现</strong>的位置（索引）。3 在 a 里出现两次，第一次是在索引 2。',
        diagram: 'builtin',
        diagramData: { list: [12, 2, 3, 2, 1, 2, 2, 3], highlightValue: 3, label: 'index(3) → 2', value: 2 },
        knowledge: '<h4>📚 index() vs count()</h4><span class="ic">a.index(3)</span> → 2（第一次出现的<strong>位置</strong>）<br><span class="ic">a.count(3)</span> → 2（出现了 <strong>2 次</strong>）<br>如果要找的值不存在，<span class="ic">index()</span> 会<strong>报错</strong>！'
      }
    }
  ];

  // ============ 工具：根据 topic 拿题 ============
  function getQuestionsByTopic(topicId) {
    if (!topicId || topicId === 'all') return QUESTIONS.slice();
    return QUESTIONS.filter(q => q.topicId === topicId);
  }

  // ============ 进度持久化 ============
  const STORAGE_KEY = 'py_list_quiz_progress_v1';
  const TEACHER_SESSION_KEY = 'py_list_quiz_teacher_session';   // sessionStorage
  const TEACHER_LIST_KEY = 'py_list_quiz_teacher_list_v1';       // localStorage
  const TEACHER_PASSWORD = 'wlin1997';                            // 老师后台密码（在 data.js 顶部即可改）
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { byTopic: {}, wrongList: [] };
      return JSON.parse(raw);
    } catch { return { byTopic: {}, wrongList: [] }; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); return true; }
    catch (err) { console.error('localStorage 保存失败:', err); return false; }
  }

  // 老师后台数据：已收录的学生报告
  function loadTeacherList() {
    try {
      const raw = localStorage.getItem(TEACHER_LIST_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch { return []; }
  }
  function saveTeacherList(arr) {
    try { localStorage.setItem(TEACHER_LIST_KEY, JSON.stringify(arr)); return true; }
    catch (err) { console.error('老师列表保存失败:', err); return false; }
  }
  // 老师会话：本次浏览器有效，关掉就退出
  function isTeacherLoggedIn() {
    try { return sessionStorage.getItem(TEACHER_SESSION_KEY) === '1'; } catch { return false; }
  }
  function setTeacherLoggedIn(ok) {
    try {
      if (ok) sessionStorage.setItem(TEACHER_SESSION_KEY, '1');
      else sessionStorage.removeItem(TEACHER_SESSION_KEY);
    } catch {}
  }

  // 编码 / 解码成绩单
  // 数据比较短，用简单的 base64 即可（前缀 PYQ1 方便识别）
  function encodeReport(report) {
    const json = JSON.stringify(report);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return 'PYQ1:' + b64;
  }
  function decodeReport(code) {
    if (!code) return null;
    code = code.trim();
    if (code.startsWith('PYQ1:')) code = code.slice(5);
    try {
      const json = decodeURIComponent(escape(atob(code)));
      const obj = JSON.parse(json);
      if (typeof obj !== 'object' || !obj.v) throw new Error('格式错误');
      return obj;
    } catch (err) {
      console.warn('解码失败:', err);
      return null;
    }
  }

  // 暴露到全局
  window.PyListApp = window.PyListApp || {};
  window.PyListApp.TOPICS = TOPICS;
  window.PyListApp.QUESTIONS = QUESTIONS;
  window.PyListApp.getQuestionsByTopic = getQuestionsByTopic;
  window.PyListApp.loadProgress = loadProgress;
  window.PyListApp.saveProgress = saveProgress;
  window.PyListApp.TEACHER_PASSWORD = TEACHER_PASSWORD;
  window.PyListApp.loadTeacherList = loadTeacherList;
  window.PyListApp.saveTeacherList = saveTeacherList;
  window.PyListApp.isTeacherLoggedIn = isTeacherLoggedIn;
  window.PyListApp.setTeacherLoggedIn = setTeacherLoggedIn;
  window.PyListApp.encodeReport = encodeReport;
  window.PyListApp.decodeReport = decodeReport;
})();
