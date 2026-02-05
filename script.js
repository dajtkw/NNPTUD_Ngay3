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
    rowsPerPageBottom: document.getElementById('rows-per-page-bottom'),
    productCount: document.getElementById('product-count'),
    pageStart: document.getElementById('page-start'),
    pageEnd: document.getElementById('page-end'),
    totalItems: document.getElementById('total-items'),
    pagination: document.getElementById('pagination'),
    prevPage: document.getElementById('prev-page'),
    nextPage: document.getElementById('next-page'),
    firstPage: document.getElementById('first-page'),
    lastPage: document.getElementById('last-page'),
    pageJump: document.getElementById('page-jump'),
    btnGoPage: document.getElementById('btn-go-page'),
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
    
    // Update previous/next/first/last buttons
    elements.prevPage.parentElement.classList.toggle('disabled', currentPage === 1);
    elements.nextPage.parentElement.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
    elements.firstPage.parentElement.classList.toggle('disabled', currentPage === 1);
    elements.lastPage.parentElement.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
    
    // Update page jump input
    elements.pageJump.value = currentPage;
    elements.pageJump.max = totalPages || 1;
    
    // Generate page number buttons
    const pageNumbersContainer = elements.pagination;
    // Find the element after prev-page and before next-page
    const pageItems = pageNumbersContainer.querySelectorAll('.page-item');
    const staticItems = ['first-page', 'prev-page', 'next-page', 'last-page'];
    
    // Remove dynamic page number items (keep only static ones)
    pageItems.forEach(item => {
        if (!staticItems.some(id => item.id === id) && !item.classList.contains('page-number')) {
            item.remove();
        }
    });
    
    // Insert page number buttons
    if (totalPages > 0) {
        const prevPageItem = elements.prevPage.parentElement;
        const nextPageItem = elements.nextPage.parentElement;
        
        // Calculate range of pages to show (max 5 pages)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust start page if we're near the end
        if (endPage - startPage < 4 && startPage > 1) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Create page number buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item page-number ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            
            // Insert before next page button
            nextPageItem.before(pageItem);
            
            // Add click event
            pageItem.addEventListener('click', (e) => {
                e.preventDefault();
                if (state.currentPage !== i) {
                    state.currentPage = i;
                    renderTable();
                }
            });
        }
    }
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
    
    // First page
    elements.firstPage.addEventListener('click', function(e) {
        e.preventDefault();
        if (state.currentPage > 1) {
            state.currentPage = 1;
            renderTable();
        }
    });
    
    // Last page
    elements.lastPage.addEventListener('click', function(e) {
        e.preventDefault();
        const totalPages = Math.ceil(state.filteredProducts.length / state.rowsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage = totalPages;
            renderTable();
        }
    });
    
    // Go to page button
    elements.btnGoPage.addEventListener('click', function(e) {
        e.preventDefault();
        const page = parseInt(elements.pageJump.value);
        const totalPages = Math.ceil(state.filteredProducts.length / state.rowsPerPage);
        
        if (page >= 1 && page <= totalPages && page !== state.currentPage) {
            state.currentPage = page;
            renderTable();
        }
    });
    
    // Page jump input (Enter key)
    elements.pageJump.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            elements.btnGoPage.click();
        }
    });
    
    // Bottom rows per page dropdown
    elements.rowsPerPageBottom.addEventListener('change', function() {
        state.rowsPerPage = parseInt(this.value);
        state.currentPage = 1;
        // Sync top dropdown
        elements.rowsPerPageSelect.value = this.value;
        renderTable();
        updateCounters();
    });
    
    // Create button
    elements.btnCreate.addEventListener('click', function() {
        openCreateModal();
    });
    
    // Export button
    elements.btnExport.addEventListener('click', function() {
        // Ask user what to export
        const exportAll = confirm('Do you want to export ALL filtered products?\n\nClick "OK" to export all filtered products.\nClick "Cancel" to export only the current page.');
        exportToCSV(exportAll);
    });
    
    // View detail (delegated)
    elements.tableBody.addEventListener('click', function(e) {
        if (e.target.closest('.view-detail')) {
            const button = e.target.closest('.view-detail');
            const productId = button.getAttribute('data-id');
            viewProductDetail(productId);
        }
        
        // Edit product
        if (e.target.closest('.edit-product')) {
            const button = e.target.closest('.edit-product');
            const productId = button.getAttribute('data-id');
            openEditModal(productId);
        }
        
        // Delete product
        if (e.target.closest('.delete-product')) {
            const button = e.target.closest('.delete-product');
            const productId = button.getAttribute('data-id');
            openDeleteModal(productId);
        }
    });
    
    // Add Image URL button (delegated to document since modal may not be in DOM initially)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'btn-add-image') {
            e.preventDefault();
            addImageInput();
        }
        
        // Remove image input button
        if (e.target && e.target.closest('.btn-remove-image')) {
            e.preventDefault();
            const removeBtn = e.target.closest('.btn-remove-image');
            if (!removeBtn.disabled) {
                removeImageInput(removeBtn);
            }
        }
    });
    
    // Form submission
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // The actual submission is handled by the button click handlers we set in openCreateModal/openEditModal
        // This just prevents default form submission
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

// View product detail modal
function viewProductDetail(productId) {
    const product = state.products.find(p => p.id == productId);
    if (!product) {
        console.error(`Product with ID ${productId} not found`);
        return;
    }

    // Populate modal elements
    document.getElementById('detail-title').textContent = product.title;
    document.getElementById('detail-price').textContent = `$${product.price}`;
    document.getElementById('detail-category').textContent = product.category?.name || 'Uncategorized';
    document.getElementById('detail-description').textContent = product.description || 'No description available';
    document.getElementById('detail-id').textContent = product.id;
    document.getElementById('detail-slug').textContent = product.slug || 'N/A';
    document.getElementById('detail-creation').textContent = product.creationAt ? new Date(product.creationAt).toLocaleString() : 'Unknown';
    document.getElementById('detail-updated').textContent = product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'Unknown';
    document.getElementById('detail-images-count').textContent = product.images?.length || 0;

    // Determine status based on price
    const status = product.price > 500 ? 'Premium' : 'Standard';
    const statusClass = product.price > 500 ? 'bg-warning' : 'bg-success';
    const statusElement = document.getElementById('detail-status');
    statusElement.textContent = status;
    statusElement.className = `badge ${statusClass}`;

    // Populate image carousel
    const carouselInner = document.getElementById('detail-carousel');
    carouselInner.innerHTML = '';
    
    if (product.images && product.images.length > 0) {
        product.images.forEach((img, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            carouselItem.innerHTML = `
                <img src="${img}" class="d-block w-100 rounded" alt="Product image ${index + 1}" style="max-height: 400px; object-fit: cover;">
            `;
            carouselInner.appendChild(carouselItem);
        });
    } else {
        // Show placeholder if no images
        carouselInner.innerHTML = `
            <div class="carousel-item active">
                <img src="https://placehold.co/600x400?text=No+Image" class="d-block w-100 rounded" alt="No image available" style="max-height: 400px; object-fit: cover;">
            </div>
        `;
    }

    // Set up edit button to open edit modal
    const editButton = document.getElementById('btn-edit-from-detail');
    editButton.onclick = () => {
        // Close detail modal
        const detailModal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
        if (detailModal) detailModal.hide();
        
        // Open edit modal with this product
        openEditModal(product.id);
    };

    // Show the modal
    const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
    detailModal.show();
}

// Open create modal
function openCreateModal() {
    // Reset form
    document.getElementById('product-form').reset();
    document.getElementById('formModalTitle').innerHTML = '<i class="fas fa-plus-circle me-2"></i>Create New Product';
    
    // Clear dynamic image inputs except first one
    const container = document.getElementById('image-urls-container');
    while (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }
    
    // Clear the first input
    const firstInput = container.querySelector('input');
    if (firstInput) {
        firstInput.value = '';
    }
    
    // Update remove buttons state
    updateRemoveButtonsState();
    
    // Set up form submission for create
    const submitBtn = document.getElementById('btn-submit-form');
    submitBtn.onclick = (e) => {
        e.preventDefault();
        handleCreateProduct();
    };
    
    // Show modal
    const formModal = new bootstrap.Modal(document.getElementById('formModal'));
    formModal.show();
}

// Open edit modal
function openEditModal(productId) {
    const product = state.products.find(p => p.id == productId);
    if (!product) {
        console.error(`Product with ID ${productId} not found`);
        return;
    }
    
    // Populate form fields
    document.getElementById('form-title').value = product.title;
    document.getElementById('form-price').value = product.price;
    document.getElementById('form-description').value = product.description || '';
    document.getElementById('form-category').value = product.category?.id || '';
    document.getElementById('form-featured').checked = product.price > 500; // Example logic
    document.getElementById('form-in-stock').checked = true;
    
    // Populate image URLs
    const container = document.getElementById('image-urls-container');
    container.innerHTML = '';
    
    if (product.images && product.images.length > 0) {
        product.images.forEach((img, index) => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group mb-2';
            inputGroup.innerHTML = `
                <input type="url" class="form-control" value="${img}" placeholder="https://example.com/image.jpg">
                <button type="button" class="btn btn-outline-danger btn-remove-image" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(inputGroup);
        });
    } else {
        // Add one empty input
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group mb-2';
        inputGroup.innerHTML = `
            <input type="url" class="form-control" placeholder="https://example.com/image.jpg">
            <button type="button" class="btn btn-outline-danger btn-remove-image" disabled>
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(inputGroup);
    }
    
    // Update modal title
    document.getElementById('formModalTitle').innerHTML = `<i class="fas fa-edit me-2"></i>Edit Product: ${product.title}`;
    
    // Update remove buttons state
    updateRemoveButtonsState();
    
    // Set up form submission for update
    const submitBtn = document.getElementById('btn-submit-form');
    submitBtn.onclick = (e) => {
        e.preventDefault();
        handleUpdateProduct(product.id);
    };
    
    // Show modal
    const formModal = new bootstrap.Modal(document.getElementById('formModal'));
    formModal.show();
}

// Open delete confirmation modal
function openDeleteModal(productId) {
    const product = state.products.find(p => p.id == productId);
    if (!product) {
        console.error(`Product with ID ${productId} not found`);
        return;
    }
    
    // Set product ID in hidden input
    document.getElementById('delete-product-id').value = productId;
    
    // Update modal message
    const modalBody = document.querySelector('#deleteModal .modal-body p');
    modalBody.textContent = `Are you sure you want to delete "${product.title}" (ID: ${productId})?`;
    
    // Set up delete confirmation
    const confirmBtn = document.getElementById('btn-confirm-delete');
    confirmBtn.onclick = () => handleDeleteProduct(productId);
    
    // Show modal
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

// Handle create product
async function handleCreateProduct() {
    // Gather form data
    const title = document.getElementById('form-title').value.trim();
    const price = parseFloat(document.getElementById('form-price').value);
    const description = document.getElementById('form-description').value.trim();
    const categoryId = parseInt(document.getElementById('form-category').value);
    
    // Gather image URLs
    const imageInputs = document.querySelectorAll('#image-urls-container input');
    const images = Array.from(imageInputs)
        .map(input => input.value.trim())
        .filter(url => url !== '');
    
    // Validation
    if (!title || isNaN(price) || price < 0 || !categoryId) {
        alert('Please fill in all required fields (Title, Price, Category) with valid values.');
        return;
    }
    
    if (images.length === 0) {
        alert('Please add at least one image URL.');
        return;
    }
    
    // Prepare request body
    const productData = {
        title,
        price,
        description,
        categoryId,
        images
    };
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('btn-submit-form');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Creating...';
        submitBtn.disabled = true;
        
        // Send POST request
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newProduct = await response.json();
        console.log('Product created successfully:', newProduct);
        
        // Close modal
        const formModal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
        if (formModal) formModal.hide();
        
        // Show success message
        alert(`Product "${newProduct.title}" created successfully!`);
        
        // Refresh product list
        await fetchProducts();
        renderTable();
        updateCounters();
        
    } catch (error) {
        console.error('Error creating product:', error);
        alert(`Failed to create product: ${error.message}`);
    } finally {
        // Restore button state
        const submitBtn = document.getElementById('btn-submit-form');
        submitBtn.innerHTML = '<i class="fas fa-save me-1"></i> Save Product';
        submitBtn.disabled = false;
    }
}

// Handle update product
async function handleUpdateProduct(productId) {
    // Gather form data
    const title = document.getElementById('form-title').value.trim();
    const price = parseFloat(document.getElementById('form-price').value);
    const description = document.getElementById('form-description').value.trim();
    const categoryId = parseInt(document.getElementById('form-category').value);
    
    // Gather image URLs
    const imageInputs = document.querySelectorAll('#image-urls-container input');
    const images = Array.from(imageInputs)
        .map(input => input.value.trim())
        .filter(url => url !== '');
    
    // Validation
    if (!title || isNaN(price) || price < 0 || !categoryId) {
        alert('Please fill in all required fields (Title, Price, Category) with valid values.');
        return;
    }
    
    if (images.length === 0) {
        alert('Please add at least one image URL.');
        return;
    }
    
    // Prepare request body
    const productData = {
        title,
        price,
        description,
        categoryId,
        images
    };
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('btn-submit-form');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Updating...';
        submitBtn.disabled = true;
        
        // Send PUT request
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedProduct = await response.json();
        console.log('Product updated successfully:', updatedProduct);
        
        // Close modal
        const formModal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
        if (formModal) formModal.hide();
        
        // Show success message
        alert(`Product "${updatedProduct.title}" updated successfully!`);
        
        // Refresh product list
        await fetchProducts();
        renderTable();
        updateCounters();
        
    } catch (error) {
        console.error('Error updating product:', error);
        alert(`Failed to update product: ${error.message}`);
    } finally {
        // Restore button state
        const submitBtn = document.getElementById('btn-submit-form');
        submitBtn.innerHTML = '<i class="fas fa-save me-1"></i> Save Product';
        submitBtn.disabled = false;
    }
}

// Handle delete product
async function handleDeleteProduct(productId) {
    try {
        // Show loading state
        const deleteBtn = document.getElementById('btn-confirm-delete');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Deleting...';
        deleteBtn.disabled = true;
        
        // Send DELETE request
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log(`Product ${productId} deleted successfully`);
        
        // Close modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        if (deleteModal) deleteModal.hide();
        
        // Show success message
        alert(`Product deleted successfully!`);
        
        // Refresh product list
        await fetchProducts();
        renderTable();
        updateCounters();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        alert(`Failed to delete product: ${error.message}`);
    } finally {
        // Restore button state
        const deleteBtn = document.getElementById('btn-confirm-delete');
        deleteBtn.innerHTML = '<i class="fas fa-trash me-1"></i> Delete Product';
        deleteBtn.disabled = false;
    }
}

// Helper function to add image input field
function addImageInput() {
    const container = document.getElementById('image-urls-container');
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group mb-2';
    inputGroup.innerHTML = `
        <input type="url" class="form-control" placeholder="https://example.com/image.jpg">
        <button type="button" class="btn btn-outline-danger btn-remove-image">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(inputGroup);
    
    // Enable remove buttons on all but the first input
    updateRemoveButtonsState();
}

// Helper function to remove image input field
function removeImageInput(button) {
    const container = document.getElementById('image-urls-container');
    if (container.children.length > 1) {
        button.closest('.input-group').remove();
        updateRemoveButtonsState();
    }
}

// Update state of remove buttons (disable if only one input remains)
function updateRemoveButtonsState() {
    const container = document.getElementById('image-urls-container');
    const removeButtons = container.querySelectorAll('.btn-remove-image');
    
    removeButtons.forEach((btn, index) => {
        btn.disabled = container.children.length === 1;
    });
}

// Export products to CSV file
function exportToCSV(exportAll = true) {
    console.log('exportToCSV called with exportAll =', exportAll);
    
    let productsToExport;
    
    if (exportAll) {
        // Export all filtered products (entire dataset after search/filter)
        productsToExport = state.filteredProducts;
        console.log(`Exporting all ${productsToExport.length} filtered products to CSV`);
    } else {
        // Export only current page products
        const { filteredProducts, currentPage, rowsPerPage } = state;
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        productsToExport = filteredProducts.slice(startIndex, endIndex);
        console.log(`Exporting ${productsToExport.length} products from page ${currentPage} to CSV`);
    }
    
    if (productsToExport.length === 0) {
        alert('No products to export. Please load data first.');
        return;
    }
    
    // Define CSV headers
    const headers = [
        'ID',
        'Title',
        'Price',
        'Description',
        'Category',
        'Category ID',
        'Slug',
        'Images Count',
        'First Image URL',
        'Creation Date',
        'Last Updated'
    ];
    
    // Convert products to CSV rows
    const rows = productsToExport.map(product => {
        const categoryName = product.category?.name || 'Uncategorized';
        const categoryId = product.category?.id || '';
        const imagesCount = product.images?.length || 0;
        const firstImage = product.images?.[0] || '';
        const creationDate = product.creationAt ? new Date(product.creationAt).toISOString() : '';
        const updatedDate = product.updatedAt ? new Date(product.updatedAt).toISOString() : '';
        
        // Escape fields that may contain commas, quotes, or newlines
        const escapeField = (field) => {
            if (field === null || field === undefined) return '';
            const stringField = String(field);
            // If contains comma, quote, or newline, wrap in quotes and double any quotes inside
            if (/[,"\n\r]/.test(stringField)) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };
        
        return [
            product.id,
            escapeField(product.title),
            product.price,
            escapeField(product.description),
            escapeField(categoryName),
            categoryId,
            escapeField(product.slug),
            imagesCount,
            escapeField(firstImage),
            escapeField(creationDate),
            escapeField(updatedDate)
        ].join(',');
    });
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows
    ].join('\n');
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const scope = exportAll ? 'all' : `page-${state.currentPage}`;
    link.download = `products-export-${scope}-${timestamp}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Show success message
    const productCount = productsToExport.length;
    alert(`Successfully exported ${productCount} product${productCount !== 1 ? 's' : ''} to CSV file.\n\nFile: ${link.download}`);
    
    console.log(`CSV export completed: ${link.download}`);
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

// ============================================
// PHASE 6: EXPORT CSV & COMPLETION
// ============================================
// The exportToCSV() function has been implemented with the following features:
// 1. Exports either all filtered products or only current page products
// 2. Generates proper CSV format with headers
// 3. Handles special characters (commas, quotes, newlines) with proper escaping
// 4. Creates a downloadable file with timestamp in the filename
// 5. Shows success alert with export count
//
// To complete Phase 6 as per plan.md:
// 1. Test the export functionality by clicking the "Export CSV" button
// 2. Take screenshots of:
//    - Product grid with data loaded
//    - Search/filter results
//    - Sort indicators (click on column headers)
//    - Modal windows (View Detail, Create/Edit, Delete)
//    - CSV download prompt and downloaded file
// 3. Paste screenshots into a Word document with brief descriptions
// 4. Verify all features work as expected
// ============================================