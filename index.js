const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");

const baseUrl = "https://www.prisma.io";

let visitedUrls = new Set();
let queue = [baseUrl];

// Scrape the content from a given page
async function scrapePage(pageUrl) {
  console.log(`Scraping ${pageUrl}`);

  // Fetch the page content
  const response = await axios(pageUrl);
  const html = response.data;
  const $ = cheerio.load(html);

  const contents = {};

  $("h1, h2, h3, h4, h5, h6").each(function () {
    const heading = $(this).text();
    const content = $(this).nextUntil("h1, h2, h3, h4, h5, h6").text();
    contents[heading] = content;
  });

  console.log(contents);

  // Find all internal links on the page and add them to the queue
  $("a").each(function () {
    const href = $(this).attr("href");
    if (href && href.startsWith("/") && href.length > 1) {
      const absoluteUrl = url.resolve(baseUrl, href);
      if (!visitedUrls.has(absoluteUrl)) {
        queue.push(absoluteUrl);
      }
    }
  });

  // Mark the page as visited
  visitedUrls.add(pageUrl);
}

// Scrape the URLs in the queue
async function scrapeQueue() {
  while (queue.length > 0) {
    const url = queue.shift();
    await scrapePage(url);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
  }

  console.log("Finished scraping. Pages visited:");
  console.log(Array.from(visitedUrls));
}

// Start the scraper
scrapeQueue().catch(console.error);
