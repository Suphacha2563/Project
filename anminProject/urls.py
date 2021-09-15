from django.conf.urls import url
from anminProject import views

urlpatterns = [
    url(r'^login$', views.login),
    url(r'^dataBusEdit$', views.dataBusEdit),
    url(r'^dataBusCreate$', views.dataBusCreate),
]