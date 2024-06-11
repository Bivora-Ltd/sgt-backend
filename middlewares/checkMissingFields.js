function checkForMissingFields(data,requiredFields) {
    return (req, res, next) => {
        const bodyKeys = Object.keys(data);
        const missingFields = requiredFields.filter(field => !bodyKeys.includes(field));

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing fields: ${missingFields.join(', ')}`
            });
        }

        next();
    };
}

module.exports = checkForMissingFields;
