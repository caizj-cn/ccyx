var Net = require("Net")
var Global = require("Global")
cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label,
        lblMoney:cc.Label,
        lblGems:cc.Label,
        lblID:cc.Label,
        lblNotice:cc.Label,
        joinGameWin:cc.Node,
        createRoomWin:cc.Node,
        settingsWin:cc.Node,
        helpWin:cc.Node,
        xiaoxiWin:cc.Node,
        btnJoinGame:cc.Node,
        btnReturnGame:cc.Node,
        sprHeadImg:cc.Sprite,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },
    
    initNetHandlers:function(){
        var self = this;
    },
    
    onShare:function(){
        cc.jzc.anysdkMgr.share("全民麻将","全民麻将，包含了血战到底、血流成河等多种四川流行麻将玩法。");   
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if(!cc.jzc){
            cc.director.loadScene("loading");
            return;
        }
        this.initLabels();
        
        if(cc.jzc.gameNetMgr.roomId == null){
            this.btnJoinGame.active = true;
            this.btnReturnGame.active = false;
        }
        else{
            this.btnJoinGame.active = false;
            this.btnReturnGame.active = true;
        }
        
        //var params = cc.jzc.args;
        var roomId = cc.jzc.userMgr.oldRoomId 
        if( roomId != null){
            cc.jzc.userMgr.oldRoomId = null;
            cc.jzc.userMgr.enterRoom(roomId);
        }
        
        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(cc.jzc.userMgr.userId);
        cc.jzc.utils.addClickEvent(this.sprHeadImg.node,this.node,"Hall","onBtnClicked");
        
        
        this.addComponent("UserInfoShow");
        
        this.initButtonHandler("Canvas/right_bottom/btn_shezhi");
        this.initButtonHandler("Canvas/right_bottom/btn_help");
        this.initButtonHandler("Canvas/right_bottom/btn_xiaoxi");
        this.helpWin.addComponent("OnBack");
        this.xiaoxiWin.addComponent("OnBack");
        
        if(!cc.jzc.userMgr.notice){
            cc.jzc.userMgr.notice = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        if(!cc.jzc.userMgr.gemstip){
            cc.jzc.userMgr.gemstip = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        this.lblNotice.string = cc.jzc.userMgr.notice.msg;
        
        this.refreshInfo();
        this.refreshNotice();
        this.refreshGemsTip();
        
        cc.jzc.audioMgr.playBGM("bgMain.mp3");
    },
    
    refreshInfo:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    this.lblGems.string = ret.gems;    
                }
            }
        };
        
        var data = {
            account:cc.jzc.userMgr.account,
            sign:cc.jzc.userMgr.sign,
        };
        cc.jzc.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },
    
    refreshGemsTip:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.jzc.userMgr.gemstip.version = ret.version;
                cc.jzc.userMgr.gemstip.msg = ret.msg.replace("<newline>","\n");
            }
        };
        
        var data = {
            account:cc.jzc.userMgr.account,
            sign:cc.jzc.userMgr.sign,
            type:"fkgm",
            version:cc.jzc.userMgr.gemstip.version
        };
        cc.jzc.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    refreshNotice:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.jzc.userMgr.notice.version = ret.version;
                cc.jzc.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = ret.msg;
            }
        };
        
        var data = {
            account:cc.jzc.userMgr.account,
            sign:cc.jzc.userMgr.sign,
            type:"notice",
            version:cc.jzc.userMgr.notice.version
        };
        cc.jzc.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    initButtonHandler:function(btnPath){
        var btn = cc.find(btnPath);
        cc.jzc.utils.addClickEvent(btn,this.node,"Hall","onBtnClicked");        
    },
    
    
    
    initLabels:function(){
        this.lblName.string = cc.jzc.userMgr.userName;
        this.lblMoney.string = cc.jzc.userMgr.coins;
        this.lblGems.string = cc.jzc.userMgr.gems;
        this.lblID.string = "ID:" + cc.jzc.userMgr.userId;
    },
    
    onBtnClicked:function(event){
        if(event.target.name == "btn_shezhi"){
            this.settingsWin.active = true;
        }   
        else if(event.target.name == "btn_help"){
            this.helpWin.active = true;
        }
        else if(event.target.name == "btn_xiaoxi"){
            this.xiaoxiWin.active = true;
        }
        else if(event.target.name == "head"){
            cc.jzc.userinfoShow.show(cc.jzc.userMgr.userName,cc.jzc.userMgr.userId,this.sprHeadImg,cc.jzc.userMgr.sex,cc.jzc.userMgr.ip);
        }
    },
    
    onJoinGameClicked:function(){
        this.joinGameWin.active = true;
    },
    
    onReturnGameClicked:function(){
        cc.director.loadScene("mjgame");  
    },
    
    onBtnAddGemsClicked:function(){
        cc.jzc.alert.show("提示",cc.jzc.userMgr.gemstip.msg);
        this.refreshInfo();
    },
    
    onCreateRoomClicked:function(){
        if(cc.jzc.gameNetMgr.roomId != null){
            cc.jzc.alert.show("提示","房间已经创建!\n必须解散当前房间才能创建新的房间");
            return;
        }
        console.log("onCreateRoomClicked");
        this.createRoomWin.active = true;   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var x = this.lblNotice.node.x;
        x -= dt*100;
        if(x + this.lblNotice.node.width < -1000){
            x = 500;
        }
        this.lblNotice.node.x = x;
        
        if(cc.jzc && cc.jzc.userMgr.roomData != null){
            cc.jzc.userMgr.enterRoom(cc.jzc.userMgr.roomData);
            cc.jzc.userMgr.roomData = null;
        }
    },
});
