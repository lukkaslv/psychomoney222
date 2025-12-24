// ============================================
// api/save-session.js
// Сохранение сессии пользователя
// ============================================

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, sessionData } = req.body;

    if (!userId || !sessionData) {
      return res.status(400).json({ error: 'Missing userId or sessionData' });
    }

    await client.connect();
    const db = client.db('money-mindset');
    const collection = db.collection('sessions');

    // Добавляем временную метку сервера
    const session = {
      userId,
      ...sessionData,
      serverTimestamp: new Date().toISOString()
    };

    await collection.insertOne(session);

    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Save session error:', error);
    return res.status(500).json({ error: 'Failed to save session' });
  } finally {
    await client.close();
  }
}
