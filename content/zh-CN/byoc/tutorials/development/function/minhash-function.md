---
title: "MinHash Function | BYOC"
slug: /minhash-function
sidebar_label: "MinHash Function"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "MinHash Function 可将原始文本转换为二进制向量，用于近似表示文档之间的 Jaccard 相似度。该 Function 会对文本进行 Shingling，并应用多个哈希函数生成固定长度的签名向量，从而支持大规模近重复检测和文档去重。 | BYOC"
type: origin
token: Xz97wLGqdiZXFxke1DlcEefpn7b
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MinHash Function

MinHash Function 可将原始文本转换为二进制向量，用于近似表示文档之间的 [Jaccard 相似度](https://en.wikipedia.org/wiki/Jaccard_index)。该 Function 会对文本进行 Shingling，并应用多个哈希函数生成固定长度的签名向量，从而支持大规模近重复检测和文档去重。

MinHash 是 Zilliz Cloud 内置 Function，不需要外部模型推理或预处理。您只需插入原始文本，Zilliz Cloud 会自动生成 MinHash 签名向量。

## 限制 \{#limits}

输出字段必须是 `BINARY_VECTOR`，且维度必须满足 `dim % 32 == 0`，因为每个 MinHash 签名值都是 32-bit 哈希值。

二进制向量字段的维度必须等于 `32 * num_hashes`。维度不匹配会导致报错。

使用 `MINHASH_LSH` 索引处理 MinHash Function 输出时，`mh_element_bit_width` 必须设置为 `32`。

## MinHash 工作原理 \{#how-minhash-works}

<details>

<summary>展开了解 MinHash 工作原理</summary>

[MinHash](https://en.wikipedia.org/wiki/MinHash) 是一种局部敏感哈希（Locality-Sensitive Hashing，LSH）技术，用于估算集合之间的 [Jaccard 相似度](https://en.wikipedia.org/wiki/Jaccard_index)。在 Zilliz Cloud 中，MinHash Function 遵循以下流程：您提供原始文本作为输入，Zilliz Cloud 生成二进制向量作为输出，并在内部完成所有中间处理步骤。

整体流程由两部分组成：文档写入和查询处理共用的**文本处理流水线**，以及写入和检索阶段各自的后续操作。

![PV7SbwQY1oVMMdxuqjmcH4y4nId](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/pv7sbwqy1ovmmdxuqjmch4y4nid.png "PV7SbwQY1oVMMdxuqjmcH4y4nId")

### **共享文本处理流水线 \{#shared-text-processing-pipleline}**

文档写入和查询处理都会将原始文本传入同一套四阶段转换流程：

1. **文本分析**：当 `token_level` 为 `"word"` 时，文本会由 Analyzer Overview 处理；当 `token_level` 为 `"char"` 时，文本会直接使用原始字符。词级别分词会使用输入字段上配置的 Analyzer 将文本切分为词元。例如，`"milvus is vector db"` 会被切分为 `["milvus", "is", "vector", "db"]`。

1. **Shingling**：词元会被切分为大小为 `shingle_size` 的重叠 n-gram（Shingle）。例如，在词级别使用 3-gram 时，词元 `["information", "retrieval", "is", "a", "field"]` 会生成 `["information retrieval is", "retrieval is a", "is a field"]` 等 Shingle。

1. **MinHash 签名生成**：Zilliz Cloud 会将多个哈希函数（H1、H2、...、Hn，其中 `n = num_hashes`）应用到 Shingle 集合。对于每个哈希函数，Zilliz Cloud 会选取所有 Shingle 哈希值中的最小值。所有最小值共同组成 MinHash 签名，用于以固定长度表示原始文档的近似 Jaccard 相似度。

1. **二进制向量编码**：每个签名值都是 32-bit 哈希值，完整签名会被打包为维度为 `32 * num_hashes` 的 `BINARY_VECTOR`。

### 文档写入 \{#document-ingestion}

写入数据时，共享流水线生成的二进制向量会存储在 MINHASH_LSH 索引中。该索引维护 LSH（Locality-Sensitive Hashing）表，将相似签名分组到相同 Bucket 中，从而在查询时快速检索候选文档。

### 查询处理 \{#query-processing}

查询时，查询文本会通过同一套共享流水线生成二进制向量。该向量用于在 MINHASH_LSH 索引中执行 LSH 查找，识别可能相似的候选文档，并返回对应的 `MHJACCARD` 分数。

由于写入和查询路径使用相同的转换逻辑，具有大量 Shingle 重叠的两个文档会生成相似的 MinHash 签名。因此，MinHash Function 适合在存在轻微格式差异或措辞差异时查找近重复文档。

</details>

## 开始前 \{#before-you-start}

使用 MinHash Function 前，请规划 Collection Schema，使其包含以下内容：

- **用于存储原始内容的文本字段**

    Collection 必须包含一个 VARCHAR 字段，用于存储原始文本。该字段作为 MinHash Function 的输入字段。

- **文本字段的 Analyzer**（使用词级别 Tokenization 时）

    如果 `token_level` 设置为 `"word"`（默认值），文本字段必须启用 Analyzer。Analyzer 定义文本在 Shingling 前的分词方式。默认情况下，Zilliz Cloud 使用 standard Analyzer。要配置其他 Analyzer，请参考[最佳实践：如何选择合适的 Analyzer](./choose-the-right-analyzer-for-your-use-case)。

- **用于存储 MinHash 输出的二进制向量字段**

    Collection 必须包含一个 `BINARY_VECTOR` 字段，用于存储 MinHash Function 生成的二进制向量。该字段的维度必须等于 `32 * num_hashes`。

## 第 1 步：创建带有 MinHash Function 的 Collection \{#step-1-create-a-collection-with-a-minhash-function}

要使用 MinHash Function，请在创建 Collection 时定义 Function。该 Function 会成为 Collection Schema 的一部分，并在数据写入和查询时自动生效。

### 定义 Schema 字段 \{#define-schema-fields}

Collection Schema 至少需要包含以下三个字段：

- **主键字段**：唯一标识 Collection 中的每个 Entity。

- **文本字段**（`VARCHAR`）：存储原始文本文档。设置 `enable_analyzer=True`，使 Zilliz Cloud 能够处理文本并生成 MinHash 签名。默认情况下，Zilliz Cloud 使用 standard Analyzer 进行文本分析。要配置其他 Analyzer，请参考[最佳实践：如何选择合适的 Analyzer](./choose-the-right-analyzer-for-your-use-case)。

- **二进制向量字段**（`BINARY_VECTOR`）：存储 MinHash Function 自动生成的二进制向量。该字段的维度必须等于 `32 * num_hashes`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

schema = client.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(field_name="document_content", datatype=DataType.VARCHAR, max_length=9000, enable_analyzer=True)
schema.add_field(field_name="binary_vector", datatype=DataType.BINARY_VECTOR, dim=8192)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

### 定义 MinHash Function \{#define-minhash-function}

MinHash Function 会将分析后的文本转换为二进制向量，用于近似表示文档之间的 Jaccard 相似度。

定义 Function 并将其添加到 Schema 中：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
minhash_function = Function(
    name="minhash_function",
    input_field_names=["document_content"], # Name of the VARCHAR field containing raw text
    output_field_names=["binary_vector"], # Name of the BINARY_VECTOR field for generated signatures
    function_type=FunctionType.MINHASH,
    params={
        "num_hashes": 256, # Number of hash functions; produces dim = 32 * 256 = 8192
        "shingle_size": 3, # N-gram size for shingling
    }
)

schema.add_function(minhash_function)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

**配置选项**

MinHash Function 的 `params` 字典支持以下参数。所有参数名都**不区分大小写**。

<table>
   <tr>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>类型</strong></p></th>
     <th><p><strong>默认值</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>num_hashes</code></p></td>
     <td><p>int</p></td>
     <td><p>从 <code>dim / 32</code> 推导</p></td>
     <td><p>用于签名生成的哈希函数数量。输出二进制向量维度等于 <code>32 &ast; num_hashes</code>。值越大，相似度估计的方差越低，但计算开销越高。推荐值：<code>256</code>（dim = 8192）。</p></td>
   </tr>
   <tr>
     <td><p><code>shingle_size</code></p></td>
     <td><p>int</p></td>
     <td><p><code>3</code></p></td>
     <td><p>Shingling 使用的 n-gram 大小。词级别通常使用 1-3；字符级别通常使用 2-6。</p></td>
   </tr>
   <tr>
     <td><p><code>hash_function</code></p></td>
     <td><p>str</p></td>
     <td><p><code>"xxhash"</code></p></td>
     <td><p>使用的哈希函数。可选值：</p><ul><li><p><code>"xxhash"</code>（速度快）</p></li><li><p><code>"sha1"</code>（速度较慢，抗碰撞能力更强）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>token_level</code></p></td>
     <td><p>str</p></td>
     <td><p><code>"word"</code></p></td>
     <td><p>Tokenization 级别。可选值：</p><ul><li><p><code>"word"</code> 使用字段 Analyzer 分词后执行 n-gram Shingling；</p></li><li><p><code>"char"</code> / <code>"character"</code> 直接对原始字符执行 n-gram Shingling，不使用 Analyzer。</p><p>词级别语义更强、效率更高，但依赖语言相关的分词；字符级别与语言无关，但会生成更高维的 Shingle，语义较弱。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>seed</code></p></td>
     <td><p>int</p></td>
     <td><p><code>1234</code></p></td>
     <td><p>MinHash Function 初始化使用的随机种子。</p></td>
   </tr>
</table>

### 配置索引 \{#configure-the-index}

MinHash 二进制向量推荐使用 `MINHASH_LSH` 索引，Metric Type 为 `MHJACCARD`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="binary_vector",
    index_type="MINHASH_LSH",
    metric_type="MHJACCARD",
    params={
        "mh_lsh_band": 128,
        "mh_element_bit_width": 32,
        "with_raw_data": True,
    },
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

### 创建 Collection \{#create-the-collection}

使用上面定义的 Schema 和索引参数创建 Collection：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="dedup_collection",
    schema=schema,
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## 第 2 步：插入文档 \{#step-2-insert-documents}

Collection 创建完成后，插入文本数据。您只需要提供原始文本，MinHash Function 会为每个文档自动生成二进制向量。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.insert(
    "dedup_collection",
    [
        {"document_content": "information retrieval is a field of study that helps users find relevant information in large datasets"},
        {"document_content": "information retrieval is a research field focused on helping users find relevant data in large collections"},
        {"document_content": "information retrieval is a field of research helping users search for relevant information in large datasets"},
    ],
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## 第 3 步：使用 MinHash 搜索 \{#step-3-search-with-minhash}

插入数据后，您可以通过提供原始文本查询来搜索近重复文档。Zilliz Cloud 会自动将查询文本转换为 MinHash 二进制向量，并返回带有 `MHJACCARD` 分数的候选文档。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
search_params = {
    "metric_type": "MHJACCARD",
    "params": {},
}

results = client.search(
    collection_name="dedup_collection",
    data=["information retrieval is a research field focused on helping users find relevant data in large collections"],
    anns_field="binary_vector",
    limit=3,
    output_fields=["document_content"],
    search_params=search_params,
)

for hits in results:
    for hit in hits:
        print(f"ID: {hit['id']}, Distance: {hit['distance']}")
        print(f"Document: {hit['entity']['document_content']}")
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## 下一步 \{#whats-next}

- Full Text Search：使用 BM25 进行词法相关性排序，而不是近重复检测。

- [Analyzer 概述](./analyzer-overview)：配置用于文本分词的自定义 Analyzer。

- MINHASH_LSH：了解如何调整 LSH 参数以平衡召回率和性能。

