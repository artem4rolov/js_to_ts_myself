"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function () {
    // Globals
    const todoList = document.getElementById("todo-list");
    const userSelect = document.getElementById("user-todo");
    const form = document.querySelector("form");
    let todos = [];
    let users = [];
    // Attach Events
    document.addEventListener("DOMContentLoaded", initApp);
    // если есть форма, то добавляем прослушиватель события
    form === null || form === void 0 ? void 0 : form.addEventListener("submit", handleSubmit);
    // Basic Logic
    function getUserName(userId) {
        const user = users.find((u) => u.id === userId);
        return (user === null || user === void 0 ? void 0 : user.name) || "user not found";
    }
    function printTodo({ id, userId, title, completed }) {
        const li = document.createElement("li");
        li.className = "todo-item";
        // в dataset (дата атрибут html) может быть записано значение только типа string
        li.dataset.id = String(id);
        li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(userId)}</b></span>`;
        const status = document.createElement("input");
        status.type = "checkbox";
        status.checked = completed;
        status.addEventListener("change", handleTodoChange);
        const close = document.createElement("span");
        close.innerHTML = "&times;";
        close.className = "close";
        close.addEventListener("click", handleClose);
        li.prepend(status);
        li.append(close);
        // дополнительно проверяем наличие todoList в приложении
        if (todoList) {
            todoList.prepend(li);
        }
    }
    // даем тип аргументу функции (юзер)
    function createUserOption(user) {
        const option = document.createElement("option");
        // в dataset (дата атрибут html) может быть записано значение только типа string
        option.value = String(user.id);
        option.innerText = user.name;
        // проверяем, что userSelect существует
        if (userSelect) {
            userSelect.append(option);
        }
    }
    function removeTodo(todoId) {
        var _a, _b;
        todos = todos.filter((todo) => todo.id !== todoId);
        const todo = todoList === null || todoList === void 0 ? void 0 : todoList.querySelector(`[data-id="${todoId}"]`);
        if (todo) {
            // проверяем наличие input и класса .close
            (_a = todo
                .querySelector("input")) === null || _a === void 0 ? void 0 : _a.removeEventListener("change", handleTodoChange);
            (_b = todo.querySelector(".close")) === null || _b === void 0 ? void 0 : _b.removeEventListener("click", handleClose);
            todo.remove();
        }
    }
    // даем тип ошибке как тип глобального объекта Error
    function alertError(error) {
        alert(error.message);
    }
    // Event Logic
    function initApp() {
        Promise.all([getAllTodos(), getAllUsers()]).then((values) => {
            // поскольку мы явно обозначили типы для Promise ниже, ts дает корректные типы для массива value (результаты промисов)
            [todos, users] = values;
            // Отправить в разметку
            todos.forEach((todo) => printTodo(todo));
            users.forEach((user) => createUserOption(user));
        });
    }
    // даем event'у глобальный тип Event
    function handleSubmit(event) {
        event.preventDefault();
        if (form) {
            createTodo({
                userId: Number(form.user.value),
                title: form.todo.value,
                completed: false,
            });
        }
    }
    // явно задаем тип для аргумента (тудушка чекается через input)
    function handleTodoChange() {
        var _a;
        // проверяем, есть ли родительский элемент (это как минимум body)
        const parent = this.parentElement;
        if (parent) {
            const todoId = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.dataset.id;
            const completed = this.checked;
            todoId && toggleTodoComplete(todoId, completed);
        }
    }
    function handleClose() {
        var _a;
        const parent = this.parentElement;
        if (parent) {
            const todoId = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.dataset.id;
            todoId && deleteTodo(todoId);
        }
    }
    // Async logic
    // явно говорим о том, что резуьтатом промиса будет массив с тудушками
    function getAllTodos() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("https://jsonplaceholder.typicode.com/todos?_limit=15");
                const data = yield response.json();
                return data;
            }
            catch (error) {
                // проверяем, что ошибка является типом глобального объекта Error
                if (error instanceof Error) {
                    alertError(error);
                }
                // в случае ошибки всегда возвращаем пустой массив
                // так функция, возвращающая PromiseAll выше, поймет, что одним из аргументов точно является массив тудушек
                return [];
            }
        });
    }
    function getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("https://jsonplaceholder.typicode.com/users?_limit=5");
                const data = yield response.json();
                return data;
            }
            catch (error) {
                // проверяем, что ошибка является типом глобального объекта Error
                if (error instanceof Error) {
                    alertError(error);
                }
                // в случае ошибки всегда возвращаем пустой массив
                // так функция, возвращающая PromiseAll выше, поймет, что одним из аргументов точно является массив юзеров
                return [];
            }
        });
    }
    // даем тип аргументу функции (тудушка)
    function createTodo(todo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch("https://jsonplaceholder.typicode.com/todos", {
                    method: "POST",
                    body: JSON.stringify(todo),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const newTodo = yield response.json();
                printTodo(newTodo);
            }
            catch (error) {
                // проверяем, что ошибка является типом глобального объекта Error
                if (error instanceof Error) {
                    alertError(error);
                }
            }
        });
    }
    // задаем типы для аргументов функции
    function toggleTodoComplete(todoId, completed) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ completed }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to connect with the server! Please try later.");
                }
            }
            catch (error) {
                // проверяем, что ошибка является типом глобального объекта Error
                if (error instanceof Error) {
                    alertError(error);
                }
            }
        });
    }
    // задаем тип для id
    function deleteTodo(todoId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    removeTodo(todoId);
                }
                else {
                    throw new Error("Failed to connect with the server! Please try later.");
                }
            }
            catch (error) {
                // проверяем, что ошибка является типом глобального объекта Error
                if (error instanceof Error) {
                    alertError(error);
                }
            }
        });
    }
})();
