// Global variables
const API_BASE_URL = 'http://localhost:8080';
let currentModule = 'user';
let editingId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeForms();
    loadAllData();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const module = this.getAttribute('data-module');
            switchModule(module);
        });
    });

    // Handle mobile menu
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

// Switch between modules
function switchModule(module) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-module="${module}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.module-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${module}-module`).classList.add('active');

    currentModule = module;
    loadModuleData(module);
}

// Initialize forms
function initializeForms() {
    // User form
    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
    
    // Soda form
    document.getElementById('soda-form').addEventListener('submit', handleSodaSubmit);
    
    // Menu form
    document.getElementById('menu-form').addEventListener('submit', handleMenuSubmit);
    
    // Item form
    document.getElementById('item-form').addEventListener('submit', handleItemSubmit);
    
    // Carrito form
    document.getElementById('carrito-form').addEventListener('submit', handleCarritoSubmit);
}

// Load all initial data
async function loadAllData() {
    await loadUsers();
    await loadSodas();
    await loadMenus();
    await loadItems();
    await loadCarritos();
    await loadSelectOptions();
}

// Load module data
function loadModuleData(module) {
    switch(module) {
        case 'user':
            loadUsers();
            break;
        case 'soda':
            loadSodas();
            break;
        case 'menu':
            loadMenus();
            break;
        case 'item':
            loadItems();
            break;
        case 'carrito':
            loadCarritos();
            break;
    }
}

// API Functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        showAlert('Error en la operación: ' + error.message, 'error');
        throw error;
    }
}

// USER CRUD Operations
async function loadUsers() {
    try {
        const users = await apiRequest(`${API_BASE_URL}/user`);
        renderUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('user-table-body');
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><h3>No hay usuarios registrados</h3><p>Agrega el primer usuario para comenzar</p></td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.type}</td>
            <td>${user.email}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editUser(${user.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleUserSubmit(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('user-name').value,
        type: document.getElementById('user-type').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value
    };
    
    try {
        if (editingId) {
            await apiRequest(`${API_BASE_URL}/user/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({ ...userData, id: editingId })
            });
            showAlert('Usuario actualizado exitosamente', 'success');
        } else {
            await apiRequest(`${API_BASE_URL}/user`, {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            showAlert('Usuario creado exitosamente', 'success');
        }
        
        closeModal('user-modal');
        loadUsers();
        loadSelectOptions();
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

function showUserModal() {
    editingId = null;
    document.getElementById('user-modal-title').textContent = 'Agregar Usuario';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    showModal('user-modal');
}

async function editUser(id) {
    try {
        const user = await apiRequest(`${API_BASE_URL}/user/${id}`);
        editingId = id;
        
        document.getElementById('user-modal-title').textContent = 'Editar Usuario';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-type').value = user.type;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-password').value = user.password;
        
        showModal('user-modal');
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

async function deleteUser(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        try {
            await apiRequest(`${API_BASE_URL}/user/${id}`, {
                method: 'DELETE'
            });
            showAlert('Usuario eliminado exitosamente', 'success');
            loadUsers();
            loadSelectOptions();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}

// SODA CRUD Operations
async function loadSodas() {
    try {
        const sodas = await apiRequest(`${API_BASE_URL}/soda`);
        renderSodas(sodas);
    } catch (error) {
        console.error('Error loading sodas:', error);
    }
}

function renderSodas(sodas) {
    const tbody = document.getElementById('soda-table-body');
    if (!sodas || sodas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><h3>No hay sodas registradas</h3><p>Agrega la primera soda para comenzar</p></td></tr>';
        return;
    }
    
    tbody.innerHTML = sodas.map(soda => `
        <tr>
            <td>${soda.id}</td>
            <td>${soda.name}</td>
            <td>${soda.type}</td>
            <td>${soda.location}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editSoda(${soda.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSoda(${soda.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleSodaSubmit(e) {
    e.preventDefault();
    
    const sodaData = {
        name: document.getElementById('soda-name').value,
        type: document.getElementById('soda-type').value,
        location: document.getElementById('soda-location').value
    };
    
    try {
        if (editingId) {
            await apiRequest(`${API_BASE_URL}/soda/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({ ...sodaData, id: editingId })
            });
            showAlert('Soda actualizada exitosamente', 'success');
        } else {
            await apiRequest(`${API_BASE_URL}/soda`, {
                method: 'POST',
                body: JSON.stringify(sodaData)
            });
            showAlert('Soda creada exitosamente', 'success');
        }
        
        closeModal('soda-modal');
        loadSodas();
        loadSelectOptions();
    } catch (error) {
        console.error('Error saving soda:', error);
    }
}

function showSodaModal() {
    editingId = null;
    document.getElementById('soda-modal-title').textContent = 'Agregar Soda';
    document.getElementById('soda-form').reset();
    showModal('soda-modal');
}

async function editSoda(id) {
    try {
        const soda = await apiRequest(`${API_BASE_URL}/soda/${id}`);
        editingId = id;
        
        document.getElementById('soda-modal-title').textContent = 'Editar Soda';
        document.getElementById('soda-name').value = soda.name;
        document.getElementById('soda-type').value = soda.type;
        document.getElementById('soda-location').value = soda.location;
        
        showModal('soda-modal');
    } catch (error) {
        console.error('Error loading soda:', error);
    }
}

async function deleteSoda(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta soda?')) {
        try {
            await apiRequest(`${API_BASE_URL}/soda/${id}`, {
                method: 'DELETE'
            });
            showAlert('Soda eliminada exitosamente', 'success');
            loadSodas();
            loadSelectOptions();
        } catch (error) {
            console.error('Error deleting soda:', error);
        }
    }
}

// MENU CRUD Operations
async function loadMenus() {
    try {
        const menus = await apiRequest(`${API_BASE_URL}/menu`);
        renderMenus(menus);
    } catch (error) {
        console.error('Error loading menus:', error);
    }
}

function renderMenus(menus) {
    const tbody = document.getElementById('menu-table-body');
    if (!menus || menus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><h3>No hay menús registrados</h3><p>Agrega el primer menú para comenzar</p></td></tr>';
        return;
    }
    
    tbody.innerHTML = menus.map(menu => `
        <tr>
            <td>${menu.id}</td>
            <td>${menu.name}</td>
            <td>${menu.price}</td>
            <td>${menu.foodDescription}</td>
            <td>${menu.soda ? menu.soda.name : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editMenu(${menu.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMenu(${menu.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleMenuSubmit(e) {
    e.preventDefault();
    
    const menuData = {
        name: document.getElementById('menu-name').value,
        price: parseFloat(document.getElementById('menu-price').value),
        foodDescription: document.getElementById('menu-description').value,
        soda: {
            id: parseInt(document.getElementById('menu-soda').value)
        }
    };
    
    try {
        if (editingId) {
            await apiRequest(`${API_BASE_URL}/menu/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({ ...menuData, id: editingId })
            });
            showAlert('Menú actualizado exitosamente', 'success');
        } else {
            await apiRequest(`${API_BASE_URL}/menu`, {
                method: 'POST',
                body: JSON.stringify(menuData)
            });
            showAlert('Menú creado exitosamente', 'success');
        }
        
        closeModal('menu-modal');
        loadMenus();
    } catch (error) {
        console.error('Error saving menu:', error);
    }
}

function showMenuModal() {
    editingId = null;
    document.getElementById('menu-modal-title').textContent = 'Agregar Menú';
    document.getElementById('menu-form').reset();
    showModal('menu-modal');
}

async function editMenu(id) {
    try {
        const menu = await apiRequest(`${API_BASE_URL}/menu/${id}`);
        editingId = id;
        
        document.getElementById('menu-modal-title').textContent = 'Editar Menú';
        document.getElementById('menu-name').value = menu.name;
        document.getElementById('menu-price').value = menu.price;
        document.getElementById('menu-description').value = menu.foodDescription;
        document.getElementById('menu-soda').value = menu.soda ? menu.soda.id : '';
        
        showModal('menu-modal');
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

async function deleteMenu(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este menú?')) {
        try {
            await apiRequest(`${API_BASE_URL}/menu/${id}`, {
                method: 'DELETE'
            });
            showAlert('Menú eliminado exitosamente', 'success');
            loadMenus();
        } catch (error) {
            console.error('Error deleting menu:', error);
        }
    }
}

// ITEM CRUD Operations
async function loadItems() {
    try {
        const items = await apiRequest(`${API_BASE_URL}/Item`);
        renderItems(items);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

function renderItems(items) {
    const tbody = document.getElementById('item-table-body');
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><h3>No hay items registrados</h3><p>Agrega el primer item para comenzar</p></td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>${item.soda ? item.soda.name : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editItem(${item.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleItemSubmit(e) {
    e.preventDefault();
    
    const itemData = {
        name: document.getElementById('item-name').value,
        price: parseFloat(document.getElementById('item-price').value),
        soda: {
            id: parseInt(document.getElementById('item-soda').value)
        }
    };
    
    try {
        if (editingId) {
            await apiRequest(`${API_BASE_URL}/Item/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({ ...itemData, id: editingId })
            });
            showAlert('Item actualizado exitosamente', 'success');
        } else {
            await apiRequest(`${API_BASE_URL}/Item`, {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
            showAlert('Item creado exitosamente', 'success');
        }
        
        closeModal('item-modal');
        loadItems();
        loadSelectOptions();
    } catch (error) {
        console.error('Error saving item:', error);
    }
}

function showItemModal() {
    editingId = null;
    document.getElementById('item-modal-title').textContent = 'Agregar Item';
    document.getElementById('item-form').reset();
    showModal('item-modal');
}

async function editItem(id) {
    try {
        const item = await apiRequest(`${API_BASE_URL}/Item/${id}`);
        editingId = id;
        
        document.getElementById('item-modal-title').textContent = 'Editar Item';
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-soda').value = item.soda ? item.soda.id : '';
        
        showModal('item-modal');
    } catch (error) {
        console.error('Error loading item:', error);
    }
}

async function deleteItem(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este item?')) {
        try {
            await apiRequest(`${API_BASE_URL}/Item/${id}`, {
                method: 'DELETE'
            });
            showAlert('Item eliminado exitosamente', 'success');
            loadItems();
            loadSelectOptions();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }
}

// CARRITO CRUD Operations
async function loadCarritos() {
    try {
        const carritos = await apiRequest(`${API_BASE_URL}/carrito`);
        renderCarritos(carritos);
    } catch (error) {
        console.error('Error loading carritos:', error);
    }
}

function renderCarritos(carritos) {
    const tbody = document.getElementById('carrito-table-body');
    if (!carritos || carritos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><h3>No hay items en el carrito</h3><p>Agrega el primer item al carrito para comenzar</p></td></tr>';
        return;
    }
    
    tbody.innerHTML = carritos.map(carrito => `
        <tr>
            <td>${carrito.id}</td>
            <td>${carrito.item ? carrito.item.name : 'N/A'}</td>
            <td>${carrito.user ? carrito.user.name : 'N/A'}</td>
            <td>${carrito.category}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editCarrito(${carrito.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCarrito(${carrito.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleCarritoSubmit(e) {
    e.preventDefault();
    
    const carritoData = {
        item: {
            id: parseInt(document.getElementById('carrito-item').value)
        },
        user: {
            id: parseInt(document.getElementById('carrito-user').value)
        },
        category: document.getElementById('carrito-category').value
    };
    
    try {
        if (editingId) {
            await apiRequest(`${API_BASE_URL}/carrito/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({ ...carritoData, id: editingId })
            });
            showAlert('Carrito actualizado exitosamente', 'success');
        } else {
            await apiRequest(`${API_BASE_URL}/carrito`, {
                method: 'POST',
                body: JSON.stringify(carritoData)
            });
            showAlert('Item agregado al carrito exitosamente', 'success');
        }
        
        closeModal('carrito-modal');
        loadCarritos();
    } catch (error) {
        console.error('Error saving carrito:', error);
    }
}

function showCarritoModal() {
    editingId = null;
    document.getElementById('carrito-modal-title').textContent = 'Agregar al Carrito';
    document.getElementById('carrito-form').reset();
    showModal('carrito-modal');
}

async function editCarrito(id) {
    try {
        const carrito = await apiRequest(`${API_BASE_URL}/carrito/${id}`);
        editingId = id;
        
        document.getElementById('carrito-modal-title').textContent = 'Editar Carrito';
        document.getElementById('carrito-item').value = carrito.item ? carrito.item.id : '';
        document.getElementById('carrito-user').value = carrito.user ? carrito.user.id : '';
        document.getElementById('carrito-category').value = carrito.category;
        
        showModal('carrito-modal');
    } catch (error) {
        console.error('Error loading carrito:', error);
    }
}

async function deleteCarrito(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este item del carrito?')) {
        try {
            await apiRequest(`${API_BASE_URL}/carrito/${id}`, {
                method: 'DELETE'
            });
            showAlert('Item eliminado del carrito exitosamente', 'success');
            loadCarritos();
        } catch (error) {
            console.error('Error deleting carrito:', error);
        }
    }
}

// Load select options for dropdowns
async function loadSelectOptions() {
    try {
        // Load sodas for menu and item selects
        const sodas = await apiRequest(`${API_BASE_URL}/soda`);
        const menuSodaSelect = document.getElementById('menu-soda');
        const itemSodaSelect = document.getElementById('item-soda');
        
        const sodaOptions = sodas.map(soda => 
            `<option value="${soda.id}">${soda.name}</option>`
        ).join('');
        
        menuSodaSelect.innerHTML = '<option value="">Seleccionar Soda</option>' + sodaOptions;
        itemSodaSelect.innerHTML = '<option value="">Seleccionar Soda</option>' + sodaOptions;
        
        // Load items for carrito select
        const items = await apiRequest(`${API_BASE_URL}/Item`);
        const carritoItemSelect = document.getElementById('carrito-item');
        
        const itemOptions = items.map(item => 
            `<option value="${item.id}">${item.name}</option>`
        ).join('');
        
        carritoItemSelect.innerHTML = '<option value="">Seleccionar Item</option>' + itemOptions;
        
        // Load users for carrito select
        const users = await apiRequest(`${API_BASE_URL}/user`);
        const carritoUserSelect = document.getElementById('carrito-user');
        
        const userOptions = users.map(user => 
            `<option value="${user.id}">${user.name}</option>`
        ).join('');
        
        carritoUserSelect.innerHTML = '<option value="">Seleccionar Usuario</option>' + userOptions;
        
    } catch (error) {
        console.error('Error loading select options:', error);
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    editingId = null;
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// Alert function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}