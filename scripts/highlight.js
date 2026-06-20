// 极简 Python 语法高亮（仅用于答题页代码块）
(function () {
  const KW = new Set([
    'for', 'in', 'if', 'else', 'elif', 'while', 'def', 'return',
    'import', 'from', 'as', 'class', 'True', 'False', 'None',
    'and', 'or', 'not', 'is', 'with', 'try', 'except', 'lambda',
    'pass', 'break', 'continue', 'global', 'nonlocal', 'yield', 'del'
  ]);
  const BUILTIN = new Set([
    'print', 'len', 'range', 'list', 'str', 'int', 'float', 'bool',
    'sum', 'max', 'min', 'sorted', 'reversed', 'enumerate',
    'append', 'insert', 'pop', 'remove', 'clear', 'sort', 'extend',
    'count', 'index', 'input', 'open', 'type', 'map', 'filter'
  ]);

  // 简单转义
  function esc(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
  }

  /**
   * 极简 token 化 + 着色：
   * 1. 抽出注释和字符串（占位）
   * 2. 对剩余代码按单词 / 数字 / 操作符分类
   */
  function highlight(code) {
    if (!code) return '';
    // 抽出时把 \n 也保留
    const slots = [];
    const PHS = '\u0001'; // placeholder char
    let masked = code;

    // 1) 注释：以 # 开头到行尾
    masked = masked.replace(/(#[^\n]*)/g, (m) => {
      slots.push(`<span class="cm">${esc(m)}</span>`);
      return PHS + (slots.length - 1) + PHS;
    });

    // 2) 字符串：三引号/单引号/双引号
    masked = masked.replace(/("""[\s\S]*?"""|'[^'\n]*'|"[^"\n]*")/g, (m) => {
      slots.push(`<span class="str">${esc(m)}</span>`);
      return PHS + (slots.length - 1) + PHS;
    });

    // 3) 数字（含小数 / 负号）
    masked = masked.replace(/\b(-?\d+(\.\d+)?)\b/g, (m) => {
      slots.push(`<span class="num">${esc(m)}</span>`);
      return PHS + (slots.length - 1) + PHS;
    });

    // 4) 标识符（关键字 / 内置函数 / 普通变量）
    masked = masked.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (m) => {
      if (KW.has(m)) {
        slots.push(`<span class="kw">${esc(m)}</span>`);
      } else if (BUILTIN.has(m)) {
        slots.push(`<span class="fn">${esc(m)}</span>`);
      } else {
        return esc(m);
      }
      return PHS + (slots.length - 1) + PHS;
    });

    // 5) 操作符（不高亮也保留转义）
    masked = esc(masked);

    // 还原占位符
    masked = masked.replace(new RegExp(`${PHS}(\\d+)${PHS}`, 'g'), (_, idx) => {
      return slots[parseInt(idx, 10)];
    });

    return masked;
  }

  window.pyHighlight = highlight;
})();
