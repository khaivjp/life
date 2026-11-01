import XCTest

final class LaunchTests: XCTestCase {
    func testBothBundledSectionsLoadAndKeepTheirViews() {
        let app = XCUIApplication()
        app.launch()
        let life = app.webViews["webview-life"]
        XCTAssertTrue(life.waitForExistence(timeout: 15))
        let ready = NSPredicate(format: "value == %@", "ready")
        expectation(for: ready, evaluatedWith: life)
        waitForExpectations(timeout: 15)
        // The app creates navigation only after its IndexedDB initialization succeeds.
        XCTAssertTrue(life.links["GPA"].waitForExistence(timeout: 15))
        app.tabBars.buttons["tab-thuchi"].tap()
        let finance = app.webViews["webview-thuchi"]
        XCTAssertTrue(finance.waitForExistence(timeout: 15))
        expectation(for: ready, evaluatedWith: finance)
        waitForExpectations(timeout: 15)
        app.tabBars.buttons["tab-life"].tap()
        XCTAssertTrue(life.exists)
        XCTAssertEqual(life.value as? String, "ready")
    }

    func testGradePersistsAfterTermination() {
        let app = XCUIApplication()
        app.launch()
        var life = app.webViews["webview-life"]
        XCTAssertTrue(life.links["GPA"].waitForExistence(timeout: 15))
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
        XCTAssertTrue(life.links["GPA"].waitForExistence(timeout: 15))
        life.links["GPA"].tap()
        grade = life.textFields["Điểm bộ phận"].firstMatch
        XCTAssertTrue(grade.waitForExistence(timeout: 10))
        XCTAssertEqual(grade.value as? String, "8.2")
    }
}
