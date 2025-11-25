---
title: "アナライザー概要 | Cloud"
slug: /analyzer-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "テキスト処理において、アナライザーは生のテキストを構造化された検索可能な形式に変換する重要なコンポーネントです。各アナライザーは通常、2つのコア要素から構成されます：トークナイザーとフィルター。これらは一緒に、入力テキストをトークンに変換し、これらのトークンを洗練させて、効率的なインデックス作成と検索の準備を行います。 | Cloud"
type: origin
token: H8MVwnjdgihp0hkRHHKcjBe9n5e
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer explained
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# アナライザー概要

テキスト処理において、**アナライザー**は生のテキストを構造化された検索可能な形式に変換する重要なコンポーネントです。各アナライザーは通常、2つのコア要素から構成されます：**トークナイザー**と**フィルター**。これらは一緒に、入力テキストをトークンに変換し、これらのトークンを洗練させて、効率的なインデックス作成と検索の準備を行います。

Zilliz Cloudでは、アナライザーはコレクション作成時に`VARCHAR`フィールドをコレクションスキーマに追加する際に設定されます。アナライザーによって生成されたトークンは、キーワード一致用のインデックス構築に使用したり、全文検索用のスパース埋め込みに変換できます。詳細については、[全文検索](./full-text-search)または[テキストマッチ](./text-match)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>アナライザーの使用はパフォーマンスに影響を与える可能性があります:</p>
<ul>
<li><p><strong>全文検索:</strong> 全文検索では、<strong>DataNode</strong>と<strong>QueryNode</strong>チャンネルがトークナイズが完了するのを待つ必要があるため、データ消費がより遅くなります。その結果、 newly取り込まれたデータが検索可能になるまでに時間がかかります。</p></li>
<li><p><strong>キーワードマッチ:</strong> キーワードマッチでは、インデックス作成はトークナイズが完了してインデックスを構築できるようになるまで遅くなります。</p></li>
</ul>

</Admonition>

## アナライザーの構造\{#anatomy-of-an-analyzer}

Zilliz Cloudのアナライザーは、正確に1つの**トークナイザー**と**0個以上**のフィルターで構成されています。

- **トークナイザー**: トークナイザーは、入力テキストをトークンと呼ばれる離散単位に分解します。これらのトークンは、トークナイザーの種類に応じて単語や語句になります。

- **フィルター**: フィルターは、トークンをさらに洗練するために適用され、たとえば小文字に変換したり、一般的な単語を削除したりできます。

<Admonition type="info" icon="📘" title="注意">

<p>トークナイザーはUTF-8形式のみをサポートします。他の形式のサポートは将来のリリースで追加される予定です。</p>

</Admonition>

以下は、アナライザーがテキストを処理するワークフローを示しています。

![Ke6jw8437hjR8hbZCvEcQtIIn1e](/img/Ke6jw8437hjR8hbZCvEcQtIIn1e.png)

## アナライザーの種類\{#analyzer-types}

Zilliz Cloudは、異なるテキスト処理ニーズを満たすために2種類のアナライザーを提供します:

- **組み込みアナライザー**: これらは一般的なテキスト処理作業をカバーするための事前定義された構成で、最小限のセットアップで済みます。組み込みアナライザーは、特殊な構成を必要としない一般的な検索に最適です。

- **カスタムアナライザー**: より高度な要件向けに、カスタムアナライザーでは、トークナイザーと0個以上のフィルターを指定して独自の構成を定義できます。このレベルのカスタマイズは、テキスト処理の正確な制御が必要な特殊なケースで特に役立ちます。

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p>コレクション作成時にアナライザー構成を省略すると、Zilliz Cloudはすべてのテキスト処理にデフォルトで<code>standard</code>アナライザーを使用します。詳細については、<a href="./standard-analyzer">Standard</a>を参照してください。</p></li>
<li><p>最適な検索およびクエリのパフォーマンスを得るには、テキストデータの言語に合ったアナライザーを選択することをお勧めします。たとえば、<code>standard</code>アナライザーは多用途に使用できますが、中国語、日本語、韓国語などの独特な文法構造を持つ言語には最適ではない場合があります。このような場合は、<a href="./chinese-analyzer"><code>chinese</code></a>などの言語固有のアナライザー、または特殊なトークナイザー（<a href="./lindera-tokenizer"><code>lindera</code></a>、<a href="./icu-tokenizer"><code>icu</code></a>など）とフィルターを備えたカスタムアナライザーを使用することを強く推奨します。</p></li>
</ul>

</Admonition>

### 組み込みアナライザー\{#built-in-analyzer}

Zilliz Cloudクラスタの組み込みアナライザーは、特定のトークナイザーとフィルターで事前構成されており、これらのコンポーネントを自分で定義する必要なくすぐに使用できます。各組み込みアナライザーは、事前設定されたトークナイザーとフィルターを含むテンプレートとして機能し、カスタマイズ用のオプションパラメーターが含まれます。

たとえば、`standard`組み込みアナライザーを使用するには、単にその名前`standard`を`type`として指定し、オプションでこのアナライザー種別固有の追加構成（`stop_words`など）を含めます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # 標準組み込みアナライザーを使用
    "stop_words": ["a", "an", "for"] # トークナイズから除外する一般単語（ストップワード）のリストを定義
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

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // 標準組み込みアナライザーを使用
    "stop_words": ["a", "an", "for"] // トークナイズから除外する一般単語（ストップワード）のリストを定義
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "standard", "stop_words": []string{"a", "an", "for"}}
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

アナライザーの実行結果を確認するには、`run_analyzer`メソッドを使用します:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 分析するサンプルテキスト
text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

# アナライザーを実行
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

<TabItem value='javascript'>

```javascript
// javascript# 分析するサンプルテキスト
const text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

// アナライザーを実行
const result = await client.run_analyzer({
    text,
    analyzer_params
});
```

</TabItem>

<TabItem value='go'>

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

<TabItem value='bash'>

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

出力は以下のようになります:

```plaintext
['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```

これは、アナライザーが入力テキストを正しくトークナイズし、ストップワード`"a"`、`"an"`、および`"for"`をフィルター処理して、残りの意味のあるトークンを返していることを示しています。

上記の`standard`組み込みアナライザーの構成は、[カスタムアナライザー](./analyzer-overview#custom-analyzer)を以下のようにパラメーター設定した場合と同等です。`tokenizer`と`filter`オプションが明示的に定義され、同様の機能を実現しています:

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

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{"lowercase", map[string]any{
        "type":       "stop",
        "stop_words": []string{"a", "an", "for"},
    }}}
```

</TabItem>

<TabItem value='bash'>

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

Zilliz Cloudは、以下の組み込みアナライザーを提供しており、それぞれ特定のテキスト処理ニーズに合わせて設計されています：

- `standard`: 一般的なテキスト処理に適しており、標準的なトークナイズと小文字フィルタリングを適用。

- `english`: 英語テキストに最適化されており、英語のストップワードをサポート。

- `chinese`: 中国語テキスト処理に特化し、中国語の言語構造に適したトークナイズを含む。

### カスタムアナライザー\{#custom-analyzer}

高度なテキスト処理では、Zilliz Cloudのカスタムアナライザーにより、**トークナイザー**と**フィルター**を指定することで、カスタマイズされたテキスト処理パイプラインを構築できます。このセットアップは、正確な制御が必要な特殊なケースに理想的です。

#### トークナイザー\{#tokenizer}

**トークナイザー**はカスタムアナライザーに**必須**のコンポーネントであり、アナライザーのパイプラインを開始して入力テキストを離散単位または**トークン**に分解します。トークナイズは、空白や句読点による分割などの特定のルールに従います。このプロセスにより、各単語や語句のより正確で独立した処理が可能になります。

たとえば、トークナイザーはテキスト`"Vector Database Built for Scale"`を個別のトークンに変換します:

```plaintext
["Vector", "Database", "Built", "for", "Scale"]
```

**トークナイザーの指定例**:

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

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace",
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "whitespace"}
```

</TabItem>

<TabItem value='bash'>

```bash
export analyzerParams='{
       "type": "whitespace"
    }'
```

</TabItem>
</Tabs>

#### フィルター\{#filter}

**フィルター**はトークナイザーが生成したトークンに対して、必要に応じて変換または洗練を行う**オプション**コンポーネントです。たとえば、`lowercase`フィルターをトークン化された語句`["Vector", "Database", "Built", "for", "Scale"]`に適用すると、結果は以下のようになります:

```sql
["vector", "database", "built", "for", "scale"]
```

カスタムアナライザーのフィルターは、構成の必要に応じて**組み込み**または**カスタム**のいずれかです。

- **組み込みフィルター**: Zilliz Cloudによって事前構成され、最小限のセットアップで済みます。これらのフィルターは名前を指定するだけでそのまま使用できます。以下のフィルターは使用可能な組み込みフィルターです：

    - `lowercase`: テキストを小文字に変換し、大文字小文字を区別しないマッチングを保証。詳細については、[Lowercase](./lowercase-filter)を参照。

    - `asciifolding`: 非ASCII文字をASCII相当に変換し、多言語テキスト処理を簡素化。詳細については、[ASCII folding](./ascii-folding-filter)を参照。

    - `alphanumonly`: 他の文字を削除して英数字のみを保持。詳細については、[Alphanumonly](./alphanumonly-filter)を参照。

    - `cnalphanumonly`: 中国語文字、英語の文字、または数字以外の文字を含むトークンを削除。詳細については、[Cnalphanumonly](./cnalphanumonly-filter)を参照。

    - `cncharonly`: 非中国語文字を含むトークンを削除。詳細については、[Cncharonly](./cncharonly-filter)を参照。

    **組み込みフィルター使用例:**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    analyzer_params = {
        "tokenizer": "standard", # 必須: トークナイザーを指定
        "filter": ["lowercase"], # オプション: テキストを小文字に変換する組み込みフィルター
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

    <TabItem value='javascript'>

    ```javascript
    const analyzer_params = {
        "tokenizer": "standard", // 必須: トークナイザーを指定
        "filter": ["lowercase"], // オプション: テキストを小文字に変換する組み込みフィルター
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
            "filter": []any{"lowercase"}}
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export analyzerParams='{
           "type": "standard",
           "filter":  ["lowercase"]
        }'
    ```

    </TabItem>
    </Tabs>

- **カスタムフィルター**: カスタムフィルターにより特別な構成が可能になります。有効なフィルター種類（`filter.type`）を選択し、各フィルター種類に特定の設定を追加することで、カスタムフィルターを定義できます。カスタマイズをサポートするフィルター種類の例：

    - `stop`: ストップワードのリスト（例：`"stop_words": ["of", "to"]`）を設定して指定された一般単語を削除。詳細については、[Stop](./stop-filter)を参照。

    - `length`: 最大トークン長などの長さ基準に基づいてトークンを除外。詳細については、[Length](./length-filter)を参照。

    - `stemmer`: より柔軟なマッチングのために単語をルート形式に縮小。詳細については、[Stemmer](./stemmer-filter)を参照。

    **カスタムフィルター構成例:**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    analyzer_params = {
        "tokenizer": "standard", # 必須: トークナイザーを指定
        "filter": [
            {
                "type": "stop", # フィルター種類として'stop'を指定
                "stop_words": ["of", "to"], # このフィルター種類のストップワードをカスタマイズ
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

    <TabItem value='javascript'>

    ```javascript
    const analyzer_params = {
        "tokenizer": "standard", // 必須: トークナイザーを指定
        "filter": [
            {
                "type": "stop", // フィルター種類として'stop'を指定
                "stop_words": ["of", "to"], // このフィルター種類のストップワードをカスタマイズ
            }
        ]
    };
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

    <TabItem value='bash'>

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

## 使用例\{#example-use}

この例では、以下の要素を含むコレクションスキーマを作成します：

- 埋め込み用のベクトルフィールド。

- テキスト処理用の2つの`VARCHAR`フィールド：

    - 一方のフィールドは組み込みアナライザーを使用。

    - もう一方のフィールドはカスタムアナライザーを使用。

これらの構成をコレクションに組み込む前に、`run_analyzer`メソッドを使用して各アナライザーを検証します。

### ステップ1: MilvusClientを初期化し、スキーマを作成\{#step-1-initialize-milvusclient-and-create-schema}

まず、Milvusクライアントを設定して新しいスキーマを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Milvusクライアントを設定
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT"，
    token="YOUR_CLUSTER_TOKEN"
)

# 新しいスキーマを作成
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

// Milvusクライアントを設定
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

// スキーマを作成
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(false)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

// Milvusクライアントを設定
const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
);
```

</TabItem>

<TabItem value='go'>

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

<TabItem value='bash'>

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

### ステップ2: アナライザー構成を定義および検証\{#step-2-define-and-verify-analyzer-configurations}

1. **組み込みアナライザー**（`english`）**の構成と検証**：

    - **構成**：組み込み英語アナライザーのアナライザー パラメーターを定義。

    - **検証**：`run_analyzer`を使用して、構成が期待されるトークナイズを生成するかを確認。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # 英語テキスト処理用の組み込みアナライザー構成
    analyzer_params_built_in = {
        "type": "english"
    }
    # 組み込みアナライザー構成の検証
    sample_text = "Milvus simplifies text analysis for search."
    result = client.run_analyzer(sample_text, analyzer_params_built_in)
    print("Built-in analyzer output:", result)

    # 期待する出力:
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
            .analyzerParams(analyzerParams)
            .build());
    List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // VARCHARフィールド`title_en`用の組み込みアナライザーの使用
    const analyzerParamsBuiltIn = {
      type: "english",
    };

    const sample_text = "Milvus simplifies text analysis for search.";
    const result = await client.run_analyzer({
        text: sample_text,
        analyzer_params: analyzer_params_built_in
    });
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams := map[string]any{"type": "english"}

    bs, _ := json.Marshal(analyzerParams)
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

    <TabItem value='bash'>

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

1. **カスタムアナライザーの構成と検証**：

    - **構成**：標準トークナイザーとカスタムフィルターを含むカスタムアナライザー構成。

    - **検証**：`run_analyzer`を使用して、カスタム構成が意図した通りにテキスト処理を行うことを確認。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # 標準トークナイザーとカスタムフィルターを含むカスタムアナライザー構成
    analyzer_params_custom = {
        "tokenizer": "standard",
        "filter": [
            "lowercase",  # 組み込みフィルター: トークンを小文字に変換
            {
                "type": "length",  # カスタムフィルター: トークン長を制限
                "max": 40
            },
            {
                "type": "stop",  # カスタムフィルター: 指定されたストップワードを削除
                "stop_words": ["of", "for"]
            }
        ]
    }

    # カスタムアナライザー構成を検証
    sample_text = "Milvus provides flexible, customizable analyzers for robust text processing."
    result = client.run_analyzer(sample_text, analyzer_params_custom)
    print("Custom analyzer output:", result)

    # 期待する出力:
    # Custom analyzer output: ['milvus', 'provides', 'flexible', 'customizable', 'analyzers', 'robust', 'text', 'processing']
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // カスタムアナライザーを構成
    Map<String, Object> analyzerParams = new HashMap<>();
    analyzerParams.put("tokenizer", "standard");
    analyzerParams.put("filter",
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
            .analyzerParams(analyzerParams)
            .build());
    List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // VARCHARフィールド`title`用のカスタムアナライザー構成
    const analyzerParamsCustom = {
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
        analyzer_params: analyzer_params_built_in
    });
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
        "filter": []any{"lowercase",
        map[string]any{
            "type": "length",
            "max":  40,
        map[string]any{
            "type": "stop",
            "stop_words": []string{"of", "to"},
        }}}

    bs, _ := json.Marshal(analyzerParams)
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

    <TabItem value='bash'>

    ```bash
    # curl
    export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
    export SAMPLE_TEXT="Milvus provides flexible, customizable analyzers for robust text processing."

    # カスタムアナライザー構成の使用
    curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
      -H "Content-Type: application/json" \
      -d '{
        "text": ["'"${SAMPLE_TEXT}"'"],
        "analyzerParams": "{\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",{\"type\":\"length\",\"max\":40},{\"type\":\"stop\",\"stop_words\":[\"of\",\"for\"]}]}"
      }'
    ```

    </TabItem>
    </Tabs>

### ステップ3: スキーマフィールドにアナライザーを追加\{#step-3-add-analyzer-to-schema-field}

アナライザー構成を検証したので、スキーマフィールドに追加します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 組み込みアナライザー構成を使用するVARCHARフィールド'title_en'を追加
schema.add_field(
    field_name='title_en',
    datatype=DataType.VARCHAR,
    max_length=1000,
    enable_analyzer=True,
    analyzer_params=analyzer_params_built_in,
    enable_match=True,
)

# カスタムアナライザー構成を使用するVARCHARフィールド'title'を追加
schema.add_field(
    field_name='title',
    datatype=DataType.VARCHAR,
    max_length=1000,
    enable_analyzer=True,
    analyzer_params=analyzer_params_custom,
    enable_match=True,
)

# 埋め込み用のベクトルフィールドを追加
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=3)

# 主キー用フィールドを追加
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .analyzerParams(analyzerParams)
        .enableMatch(true) // TextMatchを使用する場合は有効にする必要があります
        .build());

// ベクトルフィールドを追加
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(3)
        .build());
// 主フィールドを追加
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// スキーマ作成
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
    WithName("title").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(1000).
    WithEnableAnalyzer(true).
    WithAnalyzerParams(analyzerParams).
    WithEnableMatch(true),
)
```

</TabItem>

<TabItem value='bash'>

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

### ステップ4: インデックスパラメーターを準備し、コレクションを作成\{#step-4-prepare-index-parameters-and-create-the-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# ベクトルフィールドのインデックスパラメーターを設定
index_params = client.prepare_index_params()
index_params.add_index(field_name="embedding", metric_type="COSINE", index_type="AUTOINDEX")

# 定義されたスキーマとインデックスパラメーターでコレクションを作成
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
// ベクトルフィールドのインデックスパラメーターを設定
List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());

// 定義されたスキーマでコレクションを作成
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// ベクトルフィールドのインデックスパラメーターを設定
const indexParams = [
  {
    name: "embedding",
    metric_type: "COSINE",
    index_type: "AUTOINDEX",
  },
];

// 定義されたスキーマでコレクションを作成
await client.createCollection({
  collection_name: "my_collection",
  schema: schema,
  index_params: indexParams,
});

console.log("Collection created successfully!");
```

</TabItem>

<TabItem value='go'>

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

<TabItem value='bash'>

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

## Zilliz Cloudコンソールでの使用例\{#example-use-on-the-zilliz-cloud-console}

Zilliz Cloudコンソールを使用して上記の操作を実行することもできます。詳細については、以下のデモを再生してください。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />

## 次のステップ\{#whats-next}

アナライザーを構成する際には、以下のベストプラクティス記事を読むことを推奨します。使用事例に最も適した構成を決定できます：

- [使用事例に適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case)

アナライザーを構成した後は、Zilliz Cloudが提供するテキスト検索機能と統合できます。詳細については：

- [全文検索](./full-text-search)

- [テキストマッチ](./text-match)
