cc.Class({
    extends: cc.Component,
    properties: {
        account:null,
	    userId:null,
		userName:null,
		lv:0,
		exp:0,
		coins:0,
		gems:0,
		sign:0,
        ip:"",
        sex:0,
        roomData:null,
        
        oldRoomId:null,
    },
    
    guestAuth:function(){
        var account = cc.args["account"];

        if(account == null){
            account = cc.sys.localStorage.getItem("account");
        }
        
        if(account == null){
            account = Date.now();
            cc.sys.localStorage.setItem("account",account);
        }

        cc.jzc.http.sendRequest("/guest",{account:account}, this.onAuth);
    },
    
    onAuth:function(ret){
        var self = cc.jzc.userMgr;
        if(ret.errcode !== 0){
            console.log(ret.errmsg);
        }
        else{
            self.account = ret.account;
            self.sign = ret.sign;
            cc.jzc.http.url = "http://" + cc.jzc.SI.hall;
            self.login();
        }   
    },
    
    login:function(){
        var self = this;
        var onLogin = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(!ret.userid){
                    //jump to register user info.
                    cc.director.loadScene("createrole");
                }
                else{
                    console.log(ret);
                    self.account = ret.account;
        			self.userId = ret.userid;
        			self.userName = ret.name;
        			self.lv = ret.lv;
        			self.exp = ret.exp;
        			self.coins = ret.coins;
        			self.gems = ret.gems;
                    self.roomData = ret.roomid;
                    self.sex = ret.sex;
                    self.ip = ret.ip;
        			cc.director.loadScene("hall");
                }
            }
        };
        cc.jzc.wc.show("正在登录游戏");
        cc.jzc.http.sendRequest("/login",{account:this.account,sign:this.sign},onLogin);
    },
    
    create:function(name){
        var self = this;
        var onCreate = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                self.login();
            }
        };
        
        var data = {
            account:this.account,
            sign:this.sign,
            name:name
        };
        cc.jzc.http.sendRequest("/create_user",data,onCreate);    
    },
    
    enterRoom:function(roomId,callback){
        var self = this;
        var onEnter = function(ret){
            if(ret.errcode !== 0){
                if(ret.errcode == -1){
                    setTimeout(function(){
                        self.enterRoom(roomId,callback);
                    },5000);
                }
                else{
                    cc.jzc.wc.hide();
                    if(callback != null){
                        callback(ret);
                    }
                }
            }
            else{
                if(callback != null){
                    callback(ret);
                }
                cc.jzc.gameNetMgr.connectGameServer(ret);
            }
        };
        
        var data = {
            account:cc.jzc.userMgr.account,
            sign:cc.jzc.userMgr.sign,
            roomid:roomId
        };
        cc.jzc.wc.show("正在进入房间 " + roomId);
        cc.jzc.http.sendRequest("/enter_private_room",data,onEnter);
    },
    getHistoryList:function(callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                console.log(ret.history);
                if(callback != null){
                    callback(ret.history);
                }
            }
        };
        
        var data = {
            account:cc.jzc.userMgr.account,
            sign:cc.jzc.userMgr.sign,
        };
        cc.jzc.http.sendRequest("/get_history_list",data,onGet);
    },
    getGamesOfRoom:function(uuid,callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                console.log(ret.data);
                callback(ret.data);
            }
        };
        
        var data = {
            account:cc.jzc.userMgr.account,
            sign:cc.jzc.userMgr.sign,
            uuid:uuid,
        };
        cc.jzc.http.sendRequest("/get_games_of_room",data,onGet);
    },
    
    getDetailOfGame:function(uuid,index,callback){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                console.log(ret.data);
                callback(ret.data);
            }       
        };
        
        var data = {
            account:cc.jzc.userMgr.account,
            sign:cc.jzc.userMgr.sign,
            uuid:uuid,
            index:index,
        };
        cc.jzc.http.sendRequest("/get_detail_of_game",data,onGet);
    }
});
