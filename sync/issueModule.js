const fs = require("fs");
require("dotenv").config();
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const { importImageModule } = require("./importImageModule");
const { createFileFolder } = require("./createFilesFolder");
const {
  createDirectus,
  rest,
  withToken,
  readItems,
  createItems,
} = require("@directus/sdk");

// ============

// Import cover images sequentially
async function importCoverImages(data, client) {
  if (!data.covers || data.covers.length === 0) {
    console.log("No covers to import.");
    return;
  }

  let issue_folder;
  issue_folder = await createFileFolder({
    name: "Covers",
    parent: data.issue_folder.id,
  });

  for (let i = 0; i < data.covers.length; i++) {
    const coverData = data.covers[i];
    const key = `cover_${i + 1}`;
    const coverId = await importImageModule(coverData, issue_folder, client);
    data[key] = coverId;
  }
}

async function importIssue(data, mainIssuesFolder) {
  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  try {
    if (data) {
      console.log(">>>---------------- - - - -");
      console.log(`Importing issue for ${data.year}-${data.month}`);
      console.log(`Issue #${data.issue_number}`);

      let issueFolder;
      issueFolder = await createFileFolder({
        name: data.title,
        parent: mainIssuesFolder.id,
      });

      data.issue_folder = issueFolder;

      // Import cover images sequentially
      await importCoverImages(data, client);

      // Import articles sequentially
      // const articles = await importArticles(data, client);
      // console.log(articles);

      // remove the articles from the data object
      delete data.articles;

      const newData = {
        ...data,
        // articles,
      };

      console.log(">>>---------------- - - - -");
      console.log(`Creating issue data: ${newData.title}`);

      const createIssue = await client.request(
        withToken(BASE_ACCESS_TOKEN, createItems("issues", newData))
      );
      return createIssue;
    }
  } catch (error) {
    console.error("Error creating issue data:", error);
    console.error(error.extensions);

    // Handle the error and write specific data to a text file
    const failedData = `${data.title}\n`;
    const filePath = `sync/errors-issue.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

// Start the import process
importIssue();

async function checkForIssue(data) {
  try {
    const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
    const issue = await client.request(
      withToken(
        BASE_ACCESS_TOKEN,
        readItems("issues", {
          filter: {
            old_id: {
              _eq: data.old_id,
            },
          },
        })
      )
    );

    return issue.length > 0 ? issue[0].id : null;
  } catch (error) {
    console.error("Error fetching issue:", error.message);

    // Handle the error and write specific data to a text file
    const failedData = `${data.issue_number}\n`;
    const filePath = `sync/errors-issue.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

module.exports = {
  importIssue,
  checkForIssue,
};
