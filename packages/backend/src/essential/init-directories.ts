import { INSTAGRAM_DATA_PATH } from '../domain/data/constants';
import { TEMP_UPLOAD_PATH } from '../domain/data/constants';
import fs from 'fs';

// Create necessary directories
[TEMP_UPLOAD_PATH, INSTAGRAM_DATA_PATH].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
});
