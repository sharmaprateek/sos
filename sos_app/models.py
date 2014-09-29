from django.db import models
from django.utils import timezone

# Create your models here.
class Users(models.Model):
    email_addr = models.CharField(max_length = 450)
    fname = models.CharField(max_length = 250)
    lname = models.CharField(max_length = 250)
    passwd = models.CharField(max_length = 50)
    phone = models.CharField(max_length = 45)
    is_active = models.BooleanField(default = True)
    date_registered = models.DateTimeField(default = timezone.now())
    dob =  models.DateField()
    security_answer = models.CharField(max_length = 450)

class Contacts(models.Model):
    user_id = models.ForeignKey(Users)
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
    user_id = models.ForeignKey(Users)
    device_uuid = models.CharField(max_length = 450)
    phone_number = models.CharField(max_length = 45)
    date_added =  models.DateField()

class Incidents_Reported(models.Model):
    reported_by = models.ForeignKey(Users)
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

class User_Location_Track(models.Model):
    session_id = models.CharField(max_length=450)
    user_id = models.ForeignKey(Users)
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
    user_id = models.ForeignKey(Users)
    emergency_service = models.ForeignKey(Emergency_Services)