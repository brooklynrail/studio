const fs = require('fs');
require('dotenv').config();
const { withToken, readItems} = require('@directus/sdk');

const BASE_ACCESS_TOKEN = process.env.TOKEN_LOCAL;

async function sectionsModule(old_section_id, client) {
  try {

    const existingSections = [];
    // Function to check if a section with a given ID exists in Directus
    const checkSectionExists = async (old_section_id, client) => {
      const section = await client.request(
        withToken(BASE_ACCESS_TOKEN, readItems('Sections', {
          "filter": {
            "old_id": {
              "_eq": old_section_id
            }
          }
        }))
      );
      return section.length > 0 ? section[0].id : null;
    };

    const existingSectionId = await checkSectionExists(old_section_id, client);
    if (existingSectionId) {
      existingSections.push({ Sections_id: existingSectionId });
    } 

    return existingSections;

  } catch (error){
    console.error('Error fetching section:', error.message);
    // Handle the error and write specific data to a text file
    const failedData = `${old_section_id}\n`;
    const filePath = `errors-sections.txt`;

    // Write the error data to the text file
    fs.writeFileSync(filePath, failedData, 'utf-8');
  }
}

module.exports = {
  sectionsModule,
};
