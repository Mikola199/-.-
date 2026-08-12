# EQUHUB — Единая цифровая платформа

## Документ 8: План тестирования (Unit, Integration, E2E)

### 1. Стратегия тестирования

Качество программного обеспечения EQUHUB гарантируется трехуровневой пирамидой тестирования:

1.  **Unit-тесты (Юнит-тесты):** Проверка чистых функций, валидаторов, хэширования, генераторов токенов и бизнес-логики в изоляции.
2.  **Integration-тесты (Интеграционные тесты):** Проверка взаимодействия микросервисов с базами данных (PostgreSQL), шиной сообщений (RabbitMQ) и кэшем (Redis).
3.  **E2E-тесты (Сквозные тесты):** Полная имитация пользовательского поведения в браузере с помощью библиотеки **Playwright** для проверки интерфейса и сквозных сценариев.

---

### 2. Спецификация Unit-тестирования (Python Pytest)

Для тестирования логики поиска, сопоставления интересов, JWT-авторизации и чат-помощника используется библиотека `pytest`.

Пример структуры тестов (`tests/test_auth.py`):
```python
import time
from lib.auth import sign_jwt, verify_jwt

def test_jwt_generation_and_verification() -> None:
    payload = {"userId": "u1", "email": "katya@equhub.ru"}
    token = sign_jwt(payload, expires_in_seconds=3600)

    verified = verify_jwt(token)
    assert verified is not None
    assert verified["userId"] == "u1"
    assert verified["email"] == "katya@equhub.ru"

def test_expired_jwt_rejection() -> None:
    payload = {"userId": "u1", "email": "katya@equhub.ru"}
    token = sign_jwt(payload, expires_in_seconds=-1)

    verified = verify_jwt(token)
    assert verified is None
```

---

### 3. Спецификация E2E-тестирования интерфейса (Playwright)

Сквозные тесты проверяют корректность рендеринга интерактивного симулятора EQUHUB, реакцию на клики навигации, работу фильтров маркетплейса, отправку откликов на вакансии и проведение безопасных сделок.

Перед запуском сквозных тестов необходимо запустить приложение в режиме разработки:
```bash
npm run dev
```
После запуска проект будет доступен по адресу `http://localhost:3000`.

Скрипты E2E-тестов находятся в директории `tests/` и запускаются через Playwright на порту 3000:

```python
from playwright.sync_api import sync_playwright, expect

def test_equhub_super_app_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Переходим на главную страницу симулятора
        page.goto("http://localhost:3000")

        # 1. Проверяем наличие основного заголовка бренда
        expect(page.locator("text=EQUHUB")).to_be_visible()

        # 2. Переключаемся на вкладку "Работа" в Bottom Navigation
        page.click("button:has-text('Работа')")
        expect(page.locator("text=EQUHUB Работа")).to_be_visible()

        # 3. Фильтруем вакансии по сектору IT
        page.select_option("select", "IT")
        expect(page.locator("text=Senior NestJS Backend Developer")).to_be_visible()

        # 4. Проверяем отклик на вакансию
        page.click("button:has-text('Откликнуться')")
        expect(page.locator("text=✓ Отправлено")).to_be_visible()

        # 5. Скриншот успешного прохождения сценария
        page.screenshot(path="tests/reports/equhub_e2e_verified.png")
        browser.close()
```

---

### 4. Запуск тестов локально

*   **Запуск Unit-тестов:** `pytest -v`
*   **Запуск TypeScript проверки типов:** `npx tsc --noEmit`
*   **Запуск сквозного тестирования (UI-Verification):**
    *   Прямой запуск: `python tests/verify_sound_gen.py`
    *   Через Pytest (для детальной отчетности): `pytest tests/verify_sound_gen.py`
