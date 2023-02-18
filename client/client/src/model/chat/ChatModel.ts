class ChatModel extends BaseModel {

    private _friendMsgMap = new Map<number, ChatMsgInfo>();
    private allFriendUnreadNum = 0;

    private normalMsgInfo = new ChatMsgInfo();

    selectUid: number = -1;


    getUnreadNumByType(type: ChatPto.MsgType) {
        switch (type) {
            case ChatPto.MsgType.normal:
                return this.normalMsgInfo.unreadNum;
            case ChatPto.MsgType.private:
                return this.allFriendUnreadNum;
            default:
                return -1;
        }
    }

    clearUnreadByType(type: ChatPto.MsgType) {
        switch (type) {
            case ChatPto.MsgType.normal:
                this.normalMsgInfo.unreadNum = 0;
                break;
            case ChatPto.MsgType.private:
                this.allFriendUnreadNum = 0;
                break;
        }
    }


    getMsgArrByType(type: ChatPto.MsgType) {
        switch (type) {
            case ChatPto.MsgType.normal:
                return this.normalMsgInfo.msgArr;
            case ChatPto.MsgType.private:
                return this.getFriendMsg(this.selectUid).msgArr;
        }
    }

    getFriendMsg(uid: number) {
        let info = this._friendMsgMap.get(uid);
        if (!info) {
            info = new ChatMsgInfo();
            this._friendMsgMap.set(uid, info);
        }
        return info;
    }

    //收到信息
    private S_CHAT_MESSAGE(msg: ChatPto.S_CHAT_MESSAGE) {
        let info: ChatMsgInfo;
        if (msg.msgType === ChatPto.MsgType.private) {
            this.allFriendUnreadNum++
            info = this.getFriendMsg(msg.uid);
        } else if (msg.msgType === ChatPto.MsgType.normal) {
            info = this.normalMsgInfo;
        }
        info.unreadNum++;

        info.msgArr.push(msg);
        if (info.msgArr.length > 30) {
            info.msgArr.shift();
        }
        this.emit('S_CHAT_MESSAGE', msg)
    }


    /**
     * 如果是私聊信息则必须有uid
     */
    C_SEND_MESSAGE(message: string, msgType: ChatPto.MsgType,) {
        const msg = new ChatPto.C_SEND_MESSAGE();
        msg.uid = this.selectUid;
        msg.msg = message;
        msg.msgType = msgType;
        this.sendMsg(msg);
    }
}

