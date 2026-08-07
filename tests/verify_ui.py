import sys
import os
import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    print("Navigating to EQUHUB dashboard...")
    page.goto("http://localhost:3002")
    page.wait_for_timeout(1000)

    # 1. Verify title
    title = page.title()
    print(f"Page title is: {title}")

    # 2. Go to Jobs section
    print("Clicking on 'Работа' tab...")
    page.locator("text=Работа").first.click()
    page.wait_for_timeout(1000)

    # 3. Apply to first job listing
    print("Clicking on 'Откликнуться' button...")
    page.locator("text=Откликнуться").first.click()
    page.wait_for_timeout(1000)

    # 4. Go to Profile & Wallet
    print("Clicking on 'Профиль' tab...")
    page.locator("text=Профиль").first.click()
    page.wait_for_timeout(1000)

    # 5. Top up wallet
    print("Clicking on 'Пополнить баланс через СБП' button...")
    page.locator("text=Пополнить баланс через СБП").first.click()
    page.wait_for_timeout(1000)

    # Take screenshot using absolute path
    screenshot_dir = "/home/jules/verification"
    os.makedirs(screenshot_dir, exist_ok=True)
    screenshot_path = os.path.join(screenshot_dir, "verification.png")
    page.screenshot(path=screenshot_path)
    print(f"Screenshot taken and saved to {screenshot_path}")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Configure video directory with absolute path
        video_dir = "/home/jules/verification/videos"
        os.makedirs(video_dir, exist_ok=True)

        context = browser.new_context(
            record_video_dir=video_dir
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
            print("Verification script executed completely.")
