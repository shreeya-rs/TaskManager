document.addEventListener('DOMContentLoaded', function() {
    // Get references to the necessary HTML elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const errorContainer = document.getElementById('errorContainer');

    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        renderTasks(tasks);
      });
    
  
    // Add an event listener to the form submission
    taskForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent the form from submitting and refreshing the page

      if (taskInput.value === '') {
        displayError('Please enter a task description.');
        return;
      }

      const taskText = taskInput.value;
      const dueDate = dueDateInput.value;
      const newTask = { text: taskText, dueDate: dueDate, completed: false};
      const taskItem = createTaskItem(newTask)
      taskList.appendChild(taskItem);
      taskInput.value = '';
      dueDateInput.value = '';

      saveTask(newTask);
      errorContainer.textContent = '';

      // Proceed with form submission
      taskForm.submit();
    });

    function renderTasks(tasks) {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        const incompleteTasks = tasks.filter(task => !task.completed);

        incompleteTasks.forEach(function(task) {
            const taskItem = createTaskItem(task);
            taskList.appendChild(taskItem);
          });
    }

    function displayError(message) {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.textContent = message;
      }

    function saveTask(task) {
        chrome.storage.local.get(['tasks'], function(result) {
          const tasks = result.tasks || [];
          tasks.push(task);
          chrome.storage.local.set({ tasks: tasks }, function() {
            renderTasks(tasks);
          });
        });
      }

    function createTaskItem(task) {
        const taskItem = document.createElement('li');
        const taskTextElement = document.createElement('span');
        taskTextElement.textContent = task.text
        const space = document.createTextNode(' ');
        const dueDateElement = document.createElement("span");
        dueDateElement.textContent = task.dueDate;
        taskItem.appendChild(taskTextElement);
        taskItem.appendChild(space);
        taskItem.appendChild(dueDateElement);

        if (task.completed) {
            taskItem.classList.add('completed');
          }
        
          // Add click event listener to toggle completed state
          taskItem.addEventListener('click', function() {
            taskItem.classList.toggle('completed');
            const isCompleted = taskItem.classList.contains('completed');
        
            // Save the updated completed state in storage
            chrome.storage.local.get(['tasks'], function(result) {
              const tasks = result.tasks || [];
              const updatedTasks = tasks.map((t) => {
                if (t.text === task.text && t.dueDate === task.dueDate) {
                  return { ...t, completed: isCompleted };
                }
                return t;
              });
        
              // Update the storage with the modified tasks
              chrome.storage.local.set({ tasks: updatedTasks });
            });

        });

        return taskItem;
      }
    });