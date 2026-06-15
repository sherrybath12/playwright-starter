import requests

BASE = "https://jsonplaceholder.typicode.com"


def test_get_posts_returns_100_posts():
    resp = requests.get(f"{BASE}/posts")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) == 100


def test_get_post_1_returns_correct_post():
    resp = requests.get(f"{BASE}/posts/1")
    assert resp.status_code == 200
    body = resp.json()
    assert body.get("id") == 1
    assert body.get("userId") == 1
    assert body.get("title")


def test_post_posts_creates_resource():
    payload = {"title": "Test post", "body": "Hello", "userId": 1}
    resp = requests.post(f"{BASE}/posts", json=payload)
    # JSONPlaceholder returns 201 for created resources
    assert resp.status_code == 201
    body = resp.json()
    assert "id" in body
