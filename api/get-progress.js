// ============================================
// api/get-progress.js
// Получение прогресса пользователя
// ============================================

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    await client.connect();
    const db = client.db('money-mindset');
    const collection = db.collection('sessions');

    // Получаем все сессии пользователя
    const sessions = await collection
      .find({ userId })
      .sort({ serverTimestamp: -1 })
      .toArray();

    // Подсчитываем статистику
    const stats = {
      totalSessions: sessions.length,
      totalCoins: sessions.length * 10,
      beliefCounts: {},
      emotionCounts: {}
    };

    sessions.forEach(session => {
      // Считаем убеждения
      stats.beliefCounts[session.belief] = 
        (stats.beliefCounts[session.belief] || 0) + 1;
      
      // Считаем эмоции
      stats.emotionCounts[session.emotion] = 
        (stats.emotionCounts[session.emotion] || 0) + 1;
    });

    return res.status(200).json({ sessions, stats });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({ error: 'Failed to get progress' });
  } finally {
    await client.close();
  }
}
