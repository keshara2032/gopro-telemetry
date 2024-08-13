const gpmfExtract = require('gpmf-extract');
const goproTelemetry = require('gopro-telemetry');
const fs = require('fs');
const path = require('path');

const fsPromises = fs.promises;

const rootDir = '/standard/UVA-DSA/NIST EMS Project Data/CognitiveEMS_Datasets/North_Garden/May_2024/May_data_north_garden/gopro';

async function findMP4Files(dir) {
    let fileList = [];

    try {
        const files = await fsPromises.readdir(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fsPromises.stat(filePath);

            if (stats.isDirectory()) {
                // Recursively search in subdirectories
                const subDirFiles = await findMP4Files(filePath);
                fileList = fileList.concat(subDirFiles);
            } else if (
                stats.isFile() &&
                path.extname(file).toLowerCase() === '.mp4' &&
                !file.toLowerCase().includes('clipped')
            ) {
                console.log(`Found MP4 file: ${filePath}`);
                fileList.push(filePath);
            }
        }
    } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
    }

    return fileList;
}

async function processFiles() {
    const fileList = await findMP4Files(rootDir);

    if (fileList.length === 0) {
        console.log('No MP4 files found to process.');
        return;
    }

    // Ensure the output directory exists
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        console.log(`Created output directory at ${outputDir}`);
    }

    for (const file of fileList) {
        const fileName = path.basename(file, path.extname(file));
        console.log(`Extracting telemetry from ${fileName}...`);

        const outPath = path.join(outputDir, `${fileName}.json`);

        try {
            media = fs.readFileSync(file);
            const extracted = await gpmfExtract(media);
            await goproTelemetry(
                extracted,
                {
                    stream: ['ACCL'],
                    preset: 'csv',
                    groupTimes: 'frames',
                },
                (telemetry) => {
                    fs.writeFileSync(outPath, JSON.stringify(telemetry));
                    console.log(`Telemetry saved as JSON at ${outPath}`);
                }
            );
        } catch (error) {
            console.error(`Error processing file ${file}:`, error);
        }
    }
}

// Start the processing
processFiles();
