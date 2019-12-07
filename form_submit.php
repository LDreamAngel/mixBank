<!--公用表单 start-->
<style>
  .btn-code-active {
    opacity:0.5;
  }
  .qform-check-alert {position:fixed;left:0;right:0;top:0;bottom:0;z-index:100;display:none;}
  .qform-check-alert.active {display:block;}
  .qform-mask {  background-color:Gray; opacity:0.5;position:absolute; left:0px;right:0; top:0px;bottom:0;filter:alpha(opacity=50); /* IE6 */  -moz-opacity:0.5; /* Mozilla */  -khtml-opacity:0.5; /* Safari */  }
 .qform-check-main {  background-color:#FFF;  border:1px solid #888;width:360px;height:150px;position:absolute;  top:50%; left:50%;  margin:-75px 0 0 -180px;  padding:12px;      z-index:5;  }
 .qform-check-main p {margin:0 0 12px; }    
 .qform-alert-top { overflow:hidden; border-bottom:solid 1px #ccc; padding-bottom:10px  } 
 .qform-alert-close{ cursor:pointer;}
 .qform-alert-close a{ float:right}
 .qform-alert-btn input{ background:#09F; border:none; color:#fff; padding:5px 10px; margin:20px 0 0 0; cursor:pointer;float:right} 
 .qform-alert-btn{ overflow:hidden;}
</style>
<div class="qform-check-alert">
  <div class="qform-mask"></div>
  <div class="qform-check-main">
    <p class="qform-alert-top"><span style="float:left">请输入验证码</span><span onclick="qForm.closeImgCheck();" class="qform-alert-close" style="float:right">关闭</span></p>
    <div>
      <input class="qform-check-val"  type="text" maxlength="6" placeholder="验证码" style="height:36px" />
      <img style="cursor:pointer; height:44px" title="看不清,换一张"  src="<?php echo MAIN_WEB_ROOT ?>index/api/newCode" onclick="this.src='<?php echo MAIN_WEB_ROOT ?>index/api/newCode?t='+parseInt(40*Math.random())"/>
    </div>
    <div class="qform-alert-btn">
      <input onclick="qForm.postImgCheck()" type="button" value="确定" />
    </div>
</div>
</div>


<script>
  $(function () {
    if ($('[qform-root]').length > 0) {
      $('[qform-root]').each(function (index,el) {
        $(this).attr({'qform-id':index});
      });
    }
  });
  /*  标签        需加属性         name
   *  form      qform-root          action="<?php echo WANGXIAO_ROOT ?>form" method="post" onsubmit="return qForm.requestForm(this);" target="_blank"
   *  
   * 姓名      qform-name  required   姓名
   * 手机号    qform-phone required   手机号
   * 邮箱      qform-email required    邮箱
   * 多选框    qform-checkbox      qform-checkbox-name='多选键名'
   * 验证码    qform-code required     yzm
   * 获取验证码  qform-get-code    onclick="qForm.getPhoneCode(this);"
   * 其它标签  name 均为中文
   * value=表单类型参数
   * <input name="formid" type="hidden" value="assess_complex" />
   */
 
   var qForm = {
    wait: 60,//验证码等待时间
    //验证
    verification: {
      //是否是空
      isNullOrEmpty: function (str) {
        if ((str == "" || str == null || str == undefined || str == "undefined") && str != "0") {
          return true;
        } else {
          return false;
        }
      },
      //是否手机号
      isPhone: function (str) {
        if (/^0?1[345789]\d{9}$/.test(str)) {
          return true;
        } else {
          return false;
        }
      }
    }
    //点击获取验证码
    ,getPhoneCode: function (el) {
      var $dom = $(el);
      var $form = $dom.parents('[qform-root]');
      var phone = $form.find('[qform-phone]').val();
      if (this.verification.isNullOrEmpty(phone)) {
        alert('请填写手机号');
        return false;
      }
      if (!this.verification.isPhone(phone)) {
        alert('请填写正确的手机号');
        return false;
      }
      if (this.wait == 60) {
        this.showImgCheck($form.attr('qform-id'));
      }
      
    }
    //显示图片验证码弹窗
    , showImgCheck: function (qfromId) {
      $('.qform-check-alert').addClass('active').attr({'qfromId':qfromId});
    }
    //关闭图片验证码弹窗
    ,closeImgCheck: function () {
      $('.qform-check-alert').removeClass('active');
    }
    //提交图片验证码
     , postImgCheck: function () {
      var $dom = $('.qform-check-val');
      var val = $dom.val();
      var qfromId = $('.qform-check-alert').attr('qfromId');
        if (this.verification.isNullOrEmpty(val)) {
          alert('请填写验证码');
          return false;
      }
      $.ajax({
          type : "POST",
          dataType:"json",
          data:{
              'code':val
          },
          url :"<?php echo MAIN_WEB_ROOT ?>index/api/verfycode",
          success : function(res) {
              // 简单输出验证成功还是失败
            if (res.code == 0) {
              qForm.closeImgCheck();
              qForm.requestPhoneCode(qfromId);
            } else {
              alert('验证码错误');
            }
          }
      });
      //qForm.closeImgCheck();
      // qForm.requestPhoneCode(qfromId);
    }
    //获取手机验证码请求********************************************
    , requestPhoneCode: function (qfromId) {
      var $form = $('[qform-id =' + qfromId + ' ]');
      var phone = $form.find('[qform-phone]').val();
      var codeBtn = $form.find('[qform-get-code]');
        $.ajax({
        type: "post",
        url: "<?php echo WANGXIAO_ROOT ?>sms",
        //dataType: "jsonp",
        //jsonp: "callback",
        jsonpCallback: "sms_code",
        data: {
          phone: phone,
          type: 5,
          code: 86,
          source: 1
        },
        crossDomain:true,
        success: function (ret) {
          if (ret.code == 0) {
            alert("验证码已发送，请注意查收！");
            qForm.time(codeBtn);
          } else {
            alert(ret.data.msg);
          }
        },
        error: function () {
          alert('fail');
        }

      });
    }
    //60秒倒计时
    , time: function (codeBtn) {
      if (qForm.wait <= 0) {
        codeBtn.removeClass('btn-code-active');
        codeBtn.val("获取验证码");
        qForm.wait = 60;
      } else {
        if (!codeBtn.hasClass('btn-code-active')) {
          codeBtn.addClass('btn-code-active');
        }
        codeBtn.val(qForm.wait + "秒后获取")
        qForm.wait--;
        setTimeout(function () {
          qForm.time(codeBtn);
        }, 1000);
      }

    }
    //提交表单
    , requestForm: function (dom) {
      var form = $(dom);
      var phone = form.find('[qform-phone]').val();
      if (this.verification.isNullOrEmpty(phone)) {
        alert('请填写手机号');
        return false;
      }
      if (!this.verification.isPhone(phone)) {
        alert('请填写正确的手机号');
        return false;
      }
      if (form.find('[qform-code]').length > 0) {
        if (this.verification.isNullOrEmpty(form.find('[qform-code]').val())) {
          alert('请填写验证码');
          return false;
        }
      }
      //追加utm参数
      if (form.find('[qform-utm]').length > 0) {
        form.find('[qform-utm]').val(window.location.href);
      } else {
        form.append("<input qform-utm name='utm' type='hidden' value='" +window.location.href  + " ' />");
      }
      //追加path参数
      if (form.find('[qform-path]').length > 0) {
        form.find('[qform-path]').val(window.location.href.split('?')[0]);
      } else {
        form.append("<input qform-path name='path' type='hidden' value='" +window.location.href.split('?')[0]  + " ' />");
      }
      //追加phone参数
      if (form.find('[qform-phone-c]').length > 0) {
        form.find('[qform-phone-c]').val(phone);

      } else {
        form.append("<input qform-phone-c name='phone' type='hidden' value='" + phone+"'/>");
      }
      //获取radio值  qform-radio-checked='.active' 选中按钮元素类名 qform-radio-val 存放值的input
      if (form.find('[qform-radio]').length > 0) {
        form.find('[qform-radio]').each(function (i, el) {
          $(this).find('[qform-radio-val]').val($(this).find($(this).attr('qform-radio-checked')).text());
        });
      }
      //多选框
      if(form.find('[qform-checkbox]').length > 0){
        form.find('[qform-checkbox]').each(function(){
          var str = '';
          $(this).find('input:checked').each(function(){
            str += ($(this).val()+'、' ) ;
          });
          var str2 = str.replace(/\、$/,'');
          if($(this).find('[qform-checkbox-val]').length>0){
            $(this).find('[qform-checkbox-val]').val(str2);
          }else{
            $(this).append("<input qform-checkbox-val name='"+$(this).attr('qform-checkbox-name')+"' type='hidden' value='" + str2 +"'/>");
          }
        });
      }
      //追加重置表单
      if (form.find('[qform-reset]').length == 0) {
          form.append("<input qform-reset type='reset' style='display:none' />");
      }
      setTimeout(function () {
        form.find('[qform-reset]').click();//清空表单
      },500);
    }

  };
</script>
<!--公用表单 end-->