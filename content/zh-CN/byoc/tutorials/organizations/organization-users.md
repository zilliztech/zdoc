---
title: "组织用户 | BYOC"
slug: /organization-users
sidebar_label: "组织用户"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，一个组织通常代表一家公司。您可以邀请员工加入您的组织，并根据他们的工作职能分配角色。这些角色决定了用户对特定资源的访问权限以及他们能执行的操作。例如，开发者通常需要访问数据的权限，但不需要管理账单的权限。 | BYOC"
type: origin
token: PzjhwZkgqiiVmakWT03c8VDAnTh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 组织用户

在 Zilliz Cloud 中，一个组织通常代表一家公司。您可以邀请员工加入您的组织，并根据他们的工作职能分配角色。这些角色决定了用户对特定资源的访问权限以及他们能执行的操作。例如，开发者通常需要访问数据的权限，但不需要管理账单的权限。

本指南将解释如何管理组织用户，包括如何邀请用户加入组织、撤销或重新发送邀请、修改组织用户的角色或移除组织用户。

## 邀请用户加入组织\{#invite-a-user-to-your-organization}

在邀请用户加入您的组织时，您需要为用户授予角色，该角色定义了用户在本组织内访问资源和执行特定操作的权限。 

要邀请用户，输入用户的电子邮箱地址，然后选择您希望授予的组织角色。

### 组织管理员\{#organization-owner}

组织管理员是 Zilliz Cloud 中的最高级别角色，具备管理组织及其所有资源（项目、集群、Database、Collection）的所有权限。这个角色应仅授予组织中一小部分用户。

下表罗列了该组织角色具备的界面和 API 操作权限。

<table>
   <tr>
     <th><p><strong>界面操作权限</strong></p></th>
     <th><p><strong>控制面 RESTful API (V2) 权限</strong></p></th>
     <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>管理组织中的所有项目</p></li><li><p>管理 <a href="./manage-api-keys">API 密钥</a></p></li><li><p><a href="./organization-users">管理组织用户</a></p></li><li><p><a href="./manage-organization-alerts">管理组织告警</a></p></li><li><p><a href="./view-activities">查看事件</a></p></li><li><p><a href="./organization-settings">管理组织设置</a></p></li><li><p><a href="./use-recycle-bin">使用回收站</a></p></li><li><p>以及<a href="./project-users">项目管理员</a>和<a href="./cluster-roles">集群 Admin</a> 的所有权限</p></li></ul></td>
     <td><p><a href="https://docs.zilliz.com.cn/reference/restful/control-plane-v2">所有控制面操作</a></p></td>
     <td><p><a href="https://docs.zilliz.com.cn/reference/restful/data-plane-v2">所有数据面操作</a></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

在调用数据面 RESTful API 接口时，请使用一个由冒号分隔的目标集群的用户名和密码，如 `username:password`，做为访问鉴权凭据。

</Admonition>

### 组织账单管理员\{#organization-billing-admin}

组织账单管理员具备管理组织账单费用的权限。这个角色 不具备访问组织中的其他数据的权限。

下表罗列了该组织角色具备的界面和 API 操作权限。

<table>
   <tr>
     <th><p><strong>界面操作权限</strong></p></th>
     <th><p><strong>控制面 RESTful API (V2) 权限</strong></p></th>
     <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>查看 <a href="./manage-api-keys">API 密钥</a></p></li><li><p>邀请<a href="./organization-users">组织用户</a></p></li><li><p>查看<a href="./organization-settings">组织设置</a></p></li></ul></td>
     <td><ul><li><a href="https://docs.zilliz.com.cn/reference/restful/query-daily-usage-v2">查询日用量</a></li></ul></td>
     <td><p>数据面权限取决于<a href="./project-users">项目</a>和<a href="./cluster-roles">集群角色</a>。但通常组织账单管理员不需要数据面的权限。</p></td>
   </tr>
</table>

### 组织角色\{#organization-role}

您可以为受邀用户创建组织角色。组织角色具备查看组织及其资源的权限。您还可以编辑授予该角色的用户在项目和集群层级的权限。

![ILRrwLSMqhcQ2sbb07zcDA0vnEi](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ILRrwLSMqhcQ2sbb07zcDA0vnEi.png)

#### 自定义项目权限\{#customize-project-privileges}

默认情况下，受邀用户会被授予 **Default Project** 的**项目管理员**权限。但是，您也可以选择**自定义**根据需要授予受邀用户更细粒度的权限。

![Q5jew39aHholc0bHGNicVg3Rngb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Q5jew39aHholc0bHGNicVg3Rngb.png)

默认情况下，受邀用户会被授予**所有集群**的访问权限，并开启**包含后续创建的所有集群**选项。您可以针对上述设置为受邀用户分配角色，如**读写**，以便赋予该用户在所有集群中的访问权限。当接受该邀请后，用户即可在指定项目中获得您设置的权限。

为了方便您进行访问控制，您也可以从下拉列表中选择具体的集群来限制受邀用户的访问范围。同时，您还可以关闭**包含后续创建的所有集群**选项来禁止受邀用户获取该项目中新建集群的访问权限。

您还可以单击 **+ 集群访问**来添加多条集群访问策略。

下表罗列了获得了该组织角色的用户具备的组织层面的界面和 API 操作权限。

<table>
   <tr>
     <th><p><strong>界面操作权限</strong></p></th>
     <th><p><strong>控制面 RESTful API (V2) 权限</strong></p></th>
     <th><p><strong>数据面 RESTful API (V2) 权限</strong></p></th>
   </tr>
   <tr>
     <td><ul><li><p>查看 <a href="./manage-api-keys">API 密钥</a></p></li><li><p>邀请<a href="./organization-users">组织用户</a></p></li><li><p>查看<a href="./organization-settings">组织设置</a></p></li></ul></td>
     <td><ul><li><p><a href="https://docs.zilliz.com.cn/reference/restful/cloud-meta-v2">所有 Cloud Meta 操作</a></p></li><li><p>部分 Cluster 操作</p><ul><li><p><a href="https://docs.zilliz.com.cn/reference/restful/list-projects-v2">查看项目列表</a></p></li><li><p><a href="https://docs.zilliz.com.cn/reference/restful/list-clusters-v2">查看集群列表</a></p></li><li><p><a href="https://docs.zilliz.com.cn/reference/restful/describe-cluster-v2">查看集群详情</a></p></li><li><p><a href="https://docs.zilliz.com.cn/reference/restful/query-cluster-metrics-v2">查询集群指标</a></p></li><li><p><a href="https://docs.zilliz.com.cn/docs/prometheus-monitoring">导出集群指标</a></p></li></ul></li><li><p>部分 Import 操作</p><ul><li><p><a href="https://docs.zilliz.com.cn/reference/restful/get-import-job-progress-v2">查看导入任务进度</a></p></li><li><p><a href="https://docs.zilliz.com.cn/reference/restful/list-import-jobs-v2">查看导入任务列表</a></p></li></ul></li><li><p>部分 Backup & Restore 操作</p><ul><li><p><a href="https://docs.zilliz.com.cn/reference/restful/list-backups-v2">查看备份列表</a></p></li><li><p><a href="https://docs.zilliz.com.cn/reference/restful/describe-backup-v2">查看备份详情</a></p></li><li><p><a href="https://docs.zilliz.com.cn/reference/restful/get-backup-policy-v2">获取备份策略</a></p></li></ul></li><li><p><a href="https://docs.zilliz.com.cn/reference/restful/cloud-job-v2">所有 Cloud Job 操作</a></p></li></ul></td>
     <td><p>数据面权限取决于<a href="./project-users">项目</a>和<a href="./cluster-roles">集群角色</a>。</p></td>
   </tr>
</table>

如果您的组织角色为**组织成员**或**组织账单管理员**，您只能在邀请新用户时授予他们**组织成员**的角色。

被邀请的用户将收到邀请邮件，并需要在 48 小时内接受邀请以加入组织。或者，您也可以直接从 Web 控制台复制邀请链接并分享给被邀请人。

<Admonition type="info" icon="📘" title="📘 说明">

您可以同时邀请一个或多个用户加入组织，但他们的角色需相同。每个组织最多可拥有 100 名成员。

</Admonition>

## 撤销或重发邀请\{#revoke-or-resend-an-invitation}

在您邀请用户加入组织后，Zilliz Cloud 会向用户发送邀请邮件。在用户接受邀请之前，您可以选择撤销或重发邀请。

![PTp3wHC99hCqF5b6pfPc4vhKnpe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/PTp3wHC99hCqF5b6pfPc4vhKnpe.png)

## 编辑组织用户角色\{#edit-the-role-of-an-organization-user}

当用户接受邀请后，他们将成为组织成员。之后，您可以根据需求编辑他们的角色或从组织中移出他们。

要编辑成员角色或移出组织成员，你必须是组织管理员。

![Pmd6wLll0hqEb0bn3DXcbTJDn9b](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Pmd6wLll0hqEb0bn3DXcbTJDn9b.png)

## 移除组织用户\{#remove-an-organization-user}

如果用户不再属于您的组织，您可以移除用户。

要移除组织成员，您必须是组织管理员。

<Admonition type="info" icon="📘" title="说明">

移除成员后，其个人 API 密钥将立即失效且无法继续访问。为避免服务中断，请在执行此操作前，确保已全面替换各运行环境中正在使用的该密钥。此操作不可撤销。

</Admonition>

![YoBYw8SVGh05GHbbln6cFY4Bn1b](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/YoBYw8SVGh05GHbbln6cFY4Bn1b.png)

## 离开组织\{#leave-an-organization}

当您不再属于某个组织时，您可以选择离开组织。

注意，如果您是组织的唯一管理员，您将无法离开该组织，因为每个组织必须始终至少有一个组织管理员。

<Admonition type="info" icon="📘" title="🚧 警告">

一旦您离开组织，您对该组织及其相关资源的访问权限将被取消。

</Admonition>

![XHm5wzbpAhBdOYbUk2lctvuHnTe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/XHm5wzbpAhBdOYbUk2lctvuHnTe.png)

