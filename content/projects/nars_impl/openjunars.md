---
comments: true
---

# OpenJunars

- 作者：*孙常新 (Changxin Sun)*
    - [GitHub↗](https://github.com/AIxer)
- 源码链接
    - [Github↗](https://github.com/AIxer/OpenJunars)
    - [Gitee↗](https://gitee.com/junars/nacore6)
- 介绍链接
    - [Bilibili视频（年会报告）](https://www.bilibili.com/video/BV15m4y1Q7yD?p=3)

> [!info] README 已确认的范围
> 当前仓库 README 明确写出 OpenJunars 实现 NAL 1–6，用于教育和演示；跨项目字段见 [[catalog|NARS 实现基础资料总表]]。

## 教程导引

OpenJunars是NARS的Julia版本，语言本身并不难学，且打开方式较为简单。

### 安装Julia环境

访问Julia官网，在下载页面选择适合的版本下载。

- Windows 64位安装器 (1.9.2)
- Windows 32位安装器 (1.9.2)
- macOS x86 (Intel or Rosetta) 安装器 (1.9.2)
- Linux 通用x86 (glibc) (1.9.2)
- FreeBSD 通用x86 (1.9.2)

### 安装使用OpenJunars

下面介绍OpenJunars的安装与使用方法

#### 安装：自Github存储库

使用Julia包管理语法，安装OpenJunars模块：

```julia
using Pkg # 使用官方包管理器
Pkg.add(url="https://github.com/AIxer/OpenJunars") # 从URL（Github仓库）安装
```

或在REPL中输入：

1. 按 `]` 进入包管理环境「(v XXX) pkg>」
2. 输入`add https://github.com/AIxer/OpenJunars`
3. 回车

**⚠注意：因Github下载速度较慢，下载过程可能要进行很久。若下载失败，请多尝试几次。**

若安装完成，可以在REPL看到以下输出（所用版本v1.9）：

```txt
(@v1.9) pkg> add https://github.com/AIxer/OpenJunars
Cloning git-repo `https://github.com/AIxer/OpenJunars`
Updating git-repo `https://github.com/AIxer/OpenJunars`
Updating registry at `[...]\.julia\registries\General.toml`
Resolving package versions...
Updating `[...]\.julia\environments\v1.9\Project.toml`
[2dd0acb3] + Junars v0.8.0 `https://github.com/AIxer/OpenJunars#main`
Updating `[...]\.julia\environments\v1.9\Manifest.toml`
[6e4b80f9] + BenchmarkTools v1.3.2
[2dd0acb3] + Junars v0.8.0 `https://github.com/AIxer/OpenJunars#main`
[9abbd945] + Profile
Precompiling project...
2 dependencies successfully precompiled in 7 seconds. [...]
```

此时可在REPL（或计算机其它位置的Julia源码文件`.jl`）中使用OpenJunars包：

```julia
using Junars
```

↑该代码正常情况下没有任何输出

⚠注意：若在REPL中安装OpenJunars模块，则需在安装后退出 `pkg>` 的包管理环境

- 否则报错：```ERROR: `using` is not a recognized command. Type ? for help with available commands```

如果觉得自己好像安装了个假Julia包，可以尝试用如下代码验证Junars包安装成功：

```julia
println(Junars) # 打印模块本身
println(names(Junars)) # 打印出所有导出的属性名、函数名
println(Junars.w"原子词项") # 打印Junars的一个原子词项
```

正常情况下（截止至2023年8月），REPL会输出以下内容：

```julia
julia> println(Junars) # 打印模块本身
Junars

julia> println(names(Junars)) # 打印出所有导出的属性名、函数名
[Symbol("@w_str"), :AbstractAtom, :AbstractCompound, :AbstractStatement, :AbstractVariable, :Action, :Admins, :Atom, :BLinkRecord, :Backward, :BackwardWeak, :Belief, :Budget, :COMPONENT, :COMPONENT_CONDITION, :COMPONENT_STATEMENT, :COMPOUND, :COMPOUND_CONDITION, :COMPOUND_STATEMENT, :Compound, :CompoundBackward, :CompoundBackwardWeak, :CompoundForward, :Concept, :Conjunction, :Control, :DVar, :Disjunction, :Entity, :Equivalence, :ExtDiff, :ExtImage, :ExtIntersection, :ExtSet, :FOTerm, :Forward, :Gene, :HashValue, :IVar, :Image, :Implication, :Inference, :Inheritance, :IntDiff, :IntImage, :IntIntersection, :IntSet, :Judgement, :Junars, :LinkStyle, :LinkTree, :NALDifference, :NALIntersection, :NALSet, :NaCore, :NaTask, :Nar, :Narsche, :Negation, :PlaceHolder, :Product, :QVar, :Question, :Racer, :RuleStyle, :SELF, :Sentence, :Similarity, :Stamp, :Statement, :TRANSFORM, :Table, :TaskLink, :Term, :TermLink, :Token, :Truth, :Variable, :Word, :abduction, :above_threshold, :absexpdiff, :absorb!, :activate!, :add!, :addone, :analogy, :and, :anonymous_analogy, :applysubs!, :attach!, :ave_ari, :ave_geo, :ave_priority, :bgt, :bro, :c2w, :calcbgt, :clear!, :comparision, :conceptualize, :contraposition, :conversion, :cpx, :cycle!, :dec_durability!, :dec_priority!, :dec_quality!, :deduction, :derivetask!, :derivetask1, :derivetask2, :difference, :dispatch, :dispatch2, :durability, :exemplification, :expect, :findsubstitute, :forget!, :has, :hasivar, :hasvar, :ignite, :inc_durability!, :inc_priority!, :inc_quality!, :induction, :intersection, :into_track!, :inv_abd, :inv_ana, :inv_anonymous_ana, :inv_com, :inv_ded, :inv_difference, :inv_ind, :inv_reduceconj, :inv_reduceconj_neg, :inv_reducedisj, :iscommutative, :isconstant, :isjudgment, :isnegative, :isopenvar, :isvar, :localmatch, :name, :negation, :now, :or, :out_track!, :overlapped, :parse_term, :parsese, :pick, :preparelinks, :priority, :put!, :putback!, :quality, :rank, :reduceconj, :reduceconj_neg, :reducedisj, :remove!, :renamevar!, :resemblance, :revise, :revision, :t2q, :take!, :target, :token, :transformrela, :trysolution!, :unify!, :unionstamp, :w2c, :∧, :∨, :⊖, :⋂, :⋃]

julia> println(Junars.w"原子词项") # 打印Junars的一个原子词项
"原子词项"

```

若输出与以上测试基本一致，则Junars安装已经成功。

#### 使用：访问交互式终端

现在我们只是安装好了`OpenJunars`的模块，离使用还有一段距离。

实际上，OpenJunars配置了一个交互式终端，我们可以在其中输入Junars的命令。

在REPL输入以下代码：

```julia
using Junars # 使用Junars包
using DataStructures # 使用「数据结构」包（主要是`MutableLinkedList`）

cycles = Ref{UInt}(0) # 推理器信息
serial = Ref{UInt}(0) # 推理器信息

oracle = NaCore(Narsche{Concept}(100, 10, 400), Narsche{NaTask}(5, 3, 20), MutableLinkedList{NaTask}(), serial, cycles); # 构造推理器

ignite(oracle) # 启动推理器
```

注：无注释版本可以在OpenJunars包中的`run.jl`中找到

若交互式终端启动，则在REPL可以看见如下输出：

```julia
julia> using Junars

julia> using DataStructures

julia> cycles = Ref{UInt}(0)
Base.RefValue{UInt64}(0x0000000000000000)

julia> serial = Ref{UInt}(0)
Base.RefValue{UInt64}(0x0000000000000000)

julia> oracle = NaCore(Narsche{Concept}(100, 10, 400), Narsche{NaTask}(5, 3, 20), MutableLinkedList{NaTask}(), serial, cycles);

```

> [!warning] 注意
>
> > 本内容搬运自 [ARCJ137442](https://github.com/ARCJ137442) 的文章。
