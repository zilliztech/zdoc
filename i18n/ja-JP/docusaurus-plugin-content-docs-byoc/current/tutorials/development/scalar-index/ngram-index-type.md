---
title: "NGRAM | BYOC"
slug: /ngram-index-type
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "NGRAM インデックスは、VARCHAR フィールドまたは JSON フィールド内の特定の JSON パスに対する LIKE クエリと対象となる正規表現フィルターを高速化します。インデックスを構築する前に、テキストは固定長 n の短く重複する部分文字列（n-gram）に分割されます。クエリ時には、これらの n-gram によって、元のフィルター条件が検証される前に候補エンティティが絞り込まれます。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-ngram-index-type
sidebar_label: "NGRAM"
sidebar_position: 4
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/indexes/scalar/ngram.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# NGRAM

<NextChannel action="exclude">

Zilliz Cloud の `NGRAM` インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定の JSON パスに対する `LIKE` クエリと対象となる正規表現フィルターを高速化します。インデックスを構築する前に、Zilliz Cloud はテキストを固定長 *n* の短く重複する部分文字列（*n-gram*）に分割します。たとえば、*n = 3* の場合、単語 *"Milvus"* は 3-gram の *"Mil"*、*"ilv"*、*"lvu"*、*"vus"* に分割されます。これらの n-gram は、各グラムをそれが出現するドキュメント ID にマッピングする転置インデックスに格納されます。クエリ時には、このインデックスにより、Zilliz Cloud は元のフィルター条件を検証する前に検索対象を少数の候補にすばやく絞り込むことができます。

高速な前方一致、後方一致、中間一致、ワイルドカード、または対象となる正規表現フィルタリングが必要な場合に使用します。たとえば、次のとおりです。

- `name LIKE "data%"`

- `title LIKE "%vector%"`

- `path LIKE "%json"`

- `message =~ "error.*timeout"`

- `url =~ "/api/v[0-9]+/users"`

<Admonition type="info" icon="📘" title="Notes">

`LIKE` および正規表現フィルター式の構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

</Admonition>

## 仕組み\{#how-it-works}

<details>

<summary>NGRAM の仕組みを表示するには展開してください</summary>

Zilliz Cloud は `NGRAM` インデックスを 2 段階のプロセスで実装します:

1. **インデックスを構築する**: 取り込み中に各ドキュメントの n-gram を生成し、転置インデックスを構築します。

1. **クエリを高速化する**: インデックスを使用して少数の候補セットに絞り込み、完全一致を検証します。

### フェーズ 1: インデックスを構築する\{#phase-1-build-the-index}

データの取り込み中、Zilliz Cloud は次の 2 つの主要なステップを実行して NGRAM インデックスを構築します:

1. **テキストを n-gram に分解する**: Zilliz Cloud は、対象フィールドの各文字列にわたって幅 *n* のウィンドウをスライドさせ、重複する部分文字列（*n-gram*）を抽出します。これらの部分文字列の長さは、設定可能な範囲 `[min_gram, max_gram]` 内に収まります。

    - `min_gram`: 生成する最短の n-gram です。これは、インデックスを活用できるクエリ部分文字列の最小長も定義します。

    - `max_gram`: 生成する最長の n-gram です。クエリ時には、長いクエリ文字列を分割する際の最大ウィンドウサイズとしても使用されます。

    たとえば、`min_gram=2` および `max_gram=3` の場合、文字列 `"AI database"` は次のように分割されます:

    ![NGRAM インデックスの構築](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/1233d6b8942d7f570e157fc900a95d2ef0aa7b0c37297920f13df407919ba546.png)

    - **2-gram:** `AI`, `I_`, `_d`, `da`, `at`, ...

    - **3-gram:** `AI_`, `I_d`, `_da`, `dat`, `ata`, ...

    <Admonition type="info" icon="📘" title="Notes">

    - 範囲 `[min_gram, max_gram]` に対して、Zilliz Cloud は 2 つの値の間（両端を含む）のすべての長さの n-gram を生成します。たとえば、`[2,4]` と単語 `"text"` の場合、Zilliz Cloud は次を生成します:

    - **2-gram:** `te`, `ex`, `xt`

    - **3-gram:** `tex`, `ext`

    - **4-gram:** `text`

    - N-gram の分解は文字ベースで言語に依存しません。たとえば、中国語では、`min_gram = 2` を指定した `"向量数据库"` は `"向量"`、`"量数"`、`"数据"`、`"据库"` に分解されます。

    - 分解時、スペースと句読点は文字として扱われます。

    - 分解では元の大文字と小文字が保持され、マッチングは大文字と小文字を区別します。たとえば、`"Database"` と `"database"` は異なる n-gram を生成し、クエリ時には大文字と小文字の完全一致が必要です。

    </Admonition>

1. **転置インデックスを構築する**: 生成された各 n-gram を、それを含むドキュメント ID のリストにマッピングする**転置インデックス**が作成されます。

    たとえば、2-gram の `"AI"` が ID 1、5、6、8、9 のドキュメントに出現する場合、インデックスには `{"AI": [1, 5, 6, 8, 9]}` が記録されます。このインデックスはクエリ時に検索範囲をすばやく絞り込むために使用されます。

    ![NGRAM インデックスの構築 2](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/7c8832f6f355e47375246d45eed5aeaf57742ee073fd37cf212140d3e3246f99.png)

    <Admonition type="info" icon="📘" title="Notes">

    範囲 `[min_gram, max_gram]` を広げると、生成されるグラムが増え、マッピングリストが大きくなります。メモリが厳しい場合は、非常に大きなポスティングリストに対して mmap モードの使用を検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

    </Admonition>

### フェーズ 2: クエリを高速化する\{#phase-2-accelerate-queries}

`LIKE` フィルターまたは対象となる正規表現フィルターが実行されると、Zilliz Cloud は次の手順で NGRAM インデックスを使用してクエリを高速化します:

![クエリの高速化](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/a0a7061a61ff0d6d451a94679ce9f75dedb8946288c90f4894fc88ed210a6418.png)

1. **クエリ語を抽出する:** `LIKE` 式からワイルドカードを含まない連続した部分文字列が抽出されます（たとえば、`"%database%"` は `"database"` になります）。正規表現フィルターの場合、Zilliz Cloud は可能なときに正規表現パターンから固定のリテラル部分文字列を抽出します。たとえば、`message =~ "error.*timeout"` にはリテラル `error` と `timeout` が含まれています。

1. **クエリ語を分解する:** クエリ語は、その長さ（`L`）と `min_gram` および `max_gram` の設定に基づいて *n-gram* に分解されます。

    - `L < min_gram` の場合、インデックスは使用できず、クエリはフルスキャンにフォールバックします。

    - `min_gram ≤ L ≤ max_gram` の場合、クエリ語全体が単一の n-gram として扱われ、それ以上の分解は不要です。

    - `L > max_gram` の場合、クエリ語は、`max_gram` に等しいウィンドウサイズを使用して、重複するグラムに分割されます。

    たとえば、`max_gram` が `3` に設定され、クエリ語が長さ **8** の `"database"` である場合、それは `"dat"`、`"ata"`、`"tab"` などの 3-gram 部分文字列に分解されます。

1. **各グラムを検索して交差させる**: Zilliz Cloud は、クエリの各グラムを転置インデックスで検索し、得られたドキュメント ID リストを交差させて、少数の候補ドキュメントを見つけます。これらの候補には、クエリのすべてのグラムが含まれています。

1. **結果を検証して返す:** 最後に、元の `LIKE` または正規表現フィルターが、完全一致を見つけるための最終チェックとして、少数の候補セットにのみ適用されます。

</details>

</NextChannel>

<NextChannel action="include">

`NGRAM` は、`VARCHAR` フィールドおよび JSON 文字列パスに対する LIKE と対象となる正規表現フィルターを高速化します。文字シーケンスを使用して一致するエンティティを絞り込みますが、一部のパターンでは元の値を確認する必要があります。

利用可能なリテラルテキストを含む前方一致、後方一致、部分文字列、ワイルドカード、または正規表現フィルターに使用します。たとえば、`title LIKE "%vector%"` や `message =~ "error.*timeout"` などです。構文については、[Pattern Matching](./pattern-match) を参照してください。

## 概要\{#overview}

### サポートされるデータ型\{#supported-data-types}

`VARCHAR` フィールドと、`VARCHAR` にキャストされた JSON パスです。JSON パスには `json_path` と `json_cast_type` が必要です。詳細は、[JSON Indexing](./json-indexing) を参照してください。

<a id="queries-accelerated-by-ngram"></a>
<a id="Queries-accelerated-by-NGRAM"></a>

<a id="supported-filters"></a>
<a id="Supported-filters"></a>

<a id="filter-expression-examples"></a>
<a id="Filter-expression-examples"></a>

### フィルターの高速化\{#filter-acceleration}

クエリは、インデックスが作成されたフィールドまたは JSON パスを対象とする必要があります。例では各パターンを示します。高速化は最後の列の条件によって異なります：

| パターン | 式の例 | 高速化の条件と動作 |
| --- | --- | --- |
| 前方一致または後方一致のリテラル | `text LIKE "database%"` または `text LIKE "%database"` | `min_gram` 文字以上である必要があります。候補を検索してから、元の値を確認します。 |
| 部分文字列のリテラル | `text LIKE "%database%"` | `min_gram` 文字以上である必要があります。`[min_gram, max_gram]` 内の完全一致を返します。より長いリテラルは再確認用の候補を生成します。 |
| 一般的な LIKE | `text LIKE "%st%um%"` | 空でない各リテラル断片が `min_gram` 文字以上である場合に候補を検索し、その後、元の値を確認します。 |
| 正規表現 | `text =~ "error.*timeout"` | 適切なリテラルを抽出できる場合に候補を検索し、その後、正規表現全体を確認します。 |

インデックスが作成された JSON 文字列パスの場合は、式でそのパスを使用します。たとえば、`json_field["body"] LIKE "%database%"` のように指定します。LIKE の例については [Pattern Matching](./pattern-match#common-like-patterns) を、正規表現の例については [正規表現の例](./pattern-match#common-regex-patterns) を参照してください。

適切なリテラルがない場合、Zilliz Cloud はデータをスキャンします。`NGRAM` はパターン検索を提供しますが、直接的な等価性、メンバーシップ、または範囲検索は提供しません。これらのルールは、[クエリプランニングの簡略化](./pattern-match#accelerate-pattern-matching-with-indexes) の後に適用されます。

<Admonition type="info" icon="📘" title="Notes">

> これらはインデックスの機能であり、有効なフィルター式の制限ではありません。共通のルックアップ制約については、[スカラー Index](./scalar-index-overview#Filter-execution) を参照してください。`AND`、`OR`、`NOT`、および NULL のテスト（`IS NULL`、`IS NOT NULL`）については、[Basic Operators](./basic-filtering-operators) を参照してください。

</Admonition>

<a id="usage-notes"></a>

### 使用上の注意\{#usage-notes-next}

N-gram の分解は文字ベースで言語に依存せず、空白と句読点も含みます。大文字と小文字を保持します。グラム範囲を広げると生成されるグラムが増え、インデックスが大きくなります。メモリが厳しい場合は、大きなポスティングリストに [mmap](./use-mmap) の使用を検討してください。

<Admonition type="info" icon="📘" title="Notes">

固定リテラルを含まない `[a-z]+` などの正規表現パターンは、スキャンにフォールバックする場合があります。`(?i)` を含む大文字と小文字を区別しないパターンも、`NGRAM` 最適化をスキップする場合があります。候補の検証では RE2 パターン全体を使用するため、正規表現の一致結果が保持されます。

</Admonition>

### メモリに関する考慮事項\{#memory-considerations}

読み込み済みメモリの概算には、`S` バイトを使用します。ここで `S` は、ストレージ圧縮前の構築済みインデックスサイズです。`S` は代表的なデータでインデックスを構築して取得してください。元のテキストサイズでは代用できません。グラム範囲とデータ分布は、構築後のサイズに影響します。

これらの概算は、メモリマッピングを無効にした状態で読み込まれたインデックスメモリを対象としています。セグメントごとに計算し、読み込み済みのセグメントとレプリカ全体で合計してください。

<Admonition type="info" icon="📘" title="Notes">

> 読み込み済みのフィールドデータ、ベクトルインデックス、コレクションとインデックスのオーバーヘッド、および一時的な割り当てには、追加のメモリを確保してください。代表的なデータとクエリで検証してください。配列、JSON、古いインデックス形式、およびメモリマッピングでは、個別に測定する必要があります。

</Admonition>

<a id="how-it-works"></a>
<a id="How-it-works"></a>

### NGRAM の仕組み\{#how-ngram-works}

<a id="phase-1-build-the-index"></a>
<a id="Phase-1-Build-the-index"></a>
<a id="phase-2-accelerate-queries"></a>
<a id="Phase-2-Accelerate-queries"></a>

<details>
<summary><strong>ビルドとクエリのプロセスを表示する</strong></summary>

n-gram は、重なり合う文字のシーケンスです。`n=3` の場合、`"Milvus"` は `"Mil"`、`"ilv"`、`"lvu"`、`"vus"` を生成します。

**フェーズ 1: インデックスを構築する**

各文字列について、`min_gram` から `max_gram` まで（両端を含む）のすべての長さのグラムを生成します。`min_gram=2` かつ `max_gram=3` の場合、`"AI database"` は `AI`、`I_`、`_d`、`da` などの 2-gram と、`AI_`、`I_d`、`_da`、`dat` などの 3-gram を生成します。ここで、`_` はスペースを表します：

![NGRAM インデックスの構築](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/1233d6b8942d7f570e157fc900a95d2ef0aa7b0c37297920f13df407919ba546.png)

各グラムを、それを含むエンティティ ID にマッピングします。たとえば、`"AI"` がエンティティ 1、5、6、8、9 に含まれる場合は、`{"AI": [1, 5, 6, 8, 9]}` を格納します：

![NGRAM インデックスの構築 2](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/7c8832f6f355e47375246d45eed5aeaf57742ee073fd37cf212140d3e3246f99.png)

**フェーズ 2: クエリを高速化する**

LIKE または対象となる正規表現パターンからリテラルテキストを抽出します。たとえば、`"%database%"` からは `database` が得られ、`"error.*timeout"` には `error` と `timeout` が含まれます。長さ `L` のリテラルの場合：

- `L < min_gram` の場合、リテラルはインデックスを使用できません。
- `min_gram ≤ L ≤ max_gram` の場合、リテラルを 1 つのグラムとして検索します。
- `L > max_gram` の場合、`max_gram` 文字の長さの重複するグラムに分割します。

グラムのエンティティリストを交差させて候補を検索し、再確認が必要な場合は元のフィルターを適用します。`[min_gram, max_gram]` 内の単純な部分文字列リテラルは、再確認なしで完全一致を返します：

![クエリの高速化](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/a0a7061a61ff0d6d451a94679ce9f75dedb8946288c90f4894fc88ed210a6418.png)

</details>

</NextChannel>

## NGRAM インデックスを作成する\{#create-an-ngram-index}

<NextChannel action="exclude">

NGRAM インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定のパスに作成できます。

</NextChannel>

<NextChannel action="include">

NGRAM インデックスは、`VARCHAR` フィールドまたは `JSON` フィールド内の特定のパスに作成できます。`min_gram` と `max_gram` はどちらも正の整数で指定し、`min_gram <= max_gram` を満たす必要があります。

パラメーターは、インデックス化される文字シーケンスを制御します。変更するにはインデックスを再構築します：

| パラメーター | 意味 |
| --- | --- |
| `min_gram` | 文字単位の最小シーケンス長です。インデックスを使用できるリテラルの最小長も設定します。 |
| `max_gram` | 文字単位の最大シーケンス長です。これより長いクエリリテラルは、この長さの重複するシーケンスに分割されます。 |

</NextChannel>

### 例 1: VARCHAR フィールドに作成する\{#example-1-create-on-a-varchar-field}

`VARCHAR` フィールドの場合は、`field_name` を指定し、`min_gram` と `max_gram` を設定するだけです。

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
```

</TabItem>

<TabItem value='c++'>

```cpp
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

この設定では、`text` 内の各文字列に対して 2-gram と 3-gram が生成され、転置インデックスに格納されます。

### 例 2: JSON パスに作成する\{#example-2-create-on-a-json-path}

<NextChannel action="exclude">

`JSON` フィールドの場合は、グラム設定に加えて、次も指定する必要があります:

- `params.json_path`：インデックスを作成する値への JSON パスです。

- `params.json_cast_type`：`"varchar"`（大文字と小文字を区別しない）である必要があります。NGRAM インデックスは文字列に対して動作するためです。

</NextChannel>

<NextChannel action="include">

JSON パスの場合は、`VARCHAR` へのキャスト（大文字と小文字を区別しない）と、以下のグラム設定を使用します。パスとキャストの要件については、[JSON Indexing](./json-indexing#index-requirements) を参照してください。

</NextChannel>

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
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

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
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
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

<NextChannel action="exclude">

この例では:

- `json_field["body"]` の値のみがインデックス化されます。

- 値は n-gram トークン化の前に `VARCHAR` にキャストされます。

- Zilliz Cloud は長さ 2 から 4 の部分文字列を生成し、それらを転置インデックスに格納します。

JSON フィールドのインデックス作成方法の詳細については、[JSON Indexing](./json-indexing) を参照してください。

## NGRAM で高速化されるクエリ\{#queries-accelerated-by-ngram}

NGRAM インデックスが適用されるには、次の条件を満たす必要があります:

- クエリは、`NGRAM` インデックスを持つ `VARCHAR` フィールド（または JSON パス）を対象とする必要があります。

- `LIKE` パターンのリテラル部分は、少なくとも `min_gram` 文字の長さである必要があります。

    *（たとえば、想定される最も短いクエリ語が 2 文字の場合は、インデックス作成時に min_gram=2 を設定します。）*

サポートされるクエリタイプ:

- **前方一致**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Match any string that starts with the substring "database"
    filter = 'text LIKE "database%"'
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Match any string that starts with the substring "database"
    String filter = "text LIKE \"database%\"";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Match any string that starts with the substring "database"
    filter := "text LIKE \"database%\""
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Match any string that starts with the substring "database"
    let filter = "text LIKE \"database%\"";
    ```

    </TabItem>

    <TabItem value='c++'>

    ```cpp
    // Match any string that starts with the substring "database"
    const auto filter = R"(text LIKE "database%")";
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Match any string that starts with the substring "database"
    const filter = 'text LIKE "database%"';
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Match any string that starts with the substring "database"
    # Use this filter expression in the "filter" field of the query/search request:
    # "filter": "text LIKE \"database%\""
    ```

    </TabItem>

    </Tabs>

- **後方一致**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Match any string that ends with the substring "database"
    filter = 'text LIKE "%database"'
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Match any string that ends with the substring "database"
    String filter = "text LIKE \"%database\"";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Match any string that ends with the substring "database"
    filter := "text LIKE \"%database\""
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Match any string that ends with the substring "database"
    let filter = "text LIKE \"%database\"";
    ```

    </TabItem>

    <TabItem value='c++'>

    ```cpp
    // Match any string that ends with the substring "database"
    const auto filter = R"(text LIKE "%database")";
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Match any string that ends with the substring "database"
    const filter = 'text LIKE "%database"';
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Match any string that ends with the substring "database"
    # Use this filter expression in the "filter" field of the query/search request:
    # "filter": "text LIKE \"%database\""
    ```

    </TabItem>

    </Tabs>

- **中間一致**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Match any string that contains the substring "database" anywhere
    filter = 'text LIKE "%database%"'
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Match any string that contains the substring "database" anywhere
    String filter = "text LIKE \"%database%\"";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Match any string that contains the substring "database" anywhere
    filter := "text LIKE \"%database%\""
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Match any string that contains the substring "database" anywhere
    let filter = "text LIKE \"%database%\"";
    ```

    </TabItem>

    <TabItem value='c++'>

    ```cpp
    // Match any string that contains the substring "database" anywhere
    const auto filter = R"(text LIKE "%database%")";
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Match any string that contains the substring "database" anywhere
    const filter = 'text LIKE "%database%"';
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Match any string that contains the substring "database" anywhere
    # Use this filter expression in the "filter" field of the query/search request:
    # "filter": "text LIKE \"%database%\""
    ```

    </TabItem>

    </Tabs>

- **ワイルドカード一致**

    Zilliz Cloud は、`%`（0 個以上の文字）と `_`（正確に 1 文字）の両方をサポートしています。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Match any string where "st" appears first, and "um" appears later in the text
    filter = 'text LIKE "%st%um%"'
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Match any string where "st" appears first, and "um" appears later in the text
    String filter = "text LIKE \"%st%um%\"";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Match any string where "st" appears first, and "um" appears later in the text
    filter := "text LIKE \"%st%um%\""
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Match any string where "st" appears first, and "um" appears later in the text
    let filter = "text LIKE \"%st%um%\"";
    ```

    </TabItem>

    <TabItem value='c++'>

    ```cpp
    // Match any string where "st" appears first, and "um" appears later in the text
    const auto filter = R"(text LIKE "%st%um%")";
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Match any string where "st" appears first, and "um" appears later in the text
    const filter = 'text LIKE "%st%um%"';
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Match any string where "st" appears first, and "um" appears later in the text
    # Use this filter expression in the "filter" field of the query/search request:
    # "filter": "text LIKE \"%st%um%\""
    ```

    </TabItem>

    </Tabs>

- **JSON パスクエリ**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    filter = 'json_field["body"] LIKE "%database%"'
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    String filter = "json_field[\"body\"] LIKE \"%database%\"";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    filter := "json_field[\"body\"] LIKE \"%database%\""
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    let filter = "json_field[\"body\"] LIKE \"%database%\"";
    ```

    </TabItem>

    <TabItem value='c++'>

    ```cpp
    const auto filter = R"(json_field["body"] LIKE "%database%")";
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const filter = 'json_field["body"] LIKE "%database%"';
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Use this filter expression in the "filter" field of the query/search request:
    # "filter": "json_field[\"body\"] LIKE \"%database%\""
    ```

    </TabItem>

    </Tabs>

- **正規表現フィルター**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Match log messages that contain "error" followed later by "timeout"
    filter = 'text =~ "error.*timeout"'
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Match log messages that contain "error" followed later by "timeout"
    String filter = "text =~ \"error.*timeout\"";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Match log messages that contain "error" followed later by "timeout"
    filter := "text =~ \"error.*timeout\""
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Match log messages that contain "error" followed later by "timeout"
    let filter = "text =~ \"error.*timeout\"";
    ```

    </TabItem>

    <TabItem value='c++'>

    ```cpp
    // Match log messages that contain "error" followed later by "timeout"
    const auto filter = R"(text =~ "error.*timeout")";
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Match log messages that contain "error" followed later by "timeout"
    const filter = 'text =~ "error.*timeout"';
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Match log messages that contain "error" followed later by "timeout"
    # Use this filter expression in the "filter" field of the query/search request:
    # "filter": "text =~ \"error.*timeout\""
    ```

    </TabItem>

    </Tabs>

- **JSON パスに対する正規表現フィルター**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    filter = 'json_field["body"] =~ "error.*timeout"'
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    String filter = "json_field[\"body\"] =~ \"error.*timeout\"";
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    filter := "json_field[\"body\"] =~ \"error.*timeout\""
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    let filter = "json_field[\"body\"] =~ \"error.*timeout\"";
    ```

    </TabItem>

    <TabItem value='c++'>

    ```cpp
    const auto filter = R"(json_field["body"] =~ "error.*timeout")";
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const filter = 'json_field["body"] =~ "error.*timeout"';
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # Use this filter expression in the "filter" field of the query/search request:
    # "filter": "json_field[\"body\"] =~ \"error.*timeout\""
    ```

    </TabItem>

    </Tabs>

フィルター式の構文の詳細については、[Pattern Matching](./pattern-match) を参照してください。

</NextChannel>

<NextChannel action="include">

これにより、`json_field["body"]` が長さ 2 から 4 の部分文字列を使用して `VARCHAR` 値としてインデックス化されます。その他のパスのオプションについては、[JSON Indexing](./json-indexing) を参照してください。

</NextChannel>

## インデックスを削除する\{#drop-an-index}

既存のインデックスをコレクションから削除するには、`drop_index()` メソッドを使用します。

<NextChannel action="exclude">

<Admonition type="info" icon="📘" title="Notes">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になったスカラーインデックスを直接削除できます。そのために最初にコレクションを解放する必要はありません。

</Admonition>

</NextChannel>

<NextChannel action="include">

<Admonition type="info" icon="📘" title="Notes">

> スカラーインデックスを削除する際のリリース要件については、[スカラー Index](./scalar-index-overview#Drop-index-compatibility) を参照してください。

</Admonition>

</NextChannel>

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
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("Documents", "ngram_index"))
if err != nil {
    fmt.Println(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

    let request = DropIndexRequest::builder()
        .collection_name("Documents")
        .index_name("ngram_index")
        .build()?;
    client.drop_index(request).await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
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

<NextChannel action="exclude">

## 使用上の注意\{#usage-notes}

- **フィールドタイプ**: `VARCHAR` フィールドと `JSON` フィールドでサポートされます。JSON の場合は、`params.json_path` と `params.json_cast_type="varchar"` の両方を指定します。

- **正規表現の高速化**: `NGRAM` は、Zilliz Cloud が正規表現パターンから固定のリテラル部分文字列を抽出できる場合にのみ、正規表現フィルターを高速化します。`[a-z]+` などのパターンには固定リテラルが含まれないため、スキャンにフォールバックする可能性があります。

- **大文字と小文字を区別しない正規表現**: `(?i)` を含む正規表現パターンはサポートされていますが、インデックスは元の大文字と小文字を保持するため、`NGRAM` 最適化がスキップされる場合があります。

- **検証ステップ**: 正規表現フィルターの場合、`NGRAM` は候補を生成し、Zilliz Cloud が完全な RE2 正規表現パターンでそれらを検証するため、インデックスの高速化によって一致結果が変わることはありません。

- **Unicode**: NGRAM の分解は文字ベースで言語に依存せず、空白と句読点も含みます。

- **空間と時間のトレードオフ**: グラム範囲 `[min_gram, max_gram]` を広げると、生成されるグラムが増え、インデックスが大きくなります。メモリが厳しい場合は、大きなポスティングリストに `mmap` モードの使用を検討してください。詳細については、[Use mmap](./use-mmap) を参照してください。

- **不変性**: `min_gram` と `max_gram` はその場で変更できません。調整するにはインデックスを再構築してください。

</NextChannel>

## ベストプラクティス\{#best-practices}

- **検索動作に合わせて `min_gram` と `max_gram` を選択する**

    - `min_gram=2`、`max_gram=3` から始めます。

    - `min_gram` は、ユーザーが入力すると想定される最短のリテラルに設定します。

    - `max_gram` は、意味のある部分文字列の一般的な長さに近い値に設定します。`max_gram` を大きくするとフィルタリングは改善しますが、使用する容量が増えます。

- **選択性の低いグラムを避ける**

    非常に反復性の高いパターン（例：`"aaaaaa"`）はフィルタリング効果が弱く、得られる改善は限定的な場合があります。

- **一貫して正規化する**

    ユースケースで必要な場合は、取り込むテキストとクエリのリテラルに同じ正規化（例：小文字化、トリミング）を適用します。
