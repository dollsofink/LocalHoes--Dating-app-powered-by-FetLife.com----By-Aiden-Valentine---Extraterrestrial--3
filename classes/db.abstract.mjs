import sqlite3 from 'sqlite3'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Enable verbose mode
sqlite3.verbose();

const __dirname = dirname(fileURLToPath(import.meta.url));

class Database {
	constructor() {
		console.log(__dirname + '/../db/database.sqlite')
	}

	// Open a database connection (creates the file if it doesn't exist)
	let db = new sqlite3.Database('database.sqlite', (err) => {
	  if (err) {
		console.error(err);
	  } else {
		console.log('Connected to the SQLite database.');
		// Run the insertion logic after a successful connection
		// insert(db);
	  }
	});

	insert(data) {
		var array = []
		array.push(data)
		
	  // First, ensure the table exists
	  const createTableSql = `
		CREATE TABLE IF NOT EXISTS users (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  user_id INTEGER NULL,
		  user TEXT NOT NULL UNIQUE,
		  age INTEGER NOT NULL,
		  role TEXT NULL,
		  gender TEXT NULL,
		  city TEXT NULL,
		  state TEXT NULL,
		  email TEXT NULL,
		  phone TEXT NULL,
		  website TEXT NULL,
		  isSexy INTEGER NULL,
		  followers INTEGER NOT NULL DEFAULT 0,
		  following INTEGER NOT NULL DEFAULT 0,
		  isFollowing INTEGER NOT NULL DEFAULT 0,
		  isFollowingBack INTEGER NOT NULL DEFAULT 0,
		  isFriend INTEGER NOT NULL DEFAULT 0,
		  messageCount INTEGER NOT NULL DEFAULT 0,
		  picturesCount INTEGER NOT NULL DEFAULT 0,
		  videosCount INTEGER NOT NULL DEFAULT 0,
		  postsCount INTEGER NOT NULL DEFAULT 0,
		  lastOnline TEXT NULL DEFAULT CURRENT_TIMESTAMP,
		  createdAt TEXT NULL DEFAULT CURRENT_TIMESTAMP
		  
		);
	  `;

	  db.run(createTableSql, async (err) => {
		if (err) {
		  console.error(err.message);
		  return;
		}
		console.log('Table ensured to exist.');
		
		// Loop over incoming data Array
		for await (const user of array) {
			insertSqlCommand(user)
		}
		
	  });
	}

	insertSqlCommand(record) {
		console.log(record)

		// Dynamic SQL command from data
		const cols = Object.keys(record);
		const columnNames = cols.join(', ')
		const valuesArray = Object.values(record);
		const placeholders = createQuestionMarkString(cols.length);
		console.log(placeholders)

		// SQL statement to insert data with placeholders
		const insertSql = `INSERT INTO users (${columnNames}) VALUES (${placeholders})`;

		// Execute the INSERT statement using the run() method
		db.run(insertSql, valuesArray, function(err) {
		  if (err) {
			// Handle potential errors (e.g., unique constraint violation)
			return console.error(err.message);
		  }
		  // Log the ID of the newly inserted row
		  console.log(`A row has been inserted with rowid ${this.lastID}`);
		});

	}
}