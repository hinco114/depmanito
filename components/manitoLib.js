const debug = require('debug')('dev');
const AWS = require('aws-sdk');
const { S3 } = require('../configs/config');
AWS.config.region = S3.region;
AWS.config.update({ accessKeyId: S3.accessKeyId, secretAccessKey: S3.secretAccessKey });
const s3 = new AWS.S3({ params: { Bucket: S3.bucketName } });
const admin = require('firebase-admin');

/**
 *  Check body has all properties in propertyArray
 *  If body doesn't have property, throw 400 Error with 'Body property Exception' message.
 */
const checkProperty = (body, propertyArray) => {
  propertyArray.forEach((property) => {
    if (body[property] === undefined) {
      const err = new Error('Body property Exception');
      err.status = 400;
      debug('Body property Exception');
      throw err;
    }
  });
};

/**
 *  Using {keyName} upload to s3 and delete file.
 */
const uploadToS3 = (fileToUpload, keyName) => new Promise((resolve, reject) => {
  try {
    debug('upload to s3 started');
    const key = keyName;
    debug(`keyName : ${key}`);

    // set params
    const params = {
      Bucket: S3.bucketName,
      ACL: 'public-read',
      // path to save
      Key: key,
      // received file's data
      Body: fileToUpload,
    };
    // start upload
    s3.upload(params, (err, data) => {
      if (err) {
        debug('s3 upload Error');
        reject(err);
      } else {
        debug('upload to s3 complete');
        resolve(data);
      }
    });
  } catch (err) {
    debug('unexpected error : uploadToS3');
    throw err;
  }
});

const deleteFromS3 = keyName => new Promise((resolve, reject) => {
  try {
    debug('start deleting file of s3');
    const key = keyName;
    const params = {
      Bucket: S3.bucketName,
      Key: key,
    };
    s3.deleteObject(params, (err, data) => {
      if (err) {
        debug('s3 delete Error');
        reject(err);
      } else {
        debug('delete from s3 complete');
        resolve(data);
      }
    });
  } catch (err) {
    throw err;
  }
});

const sendPush = async (pushToken, title, body) => {
  try {
    const msgObj = {
      notification: {
        title,
        body,
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      android: {
        notification: {
          sound: 'default',
        },
      },
      token: pushToken,
    };
    admin.messaging().send(msgObj).catch((err) => {
      console.log(`푸시미발송 : ${err.message}`);
    });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  checkProperty, uploadToS3, deleteFromS3, sendPush,
};
