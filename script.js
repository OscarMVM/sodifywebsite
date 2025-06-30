// app.js: Integración completa del frontend con SodifyRest
const baseUrl = 'http://localhost:8080';
const modules = document.querySelectorAll('.module-section');
const navLinks = document.querySelectorAll('[data-module-target]');
navLinks.forEach(link => link.addEventListener('click', () => showModule(link.dataset.moduleTarget)));
function showModule(name) {
  modules.forEach(m => m.classList.remove('active'));
  document.getElementById(`${name}-module`).classList.add('active');
  switch(name) {
    case 'user': loadUsers(); break;
    case 'soda': loadSodas(); break;
    case 'menu': loadMenus(); break;
    case 'item': loadItems(); break;
    case 'carrito': loadCarritos(); break;
  }
}

// --- Usuarios ---
async function loadUsers() {
  try {
    const res = await fetch(`${baseUrl}/user`);
    const users = await res.json();
    renderUserTable(users);
  } catch(e) { console.error(e); }
}
function renderUserTable(users) {
  const tbody = document.querySelector('#user-table tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.type}</td>
      <td>
        <button class="edit-user" data-id="${u.id}">✏️</button>
        <button class="delete-user" data-id="${u.id}">🗑️</button>
      </td>`;
    tbody.appendChild(row);
  });
  document.querySelectorAll('.edit-user').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const res = await fetch(`${baseUrl}/user/${id}`);
      const u = await res.json();
      ['user-id','user-name','user-email','user-type'].forEach(f => document.getElementById(f).value = u[f.split('-')[1]]);
    };
  });
  document.querySelectorAll('.delete-user').forEach(btn => btn.onclick = async () => { await fetch(`${baseUrl}/user/${btn.dataset.id}`, {method:'DELETE'}); loadUsers(); });
}
const userForm = document.getElementById('user-form');
userForm.onsubmit = async e => {
  e.preventDefault();
  const id = document.getElementById('user-id').value;
  const payload = {
    name: document.getElementById('user-name').value,
    email: document.getElementById('user-email').value,
    type: document.getElementById('user-type').value,
    password: document.getElementById('user-password').value
  };
  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${baseUrl}/user` : `${baseUrl}/user`;
  await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify({...payload, id: id?parseInt(id):undefined}) });
  userForm.reset(); loadUsers();
};

// --- Sodas ---
async function loadSodas() {
  try {
    const res = await fetch(`${baseUrl}/soda`);
    const sodas = await res.json();
    renderSodaTable(sodas);
  } catch(e) { console.error(e); }
}
function renderSodaTable(sodas) {
  const tbody = document.querySelector('#soda-table tbody'); tbody.innerHTML = '';
  sodas.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.type}</td>
      <td>${s.location}</td>
      <td>
        <button class="edit-soda" data-id="${s.id}">✏️</button>
        <button class="delete-soda" data-id="${s.id}">🗑️</button>
      </td>`;
    tbody.appendChild(row);
  });
  document.querySelectorAll('.edit-soda').forEach(btn => btn.onclick = async () => {
    const res = await fetch(`${baseUrl}/soda/${btn.dataset.id}`);
    const s = await res.json();
    ['soda-id','soda-name','soda-type','soda-location'].forEach(f => document.getElementById(f).value = s[f.split('-')[1]]);
  });
  document.querySelectorAll('.delete-soda').forEach(btn => btn.onclick = async () => { await fetch(`${baseUrl}/soda/${btn.dataset.id}`, {method:'DELETE'}); loadSodas(); });
}
const sodaForm = document.getElementById('soda-form');
sodaForm.onsubmit = async e => {
  e.preventDefault();
  const id = document.getElementById('soda-id').value;
  const payload = {
    name: document.getElementById('soda-name').value,
    type: document.getElementById('soda-type').value,
    location: document.getElementById('soda-location').value
  };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${baseUrl}/soda` : `${baseUrl}/soda`;
  await fetch(url, {method,headers:{'Content-Type':'application/json'},body:JSON.stringify(id?{id:parseInt(id),...payload}:{...payload})});
  sodaForm.reset(); loadSodas();
};

// --- Menú ---
async function loadMenus() {
  const res = await fetch(`${baseUrl}/menu`);
  const menus = await res.json(); renderMenuTable(menus);
}
function renderMenuTable(menus) {
  const tbody = document.querySelector('#menu-table tbody'); tbody.innerHTML = '';
  menus.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${m.id}</td>
      <td>${m.name}</td>
      <td>${m.price}</td>
      <td>${m.foodDescription}</td>
      <td>${m.soda?.name||m.soda?.id}</td>
      <td>
        <button class="edit-menu" data-id="${m.id}">✏️</button>
        <button class="delete-menu" data-id="${m.id}">🗑️</button>
      </td>`;
    tbody.appendChild(row);
  });
  document.querySelectorAll('.edit-menu').forEach(btn => btn.onclick = async () => {
    const res = await fetch(`${baseUrl}/menu/${btn.dataset.id}`);
    const m = await res.json();
    document.getElementById('menu-id').value = m.id;
    document.getElementById('menu-name').value = m.name;
    document.getElementById('menu-price').value = m.price;
    document.getElementById('menu-description').value = m.foodDescription;
    document.getElementById('menu-soda-id').value = m.soda?.id;
  });
  document.querySelectorAll('.delete-menu').forEach(btn => btn.onclick = async () => { await fetch(`${baseUrl}/menu/${btn.dataset.id}`,{method:'DELETE'}); loadMenus(); });
}
const menuForm = document.getElementById('menu-form');
menuForm.onsubmit = async e => {
  e.preventDefault();
  const id = document.getElementById('menu-id').value;
  const name = document.getElementById('menu-name').value;
  const price = parseFloat(document.getElementById('menu-price').value);
  const foodDescription = document.getElementById('menu-description').value;
  const idSoda = parseInt(document.getElementById('menu-soda-id').value,10);
  if (id) {
    // UPDATE
    const payload = {id: parseInt(id), name, price, foodDescription, soda: {id: idSoda}};
    await fetch(`${baseUrl}/menu`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  } else {
    // CREATE
    const payload = {name, price, foodDescription, idSoda};
    await fetch(`${baseUrl}/menu`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  }
  menuForm.reset(); loadMenus();
};

// --- Items ---
async function loadItems() {
  const res = await fetch(`${baseUrl}/item`);
  const items = await res.json(); renderItemTable(items);
}
function renderItemTable(items) {
  const tbody = document.querySelector('#item-table tbody'); tbody.innerHTML = '';
  items.forEach(i => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i.id}</td>
      <td>${i.name}</td>
      <td>${i.price}</td>
      <td>${i.soda?.name||i.soda?.id}</td>
      <td>
        <button class="edit-item" data-id="${i.id}">✏️</button>
        <button class="delete-item" data-id="${i.id}">🗑️</button>
      </td>`;
    tbody.appendChild(row);
  });
  document.querySelectorAll('.edit-item').forEach(btn => btn.onclick = async () => {
    const res = await fetch(`${baseUrl}/item/${btn.dataset.id}`);
    const i = await res.json();
    document.getElementById('item-id').value = i.id;
    document.getElementById('item-name').value = i.name;
    document.getElementById('item-price').value = i.price;
    document.getElementById('item-soda-id').value = i.soda?.id;
  });
  document.querySelectorAll('.delete-item').forEach(btn => btn.onclick = async () => { await fetch(`${baseUrl}/item/${btn.dataset.id}`,{method:'DELETE'}); loadItems(); });
}
const itemForm = document.getElementById('item-form');
itemForm.onsubmit = async e => {
  e.preventDefault();
  const id = document.getElementById('item-id').value;
  const name = document.getElementById('item-name').value;
  const price = parseFloat(document.getElementById('item-price').value);
  const idSoda = parseInt(document.getElementById('item-soda-id').value,10);
  if (id) {
    const payload = {id: parseInt(id), name, price, soda: {id: idSoda}};
    await fetch(`${baseUrl}/item`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  } else {
    const payload = {name, price, idSoda};
    await fetch(`${baseUrl}/item`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  }
  itemForm.reset(); loadItems();
};

// --- Carrito ---
async function loadCarritos() {
  const res = await fetch(`${baseUrl}/carrito`);
  const carritos = await res.json(); renderCarritoTable(carritos);
}
function renderCarritoTable(carritos) {
  const tbody = document.querySelector('#carrito-table tbody'); tbody.innerHTML = '';
  carritos.forEach(c => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${c.id}</td>
      <td>${c.item?.name||c.item?.id}</td>
      <td>${c.user?.email||c.user?.id}</td>
      <td>${c.category}</td>
      <td><button class="delete-carrito" data-id="${c.id}">🗑️</button></td>`;
    tbody.appendChild(row);
  });
  document.querySelectorAll('.delete-carrito').forEach(btn => btn.onclick = async () => { await fetch(`${baseUrl}/carrito/${btn.dataset.id}`,{method:'DELETE'}); loadCarritos(); });
}
const carritoForm = document.getElementById('carrito-form');
carritoForm.onsubmit = async e => {
  e.preventDefault();
  const payload = {
    idItem: parseInt(document.getElementById('carrito-item-id').value,10),
    category: document.getElementById('carrito-category').value,
    emailUser: document.getElementById('carrito-email').value
  };
  await fetch(`${baseUrl}/carrito`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  carritoForm.reset(); loadCarritos();
};

// Inicializar
showModule('home');