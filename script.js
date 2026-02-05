const API_URL = 'https://api.escuelajs.co/api/v1/products';

// Global state
let state = {
    products: [],
    filteredProducts: [],
    currentPage: 1,
    rowsPerPage: 10,
    sortColumn: null,
    sortDirection: 'asc',
    searchKeyword: ''
};

// DOM Elements
const elements = {
    tableBody: document.getElementById('product-table-body'),
    searchInput: document.getElementById('search-input'),
    rowsPerPageSelect: document.getElementById('rows-per-page'),
    productCount: document.getElementById('product-count'),
    pageStart: document.getElementById('page-start'),
    pageEnd: document.getElementById('page-end'),
    totalItems: document.getElementById('total-items'),
    pagination: document.getElementById('pagination'),
    prevPage: document.getElementById('prev-page'),
    nextPage: document.getElementById('next-page'),
    btnCreate: document.getElementById('btn-create'),
    btnExport: document.getElementById('btn-export'),
    sortIcons: document.querySelectorAll('.sort-icon')
};

// Initialize application
async function init() {
    console.log('Initializing Product Dashboard...');
    console.log('Testing API connection to:', API_URL);
    
    try {
        // Show loading state
        showLoading(true);
        
        // Fetch products from API
        await fetchProducts();
        
        // Render initial table
        renderTable();
        
        // Update UI counters
        updateCounters();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Application initialized successfully!');
        console.log('Total products loaded:', state.products.length);
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to load products from API. Please check your connection.');
    } finally {
        showLoading(false);
    }
}

// Fetch products from API
async function fetchProducts() {
    try {
        console.log('Fetching products from API...');
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.length} products from API`);
        
        // Store in state
        state.products = data;
        state.filteredProducts = [...data];
        
        // Log first product for verification
        if (data.length > 0) {
            console.log('Sample product:', {
                id: data[0].id,
                title: data[0].title,
                price: data[0].price,
                category: data[0].category?.name,
                images: data[0].images?.length
            });
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Render table with current filtered products
function renderTable() {
    const { filteredProducts, currentPage, rowsPerPage } = state;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Clear table body
    elements.tableBody.innerHTML = '';
    
    if (pageProducts.length === 0) {
        // Show empty state
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-box-open fa-2x text-muted mb-2"></i>
                    <p class="mb-0">No products found</p>
                    <small class="text-muted">Try adjusting your search or filters</small>
                </td>
            </tr>
        `;
        return;
    }
    
    // Generate table rows
    pageProducts.forEach(product => {
        const row = document.createElement('tr');
        row.title = product.description || 'No description available';
        row.setAttribute('data-id', product.id);
        
        // Get first image or placeholder
        const imageUrl = product.images?.[0] || 'https://placehold.co/100x100?text=No+Image';
        const categoryName = product.category?.name || 'Uncategorized';
        
        // Determine status based on price (example logic)
        const status = product.price > 500 ? 'Premium' : 'Standard';
        const statusClass = product.price > 500 ? 'bg-warning' : 'bg-success';
        
        row.innerHTML = `
            <td class="ps-4">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${product.id}">
                </div>
            </td>
            <td class="fw-bold">${product.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="me-2">
                        <img src="${imageUrl}" alt="${product.title}" class="img-thumbnail" width="50" height="50">
                    </div>
                    <div>
                        <div class="fw-medium">${product.title}</div>
                        <small class="text-muted">${product.slug || ''}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-success fs-6">$${product.price}</span>
            </td>
            <td>
                <span class="badge bg-info">${categoryName}</span>
            </td>
            <td>
                <div class="d-flex">
                    ${product.images?.slice(0, 2).map(img =>
                        `<img src="${img}" class="img-thumbnail me-1" width="50" height="50" alt="Product image">`
                    ).join('')}
                    ${product.images?.length > 2 ?
                        `<span class="badge bg-secondary align-self-center">+${product.images.length - 2}</span>` : ''
                    }
                </div>
            </td>
            <td>
                <span class="badge ${statusClass}">${status}</span>
            </td>
            <td class="pe-4">
                <button class="btn btn-sm btn-outline-primary view-detail" data-id="${product.id}">
                    <i class="fas fa-eye me-1"></i> View
                </button>
                <button class="btn btn-sm btn-outline-warning edit-product" data-id="${product.id}">
                    <i class="fas fa-edit me-1"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger delete-product" data-id="${product.id}">
                    <i class="fas fa-trash me-1"></i> Delete
                </button>
            </td>
        `;
        
        elements.tableBody.appendChild(row);
    });
    
    // Update pagination UI
    renderPagination();
}

// Render pagination controls
function renderPagination() {
    const { filteredProducts, currentPage, rowsPerPage } = state;
    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    
    // Update page info
    elements.pageStart.textContent = Math.min((currentPage - 1) * rowsPerPage + 1, filteredProducts.length);
    elements.pageEnd.textContent = Math.min(currentPage * rowsPerPage, filteredProducts.length);
    elements.totalItems.textContent = filteredProducts.length;
    
    // Update previous/next buttons
    elements.prevPage.parentElement.classList.toggle('disabled', currentPage === 1);
    elements.nextPage.parentElement.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
    
    // Generate page numbers (simplified for Phase 1)
    // Full pagination will be implemented in Phase 4
}

// Update counters
function updateCounters() {
    elements.productCount.textContent = state.filteredProducts.length;
}

// Show/hide loading state
function showLoading(show) {
    const loadingRow = document.getElementById('loading-row');
    if (loadingRow) {
        loadingRow.style.display = show ? 'table-row' : 'none';
    }
}

// Show error message
function showError(message) {
    elements.tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5 text-danger">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>Error Loading Data</h5>
                <p class="mb-0">${message}</p>
                <button class="btn btn-sm btn-outline-primary mt-3" onclick="location.reload()">
                    <i class="fas fa-redo me-1"></i> Retry
                </button>
            </td>
        </tr>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    elements.searchInput.addEventListener('input', function() {
        state.searchKeyword = this.value.toLowerCase();
        filterProducts();
    });
    
    // Rows per page
    elements.rowsPerPageSelect.addEventListener('change', function() {
        state.rowsPerPage = parseInt(this.value);
        state.currentPage = 1;
        renderTable();
        updateCounters();
    });
    
    // Sort icons
    elements.sortIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const column = this.getAttribute('data-column');
            sortProducts(column);
        });
    });
    
    // Previous page
    elements.prevPage.addEventListener('click', function(e) {
        e.preventDefault();
        if (state.currentPage > 1) {
            state.currentPage--;
            renderTable();
        }
    });
    
    // Next page
    elements.nextPage.addEventListener('click', function(e) {
        e.preventDefault();
        const totalPages = Math.ceil(state.filteredProducts.length / state.rowsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderTable();
        }
    });
    
    // Create button
    elements.btnCreate.addEventListener('click', function() {
        alert('Create functionality will be implemented in Phase 5');
    });
    
    // Export button
    elements.btnExport.addEventListener('click', function() {
        alert('Export CSV functionality will be implemented in Phase 6');
    });
    
    // View detail (delegated)
    elements.tableBody.addEventListener('click', function(e) {
        if (e.target.closest('.view-detail')) {
            const button = e.target.closest('.view-detail');
            const productId = button.getAttribute('data-id');
            viewProductDetail(productId);
        }
    });
    
    console.log('Event listeners set up');
}

// Filter products based on search keyword
function filterProducts() {
    const { products, searchKeyword } = state;
    
    if (!searchKeyword.trim()) {
        state.filteredProducts = [...products];
    } else {
        state.filteredProducts = products.filter(product =>
            product.title.toLowerCase().includes(searchKeyword) ||
            product.description?.toLowerCase().includes(searchKeyword) ||
            product.category?.name.toLowerCase().includes(searchKeyword)
        );
    }
    
    state.currentPage = 1;
    renderTable();
    updateCounters();
}

// Sort products by column
function sortProducts(column) {
    const { filteredProducts, sortColumn, sortDirection } = state;
    
    // Toggle direction if same column
    if (sortColumn === column) {
        state.sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortColumn = column;
        state.sortDirection = 'asc';
    }
    
    // Sort the array
    state.filteredProducts.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        // Handle nested properties
        if (column === 'category') {
            aValue = a.category?.name;
            bValue = b.category?.name;
        }
        
        // Compare values
        if (aValue < bValue) return state.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return state.sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Update sort icons
    updateSortIcons();
    
    // Re-render table
    renderTable();
}

// Update sort icons visual state
function updateSortIcons() {
    elements.sortIcons.forEach(icon => {
        const column = icon.getAttribute('data-column');
        icon.className = 'fas fa-sort ms-1 sort-icon';
        
        if (column === state.sortColumn) {
            icon.classList.add('text-primary');
            icon.classList.remove('fa-sort');
            icon.classList.add(state.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
        }
    });
}

// View product detail (placeholder for Phase 5)
function viewProductDetail(productId) {
    const product = state.products.find(p => p.id == productId);
    if (product) {
        alert(`Product Detail:\n\nID: ${product.id}\nTitle: ${product.title}\nPrice: $${product.price}\nCategory: ${product.category?.name}\n\nFull functionality will be implemented in Phase 5 with modal.`);
    }
}

// Test API connectivity (for Phase 1 verification)
async function testAPIConnectivity() {
    try {
        console.log('Testing API connectivity...');
        const response = await fetch(`${API_URL}?limit=1`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            console.log('✅ API connectivity test PASSED');
            return true;
        } else {
            console.log('❌ API connectivity test FAILED - Unexpected response format');
            return false;
        }
    } catch (error) {
        console.error('❌ API connectivity test FAILED:', error);
        return false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, starting initialization...');
    
    // Run API test
    const apiTestPassed = await testAPIConnectivity();
    
    if (apiTestPassed) {
        await init();
    } else {
        showError('Cannot connect to API. Please check your internet connection and try again.');
    }
});

// Export for debugging
window.appState = state;