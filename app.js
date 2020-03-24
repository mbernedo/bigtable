const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const Bigtable = require("@google-cloud/bigtable");
const projectId = "kambista";
const keyFilename = "./credentials/kambista-8cdefedb7a0e.json";
const options = {
  projectId,
  keyFilename
};
const bigtable = new Bigtable(options);
const INSTANCE_ID = "pakipe";
const TABLE_ID = "prueba2";
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello World"));

app.post("/users/register", async (req, res) => {
  const {
    phoneNumber,
    identityDocumentType,
    identityDocumentNumber,
    alias,
    deviceId
  } = req.body;
  const data = {
    phoneNumber,
    identityDocumentType,
    identityDocumentNumber,
    alias,
    deviceId
  };
  res.send();
});

async function createTable() {
  const instance = bigtable.instance(INSTANCE_ID);
  const table = instance.table(TABLE_ID);
  const [tableExists] = await table.exists();
  if (!tableExists) {
    console.log(`Table does not exist. Creating table ${TABLE_ID}`);
    console.log(`Creating table ${TABLE_ID}`);
    const options = {
      families: [
        {
          name: "nombre"
        }
      ]
    };
    await table.create(options);
  } else {
    console.log(`Table exists.`);
  }
}

// https://cloud.google.com/bigtable/docs/schema-design

async function insert() {
  const instance = bigtable.instance(INSTANCE_ID);
  const table = instance.table(TABLE_ID);
  const greetings = ["Hello World!", "Hello Bigtable!", "Hello Node!"];
  const rowsToInsert = greetings.map((greeting, index) => ({
    key: `greeting${index}`,
    data: {
      nombre: {
        value: {
          timestamp: new Date(),
          value: greeting
        }
      }
    }
  }));
  console.log("Insertando");
  await table.insert(rowsToInsert);
  console.log("insertó");
}

const getRowGreeting = row => {
  return row.data[nombre][value][0].value;
};

async function select() {
  const instance = bigtable.instance(INSTANCE_ID);
  const table = instance.table(TABLE_ID);
  console.log("Reading the entire table");
  // Note: For improved performance in production applications, call
  // `Table#readStream` to get a stream of rows. See the API documentation:
  // https://cloud.google.com/nodejs/docs/reference/bigtable/latest/Table#createReadStream
  const [allRows] = await table.getRows({});
  for (const row of allRows) {
    console.log(`\tRead: ${getRowGreeting(row)}`);
  }
}

select();

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server running on port ${port}`));
