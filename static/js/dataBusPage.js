var dataBus = [];
var dataRout = [];
$(document).ready(function () {
    $('.dv-spinner').show();
    $.when(
        $.ajax({
            type: "GET",
            url: "/api/bus",
            success: function (data) {
                console.log("success");
                console.log(data);
                dataBus = data;
            },
            failure: function (data) {
                console.log("failure");
                console.log(data);
            },
        })).then(function (v) {
        showBusData(dataBus);
        $('.dv-spinner').hide();
    });
    if (id !== '' && id !== undefined && id !== null) {
        $('.dv-spinner').show();
        $.when(
            $.ajax({
                type: "GET",
                url: "/api/rout?id=" + id,
                success: function (data) {
                    console.log("success");
                    console.log(data);
                    dataRout = data;
                },
                failure: function (data) {
                    console.log("failure");
                    console.log(data);
                    $('.dv-spinner').hide();
                },
            })).then(function (v) {
            dataDetailBusRout(dataRout);
            $('.dv-spinner').hide();
        });
    } else {
        $('.dv-spinner').hide();
    }
});

showBusData = function (data) {
    //ส่วนที่1 นำข้อมูลรถมาวนลูปเพื่อแสดงรายชื่อรถแต่ละคัน
    $.each(data, function (k, v) {
        $('#listData').append('          <div class="col-md-6 col-xl-3">\n' +
            '                                <div class="card widget-card-1">\n' +
            '                                    <div class="card-block-small" style=" background-color:">\n' +
            '                                        <i class="icofont icofont-pie-chart  card1-icon">\n' +
            '                                          <img src="/static/carIcon/' + v.icon_bus + '.png" onclick="dataDetail(' + v.id_bus + ')" height="140px">\n' +
            '                                        </i>\n' +
            '                                        <h4><b>' + v.name_bus + '</b></h4>\n' +
            '                                        <h5><b>' + v.Time_start + ' - ' + v.Time_end + '</b></h5>\n' +
            '                                        <div>\n' +
            '                                            <span class="f-left m-t-10 text-muted"><i\n' +
            '                                                    class="text-c-blue f-20 icofont icofont-arrow-up m-r-10"></i>คลิ๊กเพื่อดูรายละเอียด</span>\n' +
            '                                        </div>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                            </div>')
    })
};

dataDetail = function (idBus) {
    console.log(idBus)
    window.location = "/dataDetailBus/?id=" + idBus + "";
}


dataDetailBusRout = function (data) {
    //ส่วนที่1 นำข้อมูลรถมาวนลูปเพื่อแสดงข้อมูลรายละเอียดรถสองแถวแต่ละคัน
    $.each(data, function (k, v) {
        $('.busRout').append(
            '                 <div class="col-md-2 "style="text-align: right">' + (k + 1) + ' :</div>\n' +
            '                 <div class="col-md-10">' + v.name_busstop + ' </div>'//แสดงชื่อจุดจอด
        )
    })
    //ส่วนที่1//
    //ส่วนที่2 เรียกใช้งาน google map
    initMap(data);
    //ส่วนที่2//
    //ส่วนที่3 รายละเอียดรถ
    var dataBusDetail = dataBus.filter(v => v.id_bus === id)
    dataBusDetail = dataBusDetail[0]
    $('.nameBus').append(dataBusDetail.name_bus) //แสดงชื่อรถ
    $('.timeBus').append(dataBusDetail.Time_start + ' ถึง ' + dataBusDetail.Time_end)//แสดงเวลาเดินรถ
    $('.priceBus').append(dataBusDetail.price + ' บาท ตลอดสาย')//แสดงราคา
    if (dataBusDetail.icon_bus !== '' && dataBusDetail.icon_bus !== undefined && dataBusDetail.icon_bus !== null) {
        $('#iconCar').empty();
        $('#iconCar').append('<img src="/static/carIcon/' + dataBusDetail.icon_bus + '.png" alt="Paris" height="150px" >');//แสดง icon
    } else {
        $('#iconCar').empty();
        $('#iconCar').append('<div>ไม่มีรูป</div>');
    }
    if (dataBusDetail.img_front_bus !== '' && dataBusDetail.img_front_bus !== undefined && dataBusDetail.img_front_bus !== null) {
        $('#fontCar').empty();
        $('#fontCar').append('<img src="/static/fontCar/' + dataBusDetail.img_front_bus + '.jpg"alt="Cinque Terre">');//แสดงรูปหน้ารถ
    } else {
        $('#fontCar').empty();
        $('#fontCar').append('<div>ไม่มีรูป</div>');
    }
    //ส่วนที่3//
}

function initMap(data) {
    var mapOptions = {
        center: {lat: 14.974698, lng: 102.097937},
        zoom: 13,
    }

    var maps = new google.maps.Map(document.getElementById("GoogleMap"), mapOptions);

    $.each(data, function (k, v) {
        var marker = new google.maps.Marker({
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
    })
}