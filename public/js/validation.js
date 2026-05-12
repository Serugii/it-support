/*************************************************
 * VALIDATION — валідація даних студента
 *************************************************/
function validateStudent(s) {
  if (!s.name || s.name.trim().length < 2)
    return "Ім'я мінімум 2 символи";

  if (s.logins == null || !Number.isFinite(Number(s.logins)) || s.logins < 0)
    return "Логіни ≥ 0";

  if (s.time_spent == null || !Number.isFinite(Number(s.time_spent)) || s.time_spent < 0)
    return "Час ≥ 0";

  if (s.assignments_completed == null || !Number.isFinite(Number(s.assignments_completed)) || s.assignments_completed < 0)
    return "Завдання ≥ 0";

  if (s.grade == null || !Number.isFinite(Number(s.grade)) || s.grade < 0 || s.grade > 100)
    return "Оцінка 0–100";

  return null;
}
