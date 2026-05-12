/*************************************************
 * UI — рендеринг інтерфейсу
 *************************************************/
function toggleAnalysisBlocks(show) {
  const clusterCard = document.getElementById('clusterCard');
  const riskCard = document.getElementById('riskCard');
  if (!clusterCard || !riskCard) return;
  clusterCard.style.display = show ? 'block' : 'none';
  riskCard.style.display = show ? 'block' : 'none';
}

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
      <th>Кластер</th>
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
      <td class="${s.status === 'ризик' ? 'risk-text' : 'ok-text'}">${s.status}</td>
      <td>${s.cluster ?? 0}</td>
    `;
    table.appendChild(row);
  });
}

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
    .forEach(b => b.classList.remove('active-tab'));
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
