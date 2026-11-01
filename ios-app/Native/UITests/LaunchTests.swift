import XCTest

final class LaunchTests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    private func capture(_ app: XCUIApplication, name: String) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    override func tearDownWithError() throws {
        if let run = testRun, run.failureCount > 0 {
            capture(XCUIApplication(), name: "Failure-\(name)")
        }
    }

    func testBothBundledSectionsLoadAndKeepTheirViews() {
        let app = XCUIApplication()
        app.launch()
        let life = app.webViews["webview-life"]
        XCTAssertTrue(life.waitForExistence(timeout: 60))
        // The app creates navigation only after its IndexedDB initialization succeeds.
        XCTAssertTrue(life.links["GPA"].waitForExistence(timeout: 60))
        XCTAssertTrue(life.links["GPA"].isHittable)
        capture(app, name: "01-KhaiLife")
        app.tabBars.buttons["tab-thuchi"].tap()
        let finance = app.webViews["webview-thuchi"]
        XCTAssertTrue(finance.waitForExistence(timeout: 60))
        // These controls are inserted by overviewHTML(), proving JS initialized.
        // WKWebView's own accessibilityValue is not a reliable readiness signal.
        XCTAssertTrue(finance.staticTexts["Số tiền tôi đang có"].waitForExistence(timeout: 60))
        XCTAssertTrue(finance.buttons["Cập nhật số tiền"].waitForExistence(timeout: 10))
        XCTAssertTrue(finance.buttons["Cập nhật số tiền"].isHittable)
        capture(app, name: "02-Thu-chi")
        app.tabBars.buttons["tab-life"].tap()
        XCTAssertTrue(life.links["GPA"].waitForExistence(timeout: 60))
        XCTAssertTrue(life.links["GPA"].isHittable)
    }

    func testGradePersistsAfterTermination() {
        let app = XCUIApplication()
        app.launch()
        var life = app.webViews["webview-life"]
        XCTAssertTrue(life.links["GPA"].waitForExistence(timeout: 60))
        life.links["GPA"].tap()
        var grade = life.textFields["Điểm bộ phận"].firstMatch
        XCTAssertTrue(grade.waitForExistence(timeout: 10))
        for _ in 0..<5 where !grade.isHittable { life.swipeUp() }
        grade.tap()
        if let value = grade.value as? String, !value.isEmpty {
            grade.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: value.count))
        }
        grade.typeText("8.2")
        life.staticTexts["Môn 1"].tap()
        app.tabBars.buttons["tab-thuchi"].tap()
        app.tabBars.buttons["tab-life"].tap()
        XCTAssertTrue(life.staticTexts["Đã lưu trên thiết bị"].waitForExistence(timeout: 10))
        app.terminate()
        app.launch()
        life = app.webViews["webview-life"]
        // A cold WebKit process on hosted macOS may take over 15 seconds.
        // Keep the persisted-value assertion below; allow startup to finish.
        XCTAssertTrue(life.links["GPA"].waitForExistence(timeout: 60))
        life.links["GPA"].tap()
        grade = life.textFields["Điểm bộ phận"].firstMatch
        XCTAssertTrue(grade.waitForExistence(timeout: 10))
        XCTAssertEqual(grade.value as? String, "8.2")
        capture(app, name: "03-GPA-persisted")
    }
}
