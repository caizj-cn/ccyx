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
        target:cc.Node,
        sprite:cc.SpriteFrame,
        checkedSprite:cc.SpriteFrame,
        checked:false,
        groupId:-1,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.jzc == null){
            return;
        }
        if(cc.jzc.radiogroupmgr == null){
            var RadioGroupMgr = require("RadioGroupMgr");
            cc.jzc.radiogroupmgr = new RadioGroupMgr();
            cc.jzc.radiogroupmgr.init();
        }
        console.log(typeof(cc.jzc.radiogroupmgr.add));
        cc.jzc.radiogroupmgr.add(this);

        this.refresh();
    },
    
    refresh:function(){
        var targetSprite = this.target.getComponent(cc.Sprite);
        if(this.checked){
            targetSprite.spriteFrame = this.checkedSprite;
        }
        else{
            targetSprite.spriteFrame = this.sprite;
        }
    },
    
    check:function(value){
        this.checked = value;
        this.refresh();
    },
    
    onClicked:function(){
        cc.jzc.radiogroupmgr.check(this);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    onDestroy:function(){
        if(cc.jzc && cc.jzc.radiogroupmgr){
            cc.jzc.radiogroupmgr.del(this);            
        }
    }
});
