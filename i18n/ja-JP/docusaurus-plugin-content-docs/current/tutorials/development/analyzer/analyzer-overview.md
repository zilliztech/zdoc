---
title: "アナライザーの概要 | Cloud"
slug: /analyzer-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "テキスト処理において、アナライザーは生テキストを構造化された検索可能な形式に変換する重要なコンポーネントです。各アナライザーは通常、トークナイザーとフィルターという 2 つの中核要素で構成されます。これらが連携して入力テキストをトークンに変換し、トークンを整形して、効率的なインデックス作成と検索の準備を整えます。 | Cloud"
type: origin
token: H8MVwnjdgihp0hkRHHKcjBe9n5e
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# アナライザーの概要

テキスト処理において、**アナライザー**は生テキストを構造化された検索可能な形式に変換する重要なコンポーネントです。各アナライザーは通常、**トークナイザー**と**フィルター**という 2 つの中核要素で構成されます。これらが連携して入力テキストをトークンに変換し、それらのトークンを整形して、効率的なインデックス作成と検索の準備を整えます。

Zilliz Cloud では、アナライザーはコレクションの作成時に、コレクションスキーマに `VARCHAR` フィールドを追加する際に構成します。アナライザーが生成するトークンは、キーワードマッチング用のインデックスを構築したり、全文検索用のスパースベクトルに変換したりするために使用できます。詳細については、[全文検索](./full-text-search) または [テキストマッチ](./text-match) を参照してください。

<Admonition type="info" title="Notes">

アナライザーを使用すると、パフォーマンスに影響する可能性があります。

- **全文検索:** 全文検索では、**DataNode** と **QueryNode** のチャネルがトークン化の完了を待つ必要があるため、データの消費が遅くなります。その結果、新しく取り込まれたデータが検索可能になるまでの時間が長くなります。

- **キーワードマッチ:** キーワードマッチングでは、インデックスを構築する前にトークン化を完了させる必要があるため、インデックスの作成も遅くなります。

</Admonition>

## アナライザーの構造\{#anatomy-of-an-analyzer}

Zilliz Cloud のアナライザーは、厳密に 1 つの **トークナイザー**と **0 個以上**のフィルターで構成されます。

- **トークナイザー**: トークナイザーは、入力テキストをトークンと呼ばれる個別の単位に分割します。これらのトークンは、トークナイザーの種類に応じて、単語またはフレーズになります。

- **フィルター**: フィルターはトークンに適用してさらに整形できます。たとえば、小文字に変換したり、一般的な単語を削除したりします。

<Admonition type="info" title="Notes">

トークナイザーは UTF-8 形式のみをサポートします。その他の形式のサポートは将来のリリースで追加される予定です。

</Admonition>

以下のワークフローは、アナライザーがテキストを処理する方法を示しています。

![Ke6jw8437hjR8hbZCvEcQtIIn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/Ke6jw8437hjR8hbZCvEcQtIIn1e.png)

## アナライザーの種類\{#analyzer-types}

Zilliz Cloud は、さまざまなテキスト処理のニーズに応えるために 2 種類のアナライザーを提供しています。

- **組み込みアナライザー**: 最小限の設定で一般的なテキスト処理タスクを網羅する、あらかじめ定義された構成です。組み込みアナライザーは複雑な構成が不要なため、汎用的な検索に最適です。

- **カスタムアナライザー**: より高度な要件の場合、カスタムアナライザーでは、トークナイザーと 0 個以上のフィルターの両方を指定して独自の構成を定義できます。このレベルのカスタマイズは、テキスト処理を正確に制御する必要がある特殊なユースケースに特に役立ちます。

<Admonition type="info" title="Notes">

- コレクションの作成時にアナライザーの構成を省略した場合、Zilliz Cloud はすべてのテキスト処理にデフォルトで `standard` アナライザーを使用します。詳細については、[Standard](./standard-analyzer) を参照してください。

- 最適な検索およびクエリのパフォーマンスを得るには、テキストデータの言語に合ったアナライザーを選択してください。たとえば、`standard` アナライザーは汎用性がありますが、中国語、日本語、韓国語など、独自の文法構造を持つ言語には最適な選択ではない場合があります。そのような場合は、[`chinese`](./chinese-analyzer) のような言語固有のアナライザーや、特殊なトークナイザー（[`lindera`](./lindera-tokenizer)、[`icu`](./icu-tokenizer) など）とフィルターを組み合わせたカスタムアナライザーを使用して、正確なトークン化とより良い検索結果を確保することを強くお勧めします。

</Admonition>

### 組み込みアナライザー\{#built-in-analyzer}

Zilliz Cloud クラスターの組み込みアナライザーは、特定のトークナイザーとフィルターが事前構成されているため、これらのコンポーネントを定義することなくすぐに使用できます。各組み込みアナライザーは、プリセットのトークナイザーとフィルター、およびカスタマイズ用のオプションパラメーターを含むテンプレートとして機能します。

たとえば、`standard` 組み込みアナライザーを使用するには、その名前 `standard` を `type` として指定し、必要に応じて、`stop_words` などこのアナライザーの種類に固有の追加構成を含めます。

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

出力は次のとおりです。

```sql
['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```

これは、アナライザーがストップワード `"a"`、`"an"`、`"for"` を除外して入力テキストを適切にトークン化し、残りの意味のあるトークンを返すことを示しています。

上記の `standard` 組み込みアナライザーの構成は、次のパラメーターを使用して [カスタムアナライザー](./analyzer-overview#custom-analyzer) を設定するのと同等です。ここでは、同様の機能を実現するために `tokenizer` と `filter` オプションが明示的に定義されています。

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

- `standard`: 汎用的なテキスト処理に適しており、標準的なトークン化と小文字化フィルターを適用します。

- `english`: 英語テキスト用に最適化されており、英語のストップワードをサポートします。

- `chinese`: 中国語テキストの処理に特化しており、中国語の言語構造に適応したトークン化を含みます。

### カスタムアナライザー\{#custom-analyzer}

より高度なテキスト処理のために、Zilliz Cloud のカスタムアナライザーでは、**トークナイザー**と**フィルター**の両方を指定して、カスタマイズされたテキスト処理パイプラインを構築できます。この設定は、正確な制御が必要な特殊なユースケースに最適です。

#### トークナイザー\{#tokenizer}

**トークナイザー**はカスタムアナライザーの**必須**コンポーネントであり、入力テキストを個別の単位、つまり**トークン**に分割してアナライザーパイプラインを開始します。トークン化は、トークナイザーの種類に応じて、空白や句読点で分割するなど、特定の規則に従って行われます。このプロセスにより、各単語やフレーズをより正確かつ独立して処理できます。

たとえば、トークナイザーはテキスト `"Vector Database Built for Scale"` を個別のトークンに変換します。

```plaintext
["Vector", "Database", "Built", "for", "Scale"]
```

**トークナイザーを指定する例**:

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

#### フィルター\{#filter}

**フィルター**は、トークナイザーが生成したトークンを処理し、必要に応じて変換または整形する**オプション**のコンポーネントです。たとえば、トークン化された語 `["Vector", "Database", "Built", "for", "Scale"]` に `lowercase` フィルターを適用すると、結果は次のようになります。

```sql
["vector", "database", "built", "for", "scale"]
```

カスタムアナライザーのフィルターは、構成のニーズに応じて**組み込み**または**カスタム**のいずれかになります。

- **組み込みフィルター**: Zilliz Cloud によって事前構成されており、最小限の設定で済みます。名前を指定するだけで、これらのフィルターをそのまま使用できます。以下は、そのまま使用できる組み込みフィルターです。

    - `lowercase`: テキストを小文字に変換し、大文字と小文字を区別しないマッチングを可能にします。詳細については、[Lowercase](./lowercase-filter) を参照してください。

    - `asciifolding`: 非 ASCII 文字を ASCII 相当の文字に変換し、多言語テキストの処理を簡素化します。詳細については、[ASCII folding](./ascii-folding-filter) を参照してください。

    - `alphanumonly`: 英数字以外の文字を削除して、英数字のみを保持します。詳細については、[Alphanumonly](./alphanumonly-filter) を参照してください。

    - `cnalphanumonly`: 中国語の文字、英字、数字以外の文字を含むトークンを削除します。詳細については、[Cnalphanumonly](./cnalphanumonly-filter) を参照してください。

    - `cncharonly`: 中国語以外の文字を含むトークンを削除します。詳細については、[Cncharonly](./cncharonly-filter) を参照してください。

    - `pinyin`: 中国語トークンにピンインのトークン形式を追加し、中国語テキストのピンインベースのマッチングを可能にします。詳細については、[Pinyin](./pinyin-filter) を参照してください。

    **組み込みフィルターを使用する例:**

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

- **カスタムフィルター**: カスタムフィルターでは、特殊な構成が可能です。有効なフィルタータイプ（`filter.type`）を選択し、フィルタータイプごとに固有の設定を追加して、カスタムフィルターを定義できます。カスタマイズをサポートするフィルタータイプの例は次のとおりです。

    - `stop`: ストップワードのリストを設定して、指定した一般的な単語を削除します（例：`"stop_words": ["of", "to"]`）。詳細については、[Stop](./stop-filter) を参照してください。

    - `length`: トークンの最大長を設定するなど、長さの基準に基づいてトークンを除外します。詳細については、[Length](./length-filter) を参照してください。

    - `stemmer`: 単語を語幹に還元して、より柔軟なマッチングを可能にします。詳細については、[Stemmer](./stemmer-filter) を参照してください。

    **カスタムフィルターを構成する例:**

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

この例では、以下を含むコレクションスキーマを作成します。

- 埋め込み用のベクトルフィールド。

- テキスト処理用の 2 つの `VARCHAR` フィールド：

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

1. **組み込みアナライザーを構成して検証する**（`english`）**:**

    - **構成:** 組み込み英語アナライザーのアナライザーパラメーターを定義します。

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
    let analyzer_params_built_in = serde_json::json!({"type": "english"});
    let sample_text = "Milvus simplifies text analysis for search.";
    let response = client
        .run_analyzer(
            RunAnalyzerRequest::builder()
                .texts([sample_text])
                .analyzer_params(analyzer_params_built_in)
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

1. **カスタムアナライザーを構成して検証する:**

    - **構成:** 標準のトークナイザーと、組み込みの小文字化フィルター、およびトークン長とストップワード用のカスタムフィルターを使用するカスタムアナライザーを定義します。

    - **検証:** `run_analyzer` を使用して、カスタム構成が意図したとおりにテキストを処理することを確認します。

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
    let analyzer_params_custom = serde_json::json!({
        "tokenizer": "standard",
        "filter": ["lowercase", {"type": "length", "max": 40}, {"type": "stop", "stop_words": ["of", "for"]}]
    });
    let sample_text = "Milvus provides flexible, customizable analyzers for robust text processing.";
    let response = client
        .run_analyzer(
            RunAnalyzerRequest::builder()
                .texts([sample_text])
                .analyzer_params(analyzer_params_custom)
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
    const sample_text = "Milvus provides flexible, customizable analyzers for robust text processing.";
    const result = await client.runAnalyzer({
        text: sample_text,
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

アナライザーの構成を検証したので、それらをスキーマフィールドに追加します。

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

    "github.com/milvus-io/milvus/client/v3/index"
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

Zilliz Cloud コンソールを使用して上記の操作を実行することもできます。詳細については、以下のデモを再生してください。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />

<Admonition type="info" title="Note">

アナライザーの構成は、コレクションの作成後に変更できません。アナライザーの構成を変更するには、目的の設定で新しいコレクションを作成し、データを [移行](./migrate-between-clusters) してください。

</Admonition>

## 次のステップ\{#whats-next}

アナライザーを構成する際は、ユースケースに最適な構成を判断するために、以下のベストプラクティス記事を読むことをお勧めします。

- [ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case)

アナライザーを構成した後は、Zilliz Cloud が提供するテキスト検索機能と連携できます。詳細については、以下のとおりです。

- [全文検索](./full-text-search)

- [テキストマッチ](./text-match)
