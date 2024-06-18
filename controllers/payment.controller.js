const {v4: uuidv4} = require("uuid");
const asyncHandler = require("express-async-handler");

const generatePaymentLink = asyncHandler(async (req, res) => {
    const tx_ref = uuidv4();
    const {amount,redirect_url,email,name} = req.body;
    try {
        const response = await fetch("https://api.flutterwave.com/v3/payments", {
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json" 
            },
            method: "POST",

            body: JSON.stringify({
                tx_ref,
                amount,
                currency: "NGN",
                redirect_url,
                customizations: {
                    title: "Street Got Talent",
                    logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
                },
                customer:{
                    email,
                    name
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        data.success = true;
        res.status(200).json({
           data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            message: "An error occurred while generating the payment link",
            error: err.message
        });
    }
});

module.exports = {
    generatePaymentLink
};
