(function (Raphael) {
    Raphael.colorwheel = function (x, y, size, initcolor, element, sizeNum, rectNum, flag) {
        return new ColorWheel(x, y, size, initcolor, flag, element, sizeNum, rectNum);
    };
    function angle(x, y) {
        return (x < 0) * 180 + Math.atan(-y / -x) * 180 / pi;
    }
    var pi = Math.PI,
        doc = document,
        win = window,
        ColorWheel = function (x, y, size, initcolor, flag, element, sizeNum, rectNum) {
            size = size || 200;
            var w3 = 3 * size / 200,
                w1 = size / 200,
                fi = 1.6180339887,
                segments = pi * size / 5,
                size20 = size / 20,
                size2 = size / 2,
                padding = 2 * size / 200,
                t = this;

            var H = 1, S = 1, B = 1, s = size - (size20 * 4);
            var r = element ? Raphael(element, size, size + sizeNum) : Raphael(x, y, size, size + sizeNum),
                xy = s / 6 + size20 * 2 + padding,
                wh = s * 2 / 3 - padding * 2;
            w1 < 1 && (w1 = 1);
            w3 < 1 && (w3 = 1);


            // ring drawing
            var a = pi / 2 - pi * 2 / segments * 1.3,
                R = size2 - padding,
                R2 = size2 - padding - size20 * 2,
                path = ["M", size2, padding, "A", R, R, 0, 0, 1, R * Math.cos(a) + R + padding, R - R * Math.sin(a) + padding, "L", R2 * Math.cos(a) + R + padding, R - R2 * Math.sin(a) + padding, "A", R2, R2, 0, 0, 0, size2, padding + size20 * 2, "z"].join();
            if (flag) {
                for (var i = 0; i < segments; i++) {
                    r.path(path).attr({
                        stroke: "none",
                        fill: "hsb(" + i * (255 / segments) / 255 + ", 1, 1)",
                        transform: "r" + [(360 / segments) * i, size2, size2]
                    });
                }
            } else {
                var r0 = 0,
                    g0 = 0,
                    b0 = 0,
                    r1 = 248,
                    g1 = 207,
                    b1 = 109,
                    r2 = 255,
                    g2 = 255,
                    b2 = 255,
                    r3 = 164,
                    g3 = 213,
                    b3 = 255,
                    num = segments / 4,
                    num2 = num * 2,
                    num3 = num * 3,
                    percentage = 0;
                for (var i = 0; i < segments; i++) {
                    var hsb = "";
                    if (i <  num) {
                        percentage = i / num;
                        r0 = Math.floor((r2 - r1) * percentage) + r1;
                        g0 = Math.floor((g2 - g1) * percentage) + g1;
                        b0 = Math.floor((b2 - b1) * percentage) + b1;
                    } else if (i < num2){
                        percentage = (i - num) / num;
                        r0 = r2 - Math.floor((r2 - r3) * percentage);
                        g0 = g2 - Math.floor((g2 - g3) * percentage);
                        b0 = b2 - Math.floor((b2 - b3) * percentage);
                    }else if (i < num3){
                        percentage = (i - num2) / num;
                        r0 = Math.floor((r2 - r3) * percentage) + r3;
                        g0 = Math.floor((g2 - g3) * percentage) + g3;
                        b0 = Math.floor((b2 - b3) * percentage) + b3;
                    } else {
                        percentage = (i - num3) / num;
                        r0 = r2 - Math.floor((r2 - r1) * percentage);
                        g0 = g2 - Math.floor((g2 - g1) * percentage);
                        b0 = b2 - Math.floor((b2 - b1) * percentage);
                    }

                    hsb = Raphael.rgb2hsb(r0, g0, b0);
                    r.path(path).attr({
                        stroke: "none",
                        fill: "hsb("+hsb.h+","+hsb.s+","+hsb.b+")",
                        transform: "r" + [(360 / segments) * i, size2, size2]
                    });

                }
            }


            r.path(["M", size2, padding, "A", R, R, 0, 1, 1, size2 - 1, padding, "l1,0", "M", size2, padding + size20 * 2, "A", R2, R2, 0, 1, 1, size2 - 1, padding + size20 * 2, "l1,0"]).attr({
                "stroke-width": w3,
                stroke: ""
            });
            t.cursorhsb = r.set();
            var h = size20 * 2 + 2;
            t.cursorhsb.push(r.rect(size2 - h / fi / 2, padding - 1, h / fi, h, 3 * size / 200).attr({
                stroke: "#000",
                opacity: .5,
                "stroke-width": w3
            }));
            t.cursorhsb.push(t.cursorhsb[0].clone().attr({
                stroke: "#fff",
                opacity: 1,
                "stroke-width": w1
            }));
            t.ring = r.path(["M", size2, padding, "A", R, R, 0, 1, 1, size2 - 1, padding, "l1,0M", size2, padding + size20 * 2, "A", R2, R2, 0, 1, 1, size2 - 1, padding + size20 * 2, "l1,0"]).attr({
                fill: "#000",
                opacity: 0,
                stroke: "none"
            });

            // rect drawing
            t.main = r.rect(padding + h / fi / 2, size + padding * 2 + rectNum, size - padding * 2 - h / fi, h - padding * 2).attr({
                stroke: "#fff",
                fill: "180-#fff-#000"
            });

            t.cursor = r.set();
            t.cursor.push(r.rect(size - padding - h / fi, size + padding + rectNum, ~~(h / fi), h, w3).attr({
                stroke: "#000",
                opacity: .5,
                "stroke-width": w3
            }));
            t.cursor.push(t.cursor[0].clone().attr({
                stroke: "#fff",
                opacity: 1,
                "stroke-width": w1
            }));
            t.btop = t.main.clone().attr({
                stroke: "#000",
                fill: "#000",
                opacity: 0
            });
            t.bwidth = ~~(h / fi) / 2;
            t.minx = padding + t.bwidth;
            t.maxx = size - h / fi - padding + t.bwidth;

            t.H = t.S = t.B = 1;
            t.raphael = r;
            t.size2 = size2;
            t.size20 = size20;
            t.padding = padding;
            t.wh = wh;
            t.x = x;
            t.xy = xy;
            t.y = y;

            // events
            t.ring.drag(function (dx, dy, x, y) {
                t.hsbOnTheMove = true;
                t.docOnMove(dx, dy, x, y, segments, flag);
            }, function (x, y) {
                t.hsbOnTheMove = true;
                if (flag) {
                    t.setHS(x - t.x, y - t.y);
                } else {
                    t.setHSTH(x - t.x, y - t.y, segments, flag);
                }
            }, function () {
                t.hsbOnTheMove = false;
            });
            t.btop.drag(function (dx, dy, x, y) {
                t.docOnMove(dx, dy, x, y);
            }, function (x, y) {
                t.clrOnTheMove = true;
                t.setB(x - t.x);
            }, function () {
                t.clrOnTheMove = false;
            });
            if (flag) {
                t.setColor(initcolor || "#fff");
            } else {
                t.setTHColor(initcolor || [0, 0]);
            }
            this.onchanged && this.onchanged(this.color());

        },
        proto = ColorWheel.prototype;

    proto.setH = function (x, y) {
        var d = Raphael.angle(x, y, 0, 0),
            rd = Raphael.rad(d);
        this.cursorhsb.attr({transform: "r" + [d + 90, this.size2, this.size2]});
        this.H = (d + 90) / 360;

        this.main.attr({fill: "hsb(" + this.H + ",1,1)"});
        this.onchange && this.onchange(this.color());
    };
    proto.setHS = function (x, y) {
        var X = x - this.size2,
            Y = y - this.size2,
            R = this.size2 - this.size20 / 2 - this.padding,
            d = angle(X, Y),
            rd = Raphael.rad(d);
        isNaN(d) && (d = 0);
        this.cursorhsb.attr({transform: "r" + [d + 90, this.size2, this.size2]});
        this.H = (d + 90) / 360;
        //this.main.attr({fill: "180-hsb(" + [this.H, 1] + ",1)-#000"});
        this.color("hsb(" + this.H + ", 1,"+this.B+")");
        this.onchange && this.onchange(this.color());
    };
    proto.setHSTH = function (x, y, segments) {
        var X = x - this.size2,
            Y = y - this.size2,
            d = angle(X, Y),
            rd = d * pi / 180;
        isNaN(d) && (d = 0);
        this.cursorhsb.attr({transform: "r" + [d + 90, this.size2, this.size2]});
        var hsb = this.getGradient(d + 90, segments);
        //this.color("hsb(" + hsb.h + "," + hsb.s + ", " + hsb.b + ")");
        //this.main.attr({fill: "180-hsb(" + [hsb.h, hsb.s] + ","+hsb.b+")-#000"});
        this.onchange && this.onchange(this.color());
    };
    proto.setB = function (x) {
        x < this.minx && (x = this.minx);
        x > this.maxx && (x = this.maxx);
        this.cursor.attr({x: x - this.bwidth});
        this.B = (x - this.minx) / (this.maxx - this.minx);
        this.onchange && this.onchange(this.color());
    };
    proto.getHSTH = function () {
        return this.cursorhsb[0]["_"].deg;
    };
    proto.getB= function () {
        return this.B;
    };
    proto.docOnMove = function (dx, dy, x, y, segments, flag) {

        if (this.hsbOnTheMove) {
            if (flag) {
                this.setHS(x - this.x, y - this.y);
            } else {
                this.setHSTH(x - this.x, y - this.y, segments);
            }

        }
        if (this.clrOnTheMove) {
            this.setB(x - this.x, y - this.y);
        }
    };
    proto.remove = function () {
        this.raphael.remove();
        this.color = function () {
            return false;
        };
    };
    proto.getGradient = function (val, segments) {
        var r0 = 0,
            g0 = 0,
            b0 = 0,
            r1 = 248,
            g1 = 207,
            b1 = 109,
            r2 = 255,
            g2 = 255,
            b2 = 255,
            r3 = 164,
            g3 = 213,
            b3 = 255,
            num = segments / 4,
            num2 = num * 2,
            num3 = num * 3,
            percentage = 0;
            var hsb = "";
            val = val * (segments / 360);
            if (val <  num) {
                percentage = val / num;
                r0 = Math.floor((r2 - r1) * percentage) + r1;
                g0 = Math.floor((g2 - g1) * percentage) + g1;
                b0 = Math.floor((b2 - b1) * percentage) + b1;
            } else if (val < num2){
                percentage = (val - num) / num;
                r0 = r2 - Math.floor((r2 - r3) * percentage);
                g0 = g2 - Math.floor((g2 - g3) * percentage);
                b0 = b2 - Math.floor((b2 - b3) * percentage);
            }else if (val < num3){
                percentage = (val - num2) / num;
                r0 = Math.floor((r2 - r3) * percentage) + r3;
                g0 = Math.floor((g2 - g3) * percentage) + g3;
                b0 = Math.floor((b2 - b3) * percentage) + b3;
            } else {
                percentage = (val - num3) / num;
                r0 = r2 - Math.floor((r2 - r1) * percentage);
                g0 = g2 - Math.floor((g2 - g1) * percentage);
                b0 = b2 - Math.floor((b2 - b1) * percentage);
            }
            return Raphael.rgb2hsb(r0, g0, b0);
    };
    proto.setTHColor = function (color) {
        var d = color[0] * 1.8;
        this.B = color[1] / 100;

        this.cursorhsb.attr({transform: "r" + [d, this.size2, this.size2]});
        var x = (this.maxx - this.minx) * this.B + this.minx - this.bwidth;
        this.cursor.attr({x: x});
        return this;
    };
    proto.setColor = function (color) {
        color = Raphael.color(color);
        color=Raphael.rgb2hsb(color.r, color.g, color.b);
        var d = color.h * 360;
        this.H = color.h;
        this.S = color.s;
        this.B = color.b;

        this.cursorhsb.attr({transform: "r" + [d, this.size2, this.size2]});
        //this.main.attr({fill: "180-hsb(" + [this.H, this.S] + ",1)-#000"});
        var x = (this.maxx - this.minx) * this.B + this.minx - this.bwidth;
        this.cursor.attr({x: x});
        return this;

    };
    proto.color = function (color) {
        if (color) {
            color = Raphael.color(color);
            color=Raphael.rgb2hsb(color.r, color.g, color.b);
            var d = color.h * 360;
            this.H = color.h;
            this.S = color.s;
            this.B = color.b;
            //this.cursorhsb.attr({transform: "r" + [d, this.size2, this.size2]});
            //this.main.attr({fill: "180-hsb(" + [this.H, this.S] + ",1)-#000"});
            var x = (this.maxx - this.minx) * this.B + this.minx - this.bwidth;
            this.cursor.attr({x: x});
            return this;
        } else {
            return Raphael.hsb2rgb(this.H, this.S, this.B).hex;
        }
    };
    Raphael.changColor = function(color, flag) {
        if (flag) {
             proto.setColor(color);
        } else {
            proto.setTHColor(color);
        }
    };
})(window.Raphael);
