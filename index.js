const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(cors());

const PORT = 3000;

// Route to scrape match list
app.get("/scrape", async (req, res) => {
  try {
    const response = await axios.get(
      "https://crichd.tv/live-cricket-streaming-nvm"
    );
    const html = response.data;

    const $ = cheerio.load(html);
    const rows = $("tbody tr");

    const data = [];

    rows.each((index, element) => {
      const title = $(element).find(".event-title").text().trim();
      const liveLink = $(element).find("a.event").attr("href") || null;

      data.push({ title, live: liveLink });
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while scraping the website");
  }
});

// Route to scrape channel details
app.get("/scrape-details", async (req, res) => {
  const { url } = req.query;

  // Check if URL parameter is provided
  if (!url) {
    return res.status(400).send("URL parameter is required");
  }

  try {
    // Make a GET request to the provided URL
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML content into Cheerio
    const $ = cheerio.load(html);

    // Find the rows of the table with class 'table-hover'
    const rows = $("table.table-hover tbody tr");

    const channels = [];

    // Iterate over each row and extract channel name and link
    rows.each((index, element) => {
      const channelName = $(element).find("td").first().text().trim();
      const channelLink = $(element).find("a").attr("href");

      if (channelName && channelLink) {
        channels.push({ name: channelName, link: channelLink });
      }
    });

    // Return the list of channels as JSON
    if (channels.length > 0) {
      res.json(channels);
    } else {
      res.status(404).send("No channels found on the provided page.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while scraping the details page");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
