---
title: "Analyzer の概要 | Cloud"
slug: /analyzer-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "テキスト処理において、アナライザーは生のテキストを構造化された検索可能な形式に変換する重要なコンポーネントです。各アナライザーは通常、tokenizer と filter という 2 つのコア要素で構成されます。これらが組み合わさって入力テキストをトークンに変換し、トークンを精製して、効率的なインデックス作成と取得に備えます。 | Cloud"
type: origin
token: H8MVwnjdgihp0hkRHHKcjBe9n5e
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# Analyzer の概要

テキスト処理において、**アナライザー**は生のテキストを構造化された検索可能な形式に変換する重要なコンポーネントです。各アナライザーは通常、**tokenizer** と **filter** という 2 つのコア要素で構成されます。これらが組み合わさって入力テキストをトークンに変換し、トークンを精製して、効率的なインデックス作成と取得に備えます。

Zilliz Cloud では、コレクションのスキーマに `VARCHAR` フィールドを追加する際に、コレクション作成時にアナライザーを設定します。アナライザーが生成したトークンは、キーワードマッチング用のインデックスの構築に使用したり、全文検索用のスパース埋め込みに変換したりできます。詳細については、[Full Text Search](./full-text-search) または [Text Match](./text-match) を参照してください。

<Admonition type="info" title="Notes">

アナライザーの使用はパフォーマンスに影響する場合があります。

- **Full text search:** 全文検索では、**DataNode** と **QueryNode** のチャネルがトークン化の完了を待つ必要があるため、データの消費が遅くなります。その結果、新しく取り込まれたデータが検索可能になるまでに時間がかかります。

- **Keyword match:** キーワードマッチングでは、インデックスを構築する前にトークン化を完了する必要があるため、インデックスの作成も遅くなります。

</Admonition>

## アナライザーの構成\{#anatomy-of-an-analyzer}

Zilliz Cloud のアナライザーは、正確に 1 つの **tokenizer** と **0 個以上** の filter で構成されます。

- **Tokenizer**: tokenizer は入力テキストをトークンと呼ばれる個別の単位に分割します。これらのトークンは、tokenizer の種類に応じて単語またはフレーズになります。

- **Filters**: filter をトークンに適用して、たとえば小文字への変換や一般的な単語の削除などにより、トークンをさらに精製できます。

<Admonition type="info" title="Notes">

tokenizer は UTF-8 形式のみをサポートします。他の形式のサポートは将来のリリースで追加される予定です。

</Admonition>

次のワークフローは、アナライザーがテキストを処理する方法を示しています。

![Ke6jw8437hjR8hbZCvEcQtIIn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/Ke6jw8437hjR8hbZCvEcQtIIn1e.png)

## アナライザーの種類\{#analyzer-types}

Zilliz Cloud は、さまざまなテキスト処理のニーズに対応するため、2 種類のアナライザーを提供しています。

- **Built-in analyzer**: 最小限の設定で一般的なテキスト処理タスクをカバーする定義済みの構成です。組み込みアナライザーは複雑な設定が不要なため、汎用検索に適しています。

- **Custom analyzer**: より高度な要件には、tokenizer と 0 個以上の filter の両方を指定して独自の構成を定義できるカスタムアナライザーを使用します。このレベルのカスタマイズは、テキスト処理を正確に制御する必要がある特殊なユースケースに特に役立ちます。

<Admonition type="info" title="Notes">

- コレクション作成時にアナライザー構成を省略した場合、Zilliz Cloud はデフォルトですべてのテキスト処理に `standard` アナライザーを使用します。詳細については、[Standard](./standard-analyzer) を参照してください。

- 最適な検索およびクエリのパフォーマンスを得るには、テキストデータの言語に合ったアナライザーを選択してください。たとえば、`standard` アナライザーは汎用性がありますが、中国語、日本語、韓国語のように独自の文法構造を持つ言語には最適な選択ではない場合があります。そのような場合は、言語固有のアナライザー（[`chinese`](./chinese-analyzer) など）や、専用の tokenizer（[`lindera`](./lindera-tokenizer)、[`icu`](./icu-tokenizer) など）と filter を組み合わせたカスタムアナライザーを使用して、正確なトークン化とより良い検索結果を確保することを強くお勧めします。

</Admonition>

### 組み込みアナライザー\{#built-in-analyzer}

Zilliz Cloud クラスターの組み込みアナライザーは、特定の tokenizer と filter があらかじめ設定されているため、これらのコンポーネントを自分で定義することなくすぐに使用できます。各組み込みアナライザーは、プリセットの tokenizer と filter を含むテンプレートとして機能し、カスタマイズ用のオプションパラメーターを備えています。

たとえば、`standard` 組み込みアナライザーを使用するには、その名前 `standard` を `type` として指定し、必要に応じて `stop_words` など、このアナライザー種類に固有の追加構成を含めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] # Defines a list of common words (stop words) to exclude from tokenization
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Arrays.asList("a", "an", "for"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "standard", "stop_words": []string{"a", "an", "for"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let analyzer_params = serde_json::json!({
    "type": "standard",
    "stop_words": ["a", "an", "for"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "standard"},
    {"stop_words",  {"a", "an", "for"}},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] // Defines a list of common words (stop words) to exclude from tokenization
};
```

</TabItem>

<TabItem value='bash'>

```bash
export analyzerParams='{
       "type": "standard",
       "stop_words": ["a", "an", "for"]
    }'
```

</TabItem>
</Tabs>

アナライザーの実行結果を確認するには、`run_analyzer` メソッドを使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample text to analyze
text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

# Run analyzer
result = client.run_analyzer(
    text,
    analyzer_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

List<String> texts = new ArrayList<>();
texts.add("An efficient system relies on a robust analyzer to correctly process text for various applications.");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

texts := []string{"An efficient system relies on a robust analyzer to correctly process text for various applications."}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let sample_text = "An efficient system relies on a robust analyzer to correctly process text for various applications.";
let response = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts([sample_text])
            .analyzer_params(analyzer_params.clone())
            .build()?,
    )
    .await?;
println!("{:?}", response);
```

</TabItem>

<TabItem value='c++'>

```c++
std::string text = "An efficient system relies on a robust analyzer to correctly process text for various applications.";

auto request = milvus::RunAnalyzerRequest()
                       .AddText(text)
                       .WithAnalyzerParams(analyzer_params);

milvus::RunAnalyzerResponse response;
auto status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Sample text to analyze
const text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

// Run analyzer
const result = await client.runAnalyzer({
    text,
    analyzer_params
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export TEXT_TO_ANALYZE="An efficient system relies on a robust analyzer to correctly process text for various applications."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -d '{
    "text": ["'"${TEXT_TO_ANALYZE}"'"],
    "analyzerParams": "{\"type\":\"standard\",\"stop_words\":[\"a\",\"an\",\"for\"]}"
  }'
```

</TabItem>
</Tabs>

出力は以下の通りです。

```sql
['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```

これは、アナライザーがストップワード `"a"`、`"an"`、`"for"` を除外し、残りの意味のあるトークンを返すことで、入力テキストを適切にトークン化していることを示しています。

上記の `standard` 組み込みアナライザーの構成は、以下のパラメーターで [custom analyzer](./analyzer-overview#custom-analyzer) を設定するのと同じです。この場合、同様の機能を実現するために `tokenizer` と `filter` のオプションを明示的に定義します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stop",
            "stop_words": ["a", "an", "for"]
        }
    ]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Arrays.asList("lowercase",
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Arrays.asList("a", "an", "for"));
                }}));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{"lowercase", map[string]any{
        "type":       "stop",
        "stop_words": []string{"a", "an", "for"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": ["lowercase", {"type": "stop", "stop_words": ["a", "an", "for"]}]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"lowercase", {{"type", "stop"}, {"stop_words", {"a", "an", "for"}}}}},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stop",
            "stop_words": ["a", "an", "for"]
        }
    ]
};
```

</TabItem>

<TabItem value='bash'>

```bash
export analyzerParams='{
       "tokenizer": "standard",
       "filter":  [
       "lowercase",
       {
            "type": "stop",
            "stop_words": ["a", "an", "for"]
       }
   ]
}'
```

</TabItem>
</Tabs>

Zilliz Cloud は、それぞれ特定のテキスト処理ニーズに合わせて設計された次の組み込みアナライザーを提供しています。

- `standard`: 汎用的なテキスト処理に適しており、標準的なトークン化と小文字化フィルタリングを適用します。

- `english`: 英語のテキストに最適化されており、英語のストップワードをサポートします。

- `chinese`: 中国語のテキスト処理に特化しており、中国語の言語構造に適応したトークン化を含みます。

### カスタムアナライザー\{#custom-analyzer}

より高度なテキスト処理では、Zilliz Cloud のカスタムアナライザーを使用して、**tokenizer** と **filter** の両方を指定することで、用途に合わせたテキスト処理パイプラインを構築できます。この設定は、正確な制御が必要な特殊なユースケースに適しています。

#### Tokenizer\{#tokenizer}

**tokenizer** はカスタムアナライザーの**必須**コンポーネントであり、入力テキストを個別の単位または**トークン**に分割してアナライザーパイプラインを開始します。トークン化では、tokenizer の種類に応じて、空白または句読点で分割するなどの特定のルールに従います。このプロセスにより、各単語またはフレーズをより正確かつ独立して処理できます。

たとえば、tokenizer はテキスト `"Vector Database Built for Scale"` を個別のトークンに変換します。

```plaintext
["Vector", "Database", "Built", "for", "Scale"]
```

**tokenizer を指定する例**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "whitespace"}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({"tokenizer": "whitespace"});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "whitespace"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace",
};
```

</TabItem>

<TabItem value='bash'>

```bash
export analyzerParams='{
       "tokenizer": "whitespace"
    }'
```

</TabItem>
</Tabs>

#### Filter\{#filter}

**filter** は**オプション**のコンポーネントであり、tokenizer が生成したトークンを処理して、必要に応じて変換または精製します。たとえば、トークン化された語 `["Vector", "Database", "Built", "for", "Scale"]` に `lowercase` filter を適用した後の結果は、次のようになります。

```sql
["vector", "database", "built", "for", "scale"]
```

カスタムアナライザーの filter は、構成のニーズに応じて**組み込み**または**カスタム**のいずれかになります。

- **Built-in filters**: Zilliz Cloud によって事前設定されており、最小限の設定で使用できます。名前を指定するだけで、これらの filter をすぐに使用できます。以下の filter は直接使用できる組み込みのものです。

    - `lowercase`: テキストを小文字に変換し、大文字と小文字を区別しないマッチングを実現します。詳細については、[Lowercase](./lowercase-filter) を参照してください。

    - `asciifolding`: 非 ASCII 文字を ASCII の同等文字に変換し、多言語テキストの処理を簡素化します。詳細については、[ASCII folding](./ascii-folding-filter) を参照してください。

    - `alphanumonly`: 英数字以外の文字を削除して、英数字のみを保持します。詳細については、[Alphanumonly](./alphanumonly-filter) を参照してください。

    - `cnalphanumonly`: 漢字、英字、数字以外の文字を含むトークンを削除します。詳細については、[Cnalphanumonly](./cnalphanumonly-filter) を参照してください。

    - `cncharonly`: 中国語以外の文字を含むトークンを削除します。詳細については、[Cncharonly](./cncharonly-filter) を参照してください。

    - `pinyin`: 中国語のトークンに Pinyin 形式のトークンを追加し、中国語テキストの Pinyin ベースのマッチングを可能にします。詳細については、[Pinyin](./pinyin-filter) を参照してください。

    **組み込み filter を使用する例:**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    analyzer_params = {
        "tokenizer": "standard", # Mandatory: Specifies tokenizer
        "filter": ["lowercase"], # Optional: Built-in filter that converts text to lowercase
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    Map<String, Object> analyzerParams = new HashMap<>();
    analyzerParams.put("tokenizer", "standard");
    analyzerParams.put("filter", Collections.singletonList("lowercase"));
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
            "filter": []any{"lowercase"}}
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    let analyzer_params = serde_json::json!({"tokenizer": "standard", "filter": ["lowercase"]});
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    nlohmann::json analyzer_params = {
        {"tokenizer", "standard"},
        {"filter", {"lowercase"}},
    };
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const analyzer_params = {
        "tokenizer": "standard", // Mandatory: Specifies tokenizer
        "filter": ["lowercase"], // Optional: Built-in filter that converts text to lowercase
    }
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export analyzerParams='{
           "tokenizer": "standard",
           "filter":  ["lowercase"]
        }'
    ```

    </TabItem>
    </Tabs>

- **Custom filters**: カスタム filter では、特殊な構成が可能です。有効な filter タイプ（`filter.type`）を選択し、filter タイプごとに固有の設定を追加することで、カスタム filter を定義できます。カスタマイズをサポートする filter タイプの例は次のとおりです。

    - `stop`: ストップワードのリストを設定して、指定した一般的な単語を削除します（例: `"stop_words": ["of", "to"]`）。詳細については、[Stop](./stop-filter) を参照してください。

    - `length`: 最大トークン長の設定など、長さの基準に基づいてトークンを除外します。詳細については、[Length](./length-filter) を参照してください。

    - `stemmer`: 単語を語根形に還元し、より柔軟なマッチングを可能にします。詳細については、[Stemmer](./stemmer-filter) を参照してください。

    **カスタム filter を構成する例:**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    analyzer_params = {
        "tokenizer": "standard", # Mandatory: Specifies tokenizer
        "filter": [
            {
                "type": "stop", # Specifies 'stop' as the filter type
                "stop_words": ["of", "to"], # Customizes stop words for this filter type
            }
        ]
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    Map<String, Object> analyzerParams = new HashMap<>();
    analyzerParams.put("tokenizer", "standard");
    analyzerParams.put("filter",
            Collections.singletonList(new HashMap<String, Object>() {{
                put("type", "stop");
                put("stop_words", Arrays.asList("of", "to"));
            }}));
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
        "filter": []any{map[string]any{
            "type":       "stop",
            "stop_words": []string{"of", "to"},
        }}}
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    let analyzer_params = serde_json::json!({
        "tokenizer": "standard",
        "filter": [{"type": "stop", "stop_words": ["of", "to"]}]
    });
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    nlohmann::json analyzer_params = {
        {"tokenizer", "standard"},
        {"filter", {{{"type", "stop"}, {"stop_words", {"of", "to"}}}}},
    };
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const analyzer_params = {
        "tokenizer": "standard", // Mandatory: Specifies tokenizer
        "filter": [
            {
                "type": "stop", // Specifies 'stop' as the filter type
                "stop_words": ["of", "to"], // Customizes stop words for this filter type
            }
        ]
    };
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export analyzerParams='{
           "tokenizer": "standard",
           "filter":  [
           {
                "type": "stop",
                "stop_words": ["of", "to"]
           }
        ]
    }'
    ```

    </TabItem>
    </Tabs>

## 使用例\{#example-use}

この例では、次の内容を含むコレクションスキーマを作成します。

- 埋め込み用のベクトルフィールド。

- テキスト処理用の 2 つの `VARCHAR` フィールド。

    - 1 つのフィールドは組み込みアナライザーを使用します。

    - もう 1 つのフィールドはカスタムアナライザーを使用します。

これらの構成をコレクションに組み込む前に、`run_analyzer` メソッドを使用して各アナライザーを検証します。

### ステップ 1: MilvusClient を初期化してスキーマを作成する\{#step-1-initialize-milvusclient-and-create-schema}

まず、Milvus クライアントを設定し、新しいスキーマを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Set up a Milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a new schema
schema = client.create_schema(auto_id=True, enable_dynamic_field=False)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.*;

// Set up a Milvus client
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

// Create schema
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(false)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
defer client.Close(ctx)

schema := entity.NewSchema().WithAutoID(true).WithDynamicFieldEnabled(false)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN")).await?;
let schema = CollectionSchema::new().enable_dynamic_field(false);
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->SetEnableDynamicField(false);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

// Set up a Milvus client
const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export MILVUS_TOKEN="YOUR_CLUSTER_TOKEN"
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/collections/create" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -H "Authorization: Bearer ${MILVUS_TOKEN}" \
  -d '{
    "collectionName": "my_collection",
    "dimension": 768,
    "schema": {
      "autoId": true,
      "enableDynamicField": false
    }
  }'
```

</TabItem>
</Tabs>

### ステップ 2: アナライザー構成を定義して検証する\{#step-2-define-and-verify-analyzer-configurations}

1. **組み込みアナライザー（`english`）を構成して検証する**:

    - **構成:** 組み込みの英語アナライザーのパラメーターを定義します。

    - **検証:** `run_analyzer` を使用して、構成が期待どおりのトークン化を生成することを確認します。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Built-in analyzer configuration for English text processing
    analyzer_params_built_in = {
        "type": "english"
    }
    # Verify built-in analyzer configuration
    sample_text = "Milvus simplifies text analysis for search."
    result = client.run_analyzer(sample_text, analyzer_params_built_in)
    print("Built-in analyzer output:", result)
    
    # Expected output:
    # Built-in analyzer output: ['milvus', 'simplifi', 'text', 'analysi', 'search']
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.service.vector.request.RunAnalyzerReq;
    import io.milvus.v2.service.vector.response.RunAnalyzerResp;
    import java.util.ArrayList;
    import java.util.HashMap;
    import java.util.List;
    import java.util.Map;
    
    Map<String, Object> analyzerParamsBuiltin = new HashMap<>();
    analyzerParamsBuiltin.put("type", "english");
    
    List<String> texts = new ArrayList<>();
    texts.add("Milvus simplifies text analysis for search.");
    
    RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
            .texts(texts)
            .analyzerParams(analyzerParamsBuiltin)
            .build());
    List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import (
        "fmt"
    
        "github.com/milvus-io/milvus/client/v3/milvusclient"
    )
    
    analyzerParamsBuiltin := map[string]any{"type": "english"}
    
    texts := []string{"Milvus simplifies text analysis for search."}
    option := milvusclient.NewRunAnalyzerOption(texts...).
        WithAnalyzerParams(analyzerParamsBuiltin)
    
    result, err := client.RunAnalyzer(ctx, option)
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    use milvus::v2::prelude::*;
    
    let analyzer_params_built_in = serde_json::json!({"type": "english"});
    let sample_text = "Milvus simplifies text analysis for search.";
    let response = client
        .run_analyzer(
            RunAnalyzerRequest::builder()
                .texts([sample_text])
                .analyzer_params(analyzer_params_built_in.clone())
                .build()?,
        )
        .await?;
    println!("{:?}", response);
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    nlohmann::json analyzer_params_built_in = {
            {"type", "english"}
    };
    
    std::string sample_text = "Milvus simplifies text analysis for search.";
    auto request = milvus::RunAnalyzerRequest()
                       .AddText(sample_text)
                       .WithAnalyzerParams(analyzer_params_built_in);
    
    milvus::RunAnalyzerResponse response;
    auto status = client->RunAnalyzer(request, response);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Use a built-in analyzer for VARCHAR field `title_en`
    const analyzer_params_built_in = {
      type: "english",
    };
    
    const sample_text = "Milvus simplifies text analysis for search.";
    const result = await client.runAnalyzer({
        text: sample_text,
        analyzer_params: analyzer_params_built_in
    });
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # restful
    export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
    export SAMPLE_TEXT="Milvus simplifies text analysis for search."
    curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
      -H "Content-Type: application/json" \
      -H "Request-Timeout: 10" \
      -d '{
        "text": ["'"${SAMPLE_TEXT}"'"],
        "analyzerParams": "{\"type\":\"english\"}"
      }'
    ```

    </TabItem>
    </Tabs>

1. **カスタムアナライザーを構成して検証する**:

    - **構成:** 標準の tokenizer と、組み込みの lowercase filter、およびトークン長とストップワード用のカスタム filter を使用するカスタムアナライザーを定義します。

    - **検証:** `run_analyzer` を使用して、カスタム構成がテキストを意図どおりに処理することを確認します。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Custom analyzer configuration with a standard tokenizer and custom filters
    analyzer_params_custom = {
        "tokenizer": "standard",
        "filter": [
            "lowercase",  # Built-in filter: convert tokens to lowercase
            {
                "type": "length",  # Custom filter: restrict token length
                "max": 40
            },
            {
                "type": "stop",  # Custom filter: remove specified stop words
                "stop_words": ["of", "for"]
            }
        ]
    }
    
    # Verify custom analyzer configuration
    sample_text = "Milvus provides flexible, customizable analyzers for robust text processing."
    result = client.run_analyzer(sample_text, analyzer_params_custom)
    print("Custom analyzer output:", result)
    
    # Expected output:
    # Custom analyzer output: ['milvus', 'provides', 'flexible', 'customizable', 'analyzers', 'robust', 'text', 'processing']
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.service.vector.request.RunAnalyzerReq;
    import io.milvus.v2.service.vector.response.RunAnalyzerResp;
    import java.util.ArrayList;
    import java.util.Arrays;
    import java.util.HashMap;
    import java.util.List;
    import java.util.Map;
    
    // Configure a custom analyzer
    Map<String, Object> analyzerParamsCustom = new HashMap<>();
    analyzerParamsCustom.put("tokenizer", "standard");
    analyzerParamsCustom.put("filter",
            Arrays.asList("lowercase",
                    new HashMap<String, Object>() {{
                        put("type", "length");
                        put("max", 40);
                    }},
                    new HashMap<String, Object>() {{
                        put("type", "stop");
                        put("stop_words", Arrays.asList("of", "for"));
                    }}
            )
    );
    
    List<String> texts = new ArrayList<>();
    texts.add("Milvus provides flexible, customizable analyzers for robust text processing.");
    
    RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
            .texts(texts)
            .analyzerParams(analyzerParamsCustom)
            .build());
    List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    import (
        "fmt"
    
        "github.com/milvus-io/milvus/client/v3/milvusclient"
    )
    
    analyzerParamsCustom := map[string]any{"tokenizer": "standard",
        "filter": []any{"lowercase",
            map[string]any{
                "type": "length",
                "max":  40,
            },
            map[string]any{
                "type":       "stop",
                "stop_words": []string{"of", "for"},
            }}}
    
    texts := []string{"Milvus provides flexible, customizable analyzers for robust text processing."}
    option := milvusclient.NewRunAnalyzerOption(texts...).
        WithAnalyzerParams(analyzerParamsCustom)
    
    result, err := client.RunAnalyzer(ctx, option)
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    use milvus::v2::prelude::*;
    
    let analyzer_params_custom = serde_json::json!({
        "tokenizer": "standard",
        "filter": ["lowercase", {"type": "length", "max": 40}, {"type": "stop", "stop_words": ["of", "for"]}]
    });
    let sample_text = "Milvus provides flexible, customizable analyzers for robust text processing.";
    let response = client
        .run_analyzer(
            RunAnalyzerRequest::builder()
                .texts([sample_text])
                .analyzer_params(analyzer_params_custom.clone())
                .build()?,
        )
        .await?;
    println!("{:?}", response);
    ```

    </TabItem>

    <TabItem value='c++'>

    ```c++
    nlohmann::json analyzer_params_custom = {
        {"tokenizer", "standard"},
        {"filter", {
            "lowercase",
            {{"type", "length"}, {"max", 40}},
            {{"type", "stop"}, {"stop_words", {"of", "for"}}}
        }},
    };
    
    const std::vector<std::string> texts = {
            "Milvus provides flexible, customizable analyzers for robust text processing."
    };
    
    auto request = milvus::RunAnalyzerRequest()
                           .WithTexts(texts)
                           .WithAnalyzerParams(analyzer_params_custom);
    
    milvus::RunAnalyzerResponse response;
    auto status = client->RunAnalyzer(request, response);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Configure a custom analyzer for VARCHAR field `title`
    const analyzer_params_custom = {
      tokenizer: "standard",
      filter: [
        "lowercase",
        {
          type: "length",
          max: 40,
        },
        {
          type: "stop",
          stop_words: ["of", "for"],
        },
      ],
    };
    const sample_text_custom = "Milvus provides flexible, customizable analyzers for robust text processing.";
    const result_custom = await client.runAnalyzer({
        text: sample_text_custom,
        analyzer_params: analyzer_params_custom
    });
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # curl
    export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
    export SAMPLE_TEXT="Milvus provides flexible, customizable analyzers for robust text processing."
    
    curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
      -H "Content-Type: application/json" \
      -H "Request-Timeout: 10" \
      -d '{
        "text": ["'"${SAMPLE_TEXT}"'"],
        "analyzerParams": "{\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",{\"type\":\"length\",\"max\":40},{\"type\":\"stop\",\"stop_words\":[\"of\",\"for\"]}]}"
      }'
    ```

    </TabItem>
    </Tabs>

### ステップ 3: スキーマフィールドにアナライザーを追加する\{#step-3-add-analyzer-to-schema-field}

アナライザー構成を検証したら、それをスキーマフィールドに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add VARCHAR field 'title_en' using the built-in analyzer configuration
schema.add_field(
    field_name='title_en',
    datatype=DataType.VARCHAR,
    max_length=1000,
    enable_analyzer=True,
    analyzer_params=analyzer_params_built_in,
    enable_match=True,
)

# Add VARCHAR field 'title' using the custom analyzer configuration
schema.add_field(
    field_name='title',
    datatype=DataType.VARCHAR,
    max_length=1000,
    enable_analyzer=True,
    analyzer_params=analyzer_params_custom,
    enable_match=True,
)

# Add a vector field for embeddings
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=3)

# Add a primary key field
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;

schema.addField(AddFieldReq.builder()
        .fieldName("title_en")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .analyzerParams(analyzerParamsBuiltin)
        .enableMatch(true) // must enable this if you use TextMatch
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .analyzerParams(analyzerParamsCustom)
        .enableMatch(true) // must enable this if you use TextMatch
        .build());

// Add vector field
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(3)
        .build());
// Add primary field
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(3),
).WithField(entity.NewField().
    WithName("title_en").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(1000).
    WithEnableAnalyzer(true).
    WithAnalyzerParams(analyzerParamsBuiltin).
    WithEnableMatch(true),
).WithField(entity.NewField().
    WithName("title").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(1000).
    WithEnableAnalyzer(true).
    WithAnalyzerParams(analyzerParamsCustom).
    WithEnableMatch(true),
)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let schema = schema
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(true))
    .add_field(FieldSchema::new().name("title_en").data_type(DataType::VarChar).max_length(1000).enable_analyzer(true).enable_match(true).analyzer_params(analyzer_params_built_in))
    .add_field(FieldSchema::new().name("title").data_type(DataType::VarChar).max_length(1000).enable_analyzer(true).enable_match(true).analyzer_params(analyzer_params_custom))
    .add_field(FieldSchema::new().name("embedding").data_type(DataType::FloatVector).dimension(3));
```

</TabItem>

<TabItem value='c++'>

```c++
schema->AddField({"id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("title_en", milvus::DataType::VARCHAR).WithMaxLength(1000)
                    .EnableAnalyzer(true).EnableMatch(true).WithAnalyzerParams(analyzer_params_built_in));
schema->AddField(milvus::FieldSchema("title", milvus::DataType::VARCHAR).WithMaxLength(1000)
                    .EnableAnalyzer(true).EnableMatch(true).WithAnalyzerParams(analyzer_params_custom));
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR).WithDimension(3));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

// Create schema
const schema = [
  {
    name: "id",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: true,
  },
  {
    name: "title_en",
    data_type: DataType.VarChar,
    max_length: 1000,
    enable_analyzer: true,
    analyzer_params: analyzer_params_built_in,
    enable_match: true,
  },
  {
    name: "title",
    data_type: DataType.VarChar,
    max_length: 1000,
    enable_analyzer: true,
    analyzer_params: analyzer_params_custom,
    enable_match: true,
  },
  {
    name: "embedding",
    data_type: DataType.FloatVector,
    dim: 3,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export SCHEMA_CONFIG='{
  "autoId": true,
  "enableDynamicField": false,
  "fields": [
    {
      "fieldName": "id",
      "dataType": "Int64",
      "isPrimary": true
    },
    {
      "fieldName": "title_en",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "1000",
        "enable_analyzer": true,
        "analyzer_params": "{\"type\":\"english\"}",
        "enable_match": true
      }
    },
    {
      "fieldName": "title",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "1000",
        "enable_analyzer": true,
        "analyzer_params": "{\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",{\"type\":\"length\",\"max\":40},{\"type\":\"stop\",\"stop_words\":[\"of\",\"for\"]}]}",
        "enable_match": true
      }
    },
    {
      "fieldName": "embedding",
      "dataType": "FloatVector",
      "elementTypeParams": {
        "dim": "3"
      }
    }
  ]
}' 
```

</TabItem>
</Tabs>

### ステップ 4: インデックスパラメーターを準備してコレクションを作成する\{#step-4-prepare-index-parameters-and-create-the-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set up index parameters for the vector field
index_params = client.prepare_index_params()
index_params.add_index(field_name="embedding", metric_type="COSINE", index_type="AUTOINDEX")

# Create the collection with the defined schema and index parameters
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.ArrayList;
import java.util.List;

// Set up index params for vector field
List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());

// Create collection with defined schema
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

idx := index.NewAutoIndex(index.MetricType(entity.COSINE))
indexOption := milvusclient.NewCreateIndexOption("my_collection", "embedding", idx)

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("my_collection")
            .schema(schema)
            .index_param(
                IndexParam::new()
                    .field_name("embedding")
                    .index_type(IndexType::AutoIndex)
                    .metric_type(MetricType::Cosine),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("embedding", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)
};

auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithIndexes(std::move(indexes))
                                    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Set up index params for vector field
const indexParams = [
  {
    field_name: "embedding",
    metric_type: "COSINE",
    index_type: "AUTOINDEX",
  },
];

// Create collection with defined schema
await client.createCollection({
  collection_name: "my_collection",
  schema: schema,
  index_params: indexParams,
});

console.log("Collection created successfully!");
```

</TabItem>

<TabItem value='bash'>

```bash
export INDEX_PARAMS='[{"fieldName": "embedding", "metricType": "COSINE", "indexType": "AUTOINDEX"}]'
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"my_collection\",
    \"schema\": ${SCHEMA_CONFIG},
    \"indexParams\": ${INDEX_PARAMS}
  }"
```

</TabItem>
</Tabs>

## Zilliz Cloud コンソールでの使用例\{#example-use-on-the-zilliz-cloud-console}

Zilliz Cloud コンソールを使用して、上記の操作を実行することもできます。詳細については、以下のデモを再生してください。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />

<Admonition type="info" title="Note">

アナライザー構成は、コレクション作成後に変更できません。アナライザー構成を変更するには、目的の設定で新しいコレクションを作成し、データを [migrate](./migrate-between-clusters) します。

</Admonition>

## 次のステップ\{#whats-next}

アナライザーを構成する際は、次のベストプラクティスの記事を読んで、ユースケースに最も適した構成を判断することをお勧めします。

- [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case)

アナライザーを構成した後は、Zilliz Cloud が提供するテキスト取得機能と統合できます。詳細については、以下を参照してください。

- [Full Text Search](./full-text-search)

- [Text Match](./text-match)
