import UIKit

final class MainTabController: UITabBarController {
    override func viewDidLoad() {
        super.viewDidLoad()
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = .systemBackground
        tabBar.standardAppearance = appearance
        tabBar.scrollEdgeAppearance = appearance
        tabBar.tintColor = UIColor(red: 0.18, green: 0.34, blue: 0.27, alpha: 1)

        let life = LocalWebController(section: "life")
        life.tabBarItem = UITabBarItem(title: "KhaiLife", image: UIImage(systemName: "square.grid.2x2"),
                                     selectedImage: UIImage(systemName: "square.grid.2x2.fill"))
        life.tabBarItem.accessibilityIdentifier = "tab-life"
        let finance = LocalWebController(section: "thuchi")
        finance.tabBarItem = UITabBarItem(title: "Thu chi", image: UIImage(systemName: "creditcard"),
                                        selectedImage: UIImage(systemName: "creditcard.fill"))
        finance.tabBarItem.accessibilityIdentifier = "tab-thuchi"
        // Retain each controller and its web view when changing sections.
        viewControllers = [life, finance]
    }

    func showFinance() { selectedIndex = 1 }
}
