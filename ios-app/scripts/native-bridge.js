/* Small iOS adapter. Business logic remains in the original applications. */
(() => {
  'use strict';
  const handler = window.webkit?.messageHandlers?.nativeShare;
  if (!handler) return;
  const report = (message) => {
    if (window.KhaiLife?.toast) window.KhaiLife.toast(message);
    else if (typeof window.beerichToast === 'function') window.beerichToast(message);
    else window.alert(message);
  };
  function shareBlob(name, blob) {
    if (blob.size > 20 * 1024 * 1024) {
      report('File vượt quá 20 MB. Hãy giảm dữ liệu trước khi xuất.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => report('Không đọc được bản sao lưu. Hãy thử lại.');
    reader.onload = () => {
      try {
        handler.postMessage({ name, base64: String(reader.result).split(',')[1] });
      } catch {
        report('Không mở được bảng chia sẻ. Hãy thử lại.');
      }
    };
    reader.readAsDataURL(blob);
  }
  window.KhaiNative = Object.freeze({ shareBlob });
  if (window.KhaiLife) {
    window.KhaiLife.download = (name, content, type = 'application/json') =>
      shareBlob(name, new Blob([content], { type }));
  }
})();
