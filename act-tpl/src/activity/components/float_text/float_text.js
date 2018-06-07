(function() {
	Global.floats = Global.floats || {};
	var $containers = $('.float_text');
	init();
	function init(){
		// bind object to global
        for (var i = 0; i < $containers.length; i++) {
            var wrapId = $containers[i].id;
            Global.floats[wrapId] = {};
            Global.floats[wrapId].update = update;
            update(wrapId, 1);
        }
	}

	// update content
	function update(wrapId, cnt){
		var $wrap = $('#'+ wrapId)
		var content = $wrap.find('.tpl').html();
		if(content.indexOf('${N}') > -1){
			$wrap.find('.fcontent').html(content.replace('${N}', cnt));
		}
	}
})();