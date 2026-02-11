import { createQuestionMarkString } from "../classes/helpers.mjs"
import { client as db } from "./client.js"

class Messages {
	constructor() {
		this.tableName = "messages"
	}
	
	async insert(data) {
		var array = []
		array.push(data)
		// Loop over incoming data Array
		for await (const record of array) {
			this.insertSqlCommand(record)
		}
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
		const insertSql = `INSERT INTO ${this.tableName} (${columnNames}) VALUES (${placeholders})`;

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
	
	createTable() {
		const createTableSql = `
			CREATE TABLE IF NOT EXISTS ${this.tableName} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				message_id INTEGER NULL,
				isArchived INTEGER NOT NULL DEFAULT 0,
				subject TEXT NULL,
				body TEXT NULL,
				createdAt TEXT NULL DEFAULT CURRENT_TIMESTAMP
			);
		`;
	  db.run(createTableSql, async (err) => {
		if (err) {
		  console.error(err.message);
		  return;
		}
		console.log('Table ensured to exist.');
		
	  });
	}
}

var messages = new Messages()
messages.createTable()
messages.insert({
	message_id: 1,
	subject: "Test",
	body: "This is a test of the emergency broadcast system."
})

// export {
	// createTable,
	// insert
// }