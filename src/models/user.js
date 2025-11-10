const { pool, mongoose } = require('../config/db');
const dbClient = (process.env.DB_USER || 'postgres').toLowerCase();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

let UserModel = null;
function ensureUserModel() {
    if (UserModel) {
        return UserModel;
    }
    const { Schema } = mongoose;
    const userSchema = new Schema({
        nom: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        token: { type: String }
    });
    
    // Avant sauvegarde : hash du mot de passe
    userSchema.pre('save', async function (next) {
        if (!this.isModified('password')) {
            return next();
        }
        this.password = await bcrypt.hash(this.password, 10);
        next();
    });

    // Méthode pour générer un JWT
    userSchema.method('generateAuthToken', function () {
        const token = jwt.sign(
            {
                id: this._id,
                email: this.email,
                nom: this.nom
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        this.token = token;
        return token;
    });

    // Méthode pour comparer les mots de passe
    userSchema.method('comparePassword', async function (plainPassword) {
        return bcrypt.compare(plainPassword, this.password);
    });

    UserModel = mongoose.models.User || mongoose.model('User', userSchema);
    return UserModel;
}

class User {
    static async createUser(nom, email, password) {
        if (dbClient === 'mongo') {
            const Model = ensureUserModel();
            const user = new Model({ nom, email, password });
            await user.save();
            const token = user.generateAuthToken();
            return { id: user._id.toString(), nom: user.nom, email: user.email, token };
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const text = 'INSERT INTO users (nom, email, password) VALUES ($1, $2, $3) RETURNING id, nom, email';
            const res = await pool.query(text, [nom, email, hashedPassword]);
            const row = res.rows[0];
            const token = jwt.sign(
                {   
                    id: row.id,
                    email: row.email,
                    nom: row.nom
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            return { id: row.id, nom: row.nom, email: row.email, token };
        }
    }

    static async findByEmail(email) {
        if (dbClient === 'mongo') {
            const Model = ensureUserModel();
            return Model.findOne({ email }).exec();
        } else {
            const text = 'SELECT id, nom, email, password FROM users WHERE email = $1';
            const res = await pool.query(text, [email]);
            return res.rows[0] || null;
        }
    }

    static async deleteUserById(id) {
        if (dbClient === 'mongo') {
            const Model = ensureUserModel();
            const res = await Model.findByIdAndDelete(id).exec();
            return !!res;
        } else {
            const text = 'DELETE FROM users WHERE id = $1 RETURNING id';
            const res = await pool.query(text, [id]);
            return res.rowCount > 0;
        }
    }
}

module.exports = User;