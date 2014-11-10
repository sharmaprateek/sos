from django.contrib.auth.models import User
from rest_framework import  serializers
from sos_app.models import Contacts, Mobile_Device, Incidents_Reported,\
    User_Location_Track
from sos_app.utils import get_model_fields
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'password', 'email', 'is_active')

class ContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacts
        fields = get_model_fields(model)

class MobileDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mobile_Device
        fields = get_model_fields(model)

class IncidentsReportedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidents_Reported
        fields = get_model_fields(model)

class UserLocationTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Location_Track
        fields = get_model_fields(model)
