/*************************************************
 * CHARTS — побудова графіків
 *************************************************/
function drawChart(students = []) {
  const ctx = document.getElementById('chart');
  if (!ctx) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: students.map(s => s.name || "—"),
      datasets: [{
        label: 'Оцінки',
        data: students.map(s => s.grade || 0),
        backgroundColor: ['#c0392b', '#e74c3c', '#ff6b6b']
      }]
    }
  });
}

function drawClusterChart(students = []) {
  const ctx = document.getElementById('clusterChart');
  if (!ctx) return;

  if (clusterChartInstance) {
    clusterChartInstance.destroy();
  }

  const clusters = {};

  students.forEach(s => {
    const key = s.cluster ?? 0;

    if (!clusters[key]) {
      clusters[key] = [];
    }

    clusters[key].push({
      x: s.logins,
      y: s.grade,

      name: s.name,
      status: s.status,
      assignments: s.assignments_completed,
      timeSpent: s.time_spent
    });
  });

  const datasets = Object.keys(clusters).map(c => ({
    label: `Група ${c}`,
    data: clusters[c],
    backgroundColor: clusters[c].map(p =>
      p.status === 'ризик'
        ? '#e74c3c'
        : '#2ecc71'
    ),
    pointRadius: 7,
    pointHoverRadius: 10
  }));

  clusterChartInstance = new Chart(ctx, {
    type: 'scatter',

    data: {
      datasets
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          display: true
        },

        tooltip: {
          callbacks: {
            label(context) {
              const point = context.raw;

              return [
                `Студент: ${point.name}`,
                `Оцінка: ${point.y}`,
                `Логіни: ${point.x}`,
                `Завдання: ${point.assignments}`,
                `Час активності: ${point.timeSpent}`,
                `Статус: ${point.status}`
              ];
            }
          }
        }
      },

      scales: {
        x: {
          title: {
            display: true,
            text: 'Кількість логінів'
          }
        },

        y: {
          title: {
            display: true,
            text: 'Оцінка'
          },
          min: 0,
          max: 100
        }
      }
    }
  });
}

function getClusterColor(c) {
  const colors = ['#3498db', '#2ecc71', '#f1c40f'];
  return colors[c] ?? '#95a5a6';
}
