import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ADMIN-2024';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.query;

    // Проверяем админ-пароль
    if (password !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await client.connect();
    const db = client.db('money-mindset');
    const collection = db.collection('sessions');

    // Получаем уникальных пользователей и их статистику
    const users = await collection.aggregate([
      {
        $group: {
          _id: '$userId',
          totalSessions: { $sum: 1 },
          lastActive: { $max: '$serverTimestamp' },
          beliefs: { $push: '$belief' },
          emotions: { $push: '$emotion' }
        }
      },
      {
        $project: {
          userId: '$_id',
          totalSessions: 1,
          totalCoins: { $multiply: ['$totalSessions', 10] },
          lastActive: 1,
          beliefs: 1,
          emotions: 1
        }
      },
      {
        $sort: { lastActive: -1 }
      }
    ]).toArray();

    return res.status(200).json({ users, total: users.length });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ error: 'Failed to get users' });
  } finally {
    await client.close();
  }
}
