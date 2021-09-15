from django.shortcuts import render
import math
from blogs.models import Bus,Bus_stop,Rout
from blogs.serializers import busSerializer,busStopSerializer,routSerializer ,GraphBusstopSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
import json
import requests
from django.http import QueryDict


# This class represent a graph
class Graph:
    # Initialize the class
    def __init__(self, graph_dict=None, directed=True):
        self.graph_dict = graph_dict or {}
        self.directed = directed
        if not directed:
            self.make_undirected()

    # Create an undirected graph by adding symmetric edges
    def make_undirected(self):
        for a in list(self.graph_dict.keys()):
            for (b, dist) in self.graph_dict[a].items():
                self.graph_dict.setdefault(b, {})[a] = dist

    # Add a link from A and B of given distance, and also add the inverse link if the graph is undirected
    def connect(self, A, B, distance=1):
        self.graph_dict.setdefault(A, {})[B] = distance
        if not self.directed:
            self.graph_dict.setdefault(B, {})[A] = distance

    # Get neighbors or a neighbor
    def get(self, a, b=None):
        links = self.graph_dict.setdefault(a, {})
        if b is None:
            return links
        else:
            return links.get(b)

    # Return a list of nodes in the graph
    def nodes(self):
        s1 = set([k for k in self.graph_dict.keys()])
        s2 = set([k2 for v in self.graph_dict.values() for k2, v2 in v.items()])
        nodes = s1.union(s2)
        return list(nodes)


# This class represent a node
class Node:
    # Initialize the class
    def __init__(self, name: str, parent: str):
        self.name = name
        self.parent = parent
        self.g = 0  # Distance to start node
        self.h = 0  # Distance to goal node
        self.f = 0  # Total cost

    # Compare nodes
    def __eq__(self, other):
        return self.name == other.name

    # Sort nodes
    def __lt__(self, other):
        return self.f < other.f

    # Print node
    def __repr__(self):
        return ('({0},{1})'.format(self.name, self.f))


# A* search
def astar_search(graph, heuristics, start, end):
    # Create lists for open nodes and closed nodes
    open = []
    closed = []
    # Create a start node and an goal node
    start_node = Node(start, None)
    goal_node = Node(end, None)
    # Add the start node
    open.append(start_node)

    # Loop until the open list is empty
    while len(open) > 0:
        # Sort the open list to get the node with the lowest cost first
        open.sort()
        # Get the node with the lowest cost
        current_node = open.pop(0)
        # Add the current node to the closed list
        closed.append(current_node)

        # Check if we have reached the goal, return the path
        if current_node == goal_node:
            path = []
            while current_node != start_node:
                path.append(current_node.name)
                current_node = current_node.parent
            path.append(start_node.name)
            # Return reversed path
            return path[::-1]
        # Get neighbours
        neighbors = graph.get(current_node.name)
        # Loop neighbors
        for key, value in neighbors.items():
            # Create a neighbor node
            neighbor = Node(key, current_node)
            # Check if the neighbor is in the closed list
            if (neighbor in closed):
                continue
            # Calculate full path cost
            neighbor.g = current_node.g + graph.get(current_node.name, neighbor.name)
            neighbor.h = heuristics.get(neighbor.name)
            neighbor.f = neighbor.g + neighbor.h
            # Check if neighbor is in open list and if it has a lower f value
            if (add_to_open(open, neighbor) == True):
                # Everything is green, add neighbor to open list
                open.append(neighbor)
    # Return None, no path is found
    return None


# Check if a neighbor should be added to open list
def add_to_open(open, neighbor):
    for node in open:
        if (neighbor == node and neighbor.f > node.f):
            return False
    return True


# Create your views here.
def index(request):
    return render(request,'index.html')

def dataBusPage(request):
    return render(request,'dataBusPage.html')

def dataDetailBus(request):
    id = request.GET['id']
    return render(request,'dataDetailBus.html',{'id':id})


@api_view(['GET', 'POST', 'DELETE'])
def dataBus(request):
    if request.method == 'GET':
        results = Bus.objects.all()
        bus_serializer = busSerializer(results,many=True)
        return Response(bus_serializer.data)

@api_view(['GET', 'POST', 'DELETE'])
def dataBusStop(request):
    if request.method == 'GET':
        results = Bus_stop.objects.all()
        busStop_serializer = busStopSerializer(results,many=True)
        return Response(busStop_serializer.data)

@api_view(['GET', 'POST', 'DELETE'])
def dataCarFindMylocal(request):
    if request.method == 'GET':
        id = request.GET['data']
        return id

@api_view(['GET', 'POST', 'DELETE'])
def dataRout(request):
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


@api_view(['GET', 'POST', 'DELETE'])
def dataGraphBusstop(request):
    if request.method == 'GET':
        data = request.GET['data']
        dataList = json.loads(json.loads(json.dumps(data))) #รับค่าข้อมูลที่ส่งมา
        pointStart = dataList['start'] #รับค่าข้อมูลที่เป็น ต้นทาง
        pointEnd = dataList['end'] #รับค่าข้อมูลที่เป็น ปลายทาง
        locaNow = dataList['myLocation'] #รับค่าข้อมูลที่เป็น ต่ำแหน่งปัจุบัน
        cursor = connection.cursor()
        cursor.execute("""select
                                gb.busstop_a,
                                bs.name_busstop as nameA,
                                bs.latitude_busstop latitudeA,
                                bs.longitude_busstop longitudeA,
                                gb.busstop_b,
                                bss.name_busstop as nameB,
                                bss.latitude_busstop latitudeB,
                                bss.longitude_busstop longitudeB
                            from
                                Graph_busstop gb
                            left join Bus_stop bs on
                                gb.busstop_a = bs.id_busstop
                            left join Bus_stop bss on
                                gb.busstop_b = bss.id_busstop """) #เรียกข้อมูลจุดจอดจาก datqabase
        solution = cursor.fetchall()
        dataRout = []

        for row in solution:
            dataRout.append({'busstop_a': row[0], 'nameA': row[1], 'latitudeA': row[2], 'longitudeA': row[3],
                             'busstop_b': row[4], 'nameB': row[5], 'latitudeB': row[6], 'longitudeB': row[7]}) #จัดข้อมูลที่ได้จาก database

        cursor.execute("""select * from  Bus_stop bs""")  #เรียกข้อมูลจรถจาก datqabase
        solution = cursor.fetchall()

        # Graph = []
        # Create a graph
        graph = Graph()
        # Create heuristics (straight-line distance, air-travel distance)
        heuristics = {}
        for busStop in solution:
            distance_in_km = positDest(locaNow['lat'], locaNow['lng'], busStop[2], busStop[3]) #คำนวนหาระยะห่างระหว่างจูดจอดกับต่ำแหน่งปัจจุบัน
            for mapGraph in dataRout:
                graph.connect(mapGraph['nameA'], mapGraph['nameB'],positDest(mapGraph['latitudeA'], mapGraph['longitudeA'],
                                                                             mapGraph['latitudeB'], mapGraph['longitudeB'])) #สร้างกราฟโดยข้อมูลที่ได้มาจาก database
            heuristics[busStop[1]] = distance_in_km #เก็บค่าการคำนวนหาระยะห่างระหว่างจูดจอดกับต่ำแหน่งปัจจุบันลงใน heuristics

        nameStart = list(filter(lambda x: (x[0] == int(pointStart)), solution))[0] #หาข้อมูลต้นทาง
        nameEnd = list(filter(lambda x: (x[0] == int(pointEnd)), solution))[0]  #หาข้อมูลปลายทาง

        path = astar_search(graph, heuristics, nameStart[1], nameEnd[1])  #เรียกใช้ astar_search เพื่อหาเส้นทาง
        pathStr = str(path).replace("[", "")
        pathStr = pathStr.replace("]", "")
        if path is not None: #เช็คหากหาเส้นได้จะข้อมูลนี้ไปหารายละเอียดรถจาก database
            cursor.execute("""SELECT b.id_bus,b.name_bus ,b.icon_bus ,bs.id_busstop ,bs.name_busstop  from
                                Rout r ,
                                Bus b ,
                                Bus_stop bs
                            where
                                r.id_bus = b.id_bus
                                and r.id_busstop = bs.id_busstop
                                and bs.name_busstop in("""+pathStr+""")""")#หาข้อมูลรายละเอียดจุดจอดจาก database
            routBus = cursor.fetchall()
            cursor.execute("""SELECT DISTINCT b.id_bus,b.name_bus  from
                                        Rout r ,
                                        Bus b ,
                                        Bus_stop bs
                                    where
                                        r.id_bus = b.id_bus
                                        and r.id_busstop = bs.id_busstop
                                        and bs.name_busstop in(""" + pathStr + """) order by b.id_bus""")#หาข้อมูลรายละเอียดรถจาก database
            Bus = cursor.fetchall()
            sortRoutBus = []
            for i in path:
                for n in routBus:
                    if i == n[4]:
                        sortRoutBus.append(n)
            selectBus = {}
            for i in Bus:
                selectBus[i[1]] = []
                for n in sortRoutBus:
                    if i[0]==n[0]:
                        selectBus[i[1]].append(n)
            print(selectBus)
            cursor.execute("""SELECT bs.name_busstop,bs.latitude_busstop , bs.longitude_busstop from                
                                            Bus_stop bs
                                        where
                                            bs.name_busstop in(""" + pathStr + """)""")#หาข้อมูลรายละเอียดจุดจอดจาก database
            routBusStop = cursor.fetchall()
            pathBus = []
            for i in path :
                for n in routBusStop :
                    if i==n[0] :
                        pathBus.append(n)
            dataAll = {'rout':pathBus,'bus':selectBus} #เก็บค่าข้อมลรถและจุจอดไว้ใน dataAll
            return Response(dataAll)
        else: return Response('')


def positDest(lat1, lon1, lat2, lon2): # หาระยะทางที่ยาวกันระหว่างจุดสองจุด
    radius = 6371  # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    d = radius * c
    return d


