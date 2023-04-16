const listsContainer = document.querySelector("[data-lists]")
const newListForm = document.querySelector("[data-new-list-form]")
const newListInput = document.querySelector("[data-new-list-input]")
const deleteListButton = document.querySelector("[data-delete-list-button]")
const listDisplayContainer = document.querySelector("[data-list-display-container]")
const listTitleElement = document.querySelector("[data-list-title]")
const listCountElement = document.querySelector("[data-list-count]")
const tasksContainer = document.querySelector("[data-tasks]")
const taskTemplate = document.getElementById("task-template")
const newTaskForm = document.querySelector("[data-new-task-form]")
const newTaskInput = document.querySelector("[data-new-task-input]")
const clearCompleteTasksButton = document.querySelector("[data-clear-complete-tasks-button]")

const LOCAL_STORAGE_LIST_KEY = "task.lists"
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId"

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) ?? []
let selectedListId = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)) ?? null

listsContainer.addEventListener("click", (evt) => {
    if (evt.target.tagName.toLowerCase() == "li") {
        selectedListId = evt.target.dataset.listId
        saveAndRender()
    }
})

tasksContainer.addEventListener("click", (evt) => {
    if (evt.target.tagName.toLowerCase() == "input") {
        const selectedTask = getSelectedList()?.tasks.find((task) => task.id == evt.target.id)

        if (selectedTask) {
            selectedTask.complete = evt.target.checked
            save()
            renderTaskCount()
        }
    }
})

clearCompleteTasksButton.addEventListener("click", (evt) => {
    const selectedList = getSelectedList()
    
    if (selectedList) {
        selectedList.tasks = selectedList.tasks.filter((task) => !task.complete)
        saveAndRender()
    }
})

deleteListButton.addEventListener("click", (evt) => {
    lists.splice(lists.findIndex((list) => list.id == selectedListId), 1)
    selectedListId = null
    saveAndRender()
})

newListForm.addEventListener("submit", (evt) => {
    evt.preventDefault()

    const listName = newListInput.value

    if (!listName) {
        return
    }
    
    newListInput.value = ""

    lists.push(createList(listName))
    saveAndRender()
})

newTaskForm.addEventListener("submit", (evt) => {
    evt.preventDefault()

    const taskName = newTaskInput.value

    if (!taskName) {
        return
    }
    
    newTaskInput.value = ""

    getSelectedList()?.tasks.push(createTask(taskName))
    saveAndRender()
})

function createList(name) {
    return {
        id: Date.now().toString(),
        name: name,
        tasks: []
    }
}

function createTask(name) {
    return {
        id: Date.now().toString(),
        name: name,
        complete: false
    }
}

function saveAndRender() {
    save()
    render()
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, JSON.stringify(selectedListId))
}

function render() {
    renderLists()
    
    const selectedList = getSelectedList()

    if (!selectedList) {
        listDisplayContainer.style.display = "none"
    } else {
        listDisplayContainer.style.display = ""

        listTitleElement.innerText = selectedList.name
        renderTaskCount()

        tasksContainer.replaceChildren()
        renderTasks(selectedList)
    }
}

function renderTasks(list) {
    list.tasks.forEach((task) => {
        const taskElement = document.importNode(taskTemplate.content, true)

        const checkbox = taskElement.querySelector("input")
        checkbox.id = task.id
        checkbox.checked = task.complete

        const label = taskElement.querySelector("label")
        label.htmlFor = checkbox.id
        label.append(task.name)

        tasksContainer.appendChild(taskElement)
    })
}

function renderTaskCount() {
    const incompleteTaskCount = getSelectedList().tasks.filter((task) => !task.complete).length
    const taskString = incompleteTaskCount == 1 ? "task" : "tasks"
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
    listsContainer.replaceChildren()

    lists.forEach((list) => {
        const listElement = document.createElement("li")
        listElement.dataset.listId = list.id
        listElement.classList.add("list-name")
        listElement.innerText = list.name

        if (list.id == selectedListId) {
            listElement.classList.add("active-list")
        }

        listsContainer.appendChild(listElement)
    })
}

function getSelectedList() {
    return lists.find((list) => list.id == selectedListId)
}

render()