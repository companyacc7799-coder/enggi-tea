require("dotenv").config();

const fs = require("fs");
const path = require("path");
const supabase = require("./config/db");


// =====================================================
// FIND JSON FILE
// =====================================================

const jsonWithExtension = path.join(
  __dirname,
  "youtube_links",
  "links.json"
);

const jsonWithoutExtension = path.join(
  __dirname,
  "youtube_links",
  "links"
);

let jsonPath;

if (fs.existsSync(jsonWithExtension)) {
  jsonPath = jsonWithExtension;
} else if (fs.existsSync(jsonWithoutExtension)) {
  jsonPath = jsonWithoutExtension;
} else {
  console.error("❌ JSON file not found!");
  console.error("Expected location:");
  console.error("youtube_links/links.json");
  process.exit(1);
}


// =====================================================
// SEED DATABASE
// =====================================================

async function seedDatabase() {
  try {
    console.log("📖 Reading JSON file...");

    const rawData = fs.readFileSync(jsonPath, "utf8");
    const jsonData = JSON.parse(rawData);

    // Your JSON structure:
    // {
    //   "title": "...",
    //   "semesters": [...]
    // }

    if (!jsonData.semesters || !Array.isArray(jsonData.semesters)) {
      throw new Error(
        "JSON structure is incorrect. 'semesters' array not found."
      );
    }

    const resources = [];


    // =================================================
    // LOOP THROUGH SEMESTERS
    // =================================================

    for (const semesterData of jsonData.semesters) {

      const semester = semesterData.semester;
      const courseName = semesterData.course_name;
      const courseCode = semesterData.course_code;

      console.log(
        `\n📚 Semester ${semester}: ${courseName} (${courseCode})`
      );


      // ===============================================
      // LOOP THROUGH UNITS
      // ===============================================

      for (const unit of semesterData.units || []) {

        const unitNumber = unit.unit_number;
        const unitName = unit.unit_name;


        // =============================================
        // INDIVIDUAL VIDEOS
        // =============================================

        for (const topic of unit.individual_videos || []) {

          const topicNumber = topic.topic_number;
          const topicName = topic.topic_name;


          for (const video of topic.videos || []) {

            resources.push({
              title: `${topicName} - Video ${video.video_number}`,

              description:
                `Engineering Mathematics video for ${topicName}`,

              subject: courseName,

              semester: Number(semester),

              unit: `Unit ${unitNumber}`,

              topic: topicName,

              resource_type: "Video",

              youtube_url: video.url,

              file_url: null,

              thumbnail_url: null,

              uploaded_by: null,

              status: "approved"
            });

          }
        }


        // =============================================
        // PLAYLISTS
        // =============================================

        for (const playlist of unit.playlists || []) {

          resources.push({
            title:
              `${unitName} - Playlist ${playlist.playlist_number}`,

            description:
              `YouTube playlist for ${unitName}`,

            subject: courseName,

            semester: Number(semester),

            unit: `Unit ${unitNumber}`,

            topic: unitName,

            resource_type: "Playlist",

            youtube_url: playlist.url,

            file_url: null,

            thumbnail_url: null,

            uploaded_by: null,

            status: "approved"
          });

        }

      }

    }


    // =================================================
    // SHOW TOTAL
    // =================================================

    console.log("\n======================================");
    console.log(`📦 Total resources found: ${resources.length}`);
    console.log("======================================");


    if (resources.length === 0) {

      console.log("⚠️ No resources found in JSON.");

      return;
    }


    // =================================================
    // UPLOAD IN BATCHES
    // =================================================

    const batchSize = 100;

    for (let i = 0; i < resources.length; i += batchSize) {

      const batch = resources.slice(i, i + batchSize);

      console.log(
        `\n⬆️ Uploading ${i + 1} - ${i + batch.length}...`
      );


      const { data, error } = await supabase
        .from("resources")
        .insert(batch)
        .select();


      if (error) {

        console.error("\n❌ Supabase upload failed!");
        console.error(error);

        throw error;
      }


      console.log(
        `✅ Successfully uploaded ${data.length} resources`
      );
    }


    // =================================================
    // COMPLETE
    // =================================================

    console.log("\n======================================");
    console.log("🎉 DATABASE SEEDING COMPLETED!");
    console.log(`✅ Total uploaded: ${resources.length}`);
    console.log("======================================");

  } catch (error) {

    console.error("\n❌ SEEDING FAILED");
    console.error(error.message);

    process.exit(1);
  }
}


// =====================================================
// RUN
// =====================================================

seedDatabase();