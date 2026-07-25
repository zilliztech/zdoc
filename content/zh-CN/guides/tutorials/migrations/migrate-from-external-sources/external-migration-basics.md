---
title: "外部迁移概述 | Cloud"
slug: /external-migration-basics
sidebar_key: external-migration-basics
sidebar_label: "外部迁移概述"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "外部迁移功能简化了将向量数据库和搜索系统迁移至 Zilliz Cloud 的过程。无论您是从 Qdrant 等向量数据库迁移，还是从 Elasticsearch、OpenSearch 等支持向量的搜索引擎迁移，Zilliz Cloud 均提供迁移工具，在确保数据完整性的同时最大限度降低迁移复杂度。 | Cloud"
type: origin
token: FD9uwJwjgi8ub4kit1EcXyEQnqs
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据迁移
  - 备份文件

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 外部迁移概述

外部迁移功能简化了将向量数据库和搜索系统迁移至 Zilliz Cloud 的过程。无论您是从 Qdrant 等向量数据库迁移，还是从 Elasticsearch、OpenSearch 等支持向量的搜索引擎迁移，Zilliz Cloud 均提供迁移工具，在确保数据完整性的同时最大限度降低迁移复杂度。

## 支持的数据源\{#supported-data-sources}

Zilliz Cloud 支持从主流向量数据库和搜索平台迁移：

<table>
   <tr>
     <th><p>Data Source</p></th>
     <th><p>Type</p></th>
     <th><p>Key Features</p></th>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-qdrant">Qdrant</a></p></td>
     <td><p>向量数据库</p></td>
     <td><p>开源引擎，支持云部署与自托管</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-elasticsearch">Elasticsearch</a></p></td>
     <td><p>搜索引擎</p></td>
     <td><p>支持稠密向量与全文检索</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-pgvector">PostgreSQL</a></p></td>
     <td><p>关系型数据库</p></td>
     <td><p>支持向量扩展（pgvector）</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-tencent-cloud-vectordb">腾讯云向量数据库</a></p></td>
     <td><p>托管服务</p></td>
     <td><p>全托管向量数据库服务</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-opensearch">OpenSearch</a></p></td>
     <td><p>搜索平台</p></td>
     <td><p>支持向量检索的 KNN 插件</p></td>
   </tr>
</table>

## 核心能力\{#core-capabilities}

迁移工具提供丰富的配置选项，确保数据结构完美适配 Zilliz Cloud：

<table>
   <tr>
     <th><p>功能类别</p></th>
     <th><p>能力项</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td rowspan="4"><p><strong>Schema 管理</strong></p></td>
     <td><p>字段重命名</p></td>
     <td><p>迁移过程中重命名字段，匹配命名规范</p></td>
   </tr>
   <tr>
     <td><p>动态转固定字段</p></td>
     <td><p>将灵活元数据转为固定结构字段以提升性能。</p><p>如果元数据包含文本数据，将其转换为固定字段后会创建 <strong>VARCHAR</strong> 字段。这使该文本可启用 Full Text Search。详情参见 <a href="./full-text-search">Full Text Search</a>。</p></td>
   </tr>
   <tr>
     <td><p>添加额外字段</p></td>
     <td><p>扩展源数据外的字段，适应业务演进需求</p></td>
   </tr>
   <tr>
     <td><p>数据类型映射</p></td>
     <td><p>自动检测并映射字段类型，支持手动调整</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p><strong>Collection 配置</strong></p></td>
     <td><p>智能命名处理</p></td>
     <td><p>默认保留源表名；重名时系统报错；含连字符(-)的名称自动转为下划线(_)或提示修正</p></td>
   </tr>
   <tr>
     <td><p>Shard 配置</p></td>
     <td><p>根据查询模式设置数据分布策略</p></td>
   </tr>
   <tr>
     <td><p>Partition 策略</p></td>
     <td><p>采用自动分区或自定义分组管理数据</p></td>
   </tr>
   <tr>
     <td><p><strong>Data integrity</strong></p></td>
     <td><p>主键处理</p></td>
     <td><p>创建/保留/修改记录的唯一标识符</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>字段属性设置</p></td>
     <td><p>定义字段空值规则与默认值</p></td>
   </tr>
   <tr>
     <td></td>
     <td><p>验证检查</p></td>
     <td><p>查看迁移详情</p></td>
   </tr>
   <tr>
     <td><p><strong>Full Text Search</strong></p></td>
     <td><p>迁移过程中为文本字段开启 Full Text Search。</p></td>
     <td><p>在 <strong>高级设置 → Function</strong> 中配置，可在迁移期间为 <strong>VARCHAR</strong> 字段启用 <strong>Full Text Search</strong>。如果源数据的元数据包含文本，可使用<strong>转换为固定字段</strong>将文本型元数据转换为 <strong>VARCHAR</strong> 字段。详情参见 <a href="./full-text-search">Full Text Search</a>。</p></td>
   </tr>
</table>

## 迁移流程\{#migration-process}

采用三阶段迁移框架保障数据完整性与过程可视化：

![MPbQwTCqBhybmZbzfAfc0Xnenab](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/MPbQwTCqBhybmZbzfAfc0Xnenab.png)

### 阶段 1：连接与配置\{#phase-1-connect-and-configure}

1. 建立连接：提供源系统认证凭证（API密钥/连接字符串）

1. 选择数据：指定需迁移的索引/ Collection /表

1. 配置目标：选定 Zilliz Cloud 集群与目标 Database

### 阶段 2：映射检查\{#phase-2-review-mappings}

#### Schema 映射\{#schema-mapping}

- 自动检测：识别向量字段、标量字段及元数据

- 字段定制：按需调整字段名与类型

- 类型转换：审核源目标数据类型映射

- 高级设置：配置 Partition/Partition Key/Nullable 字段

#### Shard 设置\{#shard-setting}

根据数据量优化性能配置：

- 小数据集（≤1亿行）：单分片通常足够

- 大数据集（＞10亿行）：联系[支持团队](https://zilliz.com.cn/contact-sales)获取优化方案

### 阶段 3：迁移与验证\{#phase-3-migrate-and-verify}

完成配置后执行迁移并监控：

- 实时监控：通过"任务"页跟踪迁移状态

- 进度指标：查看已迁移行数/错误数/预计完成时间

- 错误处理：发生问题时查阅详细日志

- 验证机制：自动行数校验确保数据完整

## 限制说明\{#limitations}

迁移前需注意以下通用限制：

<table>
   <tr>
     <th><p>限制项</p></th>
     <th><p>影响</p></th>
     <th><p>解决方案</p></th>
   </tr>
   <tr>
     <td><p>无自动索引/Load</p></td>
     <td><p>Collection 迁移后不可立即查询</p></td>
     <td><p>迁移后手动创建索引并 Load Collection（操作指南见<a href="./index-vector-fields">创建 Vector Index</a> 和 <a href="./load-release-collections">Load 和 Release</a>）。</p></td>
   </tr>
   <tr>
     <td><p>空数据源</p></td>
     <td><p>无法选择空索引/表</p></td>
     <td><p>确保源数据包含有效数据后再迁移</p></td>
   </tr>
   <tr>
     <td><p>向量字段要求</p></td>
     <td><p>Collection 必须包含向量数据</p></td>
     <td><p>迁移前验证源数据是否含向量字段</p></td>
   </tr>
   <tr>
     <td><p>不支持的数据类型</p></td>
     <td><p>特殊类型可能无法迁移</p></td>
     <td><p>查阅各数据源专属指南了解数据类型映射</p></td>
   </tr>
</table>

## 开始迁移\{#getting-started}

准备将数据迁移至 Zilliz Cloud 了吗？

### 访问数据迁移\{#access-migration-portal}

<Supademo id="cmbki8mah8nohsn1rfo0g3gnl" title="Zilliz Cloud - 访问数据迁移" />

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)

1. 点击**数据迁移**，然后选择数据源平台

1. 按引导流程完成迁移

</Procedures>

### 设置 Full Text Search\{#configure-full-text-search}

如果源数据包含文本，你可以在迁移期间配置 Full Text Search，以提升文本检索效果。详情参见 [Full Text Search](./full-text-search)。

<Supademo id="cmhmtjeff0dexdqxa2qqkdsds" title="Zilliz Cloud - 设置 Full Text Search" />

## 平台专属迁移指南\{#}

各平台详细操作流程、前置条件及数据映射说明：

- [从 Qdrant 迁移至 Zilliz Cloud](./migrate-from-qdrant)

- [从 Elasticsearch 迁移至 Zilliz Cloud](./migrate-from-elasticsearch)

- [从 PostgreSQL 迁移至 Zilliz Cloud](./migrate-from-pgvector)

- [从腾讯云向量数据库迁移至 Zilliz Cloud](./migrate-from-tencent-cloud-vectordb)

- [从 OpenSearch 迁移至 Zilliz Cloud](./migrate-from-opensearch)

