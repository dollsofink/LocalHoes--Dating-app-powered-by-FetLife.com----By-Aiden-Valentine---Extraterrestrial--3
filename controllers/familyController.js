export default class FamilyController {
  constructor(dao) {
    if (!dao) {
      throw new Error("FamilyController requires a DAO instance");
    }
    this.dao = dao;
  }

  async createFamily({ name, description, slug }) {
    const result = await this.dao.run(
      `INSERT INTO families (name, description, slug)
       VALUES (?, ?, ?)`,
      [name, description ?? null, slug]
    );

    return this.getFamilyById(result.lastID);
  }

  async getFamilyById(id) {
    return this.dao.get(
      `SELECT * FROM families WHERE id = ?`,
      [id]
    );
  }

  async getFamilyByName(name) {
    return this.dao.get(
      `SELECT * FROM families WHERE name = ?`,
      [name]
    );
  }

  async getFamilies() {
    return this.dao.all(`SELECT * FROM families`);
  }

  async updateFamily(id, { name, description, slug }) {
    await this.dao.run(
      `UPDATE families
       SET name = ?, description = ?, slug = ?
       WHERE id = ?`,
      [name, description ?? null, slug, id]
    );

    return this.getFamilyById(id);
  }

  async deleteFamily(id) {
    await this.dao.run(
      `DELETE FROM families WHERE id = ?`,
      [id]
    );

    return { message: `Family ${id} deleted` };
  }

  async addUserToFamily({ userId, familyId }) {
    await this.dao.run(
      `INSERT OR IGNORE INTO users_families (user_id, family_id)
       VALUES (?, ?)`,
      [userId, familyId]
    );

    return { message: "User added to family" };
  }
}
