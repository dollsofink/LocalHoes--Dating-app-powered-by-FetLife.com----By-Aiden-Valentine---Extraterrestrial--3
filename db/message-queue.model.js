const createTableSql = `
CREATE TABLE message_queue (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	message_id INTEGER NOT NULL,
	priority INTEGER NOT NULL DEFAULT 0,
	attempts INTEGER NOT NULL DEFAULT 0,
	lastAttempt TEXT NULL,
	status TEXT NOT NULL DEFAULT 'pending', -- pending | sending
	createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

export {
	createTableSql: createTableSql
}