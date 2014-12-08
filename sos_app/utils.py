from rest_framework import viewsets, mixins

def get_model_fields(model):
    fields = []
    options = model._meta
    for field in sorted(options.concrete_fields + options.many_to_many + options.virtual_fields):
        fields.append(field.name)
    if ('owner' in fields):
        fields.remove('owner')
    if ('reported_by' in fields):
        fields.remove('reported_by')

    return fields

class CRUDViewSet(mixins.CreateModelMixin,
                                mixins.DestroyModelMixin,
                                mixins.RetrieveModelMixin,
                                mixins.UpdateModelMixin,
                                viewsets.GenericViewSet):
    """
    A viewset that provides CRUD but no `list` actions.
    """
    pass