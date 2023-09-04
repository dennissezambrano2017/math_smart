# Generated by Django 4.2.4 on 2023-09-03 23:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import tasks.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Contenido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('descripcion', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Unidad',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Tema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('contenido', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tasks.contenido')),
            ],
        ),
        migrations.CreateModel(
            name='Puntuacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('puntaje', models.CharField(default='0/0', max_length=10)),
                ('preguntas_respondidas', models.CharField(default='0/0', max_length=10)),
                ('tema', models.ForeignKey(default=9, on_delete=django.db.models.deletion.CASCADE, to='tasks.tema')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Material',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('enlace', models.URLField()),
                ('archivo_pdf', models.FileField(default='default.pdf', upload_to='pdfs/', validators=[tasks.models.validate_pdf_extension, tasks.models.validate_pdf_size])),
                ('tema', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tasks.tema')),
            ],
        ),
        migrations.CreateModel(
            name='Ejercicio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('enunciado', models.TextField()),
                ('opciones', models.JSONField()),
                ('respuesta_correcta', models.IntegerField()),
                ('material', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='tasks.material')),
            ],
        ),
        migrations.AddField(
            model_name='contenido',
            name='unidad',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tasks.unidad'),
        ),
    ]