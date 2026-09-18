---
comments: true
---
# Chapter 3. Inference System

[英文原文↗](https://cis.temple.edu/~pwang/GTI-book/GTI-CH3/GTI-3.html)

[[index|🔙上一级]]

> 本页为 Temple University GTI 原始 eBook 的英文内容镜像；原站章节内链已转换为本地 wikilink。

* * *

## [[3.1|Section 3.1. Formalization of information system]]

- Dynamical system: The system's state is represented as a point in a multi-dimensional space, and its activity is represented as a trajectory in the space, following equations.

- Computational system: The system's state is represented as data, and its activity is represented as modifications of the data, following algorithms.

- Inferential system:  The system's state is represented as a group of sentences, and its activity is represented as derivation of sentences, following rules.

---

## [[3.2|Section 3.2.  Types of inference systems]]

- pure-axiomatic system: In all aspects, the system has sufficient knowledge and resources with respect to the problems to be solved.

- semi-axiomatic system: In some, but not all, aspects, the system has sufficient knowledge and resources with respect to the problems to be solved.

- non-axiomatic system: In all aspects, the system has insufficient knowledge and resources with respect to the problems to be solved.

NARS (Non-Axiomatic Reasoning System) is a concrete example of non-axiomatic system. It will be used as a concrete model in the following description of intelligent systems.

---

## [[3.3|Section 3.3. NARS: language]]

The basic unit of the language is*term*, which can be intuitively thought of as the name or label of a concept in the system. A term can either be a simple identifier, or a compound consists of component terms.

Two terms connected by an inheritance relation (or its variants) forms a statement, which indicates that one term can be used as the other term, as specialization (extension) or generalization (intension), to certain extent. The extent, or truth-value of the statement, in indicated by a frequency value (the proportion of positive evidence supporting the statement among all evidence) and a confidence value (the proportion of current evidence among available evidence in the near future). Consequently, the system's beliefs are represented as statements with their truth-value, and they summarize the system's experience, in terms of the substitutability among terms (and concepts).

The meaning of a term is determined by its extension and intension, which are the collection of the inheritance relations between this term and other terms, obtained from the experience of the system. NARS includes three variants of the inheritance relation: similarity (symmetric inheritance), implication (derivability), and equivalence (symmetric implication). They also contribute to the meaning of the terms involved.

To represent complicated experience, Narsese uses compound terms for common ways to combine terms into patters or structures. The meaning of a compound term is partially determined by its logical relations with its components, and partially by the system's experience on the compound term as a whole.

Event is a special type of statement that have a time-dependent truth-value. Operation is a special type of event that can occur by the system's decision. Goal is a special type of event, that the system is attempting to realize, by carrying out certain operations. Beside goals to be achieved, NARS can accept tasks that are knowledge to be absorbed and questions to be answered.

---

## [[3.4|Section 3.4.  NARS: rules]]

The truth-value in NARS is intuitively related to probability (as studied in probability theory) and degree of membership (as studied in fuzzy logic), though not identical to either of them. The truth-value calculation in the system can be seen as an extended Boolean algebra, where the value range of variables is the continuous interval [0, 1], not the binary set {0, 1}.

NARS uniformly formalizes multiple types of inferences, including revision, choice, deduction, abduction, induction, exemplification, comparison, analogy, resemblance, conjunction, disjunction, negation, etc. Some of the rules (like deduction) can produce high-confident conclusions, while some others (like induction) can only produce low-confident conclusions (hypotheses). When evidence collected from different sources are pooled together by the revision rule, the confidence of the conclusion increases.

Beside deriving relations among existing terms, NARS inference rules also derive new terms to summarize complicated experience. The inference rules can also be used backwards to derive a goal (or question) from a belief and a goal (or question), under the condition that the achieving of the goal (or the answer to the question) can be used with the belief to achieve the original goal (or to answer the original question).

If a event is judged to imply the achieving of a goal, then the desirability of the event is increased, and the system will also evaluate its plausibility, that is, how likely it is to be achieved as a goal. When an event is both desirable and plausible, the system will make the decision to turn the event into a goal to be actually pursued.

---

## [[3.5|Section 3.5.  NARS: memory and control]]

The system's memory consists of a collection of concepts, as well as a buffer for new tasks that come from the environment or the previous reasoning activity. The system repeatedly execute a basic working cycle, in which a concept is selected probabilistically, then a task and a belief are selected in the concept, also probabilistically. The task and the belief are used as premise to produce derived tasks, according to applicable rules.

Since the system works with insufficient resources, it cannot afford the time to let a task interact with every belief in the concept, nor can it keep all the derived beliefs. Instead of treating all tasks and beliefs as equal, the system maintains priority distributions among concepts, as well as among tasks and beliefs in a concept, to indicate the amount of resources the system plans to spend on it. After each inference step, the priority values of the involved items (concept, task, and belief) are adjusted according to the direct feedback collected in the step. In the long run, the system attempts to give more resources to the more relevant and useful items.

The meaning of a concept is its experienced relations with other concepts. With the constant adding of new and derived beliefs, the deleting of useless beliefs, and the changing of priority values of beliefs, the meaning of a concept evolves over time, though the process is not arbitrary, but adaptive to the system's experience. Furthermore, each time a concept is used in processing a task, only part of its meaning is used.
