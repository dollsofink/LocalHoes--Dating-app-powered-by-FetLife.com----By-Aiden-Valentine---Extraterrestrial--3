const createTableSql = `
	CREATE TABLE IF NOT EXISTS user_message (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		message_id INTEGER NOT NULL
	);
`;

export {
	createTableSql: createTableSql
}