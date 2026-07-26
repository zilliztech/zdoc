---
title: "JSON 概述 | BYOC"
slug: /json-field-overview
sidebar_label: "JSON 概述"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在构建产品目录、内容管理系统或用户偏好引擎等应用时，你通常需要在向量 Embedding 的同时存储灵活的元数据。产品属性会因品类而异，用户偏好会随时间变化，文档属性可能包含复杂的嵌套结构。 | BYOC"
type: origin
token: W1c9w47DGipPiAkMpr8cKviNnpb
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 标量字段
  - JSON 字段
  - JSON field
  - 概述

---

import Admonition from '@theme/Admonition';


# JSON 概述

在构建产品目录、内容管理系统或用户偏好引擎等应用时，你通常需要在向量 Embedding 的同时存储灵活的元数据。产品属性会因品类而异，用户偏好会随时间变化，文档属性可能包含复杂的嵌套结构。
 在 Zilliz Cloud 中，JSON 字段通过支持存储和查询灵活的结构化数据，在不牺牲性能的前提下解决了这一挑战。

## 什么是 JSON 字段？\{#what-is-a-json-field?}

JSON 字段是 Zilliz Cloud 中一种通过模式定义的数据类型（`DataType.JSON`），用于存储结构化的键值对数据。
 与传统的刚性数据库列不同，JSON 字段支持嵌套对象、数组和混合数据类型，并提供多种索引选项以加速查询。

示例 JSON 字段结构：

```json
{
  "metadata": { 
    "category": "electronics",
    "brand": "BrandA",
    "in_stock": true,
    "price": 99.99,
    "string_price": "99.99",
    "tags": ["clearance", "summer_sale"],
    "supplier": {
      "name": "SupplierX",
      "country": "USA",
      "contact": {
        "email": "support@supplierx.com",
        "phone": "+1-800-555-0199"
      }
    }
  }
}
```

在该示例中，`metadata` 是一个单独的 JSON 字段，其中包含扁平值（如 `category`、`in_stock`）、数组（`tags`）以及嵌套对象（`supplier`）的混合结构。

<Admonition type="info" icon="📘" title="说明">

<p><strong>命名规范</strong>：JSON 键只能使用字母、数字和下划线。避免使用特殊字符、空格或点号，否则可能导致查询解析错误。</p>

</Admonition>

## JSON 字段 vs. 动态字段\{#json-field-vs-dynamic-field}

一个常见的困惑点是 JSON 字段与动态字段之间的区别。两者虽然都与 JSON 相关，但用途不同。

<table>
   <tr>
     <th><p><strong>特性</strong></p></th>
     <th><p>JSON Field</p></th>
     <th><p>Dynamic Field</p></th>
   </tr>
   <tr>
     <td><p><strong>模式定义</strong></p></td>
     <td><p>必须在集合模式中显式声明为 <strong>DataType.JSON</strong> 类型的标量字段</p></td>
     <td><p>一个隐藏的 JSON 字段（名称为 <code>$meta</code>），会自动存储未声明的字段</p></td>
   </tr>
   <tr>
     <td><p><strong>使用场景</strong></p></td>
     <td><p>存储已知且一致的结构化数据</p></td>
     <td><p>存储灵活的、演变的或不符合固定模式的半结构化数据</p></td>
   </tr>
   <tr>
     <td><p><strong>控制</strong></p></td>
     <td><p>由用户控制字段名和结构</p></td>
     <td><p>系统管理未定义的字段</p></td>
   </tr>
   <tr>
     <td><p><strong>查询方式</strong></p></td>
     <td><p>使用字段名或 JSON 字段中的目标键进行查询：<code>metadata["key"]</code></p></td>
     <td><p>可直接使用动态字段键 <code>"dynamic_key"</code>，或通过 <code>&#36;meta</code> 引用：<code>&#36;meta["dynamic_key"]</code></p></td>
   </tr>
</table>

## 基本操作\{#basic-operations}

使用 JSON 字段的基本流程包括：

1. 在 Schema 中定义字段

1. 插入数据

1. 使用特定的过滤表达式进行查询

### 定义 JSON 字段\{#1-define-json-field}

要使用 JSON 字段，你需要在创建集合时显式地在 Collection Schema 中定义它。以下示例展示了如何创建一个包含 `metadata` 字段（类型为 `DataType.JSON`）的 Collection：

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN" 

# Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# Create schema
schema = client.create_schema(auto_id=False, enable_dynamic_field=True)

schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True) # Primary field
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5) # Vector field
# Define a JSON field that allows null values
# highlight-next-line
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)

client.create_collection(
    collection_name="product_catalog",
    schema=schema
)
```

<Admonition type="info" icon="📘" title="说明">

<p>在此示例中，集合模式中定义的 JSON 字段通过设置 <code>nullable=True</code> 允许空值。详情请参见 <a href="./nullable-and-default">Nullable 和默认值</a>。</p>

</Admonition>

### 插入数据\{#2-insert-data}

Collection 创建完成后，在指定的 JSON 字段中插入包含结构化 JSON 对象的实体。你的数据格式应为字典列表。

```python
entities = [
    {
        "product_id": 1,
        "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
        # highlight-start
        "metadata": { # JSON field
            "category": "electronics",
            "brand": "BrandA",
            "in_stock": True,
            "price": 99.99,
            "string_price": "99.99",
            "tags": ["clearance", "summer_sale"],
            "supplier": {
                "name": "SupplierX",
                "country": "USA",
                "contact": {
                    "email": "support@supplierx.com",
                    "phone": "+1-800-555-0199"
                }
            }
        }
        # highlight-end
    }
]

client.insert(collection_name="product_catalog", data=entities)
```

### 过滤操作\{#3-filtering-operations}

在对 JSON 字段执行过滤操作之前，请确保：

- 已为每个向量字段创建索引。

- Collection 已加载到内存中。

<details>

<summary>显示代码</summary>

```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    index_name="vector_index",
    metric_type="COSINE"
)

client.create_index(collection_name="product_catalog", index_params=index_params)

client.load_collection(collection_name="product_catalog")
```

</details>

当满足以上条件后，你就可以使用以下表达式，根据 JSON 字段中的值对 Collection 进行过滤。这些过滤表达式利用了特定的JSON 路径语法和专用运算符。

#### 使用 JSON 路径语法进行过滤\{#filtering-with-json-path-syntax}

- 查询特定键时，使用中括号语法访问 JSON 键：
`json_field_name["key"]`

- 对于嵌套键，将其链式拼接：
`json_field_name["key1"]["key2"]`

要过滤出 `category` 为 `"electronics"` 的数据：

```python
# Define filter expression
filter = 'metadata["category"] == "electronics"'

client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
)
```

要过滤出嵌套键 `supplier["country"]` 等于 `"USA"` 的数据：

```python
# Define filter expression
filter = 'metadata["supplier"]["country"] == "USA"'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
)

print(res)
```

#### 使用 JSON 专用运算符进行过滤\{#filtering-with-json-specific-operators}

Zilliz Cloud 还提供了一些专门用于查询 JSON 字段中数组值的运算符，例如：

- `json_contains(identifier, expr)`：检查某个 JSON 数组中是否包含指定元素或子数组

- `json_contains_all(identifier, expr)`：确保字段中包含 JSON 表达式中指定的所有元素

- `json_contains_any(identifier, expr)`：筛选出字段中至少包含 JSON 表达式中一个元素的实体

要查找 `tags` 键下包含 `"summer_sale"` 值的产品：

```python
# Define filter expression
filter = 'json_contains(metadata["tags"], "summer_sale")'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
)

print(res)
```

要查找在 `tags` 键下至少包含 `"electronics"`、`"new"` 或 `"clearance"` 其中一个值的产品：

```python
# Define filter expression
filter = 'json_contains_any(metadata["tags"], ["electronics", "new", "clearance"])'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
)

print(res)
```

有关更多信息，请参考 [JSON 操作符](./json-filtering-operators)。

## 下一步：加速 JSON 查询\{#next-accelerate-json-queries}

默认情况下，如果对 JSON 字段的查询没有加速措施，会对所有行执行全表扫描，在大规模数据集上可能会非常慢。

 为了加速 JSON 查询，Zilliz Cloud 提供了高级的索引和存储优化功能。

下表总结了它们的区别及最佳使用场景：

<table>
   <tr>
     <th><p><strong>技术</strong></p></th>
     <th><p><strong>最佳适用场景</strong></p></th>
     <th><p><strong>是否支持数组加速</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>JSON 索引</strong></p></td>
     <td><p>少量高频访问的键，或某个特定数组键上的数组</p></td>
     <td><p>是（针对已索引的数组键）</p></td>
     <td><p>必须预先选择键，如果 schema 演变需要维护</p></td>
   </tr>
   <tr>
     <td><p><strong>JSON Shredding</strong></p></td>
     <td><p>跨多个键的一般性加速，灵活支持多样化查询</p></td>
     <td><p>是（与暴搜相比能轻微加速数组查询）</p></td>
     <td><p>需要额外的存储配置，数组仍需逐键索引</p></td>
   </tr>
   <tr>
     <td><p><strong>NGRAM 索引</strong></p></td>
     <td><p>通配符搜索、文本字段中的子串匹配</p></td>
     <td><p>不适用</p></td>
     <td><p>不适用于数值/范围过滤</p></td>
   </tr>
</table>

 **提示**：你可以组合使用这些方法，例如：

- 使用 **JSON Shredding** 提供广泛的查询加速

- 使用 **JSON 索引**优化高频数组键

- 使用 **NGRAM 索引**实现灵活的文本搜索

有关实现细节，请参考：

- [JSON 索引](./json-indexing)

- [JSON Shredding](./json-shredding)

- [NGRAM](./ngram-index-type)

## FAQ\{#faq}

### JSON 字段的大小有限制吗？\{#are-there-any-limitations-on-the-size-of-a-json-field}

有的。每个 JSON 字段限制为 65,536 字节。

### JSON 字段支持设置默认值吗？\{#does-a-json-field-support-setting-a-default-value}

不支持，JSON 字段不支持默认值。但是，您可以在定义字段时设置 `nullable=True` 来允许空条目。

详情请参考 [Nullable 和默认值](./nullable-and-default)。

### JSON 字段键有命名规范吗？\{#are-there-any-naming-conventions-for-json-field-keys}

有的。为了确保与查询和索引的兼容性：

- 在 JSON 键中只使用字母、数字和下划线。

- 避免使用特殊字符、空格或点（`.`、`/` 等）。

- 不兼容的键可能会在过滤表达式中导致解析问题。

### Zilliz Cloud 如何处理 JSON 字段中的字符串值？\{#how-does-zilliz-cloud-handle-string-values-in-json-fields}

Zilliz Cloud 完全按照 JSON 输入中的字符串值存储——不进行语义转换。引号不当的字符串可能会在解析过程中导致错误。

**有效字符串示例**：

```plaintext
"a\"b", "a'b", "a\\b"
```

**无效字符串示例**：

```plaintext
'a"b', 'a\'b'
```

