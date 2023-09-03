from django.contrib import admin
from .models import Unidad,Contenido,Tema,Material,Ejercicio,Puntuacion
# Register your models here.
admin.site.register(Unidad)
admin.site.register(Contenido)
admin.site.register(Tema)
admin.site.register(Material)
admin.site.register(Ejercicio)
admin.site.register(Puntuacion)