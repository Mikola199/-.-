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
