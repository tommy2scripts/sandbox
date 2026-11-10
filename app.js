const DATA_FILES = {
  threads: 'data/threads.json',
  attention: 'data/attention.json',
  activity: 'data/activity.json',
  health: 'data/health.json',
  accounts: 'data/accounts.json',
  spending: 'data/spending.json',
  week: 'data/week.json',
};

const PT = 'America/Los_Angeles';
const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZone: PT, timeZoneName: 'short',
});
const dayFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});
const dayTimeFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZone: PT, timeZoneName: 'short',
});
const dateOnlyFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});
const moneyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
});

const KIND_LABELS = {
  harness: 'Harness',
  board: 'Board',
  job: 'Jobs',
  money: 'Money',
  flip: 'Flip hunt',
};

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (name === 'class') node.className = value;
    else if (name === 'text') node.textContent = value;
    else node.setAttribute(name, value);
  }
  append(node, children);
  return node;
}

function append(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

function isDateOnly(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso);
}

function dateOnlyDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function parseInstant(iso) {
  return isDateOnly(iso) ? dateOnlyDate(iso) : new Date(iso);
}

function formatStamp(iso) {
  return dateTimeFmt.format(parseInstant(iso));
}

function formatDeadline(iso) {
  if (isDateOnly(iso)) return dayFmt.format(dateOnlyDate(iso));
  return dayTimeFmt.format(new Date(iso)).replace(' AM', 'am').replace(' PM', 'pm');
}

function formatActivityTime(iso) {
  if (isDateOnly(iso)) return dateOnlyFmt.format(dateOnlyDate(iso));
  return dateTimeFmt.format(new Date(iso)).replace(' AM', 'am').replace(' PM', 'pm');
}

function deadlineValue(iso) {
  return isDateOnly(iso) ? Date.parse(iso + 'T23:59:59-08:00') : Date.parse(iso);
}

function activityValue(iso) {
  return isDateOnly(iso) ? Date.parse(iso + 'T00:00:00-08:00') : Date.parse(iso);
}

function formatMoney(amount) {
  return moneyFmt.format(amount);
}

function toneClass(tone) {
  return tone === 'good' || tone === 'warn' || tone === 'accent' ? tone : 'neutral';
}

function kindLabel(kind) {
  return KIND_LABELS[kind] || kind;
}

function pill(text, tone) {
  return el('span', { class: 'pill ' + toneClass(tone) }, text);
}

function boardSection(title, options = {}, ...children) {
  const { wide = false, hint = null } = options;
  return el('section', wide ? { class: 'wide' } : {},
    el('h2', {}, title),
    hint ? el('p', { class: 'section-hint' }, hint) : null,
    ...children,
  );
}

function renderHealth(health) {
  const strip = el('div', { class: 'health-strip' });
  for (const item of health.items) {
    strip.append(el('div', { class: 'health-cell' },
      el('div', { class: 'health-head' },
        el('span', { class: 'dot ' + toneClass(item.state), 'aria-hidden': 'true' }),
        el('span', {}, item.label),
      ),
      el('p', { class: 'health-value ' + toneClass(item.state) }, item.value),
      el('p', { class: 'health-detail' }, item.detail),
    ));
  }
  return boardSection('Harness health', {
    wide: true,
    hint: 'Snapshot captured ' + formatStamp(health.capturedAt) + ' from the orchestrator API.',
  }, strip);
}

function renderThreads(data) {
  const grid = el('div', { class: 'thread-grid' });
  for (const thread of data.threads) {
    grid.append(el('article', { class: 'thread-card' },
      el('div', { class: 'thread-head' },
        el('h3', {}, thread.title),
        pill(thread.status, thread.tone),
      ),
      el('p', { class: 'thread-detail' }, thread.detail),
      el('p', { class: 'thread-next' }, el('strong', {}, 'Next: '), thread.nextAction),
      el('p', { class: 'meta' }, 'Owner: ' + thread.owner),
    ));
  }
  return boardSection('Open threads', { wide: true }, grid);
}

function renderAttention(data) {
  const items = [...data.items].sort((a, b) => deadlineValue(a.deadline) - deadlineValue(b.deadline));
  const list = el('ul', { class: 'attention-list' });
  for (const item of items) {
    list.append(el('li', { class: 'attention-item' },
      el('div', { class: 'due' }, el('time', { datetime: item.deadline }, formatDeadline(item.deadline))),
      el('div', { class: 'attention-body' },
        el('div', { class: 'attention-title' },
          el('h3', {}, item.title),
          pill(kindLabel(item.kind), 'neutral'),
        ),
        el('p', {}, item.detail),
      ),
    ));
  }
  return boardSection('Needs your call', { wide: true, hint: 'Sorted by deadline — earliest first.' }, list);
}

function renderActivity(data) {
  const items = [...data.items].sort((a, b) => activityValue(b.at) - activityValue(a.at));
  const list = el('ul', { class: 'activity-list' });
  for (const item of items) {
    const text = item.link
      ? el('a', { href: item.link, target: '_blank', rel: 'noopener' }, item.text)
      : item.text;
    list.append(el('li', { class: 'activity-item' },
      el('time', { class: 'activity-time', datetime: item.at }, formatActivityTime(item.at)),
      el('div', { class: 'activity-body' },
        el('span', { class: 'tag' }, kindLabel(item.kind)),
        el('span', { class: 'activity-text' }, text),
      ),
    ));
  }
  return boardSection('Activity feed', { wide: true, hint: 'Latest events, newest first.' }, list);
}

function row(name, amount, detail) {
  return el('li', { class: 'row' },
    el('div', { class: 'row-main' },
      el('span', {}, name),
      detail ? el('span', { class: 'row-detail' }, detail) : null,
    ),
    el('span', { class: 'num' }, amount),
  );
}

function renderAccounts(data) {
  const accounts = el('ul', { class: 'rows' });
  for (const account of data.accounts) {
    accounts.append(row(account.name, formatMoney(account.balance), account.detail));
  }
  const bills = el('ul', { class: 'rows' });
  for (const bill of data.bills) {
    bills.append(row(bill.name, formatMoney(bill.amount), bill.detail));
  }
  return boardSection('Accounts & bills', {},
    el('h3', {}, 'Accounts'), accounts,
    el('h3', {}, 'Bills'), bills,
    el('p', { class: 'meta' }, data.note),
  );
}

function renderSpending(data) {
  const total = data.categories.reduce((sum, category) => sum + category.amount, 0);
  const list = el('ul', { class: 'rows' });
  for (const category of data.categories) {
    list.append(el('li', { class: 'row' },
      el('span', {}, category.name),
      el('span', { class: 'num' }, formatMoney(category.amount)),
    ));
  }
  list.append(el('li', { class: 'row total' },
    el('span', {}, 'Total'),
    el('span', { class: 'num' }, formatMoney(total)),
  ));
  return boardSection('30-day spending', { hint: data.period + '.' }, list);
}

function renderWeek(data) {
  const list = el('ul', { class: 'week-list' });
  for (const event of data.events) {
    list.append(el('li', { class: 'week-item' },
      el('span', { class: 'week-when' }, event.when),
      el('div', {},
        el('strong', {}, event.title),
        el('span', { class: 'week-detail' }, ' — ' + event.detail),
      ),
    ));
  }
  return boardSection('Week ahead', {}, list);
}

function renderMeta(threads) {
  const line = document.getElementById('snapshot-line');
  if (line) {
    line.textContent = 'Tommy Tran — one board for the open threads. Data-driven snapshot refreshed '
      + formatStamp(threads.updatedAt) + '.';
  }
}

function renderBoard(data) {
  renderMeta(data.threads);
  const board = document.getElementById('board');
  board.replaceChildren(
    renderHealth(data.health),
    renderThreads(data.threads),
    renderAttention(data.attention),
    renderActivity(data.activity),
    renderAccounts(data.accounts),
    renderSpending(data.spending),
    renderWeek(data.week),
  );
}

function renderError(error) {
  const board = document.getElementById('board');
  board.replaceChildren(el('section', { class: 'wide' },
    el('h2', {}, 'Board failed to load'),
    el('p', {}, 'The board data could not be read. Serve this folder from a static host — see README.md — and reload.'),
    el('pre', { class: 'error-detail' }, String(error)),
  ));
}

async function loadBoard() {
  try {
    const entries = await Promise.all(Object.entries(DATA_FILES).map(async ([key, url]) => {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(url + ' returned HTTP ' + response.status);
      return [key, await response.json()];
    }));
    renderBoard(Object.fromEntries(entries));
  } catch (error) {
    renderError(error);
  }
}

loadBoard();
