var dataBus = [];
$(document).ready(function () {
    $('.dv-spinner').show();
    $.when(
        $.ajax({
            type: "GET",
            url: "/api/bus",
            success: function (data) {
                console.log("success");
                console.log(data);
                dataBus = data
                showDataBus(data);
            },
            failure: function (data) {
                console.log("failure");
                console.log(data);
            },
        })).then(function (v) {
        $('.dv-spinner').hide();
    });
});

showDataBus = function (data) {
    var table = $('#myTable').DataTable({
        data: data,
        "lengthChange": false,
        "ordering": false,
        columns: [
            {title: 'ชื่อรถ', data: 'name_bus'},
            {title: 'รูปหน้ารถ', data: 'img_front_bus'},
            {title: 'icon', data: 'icon_bus'},
            {title: 'ราคา', data: 'price'},
            {
                title: 'เวลา', data: function (row) {
                    return row.Time_start + '-' + row.Time_end
                }
            },
            {
                title: 'แก้ไข้/ลบ', data: function (row) {
                    return '<button class="btn btn-warning edit" style="font-weight: bold;font-size: 15px"\n' +
                        '                                                    id="edit" onClick="modalDetail('+row.id_bus+')"><i\n' +
                        '                                                    <i class="icofont icofont-ui-edit"></i>\n' +
                        '                                            </button>' +
                        '                               <button class="btn btn-danger delete" style="font-weight: bold;font-size: 15px"\n' +
                        '                                                    id="delete' + row.id_bus + '" ><i\n' +
                        '                                                    <i class="icofont icofont-ui-delete"></i>\n' +
                        '                                            </button>'
                }
            }
        ]
    });

    $('#myTable tbody ').on('click', '.delete', function () {
        swal({
            title: "คำเตือน",
            text: "ต้องการลบใช่หรือไม่ ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
            cancelButtonColor: "#DD6B55",
            closeOnConfirm: false,
            closeOnCancel: true
        }).then(result => {
            if (result.value) {
                swal({
                    title: "สำเส็จ",
                    text: "",
                    type: "success"
                })
                console.log($(this).closest('tr').index());
                table.row($(this).closest('tr').index()).remove().draw(false);
                // dataBus.splice(k, 1);
            }
        })
    })
}

modalDetail = function (v) {
    var index = dataBus.findIndex(obj => (obj.id_bus=== v));
    console.log(index)
    $('#nameBus').text(dataBus[index].name_bus);
    $('.nameBus').val(dataBus[index].name_bus) //แสดงชื่อรถ
    $('.timeBusStart').val(dataBus[index].Time_start )
    $('.timeBusEnd').val(dataBus[index].Time_end)
    $('.priceBus').val(dataBus[index].price + ' บาท ตลอดสาย')//แสดงราคา
    $('.dv-spinner').show();
        $.when(
            $.ajax({
                type: "GET",
                url: "/api/rout?id=" + v,
                success: function (data) {
                    console.log("success");
                    console.log(data);
                },
                failure: function (data) {
                    console.log("failure");
                    console.log(data);
                    $('.dv-spinner').hide();
                },
            })).then(function (v) {
            $('.dv-spinner').hide();
        });
    $('#kt_modal').modal('show');
}