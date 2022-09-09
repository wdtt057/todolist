// * ~~~~~~~~~~~~~~~~~~~ Api ~~~~~~~~~~~~~~~~~~~
const Api = (() => {
  const baseUrl = 'http://localhost:3000';
  const todopath = 'todos';

  const getTodos = () =>
    fetch([baseUrl, todopath].join('/')).then((response) => response.json());

  const deleteTodo = (id) =>
    fetch([baseUrl, todopath, id].join('/'), {
      method: 'DELETE',
    });

  const addTodo = (todo) =>
    fetch([baseUrl, todopath].join('/'), {
      method: 'POST',
      body: JSON.stringify(todo),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((response) => response.json());

  const updateTodoStatus = (id, status) =>
    fetch([baseUrl, todopath, id].join('/'), {
      method: 'PATCH',
      body: JSON.stringify({
        completed: !status,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((response) => response.json());

  const updateTodoContent = (id, content) =>
    fetch([baseUrl, todopath, id].join('/'), {
      method: 'PATCH',
      body: JSON.stringify({
        title: content,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((response) => response.json());

  return {
    getTodos,
    deleteTodo,
    addTodo,
    updateTodoContent,
    updateTodoStatus,
  };
})();

// * ~~~~~~~~~~~~~~~~~~~ View ~~~~~~~~~~~~~~~~~~~
const View = (() => {
  const domstr = {
    todocontainer: '#todolist_container',
    completedcontainner: '#completelist_container',
    inputbox: '.todolist__input',
  };

  const render = (ele, tmp) => {
    ele.innerHTML = tmp;
  };
  const createTmp = (arr) => {
    let tmp = '';
    arr.forEach((todo) => {
      tmp += `
        <li>
          <span>${todo.title}</span>
          <input style="display:none"/>
          <button class="statusbtn" id="${todo.id}">Move</button>
          <button class="editbtn" id="${todo.id}">Edit</button>
          <button class="deletebtn" id="${todo.id}">X</button>
        </li>
      `;
    });
    return tmp;
  };

  return {
    render,
    createTmp,
    domstr,
  };
})();

// * ~~~~~~~~~~~~~~~~~~~ Model ~~~~~~~~~~~~~~~~~~~
const Model = ((api, view) => {
  const { getTodos, deleteTodo, addTodo, updateTodoContent, updateTodoStatus } =
    api;

  class Todo {
    constructor(title) {
      this.userId = 2;
      this.completed = false;
      this.title = title;
    }
  }

  class State {
    #todolist = [];
    #completelist = [];

    get todolist() {
      return this.#todolist;
    }
    set todolist(newtodolist) {
      this.#todolist = newtodolist;

      const todocontainer = document.querySelector(view.domstr.todocontainer);
      const tmp = view.createTmp(this.#todolist);
      view.render(todocontainer, tmp);
    }

    get completelist() {
      return this.#completelist;
    }
    set completelist(newtodolist) {
      this.#completelist = newtodolist;

      const completecontainer = document.querySelector(
        view.domstr.completedcontainner
      );
      const tmp = view.createTmp(this.#completelist);
      view.render(completecontainer, tmp);
    }
  }

  return {
    getTodos,
    deleteTodo,
    addTodo,
    updateTodoContent,
    updateTodoStatus,
    State,
    Todo,
  };
})(Api, View);

// * ~~~~~~~~~~~~~~~~~~~ Controller ~~~~~~~~~~~~~~~~~~~
const Controller = ((model, view) => {
  const state = new model.State();

  const modifyTodo = () => {
    const todocontainer = document.querySelector(view.domstr.todocontainer);
    todocontainer.addEventListener('click', (event) => {
      if (event.target.className === 'deletebtn') {
        state.todolist = state.todolist.filter(
          (todo) => +todo.id !== +event.target.id
        );
        model.deleteTodo(event.target.id);
      }
      if (event.target.className === 'statusbtn') {
        let removedarr = state.todolist.filter(
          (todo) => +todo.id === +event.target.id
        );
        state.todolist = state.todolist.filter(
          (todo) => +todo.id !== +event.target.id
        );
        const removedEle = removedarr[0];
        state.completelist = [removedEle, ...state.completelist];
        model.updateTodoStatus(event.target.id, false);
      }
      if (event.target.className === 'editbtn') {
        let id = event.target.id;
        let curr = document.getElementById(id);
        let text = curr.parentElement.children[0].innerHTML;
        console.log(text);
        let input = curr.parentElement.children[1];
        let span = curr.parentElement.children[0];
        span.style.display = 'none';
        input.style.display = 'inline';
        input.value = text;
        input.addEventListener('keyup', (event2) => {
          if (event2.key === 'Enter' && event2.target.value.trim() !== '') {
            console.log(event2.target.value);
            model.updateTodoContent(id, event2.target.value).then(init);
          }
        });
      }
    });
  };

  const modifyComplete = () => {
    const completecontainer = document.querySelector(
      view.domstr.completedcontainner
    );
    completecontainer.addEventListener('click', (event) => {
      if (event.target.className === 'deletebtn') {
        state.completelist = state.completelist.filter(
          (todo) => +todo.id !== +event.target.id
        );
        model.deleteTodo(event.target.id);
      }
      if (event.target.className === 'statusbtn') {
        let removedarr = state.completelist.filter(
          (todo) => +todo.id === +event.target.id
        );
        state.completelist = state.completelist.filter(
          (todo) => +todo.id !== +event.target.id
        );
        const removedEle = removedarr[0];
        state.todolist = [removedEle, ...state.todolist];
        model.updateTodoStatus(event.target.id, true);
      }
      if (event.target.className === 'editbtn') {
        let id = event.target.id;
        let curr = document.getElementById(id);
        let text = curr.parentElement.children[0].innerHTML;
        console.log(text);
        let input = curr.parentElement.children[1];
        let span = curr.parentElement.children[0];
        span.style.display = 'none';
        input.style.display = 'inline';
        input.value = text;
        input.addEventListener('keyup', (event2) => {
          if (event2.key === 'Enter' && event2.target.value.trim() !== '') {
            console.log(event2.target.value);
            model.updateTodoContent(id, event2.target.value).then(init);
          }
        });
      }
    });
  };

  const addTodo = () => {
    const inputbox = document.querySelector(view.domstr.inputbox);
    inputbox.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' && event.target.value.trim() !== '') {
        const todo = new model.Todo(event.target.value);
        model.addTodo(todo).then((todofromBE) => {
          console.log(todofromBE);
          state.todolist = [todofromBE, ...state.todolist];
        });
        event.target.value = '';
      }
    });
  };

  const init = () => {
    model.getTodos().then((todos) => {
      let todoList = [];
      let completeList = [];
      todos.forEach((obj) => {
        if (obj.completed === false) {
          todoList.push(obj);
        } else {
          completeList.push(obj);
        }
      });
      state.todolist = todoList;
      state.completelist = completeList;
    });
  };

  const bootstrap = () => {
    init();
    modifyTodo();
    modifyComplete();
    addTodo();
  };

  return { bootstrap };
})(Model, View);

Controller.bootstrap();
