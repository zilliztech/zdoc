---
title: "了解账单 | BYOC"
slug: /view-invoice
sidebar_label: "了解账单"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 按月度出账单，您可以根据账单数据与 Zilliz Cloud 进行实际结算。 | BYOC"
type: origin
token: NhbHwPiL2i4KWskrcO4cDrSNnzh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 了解账单

Zilliz Cloud 按月度出账单，您可以根据账单数据与 Zilliz Cloud 进行实际结算。

<Admonition type="info" icon="📘" title="📘 说明">

如需管理账单，您的角色需要为**组织管理员**或**项目管理员**。

如果您通过云市场订阅 Zilliz Cloud 服务，请前往对应的云市场查看账单。

</Admonition>

## 解读账单\{#understand-your-invoices}

每张账单都包含几个关键组成部分。本节将通过一张示例账单，帮助您理解账单页面中每个部分。

### 账单计费周期\{#billing-cycle}

账单的计费周期显示在账单顶部，反映了计算费用的期间以及账单到期日。

![W7SgwRPXchxIecb5mu8cMla8nHh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/W7SgwRPXchxIecb5mu8cMla8nHh.png)

- **账单周期**：即账单覆盖的消费时间范围。目前 Zilliz Cloud 费用为月结，所以以月为单位出具账单。账单周期一般为一个完整月，起始时间为上一个月的第一天 00:00:00（UTC），结束时间为上一个月最后一天的 23:59:59（UTC）。例如，Zilliz Cloud 会在 2024 年 9 月 1 日出具 8 月的月度账单，账单起始时间为 2024 年 8 月 1 日 00:00:00（UTC） 至 2024 年 8 月 31 日 23:59:59（UTC）。

- **出账时间**：即每月出账单的时间。目前 Zilliz Cloud 费用为月结，所以出账时间一般为每月 1 号。

### 账单状态\{#invoice-status}

在 Zilliz Cloud 中，账单状态代表付款过程中的不同阶段。下表解释了每种账单状态：

| **状态** | **定义** |
| --- | --- |
| **未出账** | 费用未结算，累账中，仍未出账单。暂时不需要付款。 |
| **待确认** | 账单已出账，等待用户手动确认账单。确认期目前为 3 个工作日，超过 3 个工作日仍未确认，系统将自动确认账单并进入开票流程。 |
| **质疑中** | 对账单存在疑问，用户已手动点击存疑。系统不会自动扣款和开票，等待线下沟通。 |
| **开票中** | 账单已确认并进入税务局的税务系统排队，等待开票。 |
| **未支付** | 账单已出账，但在账期内和催款期内未完成付款。 |
| **已逾期** | 账单已出账，但在催款期后仍未完成付款。 |
| **已支付** | 已完成付款，付清所有费用。 |
| **免费** | 所有应付金额均已使用优惠券抵扣。 |

### 账单详情\{#invoice-summary}

账单详情部分提供了总体费用的说明。账单详情包含以下几项数据。

- **BYOC 按需 vCPU 用量总金额**：BYOC 资源超出合同中承诺的固定 vCPU 用量后产生的按需 vCPU 用量费用。

- **优惠券**：抵扣费用时所使用的优惠券数额。

- 应付总金额：应付总金额 = BYOC 按需 vCPU 用量总金额 - 优惠券。

- **现金余额扣款**：用于支付账单费用的现金余额。

- **未支付金额**：未支付金额 = 应付总金额 - 现金余额扣款。当账单状态为**已支付**时，未支付金额等于零。

<Admonition type="info" icon="📘" title="说明">

通过界面账单详情页和账单 API 接口[查看发票列表](https://docs.zilliz.com.cn/reference/restful/list-invoices-v2)和[查看发票详情](https://docs.zilliz.com.cn/reference/restful/describe-invoice-v2)获取的账单金额精度均为 2 位小数。

</Admonition>

### 账单信息\{#billing-profile}

账单信息板块包含了开具账单的对象名称、公司和邮箱。账单信息中输入的邮箱将同组织管理员和组织账单管理员一同收到账单相关邮件。因此，如需增加账单接收人，您可以直接在账单信息中添加接收人的邮件地址或[邀请](./organization-users)新用户以组织账单管理员身份加入组织。

如需编辑账单信息，请前往账单概览页，点击账单信息区域的**编辑**按钮。

![edit-billing-profile-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/edit-billing-profile-cn.png "edit-billing-profile-cn")

## 管理账单\{#manage-invoices}

如果您具备组织管理员或账单管理员权限，您可以查看、确认、支付、下载账单。

### 查看账单列表\{#list-all-invoices}

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

1. 点击左侧导航栏中的**账单**。

1. 切换至**历史账单**页面。您可以查看当月账单和所有历史账单。

![view-invoices-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view-invoices-cn.png "view-invoices-cn")

</TabItem>

<TabItem value="bash">

<Admonition type="info" icon="📘" title="📘 说明">

查看发票列表的 RESTful API 目前还处于公测阶段，如需使用请[联系我们](http://support.zilliz.com.cn)。

</Admonition>

以下为示例代码，请将示例中的 `{TOKEN}` 替换为您自己的Zilliz Cloud API 密钥。同时，请确保使用的 API 密钥具备[组织管理员或组织账单管理员的角色](./organization-users)。

以下 `GET` 请求可用于查看您组织中的所有账单。

```bash
curl --request GET \
--url "https://api.cloud.zilliz.com.cn/v2/invoices" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
      
# {
#     "code": 0,
#     "data": {
#         "count": 1,
#         "currentPage": 1,
#         "pageSize": 10,
#         "invoices": [
#             {
#                 "id": "inv-12312io23810o291",
#                 "orgId": "org-xxxxxx",
#                 "periodStart": "2024-01-01T00:00:00Z",
#                 "periodEnd": "2024-02-01T00:00:00Z",
#                 "invoiceDate": "2024-02-01T00:00:00Z",
#                 "dueDate": "2024-02-01T00:00:00Z",
#                 "currency": "RMB",
#                 "status": "unpaid",
#                 "usageAmount": 52400,
#                 "creditsApplied": 12400,
#                 "alreadyBilledAmount": 0,
#                 "subtotal": 40000,
#                 "tax": 5000,
#                 "total": 45000,
#                 "advancePayAmount": 0,
#                 "amountDue": 45000
#             }
#         ]
#     }
# }
```

<Admonition type="info" icon="📘" title="说明">

API 返回的结果中，所有金额单位为分。

</Admonition>

</TabItem>

</Tabs>

### 查看账单详情\{#view-the-details-of-a-specific-invoice}

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

1. 点击左侧导航栏中的**账单**。

1. 切换至**历史账单**页面。

1. 点击账单周期即可查看特定账单的详情。

![view-invoice-detail-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view-invoice-detail-cn.png "view-invoice-detail-cn")

</TabItem>

<TabItem value="bash">

<Admonition type="info" icon="📘" title="📘 说明">

查看发票详情的 RESTful API 目前还处于公测阶段，如需使用请[联系我们](http://support.zilliz.com.cn)。

</Admonition>

以下为示例代码，请将示例中的 `{TOKEN}` 替换为您自己的Zilliz Cloud API 密钥。同时，请确保使用的 API 密钥具备[组织管理员或组织账单管理员的角色](./organization-users)。

以下 `GET` 请求可用于查看某一特定账单的详情。

```bash
curl --request GET \
--url "https://api.cloud.zilliz.com.cn/v2/invoices/${INVOICE_ID}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
      
# {
#     "code": 0,
#     "data": {
#         "id": "inv-12312io23810o291",
#         "orgId": "org-xxxxxx",
#         "periodStart": "2024-01-01T00:00:00Z",
#         "periodEnd": "2024-02-01T00:00:00Z",
#         "invoiceDate": "2024-02-01T00:00:00Z",
#         "dueDate": "2024-02-01T00:00:00Z",
#         "currency": "USD",
#         "status": "unpaid",
#         "usageAmount": 52400,
#         "creditsApplied": 12400,
#         "alreadyBilledAmount": 0,
#         "subtotal": 40000,
#         "tax": 5000,
#         "total": 45000,
#         "advancePayAmount": 0,
#         "amountDue": 45000
#     }
# }
```

以下为参数说明：

- `{Token}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。

- `{INVOICE_ID}`: 需要查看的目标账单的 ID。

<Admonition type="info" icon="📘" title="说明">

API 返回的结果中，所有金额单位为分。

</Admonition>

</TabItem>

</Tabs>

### 支付账单\{#pay-invoice}

账单逾期后，可以先检查您的优惠券余额和现金余额，然后尝试重新支付账单。

![pay-invoice-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/pay-invoice-cn.png "pay-invoice-cn")

### 下载账单\{#download-invoice}

如需下载账单，请点击目标账单右侧的下载按钮。

![download-invoices-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/download-invoices-cn.png "download-invoices-cn")

## 常见问题\{#troubleshooting-faq}

#### **什么是月度账单？月度账单的起始时间是什么？**\{#}

**说明：**目前 Zilliz Cloud 费用为月结，所以以月为单位出具账单。账单周期一般为一个完整月，起始时间为上一个月的第一天 00:00:00（UTC），结束时间为上一个月最后一天的 23:59:59（UTC）。

**示例**：Zilliz Cloud 会在 2024 年 9 月 1 日出具 8 月的月度账单，账单起始时间为 2024 年 8 月 1 日 00:00:00（UTC）至 2024 年 8 月 31 日 23:59:59（UTC）。

#### **Zilliz Cloud 账单金额的精度为多少？**\{#zilliz-cloud}

Zilliz Cloud 的计费精度为 **10 位小数**，所有账单均按此精度计算。每日费用会先进行汇总，并在计费过程中四舍五入至 10 位小数。

- **RESTful API**：所有数值（如单价、用量、用量金额）始终返回**精确到 10 位小数**。如果不足 10 位小数，则会在末尾补零以保持 10 位。更多关于如何使用 RESTful API 的信息，请参阅[查询日用量](https://docs.zilliz.com.cn/reference/restful/query-daily-usage-v2) 。

- **Web 控制台**：展示的数值与 API 保持一致，但为了便于阅读，界面会省略末尾的连续零。例如，`0.1234000000` 会在界面上显示为 `0.1234`。

#### 为什么我无法查看账单？\{#}

**可能原因**：只有组织管理员或账单管理员有权查看账单。

**解决方法**：确保您拥有相应的权限。如果您无法查看账单，请联系您的组织管理员或账单管理员。

#### **如果账单支付失败怎么办？**\{#}

**可能原因**：您的现金余额或优惠券余额不足。

**解决方法**：如果支付失败，Zilliz Cloud 将通过电子邮件通知组织管理员和账单管理员。组织管理员或账单管理员可以在 14 天催款期内前往 Zilliz Cloud 账单页面重新支付。

