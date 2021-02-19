# Whatsapp Reminder Bot
 - Your personal reminder bot which will notify you if you have set a reminder!

# List of contents:
 - Index.js => The main file and the only file where all the bot code is present.
 - config.js => Your configuration file where you have to store your credentials and some basic info.
 - sessions folder => The folder where the bot will store the whatsapp web auth sesison so that you dont have to login again and again.js
 - functions folder => The folder where the "time conversion" modules is saved. Don't touch. thanks. (Its the same npm package called 'ms')

# NPM Packages used:-
 > whatsapp-web.js : https://github.com/pedroslopez/whatsapp-web.js/
 > figlet : https://www.npmjs.com/package/figlet
 > qrcode-terminal : https://www.npmjs.com/package/qrcode-terminal
 > Mongoose : https://www.npmjs.com/package/mongoose
 > fs
 > path

# Basic How-To:
 - Clone the repo.
 > npm i
 - After installing all the packages, simply put in your mongoDB credentials inside your config.js file.
 - Open the project folder in your terminal/powershell/whatever program you use.
 > node . OR node index.js
 - Scan the qr code generated inside the console with your whatsapp account on your phone to authenticate.
 - After auth the bot will be online, and will run as per the code.

 # Developed and maintained by:
 > Manav Garg | https://github.com/ManavvGarg | https://manavgarg.tk/
