const { validateStudent } = require('../src/utils/validation');

describe('validateStudent()', () => {

  test('Валідний студент', () => {
    const student = {
      name: "Іван",
      logins: 10,
      time_spent: 5,
      assignments_completed: 3,
      grade: 80
    };

    expect(validateStudent(student)).toBeNull();
  });

  test('Некоректне ім’я', () => {
    const student = {
      name: "І",
      logins: 10,
      time_spent: 5,
      assignments_completed: 3,
      grade: 80
    };

    expect(validateStudent(student))
      .toBe("Ім'я повинно містити мінімум 2 символи");
  });

  test('logins = null', () => {
    const student = {
      name: "Іван",
      logins: null,
      time_spent: 5,
      assignments_completed: 3,
      grade: 80
    };

    expect(validateStudent(student))
      .toBe("Логіни повинні бути числом ≥ 0");
  });

  test('grade > 100', () => {
    const student = {
      name: "Іван",
      logins: 10,
      time_spent: 5,
      assignments_completed: 3,
      grade: 120
    };

    expect(validateStudent(student))
      .toBe("Оцінка повинна бути від 0 до 100");
  });

});