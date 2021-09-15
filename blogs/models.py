from django.db import models
# Create your models here.
class Bus(models.Model):
    id_bus = models.BigAutoField(primary_key=True)
    name_bus = models.CharField(max_length=40)
    img_front_bus = models.CharField(max_length=15)
    icon_bus = models.CharField(max_length=15)
    price = models.IntegerField()
    Time_start = models.CharField(max_length=5)
    Time_end = models.CharField(max_length=5)
    class Meta:
        db_table = 'Bus'

class Bus_stop(models.Model):
    id_busstop = models.BigAutoField(primary_key=True)
    name_busstop = models.CharField(max_length=80)
    latitude_busstop = models.FloatField()
    longitude_busstop = models.FloatField()
    class Meta:
        db_table = 'Bus_stop'

class Rout(models.Model):
    id_rout = models.BigAutoField(primary_key=True)
    id_bus = models.ForeignKey("Bus", on_delete=models.CASCADE, db_column="id_bus")
    id_busstop = models.ForeignKey("Bus_stop", on_delete=models.CASCADE, db_column="id_busstop")
    class Meta:
        db_table = 'Rout'

class Graph_busstop(models.Model):
    id = models.BigAutoField(primary_key=True)
    busstop_a = models.ForeignKey(to="Bus_stop", on_delete=models.CASCADE, related_name="busstop_a")
    busstop_b = models.ForeignKey(to="Bus_stop", on_delete=models.CASCADE, related_name="busstop_b")
    class Meta:
        db_table = 'Graph_busstop'