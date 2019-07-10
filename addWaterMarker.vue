<template>
	<div class="detail">
		<!-- <div id='addWaterMarker'></div> -->
		<div class="content">
			<loading v-show="loadBol"></loading>
			<div class="top" id='addWaterMarker1' v-if="isShow" v-show="comment.del_flag == 0">
				<!-- <div style="position: absolute; top:0;left:0;width:100%;" class="status_4" v-if="comment.status == 4 && lookShow == true">
					此为临时链接，仅用于预览，将在短期内失效
					<span @click="lookShow = false" class="closeBtn">
						<img src="../../assets/images/closeBtn.svg" alt="">
					</span>
				</div> -->
				<div class="title">{{comment.title}}</div>
				<div class="other">
					<p class="time">
						{{comment.create_time?comment.create_time.substr(0,10):''}} <span v-if="comment.sources" class="source">{{comment.sources}}</span>
					</p>
					<!-- <div class="count">
						<span class="like">{{comment.like_count}}</span>
						<span v-if="allow_reader_show==1" class="read">{{comment.read_count}}</span>
					</div> -->
				</div>
				<div class="con" id='top'>
					<div v-html='content'></div>
					<div class="count">
						<a v-if="original_link" class="originalLink" :href="original_link">阅读原文</a>
						<span class="like">{{comment.like_count}}</span>
						<span v-if="allow_reader_show==1" class="read">{{comment.read_count}}</span>
					</div>
					<div class="files" id="files" v-if="comment.files" @click="down(comment.files)">附件：{{comment.files_name}}</div>
					<ul class="tagList" id="tagList">
						<li class="tagItem" v-for="(item,index) in tags" :key="index">
							{{item.name}}
						</li>
					</ul>
				</div>
			</div>
			<p class="nodata" v-if="noData" v-show="comment.del_flag == 0">您无法查看该新闻</p>
			<!-- <p class="nodata" v-if="comment.del_flag == 1" >该新闻已删除</p> -->
			<error1 v-if="comment.del_flag == 1"></error1>
			<!-- <error v-if="revoke"></error> -->
			<error1 v-if="revoke"></error1>
			<div class="com">
				<news-comment ref="newsComment" :isdelComment='isdelComment' :remove="remove" :newsCommentList='newsCommentList'></news-comment>
			</div>

		</div>
		<footer v-if="comment.del_flag != 1 && !revoke "  :class="[!issue? 'foot' : '']">
			<!-- <a class="return" @click="$router.go(-1)"></a> -->
			<textarea v-if="comment.del_flag == 0" style="resize:none" v-show="destoon_comment_ban" v-model="commentIssue" :class="[!issue? 'input' : '']" type="text" @focus="focus()" @blur="blur()" placeholder="整点啥不？"></textarea>
			<div v-show="comment.del_flag == 0" class="handle" :class="[!issue? 'handleShow' : '']">
				<router-link v-show="destoon_comment_ban" tag="span" :to="{name: 'observer' , params: {id : `${id}` , corpId : `${corpId}`}}" v-if="issue" class="comment">
					<b v-if="commontNum!=0">{{commontNum}}</b>
				</router-link>
				<p @click="submit()" v-else class="issue" :class="[activeIssue ? 'activeIssue' : '']">发布</p>
				<span v-if="issue" class="like" :class="[likeActive ? 'likeActive':'']" @click="like()"></span>
				<span v-if="issue" v-show="comment.ifInside" class="collect" :class="[storeActive ? 'storeActive':'']" @click="store()"></span>
			</div>
		</footer>
	</div>
</template>
<script>
import newsComment from "./newsComment";
import loading from "../public/loading";
import error from "../public/error";
import error1 from "../public/error1";
import axios from "axios";
import { wxjssdk } from "../../wxJsSdk/index.js";
import { getNewsDetail,getUserNewsStatus, readNews, commentNews, getLike, store, newsCommentList, remove } from '../../api/news'

export default {
	name: "contentDetails",
	components: { newsComment, loading,error,error1 },
	data() {
		return {
			title: "内容详情",
			comment: {},
			tags: [], //标签
			content: "", //内容
			id: "", //新闻id
			isShow: false,
			issue: true,
			activeIssue: false,
			commentIssue: "",
			newsCommentList: [],
			isdelComment:true,
			likeActive: false, //点赞
			storeActive: false, //收藏
			loadBol: false, //加载中
			commontNum: 0, //评论数
			noData: false, //是否有权限查看该新闻
			isLike: true, //禁止连续点击点赞
			isStore: true, //禁止连续点击收藏
			destoon_comment_ban: false, //是否可以评论
			// fixCompData: [], // 是否允许分享的配置信息
			corpId: "", // 企业id
			allow_reader_show: 0,//是否显示阅读人数
			anchor: true, //锚点

			revoke: false,  // 新闻撤销

			lookShow: true,  // 预览链接显示
			original_link:'', // 原文链接
		};
	},
	methods: {
		down(url) {
			// const a = document.createElement('a');
			// var href = "/resources/res/test.zip" //需要是英文名称
			// a.setAttribute('href', href);
			// a.download = "测试.zip";//下载到本地的文件名称
			// a.click();
			// // console.log(21312)
			window.location.href = url;
		},
		//获取新闻
		getDetail() {
			let data = {
				id: this.id,
				corpId: this.corpId,
				agentId: sessionStorage['agentId'] == 0? '' : sessionStorage['agentId']
			};
			this.loadBol = true;
			return getNewsDetail(data, r => {
				if (r.data.code == 1) {
					// alert(r.data.message)
					this.revoke = true
				}
				let data = r.data.data || {}
				this.comment = data || [];
				if (data.outlink) {
					window.location.replace(data.outlink)
					return false;
				}
				this.loadBol = false;
				this.allow_reader_show = data.allow_reader_show;
				this.original_link = data.original_link
				if (!data || !data.title) {
					this.noData = true;
					return false;
				}
				if (data.ifInside) {
					if (data.allow_member_comment == 0) {
						this.destoon_comment_ban = false;
					} else {
						this.destoon_comment_ban = true;
					}
				} else {
					if (data.allow_anonymous_comment == 0) {
						this.destoon_comment_ban = false;
					} else {
						this.destoon_comment_ban = true;
					}
				}
				axios.get(data.contentOssUrl).then(r => {
					this.content = r.data;
					this.tags = JSON.parse(this.comment.tags);
					this.$nextTick(() => {
						var video = document.querySelectorAll('.edui-upload-video')
						var topWidth = document.querySelector('#top').clientWidth;
						var topHeight = topWidth *0.67;
						if (video.length>0) {
							for (var i=0; i<video.length; i++) {
								this.$video(video[i],{
									width:topWidth,
									height:topHeight,
								})
							}
						}
					});
				});
				if (data.title.length) {
					this.isShow = true;
				}
				if (data.allow_share == 0 && this.isStore) {
					this.$nextTick(()=>{
						this.addWaterMarker(data.createBy); //水印
					})	
				}
				this.commontNum = data.content_count;
				this.getNewsCommentList(); //获取评论
				this.getUserNewsStatus();
			});
		},
		// 获取新闻用户操作详情
		getUserNewsStatus(){
			let data = {
				id: this.id,
				corpId: this.corpId
			};
			getUserNewsStatus(data,r=>{
				let data_ = r.data.data || {}
				this.likeActive = data_.isLike;
				this.storeActive = data_.isStore;
				let data_01 = {
					newsId: this.id,
					corpId: this.corpId
				};
				if (!data_.isRead) {
					readNews(data_01, r => { });
				}
			})
		},
		//获取评论
		getNewsCommentList() {
			let data = {
				limit: 8,
				offset: 0,
				newsId: this.id,
				corpId: this.corpId
			};
			newsCommentList(data, r => {
				this.newsCommentList = r.data.data || [];
			});
		},
		//得焦
		focus() {
			this.issue = false;
		},
		//失焦
		blur() {
			if (this.commentIssue) {
			  return;
			}
			document.querySelector("textarea").blur();
			this.issue = true;
			this.activeIssue = false;
		},
		//发布评论
		submit() {
			if (this.activeIssue) {
				let data = {
					newsId: this.id,
					content: this.commentIssue,
					corpId: this.corpId
				};
				commentNews(data, r => {
					this.getNewsCommentList();
					this.commontNum = this.commontNum * 1 + 1;
					this.$refs.newsComment.isHeight();
				});
				this.commentIssue = "";
				this.activeIssue = false;
				this.issue = true;
			}
			this.$forceUpdate();
		},
		//点赞
		like() {
			let data = {
				newsId: this.id,
				corpId: this.corpId
			}
			if (this.isLike) {
				this.isLike = false;
				this.likeActive = !this.likeActive;
				getLike(data, r => {
					if (r.data.code == 0) {
						this.isLike = true;
						if (!this.likeActive) {
							this.comment.like_count -= 1;
						} else {
							this.comment.like_count = this.comment.like_count * 1 + 1;
						}
						this.$forceUpdate();
					} else {
						this.likeActive = !this.likeActive;
						this.isLike = true;
					}

				});
			}
		},
		//收藏
		store() {
			let data = {
				newsId: this.id,
				corpId: this.corpId
			};
			if (this.isStore) {
				this.isStore = false;
				this.storeActive = !this.storeActive;
				store(data, r => {
					if (r.data.code == 0) {
						this.isStore = true;
					} else {
						this.storeActive = !this.storeActive;
						this.isStore = true;
					}
				});
			}
		},
		//删除评论
		remove(id) {
			let data = {
				id,
				corpId: this.corpId
			};
			this.isdelComment = false
			remove(data, r => {
				this.isdelComment = true
				if(this.commontNum > 0){
					this.commontNum--;
				}
				this.newsCommentList.forEach((r, index) => {
					if (r.id == id) {
						this.newsCommentList.splice(index, 1);
					}
				});
			});
		},
		//水印
		addWaterMarker() {
			var str = sessionStorage["userName"]
				? decodeURI(sessionStorage["userName"])
				: "管理员";
			var can = document.createElement("canvas");
			var addWaterMarker = document.getElementById("addWaterMarker1");
			addWaterMarker.appendChild(can);
			can.width = 160;
			can.height = 120;
			can.style.display = "none";

			var cans = can.getContext("2d");
			cans.rotate(-20 * Math.PI / 180);
			cans.font = "20px 微软雅黑";
			cans.fillStyle = "rgba(17, 17, 17, 0.1)";
			cans.textAlign = "left";
			cans.textBaseline = "top";
			cans.fillText(str, 20, 60);
			addWaterMarker.style.backgroundImage =
				"url(" + can.toDataURL("image/png") + ")";

			// addWaterMarker.style.height =
			// 	document.getElementById("top").clientHeight + 100 + "px";
		},
		async delayedShare() {
			await this.getDetail();
		},
		// getGroupTicket() {
		//   let data = {
		//     resultUrl: process.env.API_WEB_ROOT + "/news/contentDetails/"+this.id
		//   };
		//   this.$api.get("wechat/ticket/getGroupTicket", data, r => {
		//     this.fixCompData = r.data
		//   });
		// },
		setTitle (t) {
			document.title = t || '';
			var i = document.createElement('iframe');
			i.src = '/favicon.ico';
			i.style.display = 'none';
			i.onload = function() {
				setTimeout(function(){
					i.remove();
				}, 0)
			}
			document.body.appendChild(i);
		}
	},
	created () {
		let oHeigth = window.innerHeight;
		let that = this;
		window.addEventListener("resize", () => {
			let iHeight = window.innerHeight;
			oHeigth > iHeight ? "" : this.blur();
		});
		function isWeixinBrowser() {
			var agent = navigator.userAgent.toLowerCase();
			if (agent.match(/MicroMessenger/i) == "micromessenger") {
				return true;
			} else {
				return false;
			}
		}
		// if (!isWeixinBrowser()) {
		//   document.head.innerHTML = '<title>抱歉，出错了</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"><link rel="stylesheet" type="text/css" href="https://res.wx.qq.com/connect/zh_CN/htmledition/style/wap_err1a9853.css">';
		//   document.body.innerHTML = '<div class="page_msg"><div class="inner"><span class="msg_icon_wrp"><i class="icon80_smile"></i></span><div class="msg_content">请在微信客户端打开链接</div></div></div>';
		// }
		this.id = this.$route.params.id;
		this.corpId = this.$route.params.corpId;
		this.$util.getUrlParam(this, "/contentDetails/" + this.id + this.corpId);
		// this.getDetail()
		// wxjssdk(location.href.split("#")[0], false, this.comment.corp_id, {})
		this.delayedShare()
			.then(res => {
				var share = false;
				if (this.comment.allow_share == "1") {
					share = true;
				}
				if (this.comment.agentTitle) {
					this.setTitle(this.comment.agentTitle)
				} else {
					this.setTitle('企业头条')
				}
				if (this.comment.outlink){
					return false
				}
				wxjssdk(location.href.split("#")[0], share, this.comment.corp_id, {
					title: this.comment.title,
					desc: this.comment.description,
					link:
					location.origin +
					"/work-weixin-cms-server?redirect_url=" +
					location.href.split("?")[0]+'?agentId='+sessionStorage['agentId'],
					imgUrl: this.comment.cover_image
				});
				// }
			})
			.catch(err => {
				// alert(err)
				console.dir(err)
			});


	},
	// mounted () {
	// 	if (sessionStorage['title']) {
	// 			this.setTitle(sessionStorage['title'])
	// 	} else {
	// 		this.setTitle('企业头条')
	// 	}
	// },
	updated() {
		if (this.commentIssue.length) {
			this.activeIssue = true;
		}
		if (this.comment.anchor) {
			var anchor = document.getElementsByName(this.comment.anchor)[0];
			if (this.anchor) {
				if (anchor) {
					this.anchor = false
					document.querySelector(`[name=${this.comment.anchor}]`).scrollIntoView();
				}
			}
		}

	}
}
</script>
<style lang="scss" scoped>
.status_4{
	height: 0.4rem;
	line-height: 0.4rem;
	width: 100%;
	padding-left: 0.1rem;
	background: rgba($color: #4E79AD, $alpha: 0.8);
	color: #fff;
	text-align: center;
	font-size: 12px;
}
#addWaterMarker {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right:0;
	height: 100%;
	width: 100%;
	z-index: 1;
	background: #fff;
}

#files {
	position: relative;
	z-index: 9999;
	padding-bottom: 20px;
}

.return {
	position: absolute;
	bottom: 0.18rem;
	left: 0.16rem;
	border-left: 2px solid #cecece;
	border-top: 2px solid #cecece;
	transform: rotate(-45deg);
	display: inline-block;
	cursor: pointer;
	width: 8px;
	height: 8px;
}

.nodata {
	text-align: center;
	color: #aaa;
	margin-top: 0.4rem;
}

.detail {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	// background: #fff;
	overflow: hidden;
	position: relative;
	font-size: 0.14rem;
	font-family: "Helvetica Neue",Helvetica,"Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
	.head {
		height: 0.45rem;
		width: 100%;
	}
	.closeBtn{
		height: .4rem;
		width: .2rem;
		float:right;
		margin-right:.2rem;
		img {
			height: .2rem;
			width: .2rem;
			vertical-align: middle;
		}
	}
	.content {
		flex: 1;
		-webkit-overflow-scrolling: touch;
		overflow: auto;
		overflow-x: hidden;
		// background: #eee;
		padding-bottom: 0.45rem;
		// position: relative;
		// z-index: 5;
		// width: 100%;
		// height: 100%;
		// box-sizing: border-box;
		.top {
			background-color: #fff;
			margin-bottom: 0.15rem;
			// position: relative;
			.other {
				// position: relative;
				padding: 0 0.16rem 0.16rem;
				.time {
					// position: absolute;
					// left: 0;
					// font-size: 0.10rem;
					font-size: 0.16rem;
					color: #7f7f7f;
					// overflow: hidden;
					// text-overflow:ellipsis;
					// white-space: nowrap;
					line-height: 0.24rem;
					// max-width: 2.8rem;
					// .source{
					// 	margin-left: 8px;
					// }
				}
			}
			.title {
				padding: 0.2rem 0.16rem 0.05rem;

				// padding-top: 0.2rem;
				// padding-bottom: 0.05rem;
				// font-size: 0.16rem;
				font-size: 0.27rem;
				line-height: 0.35rem;
				color: #000;
				word-break:break-all;
				word-wrap: break-word;
			}
			.con {
				// font-size: 0.12rem;
				padding-bottom: 0.2rem;
				margin: 0 0.16rem;
				font-size: 0.17rem;
				color: #555;
				line-height: 1.8;
				// padding-bottom: 0.2rem;
				.tagList {
					margin-top: 0.08rem;
					&:after {
						content: "";
						display: block;
						visibility: hidden;
						height: 0;
						clear: both;
					}
					.tagItem {
						float: left;
						height: 0.24rem;
						padding: 0 0.1rem;
						text-align: center;
						line-height: 0.24rem;
						border: 1px solid #cccccc;
						color: #cfcfcf;
						border-radius: 0.04rem;
						margin: 0.06rem 0.1rem 0.06rem 0;
					}
				}
				.count {
					// position: absolute;
					// right: 0;
					height: 0.37rem;
					padding-top: 0.03rem;
					// text-align: right;
					span {
						color: #cccccc;
						padding-left: 0.14rem;
						background-repeat: no-repeat;
						background-position: left center;
					}
					.originalLink{
						margin-right: 0.14rem;
						color: #0C4C7F;
					}
					.like {
						background-size: 0.12rem 0.12rem;
						background-image: url(../../assets/images/zan2.png);
						margin-right: 0.14rem;
					}
					.read {
						background-image: url(../../assets/images/read.png);
						background-size: 0.12rem 0.1rem;
					}
				}
			}
		}
		.com {
			width: 100%;
			.itemBottom {
				// font-size: 14px;
				font-size: 0.14rem;
				height: 0.75rem;
				width: 100%;
				line-height: 0.75rem;
				text-align: center;
				color: #aaa;
			}
		}
	}
	.foot {
		height: 0.96rem !important;
	}
	footer {
		// display: block;
		box-sizing: border-box;
		position: fixed;
		bottom: 0;
		height: 0.45rem;
		width: 100%;
		background: #fff;
		padding-left: 0.14rem;
		line-height: 0.45rem;
		// font-size: 12px;
		font-size: 0.14rem;
		z-index: 10000;
		border-top:0.02rem solid #eee; 
		textarea {
			position: absolute;
			top: 50%;
			left: 0.39rem;
			transform: translateY(-50%);
			padding-left: 0.1rem;
			height: 0.2rem;
			line-height: 0.2rem;
			width: 1.86rem;
			border-radius: 0.125rem;
			border: 1px solid #cccccc;
			color: #aaa;
		}
		.input {
			height: 0.72rem;
			width: 2.6rem;
		}
		.handle {
			float: right;
			padding-right: 0.12rem;
			height: 100%;
			padding-top: 0.125rem;
			p {
				width: 0.4rem;
				position: absolute;
				bottom: 0;
				right: 0;
			}
			span {
				float: left;
				height: 0.2rem;
				width: 0.2rem;
				background-size: 100% 100%;
				margin-right: 0.24rem;
			}
			.comment {
				background-image: url(../../assets/images/pinglun.png);
				position: relative;
				b {
					position: absolute;
					top: -0.11rem;
					right: -0.11rem;
					height: 0.25rem;
					width: 0.25rem;
					padding: 0.02rem;
					color: #fff;
					// font-size: 20px;
					font-size: 0.2rem;
					transform: scale(0.5);
					transform-origin: right top;
					line-height: 0.22rem;
					border: 5px solid #fff;
					text-align: center;
					background: red;
					border-radius: 50%;
				}
			}
			.like {
				background-image: url(../../assets/images/zan.png);
			}
			.likeActive {
				background-image: url(../../assets/images/zan3.png);
			}
			.collect {
				background-image: url(../../assets/images/shoucang.png);
				margin: 0;
			}
			.storeActive {
				background-image: url(../../assets/images/xing.png);
			}
			.issue {
				// font-size: 15px;
				font-size: 0.16rem;
				color: #ccc;
				padding-right: 0.1rem;
			}
			.activeIssue {
				font-weight: 600;
				color: #26aff7;
			}
		}
		.handleShow {
			padding-top: 0;
			line-height: 0.45rem;
		}
	}
}
</style>
<style>
  #top img,#top embed,#top iframe, #top video{
    max-width: 100% !important;
  }
  #top p{
    word-break: break-all;
	word-wrap:break-word;
  }
</style>

