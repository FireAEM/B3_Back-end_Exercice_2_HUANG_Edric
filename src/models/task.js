class Task {
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }

    toJSON() {
        return { id: this.id, title: this.title };
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
    }

    add(title) {
        const newId = this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id + 1 : 1;
        const task = new Task(newId, title);
        this.tasks.push(task);
        return task;
    }

    list() {
        return this.tasks.slice();
    }

    delete(id) {
        const before = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        return this.tasks.length < before;
    }
}

module.exports = { Task, TaskManager };