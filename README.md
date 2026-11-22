# FitnFood

FitnFood là hệ thống thương mại điện tử thực phẩm/đồ ăn trực tuyến có hai bề mặt sử dụng:

- **Khách hàng và khách truy cập:** duyệt danh mục, tìm kiếm sản phẩm, xem đánh giá, quản lý giỏ hàng, đặt hàng, thanh toán PayOS, theo dõi đơn hàng và trò chuyện hỗ trợ.
- **Quản trị viên:** quản lý người dùng, danh mục, sản phẩm, tồn kho, phiếu nhập/xuất, mã giảm giá, đơn hàng, doanh thu, thông báo, cấu hình hệ thống và hỗ trợ khách qua chat.

Backend của dự án được xây dựng bằng **Node.js, Express 5 và MongoDB/Mongoose**, cung cấp REST API, Socket.IO realtime và các tích hợp Gemini AI, vector embedding, PayOS, SMTP và Ngrok.

## Kiến trúc tổng quan

```text
React (client/admin) ──REST API──> Express/Mongoose ──> MongoDB
         │                              │
         └──────── Socket.IO ──────────┴──> Chat, thông báo, tồn kho, thanh toán

Express ──> Google Gemini ──> Phản hồi AI/chat
Express ──> Xenova embeddings ──> Tìm kiếm/vector recommendation
Express ──> PayOS ──> Tạo link QR, webhook thanh toán
Express ──> SMTP ──> Xác thực và email đơn hàng
```

Trong thư mục dự án:

```text
backend/   REST API, Socket.IO, nghiệp vụ, MongoDB models và dịch vụ tích hợp
frontend/  React SPA cho khách hàng và trang quản trị
docker-compose.yml
           MongoDB, backend web, frontend Nginx và backend IoT tùy chọn
```

Backend IoT được tham chiếu trong Docker Compose từ thư mục ngoài dự án (`../iotEx/fitnfood-iot-service`) và phải được cung cấp riêng. Nó không nằm trong mã nguồn FitnFood hiện tại.

## Chức năng chính

### Xác thực và người dùng

- Đăng ký, xác thực tài khoản, đăng nhập và đăng xuất.
- Access token có thời hạn 1 ngày và refresh token có thời hạn 7 ngày.
- Phân quyền người dùng thường và quản trị viên bằng middleware JWT.
- Quên mật khẩu, đặt lại mật khẩu và đổi mật khẩu.
- Cập nhật thông tin, quản lý tài khoản và danh sách người dùng.

### Sản phẩm, tìm kiếm và đánh giá

- CRUD danh mục và sản phẩm.
- Tìm kiếm sản phẩm, lọc theo danh mục và phân trang.
- Đánh giá điểm, bình luận, trả lời đánh giá và kiểm tra quyền đánh giá.
- Theo dõi lượt bán, tồn kho và điểm đánh giá trung bình.
- Gợi ý sản phẩm theo sản phẩm đang xem, giỏ hàng, lịch sử mua hoặc khách truy cập.
- Gợi ý dựa trên vector embedding và fallback theo sản phẩm bán chạy/đánh giá cao.

### Giỏ hàng và đơn hàng

- Giỏ hàng theo người dùng.
- Tạo đơn hàng COD hoặc đơn thanh toán PayOS.
- Tạo đơn thủ công cho quản trị viên.
- Cập nhật, hủy và xem chi tiết đơn hàng.
- Trừ tồn kho, quản lý trạng thái đơn và điều chỉnh kho khi đơn thay đổi.

### Giảm giá

- Tạo, cập nhật, vô hiệu hóa và tra cứu mã giảm giá.
- Sử dụng mã trong quá trình đặt hàng.
- Kiểm tra thời gian hiệu lực và số lần sử dụng còn lại.

### Kho hàng

- Phiếu nhập và phiếu xuất kho.
- Xác nhận hoặc hủy phiếu và ghi chú xử lý.
- Thẻ kho để truy vết biến động tồn.
- Ngưỡng tồn kho cảnh báo và kiểm tra chênh lệch tồn kho.
- Cập nhật tồn kho realtime tới khách đang xem sản phẩm.

### Thanh toán

- Tạo đường dẫn thanh toán/QR bằng PayOS.
- Xác thực webhook bằng chữ ký HMAC của PayOS.
- Lưu sự kiện thanh toán theo mô hình Transactional Outbox.
- Worker xử lý lại event thất bại, gửi email và phát thông báo realtime.
- Trạng thái thanh toán được theo dõi theo room của từng đơn hàng qua Socket.IO.

### Chat và trợ lý AI

- Hỗ trợ cả người đăng nhập và khách.
- Hỗ trợ bot với Gemini và dữ liệu sản phẩm được tìm bằng vector MongoDB.
- Lưu lịch sử hội thoại và tin nhắn.
- Bot có thể gợi ý sản phẩm, thao tác giỏ hàng và hỗ trợ tạo đơn theo luồng hội thoại.
- Chuyển phiên từ bot sang quản trị viên và cho phép admin phản hồi realtime.
- Phát trạng thái typing, handoff, tin nhắn và đóng/mở phiên.

### Thông báo và doanh thu

- Thông báo riêng cho người dùng và quản trị viên.
- Broadcast Flash Sale tới guest và người dùng.
- Đánh dấu đã đọc từng thông báo hoặc tất cả thông báo.
- Báo cáo thống kê doanh thu theo khoảng thời gian.

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Runtime | Node.js 20 |
| Web framework | Express 5 |
| Cơ sở dữ liệu | MongoDB 7, Mongoose 9 |
| Realtime | Socket.IO |
| Xác thực | JWT, bcrypt |
| Thanh toán | PayOS SDK |
| Chat AI | Google Gemini API |
| Embedding | Xenova Transformers, `all-MiniLM-L6-v2` |
| Tương thích frontend | React 19, Redux Toolkit, TanStack Query, Axios |
| Email | Nodemailer qua SMTP |
| Web server frontend | Nginx |
| Triển khai | Docker và Docker Compose |

## Cấu trúc backend

```text
backend/src/
├── index.js                 # Khởi tạo Express, MongoDB, CORS, Socket.IO và worker
├── routes/                  # Khai báo các prefix REST API
├── controllers/             # Tiếp nhận HTTP request và trả response
├── services/                # Nghiệp vụ, AI, thanh toán, email, kho, chat
├── models/                  # Mongoose schema và dữ liệu
├── middleware/authMiddleware.js
└── socket/
    ├── chatSocket.js
    └── notificationSocket.js
```

Các module nghiệp vụ chính: user, product, category, cart, order, discount, inventory, chat, payment, revenue, notification và system setting.

## REST API

Tất cả API backend bắt đầu bằng tiền tố `/api`.

| Nhóm | Tiền tố | Vai trò |
|---|---|---|
| Người dùng | `/api/user` | Tài khoản, JWT, mật khẩu và hồ sơ |
| Sản phẩm | `/api/product` | Sản phẩm, review, recommendation và embedding |
| Danh mục | `/api/category` | Danh mục sản phẩm |
| Giỏ hàng | `/api/cart` | Giỏ hàng theo người dùng |
| Đơn hàng | `/api/order` | Đặt hàng và quản lý đơn |
| Giảm giá | `/api/discount` | Mã giảm giá |
| Kho | `/api/inventory` | Phiếu kho, thẻ kho và cảnh báo |
| Chat | `/api/chat` | Hội thoại và lịch sử tin nhắn |
| Thanh toán | `/api/payment` | Tạo link PayOS, webhook và trạng thái |
| Doanh thu | `/api/revenue` | Thống kê doanh thu |
| Thông báo | `/api/notification` | Chuông thông báo và đánh dấu đã đọc |
| Cấu hình | `/api/system-setting` | Cấu hình chung của hệ thống |

Các endpoint ghi dữ liệu hoặc truy cập quản trị thường yêu cầu header:

```http
token: Bearer <access_token>
```

Tài nguyên công khai bao gồm danh mục, sản phẩm, tìm kiếm, chi tiết đánh giá và một số luồng chat guest.

## Socket.IO

### Namespace mặc định

Dùng cho chat và theo dõi thanh toán theo đơn hàng.

- `chat:join`, `chat:send`, `chat:action`, `chat:typing`
- `chat:handoff`, `admin:accept`, `admin:send`, `chat:close`
- `payment:join`, `payment:leave`
- `payment:success`, `payment:cancelled`

### Namespace `/notification`

Dùng cho chuông thông báo và cập nhật tồn kho realtime.

- Room quản trị: `admin_room`
- Room người dùng: `user_<userId>`
- Room guest/broadcast: `guest_room`
- Room chi tiết sản phẩm: `product_<productId>`

Socket xác thực bằng access token trong `auth.token`. Guest có thể kết nối để nhận Flash Sale hoặc chat guest.

## Cấu hình môi trường

Backend đọc cấu hình từ `backend/.env`. Không commit file này hoặc khóa/API secret lên Git.

```dotenv
PORT=3001
MONGO_DB=mongodb://localhost:27017/FitnFood

ACCESS_TOKEN=
REFRESH_TOKEN=

CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
NGROK_URL=
NGROK_AUTHTOKEN=

PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=

EMAIL_USER=
EMAIL_PASSWORD=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

AI_EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
AI_EMBEDDING_DIM=384
AI_EMBEDDING_MAX_CHARS=2000
MONGO_VECTOR_INDEX=product_embedding_index
CHAT_VECTOR_LIMIT=6
CHAT_HISTORY_LIMIT=5
AI_CONTEXT_LIMIT=20
RECOMMENDATION_LIMIT=10
SEARCH_LIMIT=24
```

Biến viết theo tên SDK cũ `CLIENT_ID`, `API_KEY` và `CHECKSUM_KEY` vẫn có thể được đọc như tên dự phòng cho PayOS.

Frontend đọc biến:

```dotenv
REACT_APP_API_URL_BACKEND=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

`REACT_APP_API_URL_BACKEND` được nhúng vào lúc build frontend; khi chạy Docker Compose giá trị mặc định được truyền qua build argument.

## Chạy trong môi trường phát triển

Yêu cầu: Node.js 20+, MongoDB và npm.

### Backend

```powershell
cd backend
npm install
npm run dev
```

Backend mặc định lắng nghe `http://localhost:3001`.

### Frontend

```powershell
cd frontend
npm install
npm start
```

Frontend mặc định chạy tại `http://localhost:3000`.

### Ngrok cho PayOS webhook

```powershell
cd backend
npm run dev:ngrok
```

Cần cấu hình `NGROK_AUTHTOKEN`. URL ngrok phải được thêm vào `NGROK_URL`, đồng thời cấu hình URL webhook tương ứng trong PayOS.

## Chạy bằng Docker Compose

```powershell
docker compose up --build
```

Sau khi khởi động:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Backend IoT: `http://localhost:3002` nếu thư mục IoT được cung cấp
- MongoDB: `mongodb://localhost:27017`

Lưu ý: Compose hiện truyền `MONGO_DB` của backend bằng một MongoDB URI riêng qua `environment`, nên biến này có thể ghi đè URI trong `backend/.env`. Để chạy hoàn toàn với MongoDB local, cập nhật `MONGO_DB` trong Compose thành `mongodb://mongo:27017/FitnFood`.

Kiểm tra trạng thái container:

```powershell
docker compose ps
docker compose logs -f backend
```

## Hướng dẫn MongoDB Atlas cho AI

Các API chat và recommendation được tối ưu cho MongoDB Atlas Vector Search.

1. Tạo collection `products`.
2. Đảm bảo embedding được sinh với đúng kích thước (`384` nếu dùng model mặc định).
3. Tạo Atlas Search Vector index tên `product_embedding_index` cho trường `embedding`.
4. Gọi `POST /api/product/rebuild-product-embeddings` bằng tài khoản admin để sinh lại embedding.
5. Nâng/mở rộng cấu hình `MONGO_DB`, `MONGO_VECTOR_INDEX` và `AI_EMBEDDING_DIM` nếu đổi model embedding.

Trong trường hợp vector search không khả dụng, backend vẫn trả dữ liệu fallback cho chat/recommendation.

## Scripts tiện ích

```powershell
cd backend
node scripts/resize-database-images.js
node scripts/seed-comments.js
node scripts/start-ngrok.js
```

Chỉ chạy các script seed/resize khi có mục đích thay đổi dữ liệu; nên sao lưu MongoDB trước.

## Bảo mật vận hành

- Dùng domain frontend chính xác trong `CLIENT_URL` và `FRONTEND_URL` để CORS hoạt động.
- Webhook PayOS phải chạy qua HTTPS công khai hoặc tunnel Ngrok.
.

## Phát triển

- Thêm route: tạo `*Router.js`, đăng ký prefix trong `backend/src/routes/index.js`.
- Thêm nghiệp vụ: controller xử lý request/response, service xử lý nghiệp vụ, model lưu trữ dữ liệu.
- Thêm realtime: khai báo room và event trong namespace tương ứng.
- Chạy test frontend:

```powershell
cd frontend
npm test
```

Backend hiện chưa có test runner trong `package.json`; trước khi thay đổi nghiệp vụ thanh toán, kho hoặc chat nên bổ sung test integration tập trung.
