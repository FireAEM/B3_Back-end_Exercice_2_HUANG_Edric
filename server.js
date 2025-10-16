require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./src/routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('ToDoList API Express');
});

app.use('/tasks', tasksRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});