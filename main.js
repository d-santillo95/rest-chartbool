$(document).ready(function() {
    call_ajax();
    $('#rec').click(function() {
        var name = $('#input-name').val().trim().toLowerCase();
        var amm = parseInt($('#input-amount').val());
        var d = moment($('#input-date').val(), 'YYYY-MM-DD');
         $('#input-name').val('');
         $('#input-amount').val('');
         $('#input-date').val('');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        d = d.format('DD/MM/YYYY');
        var dat = {
            amount: amm,
            salesman: name,
            date: d
        };
        call_ajax('POST', dat);
    });

    $('.container-sales').on( "mouseenter", 'i', function(e) {
        $(e.target).closest('.row').addClass('active');
    });

    $('.container-sales').on( "mouseleave", 'i', function(e) {
        $(e.target).closest('.row').removeClass('active');
    });

    $('.container-sales').on( "click", 'i', function(e) {
        $(e.target).closest('.row').addClass('removed');
        var id ='/';
        id += $(e.target).closest('.delete').prev('.sale-details').attr('data-id');
        setTimeout(call_ajax, 550, "DELETE", {}, id);
    });
});

function call_ajax(met = 'GET', dat = {}, id = '', port = 4026) {
    $.ajax({
        url: 'http://157.230.17.132:' + port + '/sales' + id,
        method: met,
        data: dat,
        success: function(data) {
            if (met == 'GET') {
                $('.container-sales').html('');
                $('.container-chart-m').html('<canvas id="chart-m"></canvas>')
                $('.container-chart-s').html('<canvas id="chart-s"></canvas>')
                $('.container-chart-q').html('<canvas id="chart-q"></canvas>')
                var datas = create_data(data);
                for (var key in datas) {
                    switch (key) {
                        case 'm':
                            create_line_chart(datas.m);
                            break;
                        case 's':
                            create_pie_chart(datas.s);
                            break;
                        case 'q':
                            create_bar_chart(datas.q);
                            break;
                    }
                }
            } else {
                call_ajax();
            }
        },
        error: function() {
            console.log('error');
        }
    });
}

function create_data(data) {
    var sales_ms = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var sales_q = [0, 0, 0, 0];
    var sales_s = {};
    var sales_t = 0;
    for (var i = 0; i < data.length; i++) {
        var sale = data[i];
        var sale_d = moment(sale.date, 'DD/MM/YYYY');
        var sale_m = sale_d.format('M');
        var sale_a = parseInt(sale.amount);
        var sale_s = sale.salesman;
        sales_t += sale_a;
        sales_ms[sale_m - 1] += sale_a;
        sales_q[Math.trunc((sale_m - 1) / 3)] += 1;
        if (!sales_s.hasOwnProperty(sale_s)) {
            sales_s[sale_s] = sale_a;
        } else {
            sales_s[sale_s] += sale_a;
        }
        var template = Handlebars.compile($('#sale-template').html());
        $('.container-sales').append(template(sale));
    }
    var sales_sa = [];
    var sales_sn = [];
    for (var key in sales_s) {
        sales_sn.push(key);
        sales_sa.push((sales_s[key] * 100 / sales_t).toFixed(2));
    }
    return({
        m: {
            n: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
            a: sales_ms,
        },
        q: {
            n: ['Q1', 'Q2', 'Q3', 'Q4'],
            a: sales_q,
        },
        s: {
            n: sales_sn,
            a: sales_sa
        }
    })
}

function create_line_chart(datas) {
    var myChart = new Chart($('#chart-m')[0].getContext('2d'), {
        type: 'line',
        data: {
            labels: datas.n,
            datasets: [{
                label: 'importi vendite',
                data: datas.a,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: 'rgba(255, 99, 132, 1)',
                borderColor: ['rgb(75, 192, 192)'],
                borderWidth: 3,
                fill: false
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label + ': ';
                        label += tooltipItem.yLabel;
                        label += ' €';
                        return label;
                    }
                }
            }
        }
    });
}

function create_pie_chart(datas) {
    var myChart = new Chart($('#chart-s')[0].getContext('2d'), {
        type: 'pie',
        data: {
            labels: datas.n,
            datasets: [{
                label: 'percentuale vendite',
                data: datas.a,
                backgroundColor: [
                'rgb(54, 162, 235)',
                'rgb(255, 99, 132)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)'
            ],
            borderColor: [
                'rgb(255, 255, 255)'
            ],
            borderWidth: 3
            }]
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.labels[tooltipItem.index] + ': ';
                        label += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        label += '%';
                        return label;
                    }
                }
            }
        }
    });
}

function create_bar_chart(datas) {
    var myChart = new Chart($('#chart-q')[0].getContext('2d'), {
        type: 'bar',
        data: {
            labels: datas.n,
            datasets: [{
                label: 'numero vendite',
                data: datas.a,
                backgroundColor: [
                'rgb(54, 162, 235)',
                'rgb(255, 99, 132)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)'
            ],
            borderColor: [
                'rgb(54, 162, 235)',
                'rgb(255, 99, 132)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)'
            ],
            borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
