from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.db import models
def create_custom_permissions(sender, **kwargs):
    # Reemplaza 'YourModel' con el modelo al que deseas agregar los permisos
    content_type_contenido = ContentType.objects.get(app_label='tasks', model='contenido')
    content_type_material = ContentType.objects.get(app_label='tasks', model='material')
    content_type_tema = ContentType.objects.get(app_label='tasks', model='tema')
    content_type_unidad = ContentType.objects.get(app_label='tasks', model='unidad')

    # Define tus permisos personalizados
    permissions = [
        Permission.objects.create(
            codename='can_add_contenido',
            name='Can add contenido',
            content_type=content_type_contenido,
        ),
        Permission.objects.create(
            codename='can_change_contenido',
            name='Can change contenido',
            content_type=content_type_contenido,
        ),
        Permission.objects.create(
            codename='can_delete_contenido',
            name='Can delete contenido',
            content_type=content_type_contenido,
        ),
        Permission.objects.create(
            codename='can_view_contenido',
            name='Can view contenido',
            content_type=content_type_contenido,
        ),
        Permission.objects.create(
            codename='can_add_material',
            name='Can add material',
            content_type=content_type_material ,
        ),
        Permission.objects.create(
            codename='can_change_material',
            name='Can change material',
            content_type=content_type_material ,
        ),
        Permission.objects.create(
            codename='can_delete_material',
            name='Can delete material',
            content_type=content_type_material ,
        ),
        Permission.objects.create(
            codename='can_view_material',
            name='Can view material',
            content_type=content_type_material ,
        ),
        Permission.objects.create(
            codename='can_add_tema',
            name='Can add tema',
            content_type=content_type_tema ,
        ),
        Permission.objects.create(
            codename='can_change_tema',
            name='Can change tema',
            content_type=content_type_tema ,
        ),
        Permission.objects.create(
            codename='can_delete_tema',
            name='Can delete tema',
            content_type=content_type_tema ,
        ),
        Permission.objects.create(
            codename='can_view_tema',
            name='Can view tema',
            content_type=content_type_tema ,
        ),
        
        # Define permisos personalizados para unidad
        Permission.objects.create(
            codename='can_add_unidad',
            name='Can add unidad',
            content_type=content_type_unidad ,
        ),
        Permission.objects.create(
            codename='can_change_unidad',
            name='Can change unidad',
            content_type=content_type_unidad ,
        ),
        Permission.objects.create(
            codename='can_delete_unidad',
            name='Can delete unidad',
            content_type=content_type_unidad ,
        ),
        Permission.objects.create(
            codename='can_view_unidad',
            name='Can view unidad',
            content_type=content_type_unidad ,
        ),
    ]

# Llama a la función para crear permisos cuando se ejecute el archivo
models.signals.post_migrate.connect(create_custom_permissions)