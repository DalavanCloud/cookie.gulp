//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const fs = require("fs");
const path = require("path");

const log = require("./log");
const utils = require("./utilities");

/** @type {string} */
const buildInfosJsonPath = "./buildinfos.json";

/** @type {string} */
const packageJsonPath = "./package.json";

/**
 * Load buildinfos.json.
 * @returns {IBuildInfos}
 */
function loadBuildInfosJson() {
    if (!fs.existsSync(buildInfosJsonPath)) {
        return Object.create(null);
    }

    return JSON.parse(fs.readFileSync(buildInfosJsonPath, "utf8"));
}

/**
 * Load package.json.
 * @returns {IPackageConfig}
 */
function loadPackageJson() {
    if (!fs.existsSync(packageJsonPath)) {
        return Object.create(null);
    }

    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

/**
 * Generate runtime buildinfos.
 * @returns {IBuildInfos}
 */
function generateBuildInfos() {
    /** @type {IBuildInfos} */
    const buildInfos = JSON.parse(JSON.stringify(exports.buildInfosJson));

    log.info("Config", "BuildInfos", "Generating runtime buildinfos ...");

    buildInfos.productName = buildInfos.productName || exports.packageJson.name;
    buildInfos.executableName = buildInfos.executableName || exports.packageJson.name;
    buildInfos.description = buildInfos.description || exports.packageJson.description;
    buildInfos.copyright = buildInfos.copyright || `Copyright (c) ${new Date().getFullYear()} ${exports.packageJson.author}.`;
    buildInfos.ignores = buildInfos.ignores || [];

    /**
     * buildNumber
     */
    if (!buildInfos.buildNumber) {
        log.info("Config", "BuildInfos", "evn:BUILD_BUILDNUMBER", "=", process.env["BUILD_BUILDNUMBER"]);
        log.info("Config", "BuildInfos", "package.json:version", "=", exports.packageJson.version);

        buildInfos.buildNumber = process.env["BUILD_BUILDNUMBER"] || exports.packageJson.version;

        log.info("Config", "BuildInfos", "buildInfos:buildNumber", "=", buildInfos.buildNumber);
    }

    /**
     * paths
     */
    if (!buildInfos.paths) {
        buildInfos.paths = Object.create(null);
    }

    // buildDir
    if (utils.isNullOrUndefined(buildInfos.paths.buildDir)) {
        buildInfos.paths.buildDir = "./build/out";
    }

    // publishDir
    if (utils.isNullOrUndefined(buildInfos.paths.publishDir)) {
        buildInfos.paths.publishDir = "./publish";
    }

    // intermediateDir
    if (utils.isNullOrUndefined(buildInfos.paths.intermediateDir)) {
        buildInfos.paths.intermediateDir = "./build/tmp";
    }

    for (const pathName in buildInfos.paths) {
        buildInfos.paths[pathName] = path.resolve(buildInfos.paths[pathName]);
    }

    /**
     * configs
     */
    buildInfos.configs = buildInfos.configs || Object.create(null);
    buildInfos.configs.tasks = buildInfos.configs.tasks || Object.create(null);
    buildInfos.configs.processors = buildInfos.configs.processors || Object.create(null);

    /**
     * targets
     */
    if (!buildInfos.targets) {
        buildInfos.targets = [];
    }

    /**
     * tasks
     */
    if (!buildInfos.tasks) {
        buildInfos.tasks = Object.create(null);
    }

    log.info("Config", "BuildInfos", "Runtime buildinfos is generated.");

    return buildInfos;
}

/** @type {IPackageConfig} */
exports.packageJson = loadPackageJson();

/** @type {IBuildInfos} */
exports.buildInfosJson = loadBuildInfosJson();

/** @type {IBuildInfos} */
exports.buildInfos = generateBuildInfos();
