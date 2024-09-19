import requests
import json

url = "https://api.d7networks.com/messages/v1/send"

payload = json.dumps({
  "messages": [
    {
      "channel": "sms",
      "recipients": [
        "+212678010544",
        "+212678010544"
      ],
      "content": "Greetings from D7 API",
      "msg_type": "text",
      "data_coding": "text"
    }
  ],
  "message_globals": {
    "originator": "SignOTP",
    "report_url": "https://the_url_to_recieve_delivery_report.com"
  }
})
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoLWJhY2tlbmQ6YXBwIiwic3ViIjoiNzcwNzM0MjEtOWE1Ni00NmQ0LTkwOTYtMTc0NDk0NmZmODMzIn0.x4KBi3IA86S-OVG5NmQlDIt1YzjN5SsLG3K2KRnK28E'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)