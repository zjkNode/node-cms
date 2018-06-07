
(function(){
    var clickEvent = ((document.ontouchstart !== null) ?'click' : 'touchstart');
    var $btns = $('.btnWrap .btn');

    var utility = Global.utility;
    init();
    function init(){
        $btns.on(clickEvent, function(e){
            e.stopPropagation();
            var btnKey = $(this).data('key');
            _hmt.push(['_trackEvent', Global.code +'_'+ btnKey, 'click', Global.code +'_点击按钮']);
            var handle = new Global.Handle($(this));
            if(handle){
                handle();
                return;
            }
        });
    }

    function test($sender, resConf){
        console.log($sender);
        console.log(resConf)
    }
})();