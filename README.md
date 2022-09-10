# Scrapper for products amazon

An amazon product scraper, use the node-cron library to run it in a crontab. You can choose the frequency at which it runs by modifying it in the index.js file. But have some considerations about the methods Amazon uses for its web scrapers.

*Made by Jaserto*

Steps to follow.

1. Clone the repository
2. Install the dependencies with npm.
3. Go to the products file. Include the products you want to scrape.
4. Finally, run it with npm run start or node index.js.

That's one of Amazons' many bot protection features.

Some of the things you could do:

- Scrape slower.
- Introduce some randomness.
- Use a common, modern User-Agent.
- Use multiple IPs.

- If you won't b/c scraping data from Amazon is against their TOS. So instead you are going to use the Amazon Product Advertising API ;)
