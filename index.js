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
      /*   const fetchShelves = async () => { */
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
                        const title = decodeURI( product.split('/', 4)[3]).replaceAll('-', ' ');
                        const price = shelf.find('span.a-price > span.a-offscreen').text().split('€', 1)
                        const link = shelf.find('a.a-link-normal.a-text-normal').attr('href')
                        let element = {
                            title,
                            price,
                            product
                        }
                         shelves.push(element)
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
                    Main.getOffers()
                   
                   
                }else{
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
                            }
                        }
                    }
                }
             
            });
        }
        });

        
    }

}
/* } */





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

/* const fetchShelves = async () => {
    try {
        const shelves = [];
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
                const title = decodeURI( product.split('/', 4)[3]).replaceAll('-', ' ');
                const price = shelf.find('span.a-price > span.a-offscreen').text().split('€', 1)
                const link = shelf.find('a.a-link-normal.a-text-normal').attr('href')
                let element = {
                    title,
                    price,
                    product
                }
                 shelves.push(element)
              });
        } */

        

    
/*         const response = await axios.get('https://www.amazon.es/Isoprop%C3%ADlico-Nazza-componentes-electr%C3%B3nicos-Isopropanol/dp/B07CYJLG1S/ref=sr_1_8?crid=3VBSPIVWCMPFI&keywords=alcohol+isopropilico&qid=1662803322&sprefix=alcohol%2Caps%2C97&sr=8-8/',{
            headers: {
                Accept: "application/json",
                "User-Agent": "axios 0.21.1"
              }
        });
 
        const html = response.data;
 
        const $ = cheerio.load(html);
 
        const shelves = []; */
 
/*   $('div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.s-widget-spacing-small.sg-col-4-of-20').each((_idx, el) => {
            const shelf = $(el)
            const title = shelf.find('span.a-size-base-plus.a-color-base.a-text-normal').text()
            const price = shelf.find('span.a-price > span.a-offscreen').text()
            const link = shelf.find('a.a-link-normal.a-text-normal').attr('href')
            const image = shelf.find('img.s-image').attr('src')
            let prices= price.split('€',2)
            let priceNumber=[];
            for (let p of prices){
                console.log(p)
                let number = isNaN(parseFloat(p).toFixed(2)) ? 0 : parseFloat(p.replace(/,/, '.')).toFixed(2)
                priceNumber.push(number)
            }
            let element = {
                title,
                link: `https://amazon.com${link}`,
                price: priceNumber
            }
            shelves.push(element)
            bot.sendMessage(5070376355, (element.title.toString() + ' ' + element.price.toString()))
        }); */
    /*      $('div.a-box.a-last').each((_idx, el) => { 
            const shelf = $(el)
            const title = shelf.find('span.a-size-large.product-title-word-break').text()
            const price = shelf.find('span.a-price > span.a-offscreen').text().split('€', 1)
            const link = shelf.find('a.a-link-normal.a-text-normal').attr('href')
            console.log(price)
            let element = {
                title,
                price,
                link
            }
             shelves.push(element)
          }); */

  /* $('div.a-box.a-last').each((_idx, el) => {
            const shelf = $(el)
            const title = shelf.find('span.a-size-large.product-title-word-break').text()
            const price = shelf.find('span.a-price > span.a-offscreen').text()
            const link = shelf.find('a.a-link-normal.a-text-normal').attr('href')
            const image = shelf.find('img.s-image').attr('src')
            let prices= price.split('€',2)
            let priceNumber=[];
            for (let p of prices){
                console.log(p)
                let number = isNaN(parseFloat(p).toFixed(2)) ? 0 : parseFloat(p.replace(/,/, '.')).toFixed(2)
                priceNumber.push(number)
            }
            let element = {
                title,
                link: `https://amazon.com${link}`,
                price:  priceNumber
            }
          shelves.push(element)
        bot.sendMessage(5070376355, (element.title.toString() + ' ' + element.price[0].toString() +'€ ' +  element.price[1]?.toString() +'€'))
        }); */


        /////CSV file saved
       /*  let csvContent = shelves.map(element => {
            return Object.values(element).map(item => `"${item}"`).join(',')
         }).join("\n")
         
         fs.writeFile('saved-shelves.csv', "Title, Image, Link, Price, Reviews, Stars" + '\n' + csvContent, 'utf8', function (err) {
            if (err) {
              console.log('Some error occurred - file either not saved or corrupted.')
            } else{
              console.log('File has been saved!')
            }
         }) */

 /*        return shelves;
    } catch (error) {
        throw error;
    }
 }; */
 
/*  fetchShelves().then((shelves) => console.log(shelves)); */


cron.schedule('0 0 */3 * * *', () => {
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