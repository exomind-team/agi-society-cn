---
comments: true
---
# Chapter 4. Self-Organizing Process

[英文原文↗](https://cis.temple.edu/~pwang/GTI-book/GTI-CH4/GTI-4.html)

[[index|🔙上一级]]

> 本页为 Temple University GTI 原始 eBook 的英文内容镜像；原站章节内链已转换为本地 wikilink。

* * *

## [[4.1|Section 4.1. Learning as self-organization]]

The self-organization of a system like NARS is driven by two fundamental conflicts within the system persistently:

- The system has to predict future with past experience, which is always insufficient for the purpose.

- The system has to achieve its goals with its constant resources, which is always insufficient for the purpose.

Different from the common understanding in the "Machine Learning" community, learning in a system like NARS is not a computation process following an algorithm. Instead, it is a unpredictable and open-ended process influenced by many factors in the system and the environment. It is not an "improving routine" that is additional to the "working routine" of the system, neither. Instead, in a system like NARS, "learning" is just the long-term effect of the reasoning process.

---

## [[4.2|Section 4.2. The self-organization of goals]]

While some of the goals can be directly achieved by system's actions, most of them need to be achieved indirectly via the achieving of derived goals. Due to the insufficiency of knowledge and resources of the system, the derived goals may turn out to conflict with their parent goals, which is a phenomenon called "alienation". Though often seen as undesired, this phenomenon is also responsible for the autonomy, initiative, and originality of intelligent systems.

Also because of the insufficiency of knowledge and resources, the system cannot process goals one by one, but have to process many of them in parallel, in a time-sharing manner. At any moment, the system's decisions are usually made by taking multiple goals into consideration, rather than determined by a single goal. In the competitions among goals, the original goals do not always win over derived goals. The system attempts to unevenly distribute resources among the goals to achieve the highest overall satisfaction.

Another important aspect of self-organization of goals is to resolve the conflicts among the goals by selecting actions based on compromise among goals. When a goal can be achieved by multiple actions, the selection is often based on the impacts of those actions on other goals.

---

## [[4.3|Section 4.3. The self-organization of actions]]

The meaning of an action, either primary or composed, is mostly revealed by its sufficient and necessary conditions indicating the cause and effect of the action. For a system with insufficient knowledge and resources, the meaning of an action is never fully given, but gradually obtained from the experience of the system.

To be able to reason about actions allows the system to predict the effect of an action without actually executing it.  This is the "internalization" of actions, that is, simulations of the corresponding actions by reasoning on them.

To use the limited resources efficiently, an adaptive system must use its experience to guide the self-reorganization of operations, which means (1) to create a compound action only when it solves an existing task, (2) to adjust the related truth-values and priority according to their past performance, and (3) to gradually forget the actions that are not very useful. During such a process, the system reorganizes its actions according to the repeatedly appeared goals in its experience, so as to improve its overall efficiency.

When the system is equipped with (external) tools, similar procedure happens within the system, because with a tool, an existing action changes it meaning.  The system needs exercise and practice to use a tool skillfully.

---

## [[4.4|Section 4.4. The self-organization of beliefs]]

As a result, the extreme aim of belief self-organization is not to get a "true description" of the world, but to efficiently connect the system's goals to its actions, according to past experience.  For this purpose, there are three requirements that the system should try to satisfy when organizing its beliefs:

- Correctness: The beliefs generated through self-organization should be compatible with the experience of the system.

- Concreteness: Beliefs should be organized in such a way that can provide detailed guidance to the system in the current and future situations.

- Compactness: Instead of directly recording the "raw" experience, it is much more efficient to generalize them.

The self-organization of beliefs are carried out by constantly generating derived beliefs from existing ones, adjusting truth-values of beliefs by combining evidence for the same statements collected in different way, adjusting priority of beliefs according to their usefulness and relevance, and removing beliefs with low priority.

---

## [[4.5|Section 4.5. The self-organization of concepts]]

A concept is not an internal representation of an external object (or a set of them), but an identifiable ingredient in the system's experience. A concept has no "true" or "real" meaning, but a meaning that depends on the system's experience with it. To improve efficiency, self-organization in concept attempts to give a concept a relatively clear and stable meaning. However, with the changing of context and the coming of new experience, the process usually does not converge to a final meaning of the concept.

To improve the efficiency of summarizing experience, the inference process constantly compose new concepts, as novel ways to cluster related items. This process is not random, but data-driven, in the sense that a new term (and the related concept) is built only when it provide a preferred way to organize some experience for a certain situation. Whether this concept has long-term value is to be determined by the following experience of the system. The quality of a concept is not a matter of true or false, but good or bad.

The self-organization process evaluates and adjusts the priority distribution among the concepts, to form a conceptual hierarchy by arranging concepts according to their inheritance relations. When the system encounters a new situation, a perception/categorization process relates it with existing concepts, and the result suggests possible behaviors according to the system's experience in similar situations.
