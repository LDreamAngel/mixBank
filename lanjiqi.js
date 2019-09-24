/*
 * @update 2018-5-22
 * */
'use strict'
import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'
import assetsConfig from '@/assets/js/config'
//全局设置URL地址

import { getContext } from '@/assets/js/initContext'
let timestamp = new Date().getTime();
//配置接口不同URL后缀
export const ajaxURL = {
	loginByMobile: 'authServer/app/login/loginByMobile',
	listUT: 'lm/config/key_list',
	menu: assetsConfig.oauthDomain + '/oauth2-intranet-server/internal/menu/currentModuleUserMenu',
	userInfoAll: assetsConfig.oauthDomain + '/oauth2-intranet-server/internal/user/info',
	getClient: assetsConfig.oauthDomain + '/oauth2-intranet-server/internal/oauth_authority/userBelongingClient',
	getout: assetsConfig.oauthDomain + '/oauth2-server/ssoLogout',
	radioList: '/equity/type/internal/radioList', // 权益类别
	saveImg: '/equity/image/internal/saveImg', // 上传图片

	my_equity_list: '/equity/info/channel/list', // 我的权益
	my_equity_put: '/equity/info/channel/update', // 修改权益
	my_equity_save: '/equity/info/channel/save', // 新增权益
	my_equity_id: '/equity/info/channel', // 删除 获取 权益

	equity_shop: '/equity/provider/internal/radioList',//供应商
	equity_shop_List: '/equity/provider/internal/getCouponList',//权益商场列表
	equity_shop_getCoupon: '/equity/provider/internal/getCoupon',//权益详情

	internal_save: '/equity/complete/internal/save',  //采购
	internal_list: '/equity/complete/internal/findEquityInfo',  //采购记录

	coupon_list: '/equity/coupon/channel/list', // 优惠券流水
	integral_list: '/equity/integral/channel/list' // 积分流水


}
// 超时时间
axios.defaults.baseURL = assetsConfig.baseDataUrl;
axios.defaults.timeout = 5000;
// 封装axios请求
axios.interceptors.request.use(config => {
	// MintUI Loading方法
	// Indicator.open();
	if (sessionStorage.getItem("open_userToken")) {//拦截器判断token携带token

		if (config.url && config.url.indexOf("/citic-log-collect/") > -1) {
			config.headers.common['Authorization'] = ' ';
		} else {
			config.headers.common['Authorization'] = 'Bearer ' + sessionStorage["open_userToken"];
			config.headers.common['Tenant'] = sessionStorage['tenantId']
			// config.headers.common['Tenant'] = 'c29403db0e114ed3a7bdd91dad9c7269'
		}

	}
	return config;
}, error => {
	// Indicator.close();
	// ZXToastMessage({
	//   title: '提示', //标题 如果不设置title 隐藏
	//   content: '加载超时',
	//   buttonType: 'oneButton',
	//   oneButton: {
	//     title: '确定'
	//   }
	// });
  getContext().Alert("提示","<p style=\"margin:10px 0 5px;\">加载超时</p>")
	return Promise.resolve(error);
});
// // http响应拦截器
axios.interceptors.response.use(response => {
	// 响应成功关闭loading
	// Indicator.close();
	if (response.data) {
		if (response.data.statusCode && response.data.statusCode !== 200) {
			let userCode = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 4003, 4004]
			// 20180604 优惠券或权益不存在
			// if (response.data.statusCode === 3601) {
			//     vm.$router.push({
			//         path: '/Weal'
			//     });
			//     return;
			// } else
			// if (response.data.statusCode === 401) {
			// 	sessionStorage.removeItem("open_userToken");
			// 	sessionStorage.removeItem("userInfo");
			// 	// axiosErrorHandler(response, 'goMsg');
			// 	setTimeout(function () {
			// 		getContext().$router.push({
			// 			path: '/login'
			// 		});
			// 	}, 1000);
			// 	// return false;
			// } else {
				//直接是弹出错误信息 20180515
        getContext().Alert("哎呦，出错了！","<p style=\"margin:10px 0 5px;\">"+response.data.message+"</p>")
				// axiosErrorHandler(response, 'goMsg');
			}
		// }
	}
	return response.data;
}, error => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // 返回 401 清除token信息并跳转到登录页面
        getContext().Alert("哎呦，出错了！","<p style=\"margin:10px 0 5px;\">用户信息异常,请重新登录!</p>")
        getContext().$router.push({
          path: '/login'
        });
        break;
      default:
        getContext().Alert("哎呦，出错了！","<p style=\"margin:10px 0 5px;\">系统信息异常,请重新登录!</p>")
    }
  }
	return Promise.resolve(error); // 返回接口返回的错误信息
});
function axiosErrorHandler(parJson, goTo) {
	if (parJson instanceof Error) {
		return;
	}
	let resUid, resErrorCode, resMsg;

	if (parJson.data.errorCode) {
		resErrorCode = parJson.data.errorCode;
	} else if (parJson.data.statusCode) {
		resErrorCode = parJson.data.statusCode;
	}
	if (parJson.data.msg) {
		resMsg = parJson.data.msg;
	} else if (parJson.data.message) {
		resMsg = parJson.data.message;
	}
	let timestamp = new Date().getTime();
	let apiUrl, reqParam;
	if (parJson.config) {
		apiUrl = parJson.config.url;
		reqParam = parJson.config.data;
	}
	let iPhone = ""
	if (sessionStorage.getItem("usermessage")) {
		let useMessage = JSON.parse(sessionStorage.getItem("usermessage"));
		iPhone = useMessage.phone;
	}
	// 请求错误的接口，给红健那边发过去，便于后台记录及查询。citic-log-collect/api/log/client/collect  citic-log-collect/api/log/client/collect
	// vm.$http.post(vm.pageData.baseDataUrl + 'authserver/errorHandler/log/send', {
	axios({
		method: 'post',
		url: assetsConfig.baseDataUrl + 'citic-log-collect/api/log/client/collect',
		headers: {
			'Content-Type': 'application/json'
		},
		data: {
			"userToken": sessionStorage.getItem("open_userToken") || "",
			"channelId": sessionStorage.getItem("lm_channelId") || "",
			"citicOpenId": "",
			"apiUrl": apiUrl || "",
			"reqParam": reqParam || "",
			"uid": "",
			"createTime": timestamp,
			"errorCode": resErrorCode,
			"phone": iPhone,
			"type": "lm-pubic-a",
			"msg": resMsg
		}
	}).then((response) => {
		if (goTo === 'goMsg') {
			getContext().Alert("哎呦，出错了！", "<p style=\"margin:10px 0 5px;\">${resMsg}</p>")
			// ZXToastMessage({
			//   title: '哎呦，出错了！', //标题 如果不设置title 隐藏
			//   content_html: `<p style="margin:10px 0 5px;">${resMsg}</p>
			//                       <p>发生了错误：#${resErrorCode}</p>
			//                       `,
			//   buttonType: 'oneButton',
			//   oneButton: {
			//     title: '确定'
			//   }
			// });
		} else if (goTo === 'goFirst') {
			getContext().$router.push({
				path: '/index'
			});
			return;
		} else if (goTo === 'error') {
			getContext().Alert("哎呦，出错了！", "<p style=\"margin:10px 0 5px;\">用户信息异常,请重新登录!</p>")
			// ZXToastMessage({
			//   title: '哎呦，出错了！', //标题 如果不设置title 隐藏
			//   content_html: `<p style="margin:10px 0 5px;">用户信息异常,请重新登录!</p>`,
			//   buttonType: 'oneButton',
			//   oneButton: {
			//     title: '确定'
			//   }
			// });
		}
	});
}
export default {
	post(url, data, urlParams) {
		let urlParam = ""

		if (urlParams) {
			urlParam = "/" + urlParams;
		}
		return new Promise((resolve, reject) => {
			axios({
				method: 'post',
				url: ajaxURL[url] + (urlParam ? urlParam : ""),
				data: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(res => {

				// window.ZXIndicator && ZXIndicator.close()
				return resolve(res)
			}).catch(err => {
				// window.ZXIndicator && ZXIndicator.close()
				reject(err)
			})
		})
	},
	get(url, params, urlParams) {
		let urlParam = ""
		if (urlParams) {
			urlParam = "/" + urlParams;
		}
		return new Promise((resolve, reject) => {
			axios({
				method: 'get',
				params,
				url: ajaxURL[url] + urlParam
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	deleteHttp(url, urlParams) {
		let urlParam = ""
		if (urlParams) {
			urlParam = "/" + urlParams;
		}
		return new Promise((resolve, reject) => {
			axios({
				method: 'delete',
				url: ajaxURL[url] + urlParam
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	getJson(url, params = {}, type) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'get',
				url: type ? url : ajaxURL[url],
				params
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	postByDate(url, params) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'post',
				url: ajaxURL[url],
				data: params,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	postTokenByHead(url, params, thatBasic) {

		return new Promise((resolve, reject) => {
			axios({
				method: 'post',
				url: ajaxURL[url],
				data: params,
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': 'Basic ' + thatBasic,
				}
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	put(url, data) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'put',
				url: ajaxURL[url],
				data: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(res => {
				return resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	getHttp(url, params) {
		return new Promise((resolve, reject) => {
			axios({
				method: 'GET',
				url: url,
				params,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	},
	postResetDefault(url, data, param = {}) {
		let urlParam = '';
		if (param.urlParams) {
			urlParam = "/" + param.urlParams;
		}

		return new Promise((resolve, reject) => {
			axios({
				method: 'post',
				url: ajaxURL[url] + (urlParam ? urlParam : ""),
				timeout: param.timeoutParam,
				data: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(res => {
				return resolve(res)
			}).catch(err => {
				reject(err)
			})
		})
	}

}
