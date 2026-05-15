---
title: 股票估值：DDM、NPVGO与市盈率
subject: 投资学
chapter: 第二章-债券与股票估值
tags: [DDM, NPVGO, 股利折现, 市盈率, 股票估值]
difficulty: hard
flashcard: true
---

## 问题
零增长、固定增长股票的估值公式是什么？NPVGO 模型如何将股价分解？

## 答案

### 1. 零增长股票

$$P_0 = \frac{DIV_1}{R}$$

股价 = 每期股利 / 折现率（永续年金公式）

---

### 2. 固定增长股票（Gordon 增长模型）

$$P_0 = \frac{DIV_1}{R - g}$$

- $DIV_1$：下期股利，$R$：权益要求收益率，$g$：永续增长率

---

### 3. 持有期收益率

$$R_{t+1} = \frac{Div_{t+1} + P_{t+1} - P_t}{P_t} = \text{股利收益率} + \text{资本利得率}$$

---

### 4. 持有期收益率（多期）

**(1) 持有期收益**：

$$\text{持有期收益率} = (1+R_1) \times (1+R_2) \times \cdots \times (1+R_n) - 1$$

**(2) 年化持有期收益率**（几何平均）：

$$= \left[(1+R_1)(1+R_2)\cdots(1+R_n)\right]^{1/T} - 1$$

---

### 5. NPVGO 模型（增长机会净现值）

$$P = \frac{EPS}{k} + NPVGO$$

$$\frac{P_0}{E_1} = \frac{1}{k}\left(1 + \frac{PVGO}{E_1/k}\right)$$

**含义**：股价 = "无增长"时的价值（$EPS/k$）+ 未来投资机会的净现值

---

### 6. 市盈率与增长机会

$$\frac{P_0}{E_1} = \frac{1}{k}\left(1 + \frac{PVGO}{E_1/k}\right)$$

PE 高说明市场认为该公司有丰富的增长机会（NPVGO 大）。

---

### 7. 市场类比法（相对估值）

$$\text{目标估值} = \frac{\text{可比公司市盈率}}{1} \times \text{目标公司EPS}$$

## 考点提示
> **Gordon 模型（$P = D_1/(r-g)$）** 是最重要的股票估值公式，要注意：$D_1$ 是**下一期**股利（不是当期），$r > g$ 是成立的前提条件。NPVGO 模型揭示了市场愿意给高PE的本质——未来的增长机会。
