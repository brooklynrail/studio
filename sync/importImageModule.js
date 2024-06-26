// importImage.js
const fs = require("fs");
const { BASE_ACCESS_TOKEN, BASE_DIRECTUS_URL } = require("./config");
const {
  withToken,
  importFile,
  readFiles,
  rest,
  createDirectus,
} = require("@directus/sdk");

async function importImageModule(data, issue_folder, client) {
  try {
    if (data && data.path) {
      // Import the image
      // FULL path to Cloud Storage files
      const path = `https://storage.googleapis.com/rail-legacy-media/production${data.path}`;
      // Local, relative paths
      // const path = `http://localhost:8000${data.path}`;
      const description = data.description;
      const caption = data.caption;
      const shortcode_key = data.shortcode_key;
      const old_path = data.old_path;
      const tags = data.tags;
      const folder = issue_folder.id;

      const result = await client.request(
        withToken(
          BASE_ACCESS_TOKEN,
          importFile(path, {
            description: description || null,
            caption: caption || null,
            shortcode_key: shortcode_key || null,
            old_path: old_path || null,
            tags: tags || null,
            folder: folder || null,
          })
        )
      );

      // return the ID of the file that was just uploaded
      if (result) {
        return result.id;
      }
    }
  } catch (error) {
    console.error("Error uploading single image:", error);

    // Handle the error and write specific data to a text file
    const failedData = `${data.path}\n`;
    const filePath = `sync/errors-images.txt`;

    // Write the error data to the text file
    fs.appendFileSync(filePath, failedData, "utf-8");
  }
}

// check to see if image already exists in Directus
// if it does, return the ID of the existing image
async function checkForImage(data) {
  console.log("checking for image data ----> ", data);
  console.log("data.path", data.path);

  const client = createDirectus(BASE_DIRECTUS_URL).with(rest());
  const image = await client.request(
    withToken(
      BASE_ACCESS_TOKEN,
      readFiles({
        query: {
          filter: {
            old_path: {
              _eq: data.path,
            },
          },
        },
      })
    )
  );

  console.log("this is the image that was found ----> ", image);

  return image.length > 0 ? image[0].id : null;
}

module.exports = {
  importImageModule,
  checkForImage,
};
