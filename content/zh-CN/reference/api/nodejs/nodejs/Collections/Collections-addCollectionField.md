---
title: "addCollectionField() | Node.js"
slug: /node/node/Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加一个新的标量字段，而无需重新创建该 Collection。由于内部 Schema 同步，该字段几乎会立即变为可用，延迟极小。 | Node.js"
type: docx
token: BKqIdIm0cop2s0xYjtQcSZL5nth
sidebar_position: 19
keywords: 
  - AI Agent
  - 语义搜索
  - 异常检测
  - sentence transformers
  - zilliz
  - zilliz cloud
  - 云
  - addCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# addCollectionField()

此操作会向现有 Collection 添加一个新的标量字段，而无需重新创建该 Collection。由于内部 Schema 同步，该字段几乎会立即变为可用，延迟极小。

```javascript
await milvusClient.addCollectionField(data: AddCollectionFieldReq)
```

<Admonition type="info" title="Notes">

如果该 Collection 已启用动态字段，而您添加的静态字段与现有动态字段键同名，则该静态字段会遮盖该动态字段键。原始动态值仍可通过 `$meta['field_name']` 语法访问。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.addCollectionField({
    collection_name: string,
    db_name?: string,
    field: FieldType,
    timeout?: number
})
```

**参数：**

- **collection_name** （*string*） -

    目标 Collection 的名称。

- **db_name** （*string*） -

    目标 Database 的名称。

- **field** （*FieldType*） -

    要添加的字段配置，它是一个 **FieldType** 对象，包含以下字段：

    - **name** （*string*） -

        字段的名称。

    - **data_type** （*string*） -

        字段的数据类型。有关所有可用数据类型的枚举，请参见 [DataType](./Collections-DataType)。

    - **description** （*string*） -

        字段的说明。

    - **is_clustering_key** （*boolean*） -

        一个布尔值，指示该字段是否将用作聚簇键。

    - **is_partition_key** （*boolean*） -

        一个布尔值，指示该字段是否将用作 Partition 键字段。

    - **is_primary_key** （*boolean*） -

        该字段是否将用作主键。

        该值默认为 **False**。将其设置为 **True** 会使该字段成为主键字段，该字段在整个 Collection 中唯一。

    - **type_params** （*string* | *number*） -

        该字段的其他参数。

        - **auto_id** （*boolean*） -

            向该 Collection 插入数据时，主字段是否自动递增。

            该值默认为 **False**。将其设置为 **True** 会使主字段自动递增。如果您需要设置具有自定义 Schema 的 Collection，请跳过此参数。

        - **dim** （*string* | *number*） -

            用于存储向量嵌入的 Collection 字段的维度。

            该值应为大于 1 的整数，通常由您用于生成向量嵌入的模型决定。

        - **element_type** （string） -

            数组中元素的数据类型。

            如果当前字段为数组字段，则此参数适用。

        - **max_capacity** （*string* | *number*） -

            数组中元素的数量。

            如果当前字段为数组字段，则此参数适用。

        - **max_length** （*string*） -

            该字段中字符串的最大长度。

            当该字段的 **data_type** 为 **VarChar** 时，此参数为必需项。

        - **type_params** （*object*） -

            当前字段的其他参数，以键值对表示。

    - **nullable** （*boolean*） -

        一个布尔参数，用于指定该字段是否可以接受 null 值。有效值：

        - **true**：该字段可以包含 null 值，表示该字段为可选字段，并允许条目的数据缺失。

        - **false**（默认值）：该字段必须为每个 Entity 包含有效值；不允许数据缺失，因此该字段为必填字段。

        有关详细信息，请参见 [Nullable & Default](https://milvus.io/docs/nullable-and-default.md)。

    - **default_value** （*object*）

        在创建 Collection Schema 时为该 Schema 中的特定字段设置默认值。当您希望某些字段即使在数据插入期间未显式提供值时也具有初始值时，此参数特别有用。

    - **enable_analyzer** （*boolean*） -

        是否为指定的 `VarChar` 字段启用文本分析。设置为 `true` 时，会指示 Milvus 使用文本 Analyzer，该 Analyzer 会对该字段的文本内容进行分词和过滤。

    - **enable_match** （*boolean*）

        是否为指定的 `VarChar` 字段启用关键词匹配。设置为 `true` 时，Milvus 会为该字段创建倒排索引，从而支持快速高效的关键词查找。`enable_match` 与 `enable_analyzer` 配合使用，以提供基于词项的结构化文本搜索，其中 `enable_analyzer` 负责分词，`enable_match` 负责对这些词项执行搜索操作。

    - **analyzer_params** （*object*）

        配置用于文本处理的 Analyzer，具体用于 `VarChar` 字段。此参数用于配置分词器和过滤器设置，尤其适用于 [关键词匹配](https://milvus.io/docs/keyword-match.md) 或 [全文搜索](https://milvus.io/docs/full-text-search.md) 中使用的文本字段。根据 Analyzer 的类型，可以通过以下任一方法进行配置：

        - 内置 Analyzer

            ```javascript
            const analyzer_params: { type: 'english' };
            ```

            - `type` （*string*） -

                Milvus 内置的预配置 Analyzer 类型，可以通过指定其名称开箱即用。可能的值：`standard`、`english`、`chinese`。有关详细信息，请参见 [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md) 和 [Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md)。

        - 自定义 Analyzer

            ```javascript
            const analyzer_params: {
                "tokenizer": "standard",
                "filter": ["lowercase"],
            };
            ```

            - `tokenizer` （*string*） -

                定义分词器类型。可能的值：`standard`（默认值）、`whitespace`、`jieba`。有关详细信息，请参见 [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md) 和 [Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md)。

            - `filter` （*list*） -

                列出用于优化分词器所生成词项的过滤器，可选择内置过滤器和自定义过滤器。有关详细信息，请参见 [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) 等。

    - **external_field** （*string*） -

        此字段所映射的外部源文件中的字段名称。此参数适用于外部 Collection。

- **timeout** （*number*） -  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回类型：** *Promise\<ResStatus>*

此方法返回一个 Promise，该 Promise 会解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** （*number*） -

    指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

- **error_code** （*string* | *number*） -

    指示所发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

- **reason** （*string*） - 

    指示所报告错误原因的说明。如果此操作成功，则该值为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const resStatus = await milvusClient.addCollectionField({
  collection_name: 'my_collection',
  field: [{
    name: 'new_field',
    data_type: 'Int64',
    is_primary_key: false,
    description: 'A new field'
  }]
});
```
