function classifyStudent(student) {
  if (
    student.grade < 60 ||
    student.logins < 10 ||
    student.time_spent < 5
  ) {
    return "ризик";
  }
  return "норма";
}

function classifyAll(students) {
  return students.map(s => ({
    ...s,
    status: classifyStudent(s)
  }));
}

module.exports = { classifyAll };