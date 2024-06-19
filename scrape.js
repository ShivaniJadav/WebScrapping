const axios = require('axios');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const fs = require('fs');
const parser = json2csv.Parser;

let page = "index.html";
const baseUrl = "https://books.toscrape.com/catalogue/category/books/fiction_10/";
const list = [];

const getBooks = async () => {
    let url = baseUrl + page;
    let response = await axios(url);
    const $ = cheerio.load(response.data);

    const books = $('article');
    books.each(function() {
        list.push({
            Title: $(this).find('h3 a').attr('title'),
            Rating: $(this).find('p').attr('class').split(" ")[1],
            Price: $(this).find('div.product_price p.price_color').text(),
            Availability: $(this).find('div.product_price p.availability').attr('class').split(" ")[0] == 'instock' ? true : false
        });
    });

    if($('ul.pager')) {
        page = $('ul.pager li.next a').attr('href');    
        if(page) {
            getBooks();
        } else {
            const j2cp = new parser();
            const csv = j2cp.parse(list);
            fs.writeFileSync('./books.csv', csv);
            console.log(list);
        }
    }
}

getBooks();