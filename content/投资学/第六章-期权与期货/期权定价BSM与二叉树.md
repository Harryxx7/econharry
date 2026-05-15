---
title: 期权定价：看涨看跌平价、B-S模型与二叉树
subject: 投资学
chapter: 第六章-期权与期货
tags: [期权, B-S模型, 二叉树, Put-Call Parity, Delta]
difficulty: hard
flashcard: true
---

## 问题
看涨看跌期权平价关系是什么？B-S 定价公式是什么？二叉树如何为期权定价？

## 答案

### 1. 看涨看跌期权平价（Put-Call Parity）

$$C + \frac{X}{(1+r_f)^T} = P + S_0$$

- $C$：看涨期权价格，$P$：看跌期权价格
- $X$：行权价，$S_0$：当前股价，$r_f$：无风险利率

---

### 2. Black-Scholes-Merton（B-S）定价公式

$$C = N(d_1)S - N(d_2)Ee^{-rT}$$

其中：

$$d_1 = \frac{\ln(S/E) + (r + \sigma^2/2)T}{\sigma\sqrt{T}}$$

$$d_2 = d_1 - \sigma\sqrt{T}$$

- $S$：标的资产当前价格，$E$：行权价
- $r$：连续复利无风险利率，$T$：到期时间
- $\sigma$：标的资产收益率的年化标准差
- $N(\cdot)$：标准正态分布累积概率

---

### 3. Delta

$$Delta = \frac{\text{期权价格变动幅度}}{\text{标的资产价格变动幅度}}$$

- 看涨期权：$\Delta_c = N(d_1)$（0 到 1 之间）
- 看跌期权：$\Delta_p = N(d_1) - 1$（-1 到 0 之间）

**Delta 中性对冲**：持有 $\Delta$ 份股票可对冲 1 份期权的风险。

---

### 4. 二叉树定价（复制原理）

设上涨时 $S \to uS$，下跌时 $S \to dS$：

**Delta（对冲比率）**：

$$\Delta = \frac{C_u - C_d}{S(u-d)}$$

**借款额**：

$$B = e^{-rh}\left(\frac{C_u \cdot d - C_d \cdot u}{u - d}\right)$$

**期权价值**：

$$\Delta S + B = C$$

---

### 5. 风险中性定价

上涨概率（风险中性）：

$$p = \frac{e^{rh} - d}{u - d}$$

$$C = e^{-rh}\left(p \cdot C_u + (1-p) \cdot C_d\right)$$

## 考点提示
> B-S 公式中 $N(d_2)$ 是期权被执行的风险中性概率，$N(d_1)$ 是 Delta（对冲比率）。Delta 中性要求随时调整持仓（动态对冲）。二叉树方法与 B-S 在极限情况下等价。
