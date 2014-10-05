from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from sos_app.serializers import UserSerializer, ContactsSerializer, \
    UserLocationTrackSerializer, MobileDeviceSerializer, IncidentsReportedSerializer
from sos_app.models import Contacts, Mobile_Device, Incidents_Reported,\
    User_Location_Track
from rest_framework.decorators import permission_classes
from sos_app.permissions import IsOwner
from sos_app.utils import CRUDViewSet

import logging
logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    def pre_save(self, obj):
        obj.owner = self.request.user

class ContactsViewSet(CRUDViewSet):
    queryset = Contacts.objects.all()
    serializer_class = ContactsSerializer
    logger.info("about to test")
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwner,)
    def pre_save(self, obj):
        obj.owner = self.request.user

class MobileDeviceViewSet(CRUDViewSet):
    queryset = Mobile_Device.objects.all()
    serializer_class = MobileDeviceSerializer
    logger.info("about to test")
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwner,)
    def pre_save(self, obj):
        obj.owner = self.request.user

class IncidentsReportedViewSet(viewsets.ModelViewSet):
    queryset = Incidents_Reported.objects.all()
    serializer_class = IncidentsReportedSerializer
    logger.info("about to test")
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    def pre_save(self, obj):
        obj.owner = self.request.user

class UserLocationTrackViewSet(CRUDViewSet):
    queryset = User_Location_Track.objects.all()
    serializer_class = UserLocationTrackSerializer
    logger.info("about to test")
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwner,)
    def pre_save(self, obj):
        obj.owner = self.request.user
