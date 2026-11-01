import UIKit
import WebKit

// The script handler is retained by WebKit; a weak forwarding object avoids a cycle.
private final class WeakMessageHandler: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?
    init(_ target: WKScriptMessageHandler) { self.target = target }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(userContentController, didReceive: message)
    }
}

final class LocalWebController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private let section: String
    private var webView: WKWebView!
    private var webRoot: URL!
    private let loading = UIActivityIndicatorView(style: .medium)

    init(section: String) {
        self.section = section
        super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError("Use init(section:)") }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        view.endEditing(true)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.userContentController.add(WeakMessageHandler(self), name: "nativeShare")
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.accessibilityIdentifier = "webview-\(section)"
        webView.accessibilityValue = "loading"
        webView.isOpaque = false
        webView.backgroundColor = .systemBackground
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.keyboardDismissMode = .interactive
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
        loading.translatesAutoresizingMaskIntoConstraints = false
        loading.hidesWhenStopped = true
        view.addSubview(loading)
        NSLayoutConstraint.activate([
            loading.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            loading.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
        webRoot = Bundle.main.resourceURL!.appendingPathComponent("Web", isDirectory: true)
        loadHome()
    }

    private func loadHome() {
        let index = webRoot.appendingPathComponent(section).appendingPathComponent("index.html")
        guard FileManager.default.fileExists(atPath: index.path) else {
            showError("Thiếu dữ liệu ứng dụng. Vui lòng cài lại bản đầy đủ.")
            return
        }
        loading.startAnimating()
        webView.loadFileURL(index, allowingReadAccessTo: webRoot)
    }

    private func isBundled(_ url: URL) -> Bool {
        url.isFileURL && url.standardizedFileURL.path.hasPrefix(webRoot.standardizedFileURL.path + "/")
    }

    private func openExternal(_ url: URL) {
        if url.host?.lowercased() == "khaivjp.github.io", url.path == "/thuchi" || url.path.hasPrefix("/thuchi/") {
            (tabBarController as? MainTabController)?.showFinance()
            return
        }
        guard ["https", "http", "mailto", "tel"].contains(url.scheme?.lowercased() ?? "") else { return }
        UIApplication.shared.open(url)
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if isBundled(url) {
            decisionHandler(.allow)
        } else {
            decisionHandler(.cancel)
            openExternal(url)
        }
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url { openExternal(url) }
        return nil
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loading.stopAnimating()
        webView.accessibilityValue = "ready"
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        loading.stopAnimating()
        showError("Không thể mở nội dung. Hãy đóng và mở lại ứng dụng.")
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if (error as NSError).code != NSURLErrorCancelled {
            self.webView(webView, didFail: navigation, withError: error)
        }
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { webView.reload() }

    private func showError(_ message: String) {
        guard presentedViewController == nil else { return }
        let alert = UIAlertController(title: "KhaiLife", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Đóng", style: .default))
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        guard view.window != nil, presentedViewController == nil else { completionHandler(); return }
        let alert = UIAlertController(title: "KhaiLife", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Đóng", style: .default) { _ in completionHandler() })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        guard view.window != nil, presentedViewController == nil else { completionHandler(false); return }
        let alert = UIAlertController(title: "Xác nhận", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Hủy", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: "Đồng ý", style: .default) { _ in completionHandler(true) })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String,
                 defaultText: String?, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        guard view.window != nil, presentedViewController == nil else { completionHandler(nil); return }
        let alert = UIAlertController(title: "KhaiLife", message: prompt, preferredStyle: .alert)
        alert.addTextField { $0.text = defaultText }
        alert.addAction(UIAlertAction(title: "Hủy", style: .cancel) { _ in completionHandler(nil) })
        alert.addAction(UIAlertAction(title: "Lưu", style: .default) { _ in completionHandler(alert.textFields?.first?.text) })
        present(alert, animated: true)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "nativeShare", message.frameInfo.isMainFrame,
              let origin = message.frameInfo.request.url, isBundled(origin),
              let payload = message.body as? [String: Any],
              let rawName = payload["name"] as? String,
              let encoded = payload["base64"] as? String,
              encoded.utf8.count <= 28_000_000,
              let data = Data(base64Encoded: encoded), data.count <= 20 * 1024 * 1024,
              presentedViewController == nil, view.window != nil else { return }

        let name = URL(fileURLWithPath: rawName).lastPathComponent
            .replacingOccurrences(of: ":", with: "-")
            .replacingOccurrences(of: "\\", with: "-")
        guard !name.isEmpty, name != ".", name != "..", name.utf8.count <= 200 else { return }
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        do {
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
            let file = folder.appendingPathComponent(name)
            try data.write(to: file, options: [.atomic, .completeFileProtection])
            let sheet = UIActivityViewController(activityItems: [file], applicationActivities: nil)
            sheet.popoverPresentationController?.sourceView = view
            sheet.popoverPresentationController?.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
            sheet.completionWithItemsHandler = { _, _, _, _ in try? FileManager.default.removeItem(at: folder) }
            present(sheet, animated: true)
        } catch {
            showError("Không thể xuất tệp. Hãy kiểm tra dung lượng iPhone rồi thử lại.")
        }
    }
}
