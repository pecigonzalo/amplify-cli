const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const moment = require('moment');
const opn = require('opn');
const chalk = require('chalk');

const configurables = {
    Website: './helpers/configure-Website',
    CORS: './helpers/configure-Cors',
    CloudFront: './helpers/configure-CloudFront',
}

async function init(context){
    const { projectConfig } = context.exeInfo;
    const timeStamp = `-${moment().format('YYYYMMDDHHmmss')}-`;
    let bucketName = projectConfig.projectName + timeStamp + '-hostingbucket';
    bucketName = bucketName.replace(/[^-a-z0-9]/g, '');

    const questions = [{
        name: 'HostingBucketName',
        type: 'input',
        message: 'hosting bucket name',
        default: bucketName,
    }]

    const answers = await inquirer.prompt(questions); 

    context.exeInfo.template.Resources.S3Bucket.Properties.BucketName = answers.HostingBucketName; 
}

async function configure(context){
    let options = Object.keys(configurables); 
    const done = "I'm done."; 
    options.push(done); 

    const answer = await inquirer.prompt({
        type: 'list',
        name: 'section',
        message: 'Please select the section to configure',
        choices: options,
        default: options[0],
    });

    if(answer.section !== done){
        const configureModule = require(configurables[answer.section]); 
        await configureModule.configure(context); 
        return configure(context); 
    }else{
        return context; 
    }
}

module.exports = {
    init,
    configure
}