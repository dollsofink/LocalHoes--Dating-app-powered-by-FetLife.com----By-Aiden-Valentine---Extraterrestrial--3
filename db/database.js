import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

class AppDAO {
  constructor(dbFilePath) {
    this.dbFilePath = dbFilePath;
    this.db = null;
  }

  async connect() {
    this.db = await open({
      // filename: '../database.sqlite',
      filename: this.dbFilePath,
      driver: sqlite3.Database,
    });
    // Create tables if they don't exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
		description TEXT,
        slug TEXT NOT NULL
      );
    `);
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users_families (
        user_id INTEGER NOT NULL,
        family_id INTEGER NOT NULL,
		PRIMARY KEY (user_id, family_id)
      );
    `);
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users_messages (
        user_id INTEGER NOT NULL,
        message_id INTEGER NOT NULL,
		PRIMARY KEY (user_id, message_id)
      );
    `);
    console.log('Database connected and tables ensured.');
    return this.db;
  }

  run(sql, params = []) {
    return this.db.run(sql, params);
  }

  get(sql, params = []) {
    return this.db.get(sql, params);
  }

  all(sql, params = []) {
    return this.db.all(sql, params);
  }
}

export default AppDAO;
