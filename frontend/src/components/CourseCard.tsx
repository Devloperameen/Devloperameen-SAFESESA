
import { Link } from "react-router-dom";
import { Star, Users, ArrowUpRight, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/models";
import { motion } from "framer-motion";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link to={`/course/${course.id}`} className="block group">
      <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm overflow-hidden shadow-2xl transition-all duration-500 hover:border-primary/40 relative">
        {/* Animated Accent Border */}
        <div className="absolute top-0 left-0 w-0 h-[2px] bg-primary transition-all duration-500 group-hover:w-full z-20" />

        {/* Course Media Section */}
        <div className="aspect-video w-full relative overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

          {/* Overlays */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md uppercase text-[10px] font-black tracking-tighter">
              {course.level}
            </Badge>
          </div>

          <div className="absolute bottom-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-black shadow-xl">
              <PlayCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{course.category.replace("-", " ")}</span>
              <div className="flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-xs font-black text-white">{course.rating}</span>
              </div>
            </div>
            <h3 className="text-white font-bold leading-tight line-clamp-2 h-10 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium tracking-wide">by <span className="text-slate-300">{course.instructor}</span></p>
          </div>

          <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{course.students.toLocaleString()} STUDENTS</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-400">$</span>
              <span className="text-xl font-black text-white">{course.price}</span>
            </div>
          </div>
        </CardContent>

        {/* Hover Arrow Indicator */}
        <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-950/50 border border-white/10 flex items-center justify-center text-white backdrop-blur-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </Card>
    </Link>
  );
}
