let studentsState = [];
let chartInstance = null;

window.addEventListener('load', () => {
  const saved = localStorage.getItem('students');
  studentsState = saved ? JSON.parse(saved) : [];

  drawChart(studentsState);
  renderStudentsEditor();

  toggleAnalysisBlocks(false);

  if (studentsState.length > 0) {
    btn.click();
  }
});

const btn = document.getElementById('analyzeBtn');
const currentStatus = document.getElementById('currentStatus');

btn.addEventListener('click', async () => {
  if (studentsState.length === 0) {
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

    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();

    const analyzedStudents = data.students || [];

    currentStatus.textContent =
      `Знайдено ${data.riskCount || 0} студентів ризику`;

    drawChart(analyzedStudents);
    showRiskStudents(analyzedStudents);
    drawClusterChart(analyzedStudents);
    toggleAnalysisBlocks(analyzedStudents.length > 0);
  } catch (err) {
    currentStatus.textContent = "Помилка!";
    console.error(err);
  }
});

function drawChart(students = []) {
  const ctx = document.getElementById('chart');

  if (!Array.isArray(students)) students = [];

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: students.map(s => s.name || "—"),
      datasets: [{
        label: 'Оцінки',
        data: students.map(s => s.grade || 0),
        backgroundColor: students.map((_, i) =>
          ['#c0392b', '#e74c3c', '#ff6b6b'][i % 3]
        )
      }]
    }
  });
}

function renderStudentsEditor() {
  const container = document.getElementById('studentsForm');
  container.innerHTML = '';

  studentsState.forEach((s, index) => {
    const div = document.createElement('div');
    div.className = 'student-row';

    div.innerHTML = `
      <input placeholder="Ім'я"
        value="${s.name ?? ''}"
        onblur="validateField(this, 'name')"
        onchange="updateStudent(${index}, 'name', this.value)">

      <input type="number" placeholder="Логіни"
        value="${s.logins ?? ''}"
        onblur="validateField(this, 'logins')"
        onchange="updateStudent(${index}, 'logins', this.value)">

      <input type="number" placeholder="Час"
        value="${s.time_spent ?? ''}"
        onblur="validateField(this, 'time_spent')"
        onchange="updateStudent(${index}, 'time_spent', this.value)">

      <input type="number" placeholder="Завдання"
        value="${s.assignments_completed ?? ''}"
        onblur="validateField(this, 'assignments_completed')"
        onchange="updateStudent(${index}, 'assignments_completed', this.value)">

      <input type="number" placeholder="Оцінка"
        value="${s.grade ?? ''}"
        onblur="validateField(this, 'grade')"
        onchange="updateStudent(${index}, 'grade', this.value)">

      <button onclick="deleteStudent(${index})">✖</button>
    `;

    container.appendChild(div);
  });
}

function updateStudent(index, field, value) {
  if (!studentsState[index]) return;

  if (field === 'name') {
    studentsState[index][field] = value;
  } else {
    if (value === "" || isNaN(value)) {
      studentsState[index][field] = null;
    } else {
      studentsState[index][field] = Number(value);
    }
  }
}

function deleteStudent(index) {
  studentsState.splice(index, 1);

  drawChart(studentsState);
  renderStudentsEditor();
  showRiskStudents(studentsState);

  if (studentsState.length === 0) {
    toggleAnalysisBlocks(false);

    if (clusterChartInstance) {
      clusterChartInstance.destroy();
      clusterChartInstance = null;
    }
  }
}

function clearStudents() {
  if (!confirm("Видалити всіх студентів?")) return;

  studentsState = [];
  localStorage.removeItem('students');

  drawChart([]);
  renderStudentsEditor();
  showRiskStudents([]);

  if (clusterChartInstance) {
    clusterChartInstance.destroy();
    clusterChartInstance = null;
  }

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

function showRiskStudents(students) {
  renderStudentsTable(students);

  const block = document.getElementById('riskBlock');
  block.innerHTML = '';

  const risk = students.filter(s => s.status === 'ризик');

  if (risk.length === 0) {
    block.innerHTML = `<p class="ok-text">Немає студентів у групі ризику</p>`;
    return;
  }

  block.innerHTML = `
    <div class="risk-box">
      У групі ризику: ${risk.length} студент(ів)
      <ul>
        ${risk.map(s => `<li>${s.name} (${s.grade})</li>`).join('')}
      </ul>
    </div>
  `;
}

let clusterChartInstance = null;

function drawClusterChart(students = []) {
  const ctx = document.getElementById('clusterChart');
  if (!ctx) return;

  if (clusterChartInstance) clusterChartInstance.destroy();

  const clusters = {};

  students.forEach(s => {
    if (!clusters[s.cluster]) clusters[s.cluster] = [];
    clusters[s.cluster].push({ x: s.logins, y: s.grade });
  });

  const datasets = Object.keys(clusters).map(cluster => ({
    label: `Кластер ${cluster}`,
    data: clusters[cluster],
    backgroundColor: getClusterColor(cluster)
  }));

  clusterChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: {
          title: { display: true, text: 'Логіни' }
        },
        y: {
          title: { display: true, text: 'Оцінка' }
        }
      }
    }
  });
}

function getClusterColor(cluster) {
  const colors = ['#3498db', '#2ecc71', '#f1c40f'];
  return colors[cluster] || '#95a5a6';
}

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

  event.target.classList.add('active-tab');

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');

  if (tabId === 'analysis') {
    if (studentsState.length > 0) {
      btn.click();
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

function showToast(message) {
  const div = document.createElement('div');

  div.textContent = message;
  div.style.position = 'fixed';
  div.style.bottom = '20px';
  div.style.right = '20px';
  div.style.background = '#e74c3c';
  div.style.color = 'white';
  div.style.padding = '10px 15px';
  div.style.borderRadius = '8px';

  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

window.addStudentForm = addStudentForm;
window.submitStudents = submitStudents;
window.deleteStudent = deleteStudent;
window.clearStudents = clearStudents;
window.showTab = showTab;

function validateStudent(s) {
  if (!s.name || s.name.trim().length < 2)
    return "Ім'я повинно містити мінімум 2 символи";

  if (s.logins == null || !Number.isFinite(s.logins) || s.logins < 0)
    return "Логіни повинні бути числом ≥ 0";

  if (s.time_spent == null || !Number.isFinite(s.time_spent) || s.time_spent < 0)
    return "Час повинен бути числом ≥ 0";

  if (s.assignments_completed == null ||
      !Number.isFinite(s.assignments_completed) ||
      s.assignments_completed < 0)
    return "Завдання повинні бути числом ≥ 0";

  if (s.grade == null ||
      !Number.isFinite(s.grade) ||
      s.grade < 0 ||
      s.grade > 100)
    return "Оцінка повинна бути від 0 до 100";

  return null;
}

function validateField(input, field) {
  let value = field === 'name'
    ? input.value
    : (input.value === "" ? null : Number(input.value));

  let error = null;

  if (field === 'name' && (!value || value.trim().length < 2))
    error = "Мінімум 2 символи";

  if (field !== 'name') {
    if (value === null || !Number.isFinite(value) || value < 0)
      error = "Повинно бути число ≥ 0";
  }

  if (field === 'grade' && (value < 0 || value > 100))
    error = "0–100";

  input.style.border = error
    ? "2px solid #e74c3c"
    : "1px solid #ccc";

  return error;
}

function toggleAnalysisBlocks(show) {
  const clusterCard = document.getElementById('clusterCard');
  const riskCard = document.getElementById('riskCard');

  if (!clusterCard || !riskCard) return;

  clusterCard.style.display = show ? 'block' : 'none';
  riskCard.style.display = show ? 'block' : 'none';
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