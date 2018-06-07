import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import act from './modules/act'

Vue.use(Vuex)

export default new Vuex.Store({
	// actions,
	modules:{
		act
	}
});
