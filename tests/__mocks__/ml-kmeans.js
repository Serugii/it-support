function kmeans(data, k) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('kmeans mock: data must be a non-empty array');
  }
  const clusters = data.map((_, i) => i % k);
  return { clusters };
}

module.exports = { kmeans };
