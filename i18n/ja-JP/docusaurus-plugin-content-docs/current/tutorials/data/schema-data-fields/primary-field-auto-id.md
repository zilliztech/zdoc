---
title: "プライマリフィールドとAutoID | Cloud"
slug: /primary-field-auto-id
sidebar_label: "プライマリフィールドとAutoID"
beta: FALSE
notebook: FALSE
description: "プライマリフィールドはエンティティを一意に識別します。このページでは、2つの異なるデータ型のプライマリフィールドを追加する方法と有効にする方法を紹介します。Zillizクラウド主要なフィールド値を自動的に割り当てる。 | Cloud"
type: origin
token: D2ctwKZhNilLY0ke1vpcHL62n5G
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
  - Image Search
  - LLMs
  - Machine Learning
  - RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# プライマリフィールドとAutoID

プライマリフィールドはエンティティを一意に識別します。このページでは、2つの異なるデータ型のプライマリフィールドを追加する方法と有効にする方法を紹介します。Zillizクラウド主要なフィールド値を自動的に割り当てる。

## 概要について{#overview}

コレクションにおいて、各エンティティの主キーはグローバルに一意である必要があります。主フィールドを追加する際には、そのデータ型を明示的にVARCHARまたはINT64に設定する必要があります。INT64にデータ型を設定すると、主キーは`12345`に似た整数である必要があります。VARCHARにデータ型を設定すると、主キーは`my_entity_1234`に似た文字列である必要があります。

**AutoID**を有効にすることもできますZillizクラウド受信するエンティティのプライマリキーを自動的に割り当てます。コレクションで**AutoID**を有効にしたら、エンティティを挿入する際にプライマリキーを含めないでください。

コレクション内のプライマリフィールドにはデフォルト値がなく、nullにすることはできません。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>コレクションに既に存在するプライマリキーを持つ標準の<code>insert</code>操作は、古いエントリを上書きしません。代わりに、同じプライマリキーを持つ新しい別々のエンティティを作成します。これにより、予期しない検索結果やデータの冗長性が生じる可能性があります。</p></li>
<li><p>既存のデータを更新するユースケースがある場合、または挿入するデータがすでに存在する可能性がある場合は、<code>upsert</code>操作を使用することを強くお勧めします。<code>upsert</code>操作は、主キーが存在する場合はエンティティをインテリジェントに更新し、存在しない場合は新しいキーを挿入します。詳細については、<a href="./upsert-entities">Upsertエンティティ</a>を参照してください。</p></li>
</ul>

</Admonition>

## Int 64プライマリキーを使用{#use-int64-primary-keys}

Int 64型のプライマリキーを使用するには、`datatype`を`DataType.INT64`に設定し、`is_primary`を`true`に設定する必要があります。Zillizクラウド受信エンティティの主キーを割り当てるには、`auto_id`を`true`に設定します。

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
    data_type: DataType.INT64,
    is_primary_key: true,
    max_length: 100,
  },
];
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/entity"

schema := entity.NewSchema()
schema.WithField(entity.NewField().WithName("my_id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
)
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

VarCharプライマリキーを使用するには、`data_type`パラメーターの値を`DataType.VARCHAR`に変更するだけでなく、フィールドの`max_length`パラメーターも設定する必要があります。 

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
schema := entity.NewSchema()
schema.WithField(entity.NewField().WithName("my_id").
    WithDataType(entity.FieldTypeVarChar).
    // highlight-start
    WithIsPrimaryKey(true).
    WithIsAutoID(true).
    WithMaxLength(512),
    // highlight-end
)
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

