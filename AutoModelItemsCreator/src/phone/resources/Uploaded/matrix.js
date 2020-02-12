
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

/*
 * Created by Stephen Prideaux-Ghee. Modified by Andrzej Auchimowicz.
 */

function Matrix4() {
    this.m = [ [1, 0, 0, 0],
               [0, 1, 0, 0],
               [0, 0, 1, 0],
               [0, 0, 0, 1]];

    this.Set3V = function(v1,v2,v3) {
        this.m[0][0] = v1.v[0];
        this.m[0][1] = v1.v[1];
        this.m[0][2] = v1.v[2];

        this.m[1][0] = v2.v[0];
        this.m[1][1] = v2.v[1];
        this.m[1][2] = v2.v[2];

        this.m[2][0] = v3.v[0];
        this.m[2][1] = v3.v[1];
        this.m[2][2] = v3.v[2];
        return this;
    }

    this.Translate = function (x, y, z) {
        var t = [ [1, 0, 0, 0],
                  [0, 1, 0, 0],
                  [0, 0, 1, 0],
                  [x, y, z, 1]];
        return this.Multiply(t);
    }

    this.Scale = function (x, y, z) {
        var s = [ [x, 0, 0, 0],
                  [0, y, 0, 0],
                  [0, 0, z, 0],
                  [0, 0, 0, 1]];
        return this.Multiply(s);
    }

    this.Rotate = function (axis, angle) {
        var s  = Math.sin(angle);
        var c0 = Math.cos(angle);
        var c1 = 1 - c0;

        // assume normalised input vector
        var u = axis[0];
        var v = axis[1];
        var w = axis[2];

        var r = [
            [(u * u * c1) + c0,      (u * v * c1) + (w * s), (u * w * c1) - (v * s), 0],
            [(u * v * c1) - (w * s), (v * v * c1) + c0,      (v * w * c1) + (u * s), 0],
            [(u * w * c1) + (v * s), (v * w * c1) - (u * s), (w * w * c1) + c0,      0],
            [0,                      0,                      0,                      1]
        ];

        return this.Multiply(r);
    }

    this.Multiply = function (b) {
        var dst = [
            [   ((this.m[0][0] * b[0][0]) + (this.m[0][1] * b[1][0]) + (this.m[0][2] * b[2][0]) + (this.m[0][3] * b[3][0])),
                ((this.m[0][0] * b[0][1]) + (this.m[0][1] * b[1][1]) + (this.m[0][2] * b[2][1]) + (this.m[0][3] * b[3][1])),
                ((this.m[0][0] * b[0][2]) + (this.m[0][1] * b[1][2]) + (this.m[0][2] * b[2][2]) + (this.m[0][3] * b[3][2])),
                ((this.m[0][0] * b[0][3]) + (this.m[0][1] * b[1][3]) + (this.m[0][2] * b[2][3]) + (this.m[0][3] * b[3][3])) ],
            [   ((this.m[1][0] * b[0][0]) + (this.m[1][1] * b[1][0]) + (this.m[1][2] * b[2][0]) + (this.m[1][3] * b[3][0])),
                ((this.m[1][0] * b[0][1]) + (this.m[1][1] * b[1][1]) + (this.m[1][2] * b[2][1]) + (this.m[1][3] * b[3][1])),
                ((this.m[1][0] * b[0][2]) + (this.m[1][1] * b[1][2]) + (this.m[1][2] * b[2][2]) + (this.m[1][3] * b[3][2])),
                ((this.m[1][0] * b[0][3]) + (this.m[1][1] * b[1][3]) + (this.m[1][2] * b[2][3]) + (this.m[1][3] * b[3][3])) ],
            [   ((this.m[2][0] * b[0][0]) + (this.m[2][1] * b[1][0]) + (this.m[2][2] * b[2][0]) + (this.m[2][3] * b[3][0])),
                ((this.m[2][0] * b[0][1]) + (this.m[2][1] * b[1][1]) + (this.m[2][2] * b[2][1]) + (this.m[2][3] * b[3][1])),
                ((this.m[2][0] * b[0][2]) + (this.m[2][1] * b[1][2]) + (this.m[2][2] * b[2][2]) + (this.m[2][3] * b[3][2])),
                ((this.m[2][0] * b[0][3]) + (this.m[2][1] * b[1][3]) + (this.m[2][2] * b[2][3]) + (this.m[2][3] * b[3][3])) ],
            [   ((this.m[3][0] * b[0][0]) + (this.m[3][1] * b[1][0]) + (this.m[3][2] * b[2][0]) + (this.m[3][3] * b[3][0])),
                ((this.m[3][0] * b[0][1]) + (this.m[3][1] * b[1][1]) + (this.m[3][2] * b[2][1]) + (this.m[3][3] * b[3][1])),
                ((this.m[3][0] * b[0][2]) + (this.m[3][1] * b[1][2]) + (this.m[3][2] * b[2][2]) + (this.m[3][3] * b[3][2])),
                ((this.m[3][0] * b[0][3]) + (this.m[3][1] * b[1][3]) + (this.m[3][2] * b[2][3]) + (this.m[3][3] * b[3][3])) ]];
        this.m = dst;
        return this;
    }

    this.makeOrtho = function(left, right, bottom, top, znear, zfar) {
        var X = -(right + left) / (right - left);
        var Y = -(top + bottom) / (top - bottom);
        var Z = -(zfar + znear) / (zfar - znear);
        var A = 2 / (right - left);
        var B = 2 / (top - bottom);
        var C = -2 / (zfar - znear);

        this.m = [[A, 0, 0, 0],
                  [0, B, 0, 0],
                  [0, 0, C, 0],
                  [X, Y, Z, 1]];
        return this;
    }

    this.makePerspective = function(fovy, aspect, znear, zfar) {
        var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        this.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
        return this;
    }

    this.makeFrustum = function(left, right, bottom, top, znear, zfar) {
        var X = 2 * znear / (right - left);
        var Y = 2 * znear / (top - bottom);
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(zfar + znear) / (zfar - znear);
        var D = -2 * zfar * znear / (zfar - znear);

        this.m = [[X, 0, 0, 0],
                  [0, Y, 0, 0],
                  [A, B, C, -1],
                  [0, 0, D, 1]];
        return this;
    }

    this.Flatten = function () {
        var f = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4 ; j++) {
                f.push(this.m[i][j]);
            }
        }
        return f;
    }

    this.ToString = function () {
        var s = '';
        for (var i = 0; i < 4; i++) {
            s = s.concat(this.m[i].toString());
            s = s.concat(',');
        }
        // now replace the commas with spaces
        s = s.replace(/,/g, ' ');
        return s;
    }

    this.ToEuler = function() {

        var clamp = function(x,a,b) {
            return (x<a)?a:((x>b)?b:x);
        }

        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
        var m11 = this.m[0][0], m12 = this.m[1][0], m13 = this.m[2][0];
        var m21 = this.m[0][1], m22 = this.m[1][1], m23 = this.m[2][1];
        var m31 = this.m[0][2], m32 = this.m[1][2], m33 = this.m[2][2];

        var _x, _y, _z;

        /*
        _y = Math.asin( clamp( m13, - 1, 1 ) );
        if ( Math.abs( m13 ) < 0.99999 ) {
            _x = Math.atan2( - m23, m33 );
            _z = Math.atan2( - m12, m11 );
        } else {
            _x = Math.atan2( m32, m22 );
            _z = 0;
        }
        */

        _y = Math.asin( - clamp( m31, - 1, 1 ) );
        if ( Math.abs( m31 ) < 0.99999 ) {
            _x = Math.atan2( m32, m33 );
            _z = Math.atan2( m21, m11 );
        } else {
            _x = 0;
            _z = Math.atan2( - m12, m22 );
        }

        var deg = 180.0/Math.PI;
        var heading  = deg * _y;
        var bank     = deg * _z;
        var attitude = deg * _x;
        //console.log('heading  ' + heading);
        //console.log('attitude ' + attitude);
        //console.log('bank     ' + bank);
        return { heading:heading, attitude:attitude, bank:bank };
    }
}

// quick way to do perspective matrices
function MatrixP() { }
MatrixP.prototype = new Matrix4()
function MatrixP(fovy, aspect, znear, zfar) {
    this.makePerspective(fovy, aspect, znear, zfar);
}

// quick way to do orthographic matrices
function MatrixO() { }
MatrixO.prototype = new Matrix4()
function MatrixO(left, right, bottom, top, znear, zfar) {
    this.makeOrtho(left, right, bottom, top, znear, zfar);
}

function Vector4() {
    this.v = [0, 0, 0, 1];

    this.Set3 = function (x, y, z) {
        this.v[0] = x;
        this.v[1] = y;
        this.v[2] = z;
        return this;
    }

    this.Set4 = function (x, y, z, w) {
        this.v[0] = x;
        this.v[1] = y;
        this.v[2] = z;
        this.v[3] = w;
        return this;
    }

    this.Length = function () {
        var hyp = (this.v[0] * this.v[0]) + (this.v[1] * this.v[1]) + (this.v[2] * this.v[2]);
        var rad = (hyp > 0) ? Math.sqrt(hyp) : 0;
        return rad;
    }

    this.Normalize = function () {
        var rad = this.Length();
        this.v[0] = this.v[0] / rad;
        this.v[1] = this.v[1] / rad;
        this.v[2] = this.v[2] / rad;
        return this;
    }

    this.DotP = function (v2) {
        // cos(theta)
        var cost = (this.v[0] * v2.v[0]) + (this.v[1] * v2.v[1]) + (this.v[2] * v2.v[2]);
        return cost;
    }

    this.CrossP = function (v2) {
        var x = (this.v[1] * v2.v[2]) - (v2.v[1] * this.v[2]);
        var y = (this.v[2] * v2.v[0]) - (v2.v[2] * this.v[0]);
        var z = (this.v[0] * v2.v[1]) - (v2.v[0] * this.v[1]);

        //this.v = [x, y, z, 1];
        //return this;
        var cross = new Vector4().Set3(x, y, z);
        return cross;
    }

    this.Multiply = function(matrix) {
        var x = this.v[0] * matrix.m[0][0] + this.v[1] * matrix.m[1][0] + this.v[2] * matrix.m[2][0] + this.v[3] * matrix.m[3][0];
        var y = this.v[0] * matrix.m[0][1] + this.v[1] * matrix.m[1][1] + this.v[2] * matrix.m[2][1] + this.v[3] * matrix.m[3][1];
        var z = this.v[0] * matrix.m[0][2] + this.v[1] * matrix.m[1][2] + this.v[2] * matrix.m[2][2] + this.v[3] * matrix.m[3][2];
        var w = this.v[0] * matrix.m[0][3] + this.v[1] * matrix.m[1][3] + this.v[2] * matrix.m[2][3] + this.v[3] * matrix.m[3][3];

        var result = new Vector4().Set4(x, y, z, w);
        return result;
    };

    this.ToString = function () {
        var s = this.v.toString();
        // now replace the commas with spaces
        s = s.replace(/,/g, ' ');
        return s;
    }
}

// Export only under NodeJS.
if (typeof module !== 'undefined' && module.exports) {
    exports.Matrix4 = Matrix4;
    exports.MatrixO = MatrixO;
    exports.MatrixP = MatrixP;
    exports.Vector4 = Vector4;
}

//var m = new Matrix4().makeFrustum(-1, 1, -1, 1, 0.1, 100).Translate(1, 2, 3);
//var n = new MatrixP(45, 1.2, 0.1, 100).Multiply(m.m);
//console.log(n.ToString());

/*var m = new Matrix4().Rotate([1, 0, 0], Math.PI / 4);
console.log(JSON.stringify(m.ToEuler()));

m = new Matrix4().Rotate([1, 0, 0], Math.PI / 4).Rotate([0, 0, 1], -Math.PI / 2);
console.log(m.ToString());
console.log(JSON.stringify(m.ToEuler()));*/

//var p = new MatrixP(60, 1.2, 0.1, 100);
//console.log(p.ToString());
//var q = new MatrixO(-1, 1, -1, 1, 0.1, 100).Translate(1, 2, 3);
//console.log(q.ToString());

/*var s = new Vector4().Set3(1, 1, 1).Normalize();
var v = new Vector4().Set3(1, 0, 0);
var w = new Vector4().Set3(0, 1, 0).CrossP(v);
console.log(w.ToString());*/

//var d = v.DotP(s);
//console.log(d);