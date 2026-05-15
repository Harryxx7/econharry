---
title: MM定理（有税）、APV与多种估值方法
subject: 公司理财
chapter: 第五章-资本结构与杠杆
tags: [MM定理, APV, WACC, FTE, 税盾, 资本结构]
difficulty: hard
flashcard: true
---

## 问题
有税MM定理的各命题公式是什么？APV、FTE、WACC三种方法如何选择？

## 答案

### 1. 无税 MM 定理

$V_L = V_U$（负债企业价值 = 无杠杆企业价值）

权益成本随杠杆提高而上升，WACC 不变。

---

### 2. 有税 MM 定理

**命题 1（企业价值）**：

$$V_L = V_U + t_c \times B$$

税盾现值 = 税率 × 债务价值

**命题 2（权益成本）**：

$$R_S = R_0 + \frac{B}{S}(R_0 - R_B)(1-t_c)$$

- $R_0$：无杠杆企业权益成本
- $R_B$：债务成本
- $B/S$：负债权益比

---

### 3. 权衡理论（Trade-off Theory）

$$V_L = V_U + t_c \times B - \text{财务困境成本的现值}$$

最优资本结构在税盾边际利益 = 财务困境边际成本处。

---

### 4. APV 法（调整现值法）

$$APV = NPV_{\text{无杠杆}} + NPVF$$

$NPVF$ = 融资产生的副效应现值（主要是税盾）

---

### 5. FTE 法（权益现金流量法）

$$LCF = EBIT \times (1-t) - (EBIT - I) \times (1-t)$$

计算属于股权人的现金流 $LCF$，用权益成本 $R_S$ 折现。

---

### 6. WACC 法

$$NPV = \sum_{t=1}^{\infty} \frac{UCF}{(1+R_{WACC})^t} - \text{初始投资额}$$

$$R_{WACC} = \frac{S}{B+S} R_S + \frac{B}{B+S} R_B(1-t_c)$$

### 三种方法比较

| 方法 | 适用场景 |
|------|---------|
| WACC | 资本结构（D/E）恒定的项目 |
| APV | 资本结构变化、LBO等特殊情形 |
| FTE | 只关注股权价值时 |

## 考点提示
> **有税 MM 命题1 是最核心公式**：$V_L = V_U + t_c B$，税盾使负债有额外价值。WACC 法最常用，但记住 WACC 中债务成本要乘以 $(1-t_c)$（税后债务成本）。
