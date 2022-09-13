const axios = require("axios").default;
const cheerio = require("cheerio");
const fs = require('fs');
const cron = require('node-cron');
const {products, db} = require('./util');

// Telegram Bot
const TelegramBot = require('node-telegram-bot-api');
const token = '5539549484:AAFsMm09z0hCzG6gtjK5LnwzxVf--A67TD0';
const bot = new TelegramBot(token, {polling: true});




class Main {
    
    static async getOffers(){
        console.log('Getting offers')
        const name = new Date().toDateString().split(" ").join("_");
        const shelves = [];
            try {
                for(let product of products){
                    let response = await axios.get(product,{
                        headers: {
                            Accept: "application/json",
                            "User-Agent": "axios 0.21.1"
                          }
                    });
              
                    let html = response.data;
                    let $ = cheerio.load(html);
                
                    $('div.a-box.a-last').each((_idx, el) => { 
                        const shelf = $(el)
                        const titleBefore = product.toString().split('/', 4)[3].replaceAll('-', ' '); 
                        const title = decodeURI( titleBefore);
                        const price = shelf.find('span.a-price > span.a-offscreen').text().split('€', 1)
                        const link = shelf.find('a.a-link-normal.a-text-normal').attr('href')
                        let element = {
                            title,
                            price,
                            product
                        }
                         shelves.push(element)
                         console.log(title)
                      });
                }
                db.setItem(name, JSON.stringify(shelves))
            } catch (error) {
                throw error;
            }
    };

     static async checkDownPrice(){
        const date = new Date()
        date.setDate(date.getDate() - 1);
        const dateYesterday = date.toDateString().split(" ").join("_");
        const dateToday = new Date().toDateString().split(" ").join("_");
        const ofertsCompare = []
        fs.readFile(`./database/${dateYesterday}`, (err, data) => {
            if (err) throw err;
            let offers = JSON.parse(data);
         console.log('checking')
        if(offers){
            for(let i = 0; i < offers.length; i++){
              ofertsCompare.push(offers[i].price[0])
            }
         
            fs.readFile(`./database/${dateToday}`, (err, data) => {
                if (err) {
                    console.log('No se encontro el archivo con las ofertas de, ',dateToday)
                    Main.getOffers();
                }else{
                    console.log(offers)
                    let offersToday = JSON.parse(data);
                    if(offersToday){
                        for(let j =0; j< offersToday.length; j++){
                            if( ofertsCompare[j] > offersToday[j].price[0]){
                                bot.sendMessage(5070376355, (
                                    offersToday[j].title + " ha bajado de precio " 
                                        + offersToday[j].price[0] +'€' + ` Anterior: ` 
                                        + ofertsCompare[j] +'€ ⬇️' + ' ⭐Aquí tienes el enlace: '
                                        + offersToday[j].product
                                ))
                            }else if(ofertsCompare[j] === offersToday[j].price[0]){
                                bot.sendMessage(5070376355, ('🙁 Permanece igual de precio: '+ offersToday[j].title + ' '+offersToday[j].price[0]+'€' ))
                            }else{
                                bot.sendMessage(5070376355, ('🙁 Subió de precio: '+ offersToday[j].title + ' '+offersToday[j].price[0]+'€' ))
                            }
                        }
                    }
                }
             
            });
        }
        });

        
    }

}



/* 
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    Main.checkDownPrice()  
    bot.sendMessage(chatId, 'Se recibió el mensaje');
  });
 */
  bot.onText(/^\bcomprobar/, (msg) => {
    bot.sendMessage(msg.chat.id, "Hola " + msg.from.first_name);
    Main.checkDownPrice()  
});



cron.schedule('3 * * * * *', () => {
    const dateToday = new Date().toDateString().split(" ").join("_");
    const path = `./database/${dateToday}`

    console.log('Se ejecutó el main')
   
            try {
                if (fs.existsSync(path)) {
                //file exists
                console.log('existe')
                Main.checkDownPrice()
                  }else{
                    Main.getOffers()
                  }
                } catch(err) {
                    return
                }
})