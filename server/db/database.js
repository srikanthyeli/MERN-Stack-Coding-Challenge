import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('trasaction');

const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE transactions (
          id INTEGER PRIMARY KEY,
          title VARCHAR(200),
          description TEXT,
          price INTEEGER,
          category TEXT,
          sold BOOLEAN,
          image TEXT,
          dateOfSale DATETIME
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

export { db, initializeDatabase };