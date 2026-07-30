# Комплексный план тестирования EQUHUB (Unit, Integration, E2E)

Настоящий документ содержит спецификацию плана контроля качества, методологии проведения тестирования и верификации интерфейсов Единой цифровой платформы **EQUHUB** в соответствии с Разделом 15 (Пункт 8) Требований к программному обеспечению (SRS).

---

## 1. Стратегия тестирования (Pyramid of Testing)

Для минимизации дефектов в продакшене EQUHUB опирается на трехуровневую пирамиду автоматизированного тестирования:

```text
       ▲
      / \
     /E2E\    <-- 10% (Сквозные тесты: Playwright проверяет сценарии сделок и WebRTC)
    /-----\
   / Integr\  <-- 30% (Интеграционные тесты: проверка взаимодействия сервисов с СУБД)
  /---------\
 /   Unit    \ <-- 60% (Модульные тесты: валидаторы JWT, AI-утилиты, расчетные функции)
/_____________\
```

---

## 2. Модульное тестирование (Unit Testing)

Модульные тесты изолированно верифицируют чистые функции, бизнес-правила и утилитарные классы. В качестве тестового фреймворка используется **pytest**.

### 2.1 Пример тестирования утилит в `tests/test_dating_chatbot.py`

```python
from dating_chatbot import DatingChatbot

def test_greet_uses_name() -> None:
    bot = DatingChatbot(name="TestBot")
    assert "TestBot" in bot.greet_user()

def test_match_user_deduplicates_and_sorts() -> None:
    bot = DatingChatbot()
    matches = bot.match_user(["music", "Travel", "music", " "])
    assert matches == ["User1", "User2", "User4"]

def test_send_message_format() -> None:
    bot = DatingChatbot()
    assert bot.send_message("User1", "Hello") == "Sending message to User1: Hello"
```

### 2.2 Процесс запуска модульных тестов
Запуск осуществляется командой:
```bash
pytest
```
Для генерации отчетов по покрытию кода тестами (Coverage Report):
```bash
pytest --cov=app --cov-report=html
```

---

## 3. Интеграционное тестирование (Integration Testing)

Интеграционные тесты проверяют корректность совместной работы двух или более компонентов (например, микросервиса с СУБД PostgreSQL или кэшем Redis).
* **База данных:** Инициализация чистой тестовой схемы PostgreSQL, запуск транзакций через ORM, выполнение операции, проверка коммита и последующий откат (Rollback).
* **Межсервисный обмен:** Проверка отправки сообщений в RabbitMQ (`Notification Service` должен корректно считать и распарсить событие `payment.escrow.held`, отправленное из `Payment Service`).

---

## 4. Сквозное тестирование интерфейса (E2E Playwright Verification)

Для проверки работоспособности фронтенда, рендеринга интерактивных компонентов, функционирования аудио/видеогенераторов и корректной обработки кликов пользователей используется **Playwright for Python**.

Тесты автоматически запускают браузер Chromium, эмулируют поведение пользователя и фиксируют успешное состояние через визуальные скриншоты.

### 4.1 Пример E2E сценария (`tests/verify_sound_gen.py`)

```python
import os
from playwright.sync_api import sync_playwright, expect

def test_sound_gen_ui():
    with sync_playwright() as p:
        # 1. Запуск безголового браузера Chromium
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 2. Переход к локальному HTML-файлу в public/
        file_path = os.path.abspath("public/sound_gen.html")
        page.goto(f"file://{file_path}")

        # 3. Верификация заголовка и видимости основных кнопок
        expect(page).to_have_title("Генератор Случайных Звуков")
        generate_btn = page.get_by_role("button", name="Генерировать")
        expect(generate_btn).to_be_visible()

        # 4. Проверка размера кнопки (минимум 120px по ТЗ)
        gen_width = generate_btn.evaluate("el => el.offsetWidth")
        assert gen_width >= 120, f"Кнопка генерации слишком узкая: {gen_width}px"

        # 5. Инициализация и воспроизведение звука
        page.get_by_role("button", name="Запустить Аудио").click()
        generate_btn.click()

        # 6. Проверка изменения статуса приложения
        expect(page.locator("#status-text")).to_have_text("ИГРАЕТ")

        # 7. Сохранение верификационного скриншота
        page.screenshot(path="/home/jules/verification/sound_gen_verified.png")
        browser.close()
```

---

## 5. Нагрузочное тестирование (Performance & Load Testing)

Для проверки отказоустойчивости С++ ядра реального времени в `Chat Service` и пропускной способности `API Gateway` проводятся регулярные нагрузочные испытания:
* **Фреймворк:** **Locust** или **k6**.
* **Целевые метрики:**
  * Пропускная способность (Throughput): не менее **5000 запросов в секунду (RPS)** на API Gateway.
  * Время ответа (Latency): 95-й процентиль времени отклика для GET запросов не должен превышать **50мс**.
  * Сигнальный WebRTC трафик: задержка транзита WebRTC дескрипторов менее **15мс**.
