---
title: "NGRAM | Cloud"
slug: /ngram-index-type
sidebar_label: "NGRAM"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリと対象となる正規表現フィルターを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを固定長 n の短く重複する部分文字列（n-gram と呼ばれます）に分割します。たとえば n = 3 の場合、単語 \"Milvus\" は 3-gram の \"Mil\"、\"ilv\"、\"lvu\"、\"vus\" に分割されます。これらの n-gram は、各グラムをそれが出現するドキュメント ID にマッピングする転置インデックスに格納されます。クエリ時には、このインデックスにより、Zilliz Cloud は元のフィルター条件を検証する前に検索対象を少数の候補にすばやく絞り込むことができます。 | Cloud"
type: origin
token: Q0wpw4xZiimaUsk4GvScAg2un1d
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# NGRAM

Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリと対象となる正規表現フィルターを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを固定長 *n* の短く重複する部分文字列（*n-gram* と呼ばれます）に分割します。たとえば *n = 3* の場合、単語 *"Milvus"* は 3-gram の *"Mil"*、*"ilv"*、*"lvu"*、*"vus"* に分割されます。これらの n-gram は、各グラムをそれが出現するドキュメント ID にマッピングする転置インデックスに格納されます。クエリ時には、このインデックスにより、Zilliz Cloud は元のフィルター条件を検証する前に検索対象を少数の候補にすばやく絞り込むことができます。

高速なプレフィックス一致、サフィックス一致、中置一致、ワイルドカード一致、または対象となる正規表現フィルタリングが必要な場合は、次のとおりです。

- `name LIKE "data%"`

- `title LIKE "%vector%"`

- `path LIKE "%json"`

- `message =~ "error.*timeout"`

- `url =~ "/api/v[0-9]+/users"`

<Admonition type="info" title="Notes">

`LIKE` および正規表現フィルター式の構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

</Admonition>

## 仕組み\{#how-it-works}

<details>

<summary>NGRAM の仕組みを表示するには展開してください</summary>

Zilliz Cloud は `NGRAM` インデックスを 2 フェーズのプロセスで実装しています。

1. **インデックスを構築する**: 各ドキュメントの n-gram を生成し、取り込み時に転置インデックスを構築します。

1. **クエリを高速化する**: インデックスを使用して候補を少数のセットに絞り込み、完全一致を検証します。

### フェーズ 1: インデックスを構築する\{#phase-1-build-the-index}

データの取り込み中に、Zilliz Cloud は次の 2 つの主要なステップを実行して NGRAM インデックスを構築します。

1. **テキストを n-gram に分解する**: Zilliz Cloud は、対象フィールド内の各文字列にわたって幅 *n* のウィンドウをスライドさせ、重複する部分文字列（*n-gram*）を抽出します。これらの部分文字列の長さは、構成可能な範囲 `[min_gram, max_gram]` に収まります。

    - `min_gram`: 生成する最短の n-gram。これは、インデックスの恩恵を受けられる最小のクエリ部分文字列長も定義します。

    - `max_gram`: 生成する最長の n-gram。クエリ時には、長いクエリ文字列を分割する際の最大ウィンドウサイズとしても使用されます。

        たとえば、`min_gram=2` と `max_gram=3` の場合、文字列 `"AI database"` は次のように分解されます。

        ![W35aw6aMph7nSobJeFlcXVH8neb](https://zdoc-images.s3.us-west-2.amazonaws.com/W35aw6aMph7nSobJeFlcXVH8neb.png)

        - **2-grams:** `AI`, `I_`, `_d`, `da`, `at`, ...

        - **3-grams:** `AI_`, `I_d`, `_da`, `dat`, `ata`, ...

        <Admonition type="info" title="Notes">

        - 範囲 `[min_gram, max_gram]` について、Zilliz Cloud は 2 つの値の間（両端を含む）のすべての長さの n-gram を生成します。たとえば、`[2,4]` と単語 `"text"` の場合、Zilliz Cloud は次を生成します。
        
        - **2-grams:** `te`, `ex`, `xt`
        
        - **3-grams:** `tex`, `ext`
        
        - **4-grams:** `text`
        
        - n-gram の分解は文字ベースで言語に依存しません。たとえば中国語では、`"向量数据库"` を `min_gram = 2` で分解すると、`"向量"`、`"量数"`、`"数据"`、`"据库"` になります。
        
        - 分解時には、空白と句読点も文字として扱われます。
        
        - 分解では元の大文字と小文字が保持され、照合では大文字と小文字が区別されます。たとえば、`"Database"` と `"database"` は異なる n-gram を生成し、クエリ時には大文字と小文字を正確に一致させる必要があります。

        </Admonition>

1. **転置インデックスを構築する**: 生成された各 n-gram を、それを含むドキュメント ID のリストにマッピングする**転置インデックス**が作成されます。

    たとえば、2-gram `"AI"` が ID 1、5、6、8、9 のドキュメントに出現する場合、インデックスには `{"AI": [1, 5, 6, 8, 9]}` と記録されます。このインデックスはクエリ時に、検索範囲をすばやく絞り込むために使用されます。

    ![MJ1OwnzmthWaPYbt7YncrlUznPo](https://zdoc-images.s3.us-west-2.amazonaws.com/MJ1OwnzmthWaPYbt7YncrlUznPo.png)

### フェーズ 2: クエリを高速化する\{#phase-2-accelerate-queries}

`LIKE` フィルターまたは対象となる正規表現フィルターが実行されると、Zilliz Cloud は NGRAM インデックスを使用して、次のステップでクエリを高速化します。

![C7Iawzee9hrag7b0LCecWHSunsc](https://zdoc-images.s3.us-west-2.amazonaws.com/C7Iawzee9hrag7b0LCecWHSunsc.png)

1. **クエリ用語を抽出する:** ワイルドカードを含まない連続した部分文字列が `LIKE` 式から抽出されます（例: `"%database%"` は `"database"` になります）。正規表現フィルターの場合は、可能であれば Zilliz Cloud が正規表現パターンから固定リテラルの部分文字列を抽出します。たとえば、`message =~ "error.*timeout"` には `error` と `timeout` というリテラルが含まれています。

1. **クエリ用語を分解する:** クエリ用語は、その長さ（`L`）と `min_gram`、`max_gram` の設定に基づいて *n-gram* に分解されます。

    - `L < min_gram` の場合、インデックスを使用できず、クエリはフルスキャンにフォールバックします。

    - `min_gram ≤ L ≤ max_gram` の場合、クエリ用語全体が単一の n-gram として扱われ、それ以上の分解は不要です。

    - `L > max_gram` の場合、クエリ用語は `max_gram` に等しいウィンドウサイズを使用して重複する gram に分解されます。

    たとえば、`max_gram` が `3` に設定され、クエリ用語が `"database"`（長さ **8**）の場合、`"dat"`、`"ata"`、`"tab"` などの 3-gram の部分文字列に分解されます。

1. **各 gram を検索して積集合を求める**: Zilliz Cloud は、クエリの各 gram を転置インデックスで検索し、得られたドキュメント ID リストの積集合を求めて少数の候補ドキュメントを特定します。これらの候補には、クエリのすべての gram が含まれています。

1. **検証して結果を返す:** 最後のチェックとして、元の `LIKE` または正規表現フィルターがこの少数の候補セットにのみ適用され、完全一致が特定されます。

</details>

## NGRAM インデックスを作成する\{#create-an-ngram-index}

`VARCHAR` フィールド、または `JSON` フィールド内の特定のパスに NGRAM インデックスを作成できます。

### 例 1: VARCHAR フィールドに作成する\{#example-1-create-on-a-varchar-field}

`VARCHAR` フィールドの場合は、`field_name` を指定し、`min_gram` と `max_gram` を構成するだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address

# Assume you have defined a VARCHAR field named "text" in your collection schema

# Prepare index parameters
index_params = client.prepare_index_params()

# Add NGRAM index on the "text" field
# highlight-start
index_params.add_index(
    field_name="text",   # Target VARCHAR field
    index_type="NGRAM",           # Index type is NGRAM
    index_name="ngram_index",     # Custom name for the index
    min_gram=2,                   # Minimum substring length (e.g., 2-gram: "st")
    max_gram=3                    # Maximum substring length (e.g., 3-gram: "sta")
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

Map<String, Object> params = new HashMap<>();
params.put("min_gram", "2");
params.put("max_gram", "3");

client.createIndex(CreateIndexReq.builder()
        .collectionName("Documents")
        .indexParams(Arrays.asList(
                IndexParam.builder().fieldName("text").indexType(IndexParam.IndexType.NGRAM)
                        .indexName("ngram_index")
                        .extraParams(params)
                        .build()))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err)
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("Documents", "text", index.NewNgramIndex(2, 3)).WithIndexName("ngram_index"))
if err != nil {
    fmt.Println(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let request = CreateIndexRequest::builder()
        .collection_name("Documents")
        .index_params(vec![IndexParam::new()
            .field_name("text")
            .index_name("ngram_index")
            .index_type(IndexType::Ngram)
            .extra_params(HashMap::from([
                ("min_gram".to_string(), "2".to_string()),
                ("max_gram".to_string(), "3".to_string()),
            ]))])
        .build()?;
    client.create_index(request).await?;

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc ngram_index("text", "ngram_index", milvus::IndexType::NGRAM);
ngram_index.AddExtraParam("min_gram", "2");
ngram_index.AddExtraParam("max_gram", "3");

milvus::CreateIndexRequest create_request;
create_request.WithCollectionName("Documents");
create_request.WithIndexes({ngram_index});
create_request.WithSync(true);

status = client->CreateIndex(create_request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.createIndex({
    collection_name: "Documents",
    field_name: "text",
    index_name: "ngram_index",
    index_type: "NGRAM",
    params: { min_gram: 2, max_gram: 3 },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "Documents",
    "indexParams": [
        {
            "fieldName": "text",
            "indexName": "ngram_index",
            "params": {
                "index_type": "NGRAM",
                "min_gram": 2,
                "max_gram": 3
            }
        }
    ]
}'
```

</TabItem>
</Tabs>

この構成では、`text` 内の各文字列に対して 2-gram と 3-gram を生成し、それらを転置インデックスに格納します。

### 例 2: JSON パスに作成する\{#example-2-create-on-a-json-path}

`JSON` フィールドの場合は、gram の設定に加えて、次の項目も指定する必要があります。

- `params.json_path` – インデックスを作成する値への JSON パス。

- `params.json_cast_type` – NGRAM インデックスは文字列に対して動作するため、`"varchar"`（大文字と小文字を区別しない）である必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Assume you have defined a JSON field named "json_field" in your collection schema, with a JSON path named "body"

# Prepare index parameters
index_params = client.prepare_index_params()

# Add NGRAM index on a JSON field
# highlight-start
index_params.add_index(
    field_name="json_field",              # Target JSON field
    index_type="NGRAM",                   # Index type is NGRAM
    index_name="json_ngram_index",        # Custom index name
    min_gram=2,                           # Minimum n-gram length
    max_gram=4,                           # Maximum n-gram length
    params={
        "json_path": "json_field[\"body\"]",  # Path to the value inside the JSON field
        "json_cast_type": "varchar"                  # Required: cast the value to varchar
    }
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="Documents",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> params = new HashMap<>();
params.put("min_gram", "2");
params.put("max_gram", "4");
params.put("json_path", "json_field[\"body\"]");
params.put("json_cast_type", "varchar");

client.createIndex(CreateIndexReq.builder()
        .collectionName("Documents")
        .indexParams(Arrays.asList(
                IndexParam.builder().fieldName("json_field").indexType(IndexParam.IndexType.NGRAM)
                        .indexName("json_ngram_index")
                        .extraParams(params)
                        .build()))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
opt := milvusclient.NewCreateIndexOption("Documents", "json_field", index.NewNgramIndex(2, 4)).
    WithIndexName("json_ngram_index")
opt.WithExtraParam("json_path", `json_field["body"]`)
opt.WithExtraParam("json_cast_type", "varchar")

_, err = cli.CreateIndex(ctx, opt)
if err != nil {
    fmt.Println(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
    let request = CreateIndexRequest::builder()
        .collection_name("Documents")
        .index_params(vec![IndexParam::new()
            .field_name("json_field")
            .index_name("json_ngram_index")
            .index_type(IndexType::Ngram)
            .extra_params(HashMap::from([
                ("min_gram".to_string(), "2".to_string()),
                ("max_gram".to_string(), "4".to_string()),
                ("json_path".to_string(), "json_field[\"body\"]".to_string()),
                ("json_cast_type".to_string(), "varchar".to_string()),
            ]))])
        .build()?;
    client.create_index(request).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc json_ngram_index("json_field", "json_ngram_index", milvus::IndexType::NGRAM);
json_ngram_index.AddExtraParam("min_gram", "2");
json_ngram_index.AddExtraParam("max_gram", "4");
json_ngram_index.AddExtraParam("json_path", "json_field[\"body\"]");
json_ngram_index.AddExtraParam("json_cast_type", "varchar");

milvus::CreateIndexRequest create_request;
create_request.WithCollectionName("Documents");
create_request.WithIndexes({json_ngram_index});
create_request.WithSync(true);

status = client->CreateIndex(create_request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
    collection_name: "Documents",
    field_name: "json_field",
    index_name: "json_ngram_index",
    index_type: "NGRAM",
    params: { min_gram: 2, max_gram: 4, json_path: 'json_field["body"]', json_cast_type: "varchar" },
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "Documents",
    "indexParams": [
        {
            "fieldName": "json_field",
            "indexName": "json_ngram_index",
            "params": {
                "index_type": "NGRAM",
                "min_gram": 2,
                "max_gram": 4,
                "json_path": "json_field[\"body\"]",
                "json_cast_type": "varchar"
            }
        }
    ]
}'
```

</TabItem>
</Tabs>

この例では次のとおりです。

- `json_field["body"]` の値のみがインデックス化されます。

- n-gram のトークン化の前に、値は `VARCHAR` にキャストされます。

- Zilliz Cloud は長さ 2 から 4 の部分文字列を生成し、それらを転置インデックスに格納します。

JSON フィールドにインデックスを作成する方法の詳細については、[JSON Indexing](./json-indexing) を参照してください。

## NGRAM で高速化されるクエリ\{#queries-accelerated-by-ngram}

NGRAM インデックスが適用されるには、次の条件を満たす必要があります。

- クエリは、`NGRAM` インデックスを持つ `VARCHAR` フィールド（または JSON パス）を対象としている必要があります。

- `LIKE` パターンのリテラル部分は、少なくとも `min_gram` 文字の長さである必要があります。

    *（例: 想定される最短のクエリ用語が 2 文字の場合は、インデックス作成時に min_gram=2 を設定します。）*

サポートされるクエリタイプは次のとおりです。

- **プレフィックス一致**

    ```python
    # Match any string that starts with the substring "database" 
    filter = 'text LIKE "database%"'
    ```

- **サフィックス一致**

    ```python
    # Match any string that ends with the substring "database" 
    filter = 'text LIKE "%database"'
    ```

- **中置一致**

    ```python
    # Match any string that contains the substring "database" anywhere 
    filter = 'text LIKE "%database%"'
    ```

- **ワイルドカード一致**

    ```python
    # Match any string where "st" appears first, and "um" appears later in the text 
    filter = 'text LIKE "%st%um%"'
    ```

- **JSON パスクエリ**

    ```python
    filter = 'json_field["body"] LIKE "%database%"'
    ```

- **正規表現フィルター**

    ```python
    # Match log messages that contain "error" followed later by "timeout" 
    filter = 'text =~ "error.*timeout"'
    ```

- **JSON パスに対する正規表現フィルター**

    ```python
    filter = 'json_field["body"] =~ "error.*timeout"'
    ```

フィルター式の構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

## インデックスを削除する\{#drop-an-index}

既存のインデックスをコレクションから削除するには、`drop_index()` メソッドを使用します。

<Admonition type="info" title="Notes">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になったスカラーインデックスを直接削除できます。先にコレクションを解放する必要はありません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_index(
    collection_name="Documents",   # Name of the collection
    index_name="ngram_index" # Name of the index to drop
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.DropIndexReq;

client.dropIndex(DropIndexReq.builder()
        .collectionName("Documents")
        .indexName("ngram_index")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("Documents", "ngram_index"))
if err != nil {
    fmt.Println(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
    let request = DropIndexRequest::builder()
        .collection_name("Documents")
        .index_name("ngram_index")
        .build()?;
    client.drop_index(request).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->DropIndex(milvus::DropIndexRequest()
                               .WithCollectionName("Documents")
                               .WithIndexName("ngram_index"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropIndex({ collection_name: "Documents", index_name: "ngram_index" });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "Documents",
    "indexName": "ngram_index"
}'
```

</TabItem>
</Tabs>

## 使用上の注意\{#usage-notes}

- **フィールドタイプ**: `VARCHAR` フィールドと `JSON` フィールドでサポートされます。JSON の場合は、`params.json_path` と `params.json_cast_type="varchar"` の両方を指定します。

- **正規表現の高速化**: `NGRAM` は、Zilliz Cloud が正規表現パターンから固定リテラルの部分文字列を抽出できる場合にのみ、正規表現フィルターを高速化します。`[a-z]+` のようなパターンは固定リテラルを含まないため、スキャンにフォールバックすることがあります。

- **大文字と小文字を区別しない正規表現**: `(?i)` を含む正規表現パターンはサポートされていますが、インデックスは元の大文字と小文字を保持するため、`NGRAM` の最適化が行われないことがあります。

- **検証ステップ**: 正規表現フィルターの場合、`NGRAM` が候補を生成し、Zilliz Cloud が完全な RE2 正規表現パターンでそれらを検証するため、インデックスの高速化によって一致結果が変わることはありません。

- **Unicode**: NGRAM の分解は文字ベースで言語に依存せず、空白と句読点も含まれます。

- **空間と時間のトレードオフ**: gram の範囲 `[min_gram, max_gram]` を広げると、生成される gram が増え、インデックスが大きくなります。メモリが不足している場合は、大きなポスティングリストに対して `mmap` モードの使用を検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

- **不変性**: `min_gram` と `max_gram` はその場で変更できません。調整するにはインデックスを再構築してください。

## ベストプラクティス\{#best-practices}

- **検索動作に合わせて `min_gram` と `max_gram` を選択する**

    - まず `min_gram=2`、`max_gram=3` から始めます。

    - `min_gram` には、ユーザーが入力すると想定される最短のリテラルを設定します。

    - `max_gram` には、意味のある部分文字列の一般的な長さに近い値を設定します。`max_gram` を大きくするとフィルタリング性能は向上しますが、使用する容量が増えます。

- **選択性の低い gram を避ける**

    繰り返しの多いパターン（例: `"aaaaaa"`）はフィルタリング効果が弱く、得られる効果は限定的な場合があります。

- **一貫した正規化を行う**

    ユースケースで必要な場合は、取り込むテキストとクエリのリテラルに同じ正規化（例: 小文字化、トリミング）を適用してください。

