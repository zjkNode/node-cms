
var process = function(canvasId,scaleCount,time,outCircleStyle,text,deg){
    var pageHeight = $(window.document).height();
    var pageWidth = $(window.document).width();
    $("#process").height(pageHeight);
    $("#process").width(pageWidth);
    //$('#process').find('.process-container').css('top',pageHeight-window.screen.availHeight/2-100);
    /*$('#process').find('.process-container').css('top',(($(window).height() - $('#process').find('.process-container').outerHeight()) / 2) + $(window).scrollTop() + "px");
    */$('#process').bind("touchmove",function(e){
        e.preventDefault();
        e.stopPropagation();
    });
    //document.body.style.overflow='hidden';

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth*scaleCount;
    canvas.height = canvas.clientHeight*scaleCount;
    var W = canvas.width;
    var H = canvas.height;
    var text = text,text_w='';
    this.deg = deg;
    this.time = time;
    this.circleTime = 0;
    var outCircleStyle = outCircleStyle;
    var startColor,midColor,EndColor;
    outCircleStyle.startColor ? startColor = outCircleStyle.startColor : startColor = '#2993ff';
    outCircleStyle.midColor ? midColor = outCircleStyle.midColor : midColor = '#2993ff';
    outCircleStyle.EndColor ? EndColor = outCircleStyle.EndColor : EndColor = '#7b79ff';

    this.DrawDashLine = function(color){
        ctx.clearRect(0,0,W,H);
        ctx.beginPath();
        ctx.strokeStyle = color;//"#86c5ff"
        ctx.lineWidth=5;
        ctx.setLineDash([15, 15]);
        ctx.lineCap='round';
        ctx.arc(W/2,H/2,200,0,Math.PI*2,false);
        ctx.stroke();
    };

    this.init = function(){
        this.DrawDashLine("#3d3dcb");
        var r = this.deg*Math.PI/180;
        ctx.beginPath();
        var grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, startColor);
        grd.addColorStop(1,EndColor);
        ctx.strokeStyle = grd;
        ctx.arc(W/2,H/2,170,0-90*Math.PI/180,r-90*Math.PI/180,false);
        ctx.lineWidth=30;
        ctx.lineCap='round';
        ctx.setLineDash([10, 0]);
        ctx.stroke();
        ctx.fillStyle="#2395ff";
        ctx.font = outCircleStyle.font;

        text = Math.round(this.time/1000) + 's';
        text_w = ctx.measureText(text).width;
        ctx.fillText(text,W/2 - text_w/2,H/2+15);
    };
    this.drawStatusImg = function(imgSrc,color){
        clearInterval(this.loop);
        this.DrawDashLine(color);
        var img = new Image();
        img.src = imgSrc.src;
        img.onload = function() {
            /*ctx.drawImage(img, W/3+8,H/3);*/
            ctx.drawImage(img, W/3,H/3);
        };
    };
};

process.prototype.clearLoop = function(){
    this.deg = 0;
    this.time = 120*1000;
    clearInterval(this.loop);
};

process.prototype.draw = function(){
    var self = this;
    this.loop = setInterval(function(){
        self.time -= 100;
        self.circleTime += 100;
        self.deg = self.deg + 360*100/(120*1000);
        if(self.time < 0){
            clearInterval(this.loop);
            self.hide();
            return;
        }
        self.init();
    },100);
};

process.prototype.show = function(){
    this.clearLoop();
    $('#process').show();
    this.draw();
};
process.prototype.hide = function(){
    this.clearLoop();
    $('#process').hide();
};
process.prototype.success = function(){
    this.clearLoop();
    $('#process').show();
    var self = this;
    var img = document.getElementById("successImg");
    self.drawStatusImg(img,"#86c5ff");
    setTimeout(function(){
        self.hide();
    },2000);
};
process.prototype.error = function(){
    this.clearLoop();
    $('#process').show();
    var self = this;
    var img = document.getElementById("errorImg");
    this.drawStatusImg(img,"#999999");
    setTimeout(function(){
        self.hide();
    },3000);
};



module.exports = {
    process:process
};
