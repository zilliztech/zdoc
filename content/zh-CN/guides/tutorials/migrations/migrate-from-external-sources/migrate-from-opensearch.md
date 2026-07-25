---
title: "从 OpenSearch 迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-opensearch
sidebar_key: migrate-from-opensearch
sidebar_label: "从 OpenSearch 迁移"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文档说明从 OpenSearch 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。 | Cloud"
type: origin
token: Cf89wr8V3iGmr3kKiqAcP4D1nPb
sidebar_position: 7
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 迁移
  - opensearch

---

import Admonition from '@theme/Admonition';


# 从 OpenSearch 迁移至 Zilliz Cloud

本文档说明从 [OpenSearch](https://opensearch.org/) 迁移时，Zilliz Cloud 如何处理数据类型映射、Collection 命名规则及注意事项。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### OpenSearch 侧要求\{#opensearch-requirements}

<table>
   <tr>
     <th><p>要求项</p></th>
     <th><p>详细说明</p></th>
   </tr>
   <tr>
     <td><p>网络访问</p></td>
     <td><p>源集群必须可通过公网访问</p></td>
   </tr>
   <tr>
     <td><p>认证权限</p></td>
     <td><p>需提供有效的集群 Endpoint、用户名及密码（具备必要权限）</p></td>
   </tr>
   <tr>
     <td><p>向量字段要求</p></td>
     <td><p>每个源索引必须包含至少一个 k-NN 向量字段</p></td>
   </tr>
   <tr>
     <td><p>数据可用性</p></td>
     <td><p>源索引必须包含数据，空索引无法迁移</p></td>
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

下表总结了 OpenSearch 字段类型如何映射到 Zilliz Cloud 字段类型，并对各类型做了详细说明。

<table>
   <tr>
     <th><p><strong>OpenSearch 字段类型</strong></p></th>
     <th><p><strong>Zilliz Cloud 字段类型</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>主键（<a href="https://opensearch.org/docs/latest/field-types/metadata-fields/id/">_id</a>）</p></td>
     <td><p>主键</p></td>
     <td><p>OpenSearch 的 ID 字段将自动映射为 Zilliz Cloud 的主键字段。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/">k-NN vector</a></p></td>
     <td><p><code>FLOAT_VECTOR</code></p></td>
     <td><p>OpenSearch 中的 <code>float</code> 向量类型映射到 Zilliz Cloud 上的 <code>FLOAT_VECTOR</code>。OpenSearch 的 Byte/Binary 向量不支持迁移。</p><p>向量维度保持不变。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/alias/">Alias</a></p></td>
     <td><p>Not supported</p></td>
     <td><p>暂不支持映射该字段。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/binary/">Binary</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Binary 数据在 Zilliz Cloud 中以字符串形式存储。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/">Numeric</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>byte</code></p></td>
     <td><p><code>INT8</code></p></td>
     <td><p>直接映射。</p></td>
   </tr>
   <tr>
     <td><p><code>double</code></p></td>
     <td><p><code>DOUBLE</code></p></td>
     <td><p>直接映射。</p></td>
   </tr>
   <tr>
     <td><p><code>float</code></p></td>
     <td><p><code>FLOAT</code></p></td>
     <td><p>直接映射。</p></td>
   </tr>
   <tr>
     <td><p><code>half_float</code></p></td>
     <td><p><code>FLOAT</code></p></td>
     <td><p>映射为 <code>FLOAT</code> 数据类型。</p></td>
   </tr>
   <tr>
     <td><p><code>integer</code></p></td>
     <td><p><code>INT32</code></p></td>
     <td><p>直接映射。</p></td>
   </tr>
   <tr>
     <td><p><code>long</code></p></td>
     <td><p><code>INT64</code></p></td>
     <td><p>直接映射。</p></td>
   </tr>
   <tr>
     <td><p><code>short</code></p></td>
     <td><p><code>INT16</code></p></td>
     <td><p>直接映射。</p></td>
   </tr>
   <tr>
     <td><p><code>unsigned_long</code></p></td>
     <td><p>不支持</p></td>
     <td><p>暂不支持映射该字段。</p></td>
   </tr>
   <tr>
     <td><p><code>scaled_float</code></p></td>
     <td><p>不支持</p></td>
     <td><p>暂不支持映射该字段。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/">Boolean</a></p></td>
     <td><p><code>BOOL</code></p></td>
     <td><p>存储 <code>true</code> 或 <code>false</code>。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/dates/">Date</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/ip/">IP address</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/range/">Range</a></p></td>
     <td><p><code>JSON</code></p></td>
     <td><p>序列化为 JSON 格式。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/">Object</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>object</code></p></td>
     <td><p>JSON</p></td>
     <td><p>序列化为 JSON 格式。</p></td>
   </tr>
   <tr>
     <td><p><code>nested</code></p></td>
     <td><p>JSON</p></td>
     <td><p>序列化为 JSON 格式。</p></td>
   </tr>
   <tr>
     <td><p><code>flat_object</code></p></td>
     <td><p>JSON</p></td>
     <td><p>序列化为 JSON 格式。</p></td>
   </tr>
   <tr>
     <td><p><code>join</code></p></td>
     <td><p>VARCHAR</p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/string/">String</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>keyword</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><code>text</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>映射到 Milvus 2.5 或更早版本中的 VARCHAR。</p></td>
   </tr>
   <tr>
     <td><p><code>match_only_text</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><code>token_count</code></p></td>
     <td><p><code>INT32</code></p></td>
     <td><p>存储为 INT32。</p></td>
   </tr>
   <tr>
     <td><p><code>wildcard</code></p></td>
     <td><p>不支持</p></td>
     <td><p>暂不支持映射该字段。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/">Autocomplete</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/">Geographic</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/rank/">Rank</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/">Percolator</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>存储为字符串。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/derived/">Derived</a></p></td>
     <td><p>不支持</p></td>
     <td><p>暂不支持映射该字段。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/">Star-tree</a></p></td>
     <td><p>不支持</p></td>
     <td><p>暂不支持映射该字段。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#arrays">Arrays</a></p></td>
     <td><p>不支持</p></td>
     <td><p>暂不支持映射该字段。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.opensearch.org/docs/latest/field-types/supported-field-types/index/#multifields">Multifields</a></p></td>
     <td><p>不支持</p></td>
     <td><p>暂不支持映射该字段。</p></td>
   </tr>
</table>

## OpenSearch 特殊处理规则\{#opensearch-specific-handling-rules}

### Collection 命名规则\{#collection-naming-rules}

OpenSearch 索引名称将按以下规则迁移至 Zilliz Cloud：

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

从 OpenSearch 迁移时需注意以下事项：

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

