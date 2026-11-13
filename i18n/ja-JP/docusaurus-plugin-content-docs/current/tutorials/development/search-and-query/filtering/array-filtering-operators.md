---
title: "ARRAY 演算子 | Cloud"
slug: /array-filtering-operators
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ARRAY フィールドのフィルタリングと ARRAY フィールド値の部分更新に使用する ARRAY 演算子を提供します。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-array-filtering-operators
sidebar_label: "配列"
sidebar_position: 6
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/boolean/array-operators.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ARRAY 演算子

Zilliz Cloud は、ARRAY フィールドのフィルタリングと ARRAY フィールド値の部分更新に使用する ARRAY 演算子を提供します。

<Admonition type="info" icon="📘" title="Notes">

配列内のすべての要素は同じ型である必要があり、配列内のネストされた構造はプレーン文字列として扱われます。したがって、ARRAY フィールドを扱う際は、過度に深いネストを避け、最適なパフォーマンスを得るためにデータ構造をできるだけフラットにすることをお勧めします。

</Admonition>

Zilliz Cloud の ARRAY 演算子は、次の 2 つの使用シナリオに対応しています：

- クエリおよび検索用のフィルター式。

- `upsert` リクエストでの部分更新。

## 利用可能な ARRAY 演算子\{#available-array-operators}

次の表に、Zilliz Cloud で利用可能な ARRAY 演算子を示します。

| 演算子 | 使用場所 | 説明 |
| --- | --- | --- |
| [ARRAY_CONTAINS(identifier, expr)](#arraycontains) | フィルター式 | ARRAY フィールドに特定の要素が存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ALL(identifier, expr)](#arraycontainsall) | フィルター式 | 指定したリストのすべての要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_CONTAINS_ANY(identifier, expr)](#arraycontainsany) | フィルター式 | 指定したリスト内のいずれかの要素が ARRAY フィールドに存在するかどうかを確認します。 |
| [ARRAY_LENGTH(identifier)](#arraylength) | フィルター式 | ARRAY フィールド内の要素数を返します。フィルタリング時に比較演算子と組み合わせることができます。 |
| [ARRAY_APPEND](#arrayappend) | `field_ops` を使用した `upsert` | 既存の ARRAY フィールドにペイロードの要素を追加します。Milvus v2.6.17 以降で利用できます。 |
| [ARRAY_REMOVE](#arrayremove) | `field_ops` を使用した `upsert` | リクエストペイロード内の値に一致するすべての要素を、既存の ARRAY フィールドから削除します。Milvus v2.6.17 以降で利用できます。 |

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS` 演算子は、配列フィールドに特定の要素が存在するかどうかを確認します。配列内に特定の要素が存在するエンティティを検索する場合に便利です。

**例**

`history_temperatures` という配列フィールドがあり、さまざまな年の記録された最低気温が格納されているとします。配列に値 `23` が含まれるすべてのエンティティを検索するには、次のフィルター式を使用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
std::string filter = "ARRAY_CONTAINS(history_temperatures, 23)";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS(history_temperatures, 23)';
```

</TabItem>

<TabItem value='csharp'>

```csharp
// ARRAY_CONTAINS filter
var filter = "ARRAY_CONTAINS(history_temperatures, 23)";
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

`ARRAY_CONTAINS_ALL` 演算子は、指定したリストのすべての要素が配列フィールドに存在することを確認します。配列内に複数の値が含まれるエンティティを一致させたい場合に便利です。

**例**

`history_temperatures` 配列に `23` と `24` の両方が含まれるすべてのエンティティを検索するには、次のようにします：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
std::string filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])';
```

</TabItem>

<TabItem value='csharp'>

```csharp
// ARRAY_CONTAINS_ALL filter
var filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
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

`ARRAY_CONTAINS_ANY` 演算子は、指定したリスト内のいずれかの要素が配列フィールドに存在するかどうかを確認します。配列内に指定した値の少なくとも 1 つが含まれるエンティティを一致させたい場合に便利です。

**例**

`history_temperatures` 配列に `23` または `24` のいずれかが含まれるすべてのエンティティを検索するには、次のようにします：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
std::string filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])';
```

</TabItem>

<TabItem value='csharp'>

```csharp
// ARRAY_CONTAINS_ANY filter
var filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

</TabItem>

</Tabs>

これにより、`history_temperatures` 配列に `23` または `24` の値のうち少なくとも 1 つが含まれるすべてのエンティティが返されます。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH` は、配列フィールドの長さ（要素数）を返します。パラメーターは 1 つだけ受け取り、配列フィールドの識別子を指定します。

**例**

`history_temperatures` 配列の要素数が 10 未満のすべてのエンティティを検索するには、次のようにします：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
std::string filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_LENGTH(history_temperatures) < 10';
```

</TabItem>

<TabItem value='csharp'>

```csharp
// ARRAY_LENGTH filter
var filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_LENGTH(history_temperatures) < 10'
```

</TabItem>

</Tabs>

これにより、`history_temperatures` 配列の要素数が 10 未満のすべてのエンティティが返されます。

## ARRAY_APPEND\{#arrayappend}

`ARRAY_APPEND` 演算子は、`upsert` リクエスト中に既存の ARRAY フィールドへペイロードの要素を追加します。これはフィルター式ではありません。現在の配列値を先にクエリせずに配列へ値を追加する場合に使用します。

次の例では、主キーが `1` のエンティティの `tags` ARRAY フィールドに `"premium"` を追加します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Types;

await client.UpsertAsync(new UpsertReq
{
    CollectionName = "users",
    RowsData = new[]
    {
        new Dictionary<string, object?>
        {
            ["pk"] = 1L,
            ["tags"] = new[] { "premium" }
        }
    },
    FieldOps = new[]
    {
        new FieldPartialUpdateOp("tags", FieldPartialUpdateOpType.ArrayAppend)
    }
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

`field_ops` を通じてフィールドに `ARRAY_APPEND` を指定すると、そのフィールドで部分更新セマンティクスが有効になります。ワークフロー全体、サポートされる要素型、制限事項については、[エンティティのアップサート](./upsert-entities) を参照してください。

## ARRAY_REMOVE\{#arrayremove}

`ARRAY_REMOVE` 演算子は、`upsert` リクエスト中に、リクエストペイロード内の値に一致するすべての要素を既存の ARRAY フィールドから削除します。これはフィルター式ではありません。現在の配列値を先にクエリせずに、一致する値を配列から削除する場合に使用します。

次の例では、主キーが `1` のエンティティの `tags` ARRAY フィールドから `"trial"` を削除します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Types;

await client.UpsertAsync(new UpsertReq
{
    CollectionName = "users",
    RowsData = new[]
    {
        new Dictionary<string, object?>
        {
            ["pk"] = 1L,
            ["tags"] = new[] { "trial" }
        }
    },
    FieldOps = new[]
    {
        new FieldPartialUpdateOp("tags", FieldPartialUpdateOpType.ArrayRemove)
    }
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

`field_ops` を通じてフィールドに `ARRAY_REMOVE` を指定すると、そのフィールドで部分更新セマンティクスが有効になります。ワークフロー全体、サポートされる要素型、制限事項については、[エンティティのアップサート](./upsert-entities) を参照してください。
