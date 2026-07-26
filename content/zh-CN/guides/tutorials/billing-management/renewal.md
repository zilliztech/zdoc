---
title: "续订说明 | Cloud"
slug: /renewal
sidebar_label: "续订说明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "包年包月集群到期后将被移至回收站。如果您想继续使用集群，需要在规定时间内续订集群，以免集群停机影响您的业务。 | Cloud"
type: origin
token: BMzFwP8BbiUeAbkZ0abcDIHlnle
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 续订说明

包年包月集群到期后将被移至回收站。如果您想继续使用集群，需要在规定时间内续订集群，以免集群停机影响您的业务。

续订操作仅适用于包年包月集群，按量计费集群不涉及续订管理，只需确保组织指定的支付方式中余额充足即可。

本文将介绍如何对包年包月集群进行续订管理。

## 包年包月集群生命周期\{#}

![RwL8wTxbsh1ZpJbFb1acTeOInMh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RwL8wTxbsh1ZpJbFb1acTeOInMh.png)

- 新购包年包月集群后，集群待创建完成后状态会转变为“**运行中**”。

    ![DeIYbABboodOxhxAqYuc7F2mnub](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/deiybabboodoxhxaqyuc7f2mnub.png "DeIYbABboodOxhxAqYuc7F2mnub")

- 集群剩余时长小于等于 30 天时，集群状态会转变为**“即将过期”**。集群详情页顶部会提示集群剩余天数。集群处于该状态时，您可以进行手动续费或开启自动续费，以免集群到期影响您的服务。成功续订并支付订单后，您的集群状态将转为**“运行中”**。

    ![T911bXdsqoi3XGxcYV8cAI68nha](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/t911bxdsqoi3xgxcyv8cai68nha.png "T911bXdsqoi3XGxcYV8cAI68nha")

- 集群过期后，集群状态会转变为“**已过期**”。

- 集群过期后的 7 天内为缓冲期。在此期间，集群状态持续为**“已过期”**，您仍旧可以手动续订集群或开启自动续订。

    ![KVsnbTHsDo5Z5VxtzKnc0hS9nF9](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/kvsnbthsdo5z5vxtzknc0hs9nf9.png "KVsnbTHsDo5Z5VxtzKnc0hS9nF9")

- 集群过期后的第 8 天（即缓冲期结束），集群被移至回收站。在集群列表页顶部会提示您有包年包月集群被移至回收站。集群被移至回收站后的 30 天内，您仍旧可以前往回收站恢复集群。

    ![ADw3bw7upoFIv0xjQnLccuAGnpe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/adw3bw7upofiv0xjqnlccuagnpe.png "ADw3bw7upoFIv0xjQnLccuAGnpe")

- 集群被移至回收站 30 天后，集群被彻底删除，集群数据无法恢复。

## 续订管理\{#}

Zilliz Cloud 提供两种续订方式，您可以根据自己的需求选择合适的续订方式。

- [手动续订](./renewal)：包年包月集群从购买到被移至回收站之前，您可以随时为集群进行手动续订，以延长集群的使用时间。

- [自动续订](./renewal)：开启自动续订后，集群会在每次到期前自动进行续订，避免您因忘记手动续订而导致集群被自动删除。

### 手动续订\{#}

<Procedures>

1. 前往**费用中心**，切换至**续订**页签。找到目标集群，点击右侧的**续订**按钮。

    ![Qu7rbSw1Lo0qQHxP9q6c9j3NnVg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/qu7rbsw1lo0qqhxp9q6c9j3nnvg.png "Qu7rbSw1Lo0qQHxP9q6c9j3NnVg")

1. 选择续订时长，确认订单金额，点击确认。

    ![L5w0bHvF2oeYnMxq3ZIcEBfjnEe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/l5w0bhvf2oeynmxq3zicebfjnee.png "L5w0bHvF2oeYnMxq3ZIcEBfjnEe")

    <Admonition type="info" icon="📘" title="📘 说明">

    续订订单金额 = 集群 CU 规格 x Replica 数量 x CU 官网列表单价 x 续订时长 x 折扣。

    </Admonition>

1. Zilliz Cloud 将生成一份类型为**新购**的**待支付**订单。请检查订单内容并及时完成支付。

    ![CqZbbZCS0oINqfx5Gadc0uITnyg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/cqzbbzcs0oinqfx5gadc0uitnyg.png "CqZbbZCS0oINqfx5Gadc0uITnyg")

</Procedures>

<Admonition type="info" icon="📘" title="说明">

如果您的组织现金余额不足，请先进行现金充值（对公转账）。详情请见[现金充值（对公转账）](./cash-recharge)。

充值成功后，您可以前往**费用中心>订单**页支付订单。详情请见[管理订单](./manage-orders)。

订单生成后 7 天内未完成支付，系统将自动取消订单。如仍需创建包年包月集群，请重新完成步骤 1 的操作并支付新订单。

</Admonition>

### 自动续订\{#}

