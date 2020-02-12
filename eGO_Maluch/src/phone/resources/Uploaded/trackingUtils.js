var TrackingUtils = {
    DEG_TO_RAD: Math.PI / 180,
    trackingPoseEventParametersToMatrix: function(trackingPoseEventParameters) {
        // Those vector names might seem confusing. You just have to remember that here "up" and "forward" are vector
        // basis elements NOT camera directions e.g. when you look down, without any tilt, on Thing Mark, basis is
        // identity.

        var forwardVector = new Vector4().Set3(trackingPoseEventParameters.up[0], trackingPoseEventParameters.up[1],
            trackingPoseEventParameters.up[2]);

        var upVector = new Vector4().Set3(-trackingPoseEventParameters.gaze[0], -trackingPoseEventParameters.gaze[1],
            -trackingPoseEventParameters.gaze[2]);

        var rightVector = forwardVector.CrossP(upVector);

        var trackingPoseMatrix = new Matrix4().Set3V(rightVector, forwardVector, upVector);
        trackingPoseMatrix = trackingPoseMatrix.Translate(trackingPoseEventParameters.position[0],
            trackingPoseEventParameters.position[1], trackingPoseEventParameters.position[2]);
        return trackingPoseMatrix;
    },
    /**
        @see convertTrackingPoseEventParametersAndObjectTransformToObjectTMLAttributes
    */
    computeObjectOrientationCorrectionMatrix: function(objectOriginX, objectOriginY, objectOriginZ,
        objectRX, objectRY, objectRZ) {
        // Transform is:
        // objectTransform = changeObjectOriginTranslation * objectRotation
        // changeObjectOriginTranslation = translate(-objectOriginX, -objectOriginY, -objectOriginZ)
        var result = new Matrix4().Translate(-objectOriginX, -objectOriginY, -objectOriginZ);

        result = result.
            Rotate([1, 0, 0], objectRX * TrackingUtils.DEG_TO_RAD).
            Rotate([0, 1, 0], objectRY * TrackingUtils.DEG_TO_RAD).
            Rotate([0, 0, 1], objectRZ * TrackingUtils.DEG_TO_RAD);

        return result;
    },
    /**
        @see convertTrackingPoseEventParametersAndObjectTransformToObjectTMLAttributes
    */
    convertTrackingPoseMatrixToObjectOrientation: function(trackingPoseMatrix,
        objectOriginX, objectOriginY, objectOriginZ, objectRX, objectRY, objectRZ) {
        // Sometimes we want to adjust object orientation by changing its origin and rotation. This transformation
        // has to be applied before trackingPoseMatrix because it is not part of "camera" transform and hence it
        // should be applied in "normal" order. You may have to read native code and comments to understand this part
        // fully.

        var objectOrientationCorrectionMatrix =
            TrackingUtils.computeObjectOrientationCorrectionMatrix(objectOriginX, objectOriginY, objectOriginZ,
                objectRX, objectRY, objectRZ);

        var result = objectOrientationCorrectionMatrix.Multiply(trackingPoseMatrix.m);
        return result;
    },
    /**
        @see convertTrackingPoseEventParametersAndObjectTransformToObjectTMLAttributes
    */
    convertTrackingPoseEventParametersToObjectTMLAttributes: function(trackingPoseEventParameters,
        objectOriginX, objectOriginY, objectOriginZ, objectRX, objectRY, objectRZ) {
        var trackingPoseMatrix = TrackingUtils.trackingPoseEventParametersToMatrix(trackingPoseEventParameters);

        var resultMatrix = TrackingUtils.convertTrackingPoseMatrixToObjectOrientation(trackingPoseMatrix,
            objectOriginX, objectOriginY, objectOriginZ, objectRX, objectRY, objectRZ);

        var resultEuler = resultMatrix.ToEuler();

        var result = {
            x: resultMatrix.m[3][0],
            y: resultMatrix.m[3][1],
            z: resultMatrix.m[3][2],
            rx: resultEuler.attitude,
            ry: resultEuler.heading,
            rz: resultEuler.bank
        };
        return result;
    },
    /**
        @param objectTransform Dictionary, might be empty. Supported keys are ox (origin x), oy, oz, rx (rotation
        in degrees around x axis), ry, rz. Usually you will want this to be identity but in some cases you might
        need to adjust object orientation e.g. You have model that is offset on axis X by 20cm and you want to make
        it rotate with tracking pose changes as if origin was at that 20cm offset. To do that you would pass
        objectTransform = { ox: 0.2 }
    */
    convertTrackingPoseEventParametersAndObjectTransformToObjectTMLAttributes: function(trackingPoseEventParameters,
        objectTransform) {
        var handleNaN = function(value) {
            if (value === null) {
                return 0;
            }
            if (Number.isNaN(value)) {
                return 0;
            }
            return value;
        };

        var objectOriginX = handleNaN(objectTransform.ox);
        var objectOriginY = handleNaN(objectTransform.oy);
        var objectOriginZ = handleNaN(objectTransform.oz);
        var objectRX = handleNaN(objectTransform.rx);
        var objectRY = handleNaN(objectTransform.ry);
        var objectRZ = handleNaN(objectTransform.rz);

        return TrackingUtils.convertTrackingPoseEventParametersToObjectTMLAttributes(trackingPoseEventParameters,
            objectOriginX, objectOriginY, objectOriginZ, objectRX, objectRY, objectRZ);
    }
};
