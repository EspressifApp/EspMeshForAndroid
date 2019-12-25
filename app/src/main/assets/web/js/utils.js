define(function(){
    var Utils = {
        // 设置状态栏的颜色--灰色
        setStatusBarGray: function() {
            this.setStatusBar(115, 125, 137, 255, true);
        },
        // 设置状态栏的颜色--黑色
        setStatusBarBLack: function() {
            this.setStatusBar(17, 20, 29, 255, true);
        },
        // 设置状态栏的颜色--蓝色
        setStatusBarBlue: function() {
            this.setStatusBar(62, 194, 252, 255, true);
        },
        // 设置状态栏的颜色--白色
        setStatusBarWhite: function() {
            this.setStatusBar(255, 255, 255, 255, false);
        },
        // 设置状态栏的颜色
        setStatusBar: function(r, g, b, a, flag) {
            espmesh.setStatusBar(JSON.stringify({"background": [r, g, b, a], "defaultStyle": flag}))
        },
        // 打开手机设置界面(蓝牙、位置等)
        gotoSystemSettings: function(name) {
            espmesh.gotoSystemSettings(name);
        },
        // 通讯方法
        requestDevicesMulticast: function(data) {
            espmesh.requestDevicesMulticast(data);
        },
        // 转换bssid
        convert: function(bssid) {
            var strs = bssid.split(":"), meshIds = [];
            for (var i = 0; i < strs.length; i++ ) {
                meshIds.push(parseInt(strs[i], 16));
            }
            return meshIds;
        },
        // 提示
        toast: function(MINT, msg) {
            var mintStr = MINT.Toast({
                message: msg,
                position: 'bottom',
                duration: 2000
            });
            return mintStr;
        },
        // 设置默认的群组名称
        setGroupName: function(tid) {
            var name = "";
            if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                name = "Switch_" + tid;
            } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                name = "Sensor_" + tid;
            } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                name = "Light_" + tid;
            } else {
                name = "Other_" + tid;
            }
            return name;
        },
        // 获取群组名称
        getGroupName: function(groups, id, name) {
            $.each(groups, function(i, item) {
                if (item.id == id) {
                    name = item.name;
                    return false;
                }
            })
            return name;
        },
        Base64: {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function(e) {
                var t = "";
                var n, r, i, s, o, u, a;
                var f = 0;
                e = this._utf8_encode(e);
                while (f < e.length) {
                    n = e.charCodeAt(f++);
                    r = e.charCodeAt(f++);
                    i = e.charCodeAt(f++);
                    s = n >> 2;
                    o = (n & 3) << 4 | r >> 4;
                    u = (r & 15) << 2 | i >> 6;
                    a = i & 63;
                    if (isNaN(r)) {
                        u = a = 64
                    } else if (isNaN(i)) {
                        a = 64
                    }
                    t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                }
                return t
            },
            decode: function(e) {
                var t = "";
                var n, r, i;
                var s, o, u, a;
                var f = 0;
                e = e.replace(/[^A-Za-z0-9+/=]/g, "");
                while (f < e.length) {
                    s = this._keyStr.indexOf(e.charAt(f++));
                    o = this._keyStr.indexOf(e.charAt(f++));
                    u = this._keyStr.indexOf(e.charAt(f++));
                    a = this._keyStr.indexOf(e.charAt(f++));
                    n = s << 2 | o >> 4;
                    r = (o & 15) << 4 | u >> 2;
                    i = (u & 3) << 6 | a;
                    t = t + String.fromCharCode(n);
                    if (u != 64) {
                        t = t + String.fromCharCode(r)
                    }
                    if (a != 64) {
                        t = t + String.fromCharCode(i)
                    }
                }
                t = this._utf8_decode(t);
                return t
            },
            _utf8_encode: function(e) {
                e = e.replace(/rn/g, "n");
                var t = "";
                for (var n = 0; n < e.length; n++) {
                    var r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r)
                    } else if (r > 127 && r < 2048) {
                        t += String.fromCharCode(r >> 6 | 192);
                        t += String.fromCharCode(r & 63 | 128)
                    } else {
                        t += String.fromCharCode(r >> 12 | 224);
                        t += String.fromCharCode(r >> 6 & 63 | 128);
                        t += String.fromCharCode(r & 63 | 128)
                    }
                }
                return t
            },
            _utf8_decode: function(e) {
                var t = "";
                var n = 0;
                var r = c1 = c2 = 0;
                while (n < e.length) {
                    r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r);
                        n++
                    } else if (r > 191 && r < 224) {
                        c2 = e.charCodeAt(n + 1);
                        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                        n += 2
                    } else {
                        c2 = e.charCodeAt(n + 1);
                        c3 = e.charCodeAt(n + 2);
                        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                        n += 3
                    }
                }
                return t
            }
        },
        intsToHex: function(list) {
            var len = 6 - list.length;
            if (len > 0) {
                for(var i = 0 ; i < len; i++) {
                    list.push("00");
                }
            }
            return list;
        },
        strSplit: function(str) {
            var arr = [];
            if (str % 2 != 0) {
                str += "0";
            }
            for (var i = 0; i < str.length; i += 2) {
                if (i < str.length - 1) {
                    var sub = str.substr(i, 2);
                    if (sub != "00") {
                         arr.push(str.substr(i, 2));
                    }

                }
            }
            return arr;
        },
        toGbkBytes: function(str){
            var str = $URL.encode(str);
            var byteArr = new Array();
            for(var i=0; i<str.length;i++){
                var ch = str.charAt(i);
                if(ch == '%'){
                    var num = str.charAt(i+1) + str.charAt(i+2);
                    //num = parseInt(num,16);
                    byteArr.push(num);
                    i+=2;
                }else{
                    byteArr.push(ch.charCodeAt().toString(16));
                }
            }
            return byteArr;
        },
        gbkToStr: function(gbks) {
            var str = "";
            console.log(gbks);
            for (var i = 0; i < gbks.length; i++) {
                var num = parseInt(gbks[i], 16);
                if( num> 127) {
                    str += "%"+gbks[i].toLocaleUpperCase()+"%"+ gbks[i+1].toLocaleUpperCase();
                    i+=1;
                } else {
                    str += String.fromCharCode(num);
                }
            }
            return $URL.decode(str);
        },
        sortList: function(list) {
            var self = this, emptyList = [], arrayList = [];
            $.each(list, function(i, item) {
                if (!self._isEmpty(item.position)) {
                    arrayList.push(item);
                } else {
                    emptyList.push(item);
                }
            });
            arrayList.sort(self.sortBySub("position"));
            emptyList.sort(self.sortBy("name"));
            $.each(emptyList, function(i, item) {
                arrayList.push(item);
            });
            return arrayList;
        },
        sortBySub: function(attr,rev){
            //第二个参数没有传递 默认升序排列
            if(rev ==  undefined){
                rev = 1;
            }else{
                rev = (rev) ? 1 : -1;
            }

            return function(a,b){
                a = a[attr];
                b = b[attr];
                var aNum = a.lastIndexOf("-"),
                    bNum = b.lastIndexOf("-"),
                    a0 = a.substring(0, aNum),
                    b0 = b.substring(0, bNum);
                a1 = a.substring((aNum + 1), a.length),
                    b1 = b.substring((bNum + 1), b.length);
                if (!isNaN(Number(a1)) && !isNaN(Number(b1))) {
                    a1 = Number(a1);
                    b1 = Number(b1);
                }
                if (a0 < b0) {
                    return rev * -1;
                } else if (a0 > b0) {
                    return rev * 1;
                } else if (a0 == b0 && a1 < b1) {
                    return rev * -1;
                } else if (a0 == b0 && a1 > b1) {
                    return rev * 1;
                }
                return 0;
            }
        },
        modeFun: function(temperature, brightness) {
            var r = 0,
                g = 0,
                b = 0,
                r1 = 248,
                g1 = 207,
                b1 = 109,
                r2 = 255,
                g2 = 255,
                b2 = 255,
                r3 = 164,
                g3 = 213,
                b3 = 255;
            if (temperature < 50) {
                var num = temperature / 50;
                r = Math.floor((r2 - r1) * num) + r1;
                g = Math.floor((g2 - g1) * num) + g1;
                b = Math.floor((b2 - b1) * num) + b1;
            } else {
                var num = (temperature - 50) / 50;
                r = r2 - Math.floor((r2 - r3) * num);
                g = g2 - Math.floor((g2 - g3) * num);
                b = b2 - Math.floor((b2 - b3) * num);
            }
            return "rgba("+r+", "+g+", "+b+", 1)";
        },
        getIcon: function (tid) {
            if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                return "icon-light";
            } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                return "icon-power";
            } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                return "icon-sensor";
            } else {
                return "icon-light";
            }
        },
        getColor: function (characteristics, tid) {
            var self = this,
                hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b",
                mode = 0, temperature = 0, brightness = 0;
            if (!self._isEmpty(characteristics)) {
                $.each(characteristics, function(i, item) {
                    if (item.cid == HUE_CID) {
                        hueValue = item.value;
                    }else if (item.cid == SATURATION_CID) {
                        saturation = item.value;
                    }else if (item.cid == VALUE_CID) {
                        luminance = item.value;
                    } else if (item.cid == STATUS_CID) {
                        status = item.value;
                    } else if (item.cid == MODE_CID) {
                        mode = item.value;
                    } else if (item.cid == TEMPERATURE_CID) {
                        temperature = item.value;
                    } else if (item.cid == BRIGHTNESS_CID) {
                        brightness = item.value;
                    }
                })
            }
            if (status == STATUS_ON) {
                if (mode == MODE_CTB) {
                    rgb = self.modeFun(temperature, brightness);
                } else {
                    rgb = self.getDeviceRgb(hueValue, saturation, luminance);
                }
            }
            if (tid < MIN_LIGHT || tid > MAX_LIGHT) {
                rgb = "#3ec2fc";
            }
            return rgb;
        },
        getDeviceRgb: function(hueValue, saturation, luminance) {
            var rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100);
            var v = luminance / 100;
            if (v <= 0.4)  {
                v *= 1.2;
            }
            if(v <= 0.2) {
                v = 0.2;
            }
            return "rgba("+Math.round(rgb.r)+", "+Math.round(rgb.g)+", "+Math.round(rgb.b)+", "+ v +")";
        },
        getBxColor: function(layer) {
            switch(parseInt(layer)) {
                case 1: return "bx-red"; break;
                case 2: return "bx-orange"; break;
                case 3: return "bx-yellow"; break;
                case 4: return "bx-green"; break;
                case 5: return "bx-blue-green"; break;
                case 6: return "bx-blue"; break;
                case 7: return "bx-purple"; break;
                default: return ""; break;
            }
        },
        getRssiIcon: function(rssi) {
            if (rssi >= -65) {
                return "images/signal4.png"
            } else if (rssi >= -75) {
                return "images/signal3.png"
            } else if (rssi >= -80) {
                 return "images/signal2.png"
            } else if (rssi >= -90) {
                 return "images/signal1.png"
            } else {
                 return "images/signal0.png"
            }
        },
        getWIFIRssiIcon: function(rssi) {
            if (rssi <= MIN_RSSI) {
                return "images/signal0.png";
            } else if (rssi >= MAX_RSSI) {
                return "images/signal4.png";
            } else {
                var inputRange = (MAX_RSSI - MIN_RSSI);
                var outputRange = 4;
                var num = ((rssi - MIN_RSSI) * outputRange / inputRange).toFixed(0);
                return "images/signal"+num+".png";
            }
        },
        sortBy: function(attr,rev){
            //第二个参数没有传递 默认升序排列
            if(rev ==  undefined){
                rev = 1;
            }else{
                rev = (rev) ? 1 : -1;
            }
            return function(a,b){
                a = a[attr];
                b = b[attr];
                if (a < b) {
                    return rev * -1;
                } else if (a > b) {
                    return rev * 1;
                }
                return 0;
            }
        },
        getPosition: function(position) {
            if (!this._isEmpty(position)) {
                position = position.split("-");
                return position[0] + "-" + (position[1] + "-" + position[2]);
            } else {
                return "";
            }
        },
        getPOrN: function(position, name) {
            var obj = name,
                objP = this.getPosition(position);
            if (!this._isEmpty(objP)) {
                obj = objP;
            }
            return obj;
        },
        obj2key: function (obj, keys){
            var n = keys.length,
                key = [];
            while(n--){
                key.push(obj[keys[n]]);
            }
            return key.join('|');
        },
        uniqeByKeys: function (array, keys) {
            var arr = [];
            var hash = {};
            for (var i = 0, j = array.length; i < j; i++) {
                var k = this.obj2key(array[i], keys);
                if (!(k in hash)) {
                    hash[k] = true;
                    arr.push(array[i]);
                }
            }
            return arr;
        },
        addBgClass: function(e) {
            if (e) {
                var doc = $(e.currentTarget).parent().parent().parent();
                doc.addClass("bg-white");
                setTimeout(function() {
                    doc.removeClass("bg-white");
                }, 500)
            }
        },
        setName: function(name, mac) {
//            mac = "_" + mac.substr(mac.length - 4);
//            if (name.indexOf(mac) == -1) {
//                name += mac;
//            }
            return name;
        },
        setAliDeviceStatus: function(self, macs, data) {
            var that = this, changeList = [], isStatus = false;
            $.each(self.deviceList, function(i, item){
                if (macs.indexOf(item.iotId) > -1) {
                    var characteristics = item.characteristics;
                    if (!that._isEmpty(data["HSVColor"])) {
                        characteristics["HSVColor"].value = data["HSVColor"];
                    }
                    if (!that._isEmpty(data["LightSwitch"])) {
                        isStatus = true;
                        characteristics["LightSwitch"].value = data["LightSwitch"];
                    }
                    if (!that._isEmpty(data["ColorTemperature"])) {
                        characteristics["ColorTemperature"].value = data["ColorTemperature"];
                    }
                    if (!that._isEmpty(data["Brightness"])) {
                        characteristics["Brightness"].value = data["Brightness"];
                    }
                    if (!that._isEmpty(data["LightMode"])) {
                        characteristics["LightMode"].value = data["LightMode"];
                    }
                    if (!that._isEmpty(data["DeviceArray"])) {
                        characteristics["DeviceArray"].value.push(data["DeviceArray"]) ;
                    }
                    item.characteristics = characteristics;
                }
                changeList.push(item);
            });
            self.deviceList = changeList;
            self.$store.commit("setList", self.deviceList);
            return isStatus;
        },
        setDeviceGroup: function(characteristics, groups) {
            if (!this._isEmpty(characteristics)) {
                if (!this._isEmpty(characteristics["DeviceArray"])) {
                    characteristics["DeviceArray"].value = groups;
                }
            }
            return characteristics;
        },
        getAliStatus: function(status) {
            var desc = "";
            status = parseInt(status);
            switch(status) {
                case 0: desc = "未激活"; break;
                case 1: desc = "在线"; break;
                case 3: desc = "离线"; break;
                case 8: desc = "禁用"; break;
            }
            return desc;
        },
        getAliGroup: function(characteristics) {
            var groups = [];
            if (!this._isEmpty(characteristics)) {
                if (!this._isEmpty(characteristics["DeviceArray"])) {
                    groups = characteristics["DeviceArray"].value;
                }
            }
            return groups;
        },
        isExistGroup: function(groupList, name) {
            var groupNames = [], flag = false;
            $.each(groupList, function(i, item) {
                var name = item.name;
                if (groupNames.indexOf(name) == -1) {
                    groupNames.push(name);
                }
            })
            if (groupNames.indexOf(name) == -1) {
                flag = true;
            }
            return flag;

        },
        isJSON: function (str) {
            if (typeof str == 'string') {
                try {
                    var obj=JSON.parse(str);
                    if(typeof obj == 'object' && obj ){
                        return true;
                    }else{
                        return false;
                    }

                } catch(e) {
                    return false;
                }
            }
        },
        staMacForBleMacs: function(bleMacs) {
            var staMacs = [];
            for(var i = 0; i < bleMacs.length; i++) {
                var bleMac = parseInt(bleMacs[i], 16);
                var staMac = bleMac - 2;
                staMacs.push(staMac.toString(16));
            }
            return staMacs;

        },
        staMacForBleMac: function(bleMac) {
            bleMac = parseInt(bleMac, 16);
            var staMac = bleMac - 2;
            return staMac.toString(16);

        },
        bleMacForStaMacs: function(staMacs) {
            var bleMacs = [];
            for(var i = 0; i < staMacs.length; i++) {
                var bleMac = parseInt(staMacs[i], 16);
                var staMac = bleMac + 2;
                bleMacs.push(staMac.toString(16));
            }
            return bleMacs;
        },
        bleMacForStaMac: function(staMac) {
            staMac = parseInt(staMac, 16);
            var bleMac = staMac + 2;
            return bleMac.toString(16);
        },
        distance: function(rssi) {
            var iRssi = Math.abs(rssi),
                power = (iRssi - 49) / (10 * 4.5);
            return Math.pow(10, power).toFixed(2);
        },
        isMesh: function(name, version, beacon) {
            var flag = false;
            if ((version == 0 || (version == -1 && !this._isEmpty(name) && name.indexOf("MESH_") != -1))) {
                if (!this._isEmpty(beacon)) {
                    if (beacon == BEACON_MDF) {
                        flag = true;
                    }
                } else {
                    flag = true;
                }
            }
            return flag;
        },
        isBeacon: function(name, version, beacon) {
            var flag = false;
            if ((version == 0 || (version == -1 && !this._isEmpty(name) && name.indexOf("MESH_") != -1))
                && beacon == BEACON_MGW) {
                flag = true;
            }
            return flag;
        },
        isCloud: function(name, version, beacon) {
            var flag = false;
            if ((version == 0 || (version == -1 && !this._isEmpty(name) && name.indexOf("MESH_") != -1))
                && beacon == BEACON_MAY) {
                flag = true;
            }
            return flag;
        },
        // 组装蓝牙扫描到的设备信息
        assemblyObject: function(item, self) {
            return {mac: item.mac, name: item.name, rssi: item.rssi, bssid: item.bssid,
                position: this.getPairInfo(self, item.mac), tid: item.tid, beacon: item.beacon, only_beacon: item.only_beacon};

        },
        // 组装蓝牙扫描到的设备信息
        assemblyObjectNoPosition: function(item, self) {
            return {mac: item.mac, name: item.name, rssi: item.rssi, bssid: item.bssid,
                 tid: item.tid, beacon: item.beacon, only_beacon: item.only_beacon};

        },
        blueNameDecode: function(self, blueDevices) {
            var that = this;
            if (self.$store.state.systemInfo == "Android") {
                $.each(blueDevices, function(i, item) {
                    item.name = that.Base64.decode(item.name);
                    blueDevices.splice(i, 1, item)
                })
            }
            return blueDevices;
        },
        // 获取配置的位置信息
        getPairInfo: function(self, mac) {
            var position = "";
            var staMac = this.staMacForBleMacs([mac]);
            console.log(staMac);
            if (staMac.length > 0) {
                $.each(self.resetPairList, function(i, item) {
                    if (item.mac == staMac[0]) {
                        position = item.floor + "-" + item.area + "-" + item.code;
                        return false;
                    }
                });
            }
            return position;
        },
        stringToBytes: function (str) {
            var ch, st, re = [];
            for (var i = 0; i < str.length; i++ ) {
                ch = str.charCodeAt(i);  // get char
                st = [];                 // set up "stack"

                do {
                    st.push( ch & 0xFF );  // push byte to stack
                    ch = ch >> 8;          // shift value down by 1 byte
                }
                while ( ch );
                re = re.concat( st.reverse() );
            }
            return re;
        },
        // 判断设备是否有位置信息没有测返回'N/A'
        getPositionOrNA: function(position) {
            var str = this.getPosition(position);
            if (!this._isEmpty(str)) {
                return str;
            } else {
                return "N/A";
            }
        },
        _isEmpty: function (str) {
            if (str === "" || str === null || str === undefined || str === "null" || str === "undefined" ) {
                return true;
            } else {
                return false;
            }
        },
        switchTouchDefaultEvent: function(parentMac, childMacs, deviceIp) {
            var self = this;
            var splitMac = parentMac.substr((parentMac.length - 3), 3);
            var events = [];
            var eventLumiLnance = self._assemblySyscEvent("SYSC" + splitMac, TOUC_PAD_BTN_3, childMacs);
            events.push(eventLumiLnance);

            var eventRed = self._assemblySwitchEvent("RED_" + splitMac,TOUC_PAD_BTN_0,
                childMacs, SYSC_RED_HUE, SYSC_RED_SATURATION);
            events.push(eventRed);

            var eventGreen = self._assemblySwitchEvent("GREEN_" + splitMac, TOUC_PAD_BTN_1,
                childMacs, SYSC_GREEN_HUE, SYSC_GREEN_SATURATION);
            events.push(eventGreen);

            var eventBlue = self._assemblySwitchEvent("BLUE_" + splitMac, TOUC_PAD_BTN_2,
                childMacs, SYSC_BLUE_HUE, SYSC_BLUE_SATURATION);
            events.push(eventBlue);

            self._addRequestEvent(parentMac, events, deviceIp);
        },
        sensorDefaultEvent: function (parentMac, childMacs, deviceIp) {
            var self = this;
            var splitMac = parentMac.substr((parentMac.length - 3), 3);
            var events = [];
            var eventON = self._assemblyOtherEvent(ON_EN + "_" + splitMac, SENSOR_CID,
                childMacs, MESH_SENSOR_ON_COMPARE, STATUS_ON);
            events.push(eventON);
            var eventOFF = self._assemblyOtherEvent(OFF_EN + "_" + splitMac, SENSOR_CID,
                childMacs, MESH_SENSOR_OFF_COMPARE, STATUS_OFF);
            events.push(eventOFF);
            self._addRequestEvent(parentMac, events, deviceIp);
        },
//        sensor23DefaultEvent: function (parentMac, childMacs, deviceIp) {
//            var self = this;
//            var splitMac = parentMac.substr((parentMac.length - 3), 3);
//            var events = [];
//            var eventON = self._assemblyOtherEvent(ON_EN + "_" + splitMac, SENSOR_CID,
//                childMacs, MESH_LIGHT_SYSC_COLOR_0, STATUS_ON);
//            events.push(eventON);
//            var eventOFF = self._assemblyOtherEvent(OFF_EN + "_" + splitMac, SENSOR_CID,
//                childMacs, MESH_LIGHT_SYSC_COLOR, STATUS_OFF);
//            events.push(eventOFF);
//            self._addRequestEvent(parentMac, events, deviceIp);
//        },
        sensor24DefaultEvent: function (parentMac, childMacs, deviceIp) {
            var self = this;
            var splitMac = parentMac.substr((parentMac.length - 3), 3);
            var events = [];
            //白色
            var eventWhite = self._assemblyColorEvent(WHITE_EN, SENSOR24_CID_3,
                childMacs, MESH_LIGHT_SYSC_COLOR_0, SENSOR24_COLOR["white"].h,
                SENSOR24_COLOR["white"].s, SENSOR24_COLOR["white"].v);
            events.push(eventWhite);
            //红色
            var eventRed = self._assemblyColorEvent(RED_EN, SENSOR24_CID_3,
                childMacs, MESH_LIGHT_SYSC_COLOR, SENSOR24_COLOR["red"].h,
                SENSOR24_COLOR["red"].s, SENSOR24_COLOR["red"].v);
            events.push(eventRed);
            //绿色
            var eventGreen = self._assemblyColorEvent(GREEN_EN, SENSOR24_CID_3,
                childMacs, MESH_LIGHT_SYSC_COLOR_2, SENSOR24_COLOR["green"].h,
                SENSOR24_COLOR["green"].s, SENSOR24_COLOR["green"].v);
            events.push(eventGreen);
            //蓝色
            var eventBlue = self._assemblyColorEvent(BLUE_EN, SENSOR24_CID_3,
                childMacs, MESH_LIGHT_SYSC_COLOR_3, SENSOR24_COLOR["blue"].h,
                SENSOR24_COLOR["blue"].s, SENSOR24_COLOR["blue"].v);
            events.push(eventBlue)
            //黄色
            var eventYellow = self._assemblyColorEvent(YELLOW_EN, SENSOR24_CID_3,
                childMacs, MESH_LIGHT_SYSC_COLOR_4, SENSOR24_COLOR["yellow"].h,
                SENSOR24_COLOR["yellow"].s, SENSOR24_COLOR["yellow"].v);
            events.push(eventYellow);
            //紫色
            var eventPurple = self._assemblyColorEvent(PURPLE_EN, SENSOR24_CID_3,
                childMacs, MESH_LIGHT_SYSC_COLOR_5, SENSOR24_COLOR["purple"].h,
                SENSOR24_COLOR["purple"].s, SENSOR24_COLOR["purple"].v);
            events.push(eventPurple);
            //开
            var eventOn = self._assemblyOtherEvent(TURN_ON, SENSOR24_CID_2,
                childMacs, MESH_LIGHT_ON_COMPARE, STATUS_ON);
            events.push(eventOn);
            //关
            var eventOFF = self._assemblyOtherEvent(TURN_OFF, SENSOR24_CID_2,
                childMacs, MESH_LIGHT_OFF_COMPARE, STATUS_OFF);
            events.push(eventOFF);
            self._addRequestEvent(parentMac, events, deviceIp);
        },
        switchButtonDefaultEvent: function(cid, parentMac, childMacs, deviceIp) {
            var self = this;
            var events = [];
            var eventON = self._assemblyOtherEvent(ON_EN + "_" + cid, cid,
                childMacs, MESH_LIGHT_ON_COMPARE, STATUS_ON);
            events.push(eventON);
            var eventOFF = self._assemblyOtherEvent(OFF_EN + "_" + cid, cid,
                childMacs, MESH_LIGHT_OFF_COMPARE, STATUS_OFF);
            events.push(eventOFF);
            self._addRequestEvent(parentMac, events, deviceIp);
        },
        switchDefaultEvent: function(parentMac, childMacs, deviceIp) {
            var self = this;
            var splitMac = parentMac.substr((parentMac.length - 3), 3);
            var events = [];
            var eventON = self._assemblyOtherEvent(ON_EN + "_" + splitMac, SWITCH_CID,
                childMacs, MESH_LIGHT_ON_COMPARE, STATUS_ON);
            events.push(eventON);
            var eventOFF = self._assemblyOtherEvent(OFF_EN + "_" + splitMac, SWITCH_CID,
                childMacs, MESH_LIGHT_OFF_COMPARE, STATUS_OFF);
            events.push(eventOFF);

            self._addRequestEvent(parentMac, events, deviceIp);

        },
        lightSyscEvent: function (parentMac, childMacs, deviceIp) {
            var self = this;
            var splitMac = parentMac.substr((parentMac.length - 3), 3);
            var events = [];

            var eventOn = self._assemblySyscEvent("ON_" + splitMac, STATUS_CID, childMacs);
            var eventValue = self._assemblySyscEvent("VALUE_" + splitMac, VALUE_CID, childMacs);
            var eventHue = self._assemblySyscEvent("HUE_" + splitMac, HUE_CID, childMacs);
            var eventSaturation = self._assemblySyscEvent("SATURATION_" + splitMac, SATURATION_CID, childMacs);
            var eventTemperature = self._assemblySyscEvent("TEMPERATURE_" + splitMac, TEMPERATURE_CID, childMacs);
            var eventBrightess = self._assemblySyscEvent("BRIGHTNESS_" + splitMac, BRIGHTNESS_CID, childMacs);

            events.push(eventOn);
            events.push(eventValue);
            events.push(eventHue);
            events.push(eventSaturation);
            events.push(eventTemperature);
            events.push(eventBrightess);
            self._addRequestEvent(parentMac, events, deviceIp);
        },
        setModelEvent: function(name, childMacs, cid, subCid, h, s, b, flag, type, eventClass, execCid, isLong,
            defaultValue, compare) {
            var self = this;
            var eventModel = "";
            if (flag) {
                eventModel = self._assemblyButtonEvent(name, cid, childMacs, subCid, type, eventClass,
                    isLong, defaultValue, compare);
            } else {
                if(type == 2) {
                    eventModel = self._assemblyModelWarmEvent(name, cid, childMacs, h, s, b, type, eventClass, isLong);
                } else if (type == 8 || type == 9 || type == 10) {
                    eventModel = self._assemblyButtonEvent(name, cid, childMacs, subCid, type, eventClass,
                        isLong, defaultValue, compare);
                } else {
                    eventModel = self._assemblyModelEvent(name, cid, childMacs, h, s, b, type, eventClass, isLong);
                }
            }
            return eventModel;
        },
        selectAllDevice: function (e) {
            var self = this;
            var doc = $(e.currentTarget);
            if (doc.hasClass("active")) {
                doc.removeClass("active");
                $("#" + self.autoId + " span.span-radio").removeClass("active");
                this.selected = 0;
            } else {
                doc.addClass("active");
                $("#" + self.autoId + " span.span-radio").addClass("active");
                this.selected = this.count;
            }

        },
        selectDevice: function (e) {
            var doc = $(e.currentTarget);
            if (doc.hasClass("active")) {
                doc.removeClass("active");
                this.selected -= 1;
            } else {
                doc.addClass("active");
                this.selected += 1;
            }
        },
        _assemblyLongEvent: function (name, cid, mac, compare, type, eventClass, isLong, defaultValue) {
            var event = {
                "name": name,
                "trigger_cid": cid,
                "trigger_content": {"request": CONTROL},
                "event_type": type,
                "event_class": eventClass,
                "isLong": isLong,
                "trigger_compare": compare,
                "execute_mac": mac,
                "execute_content":{"request": SET_STATUS,"characteristics":[
                    {"cid": MODE_CID,"value": defaultValue}]
                }
            };
            return event;
        },
        _assemblyColorEvent: function (name, cid, mac, compare, h, s, b) {
            var event = {
                "name": name,
                "trigger_cid": cid,
                "trigger_content": {"request": CONTROL},
                "trigger_compare": compare,
                "execute_mac": mac,
                "execute_content":{"request": SET_STATUS,"characteristics":[
                    {"cid": HUE_CID,"value": h},
                    {"cid": SATURATION_CID,"value": s},
                    {"cid": VALUE_CID,"value": b}
                ]}
            };
            return event;
        },
        _assemblyModelWarmEvent: function (name, cid, mac, h, s, b, type, eventClass, isLong) {
            var compare = "";
            if (isLong) {
                compare = MESH_LIGHT_SYSC_COLOR_2;
            } else {
                compare = MESH_LIGHT_SYSC_COLOR
            }
            var event = {
                "name": name,
                "trigger_cid": cid,
                "trigger_content": {"request": CONTROL},
                "event_type": type,
                "event_class": eventClass,
                "trigger_compare": compare,
                "execute_mac": mac,
                "execute_content":{"request": SET_STATUS,"characteristics":[
                    {"cid": TEMPERATURE_CID,"value": h},
                    {"cid": BRIGHTNESS_CID,"value": b}
                ]}
            };
            return event;
        },
        _assemblyModelEvent: function (name, cid, mac, h, s, b, type, eventClass, isLong) {
            var compare = "";
            if (isLong) {
                compare = MESH_LIGHT_SYSC_COLOR_2;
            } else {
                compare = MESH_LIGHT_SYSC_COLOR;
            }
            var event = {
                "name": name,
                "trigger_cid": cid,
                "trigger_content": {"request": CONTROL},
                "event_type": type,
                "event_class": eventClass,
                "trigger_compare": compare,
                "execute_mac": mac,
                "execute_content":{"request": SET_STATUS,"characteristics":[
                    {"cid": HUE_CID,"value": h},
                    {"cid": SATURATION_CID,"value": s},
                    {"cid": VALUE_CID,"value": b}
                ]}
            };
            return event;
        },
        _assemblyButtonEvent: function (name, cid, mac, subCid, type, eventClass, isLong,
            defaultValue, compare) {
            var event = {
                "name": name,
                "trigger_cid": cid,
                "trigger_content": {"request": CONTROL},
                "event_type": type,
                "event_class": eventClass,
                "isLong": isLong,
                "trigger_compare": compare,
                "execute_mac": mac,
                "execute_cid": subCid,
                "execute_content":{"request": SET_STATUS,"characteristics":[
                    {"cid": subCid,"value": defaultValue}
                ]}
            }
            return event;
        },
        _assemblyOtherEvent: function (name, cid, mac, compare, status) {
            var event = {
                "name": name,
                "trigger_cid": cid,
                "trigger_content": {"request": CONTROL},
                "trigger_compare": compare,
                "execute_mac": mac,
                "execute_content":{"request": SET_STATUS,"characteristics":[
                    {"cid": STATUS_CID,"value": status}
                ]}
            };
            return event;
        },
        _assemblySwitchEvent: function (name, cid, mac, hue, saturation) {
            var event = {
                "name": name,
                "trigger_cid": cid,
                "trigger_content": {"request": CONTROL},
                "trigger_compare": MESH_LIGHT_SYSC_COLOR,
                "execute_mac": mac,
                "execute_content":{"request": SET_STATUS,"characteristics":[
                    {"cid": HUE_CID,"value": hue},
                    {"cid": SATURATION_CID,"value": saturation},
                ]}
            };
            return event;
        },
        _assemblySyscEvent: function (name, cid, childMacs) {
            var event = {
                "name": name,
                "trigger_content": {"request": SYSC,"execute_cid": cid},
                "trigger_cid": cid,
                "trigger_compare": MESH_LIGHT_SYSC,
                "execute_mac": childMacs
            };
            return event;
        },
        _addRequestEvent: function (parentMac, events, deviceIp) {
            var data = '{"' + MESH_MAC + '": "' + parentMac +
                '","'+DEVICE_IP+'": "'+deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_EVENT + '",' +
                '"events":' + JSON.stringify(events) + '}';
            espmesh.requestDevice(data);
        },

    }
    return Utils;
})