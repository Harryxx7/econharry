---
title: 期权定价：BSM 与复制原理
subject: 投资学
chapter: 第六章-期权与期货
tags: [BSM, 期权定价, 看跌看涨平价, 复制原理, 风险中性, Delta]
difficulty: hard
flashcard: true
---

## 问题

看跌—看涨期权平价、BSM 模型、复制原理定价（Delta、借贷量 B）和风险中性定价的公式分别是什么？

## 答案

**1. 看跌—看涨期权平价**

$$
C + \frac{X}{(1+r_f)^T} = P + S_0
$$

---

**2. 布莱克—斯科尔斯模型（BSM）**

$$
C = N(d_1)S - N(d_2)Ee^{-rT}
$$

$$
d_1 = \frac{\ln(S/E) + (r + \sigma^2/2)T}{\sqrt{\sigma^2 T}}
$$

$$
d_2 = d_1 - \sigma\sqrt{T}
$$

---

**3. 复制原理定价**

$$
(\Delta \times uS) + (B \times e^{rh}) = C_u
$$

$$
(\Delta \times dS) + (B \times e^{rh}) = C_d
$$

**② Delta**

$$
\Delta = \frac{\text{期权价格变动幅度}}{\text{标的资产价格变动幅度}} = \frac{C_u - C_d}{S(u-d)}
$$

**③ 借贷量 B**

$$
B = e^{-rh} \frac{uC_d - dC_u}{u-d}
$$

**④ 期权的价值**

$$
\Delta S + B = e^{-rh} \left(C_u \frac{e^{rh}-d}{u-d} + C_d \frac{u-e^{rh}}{u-d}\right)
$$

---

**4. 风险中性定价**

股票预期收益率 = 上涨概率 × 上涨收益率 + (1 − 上涨概率) × 下跌收益率

期权价值 = （上涨概率 × 期权组合上行收益 + (1 − 上涨概率) × 期权组合下行收益）× $e^{-Rt}$
