const gpmfExtract = require('gpmf-extract');
const goproTelemetry = require(`gopro-telemetry`);
const fs = require('fs');

const filePath = '/home/kesharaw/Downloads/GX010305.MP4';
const file = fs.readFileSync(filePath);

var fileName = filePath.split('/').pop();
// remove MP4 extension
fileName = fileName.split('.').shift();
console.log(`Extracting telemetry from ${fileName}...`);

const outPath = `./output/${fileName}.json`;
// make sure the output directory exists
if (!fs.existsSync('./output')) {
  fs.mkdirSync('./output');
}
gpmfExtract(file)
  .then(extracted => {
    goproTelemetry(extracted, {
        stream:['ACCL'],
        preset:'csv',
        groupTimes:"frames"
    }, telemetry => {
      fs.writeFileSync(outPath, JSON.stringify(telemetry));
      console.log('Telemetry saved as JSON');
    });
  })
  .catch(error => console.error(error));