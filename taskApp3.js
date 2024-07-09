document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('prioritizeBtn').addEventListener('click', prioritizeTasks);
    const taskItems = document.querySelectorAll('.taskItem');
    const priorityItems = document.querySelectorAll('.priorityItem');

    let tasks = [];

    function addTask() {
        const taskName = document.getElementById('taskName').value;
        const deadline = document.getElementById('deadline').value;
        const complexity = parseInt(document.getElementById('complexity').value);
        const effort = parseInt(document.getElementById('effort').value);

        if (taskName && deadline && complexity && effort) {
            if (complexity < 1 || complexity > 5 || effort < 1 || effort > 5) {
                alert('Complexity and Effort must be between 1 and 5.');
                return;
            }

            const task = {
                taskName,
                deadline: new Date(deadline),
                complexity,
                effort
            };

            tasks.push(task);
            displayTasks();

            // Clearing the task form every task added
            document.getElementById('taskName').value = '';
            document.getElementById('deadline').value = '';
            document.getElementById('complexity').value = '';
            document.getElementById('effort').value = '';
        } else {
            alert('Please fill in all fields.');
        }
    }

    function displayTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('taskItem');
            
            // Task details display
            createAndAppend(li, 'p', task.taskName);
            createAndAppend(li, 'p', `${task.deadline.toDateString()}`);
            
            const taskDetails = createAndAppend(li, 'div', null, 'taskDetails');
            createAndAppend(taskDetails, 'p', `Complexity: ${task.complexity}`);
            createAndAppend(taskDetails, 'p', `Effort: ${task.effort}`);

            clickModifyBtn(li, task.taskName);
            clickDeleteBtn(li, task.taskName);

            taskList.appendChild(li);
        });
    }

    function createAndAppend(parent, elementType, textContent, className) {
        const element = document.createElement(elementType);
        if (textContent) element.textContent = textContent;
        if (className) element.classList.add(className);
        parent.appendChild(element);
        return element;
    }

    function clickModifyBtn(parentElement, taskName) {
        const modifyBtn = document.createElement('button');
        modifyBtn.classList.add('icon-button', 'modifyBtn');
        modifyBtn.innerHTML = '<span class="material-symbols-outlined">edit_note</span>';
        modifyBtn.addEventListener('click', () => {
            taskModify(taskName);
        });
        parentElement.appendChild(modifyBtn);
    }
    
    function clickDeleteBtn(parentElement, taskName) {
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('icon-button', 'deleteBtn');
        deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteBtn.addEventListener('click', () => {
            deleteTask(taskName);
        });
        parentElement.appendChild(deleteBtn);
    }

    function taskModify(taskName) {
        const modal = document.getElementById('modifyModal');
        modal.style.display = 'block';

        // Find the task in the tasks array
        const task = tasks.find(task => task.taskName === taskName);

        if (task) {
            document.getElementById('modTaskName').value = task.taskName;
            document.getElementById('modDeadline').value = task.deadline.toISOString().slice(0, 10); // Format as YYYY-MM-DD
            document.getElementById('modComplexity').value = task.complexity;
            document.getElementById('modEffort').value = task.effort;

            document.getElementById('saveChangesBtn').onclick = function() {
                const newDeadline = document.getElementById('modDeadline').value;
                const newComplexity = parseInt(document.getElementById('modComplexity').value);
                const newEffort = parseInt(document.getElementById('modEffort').value);

                // Update task details if inputs are valid
                if (newDeadline) {
                    task.deadline = new Date(newDeadline);
                }
                if (!isNaN(newComplexity)) {
                    task.complexity = newComplexity;
                }
                if (!isNaN(newEffort)) {
                    task.effort = newEffort;
                }

                modal.style.display = 'none';
                displayTasks();
                prioritizeTasks();
            };

            // Close modal when clicking on 'X'
            const closeButton = document.getElementsByClassName('close')[0];
            closeButton.onclick = function() {
                modal.style.display = 'none';
            };
        } else {
            alert('Task not found.');
            modal.style.display = 'none';
        }
    }

    function deleteTask(taskName) {
        const index = tasks.findIndex(task => task.taskName === taskName);
        if (index !== -1) {
            tasks.splice(index, 1);
            displayTasks();
            prioritizeTasks();
        }
    }

    function prioritizeTasks() {
        const prioritizedTasks = prioritizeTasksList(tasks);

        const priorityList = document.getElementById('priorityList');
        priorityList.innerHTML = '';

        prioritizedTasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('priorityItem');
            
            const priorityName = createAndAppend(li, 'p', task.taskName, 'priorityName');
            priorityName.style.fontWeight = 'bold';
            createAndAppend(li, 'p', `Deadline: ${task.deadline.toDateString()}`);
            
            priorityList.appendChild(li);
        });
    }

    function prioritizeTasksList(tasks) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayTasks = tasks.filter(task => isSameDate(task.deadline, today));
        const tomorrowTasks = tasks.filter(task => isSameDate(task.deadline, tomorrow));
        const otherTasks = tasks.filter(task => !isSameDate(task.deadline, today) && !isSameDate(task.deadline, tomorrow));

        const otherTasksPriority = greedySort(otherTasks);

        return [...todayTasks, ...tomorrowTasks, ...otherTasks];
    }

    function greedySort(tasks) {
        return tasks.sort((a, b) => calculatePriority(b) - calculatePriority(a));
    }


    function calculatePriority(task) {
        const today = new Date();
        const timeDiff = task.deadline - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const deadlineScore = getDeadlineScore(daysLeft);
        const complexityScore = getComplexityScore(task.complexity);
        const effortScore = getEffortScore(task.effort);
    
        return ((0.30 * deadlineScore) + (0.50 * complexityScore) + (0.20 * effortScore));
    }
    
    function getDeadlineScore(daysRemaining) {
        if (daysRemaining <= 2) {
            return 100;
        } else if (daysRemaining >= 3 && daysRemaining <= 7) {
            return 75;
        } else if (daysRemaining >= 8 && daysRemaining <= 14) {
            return 50;
        } else if (daysRemaining >= 15 && daysRemaining <= 30) {
            return 25;
        } else {
            return 0;
        }
    }
    
    function getComplexityScore(complexity) {
        switch (complexity) {
            case 1: return 0;
            case 2: return 25;
            case 3: return 50;
            case 4: return 75;
            case 5: return 100;
            default: return 0;
        }
    }
    
    function getEffortScore(effort) {
        switch (effort) {
            case 1: return 0;
            case 2: return 25;
            case 3: return 50;
            case 4: return 75;
            case 5: return 100;
            default: return 0;
        }
    }

    // Hide task before they are added
    taskItems.forEach(function(taskItem) {
        const taskName = taskItem.querySelector('.taskName').textContent.trim();
        const taskDue = taskItem.querySelector('.taskDue').textContent.trim();
        const taskComplexity = taskItem.querySelector('.taskComplexity').textContent.trim();
        const taskEffort = taskItem.querySelector('.taskEffort').textContent.trim();

        if (!taskName && !taskDue && !taskComplexity && !taskEffort) {
            taskItem.classList.add('hide');
        }
    });

    // Hide task before they are added
    priorityItems.forEach(function(priorityItem) {
        const priorityName = priorityItem.querySelector('.priorityName').textContent.trim();
        const priorityDue = priorityItem.querySelector('.priorityDue').textContent.trim();

        if (!priorityName && !priorityDue) {
            priorityItem.classList.add('hide');
        }
    });

    // Check if two dates are the same
    function isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    // Close the modal when the user clicks anywhere outside of it
    window.onclick = function(event) {
        const modal = document.getElementById('modifyModal');
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});
