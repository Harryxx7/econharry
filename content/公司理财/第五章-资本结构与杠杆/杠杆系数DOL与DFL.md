---
title: 经营杠杆系数（DOL）与财务杠杆系数（DFL）
subject: 公司理财
chapter: 第五章-资本结构与杠杆
tags: [DOL, DFL, 经营杠杆, 财务杠杆, 联合杠杆]
difficulty: hard
flashcard: true
---

## 问题
DOL 和 DFL 的公式是什么？各自衡量的是什么风险？

## 答案

### 1. 经营杠杆系数（DOL）

衡量销售量变动引起 EBIT 变动的敏感程度：

$$DOL = \frac{\Delta EBIT/EBIT}{\Delta Q/Q}$$

展开为：

$$DOL = \frac{(P-VC)Q}{EBIT} = \frac{(P-VC)Q}{(P-VC)Q - FC}$$

$$= \frac{EBIT + FC}{EBIT}$$

- $P$：单价，$VC$：单位变动成本，$FC$：固定成本
- **DOL > 1**，固定成本越高，DOL 越大，经营风险越高

---

### 2. 财务杠杆系数（DFL）

衡量 EBIT 变动引起每股收益（EPS）变动的敏感程度：

$$DFL = \frac{\text{普通股每股收益变动率}}{\text{税前利润变动率}/\text{息税前利润变动率}}$$

$$DFL = \frac{(P-VC)Q - FC}{(P-VC)Q - FC - I}$$

$$= \frac{EBIT}{EBIT - I}$$

$$= \frac{(P-VC)Q - FC - I[(1-t_c)]}{(P-VC)Q - FC - D - I}$$

精确公式（含优先股股利 $D$）：

$$DFL = \frac{EBIT}{EBIT - I - \frac{D}{1-t_c}}$$

---

### 3. 联合杠杆（DCL）

$$DCL = DOL \times DFL$$

衡量销售量变动对 EPS 的总影响。

## 考点提示
> DOL 反映**经营风险**（来自固定成本），DFL 反映**财务风险**（来自固定财务费用）。高固定成本行业（制造业）DOL 高，高负债企业 DFL 高。两者相乘 = 联合杠杆，是对总风险的综合衡量。
