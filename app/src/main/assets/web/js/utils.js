define(function(){
    var Utils = {
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
        isMesh: function(name, version) {
            var flag = false;
            if (version == 0 || (version == -1 && !this._isEmpty(name) && name.indexOf("MESH_") != -1)) {
                flag = true;
            }
            return flag;
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
            espmesh.requestDeviceAsync(data);
        },

    }
    return Utils;
})