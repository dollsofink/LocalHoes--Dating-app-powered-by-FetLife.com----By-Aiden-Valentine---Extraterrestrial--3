import sqlite3 from 'sqlite3'

// Open a database connection (creates the file if it doesn't exist)
let db = new sqlite3.Database('../db/database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Run the insertion logic after a successful connection
    // insertData(db);
  }
});

export function insertData(db) {
  // First, ensure the table exists
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `;

  db.run(createTableSql, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('Table ensured to exist.');

    // SQL statement to insert data with placeholders
    const insertSql = `INSERT INTO users (name, email) VALUES (?, ?)`;
    const name = 'John Doe';
    const email = 'john.doe@example.com';

    // Execute the INSERT statement using the run() method
    db.run(insertSql, [name, email], function(err) {
      if (err) {
        // Handle potential errors (e.g., unique constraint violation)
        return console.error(err.message);
      }
      // Log the ID of the newly inserted row
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
  });
}

// Close the database connection when all operations are done
// In a real application, you might close the DB when the app shuts down
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Closed the database connection.');
});