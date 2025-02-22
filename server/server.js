import express from 'express';
import axios from 'axios';
import cors from 'cors'; 

import { db, initializeDatabase } from './db/database.js';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/init', async (req, res) => {
  try {
    await initializeDatabase();
    

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM transactions', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

   
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      const stmt = db.prepare(`
        INSERT INTO transactions (id, title, description, price, category, sold, image, dateOfSale)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const t of transactions) {
        stmt.run([t.id, t.title, t.description, t.price, t.category, t.sold ? 1 : 0, t.image, t.dateOfSale]);
      }

      stmt.finalize();
      db.run('COMMIT');
    });

    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', (req, res) => {
  const { month, search = '', page = 1, perPage = 10 } = req.query;
  const offset = (page - 1) * perPage;
  
  const whereClause = `
    WHERE strftime('%m', dateOfSale) = ?
    ${search ? 'AND (title LIKE ? OR description LIKE ? OR price LIKE ?)' : ''}
  `;
  const params = search 
    ? [`${new Date(month + ' 1').getMonth() + 1}`.padStart(2, '0'), `%${search}%`, `%${search}%`, `%${search}%`]
    : [`${new Date(month + ' 1').getMonth() + 1}`.padStart(2, '0')];

  db.all(`
    SELECT * FROM transactions
    ${whereClause}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(perPage), parseInt(offset)], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get(`SELECT COUNT(*) as total FROM transactions ${whereClause}`, params, (err, count) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        transactions: rows,
        total: count.total,
        page: parseInt(page),
        perPage: parseInt(perPage)
      });
    });
  });
});

// API-1
app.get('/api/all-transactions', (req, res) => {
  db.all(`SELECT * FROM transactions`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ transactions: rows });
  });
});

// API-2
app.get('/api/statistics', (req, res) => {
  const { month } = req.query;
  const monthNum = `${new Date(month + ' 1').getMonth() + 1}`.padStart(2, '0');

  db.get(`
    SELECT 
      SUM(price) as totalSale,
      SUM(CASE WHEN sold = 1 THEN 1 ELSE 0 END) as soldItems,
      SUM(CASE WHEN sold = 0 THEN 1 ELSE 0 END) as notSoldItems
    FROM transactions
    WHERE strftime('%m', dateOfSale) = ?
  `, [monthNum], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});


// API-3
app.get('/api/barchart', (req, res) => {
    const { month } = req.query;
    const monthNum = `${new Date(month + ' 1').getMonth() + 1}`.padStart(2, '0');
  
    const ranges = [
      [0, 100], [101, 200], [201, 300], [301, 400], [401, 500],
      [501, 600], [601, 700], [701, 800], [801, 900], [901, Infinity]
    ];
  
    const queries = ranges.map(([min, max]) => {
      return new Promise((resolve, reject) => {
        db.get(`
          SELECT COUNT(*) as count
          FROM transactions
          WHERE strftime('%m', dateOfSale) = ?
          AND price >= ? AND price ${max === Infinity ? '>' : '<='} ?
        `, [monthNum, min, max === Infinity ? 900 : max], (err, row) => {
          if (err) {
            console.error('Database error:', err);
            return reject(err); 
          }
          resolve({ range: `${min}-${max === Infinity ? 'above' : max}`, count: row ? row.count : 0 });
        });
      });
    });
  
    Promise.all(queries)
      .then(results => res.json(results))
      .catch(err => res.status(500).json({ error: 'Failed to fetch bar chart data', details: err.message }));
  });

// API-4
app.get('/api/piechart', (req, res) => {
  const { month } = req.query;
  const monthNum = `${new Date(month + ' 1').getMonth() + 1}`.padStart(2, '0');

  db.all(`
    SELECT category, COUNT(*) as count
    FROM transactions
    WHERE strftime('%m', dateOfSale) = ?
    GROUP BY category
  `, [monthNum], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API-5
app.get('/api/combined', async (req, res) => {
  const { month } = req.query;
  try {
    const [stats, bar, pie] = await Promise.all([
      axios.get(`http://localhost:3000/api/statistics?month=${month}`),
      axios.get(`http://localhost:3000/api/barchart?month=${month}`),
      axios.get(`http://localhost:3000/api/piechart?month=${month}`)
    ]);
    res.json({
      statistics: stats.data,
      barChart: bar.data,
      pieChart: pie.data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));