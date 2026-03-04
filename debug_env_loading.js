const fs = require('fs');
const path = require('path');
const { merge } = require('lodash');

const projectRoot = 'c:/Users/Admin/Documents/Automation_projects/TestAIgnite';
const cypressConfigDir = path.join(projectRoot, 'cypress', 'config');

console.log('--- Debugging Environment Loading ---');

// 1. Load auth-demo.env.json
const envName = 'auth-demo';
const envPath = path.join(cypressConfigDir, `${envName}.env.json`);
let fileConfig = {};
try {
    fileConfig = JSON.parse(fs.readFileSync(envPath, 'utf-8'));
    console.log(`[PASS] Loaded ${envName}.env.json`);
} catch (e) {
    console.error(`[FAIL] Error loading ${envName}.env.json:`, e.message);
}

// 2. Load secrets.env.json
const secretsPath = path.join(cypressConfigDir, 'secrets.env.json');
let secretsConfig = {};
try {
    if (fs.existsSync(secretsPath)) {
        const content = fs.readFileSync(secretsPath, 'utf-8');
        console.log(`[INFO] secrets.env.json content length: ${content.length}`);
        secretsConfig = JSON.parse(content);
        console.log(`[PASS] Loaded secrets.env.json. Keys:`, Object.keys(secretsConfig));
        if (secretsConfig.auth) {
            console.log(`[INFO] secrets.auth found:`, secretsConfig.auth);
        } else {
            console.error(`[FAIL] secrets.auth is MISSING in secrets.env.json!`);
        }
    } else {
        console.warn(`[WARN] secrets.env.json NOT FOUND`);
    }
} catch (e) {
    console.error(`[FAIL] Error parsing secrets.env.json:`, e.message);
}

// 3. Merge
const configEnv = { environment: 'auth-demo' }; // Simulate CLI args
const mergedEnv = merge({}, fileConfig, secretsConfig, configEnv);

console.log('--- Merged Environment Config ---');
console.log('mergedEnv.auth:', mergedEnv.auth);
console.log('mergedEnv.testUsers:', mergedEnv.testUsers ? 'Found' : 'Missing');

if (!mergedEnv.auth) {
    console.error('[FAIL] mergedEnv.auth is undefined! This explains the error.');
} else {
    console.log('[PASS] mergedEnv.auth is correctly populated.');
}
