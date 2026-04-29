---
title: "アナライザーの概要 | BYOC"
slug: /analyzer-overview
sidebar_key: analyzer-overview
sidebar_label: "概要"
beta: FALSE
notebook: FALSE
description: "テキスト処理において、アナライザーは生テキストを検索可能な構造化形式に変換する重要なコンポーネントです。各アナライザーは通常、トークナイザーとフィルターという 2 つのコア要素で構成されています。これらが連携して入力テキストをトークンに変換し、これらのトークンを精査することで、効率的なインデックス作成と検索のための準備を行います。 | BYOC"
type: origin
token: H8MVwnjdgihp0hkRHHKcjBe9n5e
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - アナライザーの説明

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# アナライザーの概要

テキスト処理において、**アナライザー**は生のテキストを構造化された検索可能な形式に変換するための重要なコンポーネントです。各アナライザーは通常、**トークナイザー**と**フィルター**という2つのコア要素で構成されています。これらが協調して入力テキストをトークンに変換し、それらのトークンを洗練させて、効率的なインデックス作成および検索の準備を行います。

Zilliz Cloudでは、コレクションスキーマに`VARCHAR`フィールドを追加する際に、コレクション作成時にアナライザーを設定します。アナライザーによって生成されたトークンは、キーワードマッチング用のインデックス構築に使用することも、全文検索用のスパース埋め込みに変換することもできます。詳細については、[Full Text Search](./full-text-search) または [Text Match](./text-match) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>アナライザーの使用はパフォーマンスに影響を与える可能性があります:</p>
<ul>
<li><p><strong>全文検索:</strong> 全文検索の場合、<strong>データNode</strong>および<strong>QueryNode</strong>チャネルはトークン化が完了するまで待機しなければならないため、データの消費速度が遅くなります。その結果、新しく取り込まれたデータが検索可能になるまでに時間がかかります。</p></li>
<li><p><strong>キーワードマッチ:</strong> キーワードマッチの場合も、トークン化が完了してからでないとインデックスを作成できないため、インデックス作成が遅くなります。</p></li>
</ul>

</Admonition>

## アナライザーの構成\{#anatomy-of-an-analyzer}

Zilliz Cloudにおけるアナライザーは、**ちょうど1つ**の**トークナイザー**と**ゼロ個以上**のフィルターで構成されます。

- **トークナイザー**: トークナイザーは入力テキストを「トークン」と呼ばれる個別の単位に分割します。これらのトークンは、トークナイザーの種類に応じて単語やフレーズになります。

- **フィルター**: フィルターはトークンに適用され、小文字化や一般的な単語の除去など、トークンをさらに洗練させるために使用されます。

<Admonition type="info" icon="📘" title="Notes">

<p>トークナイザーはUTF-8形式のみをサポートしています。他の形式のサポートは今後のリリースで追加される予定です。</p>

</Admonition>

以下のワークフローは、アナライザーがテキストを処理する方法を示しています。

![Ke6jw8437hjR8hbZCvEcQtIIn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/Ke6jw8437hjR8hbZCvEcQtIIn1e.png)

## アナライザーの種類\{#analyzer-types}

Zilliz Cloudでは、さまざまなテキスト処理ニーズに対応するために、次の2種類のアナライザーを提供しています。

- **組み込みアナライザー**: これらは事前定義された設定で、最小限のセットアップで一般的なテキスト処理タスクをカバーします。組み込みアナライザーは汎用的な検索に最適で、複雑な設定が不要です。

- **カスタムアナライザー**: より高度な要件に対しては、カスタムアナライザーを使用することで、トークナイザーとゼロ個以上のフィルターを自分で指定した独自の設定を定義できます。このレベルのカスタマイズは、テキスト処理をきめ細かく制御する必要がある特殊なユースケースに特に役立ちます。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>コレクション作成時にアナライザーの設定を省略した場合、Zilliz Cloudはすべてのテキスト処理にデフォルトで<code>standard</code>アナライザーを使用します。詳細については、<a href="./standard-analyzer">Standard</a>を参照してください。</p></li>
<li><p>検索およびクエリのパフォーマンスを最適化するには、テキストデータの言語に合ったアナライザーを選択してください。たとえば、<code>standard</code>アナライザーは汎用性が高いものの、中国語、日本語、韓国語など、独自の文法構造を持つ言語には必ずしも最適ではありません。このような場合には、<a href="./chinese-analyzer"><code>chinese</code></a>のような言語固有のアナライザーや、<a href="./lindera-tokenizer"><code>lindera</code></a>や<a href="./icu-tokenizer"><code>icu</code></a>などの特殊なトークナイザーとフィルターを組み合わせたカスタムアナライザーを使用することを強く推奨します。これにより、正確なトークン化とより良い検索結果が得られます。</p></li>
</ul>

</Admonition>

### 組み込みアナライザー\{#built-in-analyzer}

Zilliz Cloudクラスター内の組み込みアナライザーは、特定のトークナイザーとフィルターが事前設定されており、これらのコンポーネントを自分で定義せずにすぐに使用できます。各組み込みアナライザーはテンプレートとして機能し、プリセットされたトークナイザーとフィルターを含み、必要に応じてカスタマイズ可能なオプションのパラメーターも備えています。

たとえば、`standard`組み込みアナライザーを使用するには、その名前`standard`を`type`として指定し、必要に応じてこのアナライザー固有の追加設定（例: `stop_words`）を含めるだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
const analyzer_params = {
    "type": "standard", // Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] // Defines a list of common words (stop words) to exclude from tokenization
};
```

</TabItem>

<TabItem value='java'>

```go
analyzerParams := map[string]any{"type": "standard", "stop_words": []string{"a", "an", "for"}}
```

</TabItem>

<TabItem value='java'>

```bash
export analyzerParams='{
       "type": "standard",
       "stop_words": ["a", "an", "for"]
    }'
```

</TabItem>
</Tabs>

アナライザーの実行結果を確認するには、`run_analyzer` メソッドを使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// javascrip# Sample text to analyze
const text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

// Run analyzer
const result = await client.run_analyzer({
    text,
    analyzer_params
});
```

</TabItem>

<TabItem value='java'>

```go
import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

bs, _ := json.Marshal(analyzerParams)
texts := []string{"An efficient system relies on a robust analyzer to correctly process text for various applications."}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParams(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export TEXT_TO_ANALYZE="An efficient system relies on a robust analyzer to correctly process text for various applications."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
  -H "Content-Type: application/json" \
  -d '{
    "text": ["'"${TEXT_TO_ANALYZE}"'"],
    "analyzerParams": "{\"type\":\"standard\",\"stop_words\":[\"a\",\"an\",\"for\"]}"
  }'
```

</TabItem>
</Tabs>

出力は次のようになります。

```plaintext
['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```

これは、アナライザーが入力テキストを適切にトークン化し、ストップワード `"a"`、`"an"`、および `"for"` をフィルタリングしつつ、残りの意味のあるトークンを返すことを示しています。

上記の組み込みアナライザー `standard` の設定は、以下のパラメータで[カスタムアナライザー](./analyzer-overview#custom-analyzer)を設定することと同等です。この場合、同様の機能を実現するために `tokenizer` および `filter` オプションが明示的に定義されています：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{"lowercase", map[string]any{
        "type":       "stop",
        "stop_words": []string{"a", "an", "for"},
    }}}
```

</TabItem>

<TabItem value='java'>

```bash
export analyzerParams='{
       "type": "standard",
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

Zilliz Cloud には、特定のテキスト処理ニーズに合わせて設計された以下の組み込みアナライザーが用意されています。

- `standard`: 汎用的なテキスト処理に適しており、標準的なトークン化と小文字フィルタリングを適用します。

- `english`: 英語テキスト向けに最適化されており、英語のストップワードに対応しています。

- `chinese`: 中国語テキストの処理に特化しており、中国語の言語構造に合わせたトークン化を含みます。

### カスタムアナライザー\{#custom-analyzer}

より高度なテキスト処理を行うには、Zilliz Cloud のカスタムアナライザーを使用して、**トークナイザー**と**フィルター**を指定することで、用途に合わせたテキスト処理パイプラインを構築できます。この設定は、細やかな制御が必要な特殊なユースケースに最適です。

#### トークナイザー\{#tokenizer}

**トークナイザー**はカスタムアナライザーに**必須**のコンポーネントであり、入力テキストを個別の単位（**トークン**）に分割することでアナライザーパイプラインを開始します。トークン化は、ホワイトスペースや句読点による分割など、トークナイザーの種類に応じた特定のルールに従って行われます。これにより、各単語やフレーズをより正確かつ独立的に処理できます。

例えば、トークナイザーはテキスト `"Vector データベース Built for Scale"` を以下のような個別のトークンに変換します：

```plaintext
["Vector", "Database", "Built", "for", "Scale"]
```

**トークナイザーを指定する例**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace",
};
```

</TabItem>

<TabItem value='java'>

```go
analyzerParams = map[string]any{"tokenizer": "whitespace"}
```

</TabItem>

<TabItem value='java'>

```bash
export analyzerParams='{
       "type": "whitespace"
    }'
```

</TabItem>
</Tabs>

#### Filter\{#filter}

**フィルター**はトークナイザーによって生成されたトークンに対して機能する**オプション**のコンポーネントであり、必要に応じてそれらを変換または精製します。たとえば、トークン化された語 `["Vector", "データベース", "Built", "for", "Scale"]` に `lowercase` フィルターを適用すると、結果は次のようになります:

```sql
["vector", "database", "built", "for", "scale"]
```

カスタムアナライザーのフィルターは、設定の必要に応じて**組み込み**または**カスタム**のいずれかになります。

- **組み込みフィルター**: Zilliz Cloud によって事前設定されており、最小限のセットアップで使用できます。これらのフィルターは名前を指定するだけでそのまま利用可能です。以下のフィルターは組み込みフィルターとして直接使用できます：

    - `lowercase`: テキストを小文字に変換し、大文字・小文字を区別しないマッチングを実現します。詳細については、[Lowercase](./lowercase-filter) を参照してください。

    - `asciifolding`: 非 ASCII 文字を ASCII の同等文字に変換し、多言語テキストの処理を簡素化します。詳細については、[ASCII folding](./ascii-folding-filter) を参照してください。

    - `alphanumonly`: 英数字以外の文字を削除し、英数字のみを保持します。詳細については、[アルファnumonly](./alphanumonly-filter) を参照してください。

    - `cnalphanumonly`: 中国語文字、英字、数字以外の文字を含むトークンを削除します。詳細については、[Cnalphanumonly](./cnalphanumonly-filter) を参照してください。

    - `cncharonly`: 非中国語文字を含むトークンを削除します。詳細については、[Cncharonly](./cncharonly-filter) を参照してください。

    **組み込みフィルターの使用例:**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

    <TabItem value='java'>

    ```javascript
    const analyzer_params = {
        "tokenizer": "standard", // Mandatory: Specifies tokenizer
        "filter": ["lowercase"], // Optional: Built-in filter that converts text to lowercase
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
            "filter": []any{"lowercase"}}
    ```

    </TabItem>

    <TabItem value='java'>

    ```bash
    export analyzerParams='{
           "type": "standard",
           "filter":  ["lowercase"]
        }'
    ```

    </TabItem>
    </Tabs>

- **カスタムフィルター**: カスタムフィルターを使用すると、特殊な設定が可能になります。有効なフィルターの種別（`filter.type`）を選択し、各フィルターの種別に応じた具体的な設定を追加することで、カスタムフィルターを定義できます。カスタマイズをサポートするフィルターの種別の例を以下に示します。

    - `stop`: ストップワードのリストを指定して、特定の一般的な単語を削除します（例: `"stop_words": ["of", "to"]`）。詳細については、[Stop](./stop-filter) を参照してください。

    - `length`: トークンの長さに基づいて除外を行います（例: 最大トークン長を設定するなど）。詳細については、[Length](./length-filter) を参照してください。

    - `stemmer`: 単語をその語幹（ルート形）に還元することで、より柔軟なマッチングを実現します。詳細については、[Stemmer](./stemmer-filter) を参照してください。

    **カスタムフィルターの設定例:**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
                put("stop_words", Arrays.asList("a", "an", "for"));
            }}));
    ```

    </TabItem>

    <TabItem value='java'>

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

    <TabItem value='java'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
        "filter": []any{map[string]any{
            "type":       "stop",
            "stop_words": []string{"of", "to"},
        }}}
    ```

    </TabItem>

    <TabItem value='java'>

    ```bash
    export analyzerParams='{
           "type": "standard",
           "filter":  [
           {
                "type": "stop",
                "stop_words": ["a", "an", "for"]
           }
        ]
    }'
    ```

    </TabItem>
    </Tabs>

```java
nlohmann::json analyzer_params = {
    {"type", "standard"},
    {"filter", {{{"type", "stop"}, {"stop_words", {"a", "an", "for"}}}}},
};
```

## 使用例\{#example-use}

この例では、以下の要素を含むコレクションスキーマを作成します。

- 埋め込み（embeddings）用のベクトルフィールド。
- テキスト処理用の2つの `VARCHAR` フィールド：
    - 1つのフィールドは組み込みアナライザーを使用します。
    - もう1つのフィールドはカスタムアナライザーを使用します。

これらの設定をコレクションに組み込む前に、`run_analyzer` メソッドを使って各アナライザーを検証します。

### ステップ 1: MilvusClient の初期化とスキーマの作成\{#step-1-initialize-milvusclient-and-create-schema}

まず、Milvus クライアントをセットアップし、新しいスキーマを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Set up a Milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT"，
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

<TabItem value='java'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

// Set up a Milvus client
const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
);
```

</TabItem>

<TabItem value='java'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)  

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
})
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
defer client.Close(ctx)

schema := entity.NewSchema().WithAutoID(true).WithDynamicFieldEnabled(false)
```

</TabItem>

<TabItem value='java'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export MILVUS_TOKEN="YOUR_CLUSTER_TOKEN"
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/collections/create" \
  -H "Content-Type: application/json" \
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

### ステップ 2: アナライザーの設定を定義および検証する\{#step-2-define-and-verify-analyzer-configurations}

1. **組み込みアナライザー**（`english`）**の設定と検証**:

    - **設定:** 組み込みの英語アナライザー用にアナライザーのパラメータを定義します。

    - **検証:** `run_analyzer` を使用して、設定が期待されるトークン化を生成することを確認します。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

    <TabItem value='java'>

    ```javascript
    // Use a built-in analyzer for VARCHAR field \`title_en\`
    const analyzer_params_built_in = {
      type: "english",
    };
    
    const sample_text = "Milvus simplifies text analysis for search.";
    const result = await client.run_analyzer({
        text: sample_text, 
        analyzer_params: analyzer_params_built_in
    });
    ```

    </TabItem>

    <TabItem value='java'>

    ```go
    analyzerParamsBuiltin := map[string]any{"type": "english"}
    
    bs, _ := json.Marshal(analyzerParamsBuiltin)
    texts := []string{"Milvus simplifies text analysis for search."}
    option := milvusclient.NewRunAnalyzerOption(texts).
        WithAnalyzerParams(string(bs))
    
    result, err := client.RunAnalyzer(ctx, option)
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```bash
    # restful
    export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
    export SAMPLE_TEXT="Milvus simplifies text analysis for search."
    curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
      -H "Content-Type: application/json" \
      -d '{
        "text": ["'"${SAMPLE_TEXT}"'"],
        "analyzerParams": "{\"type\":\"english\"}"
      }'
    ```

    </TabItem>
    </Tabs>

1. **カスタムアナライザーの設定と検証:**

    - **設定:** 標準のトークナイザーと組み込みの lowercase フィルター、およびトークン長とストップワード用のカスタムフィルターを使用するカスタムアナライザーを定義します。

    - **検証:** `run_analyzer` を使用して、カスタム設定が意図通りにテキストを処理することを確認します。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

    <TabItem value='java'>

    ```javascript
    // Configure a custom analyzer for VARCHAR field \`title\`
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
          stop_words: ["of", "to"],
        },
      ],
    };
    const sample_text = "Milvus provides flexible, customizable analyzers for robust text processing.";
    const result = await client.run_analyzer({
        text: sample_text, 
        analyzer_params: analyzer_params_custom
    });
    ```

    </TabItem>

    <TabItem value='java'>

    ```go
    analyzerParamsCustom = map[string]any{"tokenizer": "standard",
        "filter": []any{"lowercase", 
        map[string]any{
            "type": "length",
            "max":  40,
        map[string]any{
            "type": "stop",
            "stop_words": []string{"of", "to"},
        }}}
        
    bs, _ := json.Marshal(analyzerParamsCustom)
    texts := []string{"Milvus provides flexible, customizable analyzers for robust text processing."}
    option := milvusclient.NewRunAnalyzerOption(texts).
        WithAnalyzerParams(string(bs))
    
    result, err := client.RunAnalyzer(ctx, option)
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```bash
    # curl
    export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
    export SAMPLE_TEXT="Milvus provides flexible, customizable analyzers for robust text processing."
    
    # 使用自定义分析器配置
    curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
      -H "Content-Type: application/json" \
      -d '{
        "text": ["'"${SAMPLE_TEXT}"'"],
        "analyzerParams": "{\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",{\"type\":\"length\",\"max\":40},{\"type\":\"stop\",\"stop_words\":[\"of\",\"for\"]}]}"
      }'
    ```

    </TabItem>
    </Tabs>

### ステップ 3: スキーマフィールドにアナライザーを追加する\{#step-3-add-analyzer-to-schema-field}

アナライザーの設定を確認できたので、スキーマフィールドにそれらを追加します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// Create schema
const schema = {
  auto_id: true,
  fields: [
    {
      name: "id",
      type: DataType.INT64,
      is_primary: true,
    },
    {
      name: "title_en",
      data_type: DataType.VARCHAR,
      max_length: 1000,
      enable_analyzer: true,
      analyzer_params: analyzerParamsBuiltIn,
      enable_match: true,
    },
    {
      name: "title",
      data_type: DataType.VARCHAR,
      max_length: 1000,
      enable_analyzer: true,
      analyzer_params: analyzerParamsCustom,
      enable_match: true,
    },
    {
      name: "embedding",
      data_type: DataType.FLOAT_VECTOR,
      dim: 4,
    },
  ],
};
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```bash
# restful
export SCHEMA_CONFIG='{
  "autoId": false,
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

### ステップ 4: インデックスパラメータを準備してコレクションを作成する\{#step-4-prepare-index-parameters-and-create-the-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// Set up index params for vector field
const indexParams = [
  {
    name: "embedding",
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

<TabItem value='java'>

```go
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

<TabItem value='java'>

```bash
export INDEX_PARAMS='[{"fieldName": "embedding", "metricType": "COSINE", "indexType": "AUTOINDEX"}]'
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"collectionName\": \"my_collection\",
    \"schema\": ${SCHEMA_CONFIG},
    \"indexParams\": ${INDEX_PARAMS}
  }"
```

</TabItem>
</Tabs>

## Zilliz Cloud コンソールでの使用例\{#example-use-on-the-zilliz-cloud-console}

上記の操作は、Zilliz Cloud コンソールを使用して実行することもできます。詳細については、以下のデモをご覧ください。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />

<Admonition type="info" icon="📘" title="**Note**">

<p>アナライザー設定は、コレクション作成後は変更できません。アナライザー設定を変更するには、希望する設定で新しいコレクションを作成し、データを<a href="./migrate-between-clusters">移行</a>してください。</p>

</Admonition>

## 次のステップ\{#whats-next}

アナライザーを設定する際は、ユースケースに最も適した設定を決定するために、以下のベストプラクティス記事を読むことをお勧めします。

- [ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case)

アナライザーの設定後、Zilliz Cloud が提供するテキスト検索機能と統合できます。詳細については以下をご覧ください。

- [全文検索](./full-text-search)

- [テキストマッチ](./text-match)

