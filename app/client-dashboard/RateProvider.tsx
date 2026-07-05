"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  jobId: string;
  providerId: string;
  providerName: string;
  onRated: () => void;
};

export default function RateProvider({ jobId, providerId, providerName, onRated }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitRating = async () => {
    if (rating === 0) return;
    setSubmitting(true);

    try {
      // Save rating to job request
      await supabase
        .from("job_requests")
        .update({ rating, review, rated: true })
        .eq("id", jobId);

      // Get provider's current rating data
      const { data: providerData } = await supabase
        .from("providers")
        .select("rating")
        .eq("clerk_id", providerId)
        .single();

      // Get all ratings for this provider
      const { data: allRatings } = await supabase
        .from("job_requests")
        .select("rating")
        .eq("assigned_to", providerId)
        .eq("rated", true);

      if (allRatings && allRatings.length > 0) {
        const avgRating = allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length;

        // Update provider's average rating
        await supabase
          .from("providers")
          .update({ rating: Math.round(avgRating * 10) / 10 })
          .eq("clerk_id", providerId);

        // Update users table too
        await supabase
          .from("users")
          .update({
            average_rating: Math.round(avgRating * 10) / 10,
            jobs_completed: allRatings.length,
          })
          .eq("clerk_id", providerId);
      }

      setSubmitted(true);
      setTimeout(() => onRated(), 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-xl p-4 text-center">
        <p className="text-yellow-400 font-bold">⭐ Thank you for your rating!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mt-3">
      <p className="text-white font-bold text-sm mb-3">
        Rate {providerName}
      </p>

      {/* STARS */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-all"
          >
            {star <= (hover || rating) ? "⭐" : "☆"}
          </button>
        ))}
        {rating > 0 && (
          <span className="text-yellow-400 text-sm ml-2 self-center font-bold">
            {rating}/5
          </span>
        )}
      </div>

      {/* REVIEW */}
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Leave a comment (optional)..."
        className="w-full bg-gray-950 border border-gray-700 focus:border-yellow-500 rounded-lg p-3 text-white placeholder-gray-500 resize-none outline-none text-xs mb-3"
        rows={2}
      />

      <button
        onClick={submitRating}
        disabled={rating === 0 || submitting}
        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-bold py-2 rounded-lg transition-all text-sm"
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}