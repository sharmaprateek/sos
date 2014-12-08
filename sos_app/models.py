from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

# Create your models here.
#===============================================================================
# class Users(models.Model):
#     email_addr = models.CharField(max_length = 450)
#     fname = models.CharField(max_length = 250)
#     lname = models.CharField(max_length = 250)
#     passwd = models.CharField(max_length = 50)
#     phone = models.CharField(max_length = 45)
#     is_active = models.BooleanField(default = True)
#     date_registered = models.DateTimeField(default = timezone.now())
#     dob =  models.DateField()
#     security_answer = models.CharField(max_length = 450)
#===============================================================================

class Contacts(models.Model):
    owner = models.ForeignKey(User)
    email_addr = models.CharField(max_length = 450)
    fname = models.CharField(max_length = 250)
    lname = models.CharField(max_length = 250)
    phone = models.CharField(max_length = 45)
    enable_alerts = models.BooleanField(default=False)
    share_location = models.BooleanField(default=False)
    send_sms = models.BooleanField(default=False)
    send_email = models.BooleanField(default=False)
    send_push = models.BooleanField(default=False)
    date_added =  models.DateField()

class Mobile_Device(models.Model):
    owner = models.ForeignKey(User)
    device_uuid = models.CharField(max_length = 450)
    phone_number = models.CharField(max_length = 45)
    date_added =  models.DateField()

class Incidents_Reported(models.Model):
    reported_by = models.ForeignKey(User)
    longitude = models.FloatField()
    latitude = models.FloatField()
    address = models.CharField(max_length = 450)
    city = models.CharField(max_length = 100)
    state = models.CharField(max_length = 45)
    zip = models.CharField(max_length = 45)
    country = models.CharField(max_length = 150)
    summary = models.CharField(max_length = 450)
    description = models.TextField()
    time_of_incident = models.DateTimeField(default = timezone.now())
    date_recorded = models.DateField()
    class Meta:
        ordering = ['-date_recorded']

class User_Location_Track(models.Model):
    session_id = models.CharField(max_length=450)
    owner = models.ForeignKey(User)
    longitude = models.FloatField()
    latitude = models.FloatField()
    time_of_incident = models.DateTimeField(default = timezone.now())

class Emergency_Services(models.Model):
    service_name = models.CharField(max_length = 450)
    description = models.CharField(max_length = 450)
    email_addr = models.CharField(max_length = 450)
    phone = models.CharField(max_length = 45)
    url = models.CharField(max_length = 450)
    date_added =  models.DateField()

class User_Emergency_Service_Selection(models.Model):
    owner = models.ForeignKey(User)
    emergency_service = models.ForeignKey(Emergency_Services)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)