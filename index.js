const core = require('@actions/core');
const axios = require('axios');
const { dbDetailsFactory } = require('@metis-data/db-details');
const parse = require('pg-connection-string').parse;


const getDbdetails = async (dbConnection, metisApikey, metisExporterUrl, foreignTableName) => {
  const dbDetails = dbDetailsFactory('postgres');

  const db = dbDetails.getExtendedDbDetailsData(dbConnection, {
    getAllExtraData: true,
    slowQueryLogForeignTable: {
      metisApikey: metisApikey,
      metisExporterUrl: metisExporterUrl,
      foreignTableName: foreignTableName,
    },
  });

  return await db;
};

const axiosPost = async (url, body, headers) => {
  try {
    const res = await axios.post(url, body, { headers: headers });
    return res;
  } catch (error) {
    console.log(error);
  }
};

async function main() {
  try {
    /*
      Parse connection string to object
    */
    let config = parse(core.getInput('db_connection_string'));

    /*
      Set actions vars from action input args
    */
    const metisApikey = core.getInput('metis_api_key');
    const metisExporterUrl = core.getInput('metis_exporter_url');
    const foreignTableName = core.getInput('foreign_table_name');
    const dbConnection = {
      database: config.database,
      user: config.user,
      password: config.password,
      host: config.host,
      // ssl: config?.ssl || { rejectUnauthorized: false },
    };

    /*
      Collect Slow query log data.
    */
    const dbDetailsExtraData = await getDbdetails(dbConnection, metisApikey, metisExporterUrl, foreignTableName);
 
   
  } catch (error) {
    console.error(error);
    core.setFailed(error);
  }
}

main();
