/*************************************************
 * EXPORT / IMPORT — експорт та імпорт даних
 *************************************************/

// --- EXPORT JSON ---
function exportJSON() {
  if (!lastAnalyzedStudents.length) {
    showToast("Немає даних для експорту. Спочатку виконайте аналіз.");
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    totalStudents: lastAnalyzedStudents.length,
    riskCount: lastAnalyzedStudents.filter(s => s.status === 'ризик').length,
    students: lastAnalyzedStudents
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  downloadFile(blob, 'students-report.json');
  showToast("JSON експортовано!");
}

// --- EXPORT CSV ---
function exportCSV() {
  if (!lastAnalyzedStudents.length) {
    showToast("Немає даних для експорту. Спочатку виконайте аналіз.");
    return;
  }

  const headers = ["Ім'я", "Логіни", "Час (хв)", "Завдання", "Оцінка", "Статус", "Кластер"];
  const rows = lastAnalyzedStudents.map(s => [
    `"${(s.name || '').replace(/"/g, '""')}"`,
    s.logins ?? '',
    s.time_spent ?? '',
    s.assignments_completed ?? '',
    s.grade ?? '',
    s.status ?? '',
    s.cluster ?? ''
  ]);

  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, 'students-report.csv');
  showToast("CSV експортовано!");
}

// --- IMPORT JSON ---
function triggerImportJSON() {
  const input = document.getElementById('importJSONInput');
  if (input) {
    input.value = '';
    input.click();
  }
}

function handleImportJSON(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    let parsed;
    try {
      parsed = JSON.parse(e.target.result);
    } catch {
      showToast("Помилка: невалідний JSON файл");
      return;
    }

    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.students)
        ? parsed.students
        : null;

    if (!list) {
      showToast("Помилка: JSON не містить масиву студентів");
      return;
    }

    const required = ['name', 'logins', 'time_spent', 'assignments_completed', 'grade'];
    const valid = list.filter(s => required.every(k => k in s));

    if (!valid.length) {
      showToast("Помилка: жоден запис не містить потрібних полів");
      return;
    }

    const normalized = valid.map(s => ({
      name:                  String(s.name ?? ''),
      logins:                s.logins != null ? Number(s.logins) : null,
      time_spent:            s.time_spent != null ? Number(s.time_spent) : null,
      assignments_completed: s.assignments_completed != null ? Number(s.assignments_completed) : null,
      grade:                 s.grade != null ? Number(s.grade) : null,
      status:                s.status ?? 'норма',
      cluster:               s.cluster ?? 0
    }));

    studentsState = normalized;
    localStorage.setItem('students', JSON.stringify(studentsState));

    renderStudentsEditor();
    drawChart(studentsState);
    showRiskStudents(studentsState);
    toggleAnalysisBlocks(studentsState.length > 0);

    showToast(`Імпортовано ${normalized.length} студент(ів) з ${list.length} записів`);
  };

  reader.onerror = function () {
    showToast("Помилка читання файлу");
  };

  reader.readAsText(file);
}

// --- HELPER ---
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
