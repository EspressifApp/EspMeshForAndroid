define(["vue", "MINT", "txt!../../pages/setTable.html",],
    function(v, MINT,  setTable) {

    var SetTable = v.extend({

        template: setTable,

        data: function(){
            return {
                tableFlag: false,
                slots1:[{values: [], defaultIndex: 0}],
                slots2:[{values: [], defaultIndex: 0}],
            }
        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                console.log(COL_NUM);
                console.log(ROW_NUM);
                self.slots1 = [{values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], defaultIndex: COL_NUM - 1}];
                self.slots2 = [{values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], defaultIndex: ROW_NUM - 1}];
                self.initSetTable();
                self.tableFlag = true;
            },
            hide: function () {
                this.tableFlag = false;
                this.$emit("setTableShow");
            },
            initSetTable: function() {
                var self = this;
                self.init(COL_NUM, ROW_NUM, "device-table");
            },
            saveSet: function() {
                var self = this;
                MINT.MessageBox.confirm("Resetting the form overwrites the original data？", "System hint",{
                      confirmButtonText: "Confirm", cancelButtonText: "Cancel"}).then(function(action) {
                    self.init(COL_NUM, ROW_NUM, "table-drop");
                    self.$parent.droppableTable();
                    $("#lefticon-table").find("div.itemtable").removeClass("availability");
                    $("#lefticon-table").find("div.itemtable").draggable({
                        helper: 'clone',
                        scope: 'topo',
                        disabled: false
                    });
                    espmesh.saveDeviceTable(JSON.stringify({"column": COL_NUM, "row": ROW_NUM}));
                    espmesh.removeAllTableDevices();
                    ISCROLL_TABLE.refresh();
                    self.hide();
                });
            },
            init: function (colNum, rowNum, id) {
                var doc = $("#" + id);
                doc.empty();
                var trHtml = "";
                for(var i = 0; i < rowNum; i++) {
                    trHtml += "<tr data-id='" + i + "'>";
                    var tdHtml = "";
                    for(var j = 0; j < colNum; j++) {
                        tdHtml += "<td  data-id='" + j + "'></td>"
                    }
                    trHtml += tdHtml;
                    trHtml += "</tr>";
                }
                doc.append(trHtml);
            },
            changeCol: function(picker, values) {
                COL_NUM = values[0];
                this.init(COL_NUM, ROW_NUM, "device-table");
            },
            changeRow: function(picker, values) {

                ROW_NUM = values[0];
                this.init(COL_NUM, ROW_NUM, "device-table");
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        created: function () {

        }


    });
    return SetTable;
});
