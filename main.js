$(document).ready(function() {
    call_ajax();
});

function call_ajax(met = 'GET', dat = {}, id = '', port = 4026) {
    $.ajax({
        url: 'http://157.230.17.132:' + port + '/sales' + id,
        method: met,
        data: dat,
        success: function(data) {
            var datas = create_data(data);
            //create_chart(datas);
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
        console.log(sale_m);
        var sale_a = sale.amount;
        var sale_s = sale.salesman;
        sales_t += sale_a;
        sales_ms[sale_m - 1] += sale_a;
        sales_q[Math.trunc((sale_m - 1) / 3)] += 1;
        if (!sales_s.hasOwnProperty(sale_s)) {
            sales_s[sale_s] = sale_a;
        } else {
            sales_s[sale_s] += sale_a;
        }
    }
    var sales_sa = [];
    var sales_sn = [];
    for (var key in sales_s) {
        sales_sn.push(key);
        sales_sa.push((sales_s[key] * 100 / sales_t).toFixed(2));
    }
    return({
        sm: {
            n: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
            a: sales_ms,
        },
        sq: {
            n: ['Q1', 'Q2', 'Q3', 'Q4'],
            a: sales_q,
        },
        ss: {
            n: sales_sn,
            a: sales_sa
        }
    })
}
