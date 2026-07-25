---
title: "从 Elasticsearch 迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-elasticsearch
sidebar_key: migrate-from-elasticsearch
sidebar_label: "从 Elasticsearch 迁移"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文档说明从 Elasticsearch 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。 | Cloud"
type: origin
token: CJN4wlKiGi1P8Zk4BHKcF04GnLb
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 迁移
  - elasticsearch

---

import Admonition from '@theme/Admonition';


# 从 Elasticsearch 迁移至 Zilliz Cloud

本文档说明从 [Elasticsearch](https://www.elastic.co/elasticsearch) 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### Elasticsearch 侧要求\{#elasticsearch-requirements}

<table>
   <tr>
     <th><p>要求项</p></th>
     <th><p>详细说明</p></th>
   </tr>
   <tr>
     <td><p>版本兼容性</p></td>
     <td><p>Elasticsearch 7.x 或更高版本</p></td>
   </tr>
   <tr>
     <td><p>网络访问</p></td>
     <td><p>源集群必须可通过公网访问</p></td>
   </tr>
   <tr>
     <td><p>API 访问权限</p></td>
     <td><p>需提供有效的集群 Endpoint 或 Cloud ID 及对应凭证</p></td>
   </tr>
   <tr>
     <td><p>向量字段要求</p></td>
     <td><p>每个源索引必须包含至少一个稠密向量字段</p></td>
   </tr>
</table>

### Zilliz Cloud 侧要求\{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要求项</p></th>
     <th><p>详细说明</p></th>
   </tr>
   <tr>
     <td><p>用户权限</p></td>
     <td><p>需具备组织管理员或项目管理员角色</p></td>
   </tr>
   <tr>
     <td><p>目标集群容量</p></td>
     <td><p>需预留足够 CU 容纳源数据（使用 <a href="https://zilliz.com.cn/pricing#calculator">CU 计算器</a>预估容量）</p></td>
   </tr>
   <tr>
     <td><p>网络连通性</p></td>
     <td><p>如果有网络限制，请确保已将 <a href="./zilliz-cloud-ips">Zilliz Cloud IP</a> 加入白名单</p></td>
   </tr>
</table>

## 数据类型映射\{#data-type-mapping}

下表总结了 Elasticsearch 字段类型如何映射到 Zilliz Cloud 字段类型，并对各类型做了详细说明。

<table>
   <tr>
     <th><p><strong>Elasticsearch 字段类型</strong></p></th>
     <th><p><strong>Zilliz Cloud 字段类型</strong></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>主键</p></td>
     <td><p>主键</p></td>
     <td><p>Elasticsearch 的 ID 字段会自动映射为 Zilliz Cloud 中的主键。</p><p>在数据迁移时，您可以选择启用 Auto ID 功能；但请注意，启用后源索引中的原始主键值将会被舍弃。</p></td>
   </tr>
   <tr>
     <td><p>dense_vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>向量维度与源索引中的向量字段维度相同。您可以在 <strong>L2</strong> 和 <strong>IP</strong> 之间指定一个度量类型。</p></td>
   </tr>
   <tr>
     <td><p>text, string, keyword, ip, date, timestamp</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>通过 <strong>Max Length</strong> 指定最大数据长度，有效值为 1 到 65535 之间。如果任何字符串超过了最大长度限制，迁移过程将会报错。</p></td>
   </tr>
   <tr>
     <td><p>long</p></td>
     <td><p>INT64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>INT32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>short</p></td>
     <td><p>INT16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>byte</p></td>
     <td><p>INT8</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>float</p></td>
     <td><p>FLOAT</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>object</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>arrays</p></td>
     <td><p>ARRAY</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## Elasticsearch 特殊处理规则\{#elasticsearch-specific-handling-rules}

### Collection 命名规则\{#collection-naming-rules}

Elasticsearch 索引名称将按以下规则迁移至 Zilliz Cloud：

<table>
   <tr>
     <th><p>场景</p></th>
     <th><p>影响</p></th>
     <th><p>解决方案</p></th>
   </tr>
   <tr>
     <td><p>默认命名</p></td>
     <td><p>Collection 名称与源索引名称完全一致</p></td>
     <td><p>保留原始名称</p></td>
   </tr>
   <tr>
     <td><p>特殊字符</p></td>
     <td><p>含连字符(-)或点号(.)的索引名称将导致迁移任务提交失败</p></td>
     <td><p>手动重命名目标 Collection（使用下划线等合法字符）</p></td>
   </tr>
   <tr>
     <td><p>名称冲突</p></td>
     <td><p>目标 Database 存在同名 Collection 时无法提交迁移任务</p></td>
     <td><p>删除现有 Collection / 选择其他目标 Database / 迁移配置时重命名 Collection</p></td>
   </tr>
</table>

## 迁移注意事项\{#migration-considerations}

从 Elasticsearch 迁移时需注意以下事项：

<table>
   <tr>
     <th><p>限制项</p></th>
     <th><p>影响</p></th>
     <th><p>替代方案</p></th>
   </tr>
   <tr>
     <td><p>动态字段转固定字段</p></td>
     <td><p>无法将现有动态字段转换为固定类型</p></td>
     <td><p>字段保持原始动态特性</p></td>
   </tr>
   <tr>
     <td><p>迁移过程中添加新字段</p></td>
     <td><p>仅迁移 Elasticsearch 已有字段</p></td>
     <td><p>无法在迁移时新增字段</p></td>
   </tr>
   <tr>
     <td><p>稀疏向量迁移</p></td>
     <td><p>当前版本不支持迁移稀疏向量</p></td>
     <td><p>考虑使用稠密向量替代方案，或联系支持团队了解路线图</p></td>
   </tr>
</table>

