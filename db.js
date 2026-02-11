import sqlite3 from "sqlite3";
import path from "path";

const db = new sqlite3.Database("./database.sqlite");

export function buildWhereClause(query) {
  if (!query) return { where: "", params: [] };

  const parts = query.split(",").map(p => p.trim());
  const clauses = [];
  const params = [];

  for (const part of parts) {
    const [fieldRaw, valueRaw] = part.split(":").map(s => s.trim());
    if (!valueRaw) continue;

    const field = fieldRaw.toLowerCase();
    const value = valueRaw;

    if (field === "age") {
      if (value.includes("-")) {
        const [min, max] = value.split("-").map(Number);
        clauses.push("age BETWEEN ? AND ?");
        params.push(min, max);
      } else if (value.endsWith("+")) {
        clauses.push("age >= ?");
        params.push(Number(value.replace("+", "")));
      }
    } else {
      clauses.push(`${field} LIKE ?`);
      params.push(`%${value}%`);
    }
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params
  };
}

export function getUsers(searchQuery, limit, offset=0) {
  return new Promise((resolve, reject) => {
    const { where, params } = buildWhereClause(searchQuery);

    db.all(
      `SELECT * FROM users ${where} ORDER BY createdAt DESC LIMIT ${limit}`,
      params,
      (err, rows) => (err ? reject(err) : resolve(rows.slice(offset, offset + limit)))
    );
  });
}

/*
 * MESSAGES
 */
 
export function getMessages() {
  return new Promise((res, rej) =>
    db.all(
      "SELECT * FROM messages WHERE isArchived = 0 ORDER BY dateCreated DESC",
      (e, r) => (e ? rej(e) : res(r))
    )
  );
}

export function createMessage({ subject, body, userIds }) {
  return new Promise((res, rej) => {
    db.run(
      "INSERT INTO messages (subject, body) VALUES (?, ?)",
      [subject, body],
      function (err) {
        if (err) return rej(err);

        const stmt = db.prepare(
          "INSERT INTO user_message (message_id, user_id) VALUES (?, ?)"
        );
        userIds.forEach(uid => stmt.run(this.lastID, uid));
        stmt.finalize();

        res(this.lastID);
      }
    );
  });
}

export function updateMessage(id, { subject, body }) {
  return new Promise((res, rej) =>
    db.run(
      "UPDATE messages SET subject=?, body=? WHERE id=?",
      [subject, body, id],
      e => (e ? rej(e) : res())
    )
  );
}

export function deleteMessage(id) {
  return new Promise((res, rej) =>
    db.run("DELETE FROM messages WHERE id=?", [id], e =>
      e ? rej(e) : res()
    )
  );
}

export function archiveMessage(id) {
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
export function enqueueMessage(message_id, priority = 0) {
  return new Promise((res, rej) =>
    db.run(
      "INSERT INTO message_queue (message_id, priority) VALUES (?, ?)",
      [message_id, priority],
      e => (e ? rej(e) : res())
    )
  );
}

export function getNextQueueItem(cooldownMinutes) {
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

export function markSending(id) {
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

export function markPending(id) {
  return new Promise((res, rej) =>
    db.run(
      "UPDATE message_queue SET status='pending' WHERE id=?",
      [id],
      e => (e ? rej(e) : res())
    )
  );
}

export function removeQueueItem(id) {
  return new Promise((res, rej) =>
    db.run("DELETE FROM message_queue WHERE id=?", [id], e =>
      e ? rej(e) : res()
    )
  );
}

export function listQueue() {
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
