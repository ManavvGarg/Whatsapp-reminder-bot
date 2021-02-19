//Defining essential constants
const { Client } = require("whatsapp-web.js");
const tCode = require("qrcode-terminal")
const figlet = require("figlet");
const fs = require("fs");
const ms = require("./functions/timeConvert");

//Requiring bot information and creator information
const { botInfo, creatorInfo, mongoURI, PREFIX } = require("./config")

//Requiring mongoose for database creation/storage of information
const mongoose = require("mongoose");
const userDB = require("./models/user");

//Authenticating with mongoose
try {
    mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
     
  console.log('Connected to Data Base!');
    } catch(e) { console.log(e) }

//Requiring session config.
const sessionSave = './sessions/session.json';

let sessionData;
if(fs.existsSync(sessionSave)) { sessionData = require(sessionSave); };

//Defining bot
const bot = new Client({
    session: sessionData
});

//QR Code gen event
bot.on("qr", qr=>{
    tCode.generate(qr, {small:true});
})


//Authenticated Event
bot.on("authenticated", auth => {
    sessionData = auth;
    fs.writeFile(sessionSave, JSON.stringify(auth), function(err) { if(err) console.log(err) })
})


//Ready Event
bot.on("ready", ()=>{
    //Chnage the bot ready to anything you want :D
    figlet.text(`Bot ready!`, function (err, data) {
        if (err) {
            console.log('Something went wrong');
            console.dir(err);
        }
        console.log(`═════════════════════════════════════════════════════════════════════════════`);
        console.log(data)
        console.log(`═════════════════════════════════════════════════════════════════════════════`);
      })
})

//Disconnected || Auth deactivate
bot.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});


//============================================================= Message Event ================================================================
bot.on("message", async(message) => {
    //Default automated message upon hi.
    if(message.body.toLowerCase() === "hi" || message.body.toLowerCase() === "hello" || message.body.toLowerCase() === "hey") { return bot.sendMessage(message.from, `Hi! I am Xvee, Your personal reminder bot🤖. \n\nNice to meet you!\nIf you would like to access my help menu, use: \n\n*${PREFIX}help*`)};

    //Help command
    if(message.body.toLowerCase() === `${PREFIX}help`) { return bot.sendMessage(message.from, `*Help menu*\n\n1) How to set reminders ⏰\n\n2) Bot info ℹ️\n\n3) Information about my creator 👨‍💻\n\nNow to select an option simply use: \n\n${PREFIX}help 1 *OR* ${PREFIX}help 2 *OR* ${PREFIX}help 3`) }

    //Help comman: Option 1
    if(message.body.toLowerCase() === `${PREFIX}help 1`) {
        return bot.sendMessage(message.from, `*Help: Set Reminders ⏰*\n\n*Usage:* \n\n*${PREFIX}set <time> <your reminder>*`);
    }
    
    //Help comman: Option 2
    if(message.body.toLowerCase() === `${PREFIX}help 2`) {
        return bot.sendMessage(message.from, `*Information about me! 🤖*\n\n${botInfo}`);
    }
    
    //Help comman: Option 3
    if(message.body.toLowerCase() === `${PREFIX}help 3`) {
        return bot.sendMessage(message.from, `*Information about my creator! 👨‍💻*\n\n${creatorInfo}`);
    }

    //set reminder command
    if(message.body.startsWith(`${PREFIX}set`)) {
        try { 
            //remove prefix "xv "
            let removePrefix = message.body.replace(`${PREFIX}set`, "");

            //get reminder time
            let setDays = message.body.slice(7, 10);
            const t = setDays.split(" ")[0];

            //test it for milliseconds and its length more than 3, to avoid setting time like: 123d OR 123m or any 3 digit time period
            var match = /^(-?(?:\d+)?\.?\d+) *(ms)?$/i.exec(t);
            if(match) return bot.sendMessage(message.from, `The time you provided is incorrect ❌ \n\nMake sure to use: \n\nxv set 5<d *OR* h *OR* m> \n\nwhere 'd' represents days, \n\n'm' represents minutes, \n\n'h' represents hours.\n\nAlso make sure the value you provided should between 0 & 99`)
            if(t.length > 3) return bot.sendMessage(message.from, `The time you provided is incorrect ❌ \n\nMake sure to use: \n\nxv set 5<d *OR* h *OR* m> \n\nwhere 'd' represents days, \n\n'm' represents minutes, \n\n'h' represents hours.\n\nAlso make sure the value you provided should between 0 & 99`)

            //assigning variable to reminder message
            let setReminder = removePrefix.slice(4);

            //get user contact
            let contact = await message.getContact();
 
            //MongoDB CheckPoint
             userDB.findOne({
                 User: `${contact.number}`
             }, 
             
             async(err, data) => {
                 if(err) throw err;
                 if(data) {
                     //Reminder defaults to null. If it is null then do the following else return with message to avoid over writing of data.
                     if(data.Reminder === null || data.Reminder === undefined) {
                         data.Reminder = setReminder;
                         data.save();
                         bot.sendMessage(message.from, `Done 👌 I will remind you after ${t} for: \n\n${setReminder}\n\nCya then👋`)
                     }
                     
                     else { return bot.sendMessage(message.from, "Uh-oh ❌\n\nYou already have set a reminder! At the time I can only set one reminder!") }
                 }
     
                 //If no data is found for the user, Create one.
                 else if(!data) {
                     const newData = new userDB({
                         User: `${contact.number}`,
                         Reminder: setReminder
                     });
                     newData.save();
                     bot.sendMessage(message.from, `Done 👌 I will remind you after ${t} for: \n\n${setReminder}\n\nCya then👋`)
                 }
             });

             //SetTimeout function, for each user to actually remind them. :/
             setTimeout(async() => {
                 await userDB.findOne({
                     User: `${contact.number}`
                 }, 
                 
                 async(err, data) => {
                     if(err) throw err;
                     if(data) {
                         let reminderInfo = data.Reminder;
                         let number = `${data.User}@c.us`;
                        return bot.sendMessage(number, `Reminder🔔:\n\n${reminderInfo}`);
                     }
                 });

                 //Once reminded, Delete the data from the database to decrease storage usage and well to protect their privacy! :D
                 userDB.findOne({
                     User: `${contact.number}`
                 },
                 
                 async(err, data) => {
                    if(data) {
                       await userDB.findOneAndDelete({ User: `${contact.number}` })
                    }
                 })
             }, ms(t))
 
 
             //IF an error occurs, Following will exec.
         } catch (e) { console.log(e); bot.sendMessage(message.from, `The time you provided is incorrect ❌ \n\nMake sure to use: \n\nxv set 5<s *OR* d *OR* h *OR* m> \n\nwhere \n\n's' represents seconds, \n\n'd' represents days, \n\n'm' represents minutes, \n\n'h' represents hours.\n\nAlso make sure the value you provided should between 0 & 99\n\nExample: xv set 1h buy groceries.`) }




    
    }

    //owner ONLY COMMAND BELOW.

    if (message.body.startsWith('!status ')) {
        const contact = await message.getContact();
        if(!contact.number === "YOUR PERSONAL NUMBER HERE TO MAKE THIS STATUS COMMAND OWNER ONLY COMMAND") return;
        const newStatus = message.body.split(' ')[1];
        await bot.setStatus(newStatus);
        message.reply(`Status was updated to *${newStatus}*`); }

})



// Initializing the bot
bot.initialize();

