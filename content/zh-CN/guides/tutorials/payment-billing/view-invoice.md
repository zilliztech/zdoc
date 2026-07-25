---
title: "了解账单 | Cloud"
slug: /view-invoice
sidebar_key: view-invoice
sidebar_label: "了解账单"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 按月度出账单，您可以根据账单数据与 Zilliz Cloud 进行实际结算。 | Cloud"
type: origin
token: NhbHwPiL2i4KWskrcO4cDrSNnzh
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 账单
  - 支付方式

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 了解账单

Zilliz Cloud 按月度出账单，您可以根据账单数据与 Zilliz Cloud 进行实际结算。

在 Zilliz Cloud 中，账单与订单的概念有所不同，主要区别如下：

- **订单**：当您购买、续订、升配 Zilliz Cloud 包年包月集群时生成的记录被称为订单。订单包含了您所购集群的具体信息（如集群配置参数、购买时长等）、价格等细节。订单通常只涉及单次购买交易的信息，每次下单都会生成一个新的订单，展示单次购买交易的详细信息。

- **账单**：账单则是对一定周期内所有消费行为（包括但不限于通过订单产生的费用）的汇总报告。账单不仅涵盖了订单结算的部分，还包含按量计费的资源使用情况、优惠券抵扣等信息。账单包含一段时间内的全部收费项目及其明细，为用户提供更全面的成本视图。

本指南将解释如何查看、支付和下载账单，以及如何解读您的账单内容。更多订单相关说明，请参考[管理订单](./manage-order)。

<Admonition type="info" icon="📘" title="说明">

如需管理账单，您的角色需要为**组织管理员**或**项目管理员**。

如果您通过云市场订阅 Zilliz Cloud 服务，请前往对应的云市场查看账单。

</Admonition>

## 解读账单\{#understand-your-invoices}

每张账单都包含几个关键组成部分。本节将通过一张示例账单，帮助您理解账单页面中每个部分。

![example-invoice-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/example-invoice-cn.png "example-invoice-cn")

### 账单计费周期\{#billing-cycle}

账单的计费周期显示在账单顶部，反映了计算费用的期间以及账单到期日。

![W7SgwRPXchxIecb5mu8cMla8nHh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/W7SgwRPXchxIecb5mu8cMla8nHh.png)

- **账单周期**：即账单覆盖的消费时间范围。目前 Zilliz Cloud 费用为月结，所以以月为单位出具账单。账单周期一般为一个完整月，起始时间为上一个月的第一天 00:00:00（UTC），结束时间为上一个月最后一天的 23:59:59（UTC）。例如，Zilliz Cloud 会在 2024 年 9 月 1 日出具 8 月的月度账单，账单起始时间为 2024 年 8 月 1 日 00:00:00（UTC） 至 2024 年 8 月 31 日 23:59:59（UTC）。

- **出账时间**：即每月出账单的时间。目前 Zilliz Cloud 费用为月结，所以出账时间一般为每月 1 号。

- **确认账单**：确认账单的窗口期目前为 3 个工作日。建议您及时登录 Zilliz Cloud 界面确认账单。如果对账单内容无异议，您可以手动点击确认账单，该账单将自动进入开票流程。如果对账单内容存疑，您也可以手动标记该账单为“存疑中”，该账单不会进入开票流程，系统也不会基于该账单进行自动扣款，Zilliz 财务人员会联系您进行线下沟通。如经线下沟通后解决疑问，您可以重新登录 Zilliz Cloud 界面手动确认账单。如果未在 3 个工作日的窗口期内及时确认账单，系统将自动帮您确认账单。

- **开票**：账单手动确认或自动确认后将进入开票流程。此时账单已进入税务局的系统队列中，Zilliz 预计将在 1-3 个工作日后以邮件的方式通知您开票结果。在此期间账单状态为“开票中”。开票成功时，该账单自动进入账期。如开票失败，您可以通过 finance@zilliz.com 联系我们申请重新开票。

- **账期**：即付款账期，是指您与 Zilliz 签约的合同信控条款中，约束您在消费后的应付账单，向 Zilliz 付款的账期约定规则。未签署信控条款的用户，账期默认为 0 天。账期开始时间以开票成功时间为准。Zilliz 的账期范围是 0-X 个自然日。根据签署的条款，账期会有所不同。账期内的账单状态为“**未支付**”。

- **催款期**：催款期目前为 14 天，在此期间仍可进行付款。催款期内，Zilliz 将每天发送电子邮件提醒您支付账单。催款期内账单状态为“**未支付**”。

- **账单逾期日（组织冻结）**：即组织冻结日。如果您未在催款期结束时成功付款，您的组织将立刻被冻结，账单状态转为“**已逾期”**。在此期间，您仍可支付账单。冻结 1 天后仍未付款，组织集群将被自动移至回收站。

### 账单状态\{#invoice-status}

在 Zilliz Cloud 中，账单状态代表付款过程中的不同阶段。下表解释了每种账单状态：

<table>
   <tr>
     <th><p><strong>状态</strong></p></th>
     <th><p><strong>定义</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>未出账</strong></p></td>
     <td><p>费用未结算，累账中，仍未出账单。暂时不需要付款。</p></td>
   </tr>
   <tr>
     <td><p><strong>待确认</strong></p></td>
     <td><p>账单已出账，等待用户手动确认账单。确认期目前为 3 个工作日，超过 3 个工作日仍未确认，系统将自动确认账单并进入开票流程。</p></td>
   </tr>
   <tr>
     <td><p><strong>质疑中</strong></p></td>
     <td><p>对账单存在疑问，用户已手动点击存疑。系统不会自动扣款和开票，等待线下沟通。</p></td>
   </tr>
   <tr>
     <td><p><strong>开票中</strong></p></td>
     <td><p>账单已确认并进入税务局的税务系统排队，等待开票。</p></td>
   </tr>
   <tr>
     <td><p><strong>未支付</strong></p></td>
     <td><p>账单已出账，但在账期内和催款期内未完成付款。</p></td>
   </tr>
   <tr>
     <td><p><strong>已逾期</strong></p></td>
     <td><p>账单已出账，但在催款期后仍未完成付款。</p></td>
   </tr>
   <tr>
     <td><p><strong>已支付</strong></p></td>
     <td><p>已完成付款，付清所有费用。</p></td>
   </tr>
   <tr>
     <td><p><strong>免费</strong></p></td>
     <td><p>所有应付金额均已使用优惠券抵扣。</p></td>
   </tr>
</table>

### 账单详情\{#invoice-summary}

账单详情部分提供了总体费用的说明。账单详情包含以下几项数据。

- **包年包月订单总金额**：当月已支付的包年包月订单金额总和。

- **按量计费用量总金额**：所有 Serverless 集群费用、按量计费 Dedicated 集群费用、包年包月 Dedicated 集群额外产生的按量计费的存储和备份费用的总和。

- **优惠券**：抵扣费用时所使用的优惠券数额。

- **应付总金额**：应付总金额 = 包年包月订单总金额 + 按量计费用量总金额 - 优惠券。

- **现金余额扣款**：用于支付账单费用的现金余额。

- **未支付金额**：未支付金额 = 应付总金额 - 现金余额扣款。当账单状态为**已支付**时，未支付金额等于零。

<Admonition type="info" icon="📘" title="说明">

通过界面账单详情页和账单 API 接口[查看发票列表](/reference/restful/list-invoices-v2)和[查看发票详情](/reference/restful/describe-invoice-v2)获取的账单金额精度均为 2 位小数。

</Admonition>

### 费用（按计费方式汇总）\{#summary-by-billing-method}

费用汇总根据计费方式分为两部分：

- **按量计费费用**：以下三部分费用的总和。

    - Serverless 集群费用

    - 按量计费 Dedicated 集群费用

    - 包年包月 Dedicated 集群额外产生的存储、备份费用

- **包年包月订单费用**：所有当月已支付的订单金额的总和。

### 费用明细\{#invoice-details}

费用明细部分提供按量计费费用的详细情况。费用明细部分的用量金额精度均为小数点后 2 位。

费用明细中包含以下几个计费项：

- **CU 费用**：按量计费。计算公式为 `CU 费用 = 集群当前 CU 规格 x 集群运行小时数 x CU 价格`。因为Dedicated 集群享受专属的机器资源，所以即使无查询、读写操作，Dedicated 集群正常运行也会收取 CU 费用。

    <Admonition type="info" icon="📘" title="说明">

    Dedicated 集群费用中，运行时长特指集群处于“**运行中**”、“**修改中**”、“**已冻结**”等一系列状态下持续的时长。集群处于“**创建中**”、“**挂起中**”、“**恢复运行中**”、“**已挂起**”的状态时不收取 CU 费用。

    </Admonition>

- **存储费用**：计算公式为`存储费用 = 存储文件大小 x 集群运行时长 x 存储单价`。其单位为“GB-Hour”，特指存储 1 GB 数据并保留 1 个小时的用量。**集群存储按小时计费。若存储不满 1 小时，仍按 1 小时收费**。

    <Admonition type="info" icon="📘" title="说明">

    存储费用中，运行时长特指集群处于“**运行中**”、“**修改中**”、“**已冻结**”等一系列状态下持续的时长。集群处于“**创建中**”的状态时不收取存储费用。

    </Admonition>

- **备份费用**：计算公式为`备份费用 = 备份文件大小 x 备份保留时长 x 备份单价`。其单位为“GB-month”，特指存储 1 GB 备份文件并保留 1 个月的用量。**集群备份按天计费。若备份文件保留时间不满 1 天，仍按 1 天收费。**

- **读取费用**：即用即付，基于查询次数计算 vCU 消耗量。`读取费用 = vCU 用量 x vCU 单价`。若Serverless 集群中无操作，则不计费或仅计算存储费用。

- **写入费用**：即用即付，基于写入数据量计算 vCU 消耗量。`写入费用 = vCU 用量 x vCU 单价`。若Serverless 集群中无操作，则不计费或仅计算存储费用。

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

<Admonition type="info" icon="📘" title="说明">

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

<Admonition type="info" icon="📘" title="说明">

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

### 确认账单\{#confirm-invoice}

账单出账后，将自动进入**待确认**状态，此时需要您在该账单的账单详情中手动确认账单。

点击**确认并开票**后，您的账单将自动进入开票流程，预计 1-3 个工作日后通知您开票结果。

如果您对账单金额存疑，可点击**对此账单有疑问**，该账单将会被标记为**质疑中**，Zilliz 的财务人员会尽快与您联系。疑问解决前，该账单不会进入自动开票，Zilliz 也不会基于该账单进行自动扣款。

![confirm-invoice-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/confirm-invoice-cn.png "confirm-invoice-cn")

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

- **RESTful API**：所有数值（如单价、用量、用量金额）始终返回**精确到 10 位小数**。如果不足 10 位小数，则会在末尾补零以保持 10 位。更多关于如何使用 RESTful API 的信息，请参阅[查询日用量](/reference/restful/query-daily-usage-v2) 。

- **Web 控制台**：展示的数值与 API 保持一致，但为了便于阅读，界面会省略末尾的连续零。例如，`0.1234000000` 会在界面上显示为 `0.1234`。

#### 为什么我无法查看账单？\{#}

**可能原因**：只有组织管理员或账单管理员有权查看账单。

**解决方法**：确保您拥有相应的权限。如果您无法查看账单，请联系您的组织管理员或账单管理员。

#### **如果账单支付失败怎么办？**\{#}

**可能原因**：您的现金余额或优惠券余额不足。

**解决方法**：如果支付失败，Zilliz Cloud 将通过电子邮件通知组织管理员和账单管理员。组织管理员或账单管理员可以在 14 天催款期内前往 Zilliz Cloud 账单页面重新支付。

#### 如果未及时确认账单会发生什么？\{#}

**说明**：账单处长后，Zilliz Cloud 会向您发送确认账单的电子邮件，您需要前往 Zilliz Cloud 界面手动确认账单。如果您在 3 个工作日内未确认账单，系统将自动帮您确认账单并进入开票流程。

**提示**：请在账单出账的 3 日内，尽快确认您的账单。

#### 什么是账期？\{#}

**说明**：是指您与 Zilliz 签约的合同信控条款中，约束您在消费后的应付账单，向 Zilliz 付款的账期约定规则。账期开始时间以开票成功时间为准。Zilliz 的账期范围是 0-X 个自然日。根据签署的条款，账期会有所不同。未签署信控条款的用户，账期默认为 0 天。

#### **什么是催款期？**\{#}

**说明**：催款期是一个为期 14 天窗口期。在此期间，您可以支付你的“**未支付**”账单。

**提示**：在此期间，您将每天收到电子邮件的催款提醒，且您的发票状态将持续显示“**未支付**”直到完成付款。

#### 如果催款期后仍未支付账单会发生什么?\{#}

**说明**：如果您未在催款期结束时成功付款，您的组织将立刻被冻结，账单状态转为“**已逾期”**。在此期间，您仍可支付账单。冻结 1 天后仍未付款，组织集群将被自动移至回收站。

**提示**：为了避免影响您的 Zilliz Cloud 服务，请在催款期结束前尽快完成支付。

#### **为什么 Serverless 集群中没有操作却仍然产生费用？**\{#serverless}

**说明**：即使 Serverless 集群中无读写操作，您仍需支付集群存储费用。存储费用根据存储的数据大小和在 Zilliz Cloud 中保留的时间计算。

**解决方法**：为了降低成本，您可以删除未使用的数据。

#### **收到组织被冻结的提醒邮件后该怎么办？**\{#}

**说明**：收到组织冻结的提醒邮件意味着您的账单已逾期，您在 Zilliz Cloud 的操作将受到限制。

**解决方法**：在组织冻结后的一天内完成付款，解冻组织。注意：冻结 1 天后仍未付款，您的组织集群将被自动删除。

#### 账单逾期后，组织集群被自动删除该如何恢复？\{#}

**说明**：组织冻结 1 天后仍未付款，您的组织集群将被自动删除。

**解决方法**：支付您的“**已逾期**”账单。付款成功后，组织将解冻，您可以通过回收站恢复已删除的集群。

**提示**：如果您在支付账单或恢复集群时遇到问题，请[提交工单](https://support.zilliz.com.cn/hc/zh-cn)。

