import { useMemo, useState } from "react";

import { QuizAttempts } from "../lib/store.js";
import { CheckCircle2, ClipboardCheck, RotateCcw, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";












export function QuizPlayer({
  topic,
  userId,
  courseId,
  onPassed,
  onAttempt,
  alreadyCompleted
}) {
  const questions = useMemo(() => topic.questions ?? [], [topic.questions]);
  const passingScore = topic.passingScore ?? 60;

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(
    null
  );
  const [bestScore, setBestScore] = useState(
    () => QuizAttempts.best(userId, topic.id)?.score
  );

  if (!questions.length) {
    return (
      <div className="rounded-[28px] border border-foreground/5 bg-card p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-8">
        <div className="mb-3 flex items-center gap-3 text-sm font-medium text-foreground">
          <ClipboardCheck className="size-5 text-glow" />
          Quiz checkpoint · {topic.duration}
        </div>
        <p className="text-muted-foreground">{topic.content}</p>
      </div>);

  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = () => {
    if (!allAnswered) {
      toast.error("Answer every question first.");
      return;
    }
    const correct = questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
      0
    );
    const score = Math.round(correct / questions.length * 100);
    const passed = score >= passingScore;
    QuizAttempts.record({
      userId,
      courseId,
      topicId: topic.id,
      score,
      passed,
      answers: questions.map((q) => answers[q.id] ?? -1)
    });
    setBestScore((b) => b === undefined || score > b ? score : b);
    setResult({ score, correct, passed });
    setSubmitted(true);
    onAttempt?.();
    if (passed) {
      if (!alreadyCompleted) onPassed();
      toast.success(`Passed with ${score}%`);
    } else {
      toast.error(`Score ${score}% — need ${passingScore}% to pass.`);
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  return (
    <div className="rounded-[28px] border border-foreground/5 bg-card p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 text-sm font-medium text-foreground">
          <ClipboardCheck className="size-5 text-glow" />
          Quiz checkpoint · {questions.length} questions · pass {passingScore}%
        </div>
        {bestScore !== undefined &&
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
            <Trophy className="size-3.5 text-glow" />
            Best: {bestScore}%
          </div>
        }
      </div>

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{topic.content}</p>

      <ol className="space-y-5">
        {questions.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <li
              key={q.id}
              className="rounded-2xl border border-foreground/5 bg-secondary/40 p-5">
              
              <div className="mb-3 text-sm font-semibold text-foreground">
                Q{qi + 1}. {q.prompt}
              </div>
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi;
                  const isCorrect = oi === q.correctIndex;
                  let cls =
                  "flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ";
                  if (submitted) {
                    if (isCorrect) {
                      cls += "border-emerald-500/40 bg-emerald-500/10 text-foreground";
                    } else if (isSelected) {
                      cls += "border-red-500/40 bg-red-500/10 text-foreground";
                    } else {
                      cls += "border-foreground/10 bg-card text-muted-foreground";
                    }
                  } else if (isSelected) {
                    cls += "border-foreground bg-foreground text-background";
                  } else {
                    cls += "border-foreground/10 bg-card hover:bg-secondary";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={cls}>
                      
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-semibold">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {submitted && isCorrect &&
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      }
                      {submitted && isSelected && !isCorrect &&
                      <XCircle className="size-4 shrink-0 text-red-500" />
                      }
                    </button>);

                })}
              </div>
              {submitted && q.explanation &&
              <p className="mt-3 rounded-lg bg-background/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Why: </span>
                  {q.explanation}
                </p>
              }
            </li>);

        })}
      </ol>

      {submitted && result &&
      <div
        className={`mt-6 rounded-2xl border p-5 ${
        result.passed ?
        "border-emerald-500/30 bg-emerald-500/10" :
        "border-red-500/30 bg-red-500/10"}`
        }>
        
          <div className="flex items-center gap-3">
            {result.passed ?
          <CheckCircle2 className="size-6 text-emerald-500" /> :

          <XCircle className="size-6 text-red-500" />
          }
            <div>
              <div className="text-base font-semibold">
                {result.passed ? "You passed!" : "Not quite there"}
              </div>
              <div className="text-sm text-muted-foreground">
                {result.correct}/{questions.length} correct · {result.score}% · need{" "}
                {passingScore}% to complete
              </div>
            </div>
          </div>
        </div>
      }

      <div className="mt-6 flex flex-wrap gap-3">
        {!submitted &&
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-40">
          
            Submit quiz
          </button>
        }
        {submitted &&
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary">
          
            <RotateCcw className="size-4" /> Try again
          </button>
        }
        <span className="self-center text-xs text-muted-foreground">
          {Object.keys(answers).length}/{questions.length} answered
        </span>
      </div>
    </div>);

}