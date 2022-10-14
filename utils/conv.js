const User=require('../model/user')

// TODO: user to address
async function userToAddress (dbConn, userId='') {
    if (userId.startsWith('0x')) {
        return userId;
    }
    console.log('userId in userToAddress: ', userId);
    var user=await User.findAddressOne(dbConn, {name: userId});
    console.log('address: '+user.address);
    if (null == user) return '';

    return user.address;
}

async function addressToUser (dbConn, userAddress='') {
    if (!userAddress.startsWith('0x')) {
        return userAddress;
    }

    var user=await User.findUserOne(dbConn, {address: userAddress});
    if (null == user) return '';

    return user.name;
}

async function userToAccount (dbConn, userId='') {
    let user;
    if (userId.startsWith('0x')) {
        //address로 계정 찾기
        user=await User.findByAddress(dbConn, {address: userId});
    }
    else if (null == userId) return null;
    else {
        //name으로 계정 찾기
        user=await User.findByName(dbConn, {name: userId});
    }
    console.log('this is userToAccount')
    console.log(user)
    return user[0];
}

module.exports={
    userToAddress: userToAddress,
    addressToUser: addressToUser,
    userToAccount: userToAccount,
}