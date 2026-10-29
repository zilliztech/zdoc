---
title: "Membership Match | BYOC"
slug: /membership-match
sidebar_label: "Membership Match"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | BYOC"
type: origin
token: R5W0wfQS3igsPnk4fgNcuvFqnjc
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Membership Match

## 概述\{#}

Membership Match 通过判断标量字段值是否属于调用方给定的集合来过滤 Entity。客户端构建一个紧凑的二进制成员关系过滤 Blob，并将其作为表达式模板值传入。

它用于替代很长的 `IN [...]` 列表。IN 过滤器会把每个成员都序列化进请求——1000 万个 INT64 值约 90 MB，可能超过 proxy 的默认 gRPC 接收上限。使用 `membership_match` 时，proxy 只需校验 Blob 并将其原样嵌入查询计划，无需重建成员列表。

![MjJzwsnc5h7rgLbvk0gcxRqwnUf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/MjJzwsnc5h7rgLbvk0gcxRqwnUf.png)

上图展示了固定的分工：客户端一次性构建 Blob 并在多个请求间复用；proxy 校验信封和大小限制，并将 Blob 原样嵌入查询计划；QueryNode 基于原始数据或 Index 执行该计划。

操作方有两种正确性保证不同的编码可选：

- **Bloom**（`type=bloom`）：近似匹配。可能出现误判（false positive）；合法的过滤器不会出现漏判（false negative）。典型场景：大批量的受众（audience）或排除（exclusion）过滤，且可以接受偶发误判。

- **Roaring**（`type=roaring`）：整数值的精确匹配。典型场景：ACL、租户可见性、合规过滤，以及按 ID 集合删除。

不要将 **Bloom** 成员关系用于授权判断或破坏性删除。一次误判就可能暴露一行本不在目标集合中的数据，或误删一行数据。

### 操作检查清单\{#}

- 确认目标字段类型，并用同一取值域构建 Blob。

- 仅在可以接受误判时选择 Bloom。

- ACL、合规、租户隔离和删除操作选择 Roaring。

- 大型 Blob 只构建一次并复用，不要在每个请求里重复构建。

- 以序列化后的字节数（而非成员数量）估算 Blob 大小预算。

- 在混合版本集群上，先完成滚动升级（proxy 优先），再启用 `membership_match`。

- 在启用破坏性工作流之前，先在非生产 Collection 上测试表达式。

## 表达式语法\{#}

```plaintext
membership_match(<field>, {<template>}, type=bloom)
membership_match(<field>, {<template>}, type=roaring)
membership_match(<field>, {<template>})
not membership_match(<field>, {<template>}, type=bloom)
```

第二个参数是模板占位符。SDK 以 protobuf `bytes` 的形式提供占位符值，其中包含客户端构建的过滤器 Blob。生产环境的表达式中应显式写出 `type`，让预期的正确性契约在代码和日志中清晰可见。

`type` 参数是可选的。每个 Blob 都带有自描述的 magic header：Bloom 为 `MBF1`，Roaring 为 `MRB1`；省略 `type` 时服务端会嗅探该头部。显式 `type` 与 Blob 头部冲突时会作为请求错误被拒绝；未知或被截断的头部会触发 fail-closed（直接拒绝）。

## 选择编码\{#}

可以接受误判时使用 **Bloom**。**Bloom** 支持有符号整型字段（**INT8**/**16**/**32**/**64**）、**VARCHAR** 字段和 **JSON** 路径。Bloom 过滤器不是精确的允许列表。

`fpr`（false-positive rate，误判率）是 Bloom 过滤器把一个从未插入的值误报为成员的概率：`fpr=0.005` 表示大约每 200 个非成员值中会有 1 个被误报为存在。fpr 越低，Blob 越大。

要求每次匹配都精确时使用 **Roaring**。**Roaring** 仅支持有符号整型字段；成员在序列化前会符号扩展为 **INT64**，因此 INT8 的 -1 和 INT64 的 -1 是同一个成员。不要将其用于 UUID 或其他字符串字段。

| 维度 | Bloom (type=bloom) | Roaring (type=roaring) |
| --- | --- | --- |
| 精度 | 近似；可能误判；不会漏判 | 精确；无误判也无漏判 |
| 支持字段 | INT8/16/32/64、VARCHAR、JSON 路径 | 仅支持有符号 INT8/16/32/64 |
| Blob 大小 | 由成员数量和 FPR 决定；FPR 0.005 时约每位成员 11 bit；主体大小为 2 的幂 | 取决于值的分布；稠密集合压缩后小得多；随机 64 位值会触及 262,144 高位容器上限 |
| Delete 表达式 | 解析时即被拒绝 | 允许 |
| 典型场景 | 受众与排除过滤 | ACL、合规、租户隔离、按 ID 集合删除 |

**JSON** 路径逐行严格按类型匹配：**JSON** 字符串按 **VARCHAR** 值探测，**JSON** 整数按 **INT64** 值探测，而 **JSON** 浮点数永远不会匹配整数成员——这与精确的 `IN` 不同（IN 中 5.0 等于 5）。如果写入方用浮点数编码整数，请在写入时做归一化，或改用有明确类型的标量字段。

无论哪种编码，都要用与目标字段相同的取值域构建成员集合。不要用字符串 `"10086"` 构建 Bloom 过滤器，再把它应用到 `INT64` 字段。Blob 头部记录了已插入值的取值域，取值域错误的 Blob 会被 proxy 以参数错误拒绝，而不是静默地匹配不到任何数据。构建好的 Blob 应跨请求复用，而不是每次查询都重建。

成员数量在几千以内的集合，普通 `IN` 仍是最简单的选择。服务端不会在 **IN**、**Bloom** 和 **Roaring** 之间做选择；选择哪种编码是调用方的责任。

![W7HCwioaEh8sXbbn6BUcAOO6nRc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/W7HCwioaEh8sXbbn6BUcAOO6nRc.png)

如上图所示：第一个问题是负载能否容忍误判；不能容忍时，**Bloom** 永远不是选项。精确编码 **Roaring** 要求数据为有符号整数。稠密或聚簇的值能压缩出最小的 Blob；均匀随机的 64 位值可能触及 262,144 高位容器上限或大小限制，此时剩余的精确选项就是传统 **IN** 列表。非整型字段则完全没有精确 membership 编码可用。

Membership Match 不能通过 RESTful HTTP API 使用。HTTP 表达式模板参数只接受布尔、数字、字符串和数组，没有承载 Blob 的二进制 `bytes` 类型。请使用各 SDK 传递成员关系 Blob。

## SDK 请求示例\{#sdk}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, build_bloom_filter, build_roaring_bitmap

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
bloom_blob = build_bloom_filter(["creator-a", "creator-b"], fpr=0.005)
client.search(collection_name="posts", data=[query_vector], anns_field="embedding", limit=10,
              filter="membership_match(creator_id, {members}, type=bloom)",
              filter_params={"members": bloom_blob})

roaring_blob = build_roaring_bitmap([1001, 1002, 1003])
client.query(collection_name="docs", filter="membership_match(user_id, {members}, type=roaring)",
             filter_params={"members": roaring_blob}, output_fields=["user_id", "title"])
```

</TabItem>

<TabItem value='go'>

```go
bloomBlob, err := milvusclient.NewBloomFilterBlob([]int64{1001, 1002}, fpr)
if err != nil { return err }
search := milvusclient.NewSearchOption("posts", topK, vectors).
    WithFilter("membership_match(creator_id, {members}, type=bloom)").
    WithTemplateParam("members", bloomBlob)

roaringBlob, err := milvusclient.NewRoaringBitmapBlob([]int64{1001, 1002})
if err != nil { return err }
query := milvusclient.NewQueryOption("docs").
    WithFilter("membership_match(user_id, {members}, type=roaring)").
    WithTemplateParam("members", roaringBlob)
```

</TabItem>

<TabItem value='java'>

```java
byte[] bloomBlob = BloomFilterUtils.buildBloomFilter(userIds, BloomFilterUtils.DEFAULT_FPR);
QueryReq request = QueryReq.builder().collectionName("docs")
    .filter("membership_match(user_id, {members}, type=bloom)")
    .filterTemplateValues(Collections.singletonMap("members", bloomBlob)).build();
byte[] roaringBlob = RoaringBitmapUtils.buildRoaringBitmap(userIds);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const bloomBlob = buildBloomFilter(userIds);
await client.query({ collection_name: 'docs',
  filter: 'membership_match(user_id, {members}, type=bloom)',
  exprValues: { members: bloomBlob } });
const roaringBlob = buildRoaringBitmap(integerIds);
```

</TabItem>
</Tabs>

## 使用 Roaring 执行 Delete\{#roaring-delete}

用外部整型 ID 集合删除 Entity 时，应使用精确的 **Roaring** Blob。发出删除请求前，先核对成员集合和 Collection 字段类型。**不要使用 Bloom**：近似匹配不是安全的删除谓词，**Bloom** 形式在 Delete 表达式中于解析阶段就会被拒绝。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
roaring_blob = build_roaring_bitmap([1001, 1002, 1003])
client.delete(collection_name="docs", filter="membership_match(id, {members}, type=roaring)",
              filter_params={"members": roaring_blob})
```

</TabItem>

<TabItem value='go'>

```go
roaringBlob, err := milvusclient.NewRoaringBitmapBlob([]int64{1001, 1002, 1003})
if err != nil { return err }
_, err = client.Delete(ctx, milvusclient.NewDeleteOption("docs").
    WithExpr("membership_match(id, {members}, type=roaring)").
    WithTemplateParam("members", roaringBlob))
```

</TabItem>

<TabItem value='java'>

```java
byte[] roaringBlob = RoaringBitmapUtils.buildRoaringBitmap(userIds);
DeleteReq request = DeleteReq.builder().collectionName("docs")
    .filter("membership_match(id, {members}, type=roaring)")
    .filterTemplateValues(Collections.singletonMap("members", roaringBlob)).build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const roaringBlob = buildRoaringBitmap(integerIds);
await client.delete({ collection_name: 'docs',
  filter: 'membership_match(id, {members}, type=roaring)',
  exprValues: { members: roaringBlob } });
```

</TabItem>
</Tabs>

Delete 遵循精确的三值匹配语义：

| 字段值 | membership_match(...) | not membership_match(...) |
| --- | --- | --- |
| NULL | 不匹配（NULL） | 不匹配（NULL） |
| 在集合内 | 匹配 | 不匹配 |
| 在集合外 | 不匹配 | 匹配 |

逐行阅读上表：带 `membership_match` 的 Delete 删除集合内的 Entity；带 `not membership_match` 的 Delete 删除集合外的 Entity；字段值为 NULL 的 Entity 在两种方向下都会保留。

- 字段值为 NULL 的 Entity 在任一方向下都不会被删除。

- 空 bitmap 不会删除任何数据。`not membership_match(<field>, {<empty>}, type=roaring)` 会删除所有字段值非 NULL 的行——这是精确的补集，可能是一个刻意为之的大集合。

- `not membership_match` 是成员集合在非 NULL Entity 上的精确补集，不是近似。

在仅加载 Index、没有原始标量数据的 sealed segment 上，若 Index 支持将以有界反向查找求值。当原始字段数据和合格 Index 都不可用时，请求会以 `FieldNotLoaded` 失败，而不是返回未过滤的 Entity。

