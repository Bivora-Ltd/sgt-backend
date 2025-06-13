const asyncHandler = require("express-async-handler");
const StreetFood = require("../models/streetFood.model");

const newStreetFood = asyncHandler(async(req,res)=>{
    if(!req.file){
        res.status(400);
        throw new Error("Image not found");
    }
    const {name, price, vote_power:votePower} = req.body;
    const imageUrl = req.file.path;
    const newStreetFood = await StreetFood.create({
        name, price, votePower, imageUrl
    });
    if(!newStreetFood){
        res.status(400);
        throw new Error("Error creating adding new streetfood");
    };
    return res.status(201).json({
        success: true,
        message:"Added new Street Food",
        streetFood: newStreetFood
    });
});

const editStreetFood = asyncHandler(async(req,res)=>{
    const {streetfoodId} = req.params;
    const streetFoodObject = {};
    const {name, price, vote_power: votePower} = req.body;
    const streetFood = await StreetFood.findById(streetfoodId);
    if (req.file) {
        streetFoodObject.imageUrl = req.file.path;
    };
    
    if(name){
        streetFoodObject.name = name;
    };

    if(price){
        streetFoodObject.price = price;
    };

    if(votePower){
        streetFoodObject.votePower = votePower;
    };
    if (!streetFood) {
        res.status(404);
        throw new Error("Street Food not Found");
    }
    Object.assign(streetFood,streetFoodObject);
    streetFood.save();
});

const deleteStreetFood = asyncHandler(async(req,res)=>{
    const {streetFoodId} = req.params;
    const streetFood = await StreetFood.findById(streetFoodId);
    if(!streetFood){
        return res.status(404).json({
            success: false,
            message: "StreetFood not found"
        });
    }
    await StreetFood.deleteOne({_id:streetFoodId});
    return res.status(200).json({
        success: true,
        message: "StreetFood deleted"
    });
});

const getAllStreetFoods = asyncHandler(async(req,res)=>{
    const streetFoods = await StreetFood.find();
    return res.status(200).json({
        success: true,
        streetFoods
    });
})

module.exports = {
    newStreetFood,
    editStreetFood,
    getAllStreetFoods,
    deleteStreetFood
}