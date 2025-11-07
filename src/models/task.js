const { pool, mongoose } = require('../config/db');
const dbClient = (process.env.DB_TASK || 'postgres').toLowerCase();

let TaskModel = null;
function ensureTaskModel() {
    if (TaskModel) {
        return TaskModel;
    }
    const { Schema } = mongoose;
    const taskSchema = new Schema({
        title: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now }
    });

    taskSchema.method('toResponse', function () {
        return { id: this._id.toString(), title: this.title, createdAt: this.createdAt };
    });

    TaskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);
    return TaskModel;
}

class Task {
    static async createTask(title) {
        if (dbClient === 'mongo') {
            const Model = ensureTaskModel();
            const doc = new Model({ title });
            await doc.save();
            return doc.toResponse();
        } else {
            const text = 'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, created_at';
            const res = await pool.query(text, [title]);
            const row = res.rows[0];
            return { id: row.id, title: row.title, createdAt: row.created_at };
        }
    }

    static async listTasks() {
        if (dbClient === 'mongo') {
            const Model = ensureTaskModel();
            const rows = await Model.find().sort({ createdAt: 1 }).exec();
            return rows.map(row => row.toResponse());
        } else {
            const text = 'SELECT id, title, created_at FROM tasks ORDER BY created_at ASC';
            const res = await pool.query(text);
            return res.rows.map(row => ({ id: row.id, title: row.title, createdAt: row.created_at }));
        }
    }

    static async deleteTaskById(id) {
        if (dbClient === 'mongo') {
            const Model = ensureTaskModel();
            const res = await Model.findByIdAndDelete(id).exec();
            return !!res;
        } else {
            const text = 'DELETE FROM tasks WHERE id = $1 RETURNING id';
            const res = await pool.query(text, [id]);
            return res.rowCount > 0;
        }
    }
}

module.exports = Task;