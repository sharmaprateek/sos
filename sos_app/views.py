from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from sos_app.serializers import UserSerializer, ContactsSerializer, \
    UserLocationTrackSerializer, MobileDeviceSerializer, IncidentsReportedSerializer
from sos_app.models import Contacts, Mobile_Device, Incidents_Reported,\
    User_Location_Track
from sos_app.permissions import IsOwner
from sos_app.utils import CRUDViewSet

import logging
logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    def pre_save(self, obj):
        obj.owner = self.request.user

class ContactsViewSet(viewsets.ModelViewSet):
    queryset = Contacts.objects.all()
    serializer_class = ContactsSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner,)

    def pre_save(self, obj):
        obj.owner = self.request.user

    def get_queryset(self):
        logger.info("Returning filtered queryset for Contacts")
        return Contacts.objects.filter(owner=self.request.user)

class MobileDeviceViewSet(CRUDViewSet):
    queryset = Mobile_Device.objects.all()
    serializer_class = MobileDeviceSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner,)

    def pre_save(self, obj):
        obj.owner = self.request.user

    def get_queryset(self):
        logger.info("Returning filtered queryset for mobile device object")
        return Mobile_Device.objects.filter(owner=self.request.user)

class IncidentsReportedViewSet(viewsets.ModelViewSet):
    queryset = Incidents_Reported.objects.all()
    serializer_class = IncidentsReportedSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def pre_save(self, obj):
        obj.owner = self.request.user

class UserLocationTrackViewSet(CRUDViewSet):
    queryset = User_Location_Track.objects.all()
    serializer_class = UserLocationTrackSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwner,)

    def pre_save(self, obj):
        obj.owner = self.request.user

    def get_queryset(self):
        logger.info("Returning filtered queryset for user location track")
        return User_Location_Track.objects.filter(owner=self.request.user)