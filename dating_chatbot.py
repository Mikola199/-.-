from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable


@dataclass
class DatingChatbot:
    """Simple chatbot that suggests matches based on shared interests."""

    name: str = "LoveBot"
    users_by_interest: dict[str, set[str]] = field(
        default_factory=lambda: {
            "music": {"User1", "User4"},
            "travel": {"User2", "User4"},
            "food": {"User3", "User2"},
            "books": {"User5"},
        }
    )

    def greet_user(self) -> str:
        return f"Hello! I'm {self.name}. Ready to chat and help you find love!"

    def ask_interests(self) -> str:
        return "What are your interests? I can match you with like-minded people!"

    def match_user(self, user_interests: Iterable[str]) -> list[str]:
        normalized = {interest.strip().lower() for interest in user_interests if interest.strip()}
        matches: set[str] = set()
        for interest in normalized:
            matches.update(self.users_by_interest.get(interest, set()))
        return sorted(matches)

    def send_message(self, user: str, message: str) -> str:
        return f"Sending message to {user}: {message}"


def demo() -> None:
    love_bot = DatingChatbot()
    print(love_bot.greet_user())
    print(love_bot.ask_interests())

    user_interests = ["Music", "Travel", "Food"]
    matched_users = love_bot.match_user(user_interests)
    print("Matched users:", matched_users)

    for user in matched_users:
        message = "Hi there! Let's chat and see if we have a connection."
        print(love_bot.send_message(user, message))


if __name__ == "__main__":
    demo()
