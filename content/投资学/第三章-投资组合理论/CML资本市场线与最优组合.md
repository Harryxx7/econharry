---
title: 资本配置线、CML与最优风险组合
subject: 投资学
chapter: 第三章-投资组合理论
tags: [CML, 资本配置线, 最优风险组合, 有效前沿, 夏普比率]
difficulty: hard
flashcard: true
---

## 问题
资本配置线（CAL）、资本市场线（CML）的方程是什么？最优风险组合如何确定？

## 答案

### 1. 市场组合的风险溢价

$$E(r_M) - r_f = \bar{A}\sigma_M^2$$

$\bar{A}$ 为市场平均风险厌恶系数。

---

### 2. 资本配置线（CAL）

$$E(r_c) = r_f + \frac{\sigma_c}{\sigma_p} \cdot [E(r_p) - r_f] = r_f + \frac{E(r_p) - r_f}{\sigma_p} \cdot \sigma_c$$

斜率 = **夏普比率** = $\frac{E(r_p) - r_f}{\sigma_p}$

---

### 3. 资本市场线（CML）

当风险资产组合取市场组合时：

$$E(R_p) = R_f + \frac{E(R_M) - R_f}{\sigma_M} \times \sigma_p$$

CML 描述了**有效前沿**，只有均值-方差有效组合才在 CML 上。

---

### 4. 效用函数（投资者偏好）

$$U = E(r) - \frac{1}{2}A\sigma^2$$

- $A > 0$：风险厌恶，$A = 0$：风险中性，$A < 0$：风险偏好

**最优风险资产头寸**（投资于风险资产的比例 $y^*$）：

$$y^* = \frac{E(r_p) - r_f}{A\sigma_p^2}$$

---

### 5. 最小方差组合的权重

两资产最小方差组合：

$$w_{Min}(D) = \frac{\sigma_E^2 - Cov(r_D, r_E)}{\sigma_D^2 + \sigma_E^2 - 2Cov(r_D, r_E)}$$

$$w_E = 1 - w_D$$

---

### 6. 最优风险组合（切线组合）

$$w_D^* = \frac{E(R_D)\sigma_E^2 - E(R_E)Cov(R_D, R_E)}{E(R_D)\sigma_E^2 + E(R_E)\sigma_D^2 - [E(R_D) + E(R_E)]Cov(R_D, R_E)}$$

其中 $E(R_i) = E(r_i) - r_f$（超额收益）

## 考点提示
> CML vs SML 是高频混淆点：**CML 横轴是σ（标准差），只适用于有效组合**；**SML 横轴是β，适用于所有资产**。效用最大化求 $y^*$ 的公式要记熟，考研计算题常用。
