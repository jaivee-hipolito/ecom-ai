'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiImage, FiX, FiSend, FiUser } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface Review {
  _id?: string;
  userId?: string;
  userName?: string;
  userImage?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  createdAt?: Date;
}

interface ProductReviewsProps {
  productId: string;
  reviews?: Review[];
  numReviews?: number;
}

export default function ProductReviews({ productId, reviews = [], numReviews = 0 }: ProductReviewsProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (images.length + validFiles.length >= 5) {
        alert('You can only upload up to 5 images');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages([...images, ...validFiles]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!comment.trim()) {
      alert('Please enter a review comment');
      return;
    }

    setIsSubmitting(true);
    // Form submission logic would go here
    // For now, just reset the form
    setTimeout(() => {
      setRating(0);
      setTitle('');
      setComment('');
      setImages([]);
      setImagePreviews([]);
      setIsSubmitting(false);
      setShowReviewForm(false);
      alert('Review submitted successfully!');
    }, 1000);
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mt-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8 mb-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-[#ffa509]">Customer Reviews</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#ffa509] text-[#050b2c] text-lg font-bold"
                >
                  {numReviews}
                </motion.span>
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <FiStar
                        className={`w-6 h-6 ${
                          i < Math.round(averageRating)
                            ? 'text-[#ffa509] fill-[#ffa509]'
                            : 'text-gray-400'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
                <span className="text-white/90 text-lg font-semibold">
                  {averageRating.toFixed(1)} out of 5
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-3 bg-[#ffa509] text-[#050b2c] font-bold rounded-xl hover:bg-[#ffb833] transition-colors shadow-lg flex items-center gap-2"
            >
              <FiSend className="w-5 h-5" />
              Write a Review
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-xl border-2 border-[#ffa509]/20 p-6 md:p-8">
              <h3 className="text-2xl font-bold text-[#050b2c] mb-6 flex items-center gap-2">
                <span className="text-[#ffa509]">✍</span>
                Share Your Experience
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[#050b2c] mb-3">
                    Rating <span className="text-[#ffa509]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <FiStar
                          className={`w-10 h-10 transition-all duration-200 ${
                            star <= (hoveredRating || rating)
                              ? 'text-[#ffa509] fill-[#ffa509]'
                              : 'text-gray-300'
                          }`}
                        />
                      </motion.button>
                    ))}
                    {rating > 0 && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3 text-lg font-semibold text-[#050b2c]"
                      >
                        {rating} {rating === 1 ? 'star' : 'stars'}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <Input
                    label="Title"
                    placeholder="Summarize your review"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20"
                    required
                  />
                </div>

                {/* Comment Textarea */}
                <div>
                  <Textarea
                    label="Your Review"
                    placeholder="Tell us about your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 resize-none"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-[#050b2c] mb-3">
                    <FiImage className="inline w-5 h-5 mr-2 text-[#ffa509]" />
                    Images (Optional)
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    You can upload up to 5 images (max 5MB each)
                  </p>
                  <div className="space-y-4">
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group aspect-square rounded-lg overflow-hidden border-2 border-[#ffa509]/30"
                          >
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 100px, 120px"
                              className="object-cover"
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    {images.length < 5 && (
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#ffa509]/50 rounded-xl bg-gradient-to-br from-[#ffa509]/5 to-transparent cursor-pointer hover:border-[#ffa509] hover:bg-[#ffa509]/10 transition-all"
                      >
                        <FiImage className="w-8 h-8 text-[#ffa509] mb-2" />
                        <span className="text-sm font-medium text-[#050b2c]">
                          Click to upload images
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </motion.label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      type="submit"
                      disabled={isSubmitting || rating === 0}
                      className="w-full bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] font-bold py-3 text-lg hover:from-[#ffb833] hover:to-[#ffc966] border-0 shadow-lg"
                      size="lg"
                      isLoading={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </motion.div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowReviewForm(false);
                      setRating(0);
                      setTitle('');
                      setComment('');
                      setImages([]);
                      setImagePreviews([]);
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200"
          >
            <FiStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share your thoughts!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-3 bg-[#ffa509] text-[#050b2c] font-bold rounded-xl hover:bg-[#ffb833] transition-colors shadow-lg"
            >
              Write the First Review
            </motion.button>
          </motion.div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {review.userImage ? (
                    <Image
                      src={review.userImage}
                      alt={review.userName || 'User'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffa509] to-[#ffb833] flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-[#050b2c]" />
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-[#050b2c] text-lg">
                        {review.userName || 'Anonymous User'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-[#ffa509] fill-[#ffa509]'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.createdAt && (
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {review.title && (
                    <h5 className="font-semibold text-[#050b2c] mb-2">{review.title}</h5>
                  )}

                  <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      {review.images.map((img, imgIndex) => (
                        <motion.div
                          key={imgIndex}
                          whileHover={{ scale: 1.05 }}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer"
                        >
                          <Image
                            src={img}
                            alt={`Review image ${imgIndex + 1}`}
                            fill
                            sizes="(max-width: 768px) 100px, 120px"
                            className="object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
