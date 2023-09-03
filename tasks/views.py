from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.db import IntegrityError
from .models import Unidad, Contenido, Material, Tema, Ejercicio, Puntuacion
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import requires_csrf_token
from io import BytesIO
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from django.core.files.base import ContentFile
from django.core.exceptions import PermissionDenied
import json
from django.conf import settings
from isodate import parse_duration
import requests
import random
import pandas as pd
import plotly.express as px
from django.db.models import Count

# Create your views here.


def home(request):
    return render(request, 'home.html')


def model(request):
    return render(request, 'model.html')


def signup(request):
    if request.method == 'GET':
        return render(request, 'signup.html', {
            'form': UserCreationForm
        })
    else:
        if request.POST['password1'] == request.POST['password2']:
            try:
                # Register User
                user = User.objects.create_user(
                    username=request.POST['username'], email=request.POST['email'], password=request.POST['password1'])
                user.save()
                login(request, user)
                return redirect('perfil')
            except IntegrityError:
                return render(request, 'signup.html', {
                    'form': UserCreationForm,
                    'error': 'El usuario ya existe'
                })
        return render(request, 'signup.html', {
            'form': UserCreationForm,
            'error': 'Contraseña no coinciden'
        })


def signin(request):
    error = None
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None and user.is_active:
                login(request, user)
                return redirect('perfil')
            else:
                error = 'Usuario o Contraseña es incorrecto'
        else:
            error = 'Por favor, ingrese un nombre de usuario y contraseña válidos'
    else:
        form = AuthenticationForm()

    return render(request, 'signin.html', {
        'form': form,
        'error': error,
    })


@login_required
def change_password(request):
    if request.method == 'POST':
        new_password = request.POST['contraseña']
        user = request.user

        user.set_password(new_password)
        user.save()
        # Actualiza la sesión de autenticación
        update_session_auth_hash(request, user)

        return JsonResponse({'result': '1', 'message': 'Cambio de contraseña correctamente'})

    return JsonResponse({'result': '0', 'message': 'Error al modificar la contraseña, por favor intente nuevamente.'})


@login_required
def edit_usuario(request):
    if request.method == 'POST':
        if request.user.is_authenticated:
            username_id = request.POST.get('usuario_id')
            nuevo_username = request.POST.get('user')
            nombres = request.POST.get('nombres')
            apellidos = request.POST.get('apellidos')
            email = request.POST.get('email')
            try:
                usuario = get_object_or_404(User, username=username_id)
                # Verifica si el usuario que se quiere editar es el mismo que el usuario autenticado
                if usuario == request.user:
                    # Comprobamos si el nuevo username está disponible
                    if nuevo_username != usuario.username and User.objects.filter(username=nuevo_username).exists():
                        return JsonResponse({'result': '0', 'message': 'El nombre de usuario ya está en uso.'})

                    # Si el nuevo username es diferente, actualizamos el username
                    if email != usuario.username:
                        usuario.username = email
                    usuario.first_name = nombres
                    usuario.last_name = apellidos
                    usuario.email = nuevo_username
                    usuario.save()
                    return JsonResponse({'result': '1'})
                else:
                    raise PermissionDenied(
                        "No tienes permisos para editar este usuario.")
            except Exception as e:
                return JsonResponse({'result': '0', 'message': str(e)})
        else:
            raise PermissionDenied(
                "Debes estar autenticado para editar un usuario.")


@login_required
def get_user_data(request):
    if request.method == "GET" and "username" in request.GET:
        username = request.GET["username"]

        try:
            user = User.objects.get(username=username)
            user_data = {
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }
            return JsonResponse(user_data)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado.'}, status=404)
    else:
        return JsonResponse({'error': 'Petición inválida.'}, status=400)


@login_required
def profile(request):
    return render(request, 'profile.html')


@login_required
def signout(request):
    logout(request)
    return redirect('home')


@login_required
def inicio(request):
    puntuaciones_usuario = Puntuacion.objects.all()
    temas_practicados = {}
    for puntuacion in puntuaciones_usuario:
        tema_id = puntuacion.tema.id
        if tema_id in temas_practicados:
            temas_practicados[tema_id] += 1
        else:
            temas_practicados[tema_id] = 1
    temas_info = []
    for tema_id, practicas in temas_practicados.items():
        tema = Tema.objects.get(id=tema_id)
        tema_dict = {
            'id': tema_id,
            'tema': tema.nombre,
            'cantidad_estudiantes': practicas
        }
        temas_info.append(tema_dict)

    df = pd.DataFrame(temas_info)
    fig = px.bar(df, x='tema', y='cantidad_estudiantes', title='Prácticas por Tema',
                 color_discrete_sequence=['blue'], opacity=0.7)
    fig.update_layout(title_x=0.5)
    fig.update_traces(marker_line_width=0.1)
    fig.update_layout(yaxis_tickmode='linear', plot_bgcolor='white')
    fig.update_layout(
        xaxis_title="Tema",
        yaxis_title="Cantidad de Estudiantes",
        yaxis_tickmode='linear',
        plot_bgcolor='white',
        font=dict(family="Arial", size=12, color="black"),
        showlegend=False)
    grafico_html = fig.to_html(full_html=False)
    context = {
        'grafico_html': grafico_html
    }
    return render(request, 'inicio.html', context)

# Vista que renderiza la plantilla que lista los unidades registrados


@login_required
def vwUnidad(request):
    unidades_list = Unidad.objects.all()  # Obtener todos los registros de unidades

    # Configuración del paginador para mostrar 5 unidades por página
    paginator = Paginator(unidades_list, 5)

    page = request.GET.get('page')  # Obtener el número de página de la URL

    try:
        unidades = paginator.page(page)
    except PageNotAnInteger:
        # Si el número de página no es un número, mostrar la primera página
        unidades = paginator.page(1)
    except EmptyPage:
        # Si el número de página está fuera de rango, mostrar la última página
        unidades = paginator.page(paginator.num_pages)

    return render(request, 'create_unidad.html', {'unidad': unidades, 'btnUnidad': 'activado'})


@login_required
def create_unidad(request):
    if request.method == 'POST':
        nombre_unidad = request.POST.get('nombre')
        if not nombre_unidad:
            return JsonResponse({'result': '0', 'message': 'Por favor ingrese un nombre para la unidad.'})
        try:
            unUnidad = Unidad()
            unUnidad.nombre = request.POST['nombre']
            unUnidad.save()
            return JsonResponse({'result': '1'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar la unidad, por favor intente nuevamente.'})

# Vista que modifica los datos de un administrador


@login_required
def edit_unidad(request):
    if request.method == 'POST':
        nombre_unidad = request.POST.get('txtEdUnidadNombre')
        if not nombre_unidad:
            return JsonResponse({'result': '0', 'message': 'Por favor ingrese un nombre para la unidad.'})
        try:
            unUnidad = Unidad.objects.get(pk=request.POST['txtIdUnidad'])
            unUnidad.nombre = request.POST['txtEdUnidadNombre']
            unUnidad.save()
            messages.success(
                request, 'El administrador se modificó exitosamente.')
            return JsonResponse({'result': '1'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar la unidad, por favor intente nuevamente.'})

# Vista que busca a los administradores de forma filtrada


@login_required
def vwBuscarUnidad(request):
    if request.method == 'POST':
        try:
            buscarUnidad = request.POST['txtBuscarunidad']
            unidades_filtradas = Unidad.objects.filter(
                nombre__icontains=buscarUnidad)
            return render(request, 'administradores.html', {
                'unidades_filtradas': unidades_filtradas,
                'txtBuscarunidad': buscarUnidad,
                'btnBuscarunidad': 'activado'
            })
        except Exception as e:
            return redirect('unidad')


# Vista que obtiene un datos de un unidad mediante un id
@login_required
def vwGetUnidad(request):
    if request.method == 'GET':
        try:
            idUnidad = request.GET['idUnidad']
            unUnidad = Unidad.objects.get(pk=idUnidad)
            return JsonResponse({'result': '1', 'nombre': unUnidad.nombre, 'id': unUnidad.pk})
        except Exception as e:
            return JsonResponse({'result': '0'})

# Vista que eliminar una unidad mediante un id


@login_required
def vwEliminarUnidad(request):
    if request.method == 'POST':
        try:
            unUnidad = Unidad.objects.get(pk=request.POST['idUnidad'])
            unUnidad.delete()
            return JsonResponse({'result': '1', 'message': 'Se elimino correctamente'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar la unidad, por favor intente nuevamente.'})


@login_required
def vwcontenido(request):
    # Obtener todos los registros de unidades
    contenido_list = Contenido.objects.all()

    # Configuración del paginador para mostrar 5 unidades por página
    paginator = Paginator(contenido_list, 5)

    page = request.GET.get('page')  # Obtener el número de página de la URL

    try:
        contenido = paginator.page(page)
    except PageNotAnInteger:
        # Si el número de página no es un número, mostrar la primera página
        contenido = paginator.page(1)
    except EmptyPage:
        # Si el número de página está fuera de rango, mostrar la última página
        contenido = paginator.page(paginator.num_pages)

    return render(request, 'create_contenido.html', {'contenido': contenido, 'btnContenido': 'activado'})


@login_required
def vwObtener_Unidad(request):
    unidades = Unidad.objects.all().values('id', 'nombre')
    return JsonResponse(list(unidades), safe=False)


@login_required
def create_contenido(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        descripcion = request.POST.get('descripcion')
        unidad_id = request.POST.get('unidad_id')

        if not nombre or not unidad_id:
            return JsonResponse({'result': 'error', 'message': 'Por favor ingrese un nombre para el contenido'})
        try:
            unidad = Unidad.objects.get(pk=unidad_id)
            contenido = Contenido(
                nombre=nombre, descripcion=descripcion, unidad=unidad)
            contenido.save()
            return JsonResponse({'result': 'success', 'message': 'Contenido registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'result': 'error', 'message': 'Error en registrar contenido'}, status=400)

# Vista que obtiene un datos de un unidad mediante un id


@login_required
def vwGetUnidad_Contenido(request):
    if request.method == 'GET':
        try:
            contenido_id = request.GET.get('idContenido')

            contenido = Contenido.objects.get(pk=contenido_id)
            unidades = Unidad.objects.all()
            data = {
                'result': '1',
                'nombre': contenido.nombre,
                'descripcion': contenido.descripcion,
                'unidad_id': contenido.unidad_id,
                'contenido_id': contenido_id,
                'unidades': [{'id': unidad.id, 'nombre': unidad.nombre} for unidad in unidades],
            }
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error en buscar la información del contenido'})


@login_required
def vwEditar_Contenido(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombreContenidoMod')
        descripcion = request.POST.get('descripcionEdContenido')
        unidad_id = request.POST.get('selectModContenido')
        contenido_id = request.POST.get('txtIdContenido')
        if not nombre:
            return JsonResponse({'result': '0', 'message': 'Por favor ingrese un nombre para el contenido.'})
        try:
            unidad = Unidad.objects.get(pk=unidad_id)
            contenido = Contenido.objects.get(pk=contenido_id)
            contenido.nombre = nombre
            contenido.descripcion = descripcion
            contenido.unidad = unidad
            contenido.save()
            return JsonResponse({'result': '1', 'message': 'El contenido se modificó exitosamente.'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar el contenido, por favor intente nuevamente.'})
    else:
        # Si no es una solicitud POST, puedes manejarlo de acuerdo a tus necesidades
        return JsonResponse({'result': '0', 'message': 'Método no permitido.'})


@login_required
def vwEliminarContenido(request):
    if request.method == 'POST':
        try:
            unContenido = Contenido.objects.get(pk=request.POST['idContenido'])
            unContenido.delete()
            return JsonResponse({'result': '1', 'message': 'Se elimino correctamente'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al eliminar el contenido, por favor intente nuevamente.'})


@login_required
def vwTemas(request):
    tema_list = Tema.objects.all()  # Obtener todos los registros de unidades

    # Configuración del paginador para mostrar 5 unidades por página
    paginator = Paginator(tema_list, 5)

    page = request.GET.get('page')  # Obtener el número de página de la URL

    try:
        temas = paginator.page(page)
    except PageNotAnInteger:
        # Si el número de página no es un número, mostrar la primera página
        temas = paginator.page(1)
    except EmptyPage:
        # Si el número de página está fuera de rango, mostrar la última página
        temas = paginator.page(paginator.num_pages)

    return render(request, 'temas.html', {'temas': temas, 'btnUnidad': 'activado'})


@login_required
def vwObtener_Contenido(request):
    contenido = Contenido.objects.all().values('id', 'nombre')
    return JsonResponse(list(contenido), safe=False)


@login_required
def vwCreate_tema(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        contenido_id = request.POST.get('contenido_id')
        if not nombre or not contenido_id:
            return JsonResponse({'result': 'error', 'message': 'Por favor ingrese un nombre para el tema'})
        try:
            contenido = Contenido.objects.get(pk=contenido_id)
            tema = Tema(nombre=nombre, contenido=contenido)
            tema.save()
            return JsonResponse({'result': 'success', 'message': 'Tema registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'result': 'error', 'message': 'Error en registrar contenido'}, status=400)


@login_required
def vwGetContenido_Tema(request):
    if request.method == 'GET':
        try:
            tema_id = request.GET.get('idTema')

            tema = Tema.objects.get(pk=tema_id)
            contenidos = Contenido.objects.all()
            data = {
                'result': '1',
                'nombre': tema.nombre,
                'contenido_id': tema.contenido_id,
                'tema_id': tema_id,
                'contenidos': [{'id': contenido.id, 'nombre': contenido.nombre} for contenido in contenidos],
            }
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error en buscar la información del contenido'})


@login_required
def vwEditar_Tema(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombreTemaModi')
        contenido_id = request.POST.get('selectRegisterTemaModi')
        tema_id = request.POST.get('txtIdTema')
        if not nombre:
            return JsonResponse({'result': '0', 'message': 'Por favor ingrese un nombre para el tema.'})
        try:
            contenido = Contenido.objects.get(pk=contenido_id)
            tema = Tema.objects.get(pk=tema_id)
            tema.nombre = nombre
            tema.contenido = contenido
            tema.save()
            return JsonResponse({'result': '1', 'message': 'El tema se modificó exitosamente.'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar el tema, por favor intente nuevamente.'})
    else:
        # Si no es una solicitud POST, puedes manejarlo de acuerdo a tus necesidades
        return JsonResponse({'result': '0', 'message': 'Método no permitido.'})


@login_required
def vwEliminarTema(request):
    if request.method == 'POST':
        try:
            unTema = Tema.objects.get(pk=request.POST['idTema'])
            unTema.delete()
            return JsonResponse({'result': '1', 'message': 'Se elimino correctamente'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar la unidad, por favor intente nuevamente.'})


@login_required
def vwMaterial(request):
    material_list = Material.objects.all().order_by(
        'tema')  # Obtener todos los registros de unidades

    # Configuración del paginador para mostrar 5 unidades por página
    paginator = Paginator(material_list, 5)

    page = request.GET.get('page')  # Obtener el número de página de la URL

    try:
        material = paginator.page(page)
    except PageNotAnInteger:
        # Si el número de página no es un número, mostrar la primera página
        material = paginator.page(1)
    except EmptyPage:
        # Si el número de página está fuera de rango, mostrar la última página
        material = paginator.page(paginator.num_pages)
    # Encontrar los materiales que no tienen ejercicios relacionados
    materials_without_exercises = Material.objects.filter(
        ejercicio__isnull=True)

    return render(request, 'material.html', {'material': material, 'materials_without_exercises': materials_without_exercises})


@login_required
def vwGetMaterial_Tema(request):
    if request.method == 'GET':
        try:
            material_id = request.GET.get('idMaterial')
            material = Material.objects.get(pk=material_id)

            temas = Tema.objects.filter(material=material)
            temas_data = [{'id': tema.id, 'nombre': tema.nombre}
                          for tema in temas]

            ejercicios = Ejercicio.objects.filter(material=material)
            ejercicio_data = [
                {'id': ejercicio.id, 'enunciado': ejercicio.enunciado} for ejercicio in ejercicios]
            excluded_topic_ids = [tema['id'] for tema in temas_data]
            temas_with_material = Tema.objects.filter(
                material__isnull=False).exclude(id__in=excluded_topic_ids).distinct()

            temas_list = [{'id': tema.id, 'nombre': tema.nombre}
                          for tema in temas_with_material]

            registered_temas = Material.objects.values_list(
                'tema_id', flat=True).distinct()
            all_temas = Tema.objects.all()

            unregistered_temas = all_temas.exclude(id__in=registered_temas)

            temas_list_ = [{'id': tema.id, 'nombre': tema.nombre}
                           for tema in unregistered_temas]
            combined_temas_list = temas_data + temas_list_

            data = {
                'result': '1',
                'material_id': material_id,
                'enlace': material.enlace,
                'pdf': material.archivo_pdf.url,
                'temas': temas_data,
                'temas_list': combined_temas_list,
                'ejercicios': ejercicio_data,
            }
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error en buscar la información del contenido'})


@login_required
def vwGetMaterial_ejercicio(request):
    if request.method == 'GET':
        try:
            ejercicio_id = request.GET.get('ejercicioId')
            ejercicio = Ejercicio.objects.get(
                pk=ejercicio_id)  # Usa el modelo Ejercicio
            data = {
                'result': '1',
                'enunciado': ejercicio.enunciado,
                'opciones': ejercicio.opciones,
                'resp_correct': ejercicio.respuesta_correcta
            }
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error en buscar la información del contenido'})


@login_required
def vwObtener_Temas(request):
    temas_registrados = Material.objects.values_list('tema__id', flat=True)
    temas_no_registrados = Tema.objects.exclude(
        id__in=temas_registrados).values('id', 'nombre')
    return JsonResponse(list(temas_no_registrados), safe=False)


@login_required
def vwCreate_material(request):
    if request.method == 'POST':
        enlace = request.POST.get('enlace')
        archivo = request.FILES.get('archivo_pdf')
        tema_id = request.POST.get('tema_id')
        if not enlace or not archivo or not tema_id:
            return JsonResponse({'result': 'error', 'message': 'Por favor ingrese todo los datos'})
        try:
            tema = Tema.objects.get(pk=tema_id)
            # Guardar el archivo en el modelo Material
            material = Material(enlace=enlace, tema=tema)
            material.archivo_pdf.save(
                archivo.name, ContentFile(archivo.read()), save=True)

            return JsonResponse({'result': 'success', 'message': 'Tema registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'result': 'error', 'message': 'Error en registrar contenido'}, status=400)


@login_required
def vwCreate_ejercicio(request):
    if request.method == 'POST':

        enunciado = request.POST.get('enunciado')
        opciones_json = request.POST.get('opciones')
        respuesta = request.POST.get('respuesta')
        material_id = request.POST.get('material_id')
        if not enunciado or not opciones_json or not respuesta:
            return JsonResponse({'result': 'error', 'message': 'Por favor ingrese los datos faltantes de la pregunta'})
        try:
            material = Material.objects.get(pk=material_id)
            # Deserializar la cadena JSON a un array Python
            opciones = json.loads(opciones_json)

            ejercicio = Ejercicio(enunciado=enunciado, opciones=opciones,
                                  respuesta_correcta=respuesta, material=material)
            ejercicio.save()
            return JsonResponse({'result': 'success', 'message': 'Ejercicio registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'result': 'error', 'message': 'Error en registrar el ejercicio'}, status=400)


@login_required
def vwEliminarEjercicio(request):
    if request.method == 'POST':
        try:
            unEjer = Ejercicio.objects.get(pk=request.POST['idEjercicio'])
            unEjer.delete()
            return JsonResponse({'result': '1', 'message': 'Se elimino correctamente'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar la unidad, por favor intente nuevamente.'})


@login_required
def vwEliminarMaterial(request):
    if request.method == 'POST':
        try:
            unMaterial = Material.objects.get(pk=request.POST['idMaterial'])
            unMaterial.delete()
            return JsonResponse({'result': '1', 'message': 'Se elimino correctamente'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar la unidad, por favor intente nuevamente.'})


@login_required
def visualizar_reporte(request):
    busqueda_estudiante = request.GET.get('busqueda_estudiante')
    ultimas_practicas_json = []
    hace_30_dias = timezone.now() - timezone.timedelta(days=30)

    if busqueda_estudiante:
        usuarios_no_administradores = User.objects.filter(
            is_staff=False, username__icontains=busqueda_estudiante.lower()
        )
    else:
        usuarios_no_administradores = User.objects.filter(is_staff=False)
    # Itera a través de los usuarios no administradores
    for usuario in usuarios_no_administradores:
        # Obtén la última práctica de cada usuario
        ultima_practica = Puntuacion.objects.filter(
            usuario=usuario).order_by('-fecha').first()
        esta_activo = usuario.last_login >= hace_30_dias if usuario.last_login else False

        # Agrega la última práctica y el estado de actividad a la lista
        if ultima_practica:

            data = {
                # Supongo que deseas el nombre de usuario en lugar del objeto User
                'usuario': usuario.username,
                'tema': ultima_practica.tema.nombre,
                'fecha': ultima_practica.fecha,
                'puntaje': ultima_practica.puntaje,
                'preguntas': ultima_practica.preguntas_respondidas,
                'esta_activo': esta_activo  # Agrega el estado de actividad
            }
            ultimas_practicas_json.append(data)

    print(usuarios_no_administradores)
    paginator = Paginator(ultimas_practicas_json, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, 'reporte.html', {'page_obj': page_obj})


@login_required
def visualizar_contenido(request):
    unidades = Unidad.objects.all()
    contenidos = Contenido.objects.select_related('unidad').all()
    temas = Tema.objects.select_related('contenido__unidad').all()
    materiales = Material.objects.prefetch_related('tema').all()
    ejercicios = Ejercicio.objects.select_related('material').all()
    context = {
        'unidades': unidades,
        'contenidos': contenidos,
        'temas': temas,
        'materiales': materiales,
        'ejercicios': ejercicios,
    }
    return render(request, 'contenido_material.html', context)


@login_required
def generar_unidad_pdf(request, unidad_id):
    unidad = Unidad.objects.get(pk=unidad_id)
    contenidos = Contenido.objects.filter(unidad=unidad)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{unidad.nombre}.pdf"'

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))

    story = []

    for contenido in contenidos:
        content_style = getSampleStyleSheet()["Heading1"]
        content_text = f"Contenido: {contenido.nombre}"
        content_paragraph = Paragraph(content_text, content_style)
        story.append(content_paragraph)

        content_style = getSampleStyleSheet()["Normal"]
        description_text = f"Descripción: {contenido.descripcion}"
        description_paragraph = Paragraph(description_text, content_style)
        story.append(description_paragraph)
        story.append(Spacer(1, 10))  # Add spacing

        temas = Tema.objects.filter(contenido=contenido)

        for tema in temas:
            story.append(Spacer(1, 10))  # Add spacing

            content_style = getSampleStyleSheet()["Title"]
            content_text = f"Tema: {tema.nombre}"
            content_paragraph = Paragraph(content_text, content_style)
            story.append(content_paragraph)

            tema_data = [f"Recursos"]
            data = [tema_data]

            material = Material.objects.filter(tema=tema).first()
            if material:
                enlace_data = [f"Enlace: {material.enlace}"]
                pdf_data = [f"Archivo PDF: {material.archivo_pdf.url}"]
                ejercicios_data = ["Ejercicios:"]
                ejercicios = Ejercicio.objects.filter(material=material)
                for ejercicio in ejercicios:
                    ejercicios_data.append(f"- {ejercicio.enunciado}")

                data.extend([enlace_data, pdf_data])
                ejercicios_data = "\n".join(ejercicios_data)
                data.append([ejercicios_data])

                table = Table(data)
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.black),
                    ('BOX', (0, 0), (-1, -1), 0.25, colors.black),
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ]))
                story.append(table)

    doc.build(story)

    pdf = buffer.getvalue()
    buffer.close()

    response.write(pdf)
    return response


@login_required
def vwContenidoAlumno(request):
    contenidos = Contenido.objects.select_related('unidad').all()

    context = {
        'contenidos': contenidos
    }

    return render(request, 'contenido_alumno.html', context)


@login_required
def vwTemaAlumno(request):
    id = request.POST.get('id')
    temas = Tema.objects.annotate(num_ejercicios=Count(
        'material__ejercicio')).filter(num_ejercicios__gt=0, contenido_id=id)
    materiales = Material.objects.select_related('tema').filter(tema__in=temas)
    ejercicios = Ejercicio.objects.select_related(
        'material__tema').filter(material__in=materiales)

    context = {
        'id_contenido': id,
        'temas': temas,
        'materiales': materiales,
        'ejercicios': ejercicios,
    }

    return render(request, 'tema_alumno.html', context)


@login_required
def vwEdit_Material(request):
    if request.method == 'POST':
        material_id = request.POST.get('material_id')
        enlace = request.POST.get('enlace')
        archivo = request.FILES.get('archivo_pdf')
        tema_id = request.POST.get('tema_id')
        if not material_id or not enlace or not archivo:
            return JsonResponse({'result': '0', 'message': 'Por favor ingrese los datos corresponciente.'})
        try:
            material = Material.objects.get(pk=material_id)
            material.enlace = enlace
            if archivo:
                material.archivo_pdf = archivo
            material.tema_id = tema_id
            material.save()
            return JsonResponse({'result': '1', 'message': 'El tema se modificó exitosamente.'})
        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error al modificar el tema, por favor intente nuevamente.'})
    else:
        # Si no es una solicitud POST, puedes manejarlo de acuerdo a tus necesidades
        return JsonResponse({'result': '0', 'message': 'Método no permitido.'})


@login_required
def get_material_by_tema_id(request):
    if request.method == 'GET':
        try:
            tema_id = request.GET.get('tema_id')

            # Buscar el material relacionado con el tema
            material = Material.objects.filter(tema_id=tema_id).first()

            if material:
                # Obtener preguntas relacionadas con el material
                preguntas = Ejercicio.objects.filter(material=material)

                preguntas_data = [{'id': pregunta.id, 'enunciado': pregunta.enunciado, 'opciones': pregunta.opciones,
                                   'resp_correcta': pregunta.respuesta_correcta} for pregunta in preguntas]

                data = {
                    'result': '1',
                    'enlace': material.enlace,
                    'pdf': material.archivo_pdf.url,
                    'preguntas': preguntas_data,
                }
                return JsonResponse(data)
            else:
                return JsonResponse({'result': '0', 'message': 'No se encontró material para el tema dado'})

        except Exception as e:
            return JsonResponse({'result': '0', 'message': 'Error en buscar la información del material por tema'})


@login_required
def vwPerfilAlumno(request):
    return render(request, 'perfil_alumno.html')


@login_required
def vwAvanceAlumno(request):
    return render(request, 'avance_alumno.html')


@login_required
def visualizar_puntuacion(request):
    usuario_actual = request.user
    unidades = Unidad.objects.all()

    puntuaciones = Puntuacion.objects.filter(
        usuario=usuario_actual).select_related('tema')

    context = {
        'unidades': unidades,
        'puntuaciones': puntuaciones,
    }

    return render(request, 'avance_alumno.html', context)


@login_required
def obtener_contenidos(request):
    if request.method == 'GET':
        unidad_id = request.GET.get('unidad_id')
        contenidos = Contenido.objects.filter(
            unidad_id=unidad_id).values('id', 'nombre')
        return JsonResponse(list(contenidos), safe=False)


@login_required
def obtener_temas_contenido(request):
    if request.method == 'GET':
        contenido_id = request.GET.get('contenido_id')
        temas = Tema.objects.filter(
            contenido_id=contenido_id).values('id', 'nombre')
        return JsonResponse(list(temas), safe=False)


@login_required
def obtener_materiales(request):
    if request.method == 'GET':
        tema_id = request.GET.get('tema_id')
        materiales = Material.objects.filter(
            tema_id=tema_id).values('id', 'enlace')
        return JsonResponse(list(materiales), safe=False)


@login_required
def obtener_ejercicios(request):
    if request.method == 'GET':
        material_id = request.GET.get('material_id')
        ejercicios = Ejercicio.objects.filter(
            material_id=material_id).values('id', 'enunciado')
        return JsonResponse(list(ejercicios), safe=False)


@login_required
def obtener_ejercicios_visualizacion(request):
    if request.method == 'GET':
        ejercicio_id = request.GET.get('ejercicio_id')
        ejercicios = Ejercicio.objects.filter(id=ejercicio_id).values(
            'id', 'enunciado', 'opciones', 'respuesta_correcta')
        return JsonResponse(list(ejercicios), safe=False)


@login_required
def visualizar_puntuacion_filtrada(request):
    usuario_actual = request.user
    unidades = Unidad.objects.all()
    puntuaciones = Puntuacion.objects.filter(
        usuario=usuario_actual).select_related('ejercicio__material__tema')

    ejercicio_id = request.GET.get('ejercicio_id')
    if ejercicio_id:
        puntuaciones = puntuaciones.filter(
            ejercicio_id=ejercicio_id, usuario=usuario_actual)

    context = {
        'unidades': unidades,
        'puntuaciones': puntuaciones,
    }

    return render(request, 'avance_alumno.html', context)


@login_required
def obtener_puntuacion_por_tema(request):
    tema_id = request.GET.get('tema_id')

    # Filtra las puntuaciones por el tema_id proporcionado
    puntuaciones = Puntuacion.objects.filter(tema_id=tema_id)

    # Formatea los datos en un formato JSON
    data = []
    for puntuacion in puntuaciones:
        data.append({
            'tema': puntuacion.tema.nombre,  # Nombre del tema
            'preguntas_respondidas': puntuacion.preguntas_respondidas,
            # Convierte el puntaje a cadena
            'puntaje': str(puntuacion.puntaje),
            # Formato de fecha
            'fecha': puntuacion.fecha.strftime('%Y-%m-%d %H:%M:%S'),
        })

    return JsonResponse(data, safe=False)


@login_required
def buscar_youtube(request):
    videos = []

    if request.method == 'POST':
        search_url = 'https://www.googleapis.com/youtube/v3/search'
        video_url = 'https://www.googleapis.com/youtube/v3/videos'
        print(request.POST.get('search'))
        search_params = {
            'part': 'snippet',
            'q': request.POST.get('search'),
            'key': settings.YOUTUBE_DATA_API_KEY,
            'maxResults': 10,
            'type': 'video'
        }

        r = requests.get(search_url, params=search_params)

        results = r.json()['items']

        video_ids = []
        for result in results:
            video_ids.append(result['id']['videoId'])

        # Seleccionar aleatoriamente tres IDs de video de los 20 obtenidos
        selected_video_ids = random.sample(video_ids, 3)

        video_params = {
            'key': settings.YOUTUBE_DATA_API_KEY,
            'part': 'snippet,contentDetails',
            'id': ','.join(selected_video_ids),
            'maxResults': 10
        }

        r = requests.get(video_url, params=video_params)

        results = r.json()['items']

        for result in results:
            video_data = {
                'title': result['snippet']['title'],
                'id': result['id'],
                'url': f'https://www.youtube.com/watch?v={ result["id"] }',
                'duration': int(parse_duration(result['contentDetails']['duration']).total_seconds() // 60),
                'thumbnail': result['snippet']['thumbnails']['high']['url']
            }

            videos.append(video_data)
        print(videos)
        context = {
            'videos': videos
        }
    return JsonResponse(context)


@login_required
def RegistrarPractica(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        username = data.get('username')  # Obtén el nombre de usuario
        tema_id = data.get('tema')
        puntaje = data.get('puntaje')
        preguntas_respondidas = data.get('preguntas_respondidas')

        print(username, tema_id, puntaje, preguntas_respondidas)
        try:
            usuario = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

        tema = Tema.objects.get(pk=tema_id)

        puntuacion = Puntuacion(usuario=usuario, tema=tema, puntaje=puntaje,
                                preguntas_respondidas=preguntas_respondidas)
        puntuacion.save()

        return JsonResponse({'mensaje': 'Puntuación guardada exitosamente'})
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)

@requires_csrf_token
def server_error(request):
    # Captura la excepción que causó el error 500
    try:
        # Tu código que genera la excepción
        # Por ejemplo, raise Exception("Error interno")
        raise Exception("Ocurrió un error interno en el servidor.")
    except Exception as e:
        # Obtén información adicional de la excepción
        error_message = str(e)  # Usa el mensaje de la excepción como información adicional

    return render(request, '500.html', {'error_message': error_message}, status=500)
