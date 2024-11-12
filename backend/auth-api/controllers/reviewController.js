const Review = require("../models/review");
const Product = require("../models/Product"); // Assuming a Product model exists
const User = require("../models/user"); // Assuming a User model exists

// Create a Review
exports.createReview = async (req, res) => {
  const { productId, rating, reviewText } = req.body;
  const userId = req.user._id; // Get the logged-in user's ID

  try {
    const newReview = new Review({
      productId,
      userId,
      rating,
      reviewText,
    });

    await newReview.save();

    // Optionally, update the product's review count or average rating here

    res
      .status(201)
      .json({ message: "Review created successfully", review: newReview });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Server error while creating review" });
  }
};

// Get all Reviews for a Product
exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId });

    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ error: "No reviews found for this product" });
    }

    res.status(200).json({ reviews });
    console.log(reviews);
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
    console.log(error);
  }
};

// Get Average Rating for a Product
exports.getProductAverageRating = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ error: "No reviews found for this product" });
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    res.status(200).json({ averageRating });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    res.status(500).json({ error: "Error calculating average rating" });
  }
};
