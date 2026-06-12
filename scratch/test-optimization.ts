import fs from "fs/promises";
import path from "path";
import { optimizeUploadImage } from "../src/lib/images/optimize-upload-image";

async function runTests() {
    console.log("=== Running Image Optimization Tests ===");

    // Test Case A/B: PNG Upload (Logo.png is ~3.7MB)
    const logoPath = path.join(__dirname, "../public/Logo.png");
    try {
        const logoBuffer = await fs.readFile(logoPath);
        console.log(`Original Logo size: ${(logoBuffer.length / 1024 / 1024).toFixed(2)} MB`);

        const result = await optimizeUploadImage(logoBuffer, "Logo mit Sonderzeichen & Leerzeichen!.png", "image/png");
        console.log("\n--- PNG Optimization Result ---");
        console.log("Was Optimized:", result.wasOptimized);
        console.log("New Filename:", result.filename);
        console.log("New MIME Type:", result.mimeType);
        console.log(`Optimized Size: ${(result.size / 1024).toFixed(1)} KB`);
        console.log(`Savings: ${((logoBuffer.length - result.size) / logoBuffer.length * 100).toFixed(1)}%`);

        // Write the optimized image to public so we can check it
        const outputPath = path.join(__dirname, "../public/Logo_optimized.webp");
        await fs.writeFile(outputPath, result.buffer);
        console.log(`Saved optimized image to: ${outputPath}`);

        // Test file normalization
        if (result.filename !== "logo_mit_sonderzeichen_leerzeichen.webp") {
            console.error("FAIL: Filename normalization failed! Expected: logo_mit_sonderzeichen_leerzeichen.webp, Got:", result.filename);
        } else {
            console.log("PASS: Filename normalization works.");
        }
    } catch (e) {
        console.error("Error loading/testing Logo.png:", e);
    }

    // Test Case E: Video Upload
    console.log("\n--- Testing Video Bypass ---");
    const videoBuffer = Buffer.from("dummy video content");
    const videoResult = await optimizeUploadImage(videoBuffer, "test-video.mp4", "video/mp4");
    console.log("Was Optimized:", videoResult.wasOptimized);
    console.log("Filename:", videoResult.filename);
    console.log("MIME Type:", videoResult.mimeType);
    if (!videoResult.wasOptimized && videoResult.filename === "test-video.mp4" && videoResult.mimeType === "video/mp4") {
        console.log("PASS: Video bypass works correctly.");
    } else {
        console.error("FAIL: Video was modified or optimization flags are wrong!");
    }
}

runTests().catch(console.error);
