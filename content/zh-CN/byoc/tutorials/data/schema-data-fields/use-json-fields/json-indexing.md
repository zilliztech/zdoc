---
title: "JSON 索引 | BYOC"
slug: /json-indexing
sidebar_label: "JSON 索引"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON 字段为在 Zilliz Cloud 中存储结构化元数据提供了一种灵活方式。如果没有索引，对 JSON 字段的查询需要执行全表扫描，随着数据集规模增长，查询速度会变慢。JSON 索引 通过在 JSON 数据中创建索引，实现快速查找。 | BYOC"
type: origin
token: GKEewZ99aij5Twk7OecceHdsnMg
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 标量字段
  - JSON 字段
  - JSON field
  - 索引

---

import Admonition from '@theme/Admonition';


# JSON 索引

JSON 字段为在 Zilliz Cloud 中存储结构化元数据提供了一种灵活方式。如果没有索引，对 JSON 字段的查询需要执行全表扫描，随着数据集规模增长，查询速度会变慢。**JSON 索引** 通过在 JSON 数据中创建索引，实现快速查找。

JSON 索引的最佳使用场景:

- 结构化 Schema 中包含一致且已知的键

- 针对特定 JSON 路径的等值和范围查询

- 需要精确控制哪些键被索引的场景

- 存储高效的目标化查询加速

<Admonition type="info" icon="📘" title="说明">

<p>对于复杂的 JSON 文档，如果查询模式多样，可以考虑使用 <a href="./json-shredding">JSON Shredding</a> 作为替代方案。</p>

</Admonition>

## JSON 索引语法\{#json-index-syntax}

在创建 JSON 索引时，需要指定以下内容：

- **JSON path**：要索引的数据的确切位置

- **数据转换类型 (cast type)**：如何解释并存储被索引的值

- **可选类型转换**：在索引过程中对数据进行必要的转换

创建 JSON 字段索引的语法如下：

```python
# Prepare index params
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="<json_field_name>",  # Name of the JSON field
    index_type="AUTOINDEX",  # Must be AUTOINDEX
    index_name="<unique_index_name>",  # Index name
    params={
        "json_path": "<path_to_json_key>",  # Specific key to be indexed within JSON data
        "json_cast_type": "<data_type>",  # Data type to use when interpreting and indexing the value
        # "json_cast_function": "<cast_function>"  # Optional: convert key values into a target type at index time
    }
)
```

<table>
   <tr>
     <th><p>参数</p></th>
     <th><p>描述</p></th>
     <th><p>示例值</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>Collection Schema 中 JSON 字段的名称</p></td>
     <td><p><code>"metadata"</code></p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>JSON 索引必须为 <code>"AUTOINDEX"</code></p></td>
     <td><p><code>"AUTOINDEX"</code></p></td>
   </tr>
   <tr>
     <td><p><code>index_name</code></p></td>
     <td><p>此索引的唯一标识符</p></td>
     <td><p><code>"category_index"</code></p></td>
   </tr>
   <tr>
     <td><p><code>json_path</code></p></td>
     <td><p>JSON 对象中要索引的键路径</p></td>
     <td><ul><li><p>Top-level key: <code>'metadata["category"]'</code></p></li><li><p>Nested key: <code>'metadata["supplier"]["contact"]["email"]'</code></p></li><li><p>Entire JSON object: <code>"metadata"</code></p></li><li><p>Sub-object: <code>'metadata["supplier"]'</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>json_cast_type</code></p></td>
     <td><p>用于解释并索引该值的数据类型。必须与目标键的实际数据类型一致。</p><p>可用类型详见<a href="./json-indexing#supported-cast-types">支持的 Cast 类型</a>。</p></td>
     <td><p><code>"VARCHAR"</code></p></td>
   </tr>
   <tr>
     <td><p><code>json_cast_function</code></p></td>
     <td><p>（可选）在建立索引时将原始键值转换为目标类型。仅当键值存储格式错误且你希望在索引过程中转换数据类型时才需要配置。</p><p>可用函数详见 <strong>Supported cast functions</strong>。</p></td>
     <td><p><code>"STRING_TO_DOUBLE"</code></p></td>
   </tr>
</table>

### 支持的 Cast 类型\{#supported-cast-types}

Zilliz Cloud 在建立索引时支持以下数据类型转换。这些类型确保数据能被正确解析，从而实现高效过滤。

<table>
   <tr>
     <th><p>Cast 类型</p></th>
     <th><p>描述</p></th>
     <th><p>示例 JSON 值</p></th>
   </tr>
   <tr>
     <td><p><code>BOOL</code> / <code>bool</code></p></td>
     <td><p>用于索引布尔值，支持基于 true/false 条件的过滤</p></td>
     <td><p><code>true</code>, <code>false</code></p></td>
   </tr>
   <tr>
     <td><p><code>DOUBLE</code> / <code>double</code></p></td>
     <td><p>用于数值（整数或浮点数），支持范围或等值过滤（如 &gt;, &lt;, ==）</p></td>
     <td><p><code>42</code>, <code>99.99</code></p></td>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code> / <code>varchar</code></p></td>
     <td><p>用于索引字符串，常见于基于文本的数据，如名称、类别或 ID</p></td>
     <td><p><code>"electronics"</code>, <code>"BrandA"</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_BOOL</code> / <code>array_bool</code></p></td>
     <td><p>用于索引布尔数组</p></td>
     <td><p><code>[true, false, true]</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_DOUBLE</code> / <code>array_double</code></p></td>
     <td><p>用于索引数值数组</p></td>
     <td><p><code>[1.2, 3.14, 42]</code></p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY_VARCHAR</code> / <code>array_varchar</code></p></td>
     <td><p>用于索引字符串数组，适合存储标签或关键词列表</p></td>
     <td><p><code>["tag1", "tag2", "tag3"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>JSON</code> / <code>json</code></p></td>
     <td><p>用于整个 JSON 对象或子对象，支持自动类型推断和扁平化。</p><p>对整个 JSON 对象建立索引会显著增加索引体积。若包含大量键，建议考虑 <a href="./json-shredding">JSON Shredding</a>。</p></td>
     <td><p>任意 JSON 对象</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

<p>数组应包含相同类型的元素，以实现最佳索引性能。更多信息请参考 <a href="./use-array-fields">Array 类型</a>。</p>

</Admonition>

### 支持的 Cast 函数\{#supported-cast-functions}

如果 JSON 字段中的某个键存储的值格式错误（如数字以字符串形式存储），可以通过在 `json_cast_function` 参数中指定 **cast 函数**，在索引过程中进行类型转换。

Cast 函数大小写不敏感。当前支持以下函数：

<table>
   <tr>
     <th><p>Cast 函数</p></th>
     <th><p>转换方向</p></th>
     <th><p>使用场景</p></th>
   </tr>
   <tr>
     <td><p><code>STRING_TO_DOUBLE</code> / <code>string_to_double</code></p></td>
     <td><p>字符串 → 数值 (double)</p></td>
     <td><p>将 <code>"99.99"</code> 转换为 <code>99.99</code></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

<p>如果转换失败（例如非数字字符串），该值会被跳过，不会被索引。</p>

</Admonition>

## 创建 JSON 索引\{#create-json-index}

本节展示如何针对不同类型的 JSON 数据创建索引，并提供实际示例。
 所有示例均基于以下示例 JSON 结构，并假设你已经通过 **MilvusClient** 建立了连接并正确定义了 Collection Schema。

### 示例 JSON 结构\{#example-json-structure}

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

### 基础设置\{#basic-setup}

在创建任何 JSON 索引之前，需要先准备索引参数。

```python
# Prepare index params
index_params = MilvusClient.prepare_index_params()
```

### 示例 1：为简单的 JSON 键建立索引\{#example-1-index-a-simple-json-key}

在 `category` 字段上创建索引，以便快速按产品类别进行过滤：

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="category_index",  # Unique index name
    # highlight-start
    params={
        "json_path": 'metadata["category"]', # Path to the JSON key
        "json_cast_type": "varchar" # Data cast type
    }
    # highlight-end
)
```

### 示例 2：为嵌套键建立索引\{#example-2-index-a-nested-key}

在深层嵌套的 `email` 字段上创建索引，以便进行供应商联系信息搜索：

```python
# Index the nested key
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="email_index", # Unique index name
    # highlight-start
    params={
        "json_path": 'metadata["supplier"]["contact"]["email"]', # Path to the nested JSON key
        "json_cast_type": "varchar" # Data cast type
    }
    # highlight-end
)
```

### 示例 3：在索引时进行数据类型转换\{#example-3-convert-data-type-at-index-time}

有时数值数据会被错误地存储为字符串。可以使用 `STRING_TO_DOUBLE` cast 函数进行转换并正确建立索引：

```python
# Convert string numbers to double for indexing
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="string_to_double_index", # Unique index name
    params={
        "json_path": 'metadata["string_price"]', # Path to the JSON key to be indexed
        "json_cast_type": "double", # Data cast type
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE" # Cast function; case insensitive
    }
)
```

**重要说明**：如果某个文档的值转换失败（例如 `"invalid"` 这样的非数字字符串），该文档的值会被排除在索引之外，并且不会出现在过滤结果中。

### 示例 4：为整个对象建立索引\{#example-4-index-entire-objects}

为完整的 JSON 对象建立索引，可以在其任意字段上执行查询。
 当你使用 `json_cast_type="JSON"` 时，系统会自动：

- **扁平化 JSON 结构**：将嵌套对象转换为平铺路径，以实现高效索引

- **推断数据类型**：根据内容自动识别数值、字符串、布尔值或日期

- **创建全面覆盖**：对象中的所有键和嵌套路径都可被搜索

对于[上述示例 JSON 结构](./json-indexing#example-json-structure)，可以对整个 `metadata` 对象建立索引：

```python
# Index the entire JSON object
index_params.add_index(
    field_name="metadata",
    index_type="AUTOINDEX",
    index_name="metadata_full_index",
    params={
        # highlight-start
        "json_path": "metadata",
        "json_cast_type": "JSON"
        # highlight-end
    }
)
```

你也可以只为 JSON 结构中的一部分建立索引，例如所有 `supplier` 信息：

```python
# Index a sub-object
index_params.add_index(
    field_name="metadata",
    index_type="AUTOINDEX", 
    index_name="supplier_index",
    params={
        # highlight-start
        "json_path": 'metadata["supplier"]',
        "json_cast_type": "JSON"
        # highlight-end
    }
)
```

### 应用索引配置\{#apply-index-configuration}

在定义完所有索引参数后，将它们应用到 Collection 中：

```python
# Apply all index configurations to the collection
MilvusClient.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

一旦索引创建完成，对 JSON 字段的查询将自动使用这些索引来提升性能。

## FAQ\{#faq}

### 如果查询的过滤表达式使用的类型与索引的 cast 类型不同，会发生什么？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

如果过滤表达式的类型与索引的 `json_cast_type` 不一致，Zilliz Cloud 将不会使用该索引，若数据允许，可能会回退到较慢的全表扫描。

为了获得最佳性能，请确保过滤表达式的类型与索引的 cast 类型一致。
 例如，如果用 `json_cast_type="double"` 创建了数值索引，那么只有数值过滤条件才能利用该索引。

### 如果某个 JSON 键在不同实体中数据类型不一致怎么办？\{#when-creating-a-JSON-index-what-if-a-JSON-key-has-inconsistent-data-types-across-different-entities}

类型不一致会导致部分索引。 例如，如果 `metadata["price"]` 既存储为数值 `99.99`，又存储为字符串 `"99.99"`，并且你用 `json_cast_type="double"` 创建了索引，那么只有数值会被索引，字符串形式的条目会被跳过，并且不会出现在过滤结果中。

### 能否在同一个 JSON 键上创建多个索引？\{#can-I-create-multiple-indexes-on-the-same-JSON-key}

不可以。每个 JSON 键只支持一个索引，你必须选择一个与数据匹配的 `json_cast_type`。不过，你可以同时在整个 JSON 对象和该对象中的某个嵌套键上建立索引。

### JSON 字段是否支持设置默认值？\{#does-a-JSON-field-support-setting-a-default-value}

不支持。但你可以在定义字段时设置 `nullable=True`，以允许空值。详情请参考 [Nullable 和默认值](./nullable-and-default)。