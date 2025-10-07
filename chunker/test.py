import requests

# Replace with your actual DeepSeek API key
API_KEY = "AIzaSyCECL7tUYjkdFoNLNAiLPmao8c4JGTr0yU"
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

data = {
    "model": "deepseek-chat",  # Use 'deepseek-chat' or 'deepseek-reasoner' depending on the model
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, test the API key."}
    ],
    "stream": False
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    result = response.json()
    print("API Key is valid. Response:")
    print(result['choices'][0]['message']['content'])
else:
    print("Failed to validate API key. Status code:", response.status_code)
    print("Response body:", response.text)
