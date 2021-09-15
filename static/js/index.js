var map;
var dataBus;
var myLocation = {
    lat: -34.397,
    lng: 150.644
};
var marker = [];
var busStop = {};
var dataBusStop = {};
$(document).ready(function () {
    $.when(
        $('.dv-spinner').show(),
        $.ajax({
            type: "GET",
            url: "/api/busStop",
            success: function (data) {
                console.log("success");
                console.log(data);
                busStop = data;
                selectInitiate(busStop);
                selectDestination(busStop);
                $('.dv-spinner').hide();
            },
            failure: function (data) {
                console.log("failure");
                console.log(data);
                $('.dv-spinner').hide();
            },
        })).then(function (v) {
        initMap();
        $('.dv-spinner').hide();
    });

})
selectInitiate = function (data) {
    $.each(data, function (k, v) {
        $('#initiate').append('<option value="' + v.id_busstop + '">' + v.name_busstop + '</option>')
    });
    $("#initiate").selectize({});
}
selectDestination = function (data) {
    $.each(data, function (k, v) {
        $('#destination').append('<option value="' + v.id_busstop + '">' + v.name_busstop + '</option>')
    });
    $("#destination").selectize({});
}

$('#searchRout').on('click', function () {
    var initiate = $("#initiate").val();
    var destination = $("#destination").val();
    initMap();
    if (initiate === '' || destination === '') {
        if (initiate === '') {
            swal({
                title: "กรุณาเลือก",
                text: "ต้นทาง",
                type: "warning"
            });
        } else {
            swal({
                title: "กรุณาเลือก",
                text: "ปลายทาง",
                type: "warning"
            });
        }
    } else if (initiate === destination || destination === initiate) {
        swal({
            title: "กรุณาเลือก",
            text: "จุดจอดรถสองแถวที่ต่างกัน",
            type: "warning"
        });
    } else {
        var data = {'start': initiate, 'end': destination, 'myLocation': myLocation}
        console.log(data)
        $('.dv-spinner').show();
        $.when(
            $.ajax({
                type: "GET",
                url: "/api/dataGraphBusstop",
                data: {'data': JSON.stringify(data)},
                dataType: "json",
                contentType: "application/json",
                success: function (data) {
                    console.log("success");
                    console.log(data);
                    dataBusStop = data;
                },
                failure: function (data) {
                    console.log("failure");
                    console.log(data);
                    $('.dv-spinner').hide();
                },
            })).then(function (v) {
            showBusData(dataBusStop);
            showBusData1(dataBusStop.bus);
            $('.dv-spinner').hide();
        })
    }
    console.log(initiate, '->', destination);
})

showBusData = function (data) {
    $('#busRout').empty()
    if (data !== '') {
        $('#busRout').append('<div class="col-md-12">\n' +
            '                                          <h3 style="text-align: center"> <button class="btn btn-success" style="font-weight: bold; "\n' +
            '                                                    id="showFindRout"><i\n' +
            '                                                    class="icofont icofont-compass icofont-lg"></i>แสดงผลการค้นหาบนแผนที่\n' +
            '                                            </button></h3> \n' +
            '                                        </div>')
        $.each(data.rout, function (k, v) {
            $('#busRout').append(
                '                 <div class="col-md-2 "style="text-align: right">' + (k + 1) + ' :</div>\n' +
                '                 <div class="col-md-10">' + v[0] + ' </div>'
            )
        });
        $('#showFindRout').on('click', function () {
            initMap1(dataBusStop);
            $('#showFindRout').prop('disabled', true);
            ;
        })
    } else {
        swal({
            title: "ไม่พบเส้นทาง",
            type: "error"
        });
        $('#busRout').append('<div class="col-md-12 ">ไม่พบเส้นทาง</div>')
    }
};

initMap = function () {
    $('#listData1').empty();
    //ส่วนที่1 เรียกใช้งาน google map และกำหนดขนานขของ map
    var maps = new google.maps.Map(document.getElementById('GoogleMap'), {
        zoom: 15,
        center: myLocation,
        mapTypeId: 'roadmap'
    });
    //ส่วนที่1//
    //ส่วนที่2 เรียกใช้ function navigator.geolocation เพื่อระบุพิกัด latitude, longitude ตำแหน่งปัจจุบัน
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            // myLocation.lat = position.coords.latitude;
            // myLocation.lng = position.coords.longitude;
            myLocation.lat = 14.988935;
            myLocation.lng = 102.117157;

            // ทำ marker บน map จากตำแหน่งที่ได้มาจาก function navigator
            marker = new google.maps.Marker({
                position: myLocation,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillOpacity: 1,
                    strokeWeight: 2,
                    fillColor: '#5384ED',
                    strokeColor: '#ffffff',
                },
                draggable: true,
                animation: google.maps.Animation.DROP,
                map: maps,
                title: 'ต่ำแหน่งของคุณ'
            });
            //สร้างวงกลมบน map โดยมีจุดศูนย์กลางเป็นตำแหน่งปัจจุบัน
            var shellCircle = new google.maps.Circle({
                map: maps,
                strokeColor: '#0088ff',
                strokeOpacity: 0.5,
                strokeWeight: 3,
                center: myLocation
            });

            //ส่วนที่2 //
            //ส่วนที่3 ทำ marker บน map ตำแหน่งที่ใกล้ตำแหน่งปัจจุบัน
            var findMyPoss = findMyPos(myLocation.lat, myLocation.lng, busStop);
            $.each(findMyPoss, function (k, v) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(v.latitude_busstop, v.longitude_busstop),
                    map: maps,
                    title: v.name_busstop
                });
                info = new google.maps.InfoWindow();

                google.maps.event.addListener(marker, 'click', (function (marker, k) {
                    return function () {
                        info.setContent(v.name_busstop);
                        info.open(maps, marker);
                    }
                })(marker, k));
            });
            maps.setCenter(myLocation);//กำหนดกึ่งกลางของ map
            shellCircle.setRadius(700);//กำหนดขนานของวงกลมบน map โดยมีจุดศูนย์กลางเป็นตำแหน่งปัจจุบัน
        }, function () {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    console.log(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

findMyPos = function (lat, long, data) {
    var dataRoutMyLocal = []
    //วนลูปข้อมูลจุอดทั้งเพื่อคำนวนหาจุดจอดที่อยู่ภายในรัศมี 700 เมตร
    $.each(data, function (k, v) {
        var X = Math.pow(v.latitude_busstop - lat, 2)
        var Y = Math.pow(v.longitude_busstop - long, 2)
        var R = 6371;
        var lat1 = lat;
        var lat2 = v.latitude_busstop;
        var lon1 = long;
        var lon2 = v.longitude_busstop;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        if (d < 0.7) {
            dataRoutMyLocal.push(v);
        }
    });
    console.log(dataRoutMyLocal);
    return dataRoutMyLocal
};

showCar = function (v) {
    $('#showBus').append(
        '                          <div class="col-md-12">\n' +
        '                                <div class="card widget-card-1">\n' +
        '                                    <div class="card-block-small">\n' +
        '                                        <i class="icofont icofont-pie-chart  card1-icon"><img src="/static/carIcon/' + v.icon_bus + '.png" onclick="dataDetail(' + v.id_bus + ')"height="140px"></i>\n' +
        '                                        <h4><b>' + v.name_bus + '</b></h4>\n' +
        '                                        <h5><b>' + v.Time_start + ' - ' + v.Time_end + '</b></h5>\n' +
        '                                        <div>\n' +
        '                                            <span class="f-left m-t-10 text-muted"><i\n' +
        '                                                    class="text-c-blue f-20 icofont icofont-arrow-up m-r-10"></i>คลิ๊กเพื่อดูรายละเอียด</span>\n' +
        '                                        </div>\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                            </div>'
    )
}

function initMap1(data) {
    $('#GoogleMap').empty();
    //ส่วนที่1 เรียกใช้งาน google map และกำหนดขนานขของ map
    var maps = new google.maps.Map(document.getElementById("GoogleMap"), {
        zoom: 15,
        center: myLocation,
        mapTypeId: 'roadmap'
    });
    //ส่วนที่1//
    //ส่วนที่2 เรียกใช้ function navigator.geolocation เพื่อระบุพิกัด latitude, longitude ตำแหน่งปัจจุบัน
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            myLocation.lat = position.coords.latitude;
            myLocation.lng = position.coords.longitude;
        })
        //ส่วนที่2 //
        //ส่วนที่3 ทำ marker บน map จากตำแหน่งที่ได้มาจาก function navigator
        marker = new google.maps.Marker({
            position: myLocation,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillOpacity: 1,
                strokeWeight: 2,
                fillColor: '#5384ED',
                strokeColor: '#ffffff',
            },
            draggable: true,
            animation: google.maps.Animation.DROP,
            map: maps,
            title: 'ต่ำแหน่งของคุณ'
        });
        //สร้างวงกลมบน map โดยมีจุดศูนย์กลางตำแหน่งปัจจุบัน
        var shellCircle = new google.maps.Circle({
            map: maps,
            strokeColor: '#0088ff',
            strokeOpacity: 0.5,
            strokeWeight: 3,
            center: myLocation
        });
        //ส่วนที่3//
        //ส่วนที่4
        $.each(data.rout, function (k, v) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(v[1], v[2]),
                map: maps,
                title: v[0],
                icon: '/static/Google-Maps-Markers-master/images/marker_green' + (k + 1) + '.png'
            });
            info = new google.maps.InfoWindow();

            google.maps.event.addListener(marker, 'click', (function (marker, k) {
                return function () {
                    info.setContent(v[0]);
                    info.open(maps, marker);
                }
            })(marker, k));
        })
        myLocation.lat = data.rout[0][1];
        myLocation.lng = data.rout[0][2]
        maps.setCenter(myLocation);
        shellCircle.setRadius(700);
    }
}

showBusData1 = function (data) {
    $('#listData1').empty();
    $.each(data, function (k, v) {

        var nameBusStop = '';
        $.each(v, function (key, val) {
            nameBusStop +=
                '                 <div>' + (key + 1) + ' : ' + val[4] + ' </div>';
        })
        $('#listData1').append('          <div class="col-md-6 col-xl-4">\n' +
            '                                <div class="card widget-card-1">\n' +
            '                                    <div class="card-block-small" style=" background-color:">\n' +
            '                                        <i class="icofont icofont-pie-chart  card1-icon">\n' +
            '                                          <img src="/static/carIcon/' + v[0][2] + '.png" height="140px">\n' +
            '                                        </i>\n' +
            '                                        <h4><b>' + k + '</b></h4>\n' +
            '                                        <h5 style="text-align: left"><b>' + nameBusStop + '</b></h5>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                            </div>')

    });
};