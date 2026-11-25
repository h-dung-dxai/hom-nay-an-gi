# Thiết kế: "Hôm nay ăn gì?"

Ngày: 2026-11-25 · Trạng thái: đã duyệt, phạm vi bản 1 được điều chỉnh

> **Điều chỉnh phạm vi (2026-11-25):** Google Places cần tài khoản có thẻ thanh toán, nên phần **danh sách quán trong app được hoãn** sang bản sau. Bản 1 dùng **cách 3**: mỗi món (món chính và món dự phòng) có nút **"Tìm quán gần đây"** mở Google Maps với từ khoá `<món> gần đây`. Google Maps tự dùng vị trí của thiết bị nên app không cần xin quyền vị trí, không cần ô nhập địa chỉ, không cần `/api/places` và không cần `GOOGLE_MAPS_API_KEY`. Các mục về Places bên dưới được giữ nguyên làm thiết kế cho bản sau.

## Mục đích và lý do

Người dùng gặp khó khi quyết định ăn gì vì **có quá nhiều món để chọn**. Họ muốn một web app chốt giúp **một món, đúng với bữa đang tới**, kèm **quán thật ở gần** bán món đó.

- **Giai đoạn 1:** chạy trên máy (local), chỉ chủ dự án dùng.
- **Giai đoạn 2 (sau này):** mở cho nhiều người dùng. Kiến trúc giai đoạn 1 phải đưa lên mạng được mà không viết lại.

## Mục tiêu (bản 1)

1. Mở app là biết ngay đang ở bữa nào, dựa trên giờ trên thiết bị của người dùng.
2. Bấm một nút để AI gợi ý **1 món chính** kèm lý do ngắn, cùng **2 món dự phòng**.
3. Nút **"Đổi món"** để lấy gợi ý mới, không lặp lại các món vừa hiện trong phiên.
4. Hiện **3–5 quán thật gần đây** bán món đã chọn, mỗi quán có tên, điểm đánh giá, số lượt đánh giá, khoảng cách, trạng thái đang mở hay đóng, và link mở Google Maps.
5. Giao diện tiếng Việt, đơn giản, thân thiện, dùng tốt trên điện thoại.

## Không làm (bản 1)

Đăng nhập hoặc tài khoản, lưu lịch sử món đã ăn, hồ sơ khẩu vị, đặt món hoặc giao hàng, công thức nấu ăn. Đây là những việc có thể làm ở giai đoạn 2.

## Tuyệt đối tránh

- **AI tự bịa tên quán.** Tên quán chỉ được lấy từ Google Places.
- Đưa ra danh sách dài khiến người dùng lại phải tự chọn.
- Để lộ API key ra trình duyệt.

## Ràng buộc

- **AI:** dùng **OpenAI** với API key của chủ dự án.
- **Dữ liệu quán:** dùng **Google Places API (New)** (cách 1 đã được chọn).
- Toàn bộ việc gọi OpenAI và Google chỉ chạy **ở phía máy chủ**. Key để trong `.env.local` và không commit.
- Giờ dùng để xác định bữa phải lấy **từ trình duyệt**, không lấy từ máy chủ. Lý do: khi deploy, máy chủ có thể chạy ở múi giờ UTC.

## Các cách đã cân nhắc

| Cách | Đánh đổi | Kết quả |
|---|---|---|
| **Next.js (TypeScript), một dự án** | Giao diện và API chung một chỗ, key ở server, deploy Vercel dễ | **Đã chọn** |
| React (Vite) + Express riêng | Phải quản lý 2 dự án mà không được thêm lợi ích gì | Loại |
| FastAPI + HTML thuần | Giao diện khó làm đẹp và khó mở rộng | Loại |

Về dữ liệu quán, người dùng đã chọn Google Places thay vì OpenStreetMap (dữ liệu ở VN còn thưa) hoặc chỉ mở link Google Maps (không có danh sách quán trong app).

## Thiết kế

**Công nghệ:** Next.js (App Router) + TypeScript + Tailwind CSS, SDK `openai` chính thức. Gọi Places qua `fetch` từ server. *(Đây là lựa chọn của Claude.)*

### Xác định bữa ăn theo giờ (chạy ở trình duyệt)

| Giờ | Bữa |
|---|---|
| 05:00–09:59 | Sáng |
| 10:00–13:59 | Trưa |
| 14:00–16:59 | Xế (ăn vặt) |
| 17:00–21:59 | Tối |
| 22:00–04:59 | Khuya |

Bữa được chọn tự động theo bảng trên. Người dùng có thể bấm các nút bữa (chip) để đổi bữa thủ công.

### Màn hình (một trang)

```
┌─────────────────────────────┐
│  Hôm nay ăn gì? 🍜           │
│  [Sáng][•Trưa][Xế][Tối][Khuya] │
│                             │
│  ┌───────────────────────┐  │
│  │  BÚN CHẢ              │  │
│  │  Trưa nóng, ăn nhẹ mà │  │
│  │  vẫn no.              │  │
│  └───────────────────────┘  │
│  Hoặc: Cơm tấm · Phở gà      │
│        [ Đổi món ]          │
│                             │
│  Quán gần bạn               │
│  • Bún chả Hương Liên ★4.4  │
│    (1.2k) · 650m · Đang mở  │
│  • ...                      │
└─────────────────────────────┘
```

Bấm vào một món dự phòng thì món đó thành món chính và danh sách quán được tìm lại.

### Luồng xử lý

1. Trang tải xong → xác định bữa → xin quyền vị trí (song song).
2. `POST /api/suggest` với body `{ meal, localTime, exclude: string[] }`. Server gọi OpenAI dùng **structured output (JSON schema)** và trả về:
   ```json
   { "main": { "name": "Bún chả", "reason": "...", "searchKeyword": "bún chả" },
     "alternatives": [ { "name": "...", "searchKeyword": "..." }, { ... } ] }
   ```
   Prompt yêu cầu món phổ biến ở Việt Nam, phù hợp với bữa và giờ, và không trùng các món trong `exclude`.
3. `POST /api/places` với body `{ keyword, lat, lng }` hoặc `{ keyword, address }`. Server gọi Places **Text Search (New)** với `locationBias` là vòng tròn bán kính khoảng 2 km và chỉ lấy các trường cần dùng (field mask): `displayName, rating, userRatingCount, formattedAddress, currentOpeningHours.openNow, googleMapsUri, location`. Server tính khoảng cách, **bỏ các quán cách xa hơn 3 km** và **các quán dưới 3.5★ nếu có từ 20 lượt đánh giá trở lên**, ưu tiên quán đang mở rồi sắp theo khoảng cách, và trả về tối đa 5 quán. Nếu sau khi lọc không còn quán nào thì chuyển sang link Google Maps. Hai ngưỡng này là hằng số dễ chỉnh. *(Claude quyết định.)*

   ⚠️ Các trường `rating`, `userRatingCount` và `currentOpeningHours` có thể bị tính phí theo bậc giá Places cao hơn. Builder cần kiểm tra bảng giá hiện hành trước khi mở cho nhiều người dùng.
4. "Đổi món": gửi kèm tất cả các món đã hiện trong phiên vào `exclude`.

### Trường hợp lỗi và thiếu dữ liệu

- **Người dùng từ chối quyền vị trí:** hiện ô nhập địa chỉ. Server đổi địa chỉ thành toạ độ bằng một lần gọi Places Text Search với câu truy vấn là chính địa chỉ đó (field mask `places.location`, không cần bật thêm Geocoding API). Sau đó xử lý y như khi có vị trí: vẫn có khoảng cách, cách xếp hạng và vòng tìm 2 km. *(Claude quyết định.)*
- **Chưa có `GOOGLE_MAPS_API_KEY`, Places lỗi, hoặc không tìm thấy quán:** hiện nút "Tìm trên Google Maps" mở `https://www.google.com/maps/search/?api=1&query=<món>`.
- **OpenAI lỗi hoặc trả JSON sai schema:** hiện thông báo thân thiện kèm nút "Thử lại". Không hiển thị kết quả không qua được kiểm tra schema.

### Cấu hình (`.env.local`)

```
OPENAI_API_KEY=...
OPENAI_MODEL=...         # mặc định: model nhỏ, rẻ, có structured output, builder chọn theo danh sách model hiện hành của OpenAI
GOOGLE_MAPS_API_KEY=...  # không bắt buộc, thiếu thì dùng cách dự phòng là link Google Maps
```

Có thêm file `.env.example` mô tả các biến trên và một README ngắn hướng dẫn chạy.

### Kiểm thử

- Unit test hàm `mealFromHour` (chú ý các mốc biên và khung giờ khuya qua nửa đêm).
- Unit test việc validate và parse JSON trả về từ OpenAI, cùng hàm xếp hạng quán (đang mở trước, gần trước).
- Chạy thử bằng tay: luồng có vị trí, luồng từ chối vị trí, luồng không có Google key.

## Để builder tự quyết

Màu sắc và chi tiết giao diện, câu chữ cụ thể trong prompt, cấu trúc thư mục, thư viện test (đề xuất Vitest), model OpenAI mặc định cụ thể.
