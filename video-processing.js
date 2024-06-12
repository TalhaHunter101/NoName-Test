const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const watermarkImage = "rename-logo.jpg"; // assume this is the watermark image file

// Check if required dependencies are installed
if (!fs.existsSync(watermarkImage)) {
  console.error(`Error: Watermark image file '${watermarkImage}' not found.`);
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
  console.error(
    "Usage: node script.js <input_file> <start_timestamp> <end_timestamp>"
  );
  process.exit(1);
}

const inputFile = args[0];
const startTimestamp = parseInt(args[1], 10);
const endTimestamp = parseInt(args[2], 10);

if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
  console.error("Error: Invalid timestamp format. Please use seconds.");
  process.exit(1);
}

if (startTimestamp >= endTimestamp) {
  console.error("Error: Start timestamp must be less than end timestamp.");
  process.exit(1);
}

// Check if input file exists and is a valid MP4 file
if (!fs.existsSync(inputFile) || !inputFile.endsWith(".mp4")) {
  console.error(
    `Error: Input file '${inputFile}' not found or not a valid MP4 file.`
  );
  process.exit(1);
}

// Set up ffmpeg command
const ffmpegCommand = ffmpeg()
  .input(inputFile)
  .seek(startTimestamp)
  .duration(endTimestamp - startTimestamp)
  .input(watermarkImage) // Add watermark image as input
  .complexFilter([
    {
      filter: "overlay",
      options: {
        x: "w-w/2",
        y: "h-h/2",
      },
    },
  ])
  .outputOptions([
    "-r",
    "10", 
    "-f",
    "gif", // output format
  ])
  .on("end", () => {
    console.log("GIF generation complete!");
  })
  .on("error", (err) => {
    console.error(`Error: ${err.message}`);
  });

// Set output file name and run ffmpeg command
const outputFile = `output_${path.basename(inputFile, ".mp4")}.gif`;
ffmpegCommand.output(outputFile);
ffmpegCommand.run();

console.log(`Output file saved as ${outputFile}`);
