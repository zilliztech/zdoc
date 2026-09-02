---
title: "包年集群续订说明 | Cloud"
slug: /renew-annual-subscription
sidebar_label: "包年集群续订说明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "包年包月集群到期后将被移至回收站。如果您想继续使用集群，需要在规定时间内续订集群，以免集群停机影响您的业务。 | Cloud"
type: origin
token: BMzFwP8BbiUeAbkZ0abcDIHlnle
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 包年集群续订说明

包年包月集群到期后将被移至回收站。如果您想继续使用集群，需要在规定时间内续订集群，以免集群停机影响您的业务。

续订操作仅适用于包年包月集群，按量计费集群不涉及续订管理，只需确保组织指定的支付方式中余额充足即可。

本文将介绍如何对包年包月集群进行续订管理。

## 包年包月集群生命周期\{#lifecycle-of-an-annual-subscription-cluster}

![IbdHwrbSQhsEdHb4KsvcF3RGn8d](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/IbdHwrbSQhsEdHb4KsvcF3RGn8d.png)

- 新购包年包月集群后，集群待创建完成后状态会转变为“**运行中**”。

- 您可以对您购买的包年集群进行手动续订或开启自动续订，以免集群到期影响您的服务。

- 包年集群有效期到期后的 7 天内为缓冲期。在此期间，您仍旧可以手动续订集群或开启自动续订。

- 集群过期后的第 8 天（即缓冲期结束），集群被移至回收站。在集群列表页顶部会提示您有包年包月集群被移至回收站。集群被移至回收站后的 30 天内，您仍旧可以[前往回收站恢复集群](./use-recycle-bin)。

- 集群被移至回收站 30 天后，集群被彻底删除，集群数据无法恢复。

## 续订管理\{#}

Zilliz Cloud 提供两种续订方式，您可以根据自己的需求选择合适的续订方式。

- [手动续订](./renew-annual-subscription)：包年包月集群从购买到被移至回收站之前，您可以随时为集群进行手动续订，以延长集群的使用时间。

- [自动续订](./renew-annual-subscription)：开启自动续订后，集群会在每次到期前自动进行续订，避免您因忘记手动续订而导致集群被自动删除。

<Admonition type="info" icon="📘" title="说明">

系统将按照集群原有配置（包年时长、Query CU、Replica 数量）进行续订。

续订订单金额 = 集群 CU 规格 x Replica 数量 x CU 官网列表单价 x 续订时长 x 折扣。

</Admonition>

续订完成后，您可以针对续订订单进行开票。详情请参考[开具发票](./manage-invoice)。

### 手动续订\{#}

<Procedures>

1. 前往**费用中心**，切换至**订单**页签。找到在有效期内的订单，点击对应订单号。

    ![S0ASweey7hHPXUbeWBuc6lQ0nMh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/S0ASweey7hHPXUbeWBuc6lQ0nMh.png)

1. 在订单详情页，点击**立即续订**。随后选择合适的支付方式，点击**支付**。

    ![BfiOwpsMmhBFvnb0C55clZsdnSg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/BfiOwpsMmhBFvnb0C55clZsdnSg.png)

</Procedures>

### 自动续订\{#}

<Procedures>

1. 前往**费用中心**，切换至**订单**页签。打开顶部**自动续订**开关。

    ![QrYIbKnExonKVExQuEmcbclKnRf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/qryibknexonkvexquemcbclknrf.png "QrYIbKnExonKVExQuEmcbclKnRf")

1. 开启后，当前组织的所有现有和未来包年订单都将在即将到期前自动续订。

    <Admonition type="info" icon="📘" title="说明">

    开启自动续订后，系统不会立即创建订单或扣款，您仍可随时按需进行手动续订。

    </Admonition>

</Procedures>

