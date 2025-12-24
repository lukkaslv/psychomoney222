import scenarios from '../data/scenarios.json';

// Функция для получения 5 случайных сценариев на день
function getDailyScenarios(userId, date) {
  // Используем userId и дату как seed для генерации
  const seed = `${userId}-${date}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }

  // Создаём детерминированную случайность
  const random = (n) => {
    hash = (hash * 9301 + 49297) % 233280;
    return (hash / 233280) * n;
  };

  // Перемешиваем сценарии
  const shuffled = [...scenarios];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Возвращаем первые 5
  return shuffled.slice(0, 5);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Получаем текущую дату (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Получаем сценарии для этого пользователя на сегодня
    const dailyScenarios = getDailyScenarios(userId, today);

    return res.status(200).json({ scenarios: dailyScenarios, date: today });
  } catch (error) {
    console.error('Get scenarios error:', error);
    return res.status(500).json({ error: 'Failed to get scenarios' });
  }
}
