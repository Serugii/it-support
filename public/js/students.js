/*************************************************
 * STUDENTS — маніпуляції з даними студентів
 *************************************************/
function updateStudent(index, field, value) {
  if (!studentsState[index]) return;

  if (field === 'name') {
    studentsState[index][field] = value;
  } else {
    // BUG FIX: нечислове значення → null, а не 0
    studentsState[index][field] =
      (value === "" || isNaN(value)) ? null : Number(value);
  }
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
