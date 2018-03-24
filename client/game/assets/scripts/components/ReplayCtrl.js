cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _nextPlayTime:1,
        _replay:null,
        _isPlaying:true,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.jzc == null){
            return;
        }
        
        this._replay = cc.find("Canvas/replay");
        this._replay.active = cc.jzc.replayMgr.isReplay();
    },
    
    onBtnPauseClicked:function(){
        this._isPlaying = false;
    },
    
    onBtnPlayClicked:function(){
        this._isPlaying = true;
    },
    
    onBtnBackClicked:function(){
        cc.jzc.replayMgr.clear();
        cc.jzc.gameNetMgr.reset();
        cc.jzc.gameNetMgr.roomId = null;
        cc.director.loadScene("hall");
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(cc.jzc){
            if(this._isPlaying && cc.jzc.replayMgr.isReplay() == true && this._nextPlayTime > 0){
                this._nextPlayTime -= dt;
                if(this._nextPlayTime < 0){
                    this._nextPlayTime = cc.jzc.replayMgr.takeAction();
                }
            }
        }
    },
});
