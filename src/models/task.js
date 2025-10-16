const { pool } = require('../config/db');

class Task {
    static async createTask(title) {
        const text = `
            INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, created_at
        `;
        const values = [title];

        const res = await pool.query(text, values);

        const row = res.rows[0];
        return {
            id: row.id,
            title: row.title,
            createdAt: row.created_at
        };
    }

    static async listTasks() {
        const text = `
            SELECT id, title, created_at FROM tasks ORDER BY created_at ASC
        `;

        const res = await pool.query(text);
        return res.rows.map(row => ({
            id: row.id,
            title: row.title,
            createdAt: row.created_at
        }));
    }

    static async deleteTaskById(id) {
        const text = `
            DELETE FROM tasks WHERE id = $1 RETURNING id
        `;
        const values = [id];

        const res = await pool.query(text, values);
        return res.rowCount > 0;
    }
}

module.exports = Task;