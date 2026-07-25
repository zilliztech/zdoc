---
title: "从腾讯云向量数据库迁移至 Zilliz Cloud | Cloud"
slug: /migrate-from-tencent-cloud-vectordb
sidebar_key: migrate-from-tencent-cloud-vectordb
sidebar_label: "从腾讯云向量数据库迁移"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文档说明腾讯云向量数据库迁移过程中 Zilliz Cloud 的数据类型映射规则、JSON 字段转换机制及 Collection 命名规范。 | Cloud"
type: origin
token: WBTjw5BmvisFlLk6uGoc6q71nns
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 迁移
  - 腾讯云
  - vectordb

---

import Admonition from '@theme/Admonition';


# 从腾讯云向量数据库迁移至 Zilliz Cloud

本文档说明[腾讯云向量数据库](https://cloud.tencent.com/product/vdb)迁移过程中 Zilliz Cloud 的数据类型映射规则、JSON 字段转换机制及 Collection 命名规范。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### 腾讯云侧要求\{#tencent-cloud-requirements}

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
     <td><p>API 访问权限</p></td>
     <td><p>需提供有效的实例 URL 及具备必要权限的 API 密钥</p></td>
   </tr>
   <tr>
     <td><p>数据可用性</p></td>
     <td><p>源 Collection 必须包含数据，空 Collection 无法迁移</p></td>
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

下表总结了腾讯云向量数据库字段类型如何映射到 Zilliz Cloud 字段类型，并对各类型做了详细说明。

<table>
   <tr>
     <th><p>腾讯云字段类型</p></th>
     <th><p>Zilliz Cloud 字段类型</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>主键</p></td>
     <td><p>主键</p></td>
     <td><p>腾讯云向量数据库的主键字段会自动映射为 Zilliz Cloud 中的主键。</p><p>在数据迁移时，您可以选择启用 Auto ID 功能；但请注意，启用后源 Collection 中的原始主键值将会被舍弃。</p></td>
   </tr>
   <tr>
     <td><p>稠密向量</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>稠密向量字段会直接转换为 FLOAT_VECTOR，无需进行任何修改。</p></td>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>Dynamic field</p></td>
     <td><p>默认情况下，腾讯云向量数据库的 JSON 字段会映射为 Zilliz Cloud 中的 Dynamic Field。有关详细信息，请参阅 <a href="./enable-dynamic-field">Dynamic Field</a>。</p><p>在迁移数据时，如果您希望对某些动态字段使用固定数据类型并优化索引配置，建议将动态字段转换为固定字段。</p></td>
   </tr>
</table>

## JSON 字段转换说明\{#json}

<Admonition type="info" icon="📘" title="说明">

Zilliz Cloud 采样 100 行数据检测 JSON 数据结构，必要时可手动添加字段。

</Admonition>

腾讯云 JSON 字段默认映射为 Zilliz Cloud 的 Dynamic Field 以实现最大灵活性，转换为固定字段可带来：

- 强数据类型校验：强制字段类型约束

- 优化查询性能：建立专用索引

- 结构化数据管理：统一数据规范

<table>
   <tr>
     <th><p>腾讯云字段类型</p></th>
     <th><p>Zilliz Cloud 字段类型</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>string</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>如果 JSON 中的字段类型为 string，当转换为固定字段后，该字段将变为 VARCHAR 类型。</p><p><strong>注意：</strong>该字段的最大长度固定为 65,535 字节且不可修改，容量计算以实际字段长度为准。</p></td>
   </tr>
   <tr>
     <td><p>uint64</p></td>
     <td><p>INT32</p></td>
     <td><p>如果 JSON 中的字段类型为 uint64，当转换为固定字段后，该字段将变为 INT32 类型。</p></td>
   </tr>
   <tr>
     <td><p>double</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>如果 JSON 中的字段类型为 double，当转换为固定字段后，该字段将变为 DOUBLE 类型。</p></td>
   </tr>
   <tr>
     <td><p>array</p></td>
     <td><p>ARRAY</p></td>
     <td><p>如果 JSON 中的字段类型为 array，当转换为固定字段后，该字段将变为 ARRAY 类型。</p></td>
   </tr>
</table>

转换为固定字段后，可配置以下属性：

- **Nullable**：决定字段是否接受空值（默认启用），详见 [Nullable 属性](./nullable-and-default)。

- **默认值**：设置数据缺失时的回退值，详见[默认值](./nullable-and-default)。

- **Partition Key**：可将 INT64/VARCHAR 字段指定为 Partition Key（注意：每个 Collection 支持一个 Partition Key，且该字段不可为空），详见 [使用 Partition Key](./use-partition-key)。

## 腾讯云特殊处理规则\{#tencent-cloud-specific-handling-rules}

### Collection 命名规则\{#collection-naming-rules}

腾讯云 Collection 名称将按以下规则迁移至 Zilliz Cloud：

<table>
   <tr>
     <th><p>场景</p></th>
     <th><p>影响</p></th>
     <th><p>解决方案</p></th>
   </tr>
   <tr>
     <td><p>默认命名</p></td>
     <td><p>目标 Collection 名称默认与源 Collection 完全一致</p></td>
     <td><p>保留原始名称</p></td>
   </tr>
   <tr>
     <td><p>名称冲突</p></td>
     <td><p>目标 Database 存在同名 Collection 时无法提交迁移任务</p></td>
     <td><p>删除现有 Collection / 选择其他目标 Database / 迁移配置时重命名 Collection</p></td>
   </tr>
   <tr>
     <td><p>特殊字符</p></td>
     <td><p>需符合 Zilliz Cloud 命名规范</p></td>
     <td><p>迁移前请检查 Collection 名称合法性</p></td>
   </tr>
</table>

