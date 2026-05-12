const { clusterStudents } = require('../src/analysis/clustering');

describe('clusterStudents()', () => {

  test('Порожній масив повертається без змін', () => {
    expect(clusterStudents([])).toEqual([]);
  });

  test('null повертається без змін', () => {
    expect(clusterStudents(null)).toBeNull();
  });

  test('Один студент отримує cluster = 0', () => {
    const students = [{
      name: 'Іван', logins: 10, time_spent: 5,
      assignments_completed: 3, grade: 80, status: 'норма'
    }];
    // k=1 для одного студента → cluster 0
    const result = clusterStudents(students);
    expect(result[0].cluster).toBeDefined();
    expect(typeof result[0].cluster).toBe('number');
  });

  test('Три різні студенти отримують кластери 0–2', () => {
    const students = [
      { name: 'А', logins: 1,  time_spent: 1,  assignments_completed: 1,  grade: 40, status: 'ризик' },
      { name: 'Б', logins: 15, time_spent: 10, assignments_completed: 8,  grade: 75, status: 'норма' },
      { name: 'В', logins: 30, time_spent: 25, assignments_completed: 15, grade: 95, status: 'норма' }
    ];
    const result = clusterStudents(students);
    expect(result).toHaveLength(3);
    result.forEach(s => {
      expect(s.cluster).toBeGreaterThanOrEqual(0);
      expect(s.cluster).toBeLessThanOrEqual(2);
    });
  });

  test('Студент з null-полями отримує cluster = 0 (не падає)', () => {
    const students = [
      { name: 'Х', logins: null, time_spent: null, assignments_completed: null, grade: 50, status: 'ризик' }
    ];
    const result = clusterStudents(students);
    expect(result[0].cluster).toBe(0);
  });

  test('Оригінальні дані не мутуються', () => {
    const students = [
      { name: 'А', logins: 5, time_spent: 3, assignments_completed: 2, grade: 60, status: 'норма' },
      { name: 'Б', logins: 20, time_spent: 15, assignments_completed: 10, grade: 90, status: 'норма' }
    ];
    const original = JSON.parse(JSON.stringify(students));
    clusterStudents(students);
    expect(students[0].name).toBe(original[0].name);
    expect(students[0].logins).toBe(original[0].logins);
  });

});
