'use strict';
let AWS = require('aws-sdk');
let Rekognition = new AWS.Rekognition();

exports.handler = (event, context, callback) => {
    let {s3} = event.Records[0];
    let fileName = s3.object.key;

    let params = {
        Attributes: ['ALL'],
        Image: {
            S3Object: {
                Bucket: s3.bucket.name,
                Name: fileName
            }
        }
    };

    Rekognition.detectFaces(params, (err, data) => {
        if (err) {
            console.log(err);
            callback(err, data);
        }

        console.log(JSON.stringify(data));

        let landmarks = data.FaceDetails[0].Landmarks;
        let nose = landmarks.find((data) => data.Type === "nose");

        let faceData = landmarks.map((landmark) => {
            if (landmark.Type === "nose") {
                return;
            }

            console.log(`type: ${landmark.Type} | ${JSON.stringify(landmark)}`);

            let distance = calculateDistance(nose, landmark);
            let inclination = calculateInclination(nose, landmark);

            return {
                type: landmark.Type,
                distance,
                inclination
            };
        });

        callback(null, {
            fileName,
            faceData
        });
    });
};


function calculateDistance(from, to) {
    let fromX = Number(from.X);
    let fromY = Number(from.Y);
    let toX = Number(to.X);
    let toY = Number(to.Y);

    return Math.sqrt(Math.pow(fromX - toX, 2) + Math.pow(fromY - toY, 2));
}

function calculateInclination(from, to) {
    let fromX = Number(from.X);
    let fromY = Number(from.Y);
    let toX = Number(to.X);
    let toY = Number(to.Y);

    return (fromY - toY) / (fromX - toX);
}


