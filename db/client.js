import sqlite3 from 'sqlite3'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Enable verbose mode
sqlite3.verbose();
    
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(__dirname + '/../db/database.sqlite')

var dbFile = "database.sqlite"

// Open a database connection (creates the file if it doesn't exist)
var client = new sqlite3.Database(dbFile, (err) => {
  if (err) {
	console.error(err.message);
  } else {
	console.log('Connected to the SQLite database.');
	// Run the insertion logic after a successful connection
  }
});

export {
	client
}