"""
Test script to verify all todo app features
"""
import requests
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_add_task():
    """Test adding a new task"""
    print("Testing: Add task")
    todo_data = {
        "title": "Test task 1",
        "description": "This is a test task",
        "completed": False
    }
    response = requests.post(f"{BASE_URL}/todos/", json=todo_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        result = response.json()
        print(f"Created task with ID: {result['id']}")
        return result['id']
    else:
        print(f"Error: {response.text}")
        return None

def test_list_tasks():
    """Test listing all tasks"""
    print("\nTesting: List tasks")
    response = requests.get(f"{BASE_URL}/todos/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Found {len(result)} tasks")
        for task in result:
            print(f"  ID: {task['id']}, Title: {task['title']}, Completed: {task['completed']}")
    else:
        print(f"Error: {response.text}")

def test_show_task(todo_id):
    """Test showing a specific task"""
    print(f"\nTesting: Show task {todo_id}")
    response = requests.get(f"{BASE_URL}/todos/{todo_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Task details: ID: {result['id']}, Title: {result['title']}, Completed: {result['completed']}")
    else:
        print(f"Error: {response.text}")

def test_update_task(todo_id):
    """Test updating a task"""
    print(f"\nTesting: Update task {todo_id}")
    update_data = {
        "title": "Updated test task 1",
        "description": "This is an updated test task",
        "completed": False
    }
    response = requests.put(f"{BASE_URL}/todos/{todo_id}", json=update_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Updated task: ID: {result['id']}, Title: {result['title']}")
    else:
        print(f"Error: {response.text}")

def test_complete_task(todo_id):
    """Test completing a task"""
    print(f"\nTesting: Complete task {todo_id}")
    response = requests.patch(f"{BASE_URL}/todos/{todo_id}/complete")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Completed task: ID: {result['id']}, Completed: {result['completed']}")
    else:
        print(f"Error: {response.text}")

def test_delete_task(todo_id):
    """Test deleting a task"""
    print(f"\nTesting: Delete task {todo_id}")
    response = requests.delete(f"{BASE_URL}/todos/{todo_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 204:
        print("Task deleted successfully")
    else:
        print(f"Error: {response.text}")

def test_export_todos():
    """Test exporting todos to txt file"""
    print(f"\nTesting: Export todos")
    response = requests.get(f"{BASE_URL}/export/todos")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Export result: {result}")
    else:
        print(f"Error: {response.text}")

def main():
    print("Starting Todo App Feature Tests\n")

    # Test 1: Add task
    todo_id = test_add_task()
    if not todo_id:
        print("Failed to add task, stopping tests")
        return

    time.sleep(1)  # Brief pause to ensure data consistency

    # Test 2: List tasks
    test_list_tasks()

    time.sleep(1)

    # Test 3: Show task
    test_show_task(todo_id)

    time.sleep(1)

    # Test 4: Update task
    test_update_task(todo_id)

    time.sleep(1)

    # Test 5: Complete task
    test_complete_task(todo_id)

    time.sleep(1)

    # Test 6: List tasks again to see completion
    test_list_tasks()

    time.sleep(1)

    # Test 7: Export todos
    test_export_todos()

    time.sleep(1)

    # Test 8: Delete task
    test_delete_task(todo_id)

    print("\nAll tests completed!")

if __name__ == "__main__":
    main()