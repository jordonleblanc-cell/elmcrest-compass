import React, { useMemo, useState } from "react";

/**
 * Elmcrest Communication & Motivation Compass – React App
 * - Role selection (Program Supervisor, Shift Supervisor, YDP)
 * - Questions randomized within Communication and Motivation
 * - Style labels hidden on questions
 * - Dark mode via Tailwind + prefers-color-scheme
 * - Deep-dive explanations for:
 *    • Primary + Secondary Communication
 *    • Primary + Secondary Motivation
 *    • Primary Communication × Primary Motivation (16 combos)
 * - Elmcrest-specific guidance, dynamically “role-ized”
 */

/*************************** THEME ***************************/
const LOGO_URL =
  "https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-6/335322893_222820200226688_1211221556763724466_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=lPAlpUQgavMQ7kNvwGzHEny&_nc_oc=Adker9sL8-COYd6zlLN40hOCEAIvLe6T_t_kJK_92izZgsH9C0r9YLkxmTdvAoRp58k&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=XLaijGiFsHdo-_APKlQnZQ&oh=00_AfhV0_NTUPe-HNxO6AiF3bZzff_yDhFMtHLUHMCFSNWdrA&oe=691C332E";

const PRIMARY = "#0B4DA2"; // deep blue
const ACCENT = "#EE6C4D"; // warm accent

/**************** ROLE OPTIONS *******************************/
const ROLE_OPTIONS = [
  { value: "Program Supervisor", label: "Program Supervisor" },
  { value: "Shift Supervisor", label: "Shift Supervisor" },
  { value: "YDP", label: "Youth Development Professional (YDP)" },
];

/**************** COMMUNICATION & MOTIVATION MODEL ***********/
const COMM_KEYS = ["Director", "Encourager", "Facilitator", "Tracker"];
const MOTIV_KEYS = ["Growth", "Purpose", "Connection", "Achievement"];

const QUESTIONS = [
  // Director
  {
    id: "C1",
    kind: "communication",
    key: "Director",
    text: "I make decisions quickly and keep projects moving.",
  },
  {
    id: "C2",
    kind: "communication",
    key: "Director",
    text: "I’m comfortable taking charge when direction is unclear.",
  },
  {
    id: "C3",
    kind: "communication",
    key: "Director",
    text: "I prioritize results over lengthy discussion.",
  },
  // Encourager
  {
    id: "C4",
    kind: "communication",
    key: "Encourager",
    text: "I energize conversations and get people involved.",
  },
  {
    id: "C5",
    kind: "communication",
    key: "Encourager",
    text: "I enjoy brainstorming aloud and sharing ideas freely.",
  },
  {
    id: "C6",
    kind: "communication",
    key: "Encourager",
    text: "I build enthusiasm and morale on the team.",
  },
  // Facilitator
  {
    id: "C7",
    kind: "communication",
    key: "Facilitator",
    text: "I ensure everyone has a chance to be heard.",
  },
  {
    id: "C8",
    kind: "communication",
    key: "Facilitator",
    text: "I remain calm and patient during tense discussions.",
  },
  {
    id: "C9",
    kind: "communication",
    key: "Facilitator",
    text: "I focus on steady progress and team harmony.",
  },
  // Tracker
  {
    id: "C10",
    kind: "communication",
    key: "Tracker",
    text: "I double-check details to prevent errors.",
  },
  {
    id: "C11",
    kind: "communication",
    key: "Tracker",
    text: "I prefer clear processes and documented decisions.",
  },
  {
    id: "C12",
    kind: "communication",
    key: "Tracker",
    text: "I’m thorough, even if it takes extra time.",
  },

  // Motivation – Growth
  {
    id: "M1",
    kind: "motivation",
    key: "Growth",
    text: "Learning new skills keeps me engaged at work.",
  },
  {
    id: "M2",
    kind: "motivation",
    key: "Growth",
    text: "I seek stretch assignments that grow my capabilities.",
  },
  {
    id: "M3",
    kind: "motivation",
    key: "Growth",
    text: "I value feedback because it helps me improve.",
  },
  // Purpose
  {
    id: "M4",
    kind: "motivation",
    key: "Purpose",
    text: "It’s important that my work aligns with my values.",
  },
  {
    id: "M5",
    kind: "motivation",
    key: "Purpose",
    text: "I’m motivated by making a positive impact for others.",
  },
  {
    id: "M6",
    kind: "motivation",
    key: "Purpose",
    text: "Ethics and integrity guide how I approach tasks.",
  },
  // Connection
  {
    id: "M7",
    kind: "motivation",
    key: "Connection",
    text: "I thrive when I feel supported by my team.",
  },
  {
    id: "M8",
    kind: "motivation",
    key: "Connection",
    text: "I’m most energized when collaboration is strong.",
  },
  {
    id: "M9",
    kind: "motivation",
    key: "Connection",
    text: "Recognition from peers means a lot to me.",
  },
  // Achievement
  {
    id: "M10",
    kind: "motivation",
    key: "Achievement",
    text: "Meeting clear goals gives me momentum.",
  },
  {
    id: "M11",
    kind: "motivation",
    key: "Achievement",
    text: "I like tracking progress and checking things off.",
  },
  {
    id: "M12",
    kind: "motivation",
    key: "Achievement",
    text: "I’m driven by results and tangible outcomes.",
  },
];

/*********************** GOOGLE APPS SCRIPT ******************/
const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbymKxV156gkuGKI_eyKb483W4cGORMMcWqKsFcmgHAif51xQHyOCDO4KeXPJdK4gHpD/exec";

/*********************** HELPERS *****************************/
const LIKERT = [1, 2, 3, 4, 5];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function computeScores(answers) {
  const comm = {
    Director: 0,
    Encourager: 0,
    Facilitator: 0,
    Tracker: 0,
  };
  const motiv = {
    Growth: 0,
    Purpose: 0,
    Connection: 0,
    Achievement: 0,
  };

  QUESTIONS.forEach((q) => {
    const val = answers[q.id] || 0;
    if (q.kind === "communication") {
      comm[q.key] += val;
    } else {
      motiv[q.key] += val;
    }
  });

  const commSorted = Object.entries(comm).sort((a, b) => b[1] - a[1]);
  const motivSorted = Object.entries(motiv).sort((a, b) => b[1] - a[1]);

  return {
    comm,
    motiv,
    primaryComm: commSorted[0][0],
    secondaryComm: commSorted[1][0],
    primaryMotiv: motivSorted[0][0],
    secondaryMotiv: motivSorted[1][0],
  };
}

/**
 * Replace “Program Supervisor” language with the selected role in copy.
 * This lets us keep the original text but have it feel tailored.
 */
function roleize(text, roleLabel) {
  if (!text) return "";
  let t = String(text);
  t = t.replace(/Elmcrest Program Supervisor/g, roleLabel + " at Elmcrest");
  t = t.replace(/Program Supervisor/g, roleLabel);
  return t;
}

/*************** SINGLE-STYLE DEEP DIVES (ELMCREST) *************/
const COMM_INFO = {
  Director: {
    title: "Director",
    desc:
      "As a Program Supervisor, a Director style shows up as fast, decisive, and focused on safety and outcomes for youth. You bring clarity and movement when things feel stuck, especially in crises or high-pressure situations.",
    tips: [
      "With Shift Supervisors: Before giving your solution, ask, “What’s your read on this?” to signal that their perspective matters, not just their compliance.",
      "With YDPs: Pair clear expectations with appreciation: name one thing they’re doing well for youth before you redirect performance.",
      "With youth and families: Use warm + firm language: “I hear you and I care; here’s what has to happen next to keep everyone safe.”",
      "With your supervisor: When you present a plan, add one line on the people side: “Here’s the plan, and here’s how staff are reacting so far.”",
    ],
  },
  Encourager: {
    title: "Encourager",
    desc:
      "As a Program Supervisor, an Encourager style brings energy, warmth, and optimism to Elmcrest. You help staff remember why they do this work and you often make youth and families feel welcomed and hopeful.",
    tips: [
      "With Shift Supervisors: After encouraging them, lock in structure: “I see how hard you’re working. Let’s pick the top 1–2 priorities for this week.”",
      "With YDPs: Balance praise with specificity: “You connect so well with the youth during transitions. I also need your documentation in by the end of shift.”",
      "With youth and families: Stay warm and honest: “I want to help, and I also have to be clear about the limits of what we can promise.”",
      "With your supervisor: Share wins and worries: “I’m excited about this idea, and I’m also noticing these risks or staff concerns.”",
    ],
  },
  Facilitator: {
    title: "Facilitator",
    desc:
      "As a Program Supervisor, a Facilitator style creates emotional safety for staff and youth. You listen deeply, stay calm in conflict, and often hold the space where people can be honest about what’s really going on on the floor.",
    tips: [
      "With Shift Supervisors: Use compassionate clarity: “I value you, and I need to be direct that this pattern with scheduling has to change. Let’s fix it together.”",
      "With YDPs: Pair empathy with boundaries: “It makes sense that you’re tired. We still have to maintain coverage—let’s look at options that don’t burn you out further.”",
      "With youth and families: Offer calm firmness: “I’m not leaving, and I still can’t allow that behavior. Here’s what we can do instead.”",
      "With your supervisor: Advocate clearly: “We are meeting expectations, and we’re at risk of burnout on these shifts unless we adjust staffing or support.”",
    ],
  },
  Tracker: {
    title: "Tracker",
    desc:
      "As a Program Supervisor, a Tracker style shows up as thorough, process-focused, and detail-aware. You protect youth and staff by catching gaps in documentation, routines, and safety practices before they become real problems.",
    tips: [
      "With Shift Supervisors: When correcting process, add the ‘why’: “This documentation format matters because it protects you and the program in a review.”",
      "With YDPs: Normalize learning: “I don’t expect perfection, I expect effort. Here’s what you did well; here’s what to adjust next shift.”",
      "With youth and families: Start from relationship, then policy: “I want you to feel safe and know what to expect. That’s why we have this rule.”",
      "With your supervisor: When raising concerns, include a bright spot: pair a problem with one thing that’s going well on your unit.",
    ],
  },
};

const MOTIV_INFO = {
  Growth: {
    title: "Growth",
    desc:
      "As an Elmcrest Program Supervisor, Growth motivation means you’re energized by developing yourself, your Shift Supervisors, your YDPs, and even the youth. You want to keep learning and improving how the program runs.",
    fuels: [
      "Clear development opportunities for you and your direct reports (trainings, new responsibilities, leading initiatives).",
      "Regular feedback from your supervisor that helps you refine how you lead staff and support youth.",
      "Stretch assignments that let you test new approaches on the floor in a supported way, not sink-or-swim.",
    ],
  },
  Purpose: {
    title: "Purpose",
    desc:
      "As an Elmcrest Program Supervisor, Purpose motivation means you are deeply driven by what is right for kids and families. You care that policies, routines, and decisions reflect Elmcrest’s values, not just compliance.",
    fuels: [
      "Seeing a clear connection between your daily decisions and the safety, dignity, and growth of youth.",
      "Honest conversations with your supervisor about ethical tensions, trade-offs, and systemic barriers.",
      "Being involved in shaping practices or initiatives that make care more trauma-informed, equitable, or humane.",
    ],
  },
  Connection: {
    title: "Connection",
    desc:
      "As an Elmcrest Program Supervisor, Connection motivation means you do your best work when relationships are strong. You care about the climate among Shift Supervisors, YDPs, and youth—and you feel disruptions to that climate deeply.",
    fuels: [
      "Regular, relational check-ins with your supervisor, not just task updates.",
      "Time and space to build trust with Shift Supervisors and YDPs so you’re not only interacting around crises.",
      "Team moments that reinforce “we’re in this together,” like huddles, debriefs, and shared celebrations.",
    ],
  },
  Achievement: {
    title: "Achievement",
    desc:
      "As an Elmcrest Program Supervisor, Achievement motivation means you are energized by clear goals and visible progress—fewer incidents, better documentation, improved routines, and stronger outcomes for youth and staff.",
    fuels: [
      "Specific, realistic targets around coverage, documentation, incidents, or youth goals, with a clear ‘why’ behind them.",
      "Data or simple tracking tools that show progress over time at the unit or program level.",
      "Recognition from leadership when you and your team hit important milestones, not just attention when something goes wrong.",
    ],
  },
};

/************ COMBINATIONS: COMM-ONLY & MOTIVATION-ONLY ***********/
const COMM_COMBOS = {
  "Director-Encourager": {
    label: "Director + Encourager",
    summary:
      "You blend decisive, crisis-ready leadership (Director) with energizing, hopeful communication (Encourager). You’re likely to set direction quickly and then rally people to move with you.",
    howOthersExperience: [
      "Shift Supervisors may appreciate that you make decisions and also hype them up, but some may feel like they have to keep up with your pace even when they’re exhausted.",
      "YDPs may see you as inspiring and charismatic, but they might not always feel safe disagreeing with you once you’ve “sold” a plan with enthusiasm.",
      "Youth can experience you as strong and confident with a big presence—this can be regulating for some, and intimidating for others who need more quiet space.",
      "Your supervisor may view you as a go-to driver for new initiatives, especially when something needs both momentum and buy-in from staff.",
    ],
    stretch: [
      "Before finalizing a decision, ask Shift Supervisors: “What are we not seeing from the floor?” and genuinely pause to listen.",
      "With YDPs, slow down after a pep talk and clarify: “What questions or concerns do you still have before we roll this out?”",
      "With youth, balance your big energy with moments of quiet, one-to-one check-ins where they get more room to talk.",
      "With your supervisor, name the operational risk of moving fast: “We can do this quickly if we also build in these supports or guardrails.”",
    ],
  },
  "Director-Facilitator": {
    label: "Director + Facilitator",
    summary:
      "You combine a bias for action (Director) with a genuine desire to keep relationships steady (Facilitator). You want things to move, but you also care how people feel along the way.",
    howOthersExperience: [
      "Shift Supervisors may experience you as fair and decisive—they know you will act, but they also feel you’ve heard them first.",
      "YDPs may see you as approachable but also clearly in charge, which can build trust if you’re consistent.",
      "Youth may feel that you’re firm but not reactive; you can be “the adult in the room” who keeps things calm while making necessary calls.",
      "Your supervisor may rely on you to implement tough decisions in a way that doesn’t blow up staff relationships.",
    ],
    stretch: [
      "When you notice yourself hesitating to make a hard call to keep everyone happy, ask: “What decision best protects youth and staff in the long term?”",
      "With Shift Supervisors, be explicit about decisions that aren’t negotiable vs. where you really want their input.",
      "With YDPs, after facilitating a conversation, end with clear follow-through: “Here’s what we’re actually going to do, starting next shift.”",
      "With your supervisor, be honest about any emotional load you’re carrying from trying to smooth everything out for everyone.",
    ],
  },
  "Director-Tracker": {
    label: "Director + Tracker",
    summary:
      "You pair urgency and decisiveness (Director) with a strong focus on detail and procedure (Tracker). You push for high standards and clear accountability.",
    howOthersExperience: [
      "Shift Supervisors may feel they always need to be fully prepared with facts and documentation before coming to you, which can be helpful for quality but intimidating for new leaders.",
      "YDPs might appreciate that expectations are crystal clear, but some may experience you as strict or hard to please.",
      "Youth may experience you as very structured and firm; they may feel safest when things are predictable, but some may struggle with your low tolerance for chaos.",
      "Your supervisor may trust you deeply on audits, incidents, and follow-through because you rarely let details slide.",
    ],
    stretch: [
      "With Shift Supervisors, explicitly allow early-warning conversations: “You don’t have to have all the answers before you tell me something’s off.”",
      "With YDPs, balance corrective feedback with specific recognition when they improve even slightly on documentation or routines.",
      "With youth, try occasionally naming the “why” behind structure in simple, human language: “This schedule is here so you know what to expect. Surprises can be scary.”",
      "With your supervisor, periodically highlight where strict standards are helping kids AND where they might be creating burnout or fear for staff.",
    ],
  },
  "Encourager-Director": {
    label: "Encourager + Director",
    summary:
      "You lead with enthusiasm and vision (Encourager) and then back it up with decisive follow-through (Director). You’re often seen as a charismatic driver of change.",
    howOthersExperience: [
      "Shift Supervisors may feel energized by your belief in them but can feel pressured to keep saying yes to new ideas.",
      "YDPs may love your positivity but feel blindsided if a friendly conversation suddenly turns into a firm directive without much warning.",
      "Youth may experience you as fun and engaging when things are going well and very strong-willed when boundaries are crossed.",
      "Your supervisor may see you as someone who can “sell” a plan to your team and then actually get it done.",
    ],
    stretch: [
      "With Shift Supervisors, create explicit space to say no or negotiate capacity: “If this feels like too much right now, tell me and we’ll prioritize.”",
      "With YDPs, clearly differentiate between “I’m just brainstorming” and “This is the plan we’re committing to.”",
      "With youth, use your warmth first, then your firmness: “I care about you, and that’s why this boundary is still a hard no.”",
      "With your supervisor, share not just the enthusiasm around initiatives but also realistic limits of your and your team’s bandwidth.",
    ],
  },
  "Encourager-Facilitator": {
    label: "Encourager + Facilitator",
    summary:
      "You are relational, inclusive, and positive. You pay attention to how people feel and you want the team and the youth to feel seen and supported.",
    howOthersExperience: [
      "Shift Supervisors often experience you as someone they can be honest with without fear of being shut down.",
      "YDPs may feel you “get” how hard the work is and appreciate that you see them as people, not just staff.",
      "Youth may experience you as one of the more approachable leaders on campus, someone they can talk to when they’re upset.",
      "Your supervisor may rely on you to support morale and connection when the team is under stress.",
    ],
    stretch: [
      "With Shift Supervisors, when there’s a pattern that needs to change, practice starting with empathy and then naming the behavior clearly and specifically.",
      "With YDPs, resist taking on everyone’s emotional load—offer support, but also help them connect to other resources (EAP, peers, debriefs).",
      "With youth, maintain structure while being caring: “I understand why you’re angry, and I still can’t allow X. Here’s what we can do.”",
      "With your supervisor, clearly state your own needs and boundaries instead of silently absorbing more emotional labor.",
    ],
  },
  "Encourager-Tracker": {
    label: "Encourager + Tracker",
    summary:
      "You combine a warm, people-focused style (Encourager) with a strong respect for structure and detail (Tracker). You help change feel both human and organized.",
    howOthersExperience: [
      "Shift Supervisors may feel both supported and challenged—you cheer them on and you care about the protocols being followed.",
      "YDPs may find you approachable but also clear that expectations around documentation and routines are non-negotiable.",
      "Youth may see you as someone who cares about fun and connection but also means what you say about limits and safety.",
      "Your supervisor may rely on you to help translate policy changes into language and steps that staff actually understand and adopt.",
    ],
    stretch: [
      "With Shift Supervisors, be explicit about what is truly flexible vs. what is not—to avoid confusion between ‘nice to have’ and ‘must do’.",
      "With YDPs, use your encouragement to help them improve on the exact details you need, not just to make them feel better in the moment.",
      "With youth, explain why structure exists in terms of their safety and success, not just “because that’s the rule.”",
      "With your supervisor, name where staff need more time or training to realistically meet the standards you’re reinforcing.",
    ],
  },
  "Facilitator-Director": {
    label: "Facilitator + Director",
    summary:
      "You prefer to listen first and build consensus (Facilitator), but you can step into decisive mode (Director) when needed. You are often a bridge between the team’s input and the necessary action.",
    howOthersExperience: [
      "Shift Supervisors may appreciate that you ask for their perspective and then actually make a call so they’re not stuck in limbo.",
      "YDPs may feel you’re fair and willing to hear their concerns even when the final decision isn’t their first choice.",
      "Youth may experience you as calm and firm, not overly reactive—someone who really hears them and then clearly defines the boundary.",
      "Your supervisor may see you as someone who can “translate” leadership decisions in ways that staff can live with.",
    ],
    stretch: [
      "With Shift Supervisors, name explicitly when you’re shifting from listening mode to decision mode: “I’ve heard the input; here’s the decision we’re going with.”",
      "With YDPs, don’t over-own their reactions; you can care without carrying all of their feelings.",
      "With youth, hold steady when they test your limits, and remind yourself that some pushback is a sign you’re holding needed structure.",
      "With your supervisor, be candid about how much time it takes to bring people along, and where you might need their backing to hold the line.",
    ],
  },
  "Facilitator-Encourager": {
    label: "Facilitator + Encourager",
    summary:
      "You blend a calm, listening posture (Facilitator) with warmth and positivity (Encourager). You help people feel safe and hopeful at the same time.",
    howOthersExperience: [
      "Shift Supervisors may see you as a safe person to bring mistakes or worries to, without fear of being shamed.",
      "YDPs may feel seen and uplifted, especially when the work feels heavy and repetitive.",
      "Youth may experience you as a steady, kind adult who doesn’t give up on them easily.",
      "Your supervisor may rely on you to support morale and connection when the team is under stress.",
    ],
    stretch: [
      "With Shift Supervisors, practice being more direct when standards aren’t met: “I care about you, and this still has to be corrected by Friday.”",
      "With YDPs, avoid cushioning feedback so much that the message becomes unclear—name the behavior change you need.",
      "With youth, you can be kind and clear: “I’m not going anywhere, and that behavior is still not okay here.”",
      "With your supervisor, share not just how others feel but also what concrete support you need in order to keep carrying this emotional work.",
    ],
  },
  "Facilitator-Tracker": {
    label: "Facilitator + Tracker",
    summary:
      "You combine care for people (Facilitator) with care for detail and consistency (Tracker). You create calmer, more predictable environments.",
    howOthersExperience: [
      "Shift Supervisors may feel you’re both supportive and very clear about procedures—it’s safe to ask questions and safe to admit confusion.",
      "YDPs may see you as someone who will take the time to teach them the right way to do things instead of just critiquing.",
      "Youth may experience your units as structured and regulated, with routines that help them know what to expect.",
      "Your supervisor may see you as reliable, steady, and low-drama, especially around audits and compliance work.",
    ],
    stretch: [
      "With Shift Supervisors, be careful not to quietly pick up tasks yourself instead of delegating or addressing performance conversations.",
      "With YDPs, don’t let your desire to avoid conflict stop you from naming unsafe or unhelpful patterns when you see them.",
      "With youth, remember that some flexibility can be regulating too—look for safe places to say yes when you can.",
      "With your supervisor, name where constant last-minute changes from above make it harder to deliver quality and stability on the floor.",
    ],
  },
  "Tracker-Director": {
    label: "Tracker + Director",
    summary:
      "You lead with structure and detail (Tracker), then act decisively (Director). You want plans to be sound and aligned before you move.",
    howOthersExperience: [
      "Shift Supervisors may feel very clear on expectations, but also like they need to come to you with their homework done.",
      "YDPs may appreciate the order you bring, but some may feel anxious about making mistakes around you.",
      "Youth may experience your programs as tightly run, with less room for chaos, which can be very regulating for some and frustrating for others.",
      "Your supervisor may depend on you for consistent follow-through when something really matters for safety or compliance.",
    ],
    stretch: [
      "With Shift Supervisors, occasionally invite rough drafts: “Bring me your early thoughts, not just the final proposal.”",
      "With YDPs, show that learning is expected: “Getting it wrong the first few times is part of learning—what matters is adjusting.”",
      "With youth, try small moments of flexibility inside your structure so they experience you as human, not just rule-enforcing.",
      "With your supervisor, name where your high standards are working and where they may be driving staff stress beyond what’s sustainable.",
    ],
  },
  "Tracker-Encourager": {
    label: "Tracker + Encourager",
    summary:
      "You balance a love of accuracy and process (Tracker) with relational energy (Encourager). You help people feel taken care of and guided, not just policed.",
    howOthersExperience: [
      "Shift Supervisors may feel you’re both approachable and organized—they can talk through issues and then leave with a concrete plan.",
      "YDPs may feel that you notice their efforts and also help them correct mistakes in a way that doesn’t feel shaming.",
      "Youth may experience you as consistent but not cold; you remember details about them and follow through on what you say.",
      "Your supervisor may see you as someone who can roll out new protocols in a way that people actually adopt because they feel supported.",
    ],
    stretch: [
      "With Shift Supervisors, clarify where they truly own decisions vs. where you need to be consulted, so they don’t become over-dependent.",
      "With YDPs, don’t hide your standards behind niceness—being clear is an act of support.",
      "With youth, be careful not to overpromise when you’re excited to help; be honest about what you can and can’t do.",
      "With your supervisor, highlight how much relational work you’re doing in addition to the procedural work, so it’s seen and valued.",
    ],
  },
  "Tracker-Facilitator": {
    label: "Tracker + Facilitator",
    summary:
      "You bring order and calm together. You like clear plans, and you also want people to feel safe and supported within those plans.",
    howOthersExperience: [
      "Shift Supervisors may feel they can trust your word—if you say you’ll do something or follow up, you do.",
      "YDPs may see you as steady and consistent, a leader who doesn’t swing wildly based on mood.",
      "Youth may experience your units as predictable in a way that feels safe, especially for kids with trauma histories.",
      "Your supervisor may rarely worry about your paperwork or follow-through, because you keep things tight and stable.",
    ],
    stretch: [
      "With Shift Supervisors, watch for signs you’re quietly absorbing tasks they should own; invite them into shared problem-solving instead.",
      "With YDPs, practice direct feedback when standards aren’t met, even if it feels uncomfortable.",
      "With youth, remember to make relational deposits, not just structural ones—short, human moments go a long way.",
      "With your supervisor, don’t undersell your impact—your quiet consistency keeps a lot from falling apart.",
    ],
  },
};

const MOTIV_COMBOS = {
  "Growth-Purpose": {
    label: "Growth + Purpose",
    summary:
      "You’re fueled by learning and development that clearly connects to the mission of serving youth well. You want to get better in ways that actually matter for kids and families.",
    whatThisMeans: [
      "You’re likely to seek out trainings, coaching, or new responsibilities that directly improve care or staff support on your units.",
      "You may feel drained if you’re learning skills that feel disconnected from the realities of Elmcrest or the needs of your youth.",
      "You care not just about your own growth, but about creating a better environment for Shift Supervisors, YDPs, and youth.",
    ],
    tryThis: [
      "Ask your supervisor for development goals that explicitly tie to youth outcomes (e.g., fewer incidents, better transitions, improved family engagement).",
      "Invite Shift Supervisors into learning with you—co-attend a training and then co-design small changes on the floor.",
      "When you feel stuck in bureaucracy, reconnect with a specific youth or success story to remind yourself why your growth matters.",
    ],
  },
  "Growth-Connection": {
    label: "Growth + Connection",
    summary:
      "You grow best in community. You’re energized when you’re learning with and from others, not just from a manual or an online course.",
    whatThisMeans: [
      "You’re likely to light up when you’re in a room with other supervisors, sharing strategies and lessons learned.",
      "You may feel discouraged if you’re left to figure everything out alone without peers to process with.",
      "You probably enjoy developing Shift Supervisors and YDPs and watching them step into more skill and confidence.",
    ],
    tryThis: [
      "Form a small peer group of Program Supervisors to debrief tough cases and share what’s working in your cottages or programs.",
      "Build structured learning moments into your supervision with Shift Supervisors: “What’s one thing you’d like to get better at this month?”",
      "Ask your supervisor if you can occasionally shadow or partner with another leader whose approach you admire.",
    ],
  },
  "Growth-Achievement": {
    label: "Growth + Achievement",
    summary:
      "You’re driven to get better and to see concrete evidence that your growth is making a difference. You like to track progress.",
    whatThisMeans: [
      "You’re likely to set improvement goals for yourself and your program (incidents, documentation quality, staff retention).",
      "You may get restless or discouraged if you don’t see clear movement, even when change is happening slowly under the surface.",
      "You often turn feedback into action quickly and expect others to do the same.",
    ],
    tryThis: [
      "Pick 2–3 key metrics that matter most to youth safety and staff sustainability, and track them simply month-to-month.",
      "Share improvement stories with your team so they see how their growth is tied to better results for kids.",
      "Ask your supervisor to help you differentiate between what’s in your control and what is system-level, so you don’t over-own everything.",
    ],
  },
  "Purpose-Growth": {
    label: "Purpose + Growth",
    summary:
      "You’re guided by values and want to keep expanding your capacity to live those values out as a supervisor and leader.",
    whatThisMeans: [
      "You’re drawn to learning that helps you advocate better for youth, families, and staff—especially around trauma, equity, and ethics.",
      "You may feel especially discouraged when you see systemic barriers getting in the way of what you believe is right.",
      "You often hold yourself to a high internal standard about how you treat people across power differences (youth, YDPs, peers, leadership).",
    ],
    tryThis: [
      "Name your top 3 values as a supervisor (e.g., safety, dignity, growth) and share them with your Shift Supervisors.",
      "Ask your supervisor to support you in development experiences that align with those values (trauma-informed leadership, DEI, restorative practices).",
      "When you run into system limits, ask: “What’s one small thing I can still do here that reflects my values?”",
    ],
  },
  "Purpose-Connection": {
    label: "Purpose + Connection",
    summary:
      "You are most alive when strong relationships and meaningful work intersect. You care deeply about how people are treated in the system.",
    whatThisMeans: [
      "You notice when YDPs or Shift Supervisors feel invisible, unheard, or unfairly treated—and it bothers you.",
      "You may feel torn when leadership decisions seem misaligned with what feels right for youth or staff.",
      "You can be a powerful voice for culture, reminding people why Elmcrest exists and how we want to treat each other.",
    ],
    tryThis: [
      "Create small, consistent rituals of appreciation for YDPs and Shift Supervisors that connect back to mission (e.g., “Here’s how your work impacted this youth this week”).",
      "In 1:1s, ask staff: “Where are we acting in line with our values? Where are we drifting?” and bring themes (not names) to your supervisor.",
      "Protect time each month to reconnect with mission—through a story, a youth note, or reflecting on a moment that reminded you why you’re here.",
    ],
  },
  "Purpose-Achievement": {
    label: "Purpose + Achievement",
    summary:
      "You want to accomplish things that matter. It’s not enough to hit numbers—you need to know that those numbers reflect real, meaningful change for youth and staff.",
    whatThisMeans: [
      "You’re motivated by goals that clearly connect to kids’ safety, healing, or long-term success.",
      "You may struggle with tasks that feel like “checking boxes” without real impact.",
      "You likely think a lot about whether Elmcrest is living up to what it says it is about.",
    ],
    tryThis: [
      "Work with your supervisor to define a few goals that are both measurable and clearly tied to youth well-being or staff sustainability.",
      "When given a task that feels purely bureaucratic, ask: “How can I connect this to something that genuinely matters for the kids or staff?”",
      "Share stories upward about how certain metrics reflect real change (or don’t), so leadership sees beyond the numbers.",
    ],
  },
  "Connection-Growth": {
    label: "Connection + Growth",
    summary:
      "You develop best when you feel part of a supportive team. Belonging and learning go hand-in-hand for you.",
    whatThisMeans: [
      "You’re energized by supervision, huddles, and team spaces where people are honest and curious together.",
      "Isolation or lack of relational support can quickly drain your motivation to try new things.",
      "You often bring others along in your learning—sharing resources, modeling vulnerability, and asking good questions.",
    ],
    tryThis: [
      "Ask your supervisor for a regular reflective space, not just task-focused check-ins.",
      "Turn unit challenges into shared learning projects with Shift Supervisors and YDPs (e.g., “How can we improve transitions together?”).",
      "Identify one peer who can be a thought-partner for you, and commit to a monthly check-in about leadership growth.",
    ],
  },
  "Connection-Purpose": {
    label: "Connection + Purpose",
    summary:
      "You are fueled by relationships that are anchored in shared values. Community and cause both matter deeply to you.",
    whatThisMeans: [
      "You’re highly sensitive to whether the climate in your program feels respectful, inclusive, and aligned with Elmcrest’s mission.",
      "You may feel particularly distressed when you see youth or staff being treated in ways that feel misaligned with your values.",
      "You can be a powerful connector across roles—youth, YDPs, Shift Supervisors, leadership—because you care about all of their experiences.",
    ],
    tryThis: [
      "Use team meetings to connect everyday tasks to the bigger purpose: “Here’s how what we did this week mattered for our youth.”",
      "Bring value and climate concerns to your supervisor with curiosity: “Here’s what I’m noticing—can we think together about it?”",
      "Create small practices that reinforce dignity (e.g., how youth are greeted, how staff are spoken to during stress).",
    ],
  },
  "Connection-Achievement": {
    label: "Connection + Achievement",
    summary:
      "You care about reaching goals together. Shared wins and mutual support are more energizing to you than solo success.",
    whatThisMeans: [
      "You’re motivated by seeing your whole team succeed, not just being the one “star” supervisor.",
      "You may feel discouraged if recognition or pressure is placed only on you, without including your Shift Supervisors and YDPs.",
      "You think strategically about who needs what role so the team can function well as a whole.",
    ],
    tryThis: [
      "Design goals that explicitly name team contributions (e.g., “This outcome depends on how we all handle transitions and documentation”).",
      "Celebrate team progress out loud and often—highlighting how different people contributed to a win.",
      "Ask your supervisor to recognize your unit’s collective efforts, not just your own leadership, whenever possible.",
    ],
  },
  "Achievement-Growth": {
    label: "Achievement + Growth",
    summary:
      "You’re hungry to accomplish meaningful things and keep leveling up your leadership. You see yourself as a work in progress with high standards.",
    whatThisMeans: [
      "You may set ambitious expectations for yourself and feel frustrated when you don’t meet them quickly.",
      "You like clear indicators that your effort is making a difference for youth and staff.",
      "You may also expect a lot from your Shift Supervisors and YDPs in terms of performance and improvement.",
    ],
    tryThis: [
      "Work with your supervisor to define realistic pacing so you’re not burning yourself (or your team) out chasing constant improvement.",
      "When YDPs or Shift Supervisors fall short, see it as data for coaching rather than proof they don’t care.",
      "Track growth not just in outcomes, but in skills—for you and your team (e.g., “We de-escalated without restraint X more times this month”).",
    ],
  },
  "Achievement-Purpose": {
    label: "Achievement + Purpose",
    summary:
      "You want to hit targets that genuinely matter and feel right. The “what” and the “why” both have to line up for you.",
    whatThisMeans: [
      "You’re motivated when your goals align with safety, healing, and justice for youth and fairness for staff.",
      "You may resist or emotionally disengage from goals that feel performative or disconnected from kids’ real needs.",
      "You likely push yourself to do the right thing, even when no one is watching.",
    ],
    tryThis: [
      "Ask your supervisor to connect new initiatives or metrics explicitly to how they support youth and staff well-being.",
      "When you feel a goal is misaligned, bring it forward with respect: “Help me understand how this supports our kids and staff.”",
      "Notice and name when goals DO reflect your values, so you don’t only focus on misalignments.",
    ],
  },
  "Achievement-Connection": {
    label: "Achievement + Connection",
    summary:
      "You’re driven to succeed in ways that include and uplift others. You want the unit to do well, not just yourself.",
    whatThisMeans: [
      "You often think about how to set up Shift Supervisors and YDPs to win, not just how to carry things yourself.",
      "You may become frustrated if team recognition is rare, or if only negative outcomes are named.",
      "You look for ways to align tasks with people’s strengths so the team can excel together.",
    ],
    tryThis: [
      "In supervision, talk with your Shift Supervisors about what “winning as a team” looks like on your program (e.g., fewer call-offs, smoother transitions, better communication).",
      "Intentionally match YDPs to roles or routines that fit their strengths, and tell them you see it.",
      "Ask your supervisor to help build in visible moments where your unit’s collective efforts are noticed and appreciated.",
    ],
  },
};

/*************** COMMUNICATION × MOTIVATION COMBOS ***********/
const COMM_MOTIV_COMBOS = {
  "Director-Growth": {
    label: "Director + Growth",
    summary:
      "You lead with clear direction and you’re hungry to improve. You want your units to run well, and you want to keep leveling up how you and your team support youth.",
    strengths: [
      "You’re quick to turn new learning into concrete changes on the floor.",
      "Shift Supervisors know you will make decisions and also refine those decisions as you learn more.",
      "YDPs benefit from your desire to coach them into stronger practice, not just tell them what to do.",
      "Clinicians and leadership can count on you to actually implement new strategies instead of letting them sit on paper.",
    ],
    watchOuts: [
      "You may move faster than some staff can realistically integrate new practices.",
      "Less confident YDPs might feel like they’re always “behind” your expectations.",
      "In crisis, you might default to control before curiosity if you’re feeling pressure to “do it right.”",
    ],
    supportIdeas: [
      "Ask your supervisor for a small number of focused growth projects at a time instead of trying to improve everything at once.",
      "Co-design one development goal with each Shift Supervisor that feels stretching but achievable.",
      "Use huddles to introduce one practice at a time rather than rolling out multiple changes at once.",
    ],
    coachingQuestions: [
      "Where do I see the biggest opportunity for growth in my program this month?",
      "What’s one way I can slow down enough for YDPs to actually practice a new skill instead of just hear about it?",
      "How can I bring clinical insight into my next coaching conversation with a Shift Supervisor?",
    ],
  },
  "Director-Purpose": {
    label: "Director + Purpose",
    summary:
      "You are driven to make clear, firm decisions that align with your values and with what’s right for youth and staff. You care not just about order, but about justice and integrity.",
    strengths: [
      "You advocate strongly when you believe something is not in the best interest of a youth or your staff.",
      "You’re willing to hold boundaries even when they’re unpopular, if they protect safety or dignity.",
      "Shift Supervisors see you as someone who stands for something, not just someone who enforces rules.",
      "Clinicians can trust you to protect treatment integrity even when things get messy.",
    ],
    watchOuts: [
      "You may experience intense frustration when the system feels misaligned with your values.",
      "You can come across as inflexible when you’re trying to protect what matters most.",
      "Youth may sometimes feel you are “too strict” if they don’t know the why behind your decisions.",
    ],
    supportIdeas: [
      "Share your top 2–3 core values with your supervisor and Shift Supervisors so they understand what guides your decisions.",
      "Ask clinicians to help you translate your values into trauma-informed responses in difficult situations.",
      "Name the values behind limits with youth in simple language (safety, respect, fairness).",
    ],
    coachingQuestions: [
      "Where do my values feel most aligned with how things are run right now?",
      "Where do I feel tension between what I believe is right and what the system expects?",
      "What is one small, concrete step I can take this week to move something in the direction of my values?",
    ],
  },
  "Director-Connection": {
    label: "Director + Connection",
    summary:
      "You want the team to feel connected and supported, and you also want clear direction. You’re trying to balance being the strong leader and the relational one.",
    strengths: [
      "You care about how your decisions land on your staff, not just whether they’re followed.",
      "You can be a powerful anchor in crises while still checking in on how YDPs are coping afterward.",
      "Youth may feel you are firm but not distant when you intentionally show care in small ways.",
      "Shift Supervisors know you’re invested in the team, not just the tasks.",
    ],
    watchOuts: [
      "You may hold back on hard conversations to avoid straining relationships.",
      "You might feel pulled between enforcing expectations and wanting everyone to like you.",
      "If you’re tired, you may swing between “all business” and “all connection” instead of integrating both.",
    ],
    supportIdeas: [
      "Script a few go-to phrases that are both firm and relational (e.g., “I care about you and I also need…”).",
      "Use check-ins to ask Shift Supervisors, “How are you doing, and what do you need from me to be successful?”",
      "Schedule short relational touchpoints with YDPs on tough weeks, even if it’s just a 2-minute hallway check-in.",
    ],
    coachingQuestions: [
      "Where am I avoiding direct feedback because I’m worried about how someone will feel?",
      "How can I show care and still hold a strong boundary in my next difficult conversation?",
      "What helps me stay connected to my team when I also have to say hard things?",
    ],
  },
  "Director-Achievement": {
    label: "Director + Achievement",
    summary:
      "You’re results-focused and decisive. You want to see tangible improvements in safety, documentation, routines, and outcomes, and you’re willing to take charge to get there.",
    strengths: [
      "You’re likely to set clear goals and follow up consistently.",
      "You help staff understand what success looks like in a very practical way.",
      "Youth benefit from your commitment to structure and follow-through.",
      "Leadership can count on you to move key metrics in the right direction when you have the tools you need.",
    ],
    watchOuts: [
      "You may accidentally treat complex, trauma-driven behavior as a problem to solve quickly instead of a process to support.",
      "YDPs may feel like they’re under a microscope if the focus on goals isn’t balanced with support.",
      "You might judge yourself harshly when progress is slower than you’d like.",
    ],
    supportIdeas: [
      "Partner with clinicians to define realistic pacing for youth progress and staff learning.",
      "Set process goals (e.g., “We’ll debrief every major incident”) not just outcome goals (e.g., “Fewer incidents”).",
      "Regularly celebrate incremental gains with your team so the work doesn’t feel like endless pressure.",
    ],
    coachingQuestions: [
      "Which of my goals are fully in my control, and which depend on systems beyond me?",
      "What does “realistic progress” look like for my team and youth this month?",
      "How can I make sure my drive for results feels supportive, not punitive, to my staff?",
    ],
  },
  "Encourager-Growth": {
    label: "Encourager + Growth",
    summary:
      "You love helping people grow. You bring energy, hope, and a belief that staff and youth can change, and you want to keep learning how to support that change.",
    strengths: [
      "You’re a natural mentor for newer YDPs who need encouragement and feedback.",
      "Youth feel your belief in them, which can be deeply regulating in a clinical environment.",
      "Shift Supervisors experience you as someone who invests in their development.",
      "You’re often up for learning new trauma-informed practices and trying them on the floor.",
    ],
    watchOuts: [
      "You may overcommit your time and emotional energy when many people need you.",
      "You might avoid giving sharper feedback because you don’t want to discourage someone.",
      "You can feel deeply discouraged when youth or staff don’t “take up” the growth you see for them.",
    ],
    supportIdeas: [
      "Choose a small number of people to invest in deeply at any given time, so you don’t spread yourself too thin.",
      "Pair encouragement with one specific growth target in coaching conversations.",
      "Ask your supervisor for clear expectations so your growth efforts stay focused.",
    ],
    coachingQuestions: [
      "Who am I pouring most of my energy into right now, and is that sustainable?",
      "How can I name growth honestly without minimizing ongoing challenges?",
      "What helps me keep believing in people without taking responsibility for their choices?",
    ],
  },
  "Encourager-Purpose": {
    label: "Encourager + Purpose",
    summary:
      "You are fueled by connection and meaning. You want youth and staff to feel valued, respected, and aligned with Elmcrest’s mission.",
    strengths: [
      "You keep the “why” of the work alive when others are exhausted.",
      "You often catch when staff or youth feel unseen or unheard and make space for them.",
      "You can help translate clinical language into human, mission-centered terms.",
      "Shift Supervisors may feel safe bringing value conflicts or moral distress to you.",
    ],
    watchOuts: [
      "You can carry a lot of emotional weight when the system doesn’t reflect your values.",
      "You may struggle to enforce consequences when you empathize strongly with someone’s story.",
      "You can be heartbroken by youth outcomes in ways that are hard to talk about.",
    ],
    supportIdeas: [
      "Schedule regular debriefs with your supervisor or a trusted peer to process emotional load.",
      "Use values-based language when holding accountability (“Because safety matters, we have to…”).",
      "When you see misalignment with values, bring it forward as curiosity, not accusation.",
    ],
    coachingQuestions: [
      "Where do I feel my values most honored in this role?",
      "Where do I need more support to stay aligned with what I believe is right?",
      "What practices help me refill my emotional cup so I can keep showing up with heart?",
    ],
  },
  "Encourager-Connection": {
    label: "Encourager + Connection",
    summary:
      "You are a community builder. You thrive on strong relationships, shared energy, and a sense of “we’re in this together.”",
    strengths: [
      "You make staff feel less alone in hard work.",
      "You help youth experience adults as approachable, kind, and on their side.",
      "Shift Supervisors often see you as someone who can bring the team together after conflict.",
      "You naturally create a sense of belonging in meetings and huddles.",
    ],
    watchOuts: [
      "You may avoid addressing harmful behavior (youth or staff) because you fear losing connection.",
      "You can take interpersonal tension very personally.",
      "In a highly clinical setting, you might sometimes prioritize harmony over necessary change.",
    ],
    supportIdeas: [
      "Practice scripts that connect and correct at the same time (“I care about you and I need to be honest about…”).",
      "Ask a colleague or supervisor to help you plan for especially hard conversations in advance.",
      "Remember that drawing boundaries is a form of care, especially in trauma-informed environments.",
    ],
    coachingQuestions: [
      "Where am I holding back hard feedback to keep the peace?",
      "How can I protect connection while being truthful about what needs to change?",
      "What does healthy conflict look like in my team when it’s done well?",
    ],
  },
  "Encourager-Achievement": {
    label: "Encourager + Achievement",
    summary:
      "You want people to feel good and do well. You’re motivated when your encouragement translates into real, visible progress.",
    strengths: [
      "You celebrate wins in ways that boost morale.",
      "You’re often the one who notices and names growth in youth or staff.",
      "You can make goals feel inspiring instead of threatening.",
      "Shift Supervisors may feel energized to try new strategies because you believe they can succeed.",
    ],
    watchOuts: [
      "You might push too hard on people’s “potential” when they’re actually at capacity.",
      "You can feel personally disappointed when goals aren’t met, as if you failed them.",
      "You may focus on “big wins” and forget to honor slow, quiet, clinical progress.",
    ],
    supportIdeas: [
      "Work with clinicians to define what realistic progress looks like for particular youth or staff.",
      "Build in micro-celebrations for small steps, not just end results.",
      "Name effort and process, not only outcomes, when you encourage.",
    ],
    coachingQuestions: [
      "Whose progress am I most excited about right now, and is my excitement matched by their readiness?",
      "Where do I need to lower the bar to something that is still meaningful but more realistic?",
      "How can I stay hopeful without tying my worth to other people’s outcomes?",
    ],
  },
  "Facilitator-Growth": {
    label: "Facilitator + Growth",
    summary:
      "You create calm space and you want that space to help people grow. You’re patient, reflective, and interested in helping staff and youth develop over time.",
    strengths: [
      "You’re excellent at reflective supervision with Shift Supervisors and YDPs.",
      "Youth feel safe enough with you to open up, especially when they’re not ready for intensity.",
      "You are good at pacing change so it’s sustainable.",
      "Clinicians may see you as a strong partner for implementing relational aspects of treatment.",
    ],
    watchOuts: [
      "You might avoid setting sharper expectations in the name of being gentle.",
      "You can underestimate how much structure some youth and staff actually need to grow.",
      "You may overthink instead of taking a necessary decisive step.",
    ],
    supportIdeas: [
      "Practice naming both care and expectations in the same sentence.",
      "Ask your supervisor for clarity on non-negotiables so you feel confident enforcing them.",
      "Break growth steps into very small, concrete actions so they feel manageable.",
    ],
    coachingQuestions: [
      "Where am I holding back on naming a needed change, and what’s the cost?",
      "How can I keep my steady, calm presence while being more direct where it’s needed?",
      "What does “kind and firm” look like for me in the next tough conversation?",
    ],
  },
  "Facilitator-Purpose": {
    label: "Facilitator + Purpose",
    summary:
      "You’re a steady presence with a deep sense of what’s right. You care about emotional safety and ethical practice in a very grounded way.",
    strengths: [
      "You help maintain a climate where youth and staff feel respected.",
      "You can hold space for hard feelings without quickly fixing or dismissing them.",
      "You support value-based, trauma-informed decisions on the floor.",
      "Shift Supervisors may see you as a moral anchor when things feel messy.",
    ],
    watchOuts: [
      "You may quietly carry moral distress without voicing it.",
      "You might stay neutral too long when a strong stance is needed.",
      "You can feel stuck when leadership decisions don’t align with your internal compass.",
    ],
    supportIdeas: [
      "Use supervision to talk explicitly about moral tension and values.",
      "When something feels “off,” bring it forward gently but clearly.",
      "Remember that calmly naming a concern is often a powerful leadership act.",
    ],
    coachingQuestions: [
      "Where do my values feel well-supported here?",
      "What is one value-based concern I’ve been holding onto silently?",
      "What is one brave but respectful sentence I could say about it?",
    ],
  },
  "Facilitator-Connection": {
    label: "Facilitator + Connection",
    summary:
      "You are the calm, relational glue. You make it easier for people to stay in the work and not shut down or blow up.",
    strengths: [
      "You help YDPs feel understood when they’re overwhelmed.",
      "You de-escalate youth by staying steady and non-threatening.",
      "You foster a climate where it’s okay to ask for help.",
      "Shift Supervisors may lean on you as a quiet stabilizer.",
    ],
    watchOuts: [
      "You may quietly absorb emotional labor without recognition.",
      "You can struggle to set limits with staff who repeatedly underperform.",
      "You may stay in listening mode when a clear decision is needed.",
    ],
    supportIdeas: [
      "Ask your supervisor to help you script accountability conversations that still feel kind.",
      "Set boundaries on when and how staff can bring you emotional processing, so you don’t burn out.",
      "Name your stabilizing role in the team as real leadership, not “just being nice.”",
    ],
    coachingQuestions: [
      "Where am I saying yes emotionally when I’m actually at capacity?",
      "What boundaries would make my calm presence more sustainable?",
      "How can I bring my quiet influence more into decision-making spaces?",
    ],
  },
  "Facilitator-Achievement": {
    label: "Facilitator + Achievement",
    summary:
      "You’re steady and gentle, and you also care about getting things done. You want progress, but you don’t want to crush people in the process.",
    strengths: [
      "You pace goals realistically and sensitively.",
      "You help staff understand that improvement is a journey, not a flip of a switch.",
      "Youth benefit from your patience as they make uneven progress.",
      "You can bring a calm, structured approach to moving key metrics.",
    ],
    watchOuts: [
      "You might apologize for pushing on important expectations.",
      "You may quietly carry frustration when others aren’t following through.",
      "You can under-communicate your own desire for stronger performance.",
    ],
    supportIdeas: [
      "Practice saying, “I care about you, and this expectation is really important for youth safety.”",
      "Use very clear, simple follow-ups so people know you mean it when you set a goal.",
      "Ask for feedback on how you’re balancing kindness and accountability.",
    ],
    coachingQuestions: [
      "Where do I wish I was holding a firmer line?",
      "What would it look like to increase clarity without increasing harshness?",
      "How can I honor small progress while still calling people to more?",
    ],
  },
  "Tracker-Growth": {
    label: "Tracker + Growth",
    summary:
      "You love accurate information and steady improvement. You want systems, documentation, and practice to keep getting better.",
    strengths: [
      "You notice patterns in incidents and help the team learn from them.",
      "You keep clinical documentation tight, which supports good treatment.",
      "Shift Supervisors know you will help them improve their processes, not just criticize them.",
      "Clinicians appreciate your attention to detail in implementing plans.",
    ],
    watchOuts: [
      "You may get frustrated when others don’t seem to care about details as much as you do.",
      "You can over-focus on refining systems at the expense of relationships.",
      "In fast-moving crises, you might hesitate while you think through the “right” response.",
    ],
    supportIdeas: [
      "Pick a few key processes to improve each quarter instead of tackling everything at once.",
      "Pair each process change with one relational or team-building action.",
      "Ask your supervisor or a trusted peer to push you gently toward action when you’re overthinking.",
    ],
    coachingQuestions: [
      "What is the smallest meaningful system improvement I can make right now?",
      "Where could I simplify instead of adding more steps?",
      "How can I invite staff into co-owning improvements so it’s not just me pushing quality?",
    ],
  },
  "Tracker-Purpose": {
    label: "Tracker + Purpose",
    summary:
      "You want things done right because you believe it matters for kids and staff. Your standards come from a deep sense of responsibility.",
    strengths: [
      "You protect youth and staff by ensuring documentation and procedures support ethical, safe care.",
      "You are often the one who notices when something small could become a big risk.",
      "You can translate values like safety and dignity into very concrete practices.",
      "Leaders and clinicians can rely on you for honest, accurate information.",
    ],
    watchOuts: [
      "You may feel intolerant of what looks like carelessness in others.",
      "You can feel personally distressed when policies or shortcuts seem to risk harm.",
      "You may lean on rules when you’re actually feeling morally anxious or upset.",
    ],
    supportIdeas: [
      "Use supervision to process where your sense of responsibility feels heavy.",
      "Share the value-based “why” behind your standards with staff, not just the rule itself.",
      "Ask when it’s okay to relax certain expectations in low-risk situations to protect your own capacity.",
    ],
    coachingQuestions: [
      "Where am I holding responsibility that’s too heavy to carry alone?",
      "How can I turn my sense of duty into coaching instead of criticism?",
      "What helps me stay compassionate when others don’t meet the bar?",
    ],
  },
  "Tracker-Connection": {
    label: "Tracker + Connection",
    summary:
      "You care about getting it right, and you care about people. You want a team that is both competent and cohesive.",
    strengths: [
      "You can give very grounded, specific support to staff—“here’s exactly what to do and why.”",
      "Youth experience your consistency as a kind of safety, especially when they know you’ll do what you say.",
      "Shift Supervisors may feel safe asking you technical questions because you won’t judge them for not knowing.",
      "Your blend of detail and care can make complex clinical expectations feel more manageable.",
    ],
    watchOuts: [
      "You may assume that people know you care even when you’re sounding only technical.",
      "You can become the “go-to” person for everything and slowly burn out.",
      "You might feel caught between your desire for connection and your frustration when others don’t follow through.",
    ],
    supportIdeas: [
      "Add a brief relational check-in before jumping into details (“How are you holding up today?”).",
      "Share tasks and expertise with Shift Supervisors instead of quietly doing things for them.",
      "Ask your supervisor to help you prioritize what truly needs perfection and what can be “good enough.”",
    ],
    coachingQuestions: [
      "Where could I let someone else try and learn, even if it’s not perfect?",
      "How can I show that I see and appreciate people, not just their performance?",
      "What boundaries do I need around being the “dependable one” so I don’t burn out?",
    ],
  },
  "Tracker-Achievement": {
    label: "Tracker + Achievement",
    summary:
      "You want strong results and you believe the path there is good systems and accurate work. You’re motivated by making things run better and seeing that reflected in the numbers.",
    strengths: [
      "You’re strong at tracking incidents, documentation, and key metrics and helping the team adjust based on data.",
      "Shift Supervisors have a clear sense of what “good” looks like when they work with you.",
      "Youth benefit from your insistence on consistent routines and follow-through.",
      "Leadership and clinicians trust your reports and rely on them for decision-making.",
    ],
    watchOuts: [
      "You may feel impatient with staff who struggle to meet your standards.",
      "You can focus so much on accurate reporting that you under-communicate empathy.",
      "You might tie your own sense of success too tightly to whether numbers improve quickly enough.",
    ],
    supportIdeas: [
      "Pair data shares with appreciation (“Here’s what improved, here’s who helped make that happen.”).",
      "Check in with staff about what support they need to meet expectations before tightening accountability.",
      "Ask your supervisor to help you contextualize metrics so you don’t carry them as a personal verdict.",
    ],
    coachingQuestions: [
      "Where can I celebrate progress more, even if we’re not at our target yet?",
      "What support might staff be missing that I’m assuming they already have?",
      "How can I remember that the numbers are information, not my identity?",
    ],
  },
};

/************************** UI SUBCOMPONENTS *****************/
const Pill = ({ label, bg }) => (
  <span
    className="px-3 py-1 text-xs rounded-full font-medium"
    style={{ background: bg || "#e5e7eb", color: "#0f172a" }}
  >
    {label}
  </span>
);

const ScoreBar = ({ label, value, max }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-700">
        <div
          className="h-2 rounded"
          style={{ width: `${pct}%`, background: PRIMARY }}
        />
      </div>
    </div>
  );
};

/************************** MAIN COMPONENT *******************/
export default function App() {
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [submitted, setSubmitted] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);

  const totals = useMemo(() => computeScores(answers), [answers]);

  const totalCommMax = 3 * 5;
  const totalMotivMax = 3 * 5;

  const allAnswered =
    QUESTIONS.every((q) => answers[q.id] !== undefined) &&
    name.trim() &&
    email.trim();

  const communicationQuestions = useMemo(
    () => shuffleArray(QUESTIONS.filter((q) => q.kind === "communication")),
    []
  );
  const motivationQuestions = useMemo(
    () => shuffleArray(QUESTIONS.filter((q) => q.kind === "motivation")),
    []
  );

  const commComboKey = `${totals.primaryComm}-${totals.secondaryComm}`;
  const motivComboKey = `${totals.primaryMotiv}-${totals.secondaryMotiv}`;
  const commCombo = COMM_COMBOS[commComboKey];
  const motivCombo = MOTIV_COMBOS[motivComboKey];

  const commMotivKey = `${totals.primaryComm}-${totals.primaryMotiv}`;
  const commMotivCombo = COMM_MOTIV_COMBOS[commMotivKey];

  const roleLabel = role || "Program Supervisor";

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setCopyStatus(null);

    const payload = {
      timestamp: new Date().toISOString(),
      name,
      email,
      role,
      answers,
      scores: {
        communication: totals.comm,
        motivation: totals.motiv,
        primaryComm: totals.primaryComm,
        secondaryComm: totals.secondaryComm,
        primaryMotiv: totals.primaryMotiv,
        secondaryMotiv: totals.secondaryMotiv,
      },
    };

    if (!GAS_ENDPOINT) {
      setPostStatus("⚠️ Add your Google Apps Script endpoint to enable saving.");
      return;
    }

    try {
      await fetch(GAS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      setPostStatus("✅ Results sent to Google Sheet.");
    } catch (err) {
      console.error("Error saving to Google Sheet:", err);
      setPostStatus(
        "⚠️ We couldn't confirm saving to the Sheet, but your results are still visible below."
      );
    }
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setPostStatus(null);
    setCopyStatus(null);
  }

  function buildSummaryText() {
    const lines = [];

    lines.push("Elmcrest Communication & Motivation Compass – Results");
    lines.push("==================================================");
    lines.push(`Name: ${name || "N/A"}`);
    lines.push(`Email: ${email || "N/A"}`);
    lines.push(`Role: ${roleLabel || "N/A"}`);
    lines.push(`Date: ${new Date().toLocaleString()}`);
    lines.push("");

    // Communication
    lines.push("COMMUNICATION PROFILE");
    lines.push("---------------------");
    lines.push(`Primary style: ${totals.primaryComm}`);
    lines.push(`Secondary style: ${totals.secondaryComm}`);
    lines.push("");

    COMM_KEYS.forEach((k) => {
      lines.push(`- ${k}: ${totals.comm[k]} (out of ${totalCommMax})`);
    });
    lines.push("");

    const primaryCommInfo = COMM_INFO[totals.primaryComm];
    if (primaryCommInfo) {
      lines.push(
        `About your primary style (${primaryCommInfo.title}) in your role as ${roleLabel}:`
      );
      lines.push(roleize(primaryCommInfo.desc, roleLabel));
      lines.push("");
      lines.push("Tips for stretching this style in your Elmcrest role:");
      primaryCommInfo.tips.forEach((t) =>
        lines.push(`• ${roleize(t, roleLabel)}`)
      );
      lines.push("");
    }

    if (commCombo) {
      lines.push(`Primary + Secondary combination: ${commCombo.label}`);
      lines.push(roleize(commCombo.summary, roleLabel));
      lines.push("");
      lines.push("How this often shows up with others:");
      commCombo.howOthersExperience.forEach((t) =>
        lines.push(`• ${roleize(t, roleLabel)}`)
      );
      lines.push("");
      lines.push("Stretch ideas for your communication:");
      commCombo.stretch.forEach((t) =>
        lines.push(`• ${roleize(t, roleLabel)}`)
      );
      lines.push("");
    }

    // Motivation
    lines.push("MOTIVATION PROFILE");
    lines.push("------------------");
    lines.push(`Primary driver: ${totals.primaryMotiv}`);
    lines.push(`Secondary driver: ${totals.secondaryMotiv}`);
    lines.push("");

    MOTIV_KEYS.forEach((k) => {
      lines.push(`- ${k}: ${totals.motiv[k]} (out of ${totalMotivMax})`);
    });
    lines.push("");

    const primaryMotivInfo = MOTIV_INFO[totals.primaryMotiv];
    if (primaryMotivInfo) {
      lines.push(
        `About your primary driver (${primaryMotivInfo.title}) in your role as ${roleLabel}:`
      );
      lines.push(roleize(primaryMotivInfo.desc, roleLabel));
      lines.push("");
      lines.push("This tends to be fueled by:");
      primaryMotivInfo.fuels.forEach((t) =>
        lines.push(`• ${roleize(t, roleLabel)}`)
      );
      lines.push("");
    }

    if (motivCombo) {
      lines.push(`Primary + Secondary combination: ${motivCombo.label}`);
      lines.push(roleize(motivCombo.summary, roleLabel));
      lines.push("");
      lines.push("What this tends to mean:");
      motivCombo.whatThisMeans.forEach((t) =>
        lines.push(`• ${roleize(t, roleLabel)}`)
      );
      lines.push("");
      lines.push("Ideas to better support your motivation:");
      motivCombo.tryThis.forEach((t) =>
        lines.push(`• ${roleize(t, roleLabel)}`)
      );
      lines.push("");
    }

    if (commMotivCombo) {
      lines.push("INTEGRATED PROFILE (Communication × Motivation)");
      lines.push("----------------------------------------------");
      lines.push(
        `${commMotivCombo.label} – ${roleize(
          commMotivCombo.summary,
          roleLabel
        )}`
      );
      lines.push("");
      lines.push("Key strengths in your Elmcrest role:");
      commMotivCombo.strengths.forEach((s) =>
        lines.push(`• ${roleize(s, roleLabel)}`)
      );
      lines.push("");
      lines.push("Important watch-outs to be mindful of:");
      commMotivCombo.watchOuts.forEach((w) =>
        lines.push(`• ${roleize(w, roleLabel)}`)
      );
      lines.push("");
      lines.push("Support ideas and reflection prompts:");
      commMotivCombo.supportIdeas.forEach((s) =>
        lines.push(`• ${roleize(s, roleLabel)}`)
      );
      lines.push("");
      commMotivCombo.coachingQuestions.forEach((q) =>
        lines.push(`? ${roleize(q, roleLabel)}`)
      );
      lines.push("");
    }

    lines.push("End of results.");
    return lines.join("\n");
  }

  async function handleCopySummary() {
    try {
      const text = buildSummaryText();
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyStatus("✅ Summary copied to clipboard.");
      } else {
        window.prompt("Copy your summary:", text);
        setCopyStatus("ℹ️ Copy from the prompt window.");
      }
    } catch (err) {
      setCopyStatus(
        `❌ Could not copy summary: ${
          err && err.message ? err.message : String(err)
        }`
      );
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="w-full border-b bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 backdrop-blur sticky top-0 z-10 print:relative print:border-none print:bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <img src={LOGO_URL} alt="Elmcrest" className="h-10 w-10" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold" style={{ color: PRIMARY }}>
              Communication & Motivation Compass
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              For Elmcrest staff • Results shared with your manager
            </p>
          </div>
          <Pill label="Elmcrest Internal" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 print:py-4">
        <div className="grid md:grid-cols-3 gap-6 print:grid-cols-1">
          {/* Left: Form */}
          <form
            onSubmit={handleSubmit}
            className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow p-6 print:shadow-none print:border print:border-slate-200"
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: PRIMARY }}
            >
              Your Information
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="sm:col-span-1">
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/60 px-3 py-2 text-slate-900 dark:text-slate-100"
                  placeholder="First Last"
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/60 px-3 py-2 text-slate-900 dark:text-slate-100"
                  placeholder="you@elmcrest.org"
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                  Your Elmcrest role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/60 px-3 py-2 text-slate-900 dark:text-slate-100 text-sm"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h2
              className="text-lg font-semibold mt-2 mb-3"
              style={{ color: PRIMARY }}
            >
              Rate each statement
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              1 = Strongly Disagree · 5 = Strongly Agree
            </p>

            {/* Communication Section */}
            <h3 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-100">
              Communication
            </h3>
            <div className="space-y-5 mb-6">
              {communicationQuestions.map((q, idx) => {
                const questionNumber = idx + 1;
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                          Communication Item
                        </div>
                        <div className="font-medium mb-2">
                          {questionNumber}. {q.text}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {LIKERT.map((v) => (
                          <label
                            key={v}
                            className="flex flex-col items-center text-xs text-slate-600 dark:text-slate-300"
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={v}
                              checked={answers[q.id] === v}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [q.id]: v }))
                              }
                              className="accent-[#0B4DA2] h-4 w-4"
                              required
                            />
                            <span className="mt-1">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Motivation Section */}
            <h3 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-100">
              Motivation
            </h3>
            <div className="space-y-5">
              {motivationQuestions.map((q, idx) => {
                const questionNumber =
                  communicationQuestions.length + idx + 1;
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                          Motivation Item
                        </div>
                        <div className="font-medium mb-2">
                          {questionNumber}. {q.text}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {LIKERT.map((v) => (
                          <label
                            key={v}
                            className="flex flex-col items-center text-xs text-slate-600 dark:text-slate-300"
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={v}
                              checked={answers[q.id] === v}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [q.id]: v }))
                              }
                              className="accent-[#0B4DA2] h-4 w-4"
                              required
                            />
                            <span className="mt-1">{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                type="submit"
                disabled={!allAnswered}
                className="px-4 py-2 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: PRIMARY }}
              >
                Submit & See My Results
              </button>

              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 rounded-xl font-medium border"
                style={{ borderColor: PRIMARY, color: PRIMARY }}
              >
                Reset
              </button>

              {postStatus && (
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {postStatus}
                </span>
              )}
            </div>
          </form>

          {/* Right: Results – hidden until submitted */}
          <aside className="md:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow p-6 print:shadow-none print:border print:border-slate-200">
            {!submitted ? (
              <>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: PRIMARY }}
                >
                  Your Results
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Complete the assessment and click{" "}
                  <strong>Submit &amp; See My Results</strong> to view your
                  Communication &amp; Motivation profile for your role as{" "}
                  <strong>{roleLabel}</strong>.
                </p>
              </>
            ) : (
              <>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: PRIMARY }}
                >
                  Your Summary Snapshot
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  You indicated your Elmcrest role as{" "}
                  <strong>{roleLabel}</strong>. This snapshot highlights your
                  top Communication styles and Motivation drivers.
                </p>

                {/* Communication */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-4 rounded"
                      style={{ background: PRIMARY }}
                    />
                    <h4 className="font-semibold">Communication Styles</h4>
                  </div>
                  {COMM_KEYS.map((k) => (
                    <ScoreBar
                      key={k}
                      label={k}
                      value={totals.comm[k]}
                      max={totalCommMax}
                    />
                  ))}
                  <div className="text-sm mt-2">
                    <div>
                      <strong>Primary:</strong> {totals.primaryComm}
                    </div>
                    <div>
                      <strong>Secondary:</strong> {totals.secondaryComm}
                    </div>
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-4 rounded"
                      style={{ background: ACCENT }}
                    />
                    <h4 className="font-semibold">Motivation Drivers</h4>
                  </div>
                  {MOTIV_KEYS.map((k) => (
                    <ScoreBar
                      key={k}
                      label={k}
                      value={totals.motiv[k]}
                      max={totalMotivMax}
                    />
                  ))}
                  <div className="text-sm mt-2">
                    <div>
                      <strong>Primary:</strong> {totals.primaryMotiv}
                    </div>
                    <div>
                      <strong>Secondary:</strong> {totals.secondaryMotiv}
                    </div>
                  </div>
                </div>

                {/* Brief highlight cards */}
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="text-xs tracking-wide text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Communication highlight
                    </div>
                    <div className="font-semibold mb-1">
                      {COMM_INFO[totals.primaryComm].title}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">
                      {roleize(
                        COMM_INFO[totals.primaryComm].desc,
                        roleLabel
                      )}
                    </p>
                    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 space-y-1">
                      {COMM_INFO[totals.primaryComm].tips
                        .slice(0, 2)
                        .map((t, i) => (
                          <li key={i}>{roleize(t, roleLabel)}</li>
                        ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="text-xs tracking-wide text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Motivation highlight
                    </div>
                    <div className="font-semibold mb-1">
                      {MOTIV_INFO[totals.primaryMotiv].title}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">
                      {roleize(
                        MOTIV_INFO[totals.primaryMotiv].desc,
                        roleLabel
                      )}
                    </p>
                    <div className="text-sm text-slate-700 dark:text-slate-200">
                      <strong>Fueled by:</strong>{" "}
                      {MOTIV_INFO[totals.primaryMotiv].fuels
                        .map((t) => roleize(t, roleLabel))
                        .join(", ")}
                    </div>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>

        {/* Deep-dive sections – only after submission */}
        {submitted && (
          <>
            <section className="mt-10 grid md:grid-cols-2 gap-6 print:grid-cols-2">
              {/* Communication deep dive */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-slate-200 dark:border-slate-700 print:shadow-none">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: PRIMARY }}
                >
                  Deep Dive: Your Communication Profile
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  This section looks at how your primary and secondary styles
                  work together in real conversations with colleagues, youth,
                  families, and leadership in your role as{" "}
                  <strong>{roleLabel}</strong>.
                </p>

                <p className="text-sm mb-2">
                  <strong>Primary:</strong> {totals.primaryComm}{" "}
                  <span className="mx-1">•</span>
                  <strong>Secondary:</strong> {totals.secondaryComm}
                </p>

                {commCombo ? (
                  <>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mb-3">
                      <strong>{commCombo.label}</strong> –{" "}
                      {roleize(commCombo.summary, roleLabel)}
                    </p>
                    <h4 className="text-sm font-semibold mb-1">
                      How this often shows up with others:
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 mb-3 space-y-1">
                      {commCombo.howOthersExperience.map((item, idx) => (
                        <li key={idx}>{roleize(item, roleLabel)}</li>
                      ))}
                    </ul>
                    <h4 className="text-sm font-semibold mb-1">
                      Stretch ideas for your communication:
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 space-y-1">
                      {commCombo.stretch.map((item, idx) => (
                        <li key={idx}>{roleize(item, roleLabel)}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    You have a unique blend of styles. Use your primary and
                    secondary descriptions as a starting point to reflect on how
                    you show up with different teammates.
                  </p>
                )}
              </div>

              {/* Motivation deep dive */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-slate-200 dark:border-slate-700 print:shadow-none">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: ACCENT }}
                >
                  Deep Dive: Your Motivation Profile
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  This section explores what tends to light you up and how your
                  top two drivers shape what you need from work at Elmcrest in
                  your role as <strong>{roleLabel}</strong>.
                </p>

                <p className="text-sm mb-2">
                  <strong>Primary:</strong> {totals.primaryMotiv}{" "}
                  <span className="mx-1">•</span>
                  <strong>Secondary:</strong> {totals.secondaryMotiv}
                </p>

                {motivCombo ? (
                  <>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mb-3">
                      <strong>{motivCombo.label}</strong> –{" "}
                      {roleize(motivCombo.summary, roleLabel)}
                    </p>
                    <h4 className="text-sm font-semibold mb-1">
                      What this tends to mean:
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 mb-3 space-y-1">
                      {motivCombo.whatThisMeans.map((item, idx) => (
                        <li key={idx}>{roleize(item, roleLabel)}</li>
                      ))}
                    </ul>
                    <h4 className="text-sm font-semibold mb-1">
                      Ideas to better support your motivation:
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 space-y-1">
                      {motivCombo.tryThis.map((item, idx) => (
                        <li key={idx}>{roleize(item, roleLabel)}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    Your motivation profile is a blend of several drivers. Use
                    the individual descriptions for your primary and secondary
                    scores as prompts for conversation about what helps you do
                    your best work.
                  </p>
                )}
              </div>
            </section>

            {/* Integrated Communication × Motivation deep dive */}
            {commMotivCombo && (
              <section className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-slate-200 dark:border-slate-700 print:shadow-none">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: PRIMARY }}
                >
                  Integrated Profile: How You Lead at Elmcrest
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  This section looks at how your main way of communicating and
                  your main source of motivation work together in your role as{" "}
                  <strong>{roleLabel}</strong>.
                </p>
                <p className="text-sm mb-2">
                  <strong>
                    {totals.primaryComm} × {totals.primaryMotiv}
                  </strong>
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200 mb-3">
                  <strong>{commMotivCombo.label}</strong> –{" "}
                  {roleize(commMotivCombo.summary, roleLabel)}
                </p>

                <h4 className="text-sm font-semibold mb-1">
                  Key strengths in your Elmcrest role:
                </h4>
                <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 mb-3 space-y-1">
                  {commMotivCombo.strengths.map((s, idx) => (
                    <li key={idx}>{roleize(s, roleLabel)}</li>
                  ))}
                </ul>

                <h4 className="text-sm font-semibold mb-1">
                  Important watch-outs to be mindful of:
                </h4>
                <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 mb-3 space-y-1">
                  {commMotivCombo.watchOuts.map((w, idx) => (
                    <li key={idx}>{roleize(w, roleLabel)}</li>
                  ))}
                </ul>

                <h4 className="text-sm font-semibold mb-1">
                  Ideas and questions to support your growth:
                </h4>
                <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 mb-2 space-y-1">
                  {commMotivCombo.supportIdeas.map((s, idx) => (
                    <li key={idx}>{roleize(s, roleLabel)}</li>
                  ))}
                </ul>

                <div className="mt-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Reflection questions you can use in supervision or
                    self-work:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {commMotivCombo.coachingQuestions.map((q, idx) => (
                      <li key={idx}>{roleize(q, roleLabel)}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </>
        )}

        {/* Actions row for PDF / clipboard – only after submission */}
        {submitted && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl font-medium border bg-white dark:bg-slate-800"
              style={{ borderColor: PRIMARY, color: PRIMARY }}
            >
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-4 py-2 rounded-xl font-medium border bg-white dark:bg-slate-800"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              Copy summary to clipboard
            </button>
            {copyStatus && (
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {copyStatus}
              </span>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-10 print:mt-6">
          © {new Date().getFullYear()} Elmcrest Children’s Center • Communication
          &amp; Motivation Compass
        </div>
      </main>
    </div>
  );
}
