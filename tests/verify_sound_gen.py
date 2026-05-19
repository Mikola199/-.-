import os
from playwright.sync_api import sync_playwright, expect

def test_sound_gen_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get absolute path to the file
        file_path = os.path.abspath("public/sound_gen.html")
        page.goto(f"file://{file_path}")

        # Check title
        expect(page).to_have_title("Генератор Случайных Звуков")

        # Check for main heading
        expect(page.get_by_role("heading", name="Звуковой Генератор")).to_be_visible()

        # Check for buttons
        generate_btn = page.get_by_role("button", name="Генерировать")
        stop_btn = page.get_by_role("button", name="Стоп")
        resume_btn = page.get_by_role("button", name="Запустить Аудио")

        expect(generate_btn).to_be_visible()
        expect(stop_btn).to_be_visible()
        expect(resume_btn).to_be_visible()

        # Check button width (min 120px)
        gen_width = generate_btn.evaluate("el => el.offsetWidth")
        assert gen_width >= 120, f"Button width {gen_width} is less than 120px"

        # Check status indicator
        status_dot = page.locator("#status-dot")
        expect(status_dot).to_be_visible()
        expect(page.locator("#status-text")).to_have_text("ОСТАНОВЛЕН")

        # Check parameters panel
        expect(page.locator(".params-panel")).to_be_visible()
        expect(page.locator("#param-type")).to_have_text("-")

        # Click Resume to hide it (it should hide itself after click)
        resume_btn.click()
        expect(resume_btn).not_to_be_visible()

        # Click Generate and check if status changes
        generate_btn.click()
        expect(page.locator("#status-text")).to_have_text("ИГРАЕТ")
        expect(status_dot).to_have_class("status-indicator active")

        # Check if parameters are updated
        param_type = page.locator("#param-type").inner_text()
        assert param_type in ['sine', 'square', 'sawtooth', 'triangle', 'white-noise']

        # Click Stop
        stop_btn.click()
        expect(page.locator("#status-text")).to_have_text("ОСТАНОВЛЕН")
        expect(status_dot).to_have_class("status-indicator")

        # Take screenshot
        page.screenshot(path="/home/jules/verification/sound_gen_verified.png")

        browser.close()

if __name__ == "__main__":
    test_sound_gen_ui()
