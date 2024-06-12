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

const paymentCallback = asyncHandler(async (req, res) => {
    if (req.query.status === 'successful') {
        const transactionDetails = await Transaction.find({ref: req.query.tx_ref});
        const response = await flw.Transaction.verify({id: req.query.transaction_id});
        if (
            response.data.status === "successful"
            && response.data.amount === transactionDetails.amount
            && response.data.currency === "NGN") {
                return res.status(200).json({
                    success: true,
                    message: "Payment was successful"
                })
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment was not successful"
            })
        }
    }
})

module.exports = {
    generatePaymentLink,
    paymentCallback
};
