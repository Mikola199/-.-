"""Tests for the EQUHUB documentation set added under docs/.

These docs (01_erd.md .. 10_admin_dev_guide.md and 03_openapi.yaml) are the
only substantive additions in this PR (the .pyc files removed by the PR are
compiled bytecode artifacts and are not testable source). The tests below
validate structural integrity of the documents (balanced markdown, required
sections/diagrams) as well as internal consistency between the documents and
the actual project artifacts they describe (package.json scripts, the
dating_chatbot test suite, and the sound generator HTML page), so that the
docs cannot silently drift out of sync with the code they document.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"

EXPECTED_DOC_FILES = [
    "01_erd.md",
    "02_uml.md",
    "03_openapi.yaml",
    "04_figma.md",
    "05_design_system.md",
    "06_cicd.md",
    "07_deployment.md",
    "08_testing.md",
    "09_security.md",
    "10_admin_dev_guide.md",
]

MARKDOWN_DOC_FILES = [name for name in EXPECTED_DOC_FILES if name.endswith(".md")]

FENCE_RE = re.compile(r"^```", re.MULTILINE)


def _read(name: str) -> str:
    path = DOCS_DIR / name
    assert path.is_file(), f"expected documentation file to exist: {path}"
    return path.read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# General structural sanity checks applied to every doc file
# ---------------------------------------------------------------------------


def test_docs_directory_contains_exactly_expected_files() -> None:
    actual = {p.name for p in DOCS_DIR.iterdir() if p.is_file()}
    assert actual == set(EXPECTED_DOC_FILES)


@pytest.mark.parametrize("filename", EXPECTED_DOC_FILES)
def test_doc_file_is_not_empty(filename: str) -> None:
    content = _read(filename)
    assert len(content.strip()) > 0


@pytest.mark.parametrize("filename", MARKDOWN_DOC_FILES)
def test_markdown_doc_starts_with_equhub_title(filename: str) -> None:
    content = _read(filename)
    assert content.lstrip().startswith("# EQUHUB")


@pytest.mark.parametrize("filename", MARKDOWN_DOC_FILES)
def test_markdown_code_fences_are_balanced(filename: str) -> None:
    content = _read(filename)
    fence_count = len(FENCE_RE.findall(content))
    assert fence_count % 2 == 0, f"{filename} has an unclosed code fence"


@pytest.mark.parametrize("filename", MARKDOWN_DOC_FILES)
def test_markdown_doc_has_no_unresolved_placeholders(filename: str) -> None:
    content = _read(filename)
    for marker in ("TODO", "TBD", "FIXME", "XXX", "{{", "}}"):
        assert marker not in content, f"{filename} contains unresolved placeholder {marker!r}"


# ---------------------------------------------------------------------------
# 01_erd.md
# ---------------------------------------------------------------------------


def test_erd_doc_contains_mermaid_er_diagram() -> None:
    content = _read("01_erd.md")
    assert "```mermaid" in content
    assert "erDiagram" in content


@pytest.mark.parametrize(
    "relation",
    [
        'users ||--o| profiles : "has"',
        'users ||--o{ wallets : "owns"',
        'orders ||--o| escrow_transactions : "secured_by"',
        'companies ||--o{ jobs : "posts"',
        'chats ||--o{ messages : "contains"',
    ],
)
def test_erd_doc_declares_expected_relations(relation: str) -> None:
    content = _read("01_erd.md")
    assert relation in content


@pytest.mark.parametrize(
    "heading",
    [
        "#### 3.1. Users",
        "#### 3.2. Profiles",
        "#### 3.9. MarketplaceAds",
        "#### 3.10. EscrowTransactions",
        "#### 3.11. Wallets",
    ],
)
def test_erd_doc_documents_expected_entities(heading: str) -> None:
    content = _read("01_erd.md")
    assert heading in content


def test_erd_doc_lists_four_recommended_indexes() -> None:
    content = _read("01_erd.md")
    assert content.count("CREATE INDEX") == 4


# ---------------------------------------------------------------------------
# 02_uml.md
# ---------------------------------------------------------------------------


def test_uml_doc_contains_component_diagram() -> None:
    content = _read("02_uml.md")
    assert "```mermaid" in content
    assert "graph TD" in content
    assert "Gateway[API Gateway: Nginx / Kong]" in content


def test_uml_doc_contains_escrow_sequence_diagram() -> None:
    content = _read("02_uml.md")
    assert "actor Buyer" in content
    assert "participant Pay as Payment Service" in content
    assert "POST /escrow/ship" in content
    assert "POST /escrow/confirm" in content


@pytest.mark.parametrize(
    "class_name",
    ["class Job {", "class Resume {", "class Company {", "class JobApplication {"],
)
def test_uml_doc_class_diagram_declares_expected_classes(class_name: str) -> None:
    content = _read("02_uml.md")
    assert "classDiagram" in content
    assert class_name in content


def test_uml_doc_class_diagram_relationships_reference_declared_classes() -> None:
    content = _read("02_uml.md")
    for relation in (
        'Company "1" --o "*" Job',
        'Job "1" --o "*" JobApplication',
        'Resume "1" --o "*" JobApplication',
    ):
        assert relation in content


# ---------------------------------------------------------------------------
# 03_openapi.yaml
# ---------------------------------------------------------------------------


def test_openapi_doc_has_expected_header_fields() -> None:
    content = _read("03_openapi.yaml")
    assert content.startswith("openapi: 3.0.3")
    assert "title: EQUHUB API Specification" in content
    assert "version: 1.0.0" in content


def test_openapi_doc_declares_production_and_local_servers() -> None:
    content = _read("03_openapi.yaml")
    assert "https://api.equhub.ru/api/v1" in content
    assert "http://localhost:8000/api/v1" in content


@pytest.mark.parametrize(
    "path_key",
    ["/auth/register:", "/auth/login:", "/ads:", "/jobs:"],
)
def test_openapi_doc_declares_expected_paths(path_key: str) -> None:
    content = _read("03_openapi.yaml")
    assert re.search(rf"^  {re.escape(path_key)}$", content, re.MULTILINE), (
        f"expected top-level path {path_key!r} in OpenAPI paths section"
    )


def test_openapi_doc_register_endpoint_requires_email_password_name() -> None:
    content = _read("03_openapi.yaml")
    register_section = content.split("/auth/login:")[0]
    assert "- email" in register_section
    assert "- password" in register_section
    assert "- name" in register_section
    assert "'201':" in register_section
    assert "'400':" in register_section


def test_openapi_doc_login_endpoint_returns_bearer_token_payload() -> None:
    content = _read("03_openapi.yaml")
    login_section = content.split("/auth/login:")[1].split("/ads:")[0]
    assert "access_token:" in login_section
    assert "token_type:" in login_section
    assert "expires_in:" in login_section
    assert "'200':" in login_section
    assert "'401':" in login_section


def test_openapi_doc_ads_endpoint_supports_expected_query_filters() -> None:
    content = _read("03_openapi.yaml")
    ads_section = content.split("/ads:")[1].split("/jobs:")[0]
    for param in ("query", "category", "city"):
        assert re.search(rf"name: {param}\b", ads_section), f"missing /ads query param {param!r}"
    assert "$ref: '#/components/schemas/Listing'" in ads_section


def test_openapi_doc_jobs_endpoint_supports_expected_query_filters() -> None:
    content = _read("03_openapi.yaml")
    jobs_section = content.split("/jobs:")[1].split("components:")[0]
    assert "enum: [all, vacancy, resume]" in jobs_section
    for param in ("sector", "query"):
        assert re.search(rf"name: {param}\b", jobs_section), f"missing /jobs query param {param!r}"
    assert "$ref: '#/components/schemas/Job'" in jobs_section


def test_openapi_doc_declares_bearer_auth_security_scheme() -> None:
    content = _read("03_openapi.yaml")
    components_section = content.split("components:")[1]
    assert "BearerAuth:" in components_section
    assert "type: http" in components_section
    assert "scheme: bearer" in components_section
    assert "bearerFormat: JWT" in components_section


@pytest.mark.parametrize(
    "schema_name,expected_fields",
    [
        (
            "Listing",
            ["id", "title", "description", "price", "city", "category", "seller", "ai_score", "image_url"],
        ),
        (
            "Job",
            [
                "id",
                "type",
                "title",
                "description",
                "salary",
                "city",
                "sector",
                "company",
                "requirements",
                "author",
            ],
        ),
    ],
)
def test_openapi_doc_schemas_declare_expected_fields(schema_name: str, expected_fields: list[str]) -> None:
    content = _read("03_openapi.yaml")
    schema_start = content.index(f"    {schema_name}:")
    # A schema block ends at the next top-level (4-space indented) schema key or EOF.
    remainder = content[schema_start + 1 :]
    next_schema_match = re.search(r"\n    \w+:\n", remainder)
    schema_block = remainder[: next_schema_match.start()] if next_schema_match else remainder
    for field in expected_fields:
        assert re.search(rf"\n\s+{field}:\n", schema_block), (
            f"expected field {field!r} in {schema_name} schema"
        )


def test_openapi_doc_is_parseable_yaml_when_pyyaml_available() -> None:
    yaml = pytest.importorskip("yaml")
    content = _read("03_openapi.yaml")
    spec = yaml.safe_load(content)
    assert spec["openapi"] == "3.0.3"
    assert set(spec["paths"].keys()) == {"/auth/register", "/auth/login", "/ads", "/jobs"}
    assert set(spec["components"]["schemas"].keys()) == {"Listing", "Job"}
    assert spec["components"]["securitySchemes"]["BearerAuth"]["bearerFormat"] == "JWT"


# ---------------------------------------------------------------------------
# 04_figma.md
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "heading",
    [
        "#### Экран 1: Главная лента (Социальная сеть)",
        "#### Экран 2: Маркетплейс товаров и услуг",
        "#### Экран 3: Работа (Вакансии & Резюме)",
        "#### Экран 4: Мессенджер & Чаты",
        "#### Экран 5: AI-ассистент",
        "#### Экран 6: Безопасные сделки (Escrow)",
        "#### Экран 7: Профиль пользователя & Кошелёк",
    ],
)
def test_figma_doc_documents_all_seven_screens(heading: str) -> None:
    content = _read("04_figma.md")
    assert heading in content


def test_figma_doc_flow_diagram_covers_all_bottom_nav_routes() -> None:
    content = _read("04_figma.md")
    flow_block = content.split("```text")[1].split("```")[0]
    branch_lines = [line for line in flow_block.splitlines() if "──>" in line]
    assert len(branch_lines) == 7
    assert flow_block.count("├──") == 6
    assert flow_block.count("└──") == 1


# ---------------------------------------------------------------------------
# 05_design_system.md
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "variable,color",
    [
        ("--bg", "#05070f"),
        ("--surface-opaque", "#0c101f"),
        ("--text", "#f1f5f9"),
        ("--muted", "#94a3b8"),
        ("--accent-blue", "#3b82f6"),
        ("--accent-purple", "#8b5cf6"),
        ("--accent-cyan", "#06b6d4"),
    ],
)
def test_design_system_doc_defines_expected_css_variables(variable: str, color: str) -> None:
    content = _read("05_design_system.md")
    assert f"| `{variable}` | `{color}` |" in content


@pytest.mark.parametrize("selector", [".glass-panel", ".phone-btn-neon", ".glass-pill"])
def test_design_system_doc_defines_expected_css_selectors(selector: str) -> None:
    content = _read("05_design_system.md")
    assert re.search(rf"^{re.escape(selector)} \{{", content, re.MULTILINE)


def test_design_system_doc_glass_panel_uses_expected_border_radius() -> None:
    content = _read("05_design_system.md")
    panel_block = content.split(".glass-panel {")[1].split("}")[0]
    assert "border-radius: 24px;" in panel_block
    assert "backdrop-filter: blur(16px);" in panel_block


def test_design_system_doc_declares_responsive_breakpoints() -> None:
    content = _read("05_design_system.md")
    assert "1400px" in content
    assert "1024px" in content


# ---------------------------------------------------------------------------
# 06_cicd.md
# ---------------------------------------------------------------------------


def test_cicd_doc_declares_frontend_and_backend_jobs() -> None:
    content = _read("06_cicd.md")
    workflow = content.split("```yaml")[1].split("```")[0]
    assert "frontend-check:" in workflow
    assert "backend-test:" in workflow
    assert "run: pytest -v" in workflow


def test_cicd_doc_pins_all_github_actions_to_full_commit_sha() -> None:
    """The doc claims every action is pinned to a full SHA-1, not a tag."""
    content = _read("06_cicd.md")
    workflow = content.split("```yaml")[1].split("```")[0]
    uses_lines = re.findall(r"uses:\s*(\S+)", workflow)
    assert len(uses_lines) >= 3
    for reference in uses_lines:
        repo, _, ref = reference.partition("@")
        assert repo, f"malformed action reference: {reference!r}"
        assert re.fullmatch(r"[0-9a-f]{40}", ref), (
            f"action {repo!r} is not pinned to a full 40-character commit SHA: {ref!r}"
        )


def test_cicd_doc_installs_expected_python_test_dependencies() -> None:
    content = _read("06_cicd.md")
    workflow = content.split("```yaml")[1].split("```")[0]
    assert "pip install pytest playwright python-jose passlib bcrypt" in workflow


# ---------------------------------------------------------------------------
# 07_deployment.md
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "service,image",
    [
        ("postgres", "postgres:15-alpine"),
        ("redis", "redis:7-alpine"),
        ("elasticsearch", "elasticsearch:8.11.1"),
        ("minio", "minio/minio:RELEASE.2024-01-28T22-41-13Z"),
    ],
)
def test_deployment_doc_compose_declares_expected_services(service: str, image: str) -> None:
    content = _read("07_deployment.md")
    compose = content.split("```yaml")[1].split("```")[0]
    service_match = re.search(rf"^  {service}:\n(.*?)(?=\n  \S|\Z)", compose, re.MULTILINE | re.DOTALL)
    assert service_match, f"service {service!r} not declared in docker-compose block"
    assert f"image: {image}" in service_match.group(1)


def test_deployment_doc_compose_declares_named_volumes() -> None:
    content = _read("07_deployment.md")
    compose = content.split("```yaml")[1].split("```")[0]
    volumes_section = compose.split("volumes:\n")[-1]
    for volume in ("pgdata", "redisdata", "esdata", "miniodata"):
        assert re.search(rf"^  {volume}:\s*$", volumes_section, re.MULTILINE)


@pytest.mark.parametrize(
    "route,upstream",
    [
        ("/api/v1/auth", "http://auth-service:8001"),
        ("/api/v1/users", "http://user-service:8002"),
        ("/api/v1/chats", "http://chat-service:8004"),
        ("/api/v1/ads", "http://market-service:8005"),
        ("/api/v1/jobs", "http://vacancy-service:8006"),
    ],
)
def test_deployment_doc_nginx_routes_map_to_expected_upstreams(route: str, upstream: str) -> None:
    content = _read("07_deployment.md")
    nginx_conf = content.split("```nginx")[1].split("```")[0]
    location_match = re.search(rf"location {re.escape(route)} \{{(.*?)\}}", nginx_conf, re.DOTALL)
    assert location_match, f"nginx location for {route!r} not found"
    assert f"proxy_pass {upstream};" in location_match.group(1)


# ---------------------------------------------------------------------------
# 08_testing.md
# ---------------------------------------------------------------------------


def test_testing_doc_pytest_example_matches_real_test_suite() -> None:
    """The doc's example snippet must stay in sync with the real test file."""
    doc_content = _read("08_testing.md")
    example = doc_content.split("```python")[1].split("```")[0]
    real_tests = (ROOT / "tests" / "test_dating_chatbot.py").read_text(encoding="utf-8")

    assert "from dating_chatbot import DatingChatbot" in example
    assert "def test_greet_uses_name" in example
    assert "def test_match_user_deduplicates_and_sorts" in example

    # Both functions documented in the example must actually exist in the real suite.
    assert "def test_greet_uses_name" in real_tests
    assert "def test_match_user_deduplicates_and_sorts" in real_tests


def test_testing_doc_playwright_example_targets_existing_html_page() -> None:
    doc_content = _read("08_testing.md")
    playwright_examples = doc_content.split("```python")[2].split("```")[0]
    assert 'os.path.abspath("public/sound_gen.html")' in playwright_examples
    assert (ROOT / "public" / "sound_gen.html").is_file()

    html_content = (ROOT / "public" / "sound_gen.html").read_text(encoding="utf-8")
    assert "<title>Генератор Случайных Звуков</title>" in html_content


def test_testing_doc_lists_expected_local_run_commands() -> None:
    content = _read("08_testing.md")
    assert "`pytest -v`" in content
    assert "`npx tsc --noEmit`" in content


# ---------------------------------------------------------------------------
# 09_security.md
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "expected_text",
    [
        "JWT HS256 (HMAC-SHA256)",
        "`Access Token`: 15 минут.",
        "`Refresh Token`: 30 дней.",
        "TOTP (RFC 6238)",
        "Bcrypt (Passlib)",
        "равным `12`",
        "AES-256-GCM",
    ],
)
def test_security_doc_states_expected_auth_and_crypto_parameters(expected_text: str) -> None:
    content = _read("09_security.md")
    assert expected_text in content


@pytest.mark.parametrize(
    "expected_text",
    [
        "максимум 5 запросов в минуту",
        "максимум 100 запросов в секунду",
        "HTTPS/TLS 1.3",
        "SRTP (Secure Real-time Transport Protocol)",
    ],
)
def test_security_doc_states_expected_network_protections(expected_text: str) -> None:
    content = _read("09_security.md")
    assert expected_text in content


def test_security_doc_states_backup_recovery_objectives() -> None:
    content = _read("09_security.md")
    assert "Максимум 1 день" in content
    assert "Менее 2 часов" in content


# ---------------------------------------------------------------------------
# 10_admin_dev_guide.md
# ---------------------------------------------------------------------------


def test_admin_guide_dev_server_command_matches_package_json_script() -> None:
    content = _read("10_admin_dev_guide.md")
    assert "npm run dev" in content

    package_json = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    assert package_json["scripts"]["dev"] == "next dev"


def test_admin_guide_lists_expected_setup_commands() -> None:
    content = _read("10_admin_dev_guide.md")
    for command in ("npm install", "docker compose up -d", "npm run dev"):
        assert f"```bash\n{command}\n```" in content


def test_admin_guide_commit_hygiene_mentions_python_and_typescript_caches() -> None:
    content = _read("10_admin_dev_guide.md")
    hygiene_section = content.split("### 2. Поддержка гигиены репозитория")[1].split("### 3.")[0]
    assert "__pycache__/" in hygiene_section
    assert ".pyc" in hygiene_section
    assert "tsconfig.tsbuildinfo" in hygiene_section
    assert "node_modules/" in hygiene_section


def test_admin_guide_ai_moderation_stop_words_are_documented() -> None:
    content = _read("10_admin_dev_guide.md")
    moderation_section = content.split("#### 3.2. Модерация контента через AI")[1]
    for stop_word in ("Обман", "пирамиды", "крипта"):
        assert stop_word in moderation_section
    assert "`moderated`" in moderation_section