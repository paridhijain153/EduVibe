import { useEffect } from "react";
import { Link } from "react-router-dom";import { Star } from "lucide-react";

import { ratingStats } from "../lib/reviews.js";

export function CourseCard({ course }) {
  const s = ratingStats(course);
  const avg = s.count === 0 ? course.rating : s.average;
  const count = s.count === 0 ? course.ratingCount : s.count;

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group block rounded-[20px] border border-foreground/5 bg-card p-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_oklch(0.74_0.14_60/0.12)]">
      
      <div
        className={`relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${course.thumbnail} outline outline-1 outline-black/5 -outline-offset-1`}>
        
        {course.image &&
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          width={1024}
          height={768}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />

        }
        <div className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/95">
            {course.category}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider tabular-nums text-muted-foreground">
          <span>
            {course.modules.length} Modules · {course.durationHours.toFixed(1)}h
          </span>
          <span className="rounded-sm bg-secondary px-2 py-0.5">{course.level}</span>
        </div>
        <h3 className="mb-2 text-balance text-xl font-semibold tracking-tight transition-colors group-hover:text-glow">
          {course.title}
        </h3>
        <div className="mb-2 flex items-center gap-1.5 text-xs">
          <Star className="size-3.5 fill-glow text-glow" />
          <span className="font-semibold tabular-nums">{avg.toFixed(1)}</span>
          <span className="text-muted-foreground">({count})</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">By {course.instructorName}</p>
          <p className="text-sm font-semibold text-foreground">
            {course.price === 0 ? "Free" : `$${course.price}`}
          </p>
        </div>
      </div>
    </Link>);

}