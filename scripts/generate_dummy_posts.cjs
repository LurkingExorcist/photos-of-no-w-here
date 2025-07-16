#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const POSTS_JSON_PATH =
    '/app/packages/backend/instagram_data/your_instagram_activity/media/posts_1.json';
const DUMMY_POSTS_TS_PATH = 'packages/backend/mock/data/dummyPosts.ts';
const DUMMY_POSTS_MEDIA_DIR = 'packages/backend/mock/data/dummy_posts';
const CONTAINER_NAME = 'photos-of-no-w-here_backend_1';

/**
 * Copy a file from docker container to local filesystem
 * @param {string} src Source path in container
 * @param {string} dest Destination path on local filesystem
 */
function copyFromDocker(src, dest) {
    execSync(`sudo docker cp "${CONTAINER_NAME}:${src}" "${dest}"`);
}

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath Directory path to ensure
 */
async function ensureDirectory(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Process and select random posts
 * @param {Array<Object>} posts Array of posts from JSON
 * @param {number} numPosts Number of posts to select
 * @returns {Array<Object>} Processed posts matching TypeScript type
 */
function processPosts(posts, numPosts = 10) {
    // Sort posts by HSL values of the first media item
    const selectedPosts = posts
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numPosts, posts.length))
        .sort((a, b) => {
            const aHsl = Number(
                a.media[0].average_color_hsl
                    .map((c) =>
                        Math.floor(c * 256)
                            .toString()
                            .padStart(3, '0')
                    )
                    .join('')
            );
            const bHsl = Number(
                b.media[0].average_color_hsl
                    .map((c) =>
                        Math.floor(c * 256)
                            .toString()
                            .padStart(3, '0')
                    )
                    .join('')
            );

            return aHsl - bHsl;
        });

    return selectedPosts;
}

/**
 * Generate TypeScript file with dummy posts
 * @param {Array<Object>} posts Processed posts
 * @param {string} outputPath Output file path
 */
async function generateTypescriptFile(posts, outputPath) {
    const tsContent = `/* eslint-disable prettier/prettier */
import type { Post } from '@/domain/data/data.types';

export const getDummyPosts = (): Post[] => {
    return ${JSON.stringify(posts, null, 4)};
};
`;

    await fs.writeFile(outputPath, tsContent);
}

/**
 * Copy media files from posts to output directory
 * @param {Array<Object>} posts Processed posts
 * @param {string} outputDir Output directory path
 */
async function copyMediaFiles(posts, outputDir) {
    // Remove existing directory if it exists
    try {
        await fs.rm(outputDir, { recursive: true, force: true });
    } catch {
        console.log('No existing directory to remove');
    }

    await ensureDirectory(outputDir);

    for (const post of posts) {
        for (const media of post.media) {
            const srcPath = media.uri;
            if (srcPath.startsWith('/app/packages/backend/')) {
                const filename = path.basename(srcPath);
                const destPath = path.join(outputDir, filename);
                copyFromDocker(srcPath, destPath);
            }
        }
    }
}

async function main() {
    try {
        // Read posts from docker container
        console.log('Reading posts from container...');
        copyFromDocker(POSTS_JSON_PATH, '/tmp/posts.json');

        const postsData = await fs.readFile('/tmp/posts.json', 'utf8');
        const posts = JSON.parse(postsData);

        // Process posts
        console.log('Processing posts...');
        const processedPosts = processPosts(posts);

        // Generate TypeScript file
        console.log('Generating TypeScript file...');
        await generateTypescriptFile(processedPosts, DUMMY_POSTS_TS_PATH);

        // Copy media files
        console.log('Copying media files...');
        await copyMediaFiles(processedPosts, DUMMY_POSTS_MEDIA_DIR);

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
