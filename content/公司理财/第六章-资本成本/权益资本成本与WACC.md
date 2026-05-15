---
title: 权益资本成本（DDM/CAPM）与WACC
subject: 公司理财
chapter: 第六章-资本成本
tags: [权益成本, DDM, CAPM, WACC, Beta]
difficulty: hard
flashcard: true
---

## 问题
权益资本成本有哪两种估算方法？WACC 如何计算？Beta 如何调整杠杆？

## 答案

### 1. 股利折现模型（DDM）估算权益成本

$$R_S = \frac{DIV_1}{P} + g$$

- $DIV_1$：下期股利，$P$：当前股价，$g$：股利增长率

---

### 2. CAPM 估算权益成本

$$R_S = R_f + \beta(R_M - R_f)$$

---

### 3. 加权平均资本成本（WACC）

$$R_{WACC} = \frac{S}{B+S} \times R_S + \frac{B}{B+S} \times R_B \times (1-t_c)$$

- $S$：权益市值，$B$：债务市值
- **债务成本乘以 $(1-t_c)$**（税后债务成本，利息可抵税）

---

### 4. 加权融资成本

$$f_0 = \frac{S}{V} f_S + \frac{B}{V} f_B$$

发行成本后的 NPV：

$$NPV = -\frac{\text{初始投资额}}{1 - f_0} + PV(\text{现金流})$$

---

### 5. Beta 的去杠杆与再杠杆（有税版本）

**无税时**（Beta 负债 = 0）：

$$\beta_{\text{权益}} = \beta_{\text{资产}} \times \left(1 + \frac{\text{负债}}{\text{权益}}\right)$$

**有税时**（Hamada 公式）：

$$\beta_{\text{权益}} = \beta_{\text{无杠杆企业}} \times \left[1 + (1-t_c)\frac{\text{负债}}{\text{权益}}\right]$$

去杠杆（求无杠杆 Beta）：

$$\beta_{\text{无杠杆}} = \frac{\beta_{\text{有杠杆}}}{1+(1-t_c)\frac{B}{S}}$$

**用途**：当目标企业与参考企业杠杆比率不同时，先去杠杆得到资产 Beta，再按目标杠杆比率重新加杠杆。

---

### 6. 有税时权益成本（MM 命题2）

$$R_S = R_0 + \frac{B}{S}(R_0 - R_B)(1-t_c)$$

## 考点提示
> **WACC 中债务成本必须乘以 $(1-t_c)$**，这是最常见的失误点。Beta 的去杠杆再杠杆（Hamada 公式）是可比公司法估值的核心步骤，计算题必考。
