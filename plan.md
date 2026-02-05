Chào bạn, đây là một bài tập dạng "Mini-Project" Front-end rất điển hình và thực tế. Để hoàn thành tốt yêu cầu này mà không bị rối, bạn cần chia nhỏ công việc ra làm từng giai đoạn.

Dưới đây là **kế hoạch chi tiết (Step-by-step)** để bạn thực hiện dự án này:

---

### Giai đoạn 1: Chuẩn bị & Cấu trúc dự án (Project Setup)

**Mục tiêu:** Tạo khung sườn, kết nối Bootstrap và kiểm tra API.

1. **Cấu trúc thư mục:**
* Tạo folder dự án (ví dụ: `Product-Dashboard`).
* Tạo file `index.html`.
* Tạo file `script.js`.
* (Tùy chọn) Tạo `style.css` nếu muốn custom thêm ngoài Bootstrap.


2. **Thiết lập `index.html`:**
* Import thư viện **Bootstrap 5 (CSS & JS Bundle)** qua CDN.
* Import **FontAwesome** (nếu muốn dùng icon cho nút Edit/Delete/Sort).
* Liên kết file `script.js` vào cuối body.


3. **Kiểm tra API:**
* Dùng Postman hoặc trình duyệt truy cập `https://api.escuelajs.co/api/v1/products` để xem cấu trúc JSON trả về (chú ý trường `images` là một mảng chuỗi).

Cấu trúc trả về khi dùng get, 
[
  {
    "id": 4,
    "title": "Handmade Fresh Table",
    "slug": "handmade-fresh-table",
    "price": 687,
    "description": "Andy shoes are designed to keeping in...",
    "category": {
      "id": 5,
      "name": "Others",
      "image": "https://placehold.co/600x400",
      "slug": "others"
    },
    "images": [
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400"
    ]
  }
  // ...
]


Request
Terminal window
[GET] https://api.escuelajs.co/api/v1/products/4

{
  "id": 4,
  "title": "Handmade Fresh Table",
  "slug": "handmade-fresh-table",
  "price": 687,
  "description": "Andy shoes are designed to keeping in...",
  "category": {
    "id": 5,
    "name": "Others",
    "image": "https://placehold.co/600x400",
    "slug": "others"
  },
  "images": [
    "https://placehold.co/600x400",
    "https://placehold.co/600x400",
    "https://placehold.co/600x400"
  ]
}

[GET] https://api.escuelajs.co/api/v1/products/slug/handmade-fresh-table
{
  "id": 4,
  "title": "Handmade Fresh Table",
  "slug": "handmade-fresh-table",
  "price": 687,
  "description": "Andy shoes are designed to keeping in...",
  "category": {
    "id": 5,
    "name": "Others",
    "image": "https://placehold.co/600x400",
    "slug": "others"
  },
  "images": [
    "https://placehold.co/600x400",
    "https://placehold.co/600x400",
    "https://placehold.co/600x400"
  ]
}

[POST] https://api.escuelajs.co/api/v1/products/
{
  "title": "New Product",
  "price": 10,
  "description": "A description",
  "categoryId": 1,
  "images": ["https://placehold.co/600x400"]
}

{
  "title": "New Product",
  "slug": "new-product",
  "price": 10,
  "description": "A description",
  "images": ["https://placehold.co/600x400"],
  "category": {
    "id": 1,
    "name": "Clothes",
    "image": "https://placehold.co/600x400",
    "slug": "clothes"
  },
  "id": 210,
  "creationAt": "2023-01-03T16:51:33.000Z",
  "updatedAt": "2023-01-03T16:51:33.000Z"
}

đây là cách trả về và cách lệnh get post


### Giai đoạn 2: Xây dựng giao diện tĩnh (UI Skeleton)

**Mục tiêu:** Dựng xong bộ khung HTML bằng Bootstrap trước khi viết JS.

1. **Header & Toolbar:**
* Thanh tìm kiếm (`input` search).
* Dropdown chọn số lượng dòng (5, 10, 20).
* Nút "Thêm mới" (Create New) - Nút này sẽ kích hoạt Modal Tạo.
* Nút "Export CSV".


2. **Bảng dữ liệu (Table):**
* Sử dụng class `.table .table-striped .table-hover` của Bootstrap.
* **Thead:** Các cột ID, Title (có icon sort), Price (có icon sort), Category, Images, Actions (nút View/Edit).
* **Tbody:** Để trống, gán `id="product-table-body"` để JS chèn dữ liệu vào sau.


3. **Pagination UI:**
* Khu vực hiển thị số trang và nút Next/Prev ở dưới bảng.


4. **Modals (Cửa sổ bật lên):**
* **Modal Form (Dùng chung cho Tạo & Sửa):** Gồm các input: Title, Price, Description, CategoryID, Image URL.
* **Modal Detail:** Chỉ dùng thẻ `p` hoặc `span` để hiển thị thông tin chi tiết (Read-only).



### Giai đoạn 3: Xử lý Logic cốt lõi (Core JavaScript)

**Mục tiêu:** Lấy dữ liệu từ API và hiển thị lên bảng.

1. **Khai báo biến toàn cục (State Management):**
* `let products = [];` (Chứa tất cả dữ liệu gốc từ API).
* `let filteredProducts = [];` (Chứa dữ liệu sau khi search/sort).
* `let currentPage = 1;`
* `let rowsPerPage = 5;`


2. **Hàm `fetchProducts()`:**
* Dùng `fetch('https://api.escuelajs.co/api/v1/products')`.
* Lưu kết quả vào biến `products` và `filteredProducts`.
* Gọi hàm `renderTable()`.


3. **Hàm `renderTable()`:**
* Tính toán chỉ số bắt đầu (`start`) và kết thúc (`end`) dựa trên `currentPage` và `rowsPerPage`.
* Dùng vòng lặp `map` hoặc `forEach` để tạo chuỗi HTML cho từng dòng (`<tr>`).
* **Xử lý cột Images:** Vì API trả về mảng, hãy lấy ảnh đầu tiên `images[0]` để hiển thị thumbnail (dùng thẻ `<img>` với class `img-thumbnail`, set `width: 50px`).
* **Xử lý Description Hover:** Thêm thuộc tính `title="Nội dung description"` vào thẻ `<tr>` hoặc thẻ `<td>` tên sản phẩm để khi di chuột sẽ hiện tooltip mặc định của trình duyệt.
* Gán innerHTML vào `tbody`.



### Giai đoạn 4: Các chức năng tương tác (Features Implementation)

**Mục tiêu:** Hoàn thiện Search, Sort, Pagination.

1. **Tìm kiếm (Search):**
* Bắt sự kiện `input` hoặc `keyup` vào ô tìm kiếm.
* Filter mảng `products` theo `title`.
* Cập nhật lại `filteredProducts` -> Reset về trang 1 -> Gọi `renderTable()`.


2. **Sắp xếp (Sort):**
* Bắt sự kiện click vào tiêu đề cột Price/Title.
* Dùng hàm `sort()` của mảng `filteredProducts`.
* Cần cờ (flag) để đảo chiều (Tăng dần/Giảm dần).
* Gọi `renderTable()`.


3. **Phân trang (Pagination):**
* Viết hàm `renderPagination()`: Tính tổng số trang = `Math.ceil(totalItems / rowsPerPage)`.
* Tạo các nút số trang. Khi click nút -> Cập nhật `currentPage` -> Gọi `renderTable()`.
* Xử lý sự kiện thay đổi dropdown số lượng (5, 10, 20) -> Cập nhật `rowsPerPage` -> Reset về trang 1 -> Gọi `renderTable()`.



### Giai đoạn 5: CRUD & Modals (Nâng cao)

**Mục tiêu:** Xem chi tiết, Tạo mới, Chỉnh sửa thông qua API.

1. **View Detail (Modal):**
* Bắt sự kiện click vào dòng hoặc nút "View".
* Lấy ID sản phẩm -> Tìm trong mảng `products` hoặc gọi API `GET /products/{id}`.
* Đổ dữ liệu vào Modal Detail -> `modal.show()`.


2. **Create New (POST):**
* Xử lý form submit ở Modal Tạo.
* Lấy value từ các input -> Gom thành object JSON.
* Gọi `fetch('...', { method: 'POST', body: ... })`.
* Thành công -> `alert('Đã tạo')` -> Gọi lại `fetchProducts()` để làm mới bảng -> Đóng modal.


3. **Edit/Update (PUT):**
* Khi click nút Edit trên bảng -> Mở Modal Form -> Điền sẵn dữ liệu cũ.
* Khi bấm Lưu -> Gọi `fetch('.../products/{id}', { method: 'PUT', body: ... })`.
* Thành công -> Làm mới bảng.



### Giai đoạn 6: Export CSV & Hoàn thiện

1. **Export CSV:**
* Viết hàm `exportToCSV()`.
* Duyệt qua mảng `filteredProducts` (dữ liệu đang hiển thị ở view hiện tại - hoặc trang hiện tại tùy yêu cầu).
* Tạo chuỗi String dạng CSV (ngăn cách bằng dấu phẩy).
* Tạo thẻ `<a>` ẩn, gán `href` là Blob dữ liệu, kích hoạt click để tải về.


2. **Chụp ảnh báo cáo:**
* Chụp màn hình sau khi xong mỗi chức năng (Lưới sản phẩm, Modal mở ra, Khi search, Khi sort, File CSV tải về...).
* Dán vào file Word.



### Gợi ý cấu trúc Code (Mẫu hàm)

```javascript
// script.js skeleton
const API_URL = 'https://api.escuelajs.co/api/v1/products';
let state = {
    products: [],
    filteredProducts: [],
    page: 1,
    perPage: 5
};

// 1. Fetch Data
async function init() {
    // Gọi API, gán data vào state, render bảng
}

// 2. Render Table
function renderTable() {
    // Logic cắt mảng (slice) dựa trên page và perPage
    // Loop tạo HTML
}

// 3. Filter & Sort
function handleSearch(keyword) { ... }
function handleSort(column) { ... }

// 4. Modal Logic
function openDetailModal(id) { ... }
function openCreateModal() { ... }

// 5. Submit Form (Create/Edit)
async function handleSubmit() { ... }

// Run
document.addEventListener('DOMContentLoaded', init);

```

### Lưu ý quan trọng khi nộp bài:

1. **Word Report:** Đừng quên bước này. Sau khi code xong một chức năng (ví dụ Search), hãy chụp màn hình kết quả ngay (lúc đang có dữ liệu lọc) và paste vào Word với chú thích ngắn gọn.
2. **GitHub:** Đảm bảo code sạch, comment rõ ràng các đoạn xử lý chính.
3. **CSS/Bootstrap:** Hãy chắc chắn ảnh không bị vỡ khung (dùng `object-fit: cover` nếu cần).

Bạn có muốn mình viết mẫu code cho phần nào cụ thể (ví dụ phần Export CSV hay phần Logic Phân trang) không?