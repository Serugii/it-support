/*************************************************
 * ANALYSIS — запуск аналізу
 *************************************************/
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

    lastAnalyzedStudents = analyzed;

    currentStatus.textContent =
      `Знайдено ${data.riskCount || 0} студентів ризику`;

    drawChart(analyzed);
    drawClusterChart(analyzed);
    showRiskStudents(analyzed);
    toggleAnalysisBlocks(analyzed.length > 0);

  } catch (err) {
    console.error(err);
    currentStatus.textContent = "Помилка!";
    showToast("Помилка з'єднання з сервером");
  }
}

/*************************************************
 * INIT — ініціалізація при завантаженні
 *************************************************/
window.addEventListener('load', () => {
  btn = document.getElementById('analyzeBtn');
  currentStatus = document.getElementById('currentStatus');

  if (btn) btn.addEventListener('click', runAnalysis);

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
 * GLOBAL EXPORTS — доступ з HTML-атрибутів
 *************************************************/
window.addStudentForm   = addStudentForm;
window.deleteStudent    = deleteStudent;
window.clearStudents    = clearStudents;
window.showTab          = showTab;
window.submitStudents   = submitStudents;
window.exportJSON       = exportJSON;
window.exportCSV        = exportCSV;
window.triggerImportJSON = triggerImportJSON;
window.handleImportJSON = handleImportJSON;
