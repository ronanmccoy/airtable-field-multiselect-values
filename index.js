require('dotenv').config({path: './.env'});
const axios = require('axios').default;
const fs = require('fs');

const getMetadata = async (apiUrl, baseId) => {
  const req = apiUrl + 'meta/bases/' + baseId + '/tables';

  return await axios.get(req, {
    headers: {'Authorization': 'Bearer ' + process.env.AIRTABLE_API_KEY}
  }).catch((error) => {
    throw new Error(error);
  });
};

const main = async () => {
  console.log('Starting...');

  const airtableApi = process.env.AIRTABLE_API_URL + '/' + process.env.AIRTABLE_API_VERSION + '/';

  let data = await getMetadata(airtableApi, process.env.AIRTABLE_BASE_ID);
  let tables = data.data.tables;
  let languages = [];

  for(const table of tables) {
    console.log(table.name);
    if(table.name === process.env.AIRTABLE_BASE_TABLE_NAME) {
      let fields = table.fields;

      for(const field of fields) {
        if(field.name === 'Native Speaker' 
          || field.name === 'Business Fluent' 
            || field.name === 'Language Learner'
        ) {
          let options = field.options.choices;

          for(const option of options) {
            let optionValue = option.name;

            if(optionValue !== '' && languages.indexOf(optionValue) === -1) {
              languages.push(optionValue);
            }
          }
        }
      }
      break;
    }
  }

  if(languages.length > 0) {
    languages.sort();

    try {
      fs.writeFileSync('./languages.txt', languages.join('\n'));
    } catch (error) {
      throw new Error(error);
    }
  }

  console.log(languages);
};

main().catch((reason) => {
  console.error(reason);
  console.error('Exiting...');
  process.exit(1);
});
