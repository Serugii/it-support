/*************************************************
 * STATE
 *************************************************/
let studentsState = [];

let chartInstance = null;
let clusterChartInstance = null;

/*************************************************
 * DOM REFERENCES
 *************************************************/
let btn = null;
let currentStatus = null;

function showTab(tabId, event) {
  if (tabId === 'analysis') {
    for (const s of studentsState) {
      const error = validateStudent(s);
      if (error) {
        showToast(error);
        return;
      }
    }
  }
  document.querySelectorAll('.tabs button')
    .forEach(btn => btn.classList.remove('active-tab'));
  event.classList.add('active-tab');
  document.querySelectorAll('.tab')
    .forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (tabId === 'analysis') {
    if (studentsState.length > 0) {
      runAnalysis();
    } else {
      drawChart([]);
      showRiskStudents([]);
      currentStatus.textContent = "Немає даних";
      toggleAnalysisBlocks(false);
    }
  }
}

function submitStudents() {
  for (const s of studentsState) {
    const error = validateStudent(s);
    if (error) {
      showToast(error);
      return;
    }
  }
  localStorage.setItem('students', JSON.stringify(studentsState));
  showToast("Збережено!");
}

function toggleAnalysisBlocks(show) {
  const clusterCard = document.getElementById('clusterCard');
  const riskCard = document.getElementById('riskCard');
  if (!clusterCard || !riskCard) return;
  clusterCard.style.display = show ? 'block' : 'none';
  riskCard.style.display = show ? 'block' : 'none';
}

/*************************************************
 * INIT
 *************************************************/
window.addEventListener('load', () => {
  btn = document.getElementById('analyzeBtn');
  currentStatus = document.getElementById('currentStatus');

  const saved = localStorage.getItem('students');

  try {
    studentsState = saved ? JSON.parse(saved) : [];
  } catch {
    studentsState = [];
  }

  renderStudentsEditor();
  drawChart(studentsState);
  toggleAnalysisBlocks(false);

  if (studentsState.length > 0) {
    runAnalysis();
  }
});

/*************************************************
 * ANALYSIS FLOW
 *************************************************/
btn?.addEventListener('click', runAnalysis);

async function runAnalysis() {
  if (!studentsState.length) {
    showToast("Немає даних для аналізу");
    currentStatus.textContent = "Немає даних";
    return;
  }

  for (const s of studentsState) {
    const error = validateStudent(s);
    if (error) {
      showToast(error);
      return;
    }
  }

  currentStatus.textContent = "Аналіз...";

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: studentsState })
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();

    const analyzed = data.students || [];

    currentStatus.textContent =
      `Знайдено ${data.riskCount || 0} студентів ризику`;

    drawChart(analyzed);
    drawClusterChart(analyzed);
    showRiskStudents(analyzed);
    toggleAnalysisBlocks(analyzed.length > 0);

  } catch (err) {
    console.error(err);
    currentStatus.textContent = "Помилка!";
  }
}

/*************************************************
 * CHARTS
 *************************************************/
function drawChart(students = []) {
  const ctx = document.getElementById('chart');
  if (!ctx) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: students.map(s => s.name || "—"),
      datasets: [{
        label: 'Оцінки',
        data: students.map(s => s.grade || 0),
        backgroundColor: ['#c0392b', '#e74c3c', '#ff6b6b']
      }]
    }
  });
}

function drawClusterChart(students = []) {
  const ctx = document.getElementById('clusterChart');
  if (!ctx) return;

  if (clusterChartInstance) clusterChartInstance.destroy();

  const clusters = {};

  students.forEach(s => {
    if (!clusters[s.cluster]) clusters[s.cluster] = [];
    clusters[s.cluster].push({ x: s.logins, y: s.grade });
  });

  const datasets = Object.keys(clusters).map(c => ({
    label: `Кластер ${c}`,
    data: clusters[c],
    backgroundColor: getClusterColor(c)
  }));

  clusterChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: { datasets }
  });
}

function getClusterColor(c) {
  const colors = ['#3498db', '#2ecc71', '#f1c40f'];
  return colors[c] || '#95a5a6';
}

/*************************************************
 * UI RENDER
 *************************************************/
function renderStudentsEditor() {
  const container = document.getElementById('studentsForm');
  if (!container) return;

  container.innerHTML = '';

  studentsState.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'student-row';

    div.innerHTML = `
      <input placeholder="Ім'я"
        value="${s.name ?? ''}"
        onchange="updateStudent(${i}, 'name', this.value)">

      <input type="number" placeholder="Логіни"
        value="${s.logins ?? ''}"
        onchange="updateStudent(${i}, 'logins', this.value)">

      <input type="number" placeholder="Час"
        value="${s.time_spent ?? ''}"
        onchange="updateStudent(${i}, 'time_spent', this.value)">

      <input type="number" placeholder="Завдання"
        value="${s.assignments_completed ?? ''}"
        onchange="updateStudent(${i}, 'assignments_completed', this.value)">

      <input type="number" placeholder="Оцінка"
        value="${s.grade ?? ''}"
        onchange="updateStudent(${i}, 'grade', this.value)">

      <button onclick="deleteStudent(${i})">✖</button>
    `;

    container.appendChild(div);
  });
}

function renderStudentsTable(students) {
  const table = document.getElementById('studentsTable');
  if (!table) return;
  table.innerHTML = `
    <tr>
      <th>Ім'я</th>
      <th>Логіни</th>
      <th>Час</th>
      <th>Завдання</th>
      <th>Оцінка</th>
      <th>Статус</th>
    </tr>
  `;
  students.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.logins}</td>
      <td>${s.time_spent}</td>
      <td>${s.assignments_completed}</td>
      <td>${s.grade}</td>
      <td class="${s.status === 'ризик' ? 'risk-text' : 'ok-text'}">
        ${s.status}
      </td>
    `;
    table.appendChild(row);
  });
}

/*************************************************
 * DATA MANIPULATION
 *************************************************/
function updateStudent(index, field, value) {
  if (!studentsState[index]) return;

  studentsState[index][field] =
    field === 'name'
      ? value
      : value === "" ? null : Number(value);
}

function deleteStudent(index) {
  studentsState.splice(index, 1);

  renderStudentsEditor();
  drawChart(studentsState);
  showRiskStudents(studentsState);
  toggleAnalysisBlocks(studentsState.length > 0);
}

function clearStudents() {
  if (!confirm("Видалити всіх студентів?")) return;

  studentsState = [];
  localStorage.removeItem('students');

  renderStudentsEditor();
  drawChart([]);
  showRiskStudents([]);
  toggleAnalysisBlocks(false);

  showToast("Список очищено");
}

function addStudentForm() {
  studentsState.push({
    name: "",
    logins: null,
    time_spent: null,
    assignments_completed: null,
    grade: null,
    status: "норма",
    cluster: 0
  });

  renderStudentsEditor();
  drawChart(studentsState);
}

/*************************************************
 * RISK LOGIC
 *************************************************/
function showRiskStudents(students) {
  renderStudentsTable(students); 

  const block = document.getElementById('riskBlock');
  if (!block) return;

  const risk = students.filter(s => s.status === 'ризик');

  if (!risk.length) {
    block.innerHTML = `<p class="ok-text">Немає студентів у групі ризику</p>`;
    return;
  }

  block.innerHTML = `
    <div class="risk-box">
      У групі ризику: ${risk.length}
      <ul>
        ${risk.map(s => `<li>${s.name} (${s.grade})</li>`).join('')}
      </ul>
    </div>
  `;
}

/*************************************************
 * VALIDATION
 *************************************************/
function validateStudent(s) {
  if (!s.name || s.name.trim().length < 2)
    return "Ім'я мінімум 2 символи";

  if (s.logins == null || s.logins < 0)
    return "Логіни ≥ 0";

  if (s.time_spent == null || s.time_spent < 0)
    return "Час ≥ 0";

  if (s.assignments_completed == null || s.assignments_completed < 0)
    return "Завдання ≥ 0";

  if (s.grade == null || s.grade < 0 || s.grade > 100)
    return "Оцінка 0–100";

  return null;
}

/*************************************************
 * TOAST
 *************************************************/
function showToast(message) {
  const div = document.createElement('div');

  div.textContent = message;
  div.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #e74c3c;
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
  `;

  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

/*************************************************
 * GLOBAL EXPORTS
 *************************************************/
window.addStudentForm = addStudentForm;
window.deleteStudent = deleteStudent;
window.clearStudents = clearStudents;
window.showTab = showTab;
window.submitStudents = submitStudents;