require('dotenv').config();
const Queue = require('bull');
const { Telegraf } = require('telegraf');
const crypto = require('crypto');
const files = new Queue('files');
const bot = new Telegraf(process.env.TOKEN);

process.env.TZ = "Asia/Jakarta";

//database
const db = require('./config/connection')
const collection = require('./config/collection')
const saver = require('./database/filesaver')
const helpcommand = require('./help.js');
const { nextTick } = require('process');

//DATABASE CONNECTION 
db.connect((err) => {
    if(err) { console.log('error connection db' + err); }
    else { console.log('db connected'); }
})

//ID Channel/Group
const channelId = `${process.env.CHANNELJOIN}`;

function today(ctx){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    return today = mm + '/' + dd + '/' + yyyy + ' ' + hours + ':' + minutes + ':' + seconds;
}

function today2(ctx){
    var today2 = new Date();
    var dd2 = String(today2.getDate()).padStart(2, '0');
    var mm2 = String(today2.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy2 = today2.getFullYear();
    var hours2 = today2.getHours();
    var minutes2 = today2.getMinutes();
    var seconds2 = today2.getSeconds();
    return today2 = mm2 + '/' + dd2 + '/' + yyyy2 + '-' + hours2 + ':' + minutes2 + ':' + seconds2;
}

//Function
function first_name(ctx){
    return `${bot.context.from.first_name ? bot.context.from.first_name : ""}`;
}
function last_name(ctx){
    return `${bot.context.from.last_name ? bot.context.from.last_name : ""}`;
}
function username(ctx){
    return bot.context.from.username ? `@${bot.context.from.username}` : "";
}
function fromid(ctx){
    return bot.context.from.id ? `[${bot.context.from.id}]` : "";
}
function captionbuild(ctx){
    return `${process.env.CAPTIONLINK}`;
}
function welcomejoin(ctx){
    return `${process.env.WELCOMEJOINBOT}\n\n${today(ctx)}`;
}
function messagewelcome(ctx){
    return `${process.env.MESSAGEWELCOMEBOT}\n\n${today(ctx)}`;
}
function messagebanned(ctx){
    return `⚠ YOU ARE BLOCKED FOR ABUSE OF A BOTT, CALL THE ADMIN FOR APPEAL.`;
}
function messagebotnoaddgroup(ctx){
    return `The bot has not entered the owner's channel/group.`;
}
function messagelink(ctx){
    return `Send bot videos, photos and documents.`;
}
function documentation(ctx){
    var mykey = crypto.createDecipher('aes-128-cbc', 'mypassword');
    var mystr = mykey.update('d59f19294f388d2ee23e350f913a84ba7abf661a3d2f09062ce5e927f0d644429d835186bec83190988e6941287f8ddce229e2f98ad520d6014ae1f21ffd4d71', 'hex', 'utf8')
    mystr += mykey.final('utf8');
    return `The bot was created using \n<b>Program:</b> Node JS \n<b>API:</b> <a href='https://telegraf.js.org/'>Telegraph</a> \n\n~ ${mystr} ~`;
}
const url2 = process.env.LINKCHANNEL.split(/[\,-]+/);
const url3 = url2[0];
const url4 = url2[1];

// inline keyboard
const inKey = [
    [{text:'📎 Tautan',callback_data:'POP'}],
    [{text:'📚 Dokumentasi',callback_data:'DOC'},{text:'🆘 Bantuan',callback_data:'HELP'}],
    [{text:'💿 Source code',callback_data:'SRC'}],
    [{text: `${url3}`, url: `${url4}`}]
];

const inKey2 = [
    [{text: `${url3}`, url: `${url4}`}]
];

//BOT START
bot.start(async(ctx)=>{
    if(bot.context.chat.type == 'private') {
        const msg = bot.context.message.text
        let msgArray = msg.split(' ')
        //console.log(msgArray.length);
        let length = msgArray.length
        msgArray.shift()
        let query = msgArray.join(' ')
    
        const user = {
            first_name:bot.context.from.first_name,
            userId:bot.context.from.id
        }

        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            //welcoming message on /start and ifthere is a query available we can send files
            if(length == 1){
                await bot.context.deleteMessage(bot.context.message.message_id)
                const profile = await bot.telegram.getUserProfilePhotos(bot.context.from.id)
                if(!profile || profile.total_count == 0)
                    return await bot.context.reply(`<a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,{
                        parse_mode:'HTML',
                        disable_web_page_preview: true,
                        reply_markup:{
                            inline_keyboard:inKey
                        }
                    })
                    await bot.context.replyWithPhoto(profile.photos[0][0].file_id,{caption: `<a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,
                        parse_mode:'HTML',
                        disable_web_page_preview: true,
                        reply_markup:{
                            inline_keyboard:inKey
                        }
                    })
            }else{
                if(query.indexOf('grp_') > -1){
                    let query1 = query.replace('grp_','');
                    try{
                        const res1 = await saver.getFile1(query1)
                            let mediagroup = [];
                            for (let index = 0; index < res1.length; index++) {
                            const data = res1[index];
                            mediagroup.push({type: data.type, media: data.file_id, caption: data.caption, parse_mode:'HTML'});
                        }

                        async function captionFunction() {
                            return await bot.context.reply(`${captionbuild(ctx)}`,{
                                parse_mode:'HTML'
                            })
                        }
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        await bot.context.telegram.sendMediaGroup(bot.context.chat.id, mediagroup);
                        setTimeout(captionFunction, 1000)
                    }catch(error){
                        await bot.context.reply(`Media not found or has been removed.`)
                    }
                }else{
                    let query2 = query;
                    try{
                        const res2 = await saver.getFile2(query2)
        
                        async function captionFunction2() {
                            await bot.context.reply(`${captionbuild(ctx)}`,{
                                parse_mode:'HTML'
                            })
                        }
                        if(res2.type=='video'){
                            await bot.context.deleteMessage(bot.context.message.message_id)
                            if(!res2.caption) {
                                setTimeout(captionFunction2, 1000)
                                return await bot.context.replyWithVideo(res2.file_id);
                            }
                            await bot.context.replyWithVideo(res2.file_id,{caption: `${res2.caption}`,
                                parse_mode:'HTML'
                            });
                                setTimeout(captionFunction2, 1000)
                        }else if(res2.type=='photo'){
                            await bot.context.deleteMessage(bot.context.message.message_id)
                            if(!res2.caption) {
                                setTimeout(captionFunction2, 1000)
                                return await bot.context.replyWithPhoto(res2.file_id);
                            }
                            await bot.context.replyWithPhoto(res2.file_id,{caption: `${res2.caption}`,
                                parse_mode:'HTML'
                            });
                                setTimeout(captionFunction2, 1000)
                        }else if(res2.type=='document'){
                            await bot.context.deleteMessage(bot.context.message.message_id)
                            if(!res2.caption) {
                                setTimeout(captionFunction2, 1000)
                                return await bot.context.replyWithDocument(res2.file_id);
                            }
                            await bot.context.replyWithDocument(res2.file_id,{caption: `${res2.caption}`,
                                parse_mode:'HTML'
                            })
                                setTimeout(captionFunction2, 1000)
                        }
                    }catch(error){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        await bot.context.reply(`Media not found or has been removed.`)
                    }
                }
            }
        }else{
            try {
                var botStatus = await bot.telegram.getChatMember(channelId, bot.context.botInfo.id)
                var member = await bot.telegram.getChatMember(channelId, bot.context.from.id)
                //console.log(member);
                if(member.status == 'restricted' || member.status == 'left' || member.status == 'kicked'){
                    const profile2 = await bot.telegram.getUserProfilePhotos(bot.context.from.id)
                    await saver.checkBan(`${bot.context.from.id}`).then(async res => {
                        //console.log(res);
                        if(res == true) {
                            if(bot.context.chat.type == 'private') {
                                await bot.context.deleteMessage(bot.context.message.message_id)
                                await bot.context.reply(`${messagebanned(ctx)}`)
                            }
                        }else{
                            bot.context.deleteMessage()
                            if(!profile2 || profile2.total_count == 0)
                                return await bot.context.reply(`<a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,{
                                    parse_mode:'HTML',
                                    disable_web_page_preview: true,
                                    reply_markup:{
                                        inline_keyboard:inKey2
                                    }
                                })
                                await bot.context.replyWithPhoto(profile2.photos[0][0].file_id,{caption: `<a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${welcomejoin(ctx)}`,
                                    parse_mode:'HTML',
                                    disable_web_page_preview: true,
                                    reply_markup:{
                                        inline_keyboard:inKey2
                                    }
                                })
                        }
                    })
                }else{
                    //welcoming message on /start and ifthere is a query available we can send files
                    if(length == 1){
                        const profile3 = await bot.telegram.getUserProfilePhotos(bot.context.from.id)
                            await saver.checkBan(`${bot.context.from.id}`).then(async res => {
                                //console.log(res);
                                if(res == true) {
                                    if(bot.context.chat.type == 'private') {
                                        await bot.context.deleteMessage(bot.context.message.message_id)
                                        await bot.context.reply(`${messagebanned(ctx)}`)
                                    }
                                }else{
                                    await bot.context.deleteMessage(bot.context.message.message_id)
                                    if(!profile3 || profile3.total_count == 0)
                                        return await bot.context.reply(`<a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,{
                                            parse_mode:'HTML',
                                            disable_web_page_preview: true,
                                            reply_markup:{
                                                inline_keyboard:inKey
                                            }
                                        })
                                        await bot.context.replyWithPhoto(profile3.photos[0][0].file_id,{caption: `<a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,
                                            parse_mode:'HTML',
                                            disable_web_page_preview: true,
                                            reply_markup:{
                                                inline_keyboard:inKey
                                            }
                                        })
                                }
                            })
                        }else{
                            if (query.indexOf('grp_') > -1){
                                let query1 = query.replace('grp_','');
                                try{
                                    const res1 = await saver.getFile1(query1)
                                        let mediagroup = [];
                                        for (let index = 0; index < res1.length; index++) {
                                        const data = res1[index];
                                        mediagroup.push({type: data.type, media: data.file_id, caption: data.caption, parse_mode:'HTML'});
                                    }
                    
                                    async function captionFunction() {
                                        return await bot.context.reply(`${captionbuild(ctx)}`,{
                                            parse_mode:'HTML'
                                        })
                                    }
                                    await saver.checkBan(`${bot.context.from.id}`).then(async res => {
                                        //console.log(res);
                                        if(res == true) {
                                            await bot.context.deleteMessage(bot.context.message.message_id)
                                            if(bot.context.chat.type == 'private') {
                                                await bot.context.deleteMessage(bot.context.message.message_id)
                                                await bot.context.reply(`${messagebanned(ctx)}`)
                                            }
                                        }else{
                                            await bot.context.deleteMessage(bot.context.message.message_id)
                                            await bot.context.telegram.sendMediaGroup(bot.context.chat.id, mediagroup);
                                            setTimeout(captionFunction, 1000)
                                        }
                                    })
                                }catch(error){
                                    await saver.checkBan(`${bot.context.from.id}`).then(async res => {
                                        //console.log(res);
                                        if(res == true) {
                                            if(bot.context.chat.type == 'private') {
                                                await bot.context.deleteMessage(bot.context.message.message_id)
                                                await bot.context.reply(`${messagebanned(ctx)}`)
                                            }
                                        }else{
                                            await bot.context.reply(`Media not found or has been removed.`)
                                        }
                                    })
                                }
                            }else{
                                let query2 = query;
                                try{
                                    const res2 = await saver.getFile2(query2)
                    
                                    async function captionFunction2() {
                                        await bot.context.reply(`${captionbuild(ctx)}`,{
                                            parse_mode:'HTML'
                                        })
                                    }
                                    await saver.checkBan(`${bot.context.from.id}`).then(async res => {
                                        //console.log(res);
                                        if(res == true) {
                                            if(bot.context.chat.type == 'private') {
                                                await bot.context.deleteMessage(bot.context.message.message_id)
                                                await bot.context.reply(`${messagebanned(ctx)}`)
                                            }
                                        }else{
                                            if(res2.type=='video'){
                                                await bot.context.deleteMessage(bot.context.message.message_id)
                                                if(!res2.caption) {
                                                    setTimeout(captionFunction2, 1000)
                                                    return bot.context.replyWithVideo(res2.file_id);
                                                }
                                                await bot.context.replyWithVideo(res2.file_id,{caption: `${res2.caption}`,
                                                    parse_mode:'HTML'
                                                });
                                                    setTimeout(captionFunction2, 1000)
                                            }else if(res2.type=='photo'){
                                                await bot.context.deleteMessage(bot.context.message.message_id)
                                                if(!res2.caption) {
                                                    setTimeout(captionFunction2, 1000)
                                                    return await bot.context.replyWithPhoto(res2.file_id);
                                                }
                                                await bot.context.replyWithPhoto(res2.file_id,{caption: `${res2.caption}`,
                                                    parse_mode:'HTML'
                                                });
                                                    setTimeout(captionFunction2, 1000)
                                            }else if(res2.type=='document'){
                                                await bot.context.deleteMessage(bot.context.message.message_id)
                                                if(!res2.caption) {
                                                    setTimeout(captionFunction2, 1000)
                                                    return await bot.context.replyWithDocument(res2.file_id);
                                                }
                                                await bot.context.replyWithDocument(res2.file_id,{caption: `${res2.caption}`,
                                                    parse_mode:'HTML'
                                                })
                                                    setTimeout(captionFunction2, 1000)
                                            }
                                        }
                                    })
                                }catch(error){
                                    await saver.checkBan(`${bot.context.from.id}`).then(async res => {
                                        //console.log(res);
                                        if(res == true) {
                                            if(bot.context.chat.type == 'private') {
                                                await bot.context.deleteMessage(bot.context.message.message_id)
                                                await bot.context.reply(`${messagebanned(ctx)}`)
                                            }
                                        }else{
                                            await bot.context.deleteMessage(bot.context.message.message_id)
                                            await bot.context.reply(`Media not found or has been removed.`)
                                        }
                                    })
                                }
                            }
                        }
                    }
                }
            catch(error){
                await bot.context.deleteMessage(bot.context.message.message_id)
                await bot.context.reply(`${messagebotnoaddgroup(ctx)}`)
            }
        }
        //saving user details to the database
        await saver.saveUser(user)
    }
})

//DEFINING POP CALLBACK
bot.action('POP', async(ctx)=>{
    await bot.context.deleteMessage()
    await bot.context.reply(`${messagelink(ctx)}`,{
        parse_mode: 'HTML',
        reply_markup:{
            inline_keyboard: [
                [{text:'Batal',callback_data:'STARTUP'}]
            ]
        }
    })
})

//DEFINING DOC CALLBACK
bot.action('DOC', async(ctx)=>{
    await bot.context.deleteMessage()
    await bot.context.reply(`${documentation(ctx)}`,{
        parse_mode: 'HTML',
        reply_markup:{
            inline_keyboard: [
                [{text:'Kembali',callback_data:'STARTUP'}]
            ]
        }
    })
})

bot.action('SRC', async(ctx)=>{
    await bot.context.deleteMessage()
    await bot.context.reply(`${helpcommand.botsrc}`,{
        parse_mode: 'HTML',
        reply_markup:{
            inline_keyboard: [
                [{text: `💿 HEROKU`, url: `https://bit.ly/3yA6IRA`},{text: `💿 KOMPUTER/VPS`, url: `https://bit.ly/38qaMsS`}],
                [{text:'Kembali',callback_data:'STARTUP'}]
            ]
        }
    })
})

bot.action('HELP',async(ctx)=>{
    await bot.context.deleteMessage()
    await bot.context.reply(`${helpcommand.bothelp}`,{
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup:{
            inline_keyboard: [
                [{text:'🪒 Perintah',callback_data:'COMM'}],
                [{text:'Kembali',callback_data:'STARTUP'}]
            ]
        }
    })
})

bot.action('COMM', async(ctx)=>{
    await bot.context.deleteMessage()
    await bot.context.reply(`${helpcommand.botcommand}`,{
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup:{
            inline_keyboard: [
                [{text:'Kembali',callback_data:'HELP'}]
            ]
        }
    })
})

bot.action('STARTUP', async(ctx)=>{
    await bot.context.deleteMessage()
    const profile = await bot.telegram.getUserProfilePhotos(bot.context.from.id)
    if(!profile || profile.total_count == 0)
        return await bot.context.reply(`<a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,{
            parse_mode:'HTML',
            disable_web_page_preview: true,
            reply_markup:{
                inline_keyboard:inKey
            }
        })
        await bot.context.replyWithPhoto(profile.photos[0][0].file_id,{caption: `<a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\n${messagewelcome(ctx)}`,
            parse_mode:'HTML',
            disable_web_page_preview: true,
            reply_markup:{
                inline_keyboard:inKey
            }
        })
})

//TEST BOT
bot.hears(/ping/i,async(ctx)=>{
    if(bot.context.chat.type == 'private') {    
        await saver.checkBan(`${bot.context.from.id}`).then(async res => {
            //console.log(res);
            if(res == true) {
                if(bot.context.chat.type == 'private') {
                    await bot.context.deleteMessage(bot.context.message.message_id)
                    await bot.context.reply(`${messagebanned(ctx)}`)
                }
            }else{
                await bot.context.deleteMessage(bot.context.message.message_id)
                let chatId = bot.context.message.from.id;
                let opts = {
                    reply_markup:{
                        inline_keyboard: [[{text:'OK',callback_data:'PONG'}]]
                    }
                }
                return await bot.telegram.sendMessage(chatId, 'pong' , opts);
            }
        })
    }
})

bot.action('PONG',async(ctx)=>{
    await bot.context.deleteMessage(bot.context.message.message_id)
})

//GROUP COMMAND
bot.command('reload',async(ctx)=>{
    var botStatus2 = await bot.telegram.getChatMember(bot.context.chat.id, bot.context.botInfo.id)
    var memberstatus = await bot.telegram.getChatMember(bot.context.chat.id, bot.context.from.id)
    //console.log(memberstatus);
    const group = {
        groupId:bot.context.chat.id
    }
    if(bot.context.chat.type == 'group' || bot.context.chat.type == 'supergroup') {
        if(memberstatus.status == 'creator' || memberstatus.status == 'administrator'){
            await bot.context.deleteMessage(bot.context.message.message_id)
            await bot.context.reply('Bot restarted')
            await saver.saveGroup(group)
        }
        if(bot.context.from.username == 'GroupAnonymousBot'){
            await bot.context.deleteMessage(bot.context.message.message_id)
            await bot.context.reply('Bot restarted')
            await saver.saveGroup(group)
        }
    }
    
})

bot.command('kick',async(ctx)=>{
    const groupDetails = await saver.getGroup().then(async res=>{
        const n = res.length
        const groupId = []
        for (let i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function kick() {
            for (const group of groupId) {
                var botStatus2 = await bot.telegram.getChatMember(group, bot.context.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, bot.context.from.id)
                //console.log(memberstatus);

                if(bot.context.chat.type == 'group' || bot.context.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){  
                        await bot.context.deleteMessage(bot.context.message.message_id)  
                        if(memberstatus.can_restrict_members == true){       
                            if(bot.context.message.reply_to_message == undefined){
                                let args = bot.context.message.text.split(" ").slice(1)
                                await bot.telegram.kickChatMember(bot.context.chat.id, Number(args[0])).then(async result =>{
                                    //console.log(result)
                                })
                            }
                            await bot.telegram.kickChatMember(bot.context.chat.id, bot.context.message.reply_to_message.from.id).then(async result =>{
                                //console.log(result)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(bot.context.message.reply_to_message == undefined){
                            let args = bot.context.message.text.split(" ").slice(1)
                            await bot.telegram.kickChatMember(bot.context.chat.id, Number(args[0])).then(async result =>{
                                //console.log(result)
                            })
                        }
                        await bot.telegram.kickChatMember(bot.context.chat.id, bot.context.message.reply_to_message.from.id).then(async result =>{
                            //console.log(result)
                        })
                    }else{
                        if(bot.context.from.username == 'GroupAnonymousBot'){
                            await bot.context.deleteMessage(bot.context.message.message_id)
                            if(bot.context.message.reply_to_message == undefined){
                                let args = bot.context.message.text.split(" ").slice(1)
                                await bot.telegram.kickChatMember(bot.context.chat.id, Number(args[0])).then(async result =>{
                                    //console.log(result)
                                })
                            }
                            await bot.telegram.kickChatMember(bot.context.chat.id, bot.context.message.reply_to_message.from.id).then(async result =>{
                                //console.log(result)
                            })
                        }
                    }
                }
            }
        }
        kick()
    })
    
})

bot.command('ban',async(ctx)=>{
    const groupDetails = await saver.getGroup().then(async res => {
        const n = res.length
        const groupId = []
        for (let i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function ban() {
            for (const group of groupId) {
                var botStatus2 = await bot.telegram.getChatMember(group, bot.context.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, bot.context.from.id)
                //console.log(memberstatus);

                if(bot.context.chat.type == 'group' || bot.context.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(memberstatus.can_restrict_members == true){
                            if(bot.context.message.reply_to_message == undefined){
                               const str = bot.context.message.text;
                               const words = str.split(/ +/g);
                               const command = words.shift().slice(1);
                               const userId = words.shift();
                               const caption = words.join(" ");
                               const caption2 = caption ? `\n<b>Because:</b> ${caption}` : "";

                               await bot.telegram.callApi('banChatMember', {
                               chat_id: bot.context.message.chat.id,
                               user_id: userId
                               }).then(async result =>{
                                   //console.log(result)
                                   await bot.context.reply(`[${userId}] blocked. ${caption2}`,{
                                       parse_mode: 'HTML'
                                   })
                                   return await bot.telegram.sendMessage(userId, `You have been blocked on ${bot.context.message.chat.title} ${caption2}`,{
                                       parse_mode: 'HTML'
                                   })
                               })
                            }
    
                            const str = bot.context.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const userId = words.shift();
                            const caption = words.join(" ");
                            const caption2 = caption ? `\n<b>Because:</b> ${caption}` : "";
    
                            await bot.telegram.callApi('banChatMember', {
                            chat_id: bot.context.message.chat.id,
                            user_id: bot.context.message.reply_to_message.from.id
                            }).then(async result =>{
                                //console.log(result)
                                let replyUsername = bot.context.message.reply_to_message.from.username ? `@${bot.context.message.reply_to_message.from.username}` : `${bot.context.message.reply_to_message.from.first_name}`;
                                let replyFromid = bot.context.message.reply_to_message.from.id ? `[${bot.context.message.reply_to_message.from.id}]` : "";
                                await bot.context.reply(`${replyUsername} ${replyFromid} blocked. ${caption2}`,{
                                    parse_mode: 'HTML',
                                    reply_to_message_id: bot.context.message.reply_to_message.message_id
                                })
                                return await bot.telegram.sendMessage(userId, `You have been blocked on ${bot.context.message.chat.title} ${caption2}`,{
                                    parse_mode: 'HTML'
                                })
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(bot.context.message.reply_to_message == undefined){
                            const str = bot.context.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const userId = words.shift();
                            const caption = words.join(" ");
                            const caption2 = caption ? `\n<b>Because:</b> ${caption}` : "";

                            await bot.telegram.callApi('banChatMember', {
                            chat_id: bot.context.message.chat.id,
                            user_id: userId
                            }).then(async result =>{
                                //console.log(result)
                                await bot.context.reply(`[${userId}] blocked. ${caption2}`,{
                                    parse_mode: 'HTML'
                                })
                                return await bot.telegram.sendMessage(userId, `You have been blocked on ${bot.context.message.chat.title} ${caption2}`,{
                                    parse_mode: 'HTML'
                                })
                            })
                        }

                        const str = bot.context.message.text;
                        const words = str.split(/ +/g);
                        const command = words.shift().slice(1);
                        const userId = words.shift();
                        const caption = words.join(" ");
                        const caption2 = caption ? `\n<b>Because:</b> ${caption}` : "";

                        await bot.telegram.callApi('banChatMember', {
                        chat_id: bot.context.message.chat.id,
                        user_id: bot.context.message.reply_to_message.from.id
                        }).then(async result =>{
                            //console.log(result)
                            let replyUsername = bot.context.message.reply_to_message.from.username ? `@${bot.context.message.reply_to_message.from.username}` : `${bot.context.message.reply_to_message.from.first_name}`;
                            let replyFromid = bot.context.message.reply_to_message.from.id ? `[${bot.context.message.reply_to_message.from.id}]` : "";
                            await bot.context.reply(`${replyUsername} ${replyFromid} blocked. ${caption2}`,{
                                parse_mode: 'HTML',
                                reply_to_message_id: bot.context.message.reply_to_message.message_id
                            })
                            return await bot.telegram.sendMessage(userId, `You have been blocked on ${bot.context.message.chat.title} ${caption2}`,{
                                parse_mode: 'HTML'
                            })
                        })
                    }else{
                        if(bot.context.from.username == 'GroupAnonymousBot'){
                            await bot.context.deleteMessage(bot.context.message.message_id)
                            if(bot.context.message.reply_to_message == undefined){
                                const str = bot.context.message.text;
                                const words = str.split(/ +/g);
                                const command = words.shift().slice(1);
                                const userId = words.shift();
                                const caption = words.join(" ");
                                const caption2 = caption ? `\n<b>Because:</b> ${caption}` : "";
    
                                await bot.telegram.callApi('banChatMember', {
                                chat_id: bot.context.message.chat.id,
                                user_id: userId
                                }).then(async result =>{
                                    //console.log(result)
                                    await bot.context.reply(`[${userId}] blocked. ${caption2}`,{
                                        parse_mode: 'HTML'
                                    })
                                    return await bot.telegram.sendMessage(userId, `You have been blocked on ${bot.context.message.chat.title} ${caption2}`,{
                                        parse_mode: 'HTML'
                                    })
                                })
                            }
    
                            const str = bot.context.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const userId = words.shift();
                            const caption = words.join(" ");
                            const caption2 = caption ? `\n<b>Because:</b> ${caption}` : "";
    
                            await bot.telegram.callApi('banChatMember', {
                            chat_id: bot.context.message.chat.id,
                            user_id: bot.context.message.reply_to_message.from.id
                            }).then(async result =>{
                                //console.log(result)
                                let replyUsername = bot.context.message.reply_to_message.from.username ? `@${bot.context.message.reply_to_message.from.username}` : `${bot.context.message.reply_to_message.from.first_name}`;
                                let replyFromid = bot.context.message.reply_to_message.from.id ? `[${bot.context.message.reply_to_message.from.id}]` : "";
                                await bot.context.reply(`${replyUsername} ${replyFromid} blocked. ${caption2}`,{
                                    parse_mode: 'HTML',
                                    reply_to_message_id: bot.context.message.reply_to_message.message_id
                                })
                                return await bot.telegram.sendMessage(userId, `You have been blocked on ${bot.context.message.chat.title} ${caption2}`,{
                                    parse_mode: 'HTML'
                                })
                            })
                        }
                    }
                }
            }
        }
        ban()
    })
    
})

bot.command('unban',async(ctx)=>{
    const groupDetails = await saver.getGroup().then(async res => {
        const n = res.length
        const groupId = []
        for (let i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function unban() {
            for (const group of groupId) {
                var botStatus2 = await bot.telegram.getChatMember(group, bot.context.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, bot.context.from.id)
                //console.log(memberstatus);

                if(bot.context.chat.type == 'group' || bot.context.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(memberstatus.can_restrict_members == true){
                            if(bot.context.message.reply_to_message == undefined){
                                let args = bot.context.message.text.split(" ").slice(1)
                                await bot.telegram.unbanChatMember(bot.context.chat.id, Number(args[0])).then(async result =>{
                                    //console.log(result)
                                    await bot.context.reply(`[${args[0]}] not blocked, can re-enter!`)
                                    return await bot.telegram.sendMessage(args[0], `You are not blocked, you can re-enter at ${bot.context.message.chat.title}`)
                                })
                            }
                            await bot.telegram.unbanChatMember(bot.context.chat.id, bot.context.message.reply_to_message.from.id).then(async result =>{
                                //console.log(result)
                                let replyUsername = bot.context.message.reply_to_message.from.username ? `@${bot.context.message.reply_to_message.from.username}` : `${bot.context.message.reply_to_message.from.first_name}`;
                                let replyFromid = bot.context.message.reply_to_message.from.id ? `[${bot.context.message.reply_to_message.from.id}]` : "";
                                await bot.context.reply(`${replyUsername} ${replyFromid} not blocked, can re-enter!`,{
                                    reply_to_message_id: bot.context.message.reply_to_message.message_id
                                })
                                return await bot.telegram.sendMessage(bot.context.message.reply_to_message.from.id, `You are not blocked, you can re-enter at ${bot.context.message.chat.title}`)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(bot.context.message.reply_to_message == undefined){
                            let args = bot.context.message.text.split(" ").slice(1)
                            await bot.telegram.unbanChatMember(bot.context.chat.id, Number(args[0])).then(async result =>{
                                //console.log(result)
                                await bot.context.reply(`[${args[0]}] not blocked, can re-enter!`)
                                return await bot.telegram.sendMessage(args[0], `You are not blocked, you can re-enter at ${bot.context.message.chat.title}`)
                            })
                        }
                        await bot.telegram.unbanChatMember(bot.context.chat.id, bot.context.message.reply_to_message.from.id).then(async result =>{
                            //console.log(result)
                            let replyUsername = bot.context.message.reply_to_message.from.username ? `@${bot.context.message.reply_to_message.from.username}` : `${bot.context.message.reply_to_message.from.first_name}`;
                            let replyFromid = bot.context.message.reply_to_message.from.id ? `[${bot.context.message.reply_to_message.from.id}]` : "";
                            await bot.context.reply(`${replyUsername} ${replyFromid} not blocked, can re-enter!`,{
                                reply_to_message_id: bot.context.message.reply_to_message.message_id
                            })
                            return await bot.telegram.sendMessage(bot.context.message.reply_to_message.from.id, `You are not blocked, you can re-enter at ${bot.context.message.chat.title}`)
                        })
                    }else{
                        if(bot.context.from.username == 'GroupAnonymousBot'){
                            await bot.context.deleteMessage(bot.context.message.message_id)
                            if(bot.context.message.reply_to_message == undefined){
                                let args = bot.context.message.text.split(" ").slice(1)
                                await bot.telegram.unbanChatMember(bot.context.chat.id, Number(args[0])).then(async result =>{
                                    //console.log(result)
                                    await bot.context.reply(`[${args[0]}] not blocked, can re-enter!`)
                                    return await bot.telegram.sendMessage(args[0], `You are not blocked, you can re-enter at ${bot.context.message.chat.title}`)
                                })
                            }
                            await bot.telegram.unbanChatMember(bot.context.chat.id, bot.context.message.reply_to_message.from.id).then(async result =>{
                                //console.log(result)
                                let replyUsername = bot.context.message.reply_to_message.from.username ? `@${bot.context.message.reply_to_message.from.username}` : `${bot.context.message.reply_to_message.from.first_name}`;
                                let replyFromid = bot.context.message.reply_to_message.from.id ? `[${bot.context.message.reply_to_message.from.id}]` : "";
                                await bot.context.reply(`${replyUsername} ${replyFromid} not blocked, can re-enter!`,{
                                    reply_to_message_id: bot.context.message.reply_to_message.message_id
                                })
                                return await bot.telegram.sendMessage(bot.context.message.reply_to_message.from.id, `You are not blocked, you can re-enter at ${bot.context.message.chat.title}`)
                            })
                        }
                    }
                }
            }
        }
        unban()
    })
    
})

bot.command('pin',async(ctx)=>{
    const groupDetails = await saver.getGroup().then(async res =>{
        const n = res.length
        const groupId = []
        for (let i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function pin() {
            for (const group of groupId) {
                var botStatus2 = await bot.telegram.getChatMember(group, bot.context.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, bot.context.from.id)
                //console.log(memberstatus);

                if(bot.context.chat.type == 'group' || bot.context.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(memberstatus.can_pin_messages == true){
                            await bot.telegram.pinChatMessage(bot.context.chat.id, bot.context.message.reply_to_message.message_id,{
                                disable_notification: false,
                            }).then(async result =>{
                                //console.log(result)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        await bot.telegram.pinChatMessage(bot.context.chat.id, bot.context.message.reply_to_message.message_id,{
                            disable_notification: false,
                        }).then(async result =>{
                            //console.log(result)
                        })
                    }else{
                        if(bot.context.from.username == 'GroupAnonymousBot'){
                            await bot.context.deleteMessage(bot.context.message.message_id)
                            await bot.telegram.pinChatMessage(bot.context.chat.id, bot.context.message.reply_to_message.message_id,{
                                disable_notification: false,
                            }).then(async result =>{
                                //console.log(result)
                            })
                        }
                    }
                }
            }
        }
        pin()
    })
    
})

bot.command('unpin',async(ctx)=>{
    const groupDetails = await saver.getGroup().then( async res=>{
        const n = res.length
        const groupId = []
        for (let i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function unpin() {
            for (const group of groupId) {
                var botStatus2 = await bot.telegram.getChatMember(group, bot.context.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, bot.context.from.id)
                //console.log(memberstatus);

                if(bot.context.chat.type == 'group' || bot.context.chat.type == 'supergroup') {
                    if(memberstatus.status == 'administrator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(memberstatus.can_pin_messages == true){
                            await bot.telegram.unpinChatMessage(bot.context.chat.id, bot.context.message.reply_to_message.message_id).then(async result =>{
                                //console.log(result)
                            })
                        }
                    }else if(memberstatus.status == 'creator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        await bot.telegram.unpinChatMessage(bot.context.chat.id, bot.context.message.reply_to_message.message_id).then(async result =>{
                            //console.log(result)
                        })
                    }else{
                        if(bot.context.from.username == 'GroupAnonymousBot'){
                            await bot.context.deleteMessage(bot.context.message.message_id)
                            await bot.telegram.unpinChatMessage(bot.context.chat.id, bot.context.message.reply_to_message.message_id).then(async result =>{
                                //console.log(result)
                            })
                        }
                    }
                }
            }
        }
        unpin()
    })
    
})

bot.command('send',async(ctx)=>{
    const groupDetails = await saver.getGroup().then(async res =>{
        const n = res.length
        const groupId = []
        for (let i = n-1; i >=0; i--) {
            groupId.push(res[i].groupId)
        }
        async function send() {
            for (const group of groupId) {
                var botStatus2 = await bot.telegram.getChatMember(group, bot.context.botInfo.id)
                var memberstatus = await bot.telegram.getChatMember(group, bot.context.from.id)
                //console.log(memberstatus);

                if(bot.context.chat.type == 'group' || bot.context.chat.type == 'supergroup') {
                    if(memberstatus.status == 'creator' || memberstatus.status == 'administrator'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(bot.context.message.reply_to_message == undefined){
                            const str = bot.context.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const caption = words.join(" ");
    
                            return await bot.telegram.sendMessage(group, `${caption}`)
                        }
                        const str = bot.context.message.text;
                        const words = str.split(/ +/g);
                        const command = words.shift().slice(1);
                        const caption = words.join(" ");

                        return await bot.telegram.sendMessage(group, `${caption}`,{
                            reply_to_message_id: bot.context.message.reply_to_message.message_id
                        })
                    }
                    if(bot.context.from.username == 'GroupAnonymousBot'){
                        await bot.context.deleteMessage(bot.context.message.message_id)
                        if(bot.context.message.reply_to_message == undefined){
                            const str = bot.context.message.text;
                            const words = str.split(/ +/g);
                            const command = words.shift().slice(1);
                            const caption = words.join(" ");
    
                            return await bot.telegram.sendMessage(group, `${caption}`)
                        }
                        const str = bot.context.message.text;
                        const words = str.split(/ +/g);
                        const command = words.shift().slice(1);
                        const caption = words.join(" ");

                        return await bot.telegram.sendMessage(group, `${caption}`,{
                            reply_to_message_id: bot.context.message.reply_to_message.message_id
                        })
                    }
                }
            }
        }
        send()
    })
    
})
//END

//check account
bot.command('getid',async(ctx)=>{
    if(bot.context.chat.type == 'private') {       
        const profile4 = await bot.telegram.getUserProfilePhotos(bot.context.from.id)
        await saver.checkBan(`${bot.context.from.id}`).then(async res => {
            //console.log(res);
            if(res == true) {
                if(bot.context.chat.type == 'private') {
                    await bot.context.deleteMessage(bot.context.message.message_id)
                    await bot.context.reply(`${messagebanned(ctx)}`)
                }
            }else{
                if(!profile4 || profile4.total_count == 0){
                    await bot.context.deleteMessage(bot.context.message.message_id)
                    await bot.context.reply(`<b>Name:</b> <a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n<b>Username:</b> ${username(ctx)}\n<b>ID:</b> ${bot.context.from.id}`,{
                        parse_mode:'HTML'  
                    })
                }else{
                    await bot.context.deleteMessage(bot.context.message.message_id)
                    await bot.context.replyWithPhoto(profile4.photos[0][0].file_id,{caption: `<b>Name:</b> <a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n<b>Username:</b> ${username(ctx)}\n<b>ID:</b> ${bot.context.from.id}`,
                        parse_mode:'HTML'
                    })
                }
            }
        })
    }
    
})

//remove files with file_id
bot.command('rem', async(ctx) => {
    if(bot.context.chat.type == 'private') {
        const msg = bot.context.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text2 = msgArray.join(' ')
        let text = `${text2}`.replace(/_/g, '-');
        console.log(text);

        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            await bot.context.deleteMessage(bot.context.message.message_id)
            saver.removeFile(text)
            await bot.context.reply('❌ 1 media deleted successfully')
        }
    }
    
})

bot.command('remgrp', async(ctx) => {
    if(bot.context.chat.type == 'private') {
        const msg = bot.context.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let media = msgArray.join(' ')
        //console.log(media);

        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            await bot.context.deleteMessage(bot.context.message.message_id)
            saver.removeFileMedia(media)
            await bot.context.reply('❌ Media group deleted successfully')
        }
    }
})

//remove whole collection(remove all files)
bot.command('clear', async(ctx)=>{
    if(bot.context.chat.type == 'private') {
        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            await bot.context.deleteMessage(bot.context.message.message_id)
            await saver.deleteCollection()
            await bot.context.reply('❌ All media deleted successfully')
        }
    }
})

//removing all files sent by a user
bot.command('remall', async(ctx) => {
    if(bot.context.chat.type == 'private') {
        const msg = bot.context.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        //console.log(text);
        let id = parseInt(text)

        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            await bot.context.deleteMessage(bot.context.message.message_id)
            await saver.removeUserFile(id)
            await bot.context.reply('❌ Delete all user media successfully')
        }
    }
    
})

//broadcasting message to bot users(from last joined to first)
bot.command('broadcast',async(ctx)=>{
    if(bot.context.chat.type == 'private') {
        const msg = bot.context.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        const userDetails = await saver.getUser().then(async res =>{
            const n = res.length
            const userId = []
            for (let i = n-1; i >=0; i--) {
                userId.push(res[i].userId)
            }

            //broadcasting
            const totalBroadCast = 0
            const totalFail = []

            //creating function for broadcasting and to know bot user status
            async function broadcast(text) {
                for (const users of userId) {
                    try {
                        await bot.telegram.sendMessage(users, String(text),{
                            parse_mode:'HTML',
                            disable_web_page_preview: true
                          }
                        )
                    } catch (err) {
                        await saver.updateUser(users)
                        totalFail.push(users)

                    }
                }
                await bot.context.reply(`✅ <b>Number of active users:</b> ${userId.length - totalFail.length}\n❌ <b>Total failed broadcasts:</b> ${totalFail.length}`,{
                    parse_mode:'HTML'
                })

            }

            if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
                await bot.context.deleteMessage(bot.context.message.message_id)
                broadcast(text)
                await bot.context.reply('Broadcast starts (Message is broadcast from last joined to first).')

            }else{
                await bot.context.deleteMessage(bot.context.message.message_id)
                await bot.context.reply(`Commands can only be used by Admin.`) 
            }

        })
    }
    
})

//ban user with user id
bot.command('banchat', async(ctx) => {
    if(bot.context.chat.type == 'private') {
        const msg = bot.context.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        //console.log(text)
        const userId = {
            id: text
        }

        if(bot.context.chat.type == 'private') {
            if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
                await bot.context.deleteMessage(bot.context.message.message_id)
                await saver.banUser(userId).then(async res => {
                    await bot.context.reply('❌ Banned')
                })
            }
        }
    }
     
})

//unban user with user id
bot.command('unbanchat', async(ctx) => {
    if(bot.context.chat.type == 'private') {
        const msg = bot.context.message.text
        let msgArray = msg.split(' ')
        msgArray.shift();
        let text = msgArray.join(' ')
        //console.log(text)
        const userId = {
            id: text
        }

        if(bot.context.chat.type == 'private') {
            if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
                await bot.context.deleteMessage(bot.context.message.message_id)
                await saver.unBan(userId).then(async res => {
                    await bot.context.reply('✅ Finished')
                })
            }
        }
    }
    
})

bot.on('message', ctx => {
    const { video, photo, document } = bot.context.message
    if (video || photo || document) {
        // add context to queue if video, photo or document exists
        files.add({
            ctx: bot.context.update
        })
    }
})
  
// process files
files.process(async job => processFiles(job.data.ctx))
async function processFiles (ctx) {
    if (bot.context.message.document) {  
        if(bot.context.chat.type == 'private') {
            if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
                const document = bot.context.message.document
    
                if(bot.context.message.media_group_id == undefined){
                    var tag = `✔️ Document save`;
                    var mediaId = ``;
                    var mediaId2 = ``;
                    if(document.file_name == undefined){
                        var file_name2 = `${today2(ctx)}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }else{
                        var exstension2 = document.file_name;
                        var regex2 = /\.[A-Za-z0-9]+$/gm
                        var doctext2 = exstension2.replace(regex2, '');
                        
                        var file_name2 = `${doctext2}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }
                }else{
                    var tag = `✔️ Group save`;
                    var mediaId = `\n<b>Media ID</b>: ${bot.context.message.media_group_id}`;
                    var mediaId2 = `\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${bot.context.message.media_group_id}`;
                    if(document.file_name == undefined){
                        var file_name2 = `${today2(ctx)}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }else{
                        var exstension2 = document.file_name;
                        var regex2 = /\.[A-Za-z0-9]+$/gm
                        var doctext2 = exstension2.replace(regex2, '');
                        
                        var file_name2 = `${doctext2}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }
                }
    
                await saver.checkFile(`${document.file_unique_id}`).then(async res => {
                    //console.log(res);
                    if(res == true) {
                        await bot.context.reply(`File already exists.`,{
                            reply_to_message_id: bot.context.message.message_id
                        })
                    }else{
                        await bot.context.replyWithDocument(document.file_id, {
                            chat_id: bot.context.chat.id,
                            caption: `${tag} \n<b>Name file:</b> ${file_name2}\n<b>Size:</b> ${document.file_size} B\n<b>File ID:</b> ${document.file_unique_id} ${mediaId} \n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id} ${mediaId2}`,
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_to_message_id: bot.context.message.message_id
                        })
                        await bot.context.replyWithDocument(document.file_id, {
                            chat_id: process.env.LOG_CHANNEL,
                            caption: `${tag} \n<b>From:</b> ${bot.context.from.id}\n<b>Name:</b> <a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Name file:</b> ${file_name2}\n<b>Size:</b> ${document.file_size} B\n<b>File ID:</b> ${document.file_unique_id} ${mediaId} \n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${document.file_unique_id} ${mediaId2} ${caption2}`,
                            parse_mode:'HTML'
                        })
                        const fileDetails1 = {
                            file_name: file_name2,
                            userId: bot.context.from.id,
                            file_id: document.file_id,
                            mediaId: bot.context.message.media_group_id,
                            caption: bot.context.message.caption,
                            file_size: document.file_size,
                            uniqueId: document.file_unique_id,
                            type: 'document'
                        }
                        await saver.saveFile(fileDetails1)
                    }
                })
            }
        }
    } else if (bot.context.message.video) {
        if(bot.context.chat.type == 'private') {
            if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
                const video = bot.context.message.video
        
                if(bot.context.message.media_group_id == undefined){
                    var tag = `✔️ Video save`;
                    var mediaId = ``;
                    var mediaId2 = ``;
                    if(video.file_name == undefined){
                        var file_name2 = `${today2(ctx)}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }else{
                        var exstension2 = video.file_name;
                        var regex2 = /\.[A-Za-z0-9]+$/gm
                        var vidtext2 = exstension2.replace(regex2, '');
            
                        var file_name2 = `${vidtext2}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }
                }else{
                    var tag = `✔️ Group save`;
                    var mediaId = `\n<b>Media ID</b>: ${bot.context.message.media_group_id}`;
                    var mediaId2 = `\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${bot.context.message.media_group_id}`;
                    if(video.file_name == undefined){
                        var file_name2 = `${today2(ctx)}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }else{
                        var exstension2 = video.file_name;
                        var regex2 = /\.[A-Za-z0-9]+$/gm
                        var vidtext2 = exstension2.replace(regex2, '');
            
                        var file_name2 = `${vidtext2}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }
                }
    
                await saver.checkFile(`${video.file_unique_id}`).then(async res => {
                    //console.log(res);
                    if(res == true) {
                        await bot.context.reply(`File already exists.`,{
                            reply_to_message_id: bot.context.message.message_id
                        })
                    }else{
                        await bot.context.replyWithVideo(video.file_id, {
                            chat_id: bot.context.chat.id,
                            caption: `${tag} \n<b>Name file:</b> ${file_name2}\n<b>Size:</b> ${video.file_size} B\n<b>File ID:</b> ${video.file_unique_id} ${mediaId} \n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id} ${mediaId2}`,
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_to_message_id: bot.context.message.message_id
                        })
                        await bot.context.replyWithVideo(video.file_id, {
                            chat_id: process.env.LOG_CHANNEL,
                            caption: `${tag} \n<b>From:</b> ${bot.context.from.id}\n<b>Name:</b> <a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Name file:</b> ${file_name2}\n<b>Size:</b> ${video.file_size} B\n<b>File ID:</b> ${video.file_unique_id} ${mediaId} \n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${video.file_unique_id} ${mediaId2} ${caption2}`,
                            parse_mode:'HTML'
                        })
                        const fileDetails1 = {
                            file_name: file_name2,
                            userId: bot.context.from.id,
                            file_id: video.file_id,
                            mediaId: bot.context.message.media_group_id,
                            caption: bot.context.message.caption,
                            file_size: video.file_size,
                            uniqueId: video.file_unique_id,
                            type: 'video'
                        }
                        await saver.saveFile(fileDetails1)
                    }
                })
            }
        }
    } else if (bot.context.message.photo[1]) {
        if(bot.context.chat.type == 'private') {
            if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
                const photo = bot.context.message.photo[1]
    
                if(bot.context.message.media_group_id == undefined){
                    var tag = `✔️ Photo save`;
                    var mediaId = ``;
                    var mediaId2 = ``;
                    if(photo.file_name == undefined){
                        var file_name2 = `${today2(ctx)}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }else{
                        var exstension2 = photo.file_name;
                        var regex2 = /\.[A-Za-z0-9]+$/gm
                        var photext2 = exstension2.replace(regex2, '');
                        
                        var file_name2 = `${photext2}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }
                }else{
                    var tag = `✔️ Group save`;
                    var mediaId = `\n<b>Media ID</b>: ${bot.context.message.media_group_id}`;
                    var mediaId2 = `\nhttps://t.me/${process.env.BOTUSERNAME}?start=grp_${bot.context.message.media_group_id}`;
                    if(photo.file_name == undefined){
                        var file_name2 = `${today2(ctx)}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }else{
                        var exstension2 = photo.file_name;
                        var regex2 = /\.[A-Za-z0-9]+$/gm
                        var photext2 = exstension2.replace(regex2, '');
                        
                        var file_name2 = `${photext2}`;
                        if(bot.context.message.caption == undefined){
                            var caption2 =  ``;
                        }else{
                            var caption2 =  `\n\n${bot.context.message.caption}`;
                        }
                    }
                }
    
                await saver.checkFile(`${photo.file_unique_id}`).then(async res => {
                    //console.log(res);
                    if(res == true) {
                        await bot.context.reply(`File already exists.`,{
                            reply_to_message_id: bot.context.message.message_id
                        })
                    }else{
                        await bot.context.replyWithPhoto(photo.file_id, {
                            chat_id: bot.context.chat.id,
                            caption: `${tag} \n<b>Name file:</b> ${file_name2}\n<b>Size:</b> ${photo.file_size} B\n<b>File ID:</b> ${photo.file_unique_id} ${mediaId} \n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo.file_unique_id} ${mediaId2}`,
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_to_message_id: bot.context.message.message_id
                        })
                        await bot.context.replyWithPhoto(photo.file_id, {
                            chat_id: process.env.LOG_CHANNEL,
                            caption: `${tag} \n<b>From:</b> ${bot.context.from.id}\n<b>Name:</b> <a href="tg://user?id=${bot.context.from.id}">${first_name(ctx)} ${last_name(ctx)}</a>\n\n<b>Name file:</b> ${file_name2}\n<b>Size:</b> ${photo.file_size} B\n<b>File ID:</b> ${photo.file_unique_id} ${mediaId} \n\nhttps://t.me/${process.env.BOTUSERNAME}?start=${photo.file_unique_id} ${mediaId2} ${caption2}`,
                            parse_mode:'HTML'
                        })
                        const fileDetails1 = {
                            file_name: file_name2,
                            userId: bot.context.from.id,
                            file_id: photo.file_id,
                            mediaId: bot.context.message.media_group_id,
                            caption: bot.context.message.caption,
                            file_size: photo.file_size,
                            uniqueId: photo.file_unique_id,
                            type: 'photo'
                        }
                        await saver.saveFile(fileDetails1)
                    }
                })
            }
        }
    }
}

bot.command('stats',async(ctx)=>{
    await bot.context.deleteMessage(bot.context.message.message_id)
    const stats1 = await saver.getUser().then(async res=>{
        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            await bot.context.reply(`📊 Total users: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }
    })
    const stats2 = await saver.getMedia().then(async res=>{
        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            await bot.context.reply(`📊 Total media: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }
    })
    const stats3 = await saver.getBan().then(async res=>{
        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            await bot.context.reply(`📊 Total users violate: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }
    })
    const stats4 = await saver.getGroup().then(async res=>{
        if(bot.context.from.id == Number(process.env.ADMIN) || bot.context.from.id == Number(process.env.ADMIN1) || bot.context.from.id == Number(process.env.ADMIN2)){
            await bot.context.reply(`📊 Total registered groups: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }
    })
})
 
//heroku config
domain = `${process.env.DOMAIN}.herokuapp.com`
bot.launch({
    webhook:{
       domain:domain,
        port:Number(process.env.PORT) 
    }
})
