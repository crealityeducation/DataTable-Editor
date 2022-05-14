// GV to hold the table instance
let myDTs = {};

/* function to create editable datatable and add to the html div dynamically. 
*It returns the function that need to be called. Give meaningful name to the table id. 
*/
function crtEDTBL(divid, tblid) {
  let html = `</br><table id="${tblid}" class="w3-table w3-table-all w3-hoverable" width="100%"></table>
  <script>function ${tblid}fnc(ds) {
    destroyTbl("${tblid}");
    let nds =[];
    _.forEach(ds,(r,i)=>{r['edtblidx']=i;nds.push(r)});
    let dataSet = objtoarr(nds);
    let clmn = _.map(dataSet.shift(), (o,i) => {
      if(o=='edtblidx'){
        return {title: o, visible: false };
      }
      return { title: o };
    });
    $("#${tblid}").css({
      "overflow-x": "hidden",
      "overflow-y": "hidden",
      border: "none",
    });
    ${tblid} = $("#${tblid}").DataTable({
      data: dataSet,
      columns: clmn,
      deferRender: true,
      paging: false,
      select: true,
      scrollY: "460px",
      scrollX: true,
      scrollCollapse: true,
      select: true,
      dom: '<"top"if>rt<"bottom"><"clear">',
    });
    myDTs["${tblid}"] = ${tblid};
    $("#${tblid} tbody")
      .off("dblclick")
      .on("dblclick", "tr", function (event) {
        ${tblid}.rows().nodes().to$().removeAttr("style");
        let titles = _.map(${tblid}.settings().init().columns, "title");
        slrw = ${tblid}.row($(this).closest("tr")).data();
        $(this).css("background", "#daff99");
        slrwobj = {};
        slrw.forEach((o, i) => {
          slrwobj[titles[i]] = o;
        });
        if (slrw) {
          slrwobj["tblnm"] = "${tblid}";
          $("#model").html(edtmdl(slrwobj));
          document.getElementById("id01").style.display = "block";
        }
      });
  }</script>`;

  $("#" + divid).append(html);
  return tblid + "fnc";
}

// on row double click in datatable model will popup with table titles as lable of input and corresponding values in html input

function edtmdl(slctrw) {
  let style =
    Object.keys(slctrw).length > 5
      ? "max-width:600px;height:450px;overflow:scroll"
      : "max-width:600px;overflow:scroll";
  let html = '<div class="w3-container" >';
  html += '<div id="id01" class="w3-modal">';
  html +=
    '<div class="w3-modal-content w3-card-4 w3-round" style="' +
    style +
    '"><div class="w3-container w3-border-bottom w3-teal w3-round"><div class="w3-section"><label><b>' +
    slctrw.tblnm.toUpperCase() +
    "</b></label></div></div>";
  html += '<form id="model_form" class="w3-container">';
  html += '<div class="w3-section">';
  let nptyp = { string: "text", number: "number", boolean: "checkbox" };
  Object.keys(slctrw).forEach((o) => {
    let cval = slctrw[o];
    let type = o == "tblnm" || o == "edtblidx" ? "hidden" : "text";
    if (type != "hidden") {
      html += "<label><b>" + o + "</b></label>";
    }
    html += `<input class="w3-input w3-border w3-margin-bottom w3-round" type="${type}" value="${cval}" name="${o}"`;
    html += type == "hidden" ? `readonly>` : `>`;
  });

  html += "</div></form>";

  html += `<div class="w3-container w3-border-top  w3-theme-l4 w3-round">
	<button onclick="onClick('save')" type="button" class="w3-button w3-margin-left w3-right w3-round w3-teal">Save</button>
        <button onclick="onClick('cancel')" type="button" class="w3-button  w3-right w3-round w3-amber">Cancel</button></div></div></div>`;
  return html;
}

// on save button click on model below function gets called.
function onClick(action) {
  if (action == "save") {
    let values = getModelValues("model_form");
    let tblnm = values.tblnm;
    let tbl = myDTs[tblnm];
    let allds = [];

    delete values.tblnm;

    var hdr = tbl
      .settings()
      .init()
      .columns.map((o) => {
        return o.title;
      });

    tbl
      .rows()
      .data()
      .toArray()
      .forEach((o) => {
        let tds = {};
        hdr.forEach((r, i) => {
          tds[r] = o[i];
        });
        allds.push(tds);
      });

    allds = upsert(allds, values, { edtblidx: values.edtblidx });
    let newData = objtoarr(allds);
    newData.shift();
    tbl.clear().rows.add(newData).draw();
  }
  document.getElementById("id01").style.display = "none";
  $("#model").html("");
}


function upsert(ds, rplcobj, cndt) {
  let indx = _.findIndex(ds, cndt);
  try {
    if (indx != -1) {
      ds[indx] = rplcobj;
    } else {
      ds[ds.length] = rplcobj;
    }
  } catch (e) {
    console.error("### Error updating DT ");
  }

  return ds;
}

function getModelValues(id) {
  var $inputs = $("#" + id + " :input");
  var values = {};
  $inputs.each(function () {
    values[this.name] = $(this).val();
  });
  values.edtblidx = Number(values.edtblidx);
  return values;
}

