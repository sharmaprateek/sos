from rest_framework import permissions
import logging
logger = logging.getLogger(__name__)

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.owner == request.user

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        logger.info(obj)
        logger.info(request.user)
        if obj.owner == request.user:
            return True

        return False