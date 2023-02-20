// явно определяем тип для всех id
type ID = string | number;

// интерфейс для тудушки
interface Todo {
  userId: ID;
  id: ID;
  title: string;
  completed: boolean;
}

// интерфейс для юзеров
interface User {
  id: ID;
  name: string;
}

(function () {
  // Globals
  const todoList = document.getElementById("todo-list");
  const userSelect = document.getElementById("user-todo");
  const form = document.querySelector("form");
  let todos: Todo[] = [];
  let users: User[] = [];

  // Attach Events
  document.addEventListener("DOMContentLoaded", initApp);
  // если есть форма, то добавляем прослушиватель события
  form?.addEventListener("submit", handleSubmit);

  // Basic Logic
  function getUserName(userId: ID) {
    const user = users.find((u) => u.id === userId);
    return user?.name || "user not found";
  }
  function printTodo({ id, userId, title, completed }: Todo) {
    const li = document.createElement("li");
    li.className = "todo-item";
    // в dataset (дата атрибут html) может быть записано значение только типа string
    li.dataset.id = String(id);
    li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(
      userId
    )}</b></span>`;

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
  function createUserOption(user: User) {
    const option = document.createElement("option");
    // в dataset (дата атрибут html) может быть записано значение только типа string
    option.value = String(user.id);
    option.innerText = user.name;

    // проверяем, что userSelect существует
    if (userSelect) {
      userSelect.append(option);
    }
  }

  function removeTodo(todoId: ID) {
    todos = todos.filter((todo) => todo.id !== todoId);

    const todo = todoList?.querySelector(`[data-id="${todoId}"]`);
    if (todo) {
      // проверяем наличие input и класса .close
      todo
        .querySelector("input")
        ?.removeEventListener("change", handleTodoChange);
      todo.querySelector(".close")?.removeEventListener("click", handleClose);

      todo.remove();
    }
  }

  // даем тип ошибке как тип глобального объекта Error
  function alertError(error: Error) {
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
  function handleSubmit(event: Event) {
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
  function handleTodoChange(this: HTMLInputElement) {
    // проверяем, есть ли родительский элемент (это как минимум body)
    const parent = this.parentElement;
    if (parent) {
      const todoId = this.parentElement?.dataset.id;
      const completed = this.checked;

      todoId && toggleTodoComplete(todoId, completed);
    }
  }
  function handleClose(this: Element) {
    const parent = this.parentElement;
    if (parent) {
      const todoId = this.parentElement?.dataset.id;
      todoId && deleteTodo(todoId);
    }
  }

  // Async logic
  // явно говорим о том, что резуьтатом промиса будет массив с тудушками
  async function getAllTodos(): Promise<Todo[]> {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos?_limit=15"
      );
      const data = await response.json();

      return data;
    } catch (error) {
      // проверяем, что ошибка является типом глобального объекта Error
      if (error instanceof Error) {
        alertError(error);
      }
      // в случае ошибки всегда возвращаем пустой массив
      // так функция, возвращающая PromiseAll выше, поймет, что одним из аргументов точно является массив тудушек
      return [];
    }
  }

  async function getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users?_limit=5"
      );
      const data = await response.json();

      return data;
    } catch (error) {
      // проверяем, что ошибка является типом глобального объекта Error
      if (error instanceof Error) {
        alertError(error);
      }
      // в случае ошибки всегда возвращаем пустой массив
      // так функция, возвращающая PromiseAll выше, поймет, что одним из аргументов точно является массив юзеров
      return [];
    }
  }

  // даем тип аргументу функции (тудушка)
  async function createTodo(todo: Omit<Todo, "id">) {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos",
        {
          method: "POST",
          body: JSON.stringify(todo),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newTodo: Todo = await response.json();

      printTodo(newTodo);
    } catch (error) {
      // проверяем, что ошибка является типом глобального объекта Error
      if (error instanceof Error) {
        alertError(error);
      }
    }
  }

  // задаем типы для аргументов функции
  async function toggleTodoComplete(todoId: ID, completed: boolean) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ completed }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to connect with the server! Please try later.");
      }
    } catch (error) {
      // проверяем, что ошибка является типом глобального объекта Error
      if (error instanceof Error) {
        alertError(error);
      }
    }
  }

  // задаем тип для id
  async function deleteTodo(todoId: ID) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        removeTodo(todoId);
      } else {
        throw new Error("Failed to connect with the server! Please try later.");
      }
    } catch (error) {
      // проверяем, что ошибка является типом глобального объекта Error
      if (error instanceof Error) {
        alertError(error);
      }
    }
  }
})();
