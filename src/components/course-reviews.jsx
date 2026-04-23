import { useEffect, useState } from "react";
import { Star, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Reviews, ratingStats } from "../lib/reviews.js";
import { Enrollments } from "../lib/store.js";
import { useAuth } from "../lib/auth-context.jsx";

export function CourseReviews({ course }) {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((x) => x + 1);

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    average: 0,
    count: 0,
    distribution: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    setReviews(Reviews.forCourse(course.id));
    setStats(ratingStats(course));
  }, [course, tick]);

  const isEnrolled = user ? !!Enrollments.get(user.id, course.id) : false;
  const isInstructor =
  user?.role === "instructor" && user.id === course.instructorId;
  const myReview =
  user && user.role === "student" ?
  Reviews.forUserCourse(user.id, course.id) :
  undefined;

  const canWrite = !!user && user.role === "student" && isEnrolled;

  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">
        Reviews
      </h2>

      {/* Summary + distribution */}
      <div className="mb-8 grid gap-6 rounded-[28px] border border-foreground/5 bg-card p-6 sm:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center justify-center border-b border-foreground/5 pb-6 text-center sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
          <div className="text-5xl font-semibold tracking-tight">
            {stats.count === 0 ? "—" : stats.average.toFixed(1)}
          </div>
          <div className="mt-2 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) =>
            <Star
              key={n}
              className={`size-4 ${
              n <= Math.round(stats.average) ?
              "fill-glow text-glow" :
              "text-muted-foreground/30"}`
              } />

            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {stats.count} {stats.count === 1 ? "review" : "reviews"}
          </div>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const c = stats.distribution[star - 1] ?? 0;
            const pct = stats.count === 0 ? 0 : Math.round(c / stats.count * 100);
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-10 text-muted-foreground tabular-nums">
                  {star} star
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-glow transition-all"
                    style={{ width: `${pct}%` }} />
                  
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>);

          })}
        </div>
      </div>

      {/* Write/edit form */}
      {canWrite &&
      <ReviewForm
        courseId={course.id}
        existing={myReview}
        onSaved={refresh} />

      }
      {user && user.role === "student" && !isEnrolled &&
      <div className="mb-6 rounded-2xl border border-dashed border-foreground/10 bg-card/50 p-4 text-sm text-muted-foreground">
          Enroll in this course to leave a review.
        </div>
      }

      {/* List */}
      {reviews.length === 0 ?
      <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience.
        </p> :

      <div className="space-y-4">
          {reviews.map((r) =>
        <ReviewItem
          key={r.id}
          review={r}
          isMine={!!user && r.userId === user.id}
          canReply={isInstructor && !!r.userId}
          onChanged={refresh} />

        )}
        </div>
      }
    </section>);

}

function ReviewForm({
  courseId,
  existing,
  onSaved




}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");

  useEffect(() => {
    setRating(existing?.rating ?? 5);
    setComment(existing?.comment ?? "");
  }, [existing?.id]);

  const submit = (e) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) {
      toast.error("Please write a short review.");
      return;
    }
    Reviews.upsert(user, courseId, rating, comment.trim());
    toast.success(existing ? "Review updated" : "Review posted");
    onSaved();
  };

  return (
    <form
      onSubmit={submit}
      className="mb-8 rounded-[28px] border border-foreground/5 bg-card p-6">
      
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">
          {existing ? "Edit your review" : "Write a review"}
        </div>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(0)}>
          
          {[1, 2, 3, 4, 5].map((n) =>
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="rounded-sm p-0.5 transition-transform hover:scale-110">
            
              <Star
              className={`size-6 ${
              n <= (hover || rating) ?
              "fill-glow text-glow" :
              "text-muted-foreground/40"}`
              } />
            
            </button>
          )}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What stood out about this course?"
        rows={4}
        className="w-full resize-none rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm outline-none focus:border-glow" />
      
      <div className="mt-3 flex items-center justify-end gap-3">
        {existing &&
        <button
          type="button"
          onClick={() => {
            if (!confirm("Delete your review?")) return;
            Reviews.remove(existing.id);
            toast.success("Review deleted");
            onSaved();
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 px-4 py-2 text-xs font-medium hover:bg-secondary">
          
            <Trash2 className="size-3.5" /> Delete
          </button>
        }
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/90">
          
          {existing ? "Save changes" : "Post review"}
        </button>
      </div>
    </form>);

}

function ReviewItem({
  review,
  isMine,
  canReply,
  onChanged





}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState(review.instructorReply?.message ?? "");

  const submitReply = (e) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;
    Reviews.reply(review.id, user, replyText.trim());
    toast.success("Reply posted");
    setReplying(false);
    onChanged();
  };

  return (
    <div className="rounded-2xl border border-foreground/5 bg-card p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="font-medium">{review.userName}</div>
          {isMine &&
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              You
            </span>
          }
          <span className="text-xs text-muted-foreground">
            {new Date(review.date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) =>
          <Star
            key={n}
            className={`size-3.5 ${
            n <= review.rating ?
            "fill-glow text-glow" :
            "text-muted-foreground/30"}`
            } />

          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>

      {review.instructorReply &&
      <div className="mt-4 rounded-xl border-l-2 border-glow bg-secondary/40 p-4">
          <div className="mb-1 flex items-center gap-2 text-xs">
            <MessageCircle className="size-3.5 text-glow" />
            <span className="font-semibold">
              {review.instructorReply.instructorName}
            </span>
            <span className="rounded-full bg-glow/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-glow">
              Instructor
            </span>
            <span className="text-muted-foreground">
              {new Date(review.instructorReply.date).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {review.instructorReply.message}
          </p>
        </div>
      }

      {canReply && !replying &&
      <button
        onClick={() => setReplying(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-glow hover:underline">
        
          <Pencil className="size-3.5" />
          {review.instructorReply ? "Edit reply" : "Reply as instructor"}
        </button>
      }
      {canReply && replying &&
      <form onSubmit={submitReply} className="mt-3">
          <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Reply to this learner…"
          rows={3}
          className="w-full resize-none rounded-xl border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-glow" />
        
          <div className="mt-2 flex justify-end gap-2">
            <button
            type="button"
            onClick={() => setReplying(false)}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">
            
              Cancel
            </button>
            <button
            type="submit"
            className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:bg-foreground/90">
            
              Post reply
            </button>
          </div>
        </form>
      }
    </div>);

}