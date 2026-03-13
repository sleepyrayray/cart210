# Research Notes: MBTI, “16 Personalities” and How This Informs My p5 Quiz Project

## Why I’m looking at MBTI for this project
My project is an interactive quiz built in JavaScript/p5 that collects small bits of information from the user and then describes who they are. The vibe is inspired by BuzzFeed quizzes and MBTI-style tests, but I want to remix it into something that feels slightly unsettling: a program that sounds confident about you, even though it only knows what you just gave it. That idea connects directly to how digital platforms profile people and make assumptions from tiny behaviours.

Part of the point is to simulate a near-future dependence on systems that “tell you who you are” which is both tempting (because it feels validating) and dystopian (because it’s still data collection and categorization).

---

## What MBTI is
The Myers-Briggs framework is built around **four pairs of preferences**. A person’s “type” is a **four-letter code** made by picking one preference from each pair, which leads to **16 possible combinations**. ([myersbriggs.org](https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/))

The preference pairs are commonly described like this:

- **Extraversion (E) vs. Introversion (I):** where you tend to focus your energy (outer world vs inner world) ([myersbriggs.org](https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/))  
- **Sensing (S) vs. Intuition (N):** how you tend to take in information (facts vs big picture) ([myersbriggs.org](https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/))  
- **Thinking (T) vs. Feeling (F):** how you tend to make decisions (more objective vs more values/empathy-based) ([myersbriggs.org](https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/))  
- **Judging (J) vs. Perceiving (P):** how you tend to approach the outside world (closure/structure vs staying open/flexible) ([myersbriggs.org](https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/))  

One detail that matters for my project: the Myers & Briggs Foundation frames these as **preferences**, not “good vs bad,” and uses everyday examples (like left- vs right-handedness) to explain how “preference” is supposed to feel natural. ([myersbriggs.org](https://www.myersbriggs.org/my-mbti-personality-type/the-mbti-preferences/))

---

## The 16 personality types
Since I’m remixing MBTI, I don’t need to treat the 16 types like rigid truth. But I *do* want the quiz to feel familiar, so users recognize the format and trust it (at least at first).

### Official MBTI-style type descriptions (example)
The Myers & Briggs Foundation provides classic short descriptions for each of the 16 types (for example ISTJ is described as “quiet, serious… thorough and dependable,” etc.). ([myersbriggs.org](https://www.myersbriggs.org/my-mbti-personality-type/the-16-mbti-personality-types/))  
I can use these kinds of descriptions as a baseline tone (even if my project later complicates or critiques the certainty).

### Popular “16Personalities” labels (the version most people know online)
A huge number of people first encounter “MBTI” through **16Personalities**, which uses the familiar four-letter codes but also adds an **extra identity letter (-A / -T)** and organizes types into four “Roles”:

- **Analysts (NT):** INTJ, INTP, ENTJ, ENTP  
- **Diplomats (NF):** INFJ, INFP, ENFJ, ENFP  
- **Sentinels (SJ):** ISTJ, ISFJ, ESTJ, ESFJ  
- **Explorers (SP):** ISTP, ISFP, ESTP, ESFP ([16personalities.com](https://www.16personalities.com/articles/roles-defined))  

16Personalities also openly says it’s **not simply MBTI**: it keeps the acronym style for convenience, adds a fifth scale, and claims it reworks/rebalances the **Big Five** rather than using Jungian “cognitive functions.” ([16personalities.com](https://www.16personalities.com/articles/our-theory))  
That matters because my project is partly about how online quizzes borrow authority from “science-y” language, even when the frameworks are mixed and remixed.

---

## Credibility and criticism
This is useful for my project because it lets me build a quiz that *performs* credibility while quietly showing its cracks.

### A skeptical view (APS)
The Association for Psychological Science hosted a skeptical “deep dive” episode on Myers-Briggs. In the transcript, the guest compares the MBTI’s appeal to something “a little bit” like a horoscope and emphasizes that there are well-validated personality trait measures, while MBTI’s type-based approach isn’t strongly supported for predicting behaviour. ([psychologicalscience.org](https://www.psychologicalscience.org/news/releases/2021-utc-myers-briggs.html))  
One line that stands out for my concept: it points out issues with the idea that types are “valid” in the sense of predicting behaviour reliably. ([psychologicalscience.org](https://www.psychologicalscience.org/news/releases/2021-utc-myers-briggs.html))

### The official MBTI defense (Myers-Briggs Company)
The Myers-Briggs Company argues the MBTI is not meant to “put people into a box,” and explicitly says it **does not describe your whole personality or identity**—it focuses on “four core aspects.” ([themyersbriggs.com](https://www.themyersbriggs.com/en-US/Support/MBTI-Facts))  
They also present reliability data (including high test–retest correlations for the preference scales over short intervals, and noting that about **50%** of people receive the same four-letter “whole type” on retest). ([themyersbriggs.com](https://www.themyersbriggs.com/en-US/Support/MBTI-Facts))  

So for my notes: there’s a tension between (1) how confidently results are often marketed or interpreted online and (2) the more careful framing that “this is not your whole identity.” ([themyersbriggs.com](https://www.themyersbriggs.com/en-US/Support/MBTI-Facts))

### A middle ground from an academic paper (Frontiers in Psychology, 2023)
A 2023 open-access paper in *Frontiers in Psychology* studies MBTI as a predictor for leadership-related behaviours. It reports that MBTI and leadership measures can be measured psychometrically, but the relationship between MBTI and leadership practices was **weak** in their models. ([pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov/articles/PMC10017728/))  
This is helpful to me because it supports a project theme: even when measurement is “clean,” what people *do with* the results (big predictions about you) can be shaky.

---

## How this inspires my p5 quiz
My piece is basically a “personality machine,” but I want it to feel like a critique, not a genuine self-help tool.

### What I want to simulate
- **Data collection as identity-building:** the user gives answers, and the system turns that into a neat story about them.  
- **Overconfident inference:** the program acts like it knows more than it really does (similar to how feeds and algorithms escalate assumptions after small interactions).  
- **A friendly interface with a slightly dystopian undertone:** fun quiz energy, but with moments that reveal how reductive it is.

### The “famous person match” idea (how I’ll treat it)
At the end, I want the user to see:
1) a type-like result (my remix), and  
2) a small “you’re like ____ (famous person)” comparison.

This is powerful because it’s *exactly* how quizzes build trust: they connect you to a recognizable figure and make the result feel real. But I’ll need to handle it carefully: famous-figure typing online is usually speculative, and the confidence of that comparison is part of what I’m critiquing. A good move would be to present it as **“the system’s guess”** rather than as fact.

---

## Quick list: patterns this research connects to (for later project writing)
- **Privacy:** the quiz is literally a data collection scenario, and the user experiences what it’s like to be profiled.  
- **Voice:** the user can only express themselves through limited answer options; the system controls the categories.  
- **Agency:** even if the user chooses, the program decides what those choices “mean” and delivers the final identity story.  
- **Engagement & attention (optional):** quizzes are designed to keep you clicking; I can exaggerate that design to show how it works.

---

## Sources I used (for my own reference)
- Zárate-Torres, R. (2023). *How good is the Myers-Briggs Type Indicator for predicting leadership-related behaviours?* Frontiers in Psychology (open access). ([pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov/articles/PMC10017728/))  
- Association for Psychological Science (2021). *Skeptical ‘Deep Dive’ on the Myers-Briggs Test* (transcript/article). ([psychologicalscience.org](https://www.psychologicalscience.org/news/releases/2021-utc-myers-briggs.html))  
- The Myers-Briggs Company. *MBTI Facts* (reliability/validity framing, and “not your whole identity”). ([themyersbriggs.com](https://www.themyersbriggs.com/en-US/Support/MBTI-Facts))  
- 16Personalities. *Our Framework / Our Theory* and *Roles Defined* (how it mixes MBTI-style acronyms with a different model and role groupings). ([16personalities.com](https://www.16personalities.com/articles/our-theory))  