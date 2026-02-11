import sqlite3 from 'sqlite3'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Enable verbose mode
sqlite3.verbose();
    
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(__dirname + '/../db/database.sqlite')

// Open a database connection (creates the file if it doesn't exist)
let db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Run the insertion logic after a successful connection
    // insert(db);
  }
});

export function insert(data) {
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

function insertSqlCommand(record) {
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

/**
 * Ensures the input is an array, converting a single string into a single-item array if necessary.
 * @param {string|string[]} input The variable to check and convert.
 * @returns {string[]} The resulting array.
 */
function ensureArray(input) {
  if (typeof input === 'string') {
    return [input];
  }
  // Optional: check if it's an array for robustness, though if it's not a string, it might be something else
  if (Array.isArray(input)) {
    return input;
  }
  // Handle other potential data types (e.g., null, undefined, number, object)
  // You might want to return an empty array, the value wrapped in an array, or throw an error depending on requirements.
  // Returning an empty array for null/undefined is a common pattern:
  if (input === null || typeof input === 'undefined') {
    return [];
  }
  return [input]; 
}

/**
 * Creates a comma-separated string of question marks.
 * @param {number} count The number of question marks to generate.
 * @returns {string} A string like '?, ?, ?'.
 */
function createQuestionMarkString(count) {
  if (count <= 0) {
    return '';
  }
  // Creates an array of 'count' length, fills it with '?', and joins with ', '
  return Array(count).fill('?').join(', ');
}

var data = [
	{
		user: 'aidenvalentine',
		user_id: 666,
		age: 35,
		role: "Dom",
		gender: "M",
		email: 'DollsOfInk@gmail.com'
	},
	{
		user: 'kitanakojima',
		user_id: 626,
		age: 38,
		role: "Domme",
		gender: "F",
		email: 'KitanaKojima@gmail.com'
	}
]

// Close the database connection when all operations are done
// In a real application, you might close the DB when the app shuts down
/*
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Closed the database connection.');
});
*/

/*
export {
	users: insert
}
*/