// 1. State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const taskCountLabel = document.getElementById('task-count');

// Priority weight for sorting
const priorityWeight = {
    'high': 3,
    'medium': 2,
    'low': 1
};

// 2. Core Functions
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-card priority-${task.priority}`;
        li.draggable = true;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <div class="task-meta">
                    <span>Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    <span>Due: ${formatDate(task.dueDate)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn btn-edit" onclick="openEditModal('${task.id}')">
                    ✎
                </button>
                <button class="action-btn btn-delete" onclick="deleteTask('${task.id}')">
                    ✕
                </button>
            </div>
        `;

        // Drag events
        li.addEventListener('dragstart', () => li.classList.add('dragging'));
        li.addEventListener('dragend', () => li.classList.remove('dragging'));

        taskList.appendChild(li);
    });

    taskCountLabel.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
}

function formatDate(dateStr) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// 3. CRUD Operations
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTask = {
        id: Date.now().toString(),
        title: document.getElementById('task-title').value,
        priority: document.getElementById('task-priority').value,
        dueDate: document.getElementById('task-due-date').value,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    taskForm.reset();
    saveTasks();
});

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
    }
}

// 4. Modal / Update Logic
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-due-date').value = task.dueDate;

    editModal.classList.add('show');
}

document.getElementById('close-modal').onclick = () => editModal.classList.remove('show');

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-task-id').value;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex !== -1) {
        tasks[taskIndex].title = document.getElementById('edit-task-title').value;
        tasks[taskIndex].priority = document.getElementById('edit-task-priority').value;
        tasks[taskIndex].dueDate = document.getElementById('edit-task-due-date').value;

        saveTasks();
        editModal.classList.remove('show');
    }
});

// 5. Sorting Logic
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.sort-btn.active').classList.remove('active');
        btn.classList.add('active');

        const sortBy = btn.dataset.sort;

        if (sortBy === 'date') {
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortBy === 'priority') {
            tasks.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
        }

        renderTasks();
    });
});

// 6. Drag and Drop Reordering
taskList.addEventListener('dragover', e => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const siblings = [...taskList.querySelectorAll('.task-card:not(.dragging)')];

    const nextSibling = siblings.find(sibling => {
        return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });

    taskList.insertBefore(draggingItem, nextSibling);
});

taskList.addEventListener('drop', () => {
    // Update tasks array based on new DOM order
    const newOrder = [...taskList.querySelectorAll('.task-card')].map(li => {
        return tasks.find(t => t.id === li.dataset.id);
    });
    tasks = newOrder;
    localStorage.setItem('tasks', JSON.stringify(tasks));
});

// Initialize
renderTasks();
