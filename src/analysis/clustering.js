const kmeans = require('ml-kmeans').default;

function clusterStudents(students) {
  if (!students || students.length === 0) {
    return students;
  }

  const cleanStudents = students.filter(s =>
    Number.isFinite(s.logins) &&
    Number.isFinite(s.time_spent) &&
    Number.isFinite(s.assignments_completed)
  );

  if (cleanStudents.length === 0) {
    return students.map(s => ({ ...s, cluster: 0 }));
  }

  const data = cleanStudents.map(s => [
    s.logins,
    s.time_spent,
    s.assignments_completed
  ]);

  const k = Math.min(3, cleanStudents.length);

  let result;

  try {
    result = kmeans(data, k);
  } catch (err) {
    console.error("KMEANS ERROR:", err);
    return students.map(s => ({ ...s, cluster: 0 }));
  }

  let index = 0;

  return students.map(s => {
    if (
      Number.isFinite(s.logins) &&
      Number.isFinite(s.time_spent) &&
      Number.isFinite(s.assignments_completed)
    ) {
      return {
        ...s,
        cluster: result.clusters[index++]
      };
    }

    return { ...s, cluster: 0 };
  });
}

module.exports = { clusterStudents };