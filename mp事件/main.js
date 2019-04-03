import Vue from 'vue'
import App from './App.vue'
import './assets/js/session'
import 'babel-polyfill'

import 'lib-flexible/flexible.js'
import './assets/css/reset.css'
import './assets/css/style.css'

import './assets/css/nainbeast.css'

import router from './router/index'

// import store from './store/index'
//引入mint-ui组件
import Indicator from 'mint-ui/lib/indicator'
import 'mint-ui/lib/indicator/style.css'
// Indicator
import './assets/css/style.css'

import Toast from 'mint-ui/lib/toast'
import 'mint-ui/lib/toast/style.css'
import Spinner from 'mint-ui/lib/spinner';
import 'mint-ui/lib/spinner/style.css'
import { loadBFDFile } from "./assets/js/loadFile";
import {projectConfig} from "./assets/config";
import {ZXToastMessage} from '@/components/zx-toast'
import VConsole from 'vconsole/dist/vconsole.min.js' //import vconsole
import vueTouch from './assets/js/touch.js'
Vue.component(Spinner.name, Spinner);
Vue.prototype.assetsConfig = projectConfig;
window.Indicator = Indicator;
window.Toast = Toast;
window.ZXToastMessage = ZXToastMessage; //公用提示框
// new VConsole()
function queryString(key, url = window.location.href) {
    let val = url.match(new RegExp('[?&]' + key + '=([^&]*)(&?)', 'i'));
    return val ? val[1] : val;
}


let activityId = queryString('activityId');
if (activityId) {
    sessionManager.activityId = activityId;
} else {
    sessionManager.activityId = 12;
}

Vue.directive("tap",{//点击事件
    bind:function(el,binding){
        new vueTouch(el,binding,"tap");
    }
});
Vue.directive("swipe",{//滑动事件
    bind:function(el,binding){
        new vueTouch(el,binding,"swipe");
    }
});
Vue.directive("swipeleft",{//左滑事件
    bind:function(el,binding){
        new vueTouch(el,binding,"swipeleft");
    }
});
Vue.directive("swiperight",{//右滑事件
    bind:function(el,binding){
        new vueTouch(el,binding,"swiperight");
    }
});
Vue.directive("swipedown",{//下滑事件
    bind:function(el,binding){
        new vueTouch(el,binding,"swipedown");
    }
});
Vue.directive("swipeup",{//上滑事件
    bind:function(el,binding){
        new vueTouch(el,binding,"swipeup");
    }
});
Vue.directive("longtap", {//长按事件
    bind: function (el, binding) {
        new vueTouch(el, binding, "longtap");
    }
})

export const vm = new Vue({
    // store,
    router,
    render: h => h(App)
}).$mount('#app')

