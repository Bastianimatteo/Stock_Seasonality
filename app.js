var count = [0,0,0,0,0,0,0,0,0,0,0,0]
var count_neg = [0,0,0,0,0,0,0,0,0,0,0,0]
var count_pos = [0,0,0,0,0,0,0,0,0,0,0,0]
var changes = [0,0,0,0,0,0,0,0,0,0,0,0]

var response, timestamp, open, close = []

const tb = document.getElementById("tbody")
const tb_change = document.getElementById("tbody_change")
const n_months = document.getElementById("n_months")
const spinner = document.getElementById("spinner")
spinner.style.visibility = "hidden"

document.getElementById("form").addEventListener("submit", function(event) {
    event.preventDefault();

    spinner.style.visibility = "visible"

    tb.innerHTML = ""
    tb_change.innerHTML = ""

    const ticker = document.getElementById("ticker").value;
    const year1 = document.getElementById("period1").value;
    const year2 = document.getElementById("period2").value;

    const period1 = getTimestamp(year1, 0)
    const period2 = getTimestamp(year2, 1)

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker + "?period1=" + period1 + "&period2=" + period2 + "&interval=1mo&events=history&includeAdjustedClose=false")
    xhttp.send();
    xhttp.onreadystatechange = function()
    {
        if(xhttp.readyState == 4 && xhttp.status == 200)
        {
            response = JSON.parse(xhttp.response)
            if(response.chart.result[0].indicators.quote[0].open)
            {
                timestamp = response.chart.result[0].timestamp
                open = response.chart.result[0].indicators.quote[0].open
                close = response.chart.result[0].indicators.quote[0].close

                tb.innerHTML = "";
                count = [0,0,0,0,0,0,0,0,0,0,0,0]
                count_neg = [0,0,0,0,0,0,0,0,0,0,0,0]
                count_pos = [0,0,0,0,0,0,0,0,0,0,0,0]
                changes = [0,0,0,0,0,0,0,0,0,0,0,0]

                n_months.innerHTML = "Analyzed months: " + timestamp.length

                for(let i = 0; i < timestamp.length; i++)
                {
                    if(open[i] && close[i])
                    {
                        const timestamp_date = new Date(timestamp[i] * 1000)
                        const month = (timestamp_date.getMonth()).toString()
                        const year = timestamp_date.getFullYear().toString()

                        save_month(month, ((close[i] - open[i]) / open[i] * 100));

                        const date = getNomeMese(month) + " " + year

                        fill_table(date, open[i].toFixed(2), close[i].toFixed(2), ((close[i] - open[i]) / open[i] * 100).toFixed(2) + " %")
                    }
                }

                fill_table_change()

                select_list()
                colors()

                spinner.style.visibility = "hidden"
            }
            else
            {
                tb.innerHTML = ""
                tb_change.innerHTML = ""
                n_months.innerHTML = "Analyzed months: 0"

            }
        }
        else
        {
            if(xhttp.status == 404)
                spinner.style.visibility = "hidden"
        }
    }
})

function select_change()
{
    const sel = document.getElementById("select").value
    tb.innerHTML = ""

    for(let i = 0; i < timestamp.length; i++)
    {
        if(open[i] && close[i])
        {
            const timestamp_date = new Date(timestamp[i] * 1000)
            const month = (timestamp_date.getMonth()).toString()
            const year = timestamp_date.getFullYear().toString()
            const date = getNomeMese(month) + " " + year

            if(sel == -1)
            {
                fill_table(date, open[i].toFixed(2), close[i].toFixed(2), ((close[i] - open[i]) / open[i] * 100).toFixed(2) + " %")
            }
            else
            {
                if(month == sel)
                {   
                    fill_table(date, open[i].toFixed(2), close[i].toFixed(2), ((close[i] - open[i]) / open[i] * 100).toFixed(2) + " %")
                }
            }
        }
    }
    
}


function save_month(month, change)
{
    changes[month] = (changes[month] + change)
    count[month] = count[month] +1;

    if(change < 0)
        count_neg[month] = count_neg[month] +1
    else
        count_pos[month] = count_pos[month] +1
}

function getNomeMese(numeroMese) {
    const date = new Date();
    date.setMonth(numeroMese);
  
    const nomeMese = new Intl.DateTimeFormat('en-EN', { month: 'long' }).format(date);
  
    return nomeMese;
  }

function getTimestamp(year, period) {
    var date
    if(period == 0)
        date = new Date(year, 0, 1, 0, 0, 0, 0)
    else
        date = new Date(year, 12, 31, 0, 0, 0, 0)

    var timestamp = date.getTime();

    var timestampInSeconds = Math.floor(timestamp / 1000);

    return timestampInSeconds;
}

function colors(){
    var tr = tb_change.getElementsByTagName("tr");

    for(let i=0; i<tr.length; i++)
    {
        var td = tr[i].getElementsByTagName("td");
        if(changes[i] > 0)
        {
            td[1].style.color = "green"
        }
        else
        {
            td[1].style.color ="red";
        }
    }

    var now = new Date().getMonth();
    tr[now].style.backgroundColor = "lightyellow"
}

function select_list()
{
    const select = document.getElementById("select")
    var options = [];

    for(let i = 0; i<count.length; i++)
    {
        if(count[i] > 0)
        {
            options.push(i)
        }
    }

    select.innerHTML = "<option value='-1'>All</option>"

    for(let i = 0; i<options.length; i++)
    {
        var opt = options[i]
        var el = document.createElement("option")
        el.textContent = getNomeMese(opt)
        el.value = opt
        select.appendChild(el)
    }
}

function fill_table_change()
{
    tb_change.innerHTML = "";
    for(var i = 0; i<changes.length; i++)
    {
        var row = tb_change.insertRow();

        var cell_month = row.insertCell();
        var cell_change_month = row.insertCell();
        var cell_neg = row.insertCell();
        var cell_pos = row.insertCell();
        var cell_percent = row.insertCell();

        cell_month.innerHTML = getNomeMese(i)

        cell_change_month.innerHTML = (changes[i] / count[i]).toFixed(2) + " %"

        cell_neg.innerHTML = count_neg[i]

        cell_pos.innerHTML = count_pos[i]

        cell_percent.innerHTML = (count_pos[i]/(count_neg[i] + count_pos[i])*100).toFixed(0) + " %"
    }
}

function fill_table(date, open, close, change)
{
    var row = tb.insertRow()

    var cell_date = row.insertCell()
    var cell_open = row.insertCell()
    var cell_close = row.insertCell()
    var cell_change = row.insertCell()

    cell_date.innerHTML = date

    cell_open.innerHTML = open

    cell_close.innerHTML = close

    cell_change.innerHTML = change
}
