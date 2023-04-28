import { nanoid } from 'nanoid';

class Table {
  users;
  constructor() {
    this.users = [];
    this.selectedId = null;
  }

  getJsonFromLocalStorage(key) {
    const json = localStorage.getItem(key);
    try {
      const data = JSON.parse(json);
      return data;
    } catch (error) {
      console.log(error.name);
      console.log(error.message);
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('tableUsers', JSON.stringify(this.users));
  }

  addUser = e => {
    e.preventDefault();
    const {
      elements: { name, email, age },
    } = e.currentTarget;

    if (Number(age.value) < 18 || Number(age.value) > 99) {
      return alert('Age must be between 18 to 99');
    }

    if (this.selectedId) {
      const userIndex = this.users.findIndex(
        ({ id }) => id === this.selectedId
      );
      if (userIndex !== -1) {
        this.users[userIndex].name = name.value;
        this.users[userIndex].email = email.value;
        this.users[userIndex].age = age.value;
        this.selectedId = null;
        this.saveToLocalStorage();
      }
    } else {
      const newUser = {
        id: nanoid(4),
        name: name.value,
        email: email.value,
        age: age.value,
      };

      if (this.checkExistsUser(newUser)) {
        this.users = [...this.users, newUser];
        this.saveToLocalStorage();
      }
    }

    e.currentTarget.reset();
    this.selectedId = null;
    this.render();
  };

  render = () => {
    const usersTableBodyEl = document.getElementById('body');

    const markup = this.users.map(
      ({ id, name, email, age }) => `<tr>
    <td>${id}</td>
    <td>${name}</td>
    <td>${email}</td>
    <td>${age}</td>
    <td class="options">
    <button type='button' class='edit' data-id='${id}'>Edit</button>
    </td>
    <td class="options">
      <button class='delete' type='submit' data-id='${id}'>Delete</button>
    </td>
  </tr>`
    );

    usersTableBodyEl.innerHTML = markup.join('');

    usersTableBodyEl.addEventListener('click', event => {
      const deleteButton = event.target.closest('.delete');
      const editButton = event.target.closest('.edit');

      if (deleteButton) {
        const userId = deleteButton.dataset.id;
        this.deleteUser(userId);
      }

      if (editButton) {
        const userId = editButton.dataset.id;
        this.editUser(userId);
      }

      const sortAscButton = document.querySelector('.sort-asc');
      const sortDescButton = document.querySelector('.sort-desc');

      sortAscButton.addEventListener('click', () => {
        const column = sortAscButton.dataset.column;
        this.sortAscending(column);
      });

      sortDescButton.addEventListener('click', () => {
        const column = sortDescButton.dataset.column;
        this.sortDescending(column);
      });
    });
  };

  deleteUser = userId => {
    const refreshed = this.users.filter(({ id }) => id !== userId);
    this.users = refreshed;

    this.saveToLocalStorage();
    const usersTableBodyEl = document.getElementById('body');

    if (this.users.length === 0) {
      return (usersTableBodyEl.innerHTML = '');
    }
    this.render();
  };

  editUser = userId => {
    this.selectedId = userId;
    const currentUser = this.users.find(({ id }) => id === userId);

    const userForm = document.querySelector('form');
    const nameInput = userForm.querySelector('#name');
    const emailInput = userForm.querySelector('#email');
    const ageInput = userForm.querySelector('#age');

    nameInput.value = currentUser.name;
    emailInput.value = currentUser.email;
    ageInput.value = currentUser.age;
  };

  sortAscending = column => {
    this.users.sort((a, b) => a[column] - b[column]);
    this.render();
  };

  sortDescending = column => {
    this.users.sort((a, b) => b[column] - a[column]);
    this.render();
  };

  checkExistsUser = ({ name, email }) => {
    const existsUser = this.users.some(
      user => name === user.name || email === user.email
    );

    if (existsUser) {
      alert('User or email already exists!');
      return false;
    }
    return true;
  };
}

const table = new Table();

table.users = table.getJsonFromLocalStorage('tableUsers') || [];
table.render();

const userForm = document.querySelector('form');

userForm.addEventListener('submit', table.addUser);

const sortAscButton = document.querySelectorAll('.sort-asc');
const sortDescButton = document.querySelectorAll('.sort-desc');

sortAscButton.forEach(asc => {
  asc.addEventListener('click', () => {
    const column = asc.dataset.column;
    table.sortAscending(column);
  });
});

sortDescButton.forEach(desc => {
  desc.addEventListener('click', () => {
    const column = desc.dataset.column;
    table.sortDescending(column);
  });
});
