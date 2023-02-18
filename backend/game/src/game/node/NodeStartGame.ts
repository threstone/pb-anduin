import { GamePto } from '../../../../common/CommonProto';
import { NodeDefine, NodeDriverResult } from '../GameDefine';
import { GlobalVar } from '../../GlobalVar';
import { NodeDriver } from '../../core/NodeDriver';
import { GameTable } from '../GameTable';
import { GameUser } from '../GameUser';
import { BaseNode } from './BaseNode';

//游戏开始,确定先后手、换牌、后手多硬币
export class NodeStartGame extends BaseNode {

    constructor(driver: NodeDriver) {
        super(NodeDefine.GameStart, driver);
    }

    public run(table: GameTable): NodeDriverResult {
        this.deal(table);
        this.nodeDriver.waitTime(GlobalVar.configMgr.common.replaceCardTime);
        return NodeDriverResult.Wait;
    }

    //跳到下一节点
    public onWaitTimeArrive(table: GameTable): NodeDriverResult {
        return NodeDriverResult.GoOn;
    }

    /**玩家操作换牌 */
    public trigger(user: GameUser, table: GameTable, msg: GamePto.C_PREPARE_TO_START) {
        if (user.isReplace) {
            return;
        }

        //替换卡牌
        const replay = new GamePto.S_REPLACE_CARDS();
        replay.uid = user.uid;
        for (let index = 0; index < msg.replaceCardIndexes.length; index++) {
            const cardIndex = msg.replaceCardIndexes[index];
            //被替换的卡牌
            const replaceCardId = user.handCards[cardIndex];
            if (!replaceCardId) {
                continue;
            }
            user.replaceIndexes.push(cardIndex);
            //替换掉卡牌
            user.handCards[cardIndex] = user.cardPool.pop();
            replay.replaceCardIndexes.push(cardIndex);
            //将卡牌重新放入卡池
            user.cardPool.push(replaceCardId);
        }

        //如果插入了卡牌,洗牌
        if (msg.replaceCardIndexes.length !== 0) {
            table.shuffle(user.cardPool);
        }

        //发送替换卡牌消息
        replay.cards = user.handCards;
        user.isReplace = true;
        user.sendMsg(replay);

        //检查是否所有玩家都换牌了
        if (this.isAllUserReplace(table)) {
            //广播换牌信息
            this.brodcastReplaceMsg(user, table);
            return NodeDriverResult.GoOn;
        }
        return NodeDriverResult.Continue;
    }

    /**检查是否所有玩家都换牌了 */
    private isAllUserReplace(table: GameTable): boolean {
        let res = true;
        for (let index = 0; index < table.users.length; index++) {
            const user = table.users[index];
            if (user.isReplace === false) {
                return false;
            }
        }
        return res;
    }

    private deal(table: GameTable) {
        //确定先后手
        table.nextRoundUserIndex = table.random(2);
        const gameStartMsg = new GamePto.S_GAME_START();
        gameStartMsg.firstUid = table.users[table.nextRoundUserIndex].uid;
        gameStartMsg.mapData = table.getMapData();
        gameStartMsg.replaceEndTime = Date.now() + GlobalVar.configMgr.common.replaceCardTime;
        //洗牌shuffle
        for (let index = 0; index < table.users.length; index++) {
            const user = table.users[index];
            //初始化信息
            user.resetInfo();

            table.shuffle(user.cardPool);
            //抽n张
            for (let cardNum = 0; cardNum < GlobalVar.configMgr.common.startHandCardNum; cardNum++) {
                user.handCards.push(user.cardPool.pop())
            }
            //后手多一费
            if (table.nextRoundUserIndex !== index) {
                user.fee += 1;
            }

            //发送游戏开始协议
            gameStartMsg.cards = user.handCards;
            user.sendMsg(gameStartMsg);

            //广播用户费用
            user.broadcastFeeInfo();
        }
        console.log("派发游戏开始协议");
    }

    /**广播换牌信息 */
    private brodcastReplaceMsg(user: GameUser, table: GameTable) {
        const otherUser = table.getOtherUser(user.uid);
        const replay = new GamePto.S_REPLACE_CARDS();
        replay.uid = user.uid;
        replay.replaceCardIndexes = user.replaceIndexes;
        otherUser.sendMsg(replay);
        replay.uid = otherUser.uid;
        replay.replaceCardIndexes = otherUser.replaceIndexes;
        user.sendMsg(replay);
    }
}