from django.conf.urls import url
from blogs import views

urlpatterns = [
    url(r'^api/bus$', views.dataBus),
    url(r'^api/busStop$', views.dataBusStop),
    url(r'^api/dataGraphBusstop$', views.dataGraphBusstop),
    url(r'^api/rout$', views.dataRout),
    url(r'^api/dataCarFindMylocal$', views.dataCarFindMylocal,name='data'),
]