# KhaiLife cho iPhone

Một app, hai không gian: KhaiLife và Thu chi. Giao diện trắng ngà, chữ tối,
xanh trầm; giữ nguyên chức năng của hai website. Yêu cầu iOS 16 trở lên.

## Cài file IPA

`KhaiLife-unsigned.ipa` là bản ứng dụng iPhone đã biên dịch nhưng chưa ký.
Không thể chỉ chạm vào file trong Tệp để cài. Dùng Sideloadly trên máy tính
để ký bằng tài khoản Apple của chính bạn và cài vào iPhone.

1. Tải Sideloadly từ https://sideloadly.io/ và làm theo yêu cầu cài đặt Windows
   trên trang đó (bao gồm iTunes/iCloud nếu được yêu cầu).
2. Cắm iPhone vào máy tính, mở khóa và chọn Tin cậy khi được hỏi.
3. Mở Sideloadly, chọn iPhone, kéo `KhaiLife-unsigned.ipa` vào cửa sổ.
4. Đăng nhập tài khoản Apple trong Sideloadly rồi chọn Start.
5. Nếu iPhone yêu cầu, tin cậy tài khoản ở Cài đặt → Cài đặt chung →
   VPN & Quản lý thiết bị; bật Chế độ nhà phát triển trong Quyền riêng tư & Bảo mật.
6. Mở KhaiLife. Hai mục ở cuối màn hình chuyển giữa KhaiLife và Thu chi.

Tài khoản miễn phí thường cần ký lại sau 7 ngày; Sideloadly có chức năng tự
gia hạn khi máy tính và thiết bị đáp ứng điều kiện. Không gửi mật khẩu Apple
hoặc mã xác minh vào cuộc trò chuyện. Hướng dẫn chính thức: https://sideloadly.io/.

## Chuyển dữ liệu đang có

Dữ liệu Safari và ứng dụng được lưu riêng. Trong website cũ, xuất sao lưu JSON.
Trong app, mở KhaiLife → Cài đặt & dữ liệu → Nhập bản sao lưu JSON;
với Thu chi, dùng Khôi phục. Hoặc cấu hình GitHub rồi tải dữ liệu về.
Tệp dữ liệu cá nhân trong repository không được đóng gói sẵn vào ứng dụng.
Xuất sao lưu trong app sẽ mở bảng chia sẻ để chọn Lưu vào Tệp.

Các màn hình, trò chơi và dữ liệu đã lưu hoạt động không cần mạng.
Đồng bộ GitHub và các liên kết tài liệu bên ngoài vẫn cần Internet.
Xuất sao lưu trước khi xóa app; giữ nguyên bundle ID khi ký lại để giữ dữ liệu.

## Tạo lại bản dựng

Trên macOS có Xcode và XcodeGen, từ thư mục gốc repository:

```sh
node ios-app/scripts/prepare-web.mjs
bash ios-app/scripts/build-ios.sh
```

GitHub Actions `Build KhaiLife iOS` cũng tạo IPA trên máy macOS và kiểm tra
hai phần bằng iOS Simulator. Tải artifact `KhaiLife-unsigned-IPA` khi thành công.
Đây là bản sideload cá nhân, chưa phải bản phân phối TestFlight/App Store.

## Cấu trúc

- `Native/`: UIKit + WKWebView, thanh chuyển hai phần, chia sẻ tệp, hộp thoại.
- `theme/`: giao diện riêng của bản iPhone, không sửa website gốc.
- `Sources/thuchi/`: bản nguồn Thu chi đã ghim phiên bản.
- `scripts/prepare-web.mjs`: đóng gói nội dung offline, bỏ qua JSON cá nhân.
- `Web/`: nội dung tạo ra khi build; không commit.

Giới hạn kiểm chứng: trình duyệt desktop không thay thế kiểm thử iPhone thực.
Chứng chỉ, provisioning và cài đặt trên thiết bị phụ thuộc tài khoản Apple
của người dùng. File nhập, âm thanh, chia sẻ và GitHub sync nên được kiểm tra
lại trên iPhone sau khi cài.
