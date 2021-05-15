// User Interface 
const complete = document.querySelector('.complete');
const incomplete = document.querySelector('.incomplete');
const submitButton = document.querySelector('.submit');
const input = document.querySelector('input');
const taskCount = document.querySelector('.tasks_completed')
const clearButton = document.querySelector('.clearBtn');


let tasksArray = [];
let tasks_completed = 0;
function UpdateCounts() {
    taskCount.textContent = `Tasks Completed: ${tasks_completed}`;
    chrome.browserAction.setBadgeText({ text: `${tasksArray.length - tasks_completed}` })
}
function updateStorage() {
    chrome.storage.sync.set({ 'tasks': tasksArray })
}

class Tasks {
    constructor(name, complete, date) {
        this.name = name;
        this.complete = complete;
        this.date = date;
        this.createTask();
        tasksArray.push(this);
        updateStorage()
    }

    createTask() {
        input.value = '';
        input.focus();
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'task');
        const task_name = document.createElement('div');
        task_name.setAttribute('class', 'task_name');
        this.radio_button = document.createElement('input');
        this.radio_button.setAttribute('type', 'radio');
        this.label = document.createElement('label')
        this.label.htmlFor = this.radio_button;
        this.label.textContent = this.name;
        this.input = document.createElement('input');
        this.input.setAttribute('type', 'text');
        this.input.setAttribute('class', 'edit-task')
        this.input.style.display = 'none';
        this.del_button = document.createElement('img');
        this.del_button.style.visibility = 'hidden';
        this.del_button.setAttribute('src', 'Images/delete.png')
        this.edit_button = document.createElement('img');
        this.edit_button.setAttribute('src', 'Images/edit.png')
        this.edit_button.style.visibility = 'hidden';
        const button_container = document.createElement('div');
        button_container.appendChild(this.edit_button);
        button_container.appendChild(this.del_button);
        task_name.appendChild(this.radio_button);
        task_name.appendChild(this.label);
        this.container.appendChild(task_name);
        this.container.appendChild(this.input);
        this.container.appendChild(button_container)
        if (!this.complete) {
            incomplete.appendChild(this.container);
        } else if (this.complete && tasks_completed == 0) {
            let completeTitle = document.createElement('p');
            completeTitle.textContent = 'Completed';
            complete.appendChild(completeTitle);
            complete.appendChild(this.container);
            tasks_completed += 1;
            this.radio_button.checked = true;
            this.label.style.textDecoration = 'line-through'
        } else {
            complete.appendChild(this.container);
            tasks_completed += 1;
            this.radio_button.checked = true;
            this.label.style.textDecoration = 'line-through'
        }
        this.del_button.addEventListener('click', this.deleteTask)
        this.radio_button.addEventListener('click', this.CompleteTask)

        this.container.addEventListener('mouseenter', () => {
            this.container.style.background = 'linear-gradient(90deg, rgba(238,238,238,1) 0%, rgb(54, 54, 54) 0%, rgba(95,95,95,1) 100%)';
            this.del_button.style.visibility = 'visible';
            this.edit_button.style.visibility = 'visible';
            this.label.style.textDecoration = 'underline';
        })
        this.container.addEventListener('mouseleave', () => {
            this.container.style.background = 'linear-gradient(90deg, rgba(238,238,238,1) 0%, rgba(0,0,0,1) 0%, rgba(95,95,95,1) 100%)';
            this.del_button.style.visibility = 'hidden';
            this.edit_button.style.visibility = 'hidden';
            this.label.style.textDecoration = 'none';
            if (this.complete) {
                this.label.style.textDecoration = 'line-through';
            }
        })
        this.edit_button.addEventListener('click', () => {
            if (this.input.style.display === 'none') {
                this.input.style.display = 'block';
                task_name.style.display = 'none';
                this.input.value = this.name;
                this.input.focus()
            } else {
                this.name = this.input.value;
                this.label.textContent = this.name; 
                this.input.style.display = 'none';
                task_name.style.display = 'block';
                updateStorage();
            }
        })

        this.input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' && this.input.value) {
                this.name = this.input.value;
                this.label.textContent = this.name; 
                this.input.style.display = 'none';
                task_name.style.display = 'block';
                updateStorage();
            }
        })

    }


    deleteTask = () => {
        setTimeout(() => {
            this.container.remove();
            tasksArray = tasksArray.filter((item) => {
                if (item === this) {
                    return false;
                } else {
                    return true;
                }
            });
            if (this.complete) {
                tasks_completed -= 1;
                if (tasks_completed === 0) {
                    complete.removeChild(complete.firstElementChild);
                }
            }
            UpdateCounts();
            updateStorage()
        }, 300)
    }

    CompleteTask = () => {
        setTimeout(() => {
            if (this.complete) {
                this.label.style.textDecoration = 'none';
                this.complete = false;
                this.radio_button.checked = false;
                tasks_completed -= 1;
                if (tasks_completed === 0) {
                    complete.removeChild(complete.firstElementChild);
                }
                complete.removeChild(this.container);
                incomplete.appendChild(this.container);
            } else {
                this.complete = true;
                this.label.style.textDecoration = 'line-through';
                tasks_completed += 1;
                if (tasks_completed === 1) {
                    let completeTitle = document.createElement('p');
                    completeTitle.textContent = 'Completed';
                    complete.appendChild(completeTitle);
                }
                incomplete.removeChild(this.container);
                complete.appendChild(this.container);
            }
            UpdateCounts();
            updateStorage();
        }, 300)
    }



}

submitButton.addEventListener('click', (e) => {
    if (input.value !== '') {
        let date = new Date();
        new Tasks(input.value, false, date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString());
        UpdateCounts();
    }
})

window.addEventListener('keyup', (e) => {
    focused = document.activeElement;
    if (e.key === 'Enter' && input.value != '' && input === focused) {
        let date = new Date();
        new Tasks(input.value, false, date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString());
        UpdateCounts();
    } else if (e.key === 'q') {
        input.focus();
    }
})

window.addEventListener('load', () => {
    chrome.storage.sync.get('tasks', (data) => {
        if (data.tasks) {
            let date = new Date()
            date = date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString();
            data.tasks.forEach(task => {
                if (!(date !== task.date && task.complete)) {
                    new Tasks(task.name, task.complete, date);
                    UpdateCounts();
                }
            })
        }
    })
})

clearButton.addEventListener('click', function () {
    chrome.storage.sync.clear();
    window.location.reload();
    chrome.browserAction.setBadgeText({ text: '0' });
})

