export default class MessageController {
  constructor(dao) {
    if (!dao) {
      throw new Error("FamilyController requires a DAO instance");
    }
    this.dao = dao;
  }

	getMessages() {
	  return new Promise((res, rej) =>
		db.all(
		  "SELECT * FROM messages WHERE isArchived = 0 ORDER BY dateCreated DESC",
		  (e, r) => (e ? rej(e) : res(r))
		)
	  );
	}

	createMessage({ subject, body, userIds }) {
	  return new Promise((res, rej) => {
		db.run(
		  "INSERT INTO messages (subject, body) VALUES (?, ?)",
		  [subject, body],
		  function (err) {
			if (err) return rej(err);

			const stmt = db.prepare(
			  "INSERT INTO users_messages (message_id, user_id) VALUES (?, ?)"
			);
			userIds.forEach(uid => stmt.run(this.lastID, uid));
			stmt.finalize();

			res(this.lastID);
		  }
		);
	  });
	}

	updateMessage(id, { subject, body }) {
	  return new Promise((res, rej) =>
		db.run(
		  "UPDATE messages SET subject=?, body=? WHERE id=?",
		  [subject, body, id],
		  e => (e ? rej(e) : res())
		)
	  );
	}

	deleteMessage(id) {
	  return new Promise((res, rej) =>
		db.run("DELETE FROM messages WHERE id=?", [id], e =>
		  e ? rej(e) : res()
		)
	  );
	}

	archiveMessage(id) {
	  return new Promise((res, rej) =>
		db.run(
		  "UPDATE messages SET isArchived=1 WHERE id=?",
		  [id],
		  e => (e ? rej(e) : res())
		)
	  );
	}

	/*
	 * MESSAGE QUEUE
	 */
	enqueueMessage(message_id, priority = 0) {
	  return new Promise((res, rej) =>
		db.run(
		  "INSERT INTO message_queue (message_id, priority) VALUES (?, ?)",
		  [message_id, priority],
		  e => (e ? rej(e) : res())
		)
	  );
	}

	getNextQueueItem(cooldownMinutes) {
	  return new Promise((res, rej) =>
		db.get(
		  `
		  SELECT *
		  FROM message_queue
		  WHERE status = 'pending'
			AND (
			  lastAttempt IS NULL
			  OR datetime(lastAttempt, '+' || ? || ' minutes') <= datetime('now')
			)
		  ORDER BY priority DESC, createdAt ASC
		  LIMIT 1
		  `,
		  [cooldownMinutes],
		  (e, r) => (e ? rej(e) : res(r))
		)
	  );
	}

	markSending(id) {
	  return new Promise((res, rej) =>
		db.run(
		  `
		  UPDATE message_queue
		  SET status='sending',
			  attempts = attempts + 1,
			  lastAttempt = CURRENT_TIMESTAMP
		  WHERE id = ?
		  `,
		  [id],
		  e => (e ? rej(e) : res())
		)
	  );
	}

	markPending(id) {
	  return new Promise((res, rej) =>
		db.run(
		  "UPDATE message_queue SET status='pending' WHERE id=?",
		  [id],
		  e => (e ? rej(e) : res())
		)
	  );
	}

	removeQueueItem(id) {
	  return new Promise((res, rej) =>
		db.run("DELETE FROM message_queue WHERE id=?", [id], e =>
		  e ? rej(e) : res()
		)
	  );
	}

	listQueue() {
	  return new Promise((res, rej) =>
		db.all(
		  `
		  SELECT q.*, m.subject
		  FROM message_queue q
		  JOIN messages m ON m.id = q.message_id
		  ORDER BY priority DESC, createdAt ASC
		  `,
		  (e, r) => (e ? rej(e) : res(r))
		)
	  );
	}

}
