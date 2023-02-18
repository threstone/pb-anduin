import {
    Table, Column, Model, DataType,
} from 'sequelize-typescript';


@Table({
    tableName: 'friend',
    createdAt: false,
    updatedAt: false,
    indexes: [{
        name: 'UNIQUE',
        type: 'UNIQUE',
        fields: ['uid', 'friend_uid'],
    }],
})

export class FriendModel extends Model {
    @Column({ type: DataType.INTEGER, field: 'id', primaryKey: true, autoIncrement: true })
    id: number

    @Column({ type: DataType.INTEGER, field: 'uid' })
    uid: number

    @Column({ type: DataType.INTEGER, comment: '好友id', field: 'friend_uid', allowNull: false })
    friendUId: number

    static addRelationship(uid: number, friendUid: number) {
        const f1 = new FriendModel();
        f1.uid = uid;
        f1.friendUId = friendUid;
        f1.save();
        const f2 = new FriendModel();
        f2.uid = friendUid;
        f2.friendUId = uid;
        f2.save();
    }
}