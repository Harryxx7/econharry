---
title: 期权定价：看涨看跌平价、BSM、复制原理与风险中性定价
subject: 投资学
chapter: 第六章-期权与期货
tags: [看涨看跌平价, BSM, 二叉树, 复制原理, 风险中性, Delta]
difficulty: hard
flashcard: true
---

## 问题

看涨-看跌期权平价、B-S模型、复制原理定价、风险中性定价与Delta公式？

## 答案

### 三、期权

#### 1. 看涨-看跌期权平价

$$C + \frac{X}{(1+r_f)^T} = P + S_0$$

#### 2. 布莱克-斯科尔斯模型

$$C = N(d_1)S - N(d_2)Ee^{-rT}$$

$$d_1 = \frac{[Ln(S/E) + (r + \sigma^2/2)T]}{\sigma\sqrt{T}}$$

$$d_2 = d_1 - \sigma\sqrt{T}$$

#### 3. 复制原理定价

$$(\Delta \times uS) + (B \times e^{rh}) = C_u$$

$$(\Delta \times dS) + (B \times e^{rh}) = C_d$$

**②Delta**

$$Delta = \frac{\text{期权价格变动幅度}}{\text{标的资产价格变动幅度}}$$

**③计算借贷量 B 借款额**

$$\Delta = \frac{C_u - C_d}{S(u-d)}; \quad B = e^{-rh} \frac{uC_d - dC_u}{u-d}$$

**④计算期权的价值**

$$\Delta S + B = C$$

#### 4. 风险中性定价

股票预期收益率 = 上涨概率 × 上涨收益率 + (1 - 上涨概率) × 下跌收益率

期权价值 = (上涨概率 × 期权组合上行收益 + (1 - 上涨概率) × 期权组合下行收益) × $e^{-Rh}$
