---
title: "创建集群 | BYOC"
slug: /create-cluster
sidebar_label: "创建集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供多种部署方式和计费方式的集群，方便您根据需求灵活选择合适的集群。 | BYOC"
type: origin
token: M3fWwcqJpimd7YkaoLucY7eBnne
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 创建集群

Zilliz Cloud 提供多种部署方式和计费方式的集群，方便您根据需求灵活选择合适的集群。

Zilliz Cloud 提供 Free、Serverless、Dedicated 三种部署方式的集群。其中，Dedicated 集群提供两种不同的计费方式——按量计费、包年包月。

本文将介绍 Dedicated 集群两种计费方式的区别。如需了解各种部署方式，请参考 [Zilliz Cloud 定价](http://zilliz.com.cn/pricing)。

### 包年包月 vs 按量计费\{#annual-subscription-vs-usage-based}

Zilliz Cloud 针对 Dedicated 集群提供按量计费和包年包月两种计费模式，以满足不同场景下的用户需求。

- **包年包月**：一种预付费模式，即先付费后使用，以集群订单中的购买时长为周期进行结算。购买时长越长，享受的折扣越大。包年包月的计费模式一般适用于需求量长期稳定、可预测的业务。

- **按量计费**：一种后付费模式，即先使用后付费，按照集群实际用量每小时计费，按月结算。按量计费模式允许您根据实际业务需求灵活地调整资源使用情况，无需提前预购资源，从而降低预购资源过多或不足的风险。

下表详细对比了两种计费模式之间的异同。

<table>
   <tr>
     <th><p><strong>计费方式</strong></p></th>
     <th><p><strong>包年包月</strong></p></th>
     <th><p><strong>按量计费</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>适用场景</strong></p></td>
     <td><p>适用于以下场景：</p><ul><li><p>可预估资源使用周期</p></li><li><p>具有较稳定的业务场景</p></li><li><p>需要长期使用资源</p><p>相比按量计费方式价格更优惠。</p></li></ul></td>
     <td><p>适用于以下场景：</p><ul><li><p>资源使用有临时性和突发性，无法进行准确预测</p></li><li><p>业务较为波动</p></li><li><p>资源需随时开通，随时删除</p><p>相比包年包月计费方式更灵活。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>折扣</strong></p></td>
     <td><ul><li><p>阿里云、腾讯云：</p><p>1 年 - 7 折</p><p>3年 - 5 折</p></li><li><p>亚马逊云科技：</p><p>1 年- 9 折</p></li></ul></td>
     <td><p>无折扣</p></td>
   </tr>
   <tr>
     <td><p><strong>定价（含折扣）</strong></p></td>
     <td><p>¥4599/年起</p><p>详情请见<a href="https://zilliz.com.cn/pricing">定价</a>或<a href="https://zilliz.com.cn/contact-sales">联系销售</a>。</p></td>
     <td><p>¥756/月起</p><p>详情请见<a href="https://zilliz.com.cn/pricing">定价</a>。</p></td>
   </tr>
   <tr>
     <td><p><strong>支付方式</strong></p></td>
     <td><ul><li><p>暂不支持优惠券抵扣</p></li><li><p>仅支持现金余额支付</p></li></ul></td>
     <td><ul><li><p>支持优惠券抵扣</p></li><li><p>支持现金余额支付</p></li><li><p>支持云市场订阅</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>计费规则</strong></p></td>
     <td><ul><li><p>CU 费用为包年包月费用，需一次性付清</p></li><li><p>存储、备份费用按量计费</p></li></ul></td>
     <td><p>CU、存储、备份、等费用均按量计费</p></td>
   </tr>
   <tr>
     <td><p><strong>创建方式</strong></p></td>
     <td><p>仅支持通过 Zilliz Cloud Web 控制台创建集群</p></td>
     <td><ul><li><p>支持通过Zilliz Cloud Web 控制台创建集群</p></li><li><p>支持通过 RESTful API 创建集群</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>变更配置</strong></p></td>
     <td><ul><li><p>仅支持集群扩容</p></li><li><p>仅支持增加集群 Replica 数量</p></li></ul></td>
     <td><ul><li><p>支持集群扩容和缩容</p></li><li><p>支持增加或减少集群 Replica 数量</p></li><li><p>支持弹性伸缩</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>变更计费方式</strong></p></td>
     <td><p>不支持</p></td>
     <td><p>不支持</p><p>您可以先创建包年包月集群，随后将按量计费集群迁移到新创建的包年包月集群。详情请参考<a href="./offline-migration">Zilliz Cloud 跨集群迁移</a>。</p><p>迁移完成后，请将您应用中用于连接集群 Endpoint 变更为新集群的 Endpoint。</p></td>
   </tr>
   <tr>
     <td><p><strong>续订与退订管理</strong></p></td>
     <td><ul><li><p>支持手动续订</p></li><li><p>不支持退订</p></li></ul></td>
     <td><p>无需进行续订与退订管理</p></td>
   </tr>
</table>

