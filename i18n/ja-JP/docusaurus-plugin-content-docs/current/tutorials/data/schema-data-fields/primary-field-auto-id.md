---
title: "プライマリフィールドとAutoID | Cloud"
slug: /primary-field-auto-id
sidebar_label: "プライマリフィールドとAutoID"
beta: FALSE
notebook: FALSE
description: "プライマリフィールドはエンティティを一意に識別します。このページでは、2つの異なるデータ型のプライマリフィールドを追加する方法と、Zilliz Cloudを有効にしてプライマリフィールドの値を自動的に割り当てる方法を紹介します。 | Cloud"
type: origin
token: Fk0iwPAsGipnxxkFM6TcS1F1nQe
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - primary field
  - autoId
  - autoid
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# プライマリフィールドとAutoID

プライマリフィールドはエンティティを一意に識別します。このページでは、2つの異なるデータ型のプライマリフィールドを追加する方法と、Zilliz Cloudを有効にしてプライマリフィールドの値を自動的に割り当てる方法を紹介します。

## 概要について{#overview}

コレクションでは、各エンティティの主キーはグローバルに一意である必要があります。主フィールドを追加する場合は、明示的にデータ型を**VARCHAR**または**INT64**に設定する必要があります。データ型を**INT64**に設定すると、主キーは`12345`に似た整数である必要があります。データ型を**VARCHAR**に設定すると、主キーは`my_entity_1234`に似た文字列である必要があります。

また、**AutoID**を有効にして、Zilliz Cloudが受信するエンティティのプライマリキーを自動的に割り当てるようにすることもできます。コレクションで**AutoID**を有効にしたら、エンティティを挿入する際にプライマリキーを含めないようにしてください。

コレクション内のプライマリフィールドにはデフォルト値がなく、nullにすることはできません。

## Int 64プライマリキーを使用{#use-int64-primary-keys}

Int 64型のプライマリキーを使用するには、`datatype`を`DataType.INT64`に設定し、`is_primary`を`true`に設定する必要があります。受信するエンティティのプライマリキーを割り当てるためにZilliz Cloudも必要な場合は、`auto_id`を`true`に設定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema()

schema.add_field(
    field_name="my_id",
    datatype=DataType.INT64,
    # highlight-start
    is_primary=True,
    auto_id=True,
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq; 
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
        .fieldName("my_id")
        .dataType(DataType.Int64)
        // highlight-start
        .isPrimaryKey(true)
        .autoID(true)
        // highlight-end
        .build());
);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

const schema = [
  {
    name: "pk",
    description: "ID field",
    data_type: DataType.VARCHAR,
    is_primary_key: true,
    max_length: 100,
  },
];
```

</TabItem>

<TabItem value='go'>

```go
// Go
```

</TabItem>

<TabItem value='bash'>

```bash
export primaryField='{
    "fieldName": "my_id",
    "dataType": "Int64",
    "isPrimary": true
}'

export schema="{
    \"autoID\": true,
    \"fields\": [
        $primaryField
    ]
}"
```

</TabItem>
</Tabs>

## VarCharプライマリキーを使用する{#use-varchar-primary-keys}

VarCharプライマリキーを使用するには、`datatype`パラメータの値を`DataType.VARCHAR`に変更するだけでなく、フィールドの`max_length`パラメータも設定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="my_id",
    datatype=DataType.VARCHAR,
    # highlight-start
    is_primary=True,
    auto_id=True,
    max_length=512,
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq; 

schema.addField(AddFieldReq.builder()
        .fieldName("my_id")
        .dataType(DataType.VarChar)
        // highlight-start
        .isPrimaryKey(true)
        .autoID(true)
        .maxLength(512)
        // highlight-end
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
schema.push({
    name: "my_id",
    data_type: DataType.VarChar,
    // highlight-start
    is_primary_key: true,
    autoID: true,
    maxLength: 512
    // highlight-end
});
```

</TabItem>

<TabItem value='go'>

```go
// Go
```

</TabItem>

<TabItem value='bash'>

```bash
export primaryField='{
    "fieldName": "my_id",
    "dataType": "VarChar",
    "isPrimary": true
}'

export schema="{
    \"autoID\": true,
    \"fields\": [
        $primaryField
    ],
    \"params\": {
        \"max_length\": 512
    }
}"
```

</TabItem>
</Tabs>

