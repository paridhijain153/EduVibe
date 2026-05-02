
import imgCognitive from "../assets/course-cognitive.jpg";
import imgAttention from "../assets/course-attention.jpg";
import imgTypes from "../assets/course-types.jpg";
import imgDesign from "../assets/course-design.jpg";
import imgData from "../assets/course-data.jpg";
import imgStrategy from "../assets/course-strategy.jpg";

/**
 * Curated seed content.
 *
 * Thumbnails: Unsplash (free, hotlinkable). Local fallbacks in src/assets/
 * are kept and used as the primary `image` so the home/courses pages always
 * render even if Unsplash is blocked. Unsplash URLs are listed in `cover` so
 * we can A/B swap easily later.
 *
 * Videos: every `type: "video"` topic has a real YouTube `videoId` from
 * reputable, embeddable channels (TED-Ed, Veritasium, CGP Grey, Stanford,
 * Harvard, Google Design, Y Combinator, StatQuest, 3Blue1Brown). Embeds use
 * youtube-nocookie.com.
 */

export const CATEGORIES = [
"Cognitive Science",
"Design",
"Engineering",
"Business",
"Data Science",
"Humanities",
"Product"];


export const SEED_USERS = [
{
  id: "u-admin",
  name: "Ada Admin",
  email: "admin@eduvibe.edu",
  role: "admin",
  avatarColor: "#E89A4F",
  createdAt: "2025-01-01T00:00:00Z"
},
{
  id: "u-thorne",
  name: "Dr. Elias Thorne",
  email: "thorne@eduvibe.edu",
  role: "instructor",
  avatarColor: "#6B635A",
  createdAt: "2025-01-02T00:00:00Z"
},
{
  id: "u-vance",
  name: "Clara Vance",
  email: "clara@eduvibe.edu",
  role: "instructor",
  avatarColor: "#2C2825",
  createdAt: "2025-01-03T00:00:00Z"
},
{
  id: "u-rook",
  name: "Julian Rook",
  email: "julian@eduvibe.edu",
  role: "instructor",
  avatarColor: "#A37454",
  createdAt: "2025-01-04T00:00:00Z"
},
{
  id: "u-student",
  name: "Sam Student",
  email: "sam@eduvibe.edu",
  role: "student",
  avatarColor: "#E89A4F",
  createdAt: "2025-01-05T00:00:00Z"
}];


// ---------- Module builder ----------











function buildModules(slug, specs) {
  return specs.map((m, i) => ({
    id: `${slug}-m${i + 1}`,
    title: m.title,
    topics: m.topics.map((t, j) => {
      const tid = `${slug}-m${i + 1}-t${j + 1}`;
      return {
        id: tid,
        title: `${j + 1}. ${t.title}`,
        duration: t.duration,
        type: t.type,
        content: t.content,
        videoId: t.videoId,
        questions: t.questions?.map((q, k) => ({
          id: `${tid}-q${k + 1}`,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation
        })),
        passingScore: t.passingScore
      };
    })
  }));
}

// ---------- Unsplash covers (1600w, hotlinkable, free) ----------
// We keep local imports as the primary `image` for offline reliability.
const UNSPLASH = {
  cognitive:
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1600&q=80",
  attention:
  "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1600&q=80",
  systems:
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
  design:
  "https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&w=1600&q=80",
  data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
  strategy:
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80"
};

// ---------- Courses ----------

const cognitive = {
  id: "c-cognitive",
  slug: "foundations-of-cognitive-science",
  title: "Foundations of Cognitive Science",
  subtitle: "How the mind represents, computes and learns.",
  description:
  "An accessible tour of the field that sits at the crossroads of psychology, neuroscience, philosophy and AI. We start with what it means to call the brain a 'computer', visit landmark experiments on perception and memory, and finish with the modern debate around large neural networks and consciousness. By the end you'll have a working vocabulary for thinking about thinking.",
  category: "Cognitive Science",
  level: "Foundational",
  price: 0,
  thumbnail: "from-amber-200 to-rose-300",
  image: imgCognitive,
  instructorId: "u-thorne",
  instructorName: "Dr. Rahul",
  rating: 4.8,
  ratingCount: 1240,
  enrolledCount: 8420,
  durationHours: 6,
  createdAt: "2025-02-10T00:00:00Z",
  modules: buildModules("c-cognitive", [
  {
    title: "What is cognition?",
    topics: [
    {
      title: "The mind as an information processor",
      duration: "11:42",
      type: "video",
      videoId: "ARJ8cAGm6JE",
      content:
      "TED-Ed's primer on what cognitive science studies and why the 'mind as computation' metaphor reshaped psychology in the 20th century."
    },
    {
      title: "A short history of the field",
      duration: "8 min read",
      type: "reading",
      content:
      "From Descartes' dualism to the 1956 Dartmouth workshop: a compact timeline of the ideas that converged into modern cognitive science."
    },
    {
      title: "Quick check: levels of analysis",
      duration: "5 min",
      type: "quiz",
      passingScore: 80,
      content:
      "Five questions on Marr's three levels of analysis (computational, algorithmic, implementational). Pass with 4 out of 5 to continue.",
      questions: [
      {
        prompt: "Which of Marr's levels asks 'what is the goal of the computation, and why?'",
        options: ["Implementational", "Algorithmic", "Computational", "Behavioural"],
        correctIndex: 2,
        explanation: "The computational level specifies the problem and its goal — independent of how it's solved."
      },
      {
        prompt: "A description of the steps and representations a system uses belongs to which level?",
        options: ["Computational", "Algorithmic", "Implementational", "Phenomenological"],
        correctIndex: 1,
        explanation: "The algorithmic level describes the procedure and data structures used to achieve the goal."
      },
      {
        prompt: "Mapping cognition onto neurons, circuits or silicon is the…",
        options: ["Implementational level", "Computational level", "Functional level", "Symbolic level"],
        correctIndex: 0
      },
      {
        prompt: "Two systems can share a computational description but differ at which level(s)?",
        options: ["Only computational", "Only implementational", "Algorithmic and implementational", "None — they must match everywhere"],
        correctIndex: 2,
        explanation: "Different algorithms and hardware can solve the same problem."
      },
      {
        prompt: "Marr argued that explanations of vision are incomplete unless they address…",
        options: ["Only neurons", "Only behaviour", "All three levels", "Only the algorithm"],
        correctIndex: 2
      }]

    }]

  },
  {
    title: "Perception and attention",
    topics: [
    {
      title: "How your brain constructs reality",
      duration: "14:21",
      type: "video",
      videoId: "evQsOFQju08",
      content:
      "Anil Seth's TED talk on perception as 'controlled hallucination' — the brain's best guess at the causes of its sensory inputs."
    },
    {
      title: "Selective attention and the cocktail party effect",
      duration: "9:11",
      type: "video",
      videoId: "vJG698U2Mvo",
      content:
      "The famous Simons & Chabris invisible-gorilla experiment, with commentary on why attention is fundamentally a filter."
    }]

  },
  {
    title: "Memory and learning",
    topics: [
    {
      title: "How memories form, persist and fail",
      duration: "12:50",
      type: "video",
      videoId: "yOgAbKJGrTA",
      content:
      "TED-Ed walks through encoding, consolidation and retrieval — and why our memories are more reconstruction than recording."
    },
    {
      title: "Spaced repetition and the forgetting curve",
      duration: "7 min read",
      type: "reading",
      content:
      "Ebbinghaus' 1885 experiments and how modern tools like Anki turn his findings into a daily learning practice."
    }]

  }]
  ),
  reviews: [
  {
    id: "r-cog-1",
    userName: "Maya R.",
    rating: 5,
    comment:
    "Finally a course that treats cognitive science as one coherent field instead of six disconnected ones.",
    date: "2025-03-04T00:00:00Z"
  },
  {
    id: "r-cog-2",
    userName: "Jonas K.",
    rating: 4,
    comment: "Great pacing. The Marr levels module made everything click for me.",
    date: "2025-03-22T00:00:00Z"
  }]

};

const attention = {
  id: "c-attention",
  slug: "the-architecture-of-attention",
  title: "The Architecture of Attention",
  subtitle: "Reclaim focus in an economy designed to fragment it.",
  description:
  "A practical course built on the cognitive science of attention. We cover the neuroscience of focus, the design patterns that exploit it, and a concrete daily protocol for deep work. Includes guided exercises and a four-week focus journal template.",
  category: "Cognitive Science",
  level: "Intermediate",
  price: 49,
  thumbnail: "from-orange-200 to-amber-300",
  image: imgAttention,
  instructorId: "u-vance",
  instructorName: "Clara Vance",
  rating: 4.7,
  ratingCount: 612,
  enrolledCount: 3120,
  durationHours: 4,
  createdAt: "2025-02-20T00:00:00Z",
  modules: buildModules("c-attention", [
  {
    title: "What attention actually is",
    topics: [
    {
      title: "Top-down vs bottom-up attention",
      duration: "10:08",
      type: "video",
      videoId: "55y9Oy4SZII",
      content:
      "Veritasium on why your attention is constantly negotiated between your goals and the loudest signal in the room."
    },
    {
      title: "The myth of multitasking",
      duration: "5 min read",
      type: "reading",
      content:
      "There is no such thing as multitasking — only fast task-switching, with measurable cognitive cost. We summarise the key studies."
    }]

  },
  {
    title: "Deep work in practice",
    topics: [
    {
      title: "Cal Newport on deep work",
      duration: "13:47",
      type: "video",
      videoId: "1pkucNG1AUA",
      content:
      "A talk on the economic value of focus and the routines that make sustained concentration possible."
    },
    {
      title: "Designing your environment",
      duration: "6 min read",
      type: "reading",
      content:
      "Concrete defaults — phone in another room, single-purpose devices, time-blocked calendars — and the research behind each one."
    },
    {
      title: "Quick check: protocols",
      duration: "4 min",
      type: "quiz",
      passingScore: 60,
      content: "Five scenario questions on choosing the right attention protocol.",
      questions: [
      {
        prompt: "You need 90 minutes of deep writing. Phone is buzzing. Best move?",
        options: ["Silent mode on the desk", "Phone in another room", "Headphones with music + phone face-down", "Reply to messages first to clear your head"],
        correctIndex: 1,
        explanation: "Mere presence of a smartphone reduces cognitive capacity (Ward et al., 2017)."
      },
      {
        prompt: "Switching tasks every few minutes mostly hurts performance because of…",
        options: ["Eye strain", "Attention residue", "Hunger", "Posture"],
        correctIndex: 1,
        explanation: "Sophie Leroy's 'attention residue' research: part of attention stays with the prior task."
      },
      {
        prompt: "Which is the best default for shallow inbox work?",
        options: ["A 25-min timeboxed batch", "Continuous all-day triage", "Whenever a notification fires", "Last thing before sleep"],
        correctIndex: 0
      },
      {
        prompt: "Open-plan office, urgent thinking task. Best single tactic?",
        options: ["Wear noise-cancelling headphones and book a focus block", "Sit closer to the window", "Drink more coffee", "Schedule a meeting to discuss it"],
        correctIndex: 0
      },
      {
        prompt: "A teammate interrupts you mid-flow. The lowest-cost recovery is to…",
        options: ["Drop everything and context-switch", "Note where you were before answering", "Pretend you didn't hear them", "Restart the task from scratch"],
        correctIndex: 1,
        explanation: "Capturing your re-entry point shrinks the switching cost."
      }]

    }]

  }]
  ),
  reviews: [
  {
    id: "r-att-1",
    userName: "Priya S.",
    rating: 5,
    comment: "The four-week journal alone was worth it. My focus measurably improved.",
    date: "2025-04-01T00:00:00Z"
  }]

};

const systems = {
  id: "c-systems",
  slug: "architecting-complex-systems",
  title: "Architecting Complex Systems",
  subtitle: "Designing software that survives growth, change and people.",
  description:
  "A senior-engineering course on how to make architectural decisions you won't regret in two years. Topics include service boundaries, data ownership, eventual consistency, observability, and the social dynamics of large codebases.",
  category: "Engineering",
  level: "Advanced",
  price: 129,
  thumbnail: "from-stone-300 to-zinc-400",
  image: imgTypes,
  instructorId: "u-rook",
  instructorName: "Julian Rook",
  rating: 4.9,
  ratingCount: 480,
  enrolledCount: 1840,
  durationHours: 8,
  createdAt: "2025-03-05T00:00:00Z",
  modules: buildModules("c-systems", [
  {
    title: "Thinking in systems",
    topics: [
    {
      title: "What is a complex system?",
      duration: "11:30",
      type: "video",
      videoId: "GjwvsK-6640",
      content:
      "An introduction to systems thinking: feedback loops, emergence, and why local optimisations break global behaviour."
    },
    {
      title: "Conway's Law and team topology",
      duration: "7 min read",
      type: "reading",
      content:
      "Why your software architecture will mirror your org chart — and what to do about it."
    }]

  },
  {
    title: "Data and consistency",
    topics: [
    {
      title: "CAP, PACELC and the trade-offs you can't avoid",
      duration: "16:02",
      type: "video",
      videoId: "k-Yaq8AHlFA",
      content:
      "A clear walk-through of the consistency/availability trade-off and the patterns used by real distributed databases."
    },
    {
      title: "Designing for failure",
      duration: "12:45",
      type: "video",
      videoId: "CZ3wIuvmHeM",
      content:
      "Netflix-era talk on chaos engineering and why your system isn't reliable until you've broken it on purpose."
    }]

  },
  {
    title: "Operating the system",
    topics: [
    {
      title: "Observability vs monitoring",
      duration: "10 min read",
      type: "reading",
      content:
      "Three pillars (logs, metrics, traces), what each is good for, and the questions you should be able to answer in production."
    },
    {
      title: "Capstone quiz",
      duration: "10 min",
      type: "quiz",
      passingScore: 70,
      content: "Architecture-decision questions drawing on the whole course.",
      questions: [
      {
        prompt: "Two services must stay consistent at write-time. Best fit?",
        options: ["Eventual consistency via events", "Synchronous call inside one transaction boundary", "Cron job that reconciles nightly", "Manual double-write from the client"],
        correctIndex: 1
      },
      {
        prompt: "Which is NOT one of the three pillars of observability?",
        options: ["Logs", "Metrics", "Traces", "Tickets"],
        correctIndex: 3
      },
      {
        prompt: "A read-heavy product surface degrades under load. First lever to pull?",
        options: ["Add a cache in front of the hot read", "Rewrite in a faster language", "Shard the database", "Move to microservices"],
        correctIndex: 0,
        explanation: "Caching is usually the cheapest, lowest-risk win for a hot read path."
      },
      {
        prompt: "Idempotency keys primarily protect against…",
        options: ["SQL injection", "Duplicate side-effects from retries", "Slow queries", "Cold starts"],
        correctIndex: 1
      },
      {
        prompt: "You introduce a queue between two services. The main trade-off you accept is…",
        options: ["Higher coupling", "Loss of strong ordering and immediate consistency", "Worse fault isolation", "Higher synchronous latency"],
        correctIndex: 1
      },
      {
        prompt: "A 'thin' service with one responsibility and clear contracts is preferable because it…",
        options: ["Is always faster", "Reduces the blast radius of changes", "Removes the need for tests", "Eliminates network calls"],
        correctIndex: 1
      },
      {
        prompt: "Which signal best answers 'is the user-visible experience healthy right now?'",
        options: ["CPU utilisation", "SLO-aligned latency and error rate", "Number of pods running", "Lines of code shipped"],
        correctIndex: 1
      }]

    }]

  }]
  ),
  reviews: [
  {
    id: "r-sys-1",
    userName: "Daniel O.",
    rating: 5,
    comment: "Replaced two books on my shelf. The CAP module is the clearest explanation I've seen.",
    date: "2025-04-08T00:00:00Z"
  }]

};

const design = {
  id: "c-design",
  slug: "interface-design-fundamentals",
  title: "Interface Design Fundamentals",
  subtitle: "The visual and interaction grammar of modern software.",
  description:
  "A foundations course in product UI: typography, colour, layout, motion and the small interaction details that make an app feel solid. Built around critique-driven exercises so you build a portfolio piece as you go.",
  category: "Design",
  level: "Foundational",
  price: 0,
  thumbnail: "from-rose-200 to-orange-300",
  image: imgDesign,
  instructorId: "u-vance",
  instructorName: "Clara Vance",
  rating: 4.6,
  ratingCount: 980,
  enrolledCount: 6210,
  durationHours: 5,
  createdAt: "2025-02-12T00:00:00Z",
  modules: buildModules("c-design", [
  {
    title: "Type, colour, space",
    topics: [
    {
      title: "Typography crash course",
      duration: "9:41",
      type: "video",
      videoId: "QrNi9FmdlxY",
      content:
      "The Futur's quick tour of the typographic concepts every UI designer needs: hierarchy, rhythm, optical sizing."
    },
    {
      title: "Colour systems for screens",
      duration: "6 min read",
      type: "reading",
      content:
      "From HSL to OKLCH: why modern design tokens are moving to perceptual colour spaces."
    }]

  },
  {
    title: "Interaction details",
    topics: [
    {
      title: "Microinteractions matter",
      duration: "12:18",
      type: "video",
      videoId: "jgrkV_hJdJw",
      content:
      "Google Design on the small interactive moments that signal quality and guide users through state changes."
    },
    {
      title: "Designing accessible interfaces",
      duration: "14:55",
      type: "video",
      videoId: "20SHvU2PKsM",
      content:
      "A practical introduction to WCAG, focus management and writing for screen readers."
    }]

  }]
  ),
  reviews: [
  {
    id: "r-des-1",
    userName: "Lina M.",
    rating: 5,
    comment: "The critique exercises are gold. I shipped my first portfolio piece in week three.",
    date: "2025-03-18T00:00:00Z"
  }]

};

const data = {
  id: "c-data",
  slug: "applied-data-analysis",
  title: "Applied Data Analysis",
  subtitle: "Statistics, intuition and Python — in that order.",
  description:
  "A working analyst's curriculum. We teach the statistical reasoning first, then the tools, so you understand what your code is actually doing. Includes notebooks, datasets and four end-to-end case studies.",
  category: "Data Science",
  level: "Intermediate",
  price: 89,
  thumbnail: "from-amber-300 to-yellow-400",
  image: imgData,
  instructorId: "u-rook",
  instructorName: "Julian Rook",
  rating: 4.8,
  ratingCount: 720,
  enrolledCount: 4310,
  durationHours: 7,
  createdAt: "2025-03-01T00:00:00Z",
  modules: buildModules("c-data", [
  {
    title: "Statistical thinking",
    topics: [
    {
      title: "The Central Limit Theorem, intuitively",
      duration: "13:35",
      type: "video",
      videoId: "YAlJCEDH2uY",
      content:
      "StatQuest's classic visual explanation of why so much of statistics works."
    },
    {
      title: "p-values and what they really mean",
      duration: "11:22",
      type: "video",
      videoId: "vemZtEM63GY",
      content:
      "A careful walk-through of the most-misunderstood number in science."
    }]

  },
  {
    title: "From data to decisions",
    topics: [
    {
      title: "A/B testing done right",
      duration: "15:08",
      type: "video",
      videoId: "DUNk4GPZ9bw",
      content:
      "How real product teams design experiments, set guardrail metrics and avoid peeking."
    },
    {
      title: "Causal vs correlational reasoning",
      duration: "9 min read",
      type: "reading",
      content:
      "A short reading on confounders, instrumental variables and the limits of observational data."
    },
    {
      title: "Module quiz",
      duration: "6 min",
      type: "quiz",
      passingScore: 70,
      content: "Questions on experimental design and inference.",
      questions: [
      {
        prompt: "The single most important reason we randomise treatment assignment is to…",
        options: ["Make the analysis simpler", "Balance unobserved confounders in expectation", "Increase sample size", "Avoid having to pre-register"],
        correctIndex: 1
      },
      {
        prompt: "A p-value of 0.04 means…",
        options: ["There's a 96% chance the effect is real", "If the null were true, data this extreme would occur 4% of the time", "The effect size is large", "The result will replicate"],
        correctIndex: 1
      },
      {
        prompt: "Selection bias most likely arises when…",
        options: ["The treatment is randomised", "Subjects opt in based on factors related to the outcome", "The sample is very large", "You report a confidence interval"],
        correctIndex: 1
      },
      {
        prompt: "A confound is best described as a variable that…",
        options: ["Is measured with noise", "Influences both the treatment and the outcome", "Is the outcome", "Is missing at random"],
        correctIndex: 1
      },
      {
        prompt: "Which is a credible substitute for an RCT when randomisation isn't possible?",
        options: ["Bigger N alone", "A natural experiment with an instrumental variable", "Ignoring the confounder", "Using a higher significance threshold"],
        correctIndex: 1
      },
      {
        prompt: "A 95% confidence interval that excludes zero implies…",
        options: ["The true effect is definitely non-zero", "Under repeated sampling, 95% of such intervals would contain the true value", "The p-value is exactly 0.05", "The study replicates"],
        correctIndex: 1
      }]

    }]

  }]
  ),
  reviews: [
  {
    id: "r-data-1",
    userName: "Ravi T.",
    rating: 5,
    comment: "Finally I understand p-values. The instructor refuses to hand-wave anything.",
    date: "2025-04-02T00:00:00Z"
  }]

};

const strategy = {
  id: "c-strategy",
  slug: "product-strategy-essentials",
  title: "Product Strategy Essentials",
  subtitle: "From customer pain to roadmap, without losing the plot.",
  description:
  "A practitioner's course on building products people want. Covers customer interviews, opportunity solution trees, prioritisation frameworks and how to write a strategy document an exec will actually read.",
  category: "Product",
  level: "Intermediate",
  price: 99,
  thumbnail: "from-stone-200 to-amber-300",
  image: imgStrategy,
  instructorId: "u-thorne",
  instructorName: "Dr. Elias Thorne",
  rating: 4.7,
  ratingCount: 540,
  enrolledCount: 2780,
  durationHours: 5,
  createdAt: "2025-03-15T00:00:00Z",
  modules: buildModules("c-strategy", [
  {
    title: "Talking to customers",
    topics: [
    {
      title: "How to do a great customer interview",
      duration: "18:41",
      type: "video",
      videoId: "MT4Ig2uqjTc",
      content:
      "Y Combinator on getting real signal out of conversations, and avoiding the leading questions that produce false validation."
    },
    {
      title: "The Mom Test, summarised",
      duration: "6 min read",
      type: "reading",
      content:
      "Rob Fitzpatrick's three rules for asking questions that don't reward you with comforting lies."
    }]

  },
  {
    title: "From insight to roadmap",
    topics: [
    {
      title: "Opportunity solution trees",
      duration: "14:02",
      type: "video",
      videoId: "Thc7Q2VMFOw",
      content:
      "Teresa Torres' framework for connecting outcomes to the specific opportunities and bets that drive them."
    },
    {
      title: "Writing a one-page strategy",
      duration: "8 min read",
      type: "reading",
      content:
      "A template and worked example for the document we use to align engineers, designers and execs."
    },
    {
      title: "Capstone quiz",
      duration: "8 min",
      type: "quiz",
      passingScore: 70,
      content: "Questions tying together discovery, prioritisation and communication.",
      questions: [
      {
        prompt: "Continuous discovery is best characterised as…",
        options: ["A quarterly customer survey", "A weekly cadence of customer touch-points feeding decisions", "User testing once before launch", "Reading analytics dashboards"],
        correctIndex: 1
      },
      {
        prompt: "An opportunity-solution tree starts from…",
        options: ["A backlog of features", "A clear desired outcome", "The CEO's preferred solution", "A competitor's roadmap"],
        correctIndex: 1
      },
      {
        prompt: "RICE scoring weights an idea by Reach, Impact, Confidence and…",
        options: ["Effort", "Excitement", "Engineers", "Earnings"],
        correctIndex: 0
      },
      {
        prompt: "A good product strategy document fits on…",
        options: ["A single page", "A 40-slide deck", "A spreadsheet", "Whatever length the CEO asks for"],
        correctIndex: 0
      },
      {
        prompt: "When a stakeholder pushes a solution, the strongest first response is to…",
        options: ["Build it immediately to keep them happy", "Reframe it as an opportunity and explore the underlying need", "Reject it on principle", "Assign it to the backlog forever"],
        correctIndex: 1
      },
      {
        prompt: "The best sign your prioritisation is working is that…",
        options: ["Velocity is up", "Outcomes (not output) are improving against the strategy", "The backlog is empty", "Every team is busy"],
        correctIndex: 1
      }]

    }]

  }]
  ),
  reviews: [
  {
    id: "r-str-1",
    userName: "Ben H.",
    rating: 5,
    comment: "The opportunity-solution-tree module replaced our entire planning ritual.",
    date: "2025-04-10T00:00:00Z"
  }]

};

export const SEED_COURSES = [cognitive, attention, systems, design, data, strategy];
