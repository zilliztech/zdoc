---
title: "コレクションフィールドを変更する | BYOC"
slug: /alter-collection-field
sidebar_label: "コレクションフィールドを変更する"
beta: FALSE
notebook: FALSE
description: "コレクションフィールドのプロパティを変更して、列の制約を変更したり、より厳格なデータ整合性ルールを適用したりできます。 | BYOC"
type: origin
token: BPVOwD335iKOrek0N4pcnJ9Enae
sidebar_position: 13
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - field properties
  - alter collection field
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションフィールドを変更する

コレクションフィールドのプロパティを変更して、列の制約を変更したり、より厳格なデータ整合性ルールを適用したりできます。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>各コレクションは1つのプライマリフィールドのみで構成されています。コレクション作成時に設定したプライマリフィールドやそのプロパティを変更することはできません。</p></li>
<li><p>各コレクションには1つのパーティションキーしか持てません。コレクション作成時に設定したパーティションキーは変更できません。</p></li>
</ul>

</Admonition>

## Alter VarCharフィールド{#alter-varchar-field}

VarCharフィールドには、`max_length`という名前のプロパティがあり、フィールド値に含めることができる最大文字数を制限します。`max_length`プロパティは変更できます。

次の例では、コレクションがVarCharという名前のフィールド`varchar`を持ち、その`max_length`プロパティを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.alter_collection_field(
    collection_name="my_collection",
    field_name="varchar",
    field_params={
        "max_length": 1024
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.service.collection.request.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("varchar")
        .property("max_length", "1024")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// TODO
```

</TabItem>

<TabItem value='go'>

```go
// TODO
```

</TabItem>

<TabItem value='bash'>

```bash
// TODO
```

</TabItem>
</Tabs>

## Alter ARRAYフィールド{#alter-array-field}

配列のフィールドには、`element_type`と`max_Capacity`の2つのプロパティがあります。前者は配列内の要素のデータ型を決定し、後者は配列内の最大要素数を制限します。`max_Capacity`プロパティのみを変更できます。

次の例では、コレクションにarrayという名前の`配列`フィールドがあり、その`max_bility`プロパティを設定することを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_collection_field(
    collection_name="my_collection",
    field_name="array",
    field_params={
        "max_capacity": 64
    }
)
```

</TabItem>

<TabItem value='java'>

```java
client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("array")
        .property("max_capacity", "64")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionFieldProperties({
  collection_name: "my_collection",
  field_name: 'array',
  properties: { 
      max_capacity: 64 
  }
});
```

</TabItem>

<TabItem value='go'>

```go
// TODO
```

</TabItem>

<TabItem value='bash'>

```bash
// TODO
```

</TabItem>
</Tabs>

## フィールドレベルのmmap設定を変更する{#alter-field-level-mmap-settings}

メモリマッピング(Mmap)により、ディスク上の大きなファイルに直接メモリアクセスできるため、Zilliz Cloudはインデックスとデータをメモリとハードドライブの両方に保存できます。このアプローチにより、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張できます。

次の例では、コレクションに`doc_chunk`という名前のフィールドがあると仮定し、その`mmap_enable`プロパティを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_collection_field(
    collection="my_collection",
    field_name="doc_chunk",
    properties={"mmap.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
client.alterCollectionField(AlterCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("doc_chunk")
        .property("mmap.enabled", "True")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
  collection_name: "my_collection",
  field_name: 'doc_chunk',
  properties: { 
      'mmap.enabled': true, 
  }
});
```

</TabItem>

<TabItem value='go'>

```go
// TODO
```

</TabItem>

<TabItem value='bash'>

```bash
// TODO
```

</TabItem>
</Tabs>

