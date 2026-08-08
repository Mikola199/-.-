# EQUHUB — Единая цифровая платформа

## Документ 8: План тестирования (Unit, Integration, E2E)

### 1. Стратегия тестирования

Качество программного обеспечения EQUHUB гарантируется трехуровневой пирамидой тестирования:

1.  **Unit-тесты (Юнит-тесты):** Проверка чистых функций, валидаторов, хэширования, генераторов токенов и бизнес-логики в изоляции.
2.  **Integration-тесты (Интеграционные тесты):** Проверка взаимодействия микросервисов с базами данных (PostgreSQL), шиной сообщений (RabbitMQ) и кэшем (Redis).
3.  **E2E-тесты (Сквозные тесты):** Полная имитация пользовательского поведения в браузере с помощью библиотеки **Playwright** для проверки интерфейса и сквозных сценариев.

---

### 2. Спецификация Unit-тестирования (Python Pytest)

Для тестирования логики поиска, сопоставления интересов, авторизации и чат-помощника используется библиотека `pytest`.

Пример структуры тестов (`tests/test_dating_chatbot.py`):
```python
from dating_chatbot import DatingChatbot

def test_greet_uses_name() -> None:
    bot = DatingChatbot(name="LoveBot")
    assert "LoveBot" in bot.greet_user()

def test_match_user_deduplicates_and_sorts() -> None:
    bot = DatingChatbot()
    matches = bot.match_user(["music", "Travel", "music"])
    assert matches == ["User1", "User2", "User4"]
```

---

### 3. Спецификация E2E-тестирования интерфейса (Playwright)

Сквозные тесты проверяют корректность рендеринга интерактивного симулятора EQUHUB, реакцию на клики навигации, работу фильтров маркетплейса, отправку откликов на вакансии и проведение безопасных сделок.

Скрипты E2E-тестов находятся в директории `tests/` и запускаются через Playwright на изолированном порту:

```python
import os
from playwright.sync_api import sync_playwright, expect

def test_sound_gen_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Абсолютный путь к верификационному HTML файлу
        file_path = os.path.abspath("public/sound_gen.html")
        page.goto(f"file://{file_path}")

        # Проверка базового заголовка и интерфейса
        expect(page).to_have_title("Генератор Случайных Звуков")
        expect(page.get_by_role("heading", name="Звуковой Генератор")).to_be_visible()

        # Тест кнопки генерации
        generate_btn = page.get_by_role("button", name="Генерировать")
        generate_btn.click()

        # Проверка изменения статуса
        expect(page.locator("#status-text")).to_have_text("ИГРАЕТ")

        # Создание скриншота верификации
        page.screenshot(path="verification_report.png")
        browser.close()
```

---

### 4. Запуск тестов локально

*   **Запуск Unit-тестов:** `pytest -v`
*   **Запуск TypeScript проверки типов:** `npx tsc --noEmit`
*   **Запуск сквозного тестирования (UI-Verification):** `python tests/verify_sound_gen.py`
