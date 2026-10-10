---
title: "ARRAY 演算子 | Cloud"
slug: /array-filtering-operators
sidebar_label: "ARRAY"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ARRAY フィールドのフィルタリングと ARRAY フィールド値の部分更新のための ARRAY 演算子を提供します。 | Cloud"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ARRAY 演算子

Zilliz Cloud は、ARRAY フィールドのフィルタリングと ARRAY フィールド値の部分更新のための ARRAY 演算子を提供します。

注記：配列内のすべての要素は同じ型である必要があり、配列内のネスト構造はプレーン文字列として扱われます。したがって、ARRAY フィールドを扱う場合は、過度に深いネストを避け、最適なパフォーマンスを得るためにデータ構造を可能な限りフラットに保つことをお勧めします。

Zilliz Cloud の ARRAY 演算子は、次の 2 つの使用シナリオを対象としています。

- クエリおよび検索用のフィルター式。

- `upsert` リクエストでの部分更新。

## 使用可能な ARRAY 演算子\{#available-array-operators}

次の表に、Zilliz Cloud で使用可能な ARRAY 演算子を示します。

| **演算子** | **使用場所** | **説明** |
| --- | --- | --- |
| [ARRAY_CONTAINS(identifier, expr)](./array-filtering-operators#arraycontains) | フィルター式 | 特定の要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ALL(identifier, expr)](./array-filtering-operators#arraycontainsall) | フィルター式 | 指定されたリスト内のすべての要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ANY(identifier, expr)](./array-filtering-operators#arraycontainsany) | フィルター式 | 指定されたリスト内のいずれかの要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_LENGTH(identifier)](./array-filtering-operators#arraylength) | フィルター式 | ARRAY フィールド内の要素数を返します。フィルタリングのために比較演算子と組み合わせることができます。 |
| [ARRAY_APPEND](./array-filtering-operators#arrayappend) | `field_ops` を使用した `upsert` | 既存の ARRAY フィールドにペイロード要素を追加します。 |
| [ARRAY_REMOVE](./array-filtering-operators#arrayremove) | `field_ops` を使用した `upsert` | リクエストペイロード内の値に一致するすべての要素を、既存の ARRAY フィールドから削除します。 |

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS` 演算子は、特定の要素が配列フィールドに存在するかどうかを確認します。これは、指定された要素が配列内に存在するエンティティを検索する場合に便利です。

**例**

ここで、さまざまな年の記録された最低気温を含む配列フィールド `history_temperatures` があるとします。配列に値 `23` が含まれるすべてのエンティティを検索するには、次のフィルター式を使用できます。

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

これは、`history_temperatures` 配列に値 `23` が含まれるすべてのエンティティを返します。

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

`ARRAY_CONTAINS_ALL` 演算子は、指定されたリストのすべての要素が配列フィールドに存在することを保証します。この演算子は、配列内に複数の値を含むエンティティを照合する場合に便利です。

**例**

`history_temperatures` 配列に `23` と `24` の両方が含まれるすべてのエンティティを検索する場合は、次のようにします。

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

これは、`history_temperatures` 配列に指定された値の両方が含まれるすべてのエンティティを返します。

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

`ARRAY_CONTAINS_ANY` 演算子は、指定されたリストのいずれかの要素が配列フィールドに存在するかどうかを確認します。これは、配列内に指定された値の少なくとも 1 つを含むエンティティを照合する場合に便利です。

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

これは、`history_temperatures` 配列に値 `23` または `24` の少なくとも 1 つが含まれるすべてのエンティティを返します。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH` は、配列フィールドの長さ（要素数）を返します。受け取るパラメーターは 1 つだけで、配列フィールドの識別子です。

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

これは、`history_temperatures` 配列の要素数が 10 未満であるすべてのエンティティを返します。

## ARRAY_APPEND\{#arrayappend}

`ARRAY_APPEND` 演算子は、`upsert` リクエスト中に既存の ARRAY フィールドにペイロード要素を追加します。これはフィルター式ではありません。現在の配列値を先にクエリすることなく配列に値を追加したい場合に使用します。

次の例では、主キーが `1` であるエンティティの `tags` ARRAY フィールドに `"premium"` を追加します。

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

`field_ops` を通じてフィールドに `ARRAY_APPEND` を付加すると、そのフィールドの部分更新セマンティクスが有効になります。ワークフロー全体、サポートされている要素型、および制限については、[Upsert ARRAY fields in merge mode](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode) を参照してください。

## ARRAY_REMOVE\{#arrayremove}

`ARRAY_REMOVE` 演算子は、`upsert` リクエスト中に、リクエストペイロード内の値に一致するすべての要素を既存の ARRAY フィールドから削除します。これはフィルター式ではありません。現在の配列値を先にクエリすることなく、一致する値を配列から削除したい場合に使用します。

次の例では、主キーが `1` であるエンティティの `tags` ARRAY フィールドから `"trial"` を削除します。

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

`field_ops` を通じてフィールドに `ARRAY_REMOVE` を付加すると、そのフィールドの部分更新セマンティクスが有効になります。ワークフロー全体、サポートされている要素型、および制限については、[Upsert ARRAY fields in merge mode](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode) を参照してください。
