from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from twilio.rest import TwilioRestClient


# put your own credentials here
ACCOUNT_SID = "ACd5a56d8755bf5172d794ca32769ea857"
AUTH_TOKEN = "9f7cef1bae7614d90943d6f72ad0f76e"

client = TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN)

@api_view(['POST'])
@permission_classes((IsAuthenticated, ))
@csrf_exempt
def send_message(request):

    data = request.DATA
    sender = request.user.first_name + " " + request.user.last_name
    message = sender + " just initiated a SOS. Your friend might be in trouble, his approximate location is: " + data['geolocation']
    phoneNumbers = data['phoneNumbers']
    for phone in phoneNumbers:
        client.messages.create(
            to = phone,
            from_ = "+16506145513",
            body = message,
        )
    return Response("{success: messages sent}", status=status.HTTP_201_CREATED)