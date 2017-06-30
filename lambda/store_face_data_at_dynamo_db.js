let AWS = require('aws-sdk');
let DynamoDB = new AWS.DynamoDB();

function createDynamoItem(faceData) {
    let dynamoItem = {};
    dynamoItem[faceData.type] = {
        "M": {
            distance: {
                "N": faceData.distance
            },
            inclination: {
                "N": faceData.inclination
            }
        }
    };

    return dynamoItem;
}

exports.handler = (event, context, callback) => {
    let faceData = event.faceData.reduce((previous, current ) => {
        return Object.assign({}, createDynamoItem(previous), createDynamoItem(current));
    });

    let param = {
        TableName: 'face_base',
        Item: {
            file_name: {
                S: event.fileName
            },
            face_data: faceData
        }
    };

    console.log(JSON.stringify(param));

    DynamoDB.putItem(param, function(err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, data);
        }
    });
};
