from django.urls import path

from . import views

app_name = "tutoBlog"

urlpatterns = [
    path("", views.login_page, name="login"),
    path("ueberblick/", views.hr_dashboard, name="hr-dashboard"),
    path("schulungen/", views.hr_tutorials, name="hr-tutorials"),
    path("schulungen/bearbeiten/", views.hr_editor, name="hr-editor"),
    path("zuordnung/", views.hr_zuweisung, name="hr-zuweisung"),
    path("meine/", views.ma_dashboard, name="ma-dashboard"),
    path("lernen/", views.ma_tutorial, name="ma-tutorial"),
]
