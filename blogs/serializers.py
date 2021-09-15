from rest_framework import serializers
from blogs.models import Bus,Bus_stop,Rout ,Graph_busstop


class busSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ('__all__')

class busStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus_stop
        fields = ('__all__')

class routSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rout
        fields = ('__all__')

class GraphBusstopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Graph_busstop
        fields = ('__all__')