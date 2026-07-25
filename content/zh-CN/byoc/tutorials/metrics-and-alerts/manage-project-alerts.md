---
title: "管理项目告警 | BYOC"
slug: /manage-project-alerts
sidebar_label: "管理项目告警"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "项目告警功能通过对集群指标（如 CU、Query QPS）进行主动监控，在满足指定条件时发送通知，帮助您主动监控 Zilliz Cloud 集群的状态。配置项目告警后，您能在潜在问题出现时立即收到通知，确保及时处理。 | BYOC"
type: origin
token: EUS8w4x9Ii0BmhkJBfQcsoFln5c
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 项目
  - 告警

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# 管理项目告警

项目告警功能通过对集群指标（如 CU、Query QPS）进行主动监控，在满足指定条件时发送通知，帮助您主动监控 Zilliz Cloud 集群的状态。配置项目告警后，您能在潜在问题出现时立即收到通知，确保及时处理。

## 开始前\{#before-you-start}

在创建或管理项目告警前，请确保您拥有：

- **组织管理员**或**项目管理员**角色权限。

## 查看项目告警\{#view-project-alerts}

在左侧导航栏中点击**项目告警**，即可访问项目告警仪表盘。

<Supademo id="cmbk6jzy68h60sn1ri2xm74jm" title="Zilliz Cloud - 查看项目告警 Demo" />

### 告警历史\{#alert-history}

当您需要调查过往事件、分析告警规律或展示系统可靠性时，请选择**告警历史**选项卡查看。

### 告警设置\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

使用**告警设置**选项卡可查看所有已配置的告警及其当前状态。这为您提供了一个监控覆盖范围的集中视图。

查看告警时，您会看到以下配置项：

<table>
   <tr>
     <th><p>字段</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>名称</p></td>
     <td><p>告警的描述性标识（例如：“高 CU 使用率 - Dedicated 集群”、“P99查询延迟”）</p></td>
   </tr>
   <tr>
     <td><p>状态</p></td>
     <td><p>开关按钮显示当前告警状态：启用 (Enabled)（主动监控）或 禁用 (Disabled)（不发送通知）</p></td>
   </tr>
   <tr>
     <td><p>目标集群</p></td>
     <td><p>被监控的集群 - 可以是特定集群（如 “Dedicated-02, Dedicated-01”）或所有专用集群（包括未来创建的集群）</p></td>
   </tr>
   <tr>
     <td><p>告警规则</p></td>
     <td><p>监控参数和触发条件的组合显示（例如：“CU 容量 &gt; 80%, 持续 &gt;= 10 分钟”、“查询延迟 (P99) &gt; 1000 毫秒, 持续 &gt;= 10 分钟”）</p></td>
   </tr>
   <tr>
     <td><p>告警等级</p></td>
     <td><p>影响等级分类</p><ul><li><p><strong>警告</strong>：接近限制</p></li><li><p><strong>紧急</strong>：需要立即关注</p></li></ul></td>
   </tr>
   <tr>
     <td><p>告警接收</p></td>
     <td><p>通知接收者，包括配置的邮箱地址和通知渠道。</p><p>可用通知渠道列表请参阅<a href="./manage-notification-channels">管理告警渠道</a>。</p></td>
   </tr>
   <tr>
     <td><p>静音周期</p></td>
     <td><p>在每次告警发送后的一段时间内抑制重复通知。</p><ul><li><p>如果持续告警，则在静音周期内不会重新发送通知。进入下一个周期之前，系统会重新发送通知。</p></li><li><p>如果告警解除，静音周期将被重置，并重新开始进行告警评估。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>操作</p></td>
     <td><p>可用的管理选项：编辑、克隆、删除</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

您可以查看项目内创建的告警列表。有关各参数具体含义，请参考 [List Alert Rules](/reference/restful/list-alert-rules-v2)。

```bash
export BASE_URL=https://api.cloud.zilliz.com.cn
export PROJECT_ID=proj-bf71ce2fd4f3785d*****
export API_KEY=c84c9a9515**********81319c2f147ffdd47ad6c36b31c126d1b790f457619c23237eba9287de73575943d2bfebcecd728bd07e

curl --request GET \
     --url "${BASE_URL}/v2/alertRules?projectId=${PROJECT_ID}" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json"
```

</TabItem>
</Tabs>

## 创建项目告警\{#create-project-alert}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

设置新的告警规则，从不同维度监控集群的性能和健康状态。

<Supademo id="cmbk75d218h70sn1rkh2gdpc6" title="Zilliz Cloud - 创建项目告警 Demo" />

</TabItem>
<TabItem value="Bash">

您可以为特定或全部 Dedicated 集群创建告警。有关各参数具体含义，请参考 [Create Alert Rule](/reference/restful/create-alert-rule-v2)。

```bash
export BASE_URL=https://api.cloud.zilliz.com.cn
export PROJECT_ID=proj-bf71ce2fd4f3785d*****
export API_KEY=c84c9a9515**********81319c2f147ffdd47ad6c36b31c126d1b790f457619c23237eba9287de73575943d2bfebcecd728bd07e

curl --request POST \
     --url "${BASE_URL}/v2/alertRules" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
       "projectId": "'"${PROJECT_ID}"'",
       "ruleName": "High CU Computation",
       "level": "CRITICAL",
       "metricName": "CU_COMPUTATION",
       "metricUnit": "percent",
       "threshold": 80,
       "windowSize": 10,
       "comparisonMethod": "GREATER_THAN",
       "targetClusterIds": ["in01-fbc09dde0a4bfc5"],
       "enabled": true,
       "sendResolved": true,
       "actions": [
         {
           "type": "EMAIL",
           "config": {
             "recipients": {
               "members": ["leryn.li@zilliz.com.cn"],
               "orgRoles": ["OWNER"],
               "projectRoles": ["OWNER"]
             }
           }
         }
       ]
     }'
```

</TabItem>
</Tabs>

## 管理项目告警\{#manage-project-alert}

修改、整理和维护现有告警，确保监控始终相关且高效。

<Supademo id="cmbk9kxck018zxu0jw4ljw3jx" title="管理项目告警" isShowcase="true" />

<Admonition type="info" icon="📘" title="Notes">

<p>您可以通过 RESTful API 管理告警。有关具体信息，请参考  <a href="/reference/restful/update-alert-rule-v2">Update Alert Rule</a> 和 <a href="/reference/restful/delete-alert-rule-v2">Delete Alert Rule</a>。</p>

</Admonition>

### 禁用或启用项目告警\{#enable-or-disable-project-alert}

在不丢失配置的情况下控制主动监控。

- 禁用告警：停止发送通知，但保留所有设置。

- 启用告警：主动监控集群，并在阈值被突破时发送通知。

### 编辑项目告警\{#edit-project-alert}

当监控需求变化时，更新告警配置。

可修改任何告警参数，包括：

- 阈值和比较运算符

- 目标集群和指标类型

- 通知接收者、渠道、静音周期等

- 严重级别和持续时间设置

### 复制项目告警\{#clone-project-alert}

以最小的设置工作量创建相似的告警。复制操作会复制所有现有设置，使您可以：

- 为不同的集群环境创建类似告警模板

- 调整阈值同时保持其他参数不变

- 跨多个项目扩展监控范围

### 删除项目告警\{#delete-a-project-alert}

您可以删除不需要的项目告警。

<Admonition type="caution" icon="🚧" title="警告">

<p>告警删除是永久性的且无法撤销。请确保不再需要该告警后再进行操作。</p>

</Admonition>

## 配置告警接收设置\{#configure-alert-receiver-settings}

设置项目范围内的默认通知设置，确保团队采用一致的监控实践。

<Supademo id="cmbk9psuk8hqqsn1rrpqu0hmo" title="Zilliz Cloud - 配置告警接收设置 Demo" />

配置设置时，您会遇到以下概念：

- **发送给**：为新告警自动选择的默认通知渠道（邮箱、企业微信、Webhook）。配置您最常用的渠道可简化告警创建流程。

- **告警恢复通知**：启用后，当告警恢复（条件不再满足）时您将收到通知。

- **将设置应用于现有告警**：选择是否用新的默认设置更新所有现有告警。

## FAQ\{#faq}

### 告警触发后，我会多久收到一次通知？

告警通知遵循自动频率模式：

- 首次通知：告警阈值被突破时立即发送。

- 第二次通知：如果条件持续存在，1小时后发送。

- 后续通知：只要告警条件仍处于活动状态，每天发送一次。

如果您觉得通知过于频繁，可以：

- [编辑告警](./manage-project-alerts#edit-project-alert)以调整条件阈值或持续时间要求。

- 暂时[禁用告警](./manage-project-alerts#enable-or-disable-project-alert)以停止所有通知（同时保留配置）。

