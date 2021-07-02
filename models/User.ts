import mongoose, {PassportLocalDocument, PassportLocalModel} from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

export interface User {
    username : String,
    balance? : mongoose.Types.Decimal128,
    admin?: boolean
}

interface IUserModel extends PassportLocalModel<UserDocument>, Express.User {
    build(attrs : User) : UserDocument
}

interface UserDocument extends PassportLocalDocument, User {}

const User = new mongoose.Schema({
    username: {
        type: String,
        required : true
    },
    balance: {
        type: mongoose.Types.Decimal128,
        required : true
    },
    admin: {
        type : Boolean,
        default : false
    }
});

User.statics.build = (attrs: User) => {
    return new Model(attrs);
}

User.plugin(passportLocalMongoose);
const Model = mongoose.model<UserDocument, IUserModel>('User', User);

export default Model;