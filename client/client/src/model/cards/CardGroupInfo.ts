const GroupCardsNum = 30;
class CardGroupInfo {
    /**创建卡组数据缓存 */
    private _cardsInfo: { count: number, cardInfo: CardInterface }[];
    /**当前卡牌数量 */
    private _cardCount: number;
    /**是否已经有英雄卡了 */
    private _hasPremium: boolean;

    public powerId: CardsPto.PowerType;
    public groupName: string;
    public groupId: number

    /**卡组名称 */
    public cardGroupName: string

    constructor() {
        this.clear();
    }

    get hasPremium() { return this._hasPremium }
    set hasPremium(value: boolean) { this._hasPremium = value }
    get cardsInfo() { return this._cardsInfo }

    public startGroupEdit(powerId: CardsPto.PowerType, grouName: string, groupInfo: CardsPto.ICardGroup) {
        this.powerId = powerId;
        this.groupName = grouName;
        this.groupId = -1;
        //修改已有的卡组
        if (groupInfo !== null) {
            this.groupId = groupInfo.groupId || -1;
            this._cardCount = 0;
            for (let index = 0; index < groupInfo.cards.length; index++) {
                const info = groupInfo.cards[index];
                const cardInfo = CardsModel.ins().getCardInfoById(info.id);
                this._cardsInfo.push({ count: info.count, cardInfo })
                if (cardInfo.cardType === CardsPto.CardType.Hero) {
                    this._hasPremium = true;
                }
                this._cardCount += info.count;
            }
        }
    }

    public clear() {
        this._cardsInfo = [];
        this._hasPremium = false;
        this._cardCount = 0;
        this.powerId = -1;
        this.groupName = '';
        this.groupId = -1;
    }

    /**
     * 检查将要加入的卡牌是否可以加入
     */
    private addCardCheck(cardInfo: CardInterface) {
        if (this._cardCount >= GroupCardsNum) {
            SystemModel.ins().showTips(`最多携带${GroupCardsNum}张卡牌`);
            return false;
        }
        if (this._hasPremium && cardInfo.cardType === CardsPto.CardType.Hero) {
            SystemModel.ins().showTips('英雄卡只能携带一张');
            return false;
        }
        if (cardInfo.powerId !== this.powerId && cardInfo.powerId !== CardsPto.PowerType.Common) {
            SystemModel.ins().showTips('只能携带本职业卡或中立卡');
            return false;
        }
        if (this._cardCount === GroupCardsNum - 1 && this.hasPremium === false) {
            SystemModel.ins().showTips('必须携带一张英雄卡');
            return false;
        }
        return true;
    }

    /**
     * 向卡组添加卡牌
     */
    public doAddCard(cardInfo: CardInterface): boolean {
        if (this.addCardCheck(cardInfo) === false) {
            return false;
        }
        const cardsInfo = this._cardsInfo;
        for (let index = 0; index < cardsInfo.length; index++) {
            const info = cardsInfo[index];
            //已经有了
            if (cardInfo.cardId === info.cardInfo.cardId) {
                if (cardInfo.quality === CardsPto.QualityType.Premium) {
                    SystemModel.ins().showTips('同一种橙卡只能携带一张');
                    return false;
                }
                if (info.count === 3) {
                    SystemModel.ins().showTips('同一张卡最多携带了3张了');
                    return false;
                }
                info.count++;
                this._cardCount++;
                return true;
            }
        }

        //如果是橙卡,那后面就不能增加橙卡了
        if (cardInfo.cardType === CardsPto.CardType.Hero) {
            this._hasPremium = true;
        }
        this._cardCount++;
        cardsInfo.push({ cardInfo, count: 1 });
        cardsInfo.sort((a, b) => {
            if (b.cardInfo.cardType === CardsPto.CardType.Hero) {
                return 1;
            }
            if (a.cardInfo.cardType === CardsPto.CardType.Hero) {
                return -1;
            }
            if (a.cardInfo.fee === b.cardInfo.fee) {
                return a.cardInfo.quality - b.cardInfo.quality;
            }
            return a.cardInfo.fee - b.cardInfo.fee;
        });
        return true;
    }
}