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

module.exports = { validateStudent };