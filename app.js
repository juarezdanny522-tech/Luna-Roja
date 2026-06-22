/* =============================================
   LUNA ROJA · Economía Estudiantil v2.1
   ============================================= */

(() => {
  'use strict';

  // ===== Constantes =====
  const STORAGE_KEY = 'lunaRoja_v2';
  const APP_VERSION = '2.1.0';
  const CREATION_DATE = '22 de junio de 2026';
  const DESIGNER = 'Danny Juarez';
  const DESIGNER_ROLE = 'Estudiante de primer año en Desarrollo de Software';

  // ===== Categorías predeterminadas =====
  const DEFAULT_CATEGORIES = [
    { id: 'comida',          emoji: '🍔', name: 'Comida',          keywords: ['comi','almuerzo','cena','desayuno','comida','snack','bebida','cafe','café','restaurant','restaurante','pizza','taco','hamburguesa','pollo','arroz','fresa','fruta','agua','jugo','helado'], isDefault: true },
    { id: 'compra',          emoji: '🛒', name: 'Compra',          keywords: ['compre','compré','compra','tienda','supermercado','mercado','camisa','pantalon','pantalón','zapatos','ropa','libro','cuaderno','producto','regalo','playera','tenis'], isDefault: true },
    { id: 'transporte',      emoji: '🚌', name: 'Transporte',      keywords: ['bus','autobus','autobús','taxi','uber','gasolina','combustible','transporte','pasaje','metro','tren','camioneta','moto','peaje','estacionamiento'], isDefault: true },
    { id: 'estudios',        emoji: '📚', name: 'Estudios',        keywords: ['instituto','universidad','colegio','estudio','libro','cuaderno','lapiz','lápiz','cuota','matricula','matrícula','inscripcion','inscripción','examen','impresion','impresión','copia','fotocopia','utiles','útiles','mochila'], isDefault: true },
    { id: 'entretenimiento', emoji: '🎮', name: 'Diversión',       keywords: ['cine','pelicula','película','juego','concierto','salida','fiesta','diversion','diversión','netflix','spotify','membresia','membresía','bar','antro'], isDefault: true },
    { id: 'salud',           emoji: '💊', name: 'Salud',           keywords: ['medicina','medicamento','farmacia','doctor','consulta','dentista','analisis','análisis','examen medico','salud','gym','gimnasio'], isDefault: true },
    { id: 'servicios',       emoji: '📱', name: 'Servicios',       keywords: ['internet','telefono','teléfono','celular','recarga','plan','luz','agua','gas','renta','alquiler','suscripcion','suscripción','app'], isDefault: true },
    { id: 'otros',           emoji: '📦', name: 'Otros',           keywords: [], isDefault: true }
  ];

  // ===== Paletas de colores =====
  const ACCENT_PALETTES = {
    red:      { 1:'#ef4444', 2:'#dc2626', 3:'#b91c1c', 4:'#7f1d1d', 5:'#450a0a', shadow:'rgba(220, 38, 38, 0.35)' },
    crimson:  { 1:'#f43f5e', 2:'#e11d48', 3:'#be123c', 4:'#881337', 5:'#4c0519', shadow:'rgba(225, 29, 72, 0.35)' },
    burgundy: { 1:'#9f1239', 2:'#881337', 3:'#701434', 4:'#4c0519', 5:'#2c0510', shadow:'rgba(136, 19, 55, 0.35)' },
    orange:   { 1:'#f97316', 2:'#ea580c', 3:'#c2410c', 4:'#7c2d12', 5:'#431407', shadow:'rgba(234, 88, 12, 0.35)' }
  };

  // 5 niveles de tamaño (de MUY pequeño a MUY grande)
  const FONT_SCALES = { xsmall: 0.8, small: 0.9, normal: 1, large: 1.15, xlarge: 1.3 };
  const UI_SCALES   = { xcompact: 0.75, compact: 0.85, normal: 1, comfortable: 1.2, xcomfortable: 1.4 };

  // ===== Estado por defecto =====
  const defaultState = {
    initialized: false,
    setupDate: null,
    userName: 'Dani travieso',
    currency: '$',
    weeklyBudget: 0,
    weeks: {},
    currentWeekKey: null,
    settings: {
      fontSize: 'normal',
      uiDensity: 'normal',
      accentColor: 'red',
      animations: true
    },
    customCategories: []   // Categorías agregadas/editadas por el usuario
  };

  // ===== Storage =====
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      const merged = structuredClone(defaultState);
      Object.assign(merged, parsed);
      merged.settings = { ...defaultState.settings, ...(parsed.settings || {}) };
      merged.customCategories = Array.isArray(parsed.customCategories) ? parsed.customCategories : [];
      return merged;
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('No se pudo guardar:', e);
      showToast('Error al guardar los datos', true);
    }
  }

  let state = loadState();

  // ===== Aplicar ajustes visuales =====
  function applySettings() {
    const s = state.settings || defaultState.settings;

    document.documentElement.style.setProperty('--font-scale', FONT_SCALES[s.fontSize] ?? 1);
    document.documentElement.style.setProperty('--ui-scale', UI_SCALES[s.uiDensity] ?? 1);

    const palette = ACCENT_PALETTES[s.accentColor] || ACCENT_PALETTES.red;
    document.documentElement.style.setProperty('--accent-1', palette[1]);
    document.documentElement.style.setProperty('--accent-2', palette[2]);
    document.documentElement.style.setProperty('--accent-3', palette[3]);
    document.documentElement.style.setProperty('--accent-4', palette[4]);
    document.documentElement.style.setProperty('--accent-5', palette[5]);
    document.documentElement.style.setProperty('--accent-shadow', palette.shadow);

    document.body.classList.toggle('no-animations', !s.animations);
  }

  // ===== Categorías combinadas =====
  // AHORA TODAS las categorías son editables (defaults + custom)
  function getAllCategories() {
    const customs = (state.customCategories || []).map(c => ({ ...c, isDefault: false }));
    return [...DEFAULT_CATEGORIES.map(c => ({ ...c })), ...customs];
  }

  function getCategoryMeta(key) {
    const all = getAllCategories();
    return all.find(c => c.id === key) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  }

  function detectCategory(description) {
    if (!description) return 'otros';
    const text = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const cat of getAllCategories()) {
      for (const kw of (cat.keywords || [])) {
        if (text.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) return cat.id;
      }
    }
    return 'otros';
  }

  // ===== Utilidades de fecha =====
  function getMondayOf(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }

  function formatDateShort(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  function formatDateISO(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getWeekKey(date = new Date()) {
    return formatDateISO(getMondayOf(date));
  }

  function getDayName(date = new Date()) {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return days[new Date(date).getDay()];
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 6)  return 'Buenas noches';
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  // ===== Estado / semana actual =====
  function ensureCurrentWeek() {
    const key = getWeekKey();
    if (!state.weeks[key]) {
      state.weeks[key] = {
        startDate: key,
        budget: state.weeklyBudget,
        expenses: [],
        closed: false
      };
    }
    state.currentWeekKey = key;
    state.weeks[key].budget = state.weeklyBudget;
    saveState();
    return state.weeks[key];
  }

  function getCurrentWeek() {
    if (!state.currentWeekKey || !state.weeks[state.currentWeekKey]) {
      return ensureCurrentWeek();
    }
    return state.weeks[state.currentWeekKey];
  }

  function getWeekExpensesTotal(week) {
    return week.expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  function getWeekExpensesByCategory(week) {
    const totals = {};
    for (const exp of week.expenses) {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    }
    return totals;
  }

  // ===== Navegación entre pantallas =====
  function showScreen(name) {
    if (!name) return;
    // Quitar active de todas
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Activar la solicitada
    const target = document.getElementById(`screen-${name}`);
    if (target) {
      target.classList.add('active');
    } else {
      console.warn('Pantalla no encontrada:', name);
      return;
    }

    // Renderizar contenido según la pantalla
    if (name === 'home')     renderHome();
    if (name === 'add')      renderAddScreen();
    if (name === 'summary')  renderSummary();
    if (name === 'history')  renderHistory();

    // Scroll al inicio
    const scrollable = target.querySelector('.home-content, .add-content, .summary-content, .history-content');
    if (scrollable) scrollable.scrollTop = 0;
  }

  // ===== Render: Home =====
  function renderHome() {
    if (!state.initialized) {
      showScreen('welcome');
      return;
    }

    const week = getCurrentWeek();
    const spent = getWeekExpensesTotal(week);
    const available = week.budget - spent;
    const percent = week.budget > 0 ? Math.min(100, (spent / week.budget) * 100) : 0;

    const greetingEl = document.getElementById('greeting');
    const nameEl = document.getElementById('userNameDisplay');
    nameEl.textContent = state.userName || 'Dani travieso';
    greetingEl.textContent = getGreeting();

    const mondayOfWeek = new Date(week.startDate + 'T00:00:00');
    const sundayOfWeek = new Date(mondayOfWeek);
    sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
    document.getElementById('weekRange').textContent =
      `${formatDate(mondayOfWeek)} → ${formatDate(sundayOfWeek)}`;

    document.getElementById('availableAmount').textContent = formatMoney(available);
    document.getElementById('spentAmount').textContent = `${formatMoney(spent)} gastados`;
    document.getElementById('budgetTotal').textContent = `de ${formatMoney(week.budget)}`;

    const fill = document.getElementById('progressFill');
    fill.style.width = `${percent}%`;
    fill.classList.remove('warning', 'danger');
    if (percent >= 100) fill.classList.add('danger');
    else if (percent >= 80) fill.classList.add('warning');

    const status = document.getElementById('progressStatus');
    if (week.budget === 0) status.textContent = 'Configura tu presupuesto en Ajustes';
    else if (spent === 0) status.textContent = 'Aún no has gastado esta semana';
    else if (available < 0) status.textContent = `⚠️ Te pasaste por ${formatMoney(Math.abs(available))}`;
    else if (percent >= 80) status.textContent = '⚡ Cuidado, casi te quedas sin presupuesto';
    else status.textContent = `Te quedan ${formatMoney(available)} para terminar la semana`;

    const today = formatDateISO(new Date());
    document.getElementById('todayDate').textContent = getDayName().toUpperCase();

    const todayExpenses = week.expenses
      .filter(e => e.date === today)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const todayContainer = document.getElementById('todayExpenses');
    if (todayExpenses.length === 0) {
      todayContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🌙</div>
          <p>Aún no registras gastos hoy</p>
          <span>Toca el botón + para empezar</span>
        </div>
      `;
    } else {
      todayContainer.innerHTML = todayExpenses.map(exp => renderExpenseItem(exp)).join('');
      bindExpenseDeleteButtons(todayContainer);
    }
  }

  // ===== Render: Add Expense =====
  function renderAddScreen() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = getAllCategories().map(cat => `
      <button type="button" class="cat-btn" data-cat="${cat.id}">
        <span class="cat-emoji">${cat.emoji}</span>
        <span class="cat-label">${cat.name}</span>
      </button>
    `).join('');
  }

  function renderExpenseItem(exp) {
    const meta = getCategoryMeta(exp.category);
    return `
      <div class="expense-item">
        <div class="expense-icon">${meta.emoji}</div>
        <div class="expense-info">
          <div class="expense-desc">${escapeHtml(exp.description)}</div>
          <div class="expense-meta">
            <span>${meta.name || meta.label}</span>
            <span>•</span>
            <span>${formatTime(exp.createdAt)}</span>
          </div>
        </div>
        <div class="expense-amount">${formatMoney(exp.amount)}</div>
        <button class="expense-delete" data-id="${exp.id}" aria-label="Eliminar">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    `;
  }

  function bindExpenseDeleteButtons(container) {
    container.querySelectorAll('.expense-delete').forEach(btn => {
      btn.addEventListener('click', () => handleDeleteExpense(btn.dataset.id));
    });
  }

  // ===== Render: Summary =====
  function renderSummary() {
    const week = getCurrentWeek();
    const spent = getWeekExpensesTotal(week);
    const available = week.budget - spent;
    const percent = week.budget > 0 ? Math.min(100, (spent / week.budget) * 100) : 0;
    const byCat = getWeekExpensesByCategory(week);

    const isFriday = getDayName() === 'viernes';
    const isWeekend = ['sábado', 'domingo'].includes(getDayName());

    let maxDay = null, maxDayAmount = 0;
    const dayTotals = {};
    for (const exp of week.expenses) {
      dayTotals[exp.date] = (dayTotals[exp.date] || 0) + exp.amount;
    }
    for (const [day, total] of Object.entries(dayTotals)) {
      if (total > maxDayAmount) {
        maxDayAmount = total;
        maxDay = day;
      }
    }

    const daysPassed = getDaysPassedThisWeek();
    const avgDaily = daysPassed > 0 ? spent / daysPassed : 0;

    const startDate = new Date(week.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    let html = '';

    html += `
      <div class="summary-hero glass">
        <div class="friday-badge">
          ${isFriday ? '🌙 ¡ES VIERNES!' : (isWeekend ? '🌅 FIN DE SEMANA' : '📊 EN CURSO')}
        </div>
        <p class="budget-label" style="font-size:0.8125rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-top:var(--s-1);">
          ${available >= 0 ? 'Te queda' : 'Te pasaste por'}
        </p>
        <div class="summary-amount ${available >= 0 ? 'positive' : 'negative'}">
          ${formatMoney(Math.abs(available))}
        </div>
        <p class="summary-subtitle">
          ${formatDate(week.startDate)} → ${formatDate(endDate)}
        </p>
        <div class="progress-bar" style="margin-top:var(--s-4);">
          <div class="progress-fill ${percent >= 100 ? 'danger' : percent >= 80 ? 'warning' : ''}" style="width:${percent}%"></div>
        </div>
        <p style="font-size:0.8125rem;color:var(--text-secondary);margin-top:var(--s-2);">
          ${formatMoney(spent)} de ${formatMoney(week.budget)} · ${percent.toFixed(0)}%
        </p>
      </div>
    `;

    html += `
      <div class="summary-stats">
        <div class="stat-card glass">
          <div class="stat-label">Total gastado</div>
          <div class="stat-value red">${formatMoney(spent)}</div>
        </div>
        <div class="stat-card glass">
          <div class="stat-label">Presupuesto</div>
          <div class="stat-value">${formatMoney(week.budget)}</div>
        </div>
        <div class="stat-card glass">
          <div class="stat-label">Promedio diario</div>
          <div class="stat-value">${formatMoney(avgDaily)}</div>
        </div>
        <div class="stat-card glass">
          <div class="stat-label">Gastos registrados</div>
          <div class="stat-value">${week.expenses.length}</div>
        </div>
      </div>
    `;

    if (week.expenses.length > 0) {
      html += `<div class="summary-breakdown glass"><h3 class="breakdown-title">¿En qué gastaste?</h3>`;

      const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
      const maxCatAmount = sortedCats.length > 0 ? sortedCats[0][1] : 1;

      for (const [catKey, amount] of sortedCats) {
        const meta = getCategoryMeta(catKey);
        const pct = (amount / maxCatAmount) * 100;
        const pctOfTotal = (amount / spent) * 100;
        html += `
          <div class="breakdown-item">
            <div class="breakdown-row">
              <div class="breakdown-label">
                <span class="breakdown-emoji">${meta.emoji}</span>
                <span>${meta.name || meta.label}</span>
              </div>
              <div class="breakdown-value">${formatMoney(amount)}</div>
            </div>
            <div class="breakdown-bar">
              <div class="breakdown-bar-fill" style="width:${pct}%"></div>
            </div>
            <div style="font-size:0.6875rem;color:var(--text-muted);margin-top:var(--s-1);text-align:right;">
              ${pctOfTotal.toFixed(1)}% del total
            </div>
          </div>
        `;
      }
      html += `</div>`;
    }

    if (spent > 0) {
      const tips = generateTips(available, spent, week.budget, byCat);
      html += `
        <div class="summary-tips">
          <h4>💡 Análisis de tu semana</h4>
          <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      `;
    }

    document.getElementById('summaryContent').innerHTML = html;
  }

  function generateTips(available, spent, budget, byCat) {
    const tips = [];
    if (budget === 0) tips.push('Configura un presupuesto semanal en Ajustes para empezar.');
    if (available < 0) {
      tips.push(`Te pasaste por ${formatMoney(Math.abs(available))}. Intenta reducir gastos no esenciales la próxima semana.`);
    } else if (available > budget * 0.3) {
      tips.push(`¡Excelente! Te sobrará bastante dinero.`);
    } else if (available >= 0) {
      tips.push(`Vas bien con tu presupuesto. Mantén el ritmo hasta el viernes.`);
    }

    const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
      const topCat = sortedCats[0];
      const meta = getCategoryMeta(topCat[0]);
      if (topCat[1] / spent > 0.4) {
        tips.push(`${meta.emoji} Tu mayor gasto fue en <strong>${meta.name}</strong> (${((topCat[1]/spent)*100).toFixed(0)}% del total).`);
      }
    }
    if (spent === 0) tips.push('Aún no registras gastos esta semana. ¡Empieza a registrar!');
    return tips.slice(0, 4);
  }

  function getDaysPassedThisWeek() {
    const today = new Date();
    const monday = getMondayOf();
    const diff = Math.floor((today - monday) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(7, Math.max(1, diff));
  }

  // ===== Render: History =====
  function renderHistory() {
    const container = document.getElementById('historyContent');
    const weeks = Object.values(state.weeks).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    if (weeks.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="margin-top:var(--s-10);">
          <div class="empty-icon">📜</div>
          <p>Sin historial aún</p>
          <span>Tus semanas aparecerán aquí</span>
        </div>
      `;
      return;
    }

    let html = '<h3 style="font-size:1rem;font-weight:700;margin-bottom:var(--s-1);">Tus semanas</h3>';
    html += '<p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:var(--s-3);">Toca una semana para ver detalles</p>';

    for (const week of weeks) {
      const spent = getWeekExpensesTotal(week);
      const available = week.budget - spent;
      const startDate = new Date(week.startDate + 'T00:00:00');
      const monthName = startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      html += `
        <div class="history-week glass" data-week="${week.startDate}">
          <div class="history-week-header">
            <div>
              <div class="history-week-title">Semana del ${formatDate(startDate)}</div>
              <div class="history-week-date">${monthName}</div>
            </div>
            <div>
              <div class="history-week-amount ${available >= 0 ? 'positive' : 'negative'}">
                ${available >= 0 ? '+' : ''}${formatMoney(available)}
              </div>
              <div style="font-size:0.6875rem;color:var(--text-muted);text-align:right;">
                ${available >= 0 ? 'sobrante' : 'excedido'}
              </div>
            </div>
          </div>
          <div class="history-week-summary">
            <div class="history-mini-stat">
              <div class="history-mini-stat-label">Presupuesto</div>
              <div class="history-mini-stat-value">${formatMoney(week.budget)}</div>
            </div>
            <div class="history-mini-stat">
              <div class="history-mini-stat-label">Gastado</div>
              <div class="history-mini-stat-value" style="color:var(--accent-1);">${formatMoney(spent)}</div>
            </div>
            <div class="history-mini-stat">
              <div class="history-mini-stat-label">Gastos</div>
              <div class="history-mini-stat-value">${week.expenses.length}</div>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    container.querySelectorAll('.history-week').forEach(el => {
      el.addEventListener('click', () => showWeekDetail(el.dataset.week));
    });
  }

  function showWeekDetail(weekKey) {
    const week = state.weeks[weekKey];
    if (!week) return;

    const spent = getWeekExpensesTotal(week);
    const available = week.budget - spent;
    const startDate = new Date(week.startDate + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const container = document.getElementById('historyContent');
    const expensesSorted = [...week.expenses].sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));

    let html = `
      <div class="history-detail glass">
        <div class="history-detail-header">
          <div>
            <div class="history-detail-title">Semana del ${formatDate(startDate)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:var(--s-1);">${formatDate(endDate)}</div>
          </div>
          <button class="history-detail-close" data-action="back-history">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <div class="summary-stats" style="margin-bottom:var(--s-4);">
          <div class="stat-card glass">
            <div class="stat-label">Disponible</div>
            <div class="stat-value ${available >= 0 ? 'green' : 'red'}">${formatMoney(Math.abs(available))}</div>
          </div>
          <div class="stat-card glass">
            <div class="stat-label">Gastado</div>
            <div class="stat-value red">${formatMoney(spent)}</div>
          </div>
        </div>

        <h4 style="font-size:0.875rem;font-weight:700;margin-bottom:var(--s-2);">📋 Todos los gastos (${week.expenses.length})</h4>
        <div class="expense-list">
          ${expensesSorted.length > 0
            ? expensesSorted.map(exp => renderExpenseItem(exp)).join('')
            : '<div class="empty-state"><div class="empty-icon">🌙</div><p>Sin gastos esta semana</p></div>'
          }
        </div>
      </div>
    `;

    container.innerHTML = html;
    bindExpenseDeleteButtons(container);
    container.querySelectorAll('.expense-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteExpense(btn.dataset.id, weekKey);
      });
    });

    const backBtn = container.querySelector('[data-action="back-history"]');
    if (backBtn) backBtn.addEventListener('click', renderHistory);
  }

  // ===== Helpers =====
  function formatMoney(amount) {
    return `${state.currency}${Number(amount).toFixed(2)}`;
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // ===== Toast =====
  let toastTimer = null;
  function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ===== Modal genérico =====
  function showModal({ title, message, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalConfirm').textContent = confirmText;
    document.getElementById('modalCancel').textContent = cancelText;
    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    const onConfirmClick = () => { close(); onConfirm?.(); cleanup(); };
    const onCancelClick  = () => { close(); cleanup(); };
    const onBackdrop     = (e) => { if (e.target === modal) { close(); cleanup(); } };

    function cleanup() {
      document.getElementById('modalConfirm').removeEventListener('click', onConfirmClick);
      document.getElementById('modalCancel').removeEventListener('click', onCancelClick);
      modal.removeEventListener('click', onBackdrop);
    }

    document.getElementById('modalConfirm').addEventListener('click', onConfirmClick);
    document.getElementById('modalCancel').addEventListener('click', onCancelClick);
    modal.addEventListener('click', onBackdrop);
  }

  // ===== SETTINGS - Estilo Samsung con stack de navegación =====
  let settingsStack = ['main'];

  const SETTINGS_TITLES = {
    main: '⚙️ Configuración',
    perfil: '👤 Perfil',
    apariencia: '🎨 Apariencia',
    categorias: '🏷️ Categorías',
    datos: '💾 Datos',
    about: 'ℹ️ Acerca de'
  };

  function showSettingsSection(section) {
    if (settingsStack[settingsStack.length - 1] !== section) {
      settingsStack.push(section);
    }
    renderSettingsView();
  }

  function settingsBack() {
    if (settingsStack.length > 1) {
      settingsStack.pop();
      renderSettingsView();
    }
  }

  function renderSettingsView() {
    const current = settingsStack[settingsStack.length - 1];
    document.querySelectorAll('.settings-view').forEach(v => {
      v.classList.toggle('active', v.dataset.view === current);
    });
    document.getElementById('settingsTitle').textContent = SETTINGS_TITLES[current] || 'Configuración';
    document.getElementById('settingsBackBtn').hidden = current === 'main';
  }

  function openSettings() {
    document.getElementById('settingsName').value = state.userName || '';
    document.getElementById('settingsBudget').value = state.weeklyBudget || 0;
    document.getElementById('settingsCurrency').value = state.currency || '$';
    document.getElementById('settingsCurrencySymbol').textContent = state.currency || '$';
    settingsStack = ['main'];
    syncSettingsControls();
    renderCategoriesManageList();
    renderSettingsView();
    document.getElementById('settingsModal').classList.add('active');
  }

  function closeSettings() {
    if (saveSettingsFromModal()) {
      settingsStack = ['main'];
      document.getElementById('settingsModal').classList.remove('active');
      renderHome();
      showToast('✅ Configuración guardada');
    }
  }

  function syncSettingsControls() {
    const s = state.settings || defaultState.settings;

    document.querySelectorAll('.segmented').forEach(group => {
      const setting = group.dataset.setting;
      group.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === s[setting]);
      });
    });

    document.querySelectorAll('.color-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.value === s.accentColor);
    });

    document.querySelectorAll('.toggle').forEach(tg => {
      if (tg.dataset.setting) {
        tg.classList.toggle('active', !!s[tg.dataset.setting]);
      }
    });
  }

  function updateSetting(key, value) {
    if (!state.settings) state.settings = { ...defaultState.settings };
    state.settings[key] = value;
    applySettings();
    saveState();
  }

  function saveSettingsFromModal() {
    const name = document.getElementById('settingsName').value.trim() || 'Dani travieso';
    const budget = Number(document.getElementById('settingsBudget').value);
    const currency = document.getElementById('settingsCurrency').value;

    if (isNaN(budget) || budget < 0) {
      showToast('Presupuesto inválido', true);
      return false;
    }

    state.userName = name;
    state.weeklyBudget = budget;
    state.currency = currency;
    ensureCurrentWeek();
    saveState();
    return true;
  }

  // ===== Gestión de categorías (TODAS editables) =====
  function renderCategoriesManageList() {
    const list = document.getElementById('categoriesManageList');
    if (!list) return;

    const customs = state.customCategories || [];
    let html = '';

    // Predeterminadas (TODAS editables ahora)
    for (const def of DEFAULT_CATEGORIES) {
      // Verificar si el usuario ya la modificó
      const customVersion = customs.find(c => c.id === def.id);
      const current = customVersion || def;
      html += `
        <div class="cat-manage-row" data-cat-id="${def.id}">
          <div class="cat-manage-emoji">${current.emoji}</div>
          <div class="cat-manage-info">
            <div class="cat-manage-name">${escapeHtml(current.name)}</div>
            <div class="cat-manage-tag">Original</div>
          </div>
          <div class="cat-manage-actions">
            <button class="cat-action-btn" data-action="cat-up" data-id="${def.id}" disabled title="Las originales no se pueden mover">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 15L12 8M12 8L19 15M12 8V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="cat-action-btn" data-action="cat-down" data-id="${def.id}" disabled title="Las originales no se pueden mover">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 9L12 16M12 16L19 9M12 16V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="cat-action-btn" data-action="cat-edit" data-id="${def.id}" title="Editar">
              <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="cat-action-btn danger" data-action="cat-delete" data-id="${def.id}" title="Eliminar">
              <svg viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      `;
    }

    // Personalizadas (editables y reordenables)
    const customsOnly = customs.filter(c => !DEFAULT_CATEGORIES.find(d => d.id === c.id));
    customsOnly.forEach((cat, index) => {
      html += `
        <div class="cat-manage-row" data-cat-id="${cat.id}">
          <div class="cat-manage-emoji">${cat.emoji}</div>
          <div class="cat-manage-info">
            <div class="cat-manage-name">${escapeHtml(cat.name)}</div>
            <div class="cat-manage-tag">Personalizada</div>
          </div>
          <div class="cat-manage-actions">
            <button class="cat-action-btn" data-action="cat-up" data-id="${cat.id}" ${index === 0 ? 'disabled' : ''} title="Mover arriba">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 15L12 8M12 8L19 15M12 8V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="cat-action-btn" data-action="cat-down" data-id="${cat.id}" ${index === customsOnly.length - 1 ? 'disabled' : ''} title="Mover abajo">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 9L12 16M12 16L19 9M12 16V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="cat-action-btn" data-action="cat-edit" data-id="${cat.id}" title="Editar">
              <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="cat-action-btn danger" data-action="cat-delete" data-id="${cat.id}" title="Eliminar">
              <svg viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      `;
    });

    if (customsOnly.length === 0) {
      html += `<p style="text-align:center;font-size:0.8125rem;color:var(--text-muted);padding:var(--s-3);">Aún no has agregado categorías personalizadas</p>`;
    }

    list.innerHTML = html;
  }

  function findCategory(id) {
    // Buscar primero en custom (puede ser una versión editada de una default)
    const custom = (state.customCategories || []).find(c => c.id === id);
    if (custom) return { ...custom, source: 'custom' };
    const def = DEFAULT_CATEGORIES.find(c => c.id === id);
    if (def) return { ...def, source: 'default' };
    return null;
  }

  function showCategoryForm(existing = null) {
    document.querySelectorAll('.cat-form').forEach(f => f.remove());

    const list = document.getElementById('categoriesManageList');
    const form = document.createElement('div');
    form.className = 'cat-form';
    form.innerHTML = `
      <div class="cat-form-row">
        <input type="text" id="catFormEmoji" placeholder="🎯" maxlength="4" value="${existing ? existing.emoji : ''}" />
        <input type="text" id="catFormName" placeholder="Nombre de la categoría" maxlength="20" value="${existing ? existing.name : ''}" />
      </div>
      <p style="font-size:0.75rem;color:var(--text-muted);">💡 Tip: pon un emoji que represente tu gasto</p>
      <div class="cat-form-buttons">
        <button class="btn btn-ghost" data-action="cat-form-cancel">Cancelar</button>
        <button class="btn btn-primary" data-action="cat-form-save" data-id="${existing?.id || ''}">${existing ? 'Guardar' : 'Agregar'}</button>
      </div>
    `;

    list.appendChild(form);
    setTimeout(() => document.getElementById(existing ? 'catFormEmoji' : 'catFormName').focus(), 50);
  }

  function saveCustomCategory(editId = null) {
    const emoji = document.getElementById('catFormEmoji').value.trim() || '📦';
    const name = document.getElementById('catFormName').value.trim();

    if (!name) {
      showToast('Pon un nombre a la categoría', true);
      return;
    }

    if (!state.customCategories) state.customCategories = [];

    if (editId) {
      // Editar: si es default, guardar como override en customCategories
      const isDefault = DEFAULT_CATEGORIES.find(c => c.id === editId);
      const existingIdx = state.customCategories.findIndex(c => c.id === editId);
      if (existingIdx >= 0) {
        state.customCategories[existingIdx].emoji = emoji;
        state.customCategories[existingIdx].name = name;
      } else {
        state.customCategories.push({
          id: editId,
          emoji,
          name,
          keywords: name.toLowerCase(),
          isDefault: isDefault ? true : false
        });
      }
      showToast('✅ Categoría actualizada');
    } else {
      // Nueva categoría
      const newId = 'custom_' + uid();
      state.customCategories.push({
        id: newId,
        emoji,
        name,
        keywords: [name.toLowerCase()],
        isDefault: false
      });
      showToast(`✅ "${name}" agregada`);
    }

    saveState();
    renderCategoriesManageList();
  }

  function deleteCustomCategory(id) {
    const cat = findCategory(id);
    if (!cat) return;

    const isDefault = DEFAULT_CATEGORIES.find(c => c.id === id);
    const confirmMsg = isDefault
      ? `Vas a eliminar "${cat.name}" (categoría original). Los gastos ya registrados con esta categoría pasarán a "Otros".`
      : `Vas a eliminar "${cat.name}". Los gastos ya registrados pasarán a "Otros".`;

    showModal({
      title: '¿Eliminar categoría?',
      message: confirmMsg,
      confirmText: 'Eliminar',
      onConfirm: () => {
        // Eliminar override de customCategories
        state.customCategories = (state.customCategories || []).filter(c => c.id !== id);
        // Reasignar expenses que usaban esta categoría a "otros"
        for (const week of Object.values(state.weeks)) {
          for (const exp of week.expenses) {
            if (exp.category === id) exp.category = 'otros';
          }
        }
        saveState();
        renderCategoriesManageList();
        showToast('Categoría eliminada');
      }
    });
  }

  function moveCustomCategory(id, direction) {
    const customs = (state.customCategories || []).filter(c => !DEFAULT_CATEGORIES.find(d => d.id === c.id));
    const idx = customs.findIndex(c => c.id === id);
    if (idx < 0) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= customs.length) return;

    const customIdx1 = state.customCategories.findIndex(c => c.id === customs[idx].id);
    const customIdx2 = state.customCategories.findIndex(c => c.id === customs[newIdx].id);

    [state.customCategories[customIdx1], state.customCategories[customIdx2]] =
      [state.customCategories[customIdx2], state.customCategories[customIdx1]];

    saveState();
    renderCategoriesManageList();
  }

  // ===== Acciones principales =====
  function handleDeleteExpense(expenseId, weekKey = null) {
    const week = weekKey ? state.weeks[weekKey] : getCurrentWeek();
    const exp = week.expenses.find(e => e.id === expenseId);
    if (!exp) return;

    showModal({
      title: '¿Eliminar gasto?',
      message: `Vas a eliminar "${exp.description}" por ${formatMoney(exp.amount)}.`,
      confirmText: 'Eliminar',
      onConfirm: () => {
        week.expenses = week.expenses.filter(e => e.id !== expenseId);
        saveState();
        if (weekKey) showWeekDetail(weekKey); else renderHome();
        showToast('Gasto eliminado');
      }
    });
  }

  function handleAddExpense(category, amount, description, date) {
    const week = ensureCurrentWeek();
    const expense = {
      id: uid(),
      category,
      amount: Number(amount),
      description: description.trim(),
      date,
      createdAt: new Date().toISOString()
    };
    week.expenses.push(expense);
    saveState();
    showToast(`✅ Guardado: ${formatMoney(amount)}`);
  }

  function addMoneyToBudget(amount) {
    if (isNaN(amount) || amount <= 0) {
      showToast('Cantidad inválida', true);
      return false;
    }
    const week = getCurrentWeek();
    week.budget += Number(amount);
    state.weeklyBudget += Number(amount);
    saveState();
    renderHome();
    showToast(`💰 Agregaste ${formatMoney(amount)} al presupuesto`);
    return true;
  }

  function exportData() {
    try {
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `luna-roja-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📥 Datos exportados');
    } catch {
      showToast('Error al exportar', true);
    }
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (typeof imported !== 'object' || imported === null) throw new Error('Formato inválido');
        state = { ...defaultState, ...imported };
        state.settings = { ...defaultState.settings, ...(imported.settings || {}) };
        state.customCategories = Array.isArray(imported.customCategories) ? imported.customCategories : [];
        applySettings();
        saveState();
        renderHome();
        showToast('📤 Datos importados con éxito');
      } catch {
        showToast('Archivo inválido', true);
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    showModal({
      title: '¿Borrar todo?',
      message: 'Esto eliminará TODOS tus datos: gastos, presupuesto, categorías personalizadas, ajustes e historial.',
      confirmText: 'Sí, borrar todo',
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEY);
        state = loadState();
        applySettings();
        closeSettings();
        showScreen('welcome');
        showToast('Datos eliminados');
      }
    });
  }

  // ===== Modal de agregar dinero =====
  function openAddMoneyModal() {
    document.getElementById('addMoneyInput').value = '';
    document.getElementById('moneyModalCurrencySymbol').textContent = state.currency || '$';
    updateMoneyModalAmount(0);
    document.getElementById('addMoneyModal').classList.add('active');
    setTimeout(() => document.getElementById('addMoneyInput').focus(), 100);
  }

  function closeAddMoneyModal() {
    document.getElementById('addMoneyModal').classList.remove('active');
  }

  function updateMoneyModalAmount(amount) {
    const el = document.getElementById('moneyModalAmount');
    el.innerHTML = `<small>Vas a agregar</small><br>${formatMoney(amount)}`;
  }

  // ===== Inicialización de listeners con delegación =====
  function setupGlobalListeners() {

    // ============================================================
    // NAVEGACIÓN DEL MENÚ INFERIOR - 100% ROBUSTO
    // ============================================================

    function handleNav(screen) {
      if (!screen) return;
      try {
        showScreen(screen);
      } catch (err) {
        console.error('Error en navegación:', err);
        showToast('Error al cambiar de pantalla', true);
      }
    }

    function bindNavItem(item) {
      if (!item || item.dataset.navBound) return;
      item.dataset.navBound = 'true';

      const screen = item.dataset.screen;
      if (!screen) return;

      const handler = (e) => {
        e.preventDefault();
        handleNav(screen);
      };

      // Múltiples eventos para máxima compatibilidad
      item.addEventListener('click', handler);
      item.addEventListener('pointerdown', handler);
      item.addEventListener('touchstart', handler, { passive: true });
    }

    // Vincular TODOS los nav-items existentes
    document.querySelectorAll('.nav-item').forEach(bindNavItem);

    // También delegación como respaldo
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item[data-screen]');
      if (navItem) {
        handleNav(navItem.dataset.screen);
      }
    }, true); // Use capture phase

    // Setup form (primera vez)
    document.getElementById('setupForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('userName').value.trim() || 'Dani travieso';
      const budget = Number(document.getElementById('weeklyBudget').value);
      const currency = document.getElementById('currency').value;

      if (isNaN(budget) || budget < 0) {
        showToast('Ingresa un presupuesto válido', true);
        return;
      }

      state.initialized = true;
      state.setupDate = new Date().toISOString();
      state.userName = name;
      state.weeklyBudget = budget;
      state.currency = currency;
      ensureCurrentWeek();
      showScreen('home');
      showWelcomeToast();
    });

    // Expense form
    document.getElementById('expenseForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedCat = document.querySelector('.cat-btn.selected');
      if (!selectedCat) {
        showToast('Selecciona una categoría', true);
        return;
      }
      const amount = Number(document.getElementById('amount').value);
      const description = document.getElementById('description').value;
      const date = document.getElementById('expenseDate').value;

      if (isNaN(amount) || amount <= 0) { showToast('Monto inválido', true); return; }
      if (!description.trim()) { showToast('Agrega una descripción', true); return; }
      if (!date) { showToast('Selecciona una fecha', true); return; }

      handleAddExpense(selectedCat.dataset.cat, amount, description, date);
      document.getElementById('amount').value = '';
      document.getElementById('description').value = '';
      showScreen('home');
    });

    // ============================================================
    // LISTENERS DIRECTOS para botones críticos (backup)
    // ============================================================

    // Botón ⚙️ de configuración (header) - listener directo
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openSettings();
      });
    }

    // ============================================================
    // DELEGACIÓN DE EVENTOS para el resto
    // ============================================================
    document.addEventListener('click', (e) => {

      // ⚙️ Abrir ajustes (header)
      if (e.target.closest('#openSettingsBtn')) {
        openSettings();
        return;
      }

      // FAB agregar gasto
      if (e.target.closest('#fabAdd')) {
        const form = document.getElementById('expenseForm');
        form.reset();
        document.getElementById('expenseDate').value = formatDateISO(new Date());
        document.getElementById('currencySymbolLarge').textContent = state.currency;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
        showScreen('add');
        return;
      }

      // Botón agregar dinero
      if (e.target.closest('#addMoneyBtn')) {
        openAddMoneyModal();
        return;
      }

      // Categorías del formulario
      const catBtn = e.target.closest('.cat-btn');
      if (catBtn && e.target.closest('.category-grid')) {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
        catBtn.classList.add('selected');
        return;
      }

      // Botones back
      const backBtn = e.target.closest('[data-action="back"]');
      if (backBtn) {
        showScreen('home');
        return;
      }

      // Settings: botón cerrar
      if (e.target.closest('[data-action="close-settings"]')) {
        closeSettings();
        return;
      }

      // Settings: botón atrás (sub-pantalla)
      if (e.target.closest('[data-action="settings-back"]')) {
        settingsBack();
        return;
      }

      // Settings: fila del menú principal → abre sub-pantalla
      const menuRow = e.target.closest('.settings-menu-row');
      if (menuRow && menuRow.dataset.section) {
        showSettingsSection(menuRow.dataset.section);
        return;
      }

      // Settings: segmented
      const segBtn = e.target.closest('.segmented button');
      if (segBtn) {
        const group = segBtn.closest('.segmented');
        const setting = group.dataset.setting;
        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        segBtn.classList.add('active');
        updateSetting(setting, segBtn.dataset.value);
        return;
      }

      // Settings: color
      const colorBtn = e.target.closest('.color-swatch');
      if (colorBtn) {
        document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
        colorBtn.classList.add('active');
        updateSetting('accentColor', colorBtn.dataset.value);
        return;
      }

      // Settings: toggle
      const toggle = e.target.closest('.toggle');
      if (toggle && toggle.dataset.setting) {
        toggle.classList.toggle('active');
        updateSetting(toggle.dataset.setting, toggle.classList.contains('active'));
        return;
      }

      // Categorías: agregar
      if (e.target.closest('[data-action="add-category"]')) {
        showCategoryForm();
        return;
      }

      // Categorías: editar
      const catEdit = e.target.closest('[data-action="cat-edit"]');
      if (catEdit) {
        const cat = findCategory(catEdit.dataset.id);
        if (cat) showCategoryForm(cat);
        return;
      }

      // Categorías: eliminar
      const catDelete = e.target.closest('[data-action="cat-delete"]');
      if (catDelete) {
        deleteCustomCategory(catDelete.dataset.id);
        return;
      }

      // Categorías: mover
      const catUp = e.target.closest('[data-action="cat-up"]');
      if (catUp && !catUp.disabled) {
        moveCustomCategory(catUp.dataset.id, 'up');
        return;
      }
      const catDown = e.target.closest('[data-action="cat-down"]');
      if (catDown && !catDown.disabled) {
        moveCustomCategory(catDown.dataset.id, 'down');
        return;
      }

      // Categorías: form
      if (e.target.closest('[data-action="cat-form-cancel"]')) {
        document.querySelectorAll('.cat-form').forEach(f => f.remove());
        return;
      }
      const catSave = e.target.closest('[data-action="cat-form-save"]');
      if (catSave) {
        saveCustomCategory(catSave.dataset.id || null);
        return;
      }

      // Datos
      if (e.target.closest('[data-action="export-data"]')) { exportData(); return; }
      if (e.target.closest('[data-action="import-data"]')) {
        document.getElementById('importFileInput').click();
        return;
      }
      if (e.target.closest('[data-action="reset-all"]')) { resetAll(); return; }

      // Modal agregar dinero
      if (e.target.closest('[data-action="close-money"]')) {
        closeAddMoneyModal();
        return;
      }
      if (e.target.closest('[data-action="confirm-add-money"]')) {
        const amount = Number(document.getElementById('addMoneyInput').value);
        if (addMoneyToBudget(amount)) closeAddMoneyModal();
        return;
      }
      const quickAmt = e.target.closest('.quick-amount-btn');
      if (quickAmt) {
        const input = document.getElementById('addMoneyInput');
        const current = Number(input.value) || 0;
        const newVal = current + Number(quickAmt.dataset.amount);
        input.value = newVal;
        updateMoneyModalAmount(newVal);
        return;
      }

      // Eliminar gasto
      const expDelete = e.target.closest('.expense-delete');
      if (expDelete && expDelete.dataset.id) {
        const weekKey = e.target.closest('[data-week]')?.dataset.week || null;
        handleDeleteExpense(expDelete.dataset.id, weekKey);
        return;
      }

      // Click en semana del historial
      const histWeek = e.target.closest('.history-week');
      if (histWeek && histWeek.dataset.week) {
        showWeekDetail(histWeek.dataset.week);
        return;
      }
    });

    // File input
    document.getElementById('importFileInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) importData(file);
      e.target.value = '';
    });

    // Currency settings (cambia símbolo)
    document.getElementById('settingsCurrency').addEventListener('change', (e) => {
      document.getElementById('settingsCurrencySymbol').textContent = e.target.value;
    });

    // Add money input live update
    document.getElementById('addMoneyInput').addEventListener('input', (e) => {
      updateMoneyModalAmount(Number(e.target.value) || 0);
    });
  }

  function showWelcomeToast() {
    showToast(`🌙 ¡Bienvenido ${state.userName || 'Dani travieso'}!`);
  }

  // ===== Init =====
  function init() {
    applySettings();
    setupGlobalListeners();
    if (state.initialized) {
      ensureCurrentWeek();
      showScreen('home');
      setTimeout(showWelcomeToast, 400);
    } else {
      showScreen('welcome');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
