const express = require('express');
const path = require('path');
const config = require('./config/config.json');

const { classifyAll } = require('./analysis/classification');
const { clusterStudents } = require('./analysis/clustering');
const { log } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/analyze', (req, res) => { // перетворення та валідація вхідних даних
  try {
    log(`[${config.appName}] Отримано запит на аналіз`);

    let students = req.body.students || [];

    students = students.map(s => ({
      name: s.name,
      logins: Number(s.logins),
      time_spent: Number(s.time_spent),
      assignments_completed: Number(s.assignments_completed),
      grade: Number(s.grade)
    })).filter(s =>
      s.name &&
      Number.isFinite(s.logins) &&
      Number.isFinite(s.time_spent) &&
      Number.isFinite(s.assignments_completed) &&
      Number.isFinite(s.grade)
    );

    log(`Студентів після фільтрації: ${students.length}`);

    if (students.length === 0) {
      log("Немає валідних студентів");
      return res.json({
        students: [],
        riskCount: 0
      });
    }

    const classified = classifyAll(students);
    log("Класифікація завершена");

    let clustered;
    if (students.length < 2) {
      clustered = classified.map(s => ({
        ...s,
        cluster: 0
      }));
    } else {
      clustered = clusterStudents(classified);
    }

    log("Кластеризація завершена");

    const riskStudents = clustered.filter(s => s.status === 'ризик');

    log(`Знайдено ризикових студентів: ${riskStudents.length}`);

    res.json({
      students: clustered,
      riskCount: riskStudents.length
    });

  } catch (err) {
    log("ПОМИЛКА: " + err.message);
    console.error("ANALYZE ERROR:", err);

    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`${config.appName} v${config.version}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/api/info', (req, res) => {
  res.json({
    appName: config.appName,
    version: config.version
  });
});