"""
URL configuration for smartgenius project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from tasks import views
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import handler500


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('model/', views.model, name='model'),
    path('signup/', views.signup, name='Registro'),
    path('profile/', views.profile, name='perfil'),
    path('logout/', views.signout, name='logout'),
    path('signin/', views.signin, name='signin'),
    path('inicio/', views.inicio, name='inicio'),
    path('cambiar_contrasena/', views.change_password, name='cambiar_contrasena'),
    path('get_user_data/', views.get_user_data, name='get_user_data'),
    path('edit_perfil/', views.edit_usuario, name='edit_perfil'),

    # Sección unidad
    path('unidad/', views.vwUnidad, name='unidad'),
    path('create_unidad/', views.create_unidad, name='create_unidad'),
    path('edit_unidad/', views.edit_unidad, name='editar_unidad'),
    path('obtener_unidad/', views.vwGetUnidad, name='obtener_unidad'),
    path('buscar_unidad/', views.vwBuscarUnidad, name='buscar_unidad'),
    path('eliminar_unidad/', views.vwEliminarUnidad, name='eliminar_unidad'),

    # Sección contenido
    path('contenido/', views.vwcontenido, name='contenido'),
    path('obtener_unidades/', views.vwObtener_Unidad, name='unidad_contenido'),
    path('create_contenido/', views.create_contenido, name='create_contenido'),
    path('unidad_seleccionada/', views.vwGetUnidad_Contenido, name='unidad_seleccionada'),
    path('edit_contenido/', views.vwEditar_Contenido, name='editar_contenido'),
    path('eliminar_contenido/', views.vwEliminarContenido, name='eliminar_contenido'),

    # Sección contenido
    path('temas/', views.vwTemas, name='temas'),
    path('obtener_contenido/', views.vwObtener_Contenido, name='contenido_tema'),
    path('create_tema/', views.vwCreate_tema, name='create_tema'),
    path('contenido_seleccionada/', views.vwGetContenido_Tema, name='contenido_seleccionada'),
    path('edit_tema/', views.vwEditar_Tema, name='editar_tema'),
    path('eliminar_tema/', views.vwEliminarTema, name='eliminar_tema'),

    # Sección material
    path('material/', views.vwMaterial, name='material'),
    path('material_seleccionada/', views.vwGetMaterial_Tema, name='material_seleccionada'),
    path('ejercicio_material/',views.vwGetMaterial_ejercicio, name='ejercicio_material'),
    path('obtener_temas/', views.vwObtener_Temas, name='obtener_temas'),
    path('create_material/', views.vwCreate_material, name='create_material'),
    path('eliminar_material/', views.vwEliminarMaterial, name='eliminar_material'),
    path('edit_material/', views.vwEdit_Material, name='edit_material'),

    # Sección ejercicio
    path('create_ejercicio/', views.vwCreate_ejercicio, name='create_ejercicio'),
    path('eliminar_ejercicio/', views.vwEliminarEjercicio, name='eliminar_ejercicio'),

     # Sección contenido - Alumno
    path('contenido_alumno/', views.vwContenidoAlumno, name='contenido_alu'),
    path('getcontenido_alumno/', views.get_material_by_tema_id,name='getcontenido_alumno'),
    path('avance_alumno/', views.visualizar_puntuacion, name='avance_alu'),
    path('obtener_contenidos/', views.obtener_contenidos, name='obtener_contenidos'),
    path('obtener_temas_contenido/', views.obtener_temas_contenido, name='obtener_temas_contenido'),
    path('obtener_ejercicios/', views.obtener_ejercicios, name='obtener_ejercicios'),
    path('obtener_materiales/', views.obtener_materiales, name='obtener_materiales'),
    path('visualizar_puntuacion_filtrada/', views.visualizar_puntuacion_filtrada, name='visualizar_puntuacion_filtrada'),
    path('visualizar_ejercicio_user/', views.obtener_ejercicios_visualizacion, name='visualizar_ejercicio_user'),

    #perfil
    path('cambiar_contrasena/', views.change_password, name='cambiar_contrasena'),
    path('get_user_data/', views.get_user_data, name='get_user_data'),
    path('edit_perfil/', views.edit_usuario, name='edit_perfil'),

    #Sección perfil - Alumno
    path('contenido_alumno/temas/', views.vwTemaAlumno, name='temas_alu'),
    path('perfil_alumno/', views.vwPerfilAlumno, name='perfil_alu'),
    path('obtener_puntuacion_por_tema/', views.obtener_puntuacion_por_tema, name='obtener_puntuacion_por_tema'),
    path('registrar_practica/', views.RegistrarPractica, name='registrar_practica'),

    # Sección reportes
    path('inicio/create/', views.create_unidad, name='create_unidad'),
    path('reporte/', views.visualizar_reporte, name='visualizar_reporte'),
    path('aula/', views.visualizar_contenido, name='aula_documento'),
    path('imprimir_unidad/<int:unidad_id>/', views.generar_unidad_pdf, name='imprimir_unidad'),


    path('recomendacion/', views.buscar_youtube, name='recomendacion'),
]

handler500 = 'tasks.views.server_error'
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
