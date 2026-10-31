# Kiểm tra lưu dữ liệu

Cài Playwright vào môi trường kiểm thử (`npm install --no-save playwright` và `npx playwright install chromium`), rồi chạy từ thư mục repository:

```sh
node tests/storage.cjs
```

Có thể đặt `PLAYWRIGHT_MODULE` là đường dẫn package và `CHROME_PATH` là đường dẫn trình duyệt Chromium có sẵn. Bài kiểm tra dùng hồ sơ trình duyệt tạm, không đọc dữ liệu thật và không gọi GitHub.

Kiểm tra chuyển dữ liệu khi localStorage đầy, sửa GPA rồi tải lại, giữ bản localStorage cũ, nhập/khôi phục qua IndexedDB, lỗi ghi và lưu liên tiếp. Dữ liệu chính và bản trước lần nhập được ghi trong cùng giao dịch; chỉ xác nhận khi giao dịch hoàn tất.

Dữ liệu cũ không bị tự xóa. Sau khi bản sửa được triển khai, người dùng có thể nhập lại file JSON đã xuất để lấy các thay đổi chưa lưu từ phiên cũ. IndexedDB vẫn phụ thuộc dung lượng và quyền lưu của trình duyệt; xuất JSON vẫn là cách giữ bản dự phòng.
