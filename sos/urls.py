from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers
from sos_app.views import UserViewSet, ContactsViewSet, IncidentsReportedViewSet,\
    MobileDeviceViewSet, UserLocationTrackViewSet
from rest_framework.authtoken import views
from sos_app import register, sendsos

admin.autodiscover()
# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'contacts', ContactsViewSet)
router.register(r'mobile-info', MobileDeviceViewSet)
router.register(r'incident', IncidentsReportedViewSet)
router.register(r'location-track', UserLocationTrackViewSet)


urlpatterns = [
    url(r'^register/', register.create_auth),
    url(r'^sendsos/', sendsos.send_message),
    url(r'^sendfalsealert/', sendsos.send_message_false_alert),
    url(r'^', include(router.urls)),
    url(r'^api-token-auth/', views.obtain_auth_token),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls))
]
