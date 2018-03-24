cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel:cc.Label,
        _stateStr:'',
        _progress:0.0,
        _splash:null,
        _isLoading:false,
    },

    // use this for initialization
    onLoad: function () {

        // cc.sys.isNative: true-mobile false-web
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        this.initMgr();
        this.tipLabel.string = this._stateStr;
        
        this._splash = cc.find("Canvas/splash");
        // this._splash.active = true;
    },
    
    start:function(){        
        // var self = this;
        // var SHOW_TIME = 3000;
        // var FADE_TIME = 500;
        // if(cc.sys.os != cc.sys.OS_IOS || !cc.sys.isNative){
        //     self._splash.active = true;
        //     var t = Date.now();
        //     var fn = function(){
        //         var dt = Date.now() - t;
        //         if(dt < SHOW_TIME){
        //             setTimeout(fn,33);
        //         }
        //         else {
        //             var op = (1 - ((dt - SHOW_TIME) / FADE_TIME)) * 255;
        //             if(op < 0){
        //                 self._splash.opacity = 0;
        //                 self.checkVersion();
        //             }
        //             else{
        //                 self._splash.opacity = op;
        //                 setTimeout(fn,33);   
        //             }
        //         }
        //     };
        //     setTimeout(fn,33);
        // }
        // else{
        //     this._splash.active = false;
        //     this.checkVersion();
        // }
        this._splash.active = false;
        this.checkVersion();
    },
    
    initMgr:function(){
        cc.jzc = {};
        var UserMgr = require("UserMgr");
        cc.jzc.userMgr = new UserMgr();
        
        var ReplayMgr = require("ReplayMgr");
        cc.jzc.replayMgr = new ReplayMgr();
        
        cc.jzc.http = require("HTTP");
        cc.jzc.global = require("Global");
        cc.jzc.net = require("Net");
        
        var GameNetMgr = require("GameNetMgr");
        cc.jzc.gameNetMgr = new GameNetMgr();
        cc.jzc.gameNetMgr.initHandlers();
        
        var AnysdkMgr = require("AnysdkMgr");
        cc.jzc.anysdkMgr = new AnysdkMgr();
        cc.jzc.anysdkMgr.init();
        
        var VoiceMgr = require("VoiceMgr");
        cc.jzc.voiceMgr = new VoiceMgr();
        cc.jzc.voiceMgr.init();
        
        var AudioMgr = require("AudioMgr");
        cc.jzc.audioMgr = new AudioMgr();
        cc.jzc.audioMgr.init();
        
        var Utils = require("Utils");
        cc.jzc.utils = new Utils();
        
        cc.args = this.urlParse();
    },
    
    // 检测是否有测试账号输入
    urlParse:function(){
        var params = {};
        if(window.location == null){
            return params;
        }

        console.log(window);
        console.log(window.location);

        var name,value; 
        var str = window.location.href; //取得整个地址栏
        var num = str.indexOf("?") 
        str = str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]
        
        var arr = str.split("&"); //各个参数放到数组里
        for(var i = 0; i < arr.length; i++){ 
            num = arr[i].indexOf("="); 
            if(num > 0){ 
                name  = arr[i].substring(0, num);
                value = arr[i].substr(num + 1);
                params[name] = value;
            } 
        }
        return params;
    },
    
    // 检测游戏版本
    checkVersion:function(){
        var self = this;
        var onGetVersion = function(ret){
            console.log(ret);
            if(ret.version == null){
                console.log("error.");
            }
            else{
                cc.jzc.SI = ret;
                if(ret.version != cc.VERSION){
                    cc.find("Canvas/alert").active = true;
                }
                else{
                    self.startPreloading();
                }
            }
        };
        
        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            self._stateStr = "正在连接服务器";
            xhr = cc.jzc.http.sendRequest("/get_serverinfo",null,function(ret){
                xhr = null;
                complete = true;
                onGetVersion(ret);
            });
            setTimeout(fn,5000);            
        }
        
        // 连接失败5秒后重试
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    self._stateStr = "连接失败，即将重试";
                    setTimeout(function(){
                        fnRequest();
                    },5000);
                }
                else{
                    fnRequest();
                }
            }
        };
        fn();
    },
    
    // 更新版本
    onBtnDownloadClicked:function(){
        cc.sys.openURL(cc.jzc.SI.appweb);
    },
    
    // 开始加载资源
    startPreloading:function(){
        this._stateStr = "正在加载资源，请稍候";
        this._isLoading = true;
        var self = this;
        
        // 加载资源
        cc.loader.loadResDir("textures",
            // 加载进度
            function ( completedCount, totalCount,  item ){
                if(self._isLoading){
                    self._progress = completedCount * 1.0 /totalCount;
                }
            },

            // 加载完成
            function (err, assets) {                
                self.onLoadComplete();
            });
    },
    
    // 加载完成
    onLoadComplete:function(){
        this._isLoading = false;
        this._stateStr = "准备登陆";
        cc.director.loadScene("login");
        cc.loader.onComplete = null;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // 更新资源加载进度
        if(this._stateStr.length == 0){
            return;
        }
        this.tipLabel.string = this._stateStr + ' ';
        if(this._isLoading){
            this.tipLabel.string += Math.floor(this._progress * 100) + "%";
        }
        else{
            var t = Math.floor(Date.now() / 1000) % 4;
            for(var i = 0; i < t; ++ i){
                this.tipLabel.string += '.';
            }            
        }
    }
});