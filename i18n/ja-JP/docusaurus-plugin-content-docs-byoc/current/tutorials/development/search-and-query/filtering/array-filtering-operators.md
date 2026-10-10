---
title: "ARRAY 演算子 | BYOC"
slug: /array-filtering-operators
sidebar_label: "Array"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ARRAY フィールドのフィルタリングや値の部分更新に使用できる ARRAY 演算子を提供します。 | BYOC"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ARRAY 演算子

Zilliz Cloud は、ARRAY フィールドのフィルタリングと、ARRAY フィールド値の部分更新を行うための ARRAY 演算子を提供します。

注意: 配列内のすべての要素は同じ型である必要があり、配列内のネストされた構造はプレーンな文字列として扱われます。そのため、ARRAY フィールドを扱う場合は、過度に深いネストを避け、最適なパフォーマンスを得るためにデータ構造を可能な限りフラットに保つことを推奨します。

Zilliz Cloud の ARRAY 演算子は、次の 2 つの用途に対応します。

- クエリおよび検索のためのフィルタ式。

- `upsert` リクエストにおける部分更新。

## 利用可能な ARRAY 演算子\{#available-array-operators}

次の表に、Zilliz Cloud で利用可能な ARRAY 演算子を示します。

| **演算子** | **用途** | **説明** |
| --- | --- | --- |
| [ARRAY_CONTAINS(identifier, expr)](./array-filtering-operators#arraycontains) | フィルタ式 | ARRAY フィールド内に特定の要素が存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ALL(identifier, expr)](./array-filtering-operators#arraycontainsall) | フィルタ式 | 指定したリストのすべての要素が ARRAY フィールド内に存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ANY(identifier, expr)](./array-filtering-operators#arraycontainsany) | フィルタ式 | 指定したリスト内のいずれかの要素が ARRAY フィールド内に存在するかどうかを確認します。 |
| [ARRAY_LENGTH(identifier)](./array-filtering-operators#arraylength) | フィルタ式 | ARRAY フィールドの要素数を返します。比較演算子と組み合わせてフィルタリングに使用できます。 |
| [ARRAY_APPEND](./array-filtering-operators#arrayappend) | `upsert` と `field_ops` | 既存の ARRAY フィールドにペイロードの要素を追加します。 |
| [ARRAY_REMOVE](./array-filtering-operators#arrayremove) | `upsert` と `field_ops` | リクエストペイロード内の値に一致するすべての要素を、既存の ARRAY フィールドから削除します。 |

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS` 演算子は、配列フィールド内に特定の要素が存在するかどうかを確認します。配列内に指定した要素が存在するエンティティを検索したい場合に便利です。

**例**

各年の記録された最低気温を含む配列フィールド `history_temperatures` があるとします。配列に値 `23` が含まれるすべてのエンティティを検索するには、次のフィルタ式を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ARRAY_CONTAINS(history_temperatures, 23)";
```

</TabItem>

<TabItem value='go'>

```go
filter := "ARRAY_CONTAINS(history_temperatures, 23)"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "ARRAY_CONTAINS(history_temperatures, 23)";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "ARRAY_CONTAINS(history_temperatures, 23)";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS(history_temperatures, 23)';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS(history_temperatures, 23)'
```

</TabItem>
</Tabs>

これにより、`history_temperatures` 配列に値 `23` が含まれるすべてのエンティティが返されます。

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

`ARRAY_CONTAINS_ALL` 演算子は、指定したリストのすべての要素が配列フィールド内に存在することを確認します。この演算子は、配列内に複数の値を含むエンティティを照合したい場合に便利です。

**例**

`history_temperatures` 配列に `23` と `24` の両方が含まれるすべてのエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='go'>

```go
filter := "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

</TabItem>
</Tabs>

これにより、`history_temperatures` 配列に指定した両方の値が含まれるすべてのエンティティが返されます。

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

`ARRAY_CONTAINS_ANY` 演算子は、指定したリスト内のいずれかの要素が配列フィールドに存在するかどうかを確認します。配列内に指定した値の少なくとも 1 つを含むエンティティを照合したい場合に便利です。

**例**

`history_temperatures` 配列に `23` または `24` のいずれかが含まれるすべてのエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='go'>

```go
filter := "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

</TabItem>
</Tabs>

これにより、`history_temperatures` 配列に値 `23` または `24` の少なくとも 1 つが含まれるすべてのエンティティが返されます。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH` は、配列フィールドの長さ（要素数）を返します。受け取るパラメーターは、配列フィールド識別子の 1 つだけです。

**例**

`history_temperatures` 配列の要素数が 10 未満であるすべてのエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='go'>

```go
filter := "ARRAY_LENGTH(history_temperatures) < 10"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_LENGTH(history_temperatures) < 10';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_LENGTH(history_temperatures) < 10'
```

</TabItem>
</Tabs>

これにより、`history_temperatures` 配列の要素数が 10 未満であるすべてのエンティティが返されます。

## ARRAY_APPEND\{#arrayappend}

`ARRAY_APPEND` 演算子は、`upsert` リクエスト時に既存の ARRAY フィールドにペイロードの要素を追加します。これはフィルタ式ではありません。現在の配列値を事前に取得することなく、配列に値を追加したい場合に使用します。

次の例では、主キーが `1` のエンティティの `tags` ARRAY フィールドに `"premium"` を追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["premium"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;
import java.util.*;

JsonObject row = new JsonObject();
row.addProperty("pk", 1);
JsonArray tags = new JsonArray();
tags.add("premium");
row.add("tags", tags);

List<UpsertReq.FieldPartialUpdateOp> fieldOps = new ArrayList<>();
fieldOps.add(UpsertReq.FieldPartialUpdateOp.builder()
        .fieldName("tags")
        .opType(UpsertReq.FieldPartialUpdateOp.OpType.ARRAY_APPEND)
        .build());

UpsertReq upsertReq = UpsertReq.builder()
        .collectionName("users")
        .data(Collections.singletonList(row))
        .fieldOps(fieldOps)
        .build();

client.upsert(upsertReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("users").
    WithInt64Column("pk", []int64{1}).
    WithColumns(column.NewColumnVarCharArray("tags", [][]string{{"premium"}})).
    WithArrayAppend("tags"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let res = client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("users")
                    .row(json!({"pk": 1, "tags": ["premium"]}))
                    .build()?,
            )
            .add_field_op(
                FieldPartialUpdateOp::new()
                    .field_name("tags")
                    .op_type(FieldPartialUpdateOpType::ArrayAppend),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto upsertRequest = milvus::UpsertRequest()
                         .WithCollectionName("users")
                         .AddRowData({{"pk", 1}, {"tags", nlohmann::json::array({"premium"})}})
                         .AddFieldOp(milvus::FieldPartialUpdateOp("tags", milvus::FieldPartialUpdateOp::OpType::ARRAY_APPEND));

milvus::UpsertResponse upsertResponse;
client->Upsert(upsertRequest, upsertResponse);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.upsert({
    collection_name: "users",
    data: [{ pk: 1, tags: ["premium"] }],
    field_ops: [{ field_name: "tags", op: "ARRAY_APPEND" }]
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "users",
      "data": [{"pk": 1, "tags": ["premium"]}],
      "fieldOps": [{"fieldName": "tags", "op": "array_append"}]
  }'
```

</TabItem>
</Tabs>

`field_ops` を通じてフィールドに `ARRAY_APPEND` を指定すると、そのフィールドで部分更新セマンティクスが有効になります。ワークフロー全体、サポートされる要素型、制限事項については、[マージモードでの ARRAY フィールドのアップサート](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode) を参照してください。

## ARRAY_REMOVE\{#arrayremove}

`ARRAY_REMOVE` 演算子は、`upsert` リクエスト時に、リクエストペイロード内の値に一致するすべての要素を既存の ARRAY フィールドから削除します。これはフィルタ式ではありません。現在の配列値を事前に取得することなく、配列から一致する値を削除したい場合に使用します。

次の例では、主キーが `1` のエンティティの `tags` ARRAY フィールドから `"trial"` を削除します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["trial"]}],
    field_ops={"tags": FieldOp.array_remove()},
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;
import java.util.*;

JsonObject row = new JsonObject();
row.addProperty("pk", 1);
JsonArray tags = new JsonArray();
tags.add("trial");
row.add("tags", tags);

List<UpsertReq.FieldPartialUpdateOp> fieldOps = new ArrayList<>();
fieldOps.add(UpsertReq.FieldPartialUpdateOp.builder()
        .fieldName("tags")
        .opType(UpsertReq.FieldPartialUpdateOp.OpType.ARRAY_REMOVE)
        .build());

UpsertReq upsertReq = UpsertReq.builder()
        .collectionName("users")
        .data(Collections.singletonList(row))
        .fieldOps(fieldOps)
        .build();

client.upsert(upsertReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("users").
    WithInt64Column("pk", []int64{1}).
    WithColumns(column.NewColumnVarCharArray("tags", [][]string{{"trial"}})).
    WithArrayRemove("tags"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let res = client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("users")
                    .row(json!({"pk": 1, "tags": ["trial"]}))
                    .build()?,
            )
            .add_field_op(
                FieldPartialUpdateOp::new()
                    .field_name("tags")
                    .op_type(FieldPartialUpdateOpType::ArrayRemove),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto upsertRequest = milvus::UpsertRequest()
                         .WithCollectionName("users")
                         .AddRowData({{"pk", 1}, {"tags", nlohmann::json::array({"trial"})}})
                         .AddFieldOp(milvus::FieldPartialUpdateOp("tags", milvus::FieldPartialUpdateOp::OpType::ARRAY_REMOVE));

milvus::UpsertResponse upsertResponse;
client->Upsert(upsertRequest, upsertResponse);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.upsert({
    collection_name: "users",
    data: [{ pk: 1, tags: ["trial"] }],
    field_ops: [{ field_name: "tags", op: "ARRAY_REMOVE" }]
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "users",
      "data": [{"pk": 1, "tags": ["trial"]}],
      "fieldOps": [{"fieldName": "tags", "op": "array_remove"}]
  }'
```

</TabItem>
</Tabs>

`field_ops` を通じてフィールドに `ARRAY_REMOVE` を指定すると、そのフィールドで部分更新セマンティクスが有効になります。ワークフロー全体、サポートされる要素型、制限事項については、[マージモードでの ARRAY フィールドのアップサート](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode) を参照してください。
