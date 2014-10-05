from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers
from sos_app.views import UserViewSet, ContactsViewSet, IncidentsReportedViewSet,\
    MobileDeviceViewSet, UserLocationTrackViewSet

admin.autodiscover()
# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'contacts', ContactsViewSet)
router.register(r'mobile-info', MobileDeviceViewSet)
router.register(r'incident', IncidentsReportedViewSet)
router.register(r'location-track', UserLocationTrackViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls))
]
