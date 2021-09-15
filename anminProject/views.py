from django.shortcuts import render

from blogs.models import Bus,Bus_stop,Rout
from blogs.serializers import busSerializer,busStopSerializer,routSerializer ,GraphBusstopSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection

# Create your views here.
def login(request):
    return render(request, 'login.html')

def dataBusEdit(request):
    return render(request, 'dataBusEdit.html')

def dataBusCreate(request):
    return render(request, 'dataBusCreate.html')

@api_view(['GET', 'POST', 'DELETE'])
def dataBusRout(request):
    if request.method == 'GET':
        id = request.GET['id']
        cursor = connection.cursor()
        cursor.execute( """SELECT b.id_bus ,b.name_bus ,bs.name_busstop ,bs.latitude_busstop , bs.longitude_busstop from Rout r 
                            left join Bus b 
                            on r.id_bus = b.id_bus 
                            left join Bus_stop bs 
                            on r.id_busstop = bs.id_busstop WHERE b.id_bus = %s order by b.id_bus """,id)
        solution = cursor.fetchall()
        dataRout =[]

        for row in solution:
            dataRout.append({'id_bus': row[0],'name_bus': row[1],'name_busstop': row[2],'latitude_busstop': row[3],'longitude_busstop': row[4]})

        return Response(dataRout)