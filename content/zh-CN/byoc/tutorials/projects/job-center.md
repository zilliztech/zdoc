---
title: "管理项目任务 | BYOC"
slug: /job-center
sidebar_label: "管理项目任务"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供了一个直观的任务中心页面，将同一项目下的所有历史和异步数据任务整合在一起。 | BYOC"
type: origin
token: YtLLwrOl0in7OqkdMpPc4ZkxnVd
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 项目
  - 项目管理
  - 管理项目任务
  - 任务中心
  - job center

---

import Admonition from '@theme/Admonition';


# 管理项目任务

Zilliz Cloud 提供了一个直观的任务中心页面，将同一项目下的所有历史和异步数据任务整合在一起。

## 查看项目任务

选择目标项目。在左侧导航栏中，点击**任务中心**。您可以看到正在执行或已完成的所有异步数据任务。

任务列表中会显示以下信息：

- 任务描述与任务类型：任务描述包含数据任务的目标和详情。任务类型包含以下几种：

    <table>
       <tr>
         <th><p><strong>任务类型</strong></p></th>
         <th><p><strong>说明</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><a href="./create-snapshot">备份</a></p></td>
         <td><p>为集群创建备份。</p></td>
       </tr>
       <tr>
         <td><p>为 Collection 创建备份。</p></td>
       </tr>
       <tr>
         <td><p>进行跨地域备份。</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><a href="./restore-from-snapshot">恢复</a></p></td>
         <td><p>从备份恢复集群。</p></td>
       </tr>
       <tr>
         <td><p>从备份恢复 Collection。</p></td>
       </tr>
       <tr>
         <td><p><a href="./export-backup-files">导出备份文件</a></p></td>
         <td><p>将备份文件导出至指定对象存储服务中。</p></td>
       </tr>
       <tr>
         <td><p><a href="./migrations">迁移</a></p></td>
         <td><p>将数据迁移至集群。</p><ul><li><p>迁移外部数据</p><ul><li><p>从 Milvus 迁移至 Zilliz Cloud 集群</p></li><li><p>从 Qdrant 迁移至 Zilliz Cloud 集群</p></li><li><p>从 Elasticsearch 迁移至 Zilliz Cloud 集群</p></li><li><p>从 OpenSearch 迁移至 Zilliz Cloud 集群</p></li><li><p>从 PostgreSQL 迁移至 Zilliz Cloud 集群</p></li><li><p>从腾讯云向量数据库迁移至 Zilliz Cloud 集群</p></li></ul></li><li><p>Zilliz Cloud 跨集群迁移</p><ul><li><p>在当前组织中进行跨集群迁移</p></li><li><p>跨组织进行集群间迁移</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p><a href="./data-import">导入</a></p></td>
         <td><p>将数据导入至 Collection。</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-collection">复制 Collection</a></p></td>
         <td><p>复制 Collection Schema 及 Collection 中所有数据。</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-collection">创建示例 Collection</a></p></td>
         <td><p>创建一个带有实力数据集的 Collection。</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#suspend-cluster">挂起集群</a></p></td>
         <td><p>将集群挂起。</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#resume-cluster">恢复运行集群</a></p></td>
         <td><p>将集群恢复运行。</p></td>
       </tr>
       <tr>
         <td><p><a href="./scale-cluster">Query CU 扩缩容</a></p></td>
         <td><p>手动或动态增加或减少集群中的 Query CU 数量。</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-replica">Replica 扩缩容</a></p></td>
         <td><p>手动或动态增加或减少集群中的 Replica 数量。</p></td>
       </tr>
    </table>

- 任务状态：任务状态包括**成功**、**进行中**、**等待中**、**失败**和**已取消**。

- 任务 ID：数据任务的 ID。在数据任务执行过程中，如有任何问题，请[提交工单](http://support.zilliz.com.cn)并提供对应的任务 ID。

- 任务开始时间与结束时间

- 创建人：发起数据任务的项目用户。

## 查看任务详情

点击**操作**栏中的**...**，选择**查看详情**。或者，您也可以通过[查看任务详情](/reference/restful/describe-job-v2)的 RESTful API 接口获取任务详情。

![view_job_details_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view_job_details_cn.png "view_job_details_cn")

## 取消任务

您可以取消如下类型的**进行中**和**等待中**的任务：

- 备份任务

- 迁移任务（除在线迁移任务）

- 导出备份文件任务

<Admonition type="info" icon="📘" title="说明">

<p>如需取消任务，您需要具备<strong>组织管理员</strong>或<strong>项目管理员</strong>权限。</p>

</Admonition>

![cancel_job_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/cancel_job_cn.png "cancel_job_cn")

## 重试失败任务

<Admonition type="info" icon="📘" title="说明">

<p>目前仅支持重试失败的导入任务。</p>
<p>如需重试失败任务，您需要具备<strong>组织管理员</strong>或<strong>项目管理员</strong>角色。</p>

</Admonition>

如果您的数据导入任务失败，您可以点击其状态旁的 ℹ️ 图标以查看失败原因及具体的报错信息。

如果您在查看失败原因后对需要导入的数据文件进行相应调整，您可以重试导入任务。

![retry_failed_job_cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/retry_failed_job_cn.png "retry_failed_job_cn")