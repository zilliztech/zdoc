---
title: "アナライザの概要 | Cloud"
slug: /analyzer-overview
sidebar_label: "Overview"
beta: FALSE
notebook: FALSE
description: "テキスト処理において、アナライザーは、生のテキストを構造化された検索可能な形式に変換する重要なコンポーネントです。各アナライザーは通常、2つのコア要素、トークナイザーとフィルターで構成されています。これらを合わせて、入力テキストをトークンに変換し、これらのトークンを改良し、効率的なインデックス作成と検索に備えます。 | Cloud"
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
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# アナライザの概要

テキスト処理において、**アナライザー**は、生のテキストを構造化された検索可能な形式に変換する重要なコンポーネントです。各アナライザーは通常、2つのコア要素、**トークナイザー**と**フィルター**で構成されています。これらを合わせて、入力テキストをトークンに変換し、これらのトークンを改良し、効率的なインデックス作成と検索に備えます。

にZillizクラウドコレクション作成中に、コレクションスキーマに`VARCHAR`フィールドを追加すると、アナライザーが構成されます。アナライザーによって生成されたトークンは、キーワードマッチングのインデックスを構築するために使用することも、全文検索のスパース埋め込みに変換することもできます。詳細については、[テキスト一致](./text-match)または[フルテキスト検索](./full-text-search)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>アナライザーの使用はパフォーマンスに影響を与える可能性があります。</p>
<ul>
<li><p>全文検索:全文検索の場合、DataNodeとQuery Nodeチャンネルはトークン化が完了するのを待たなければならないため、データをより遅く消費します。その結果、新しく取り込まれたデータが検索可能になるまでに時間がかかります。</p></li>
<li><p>キーワードの一致:キーワードの一致において、インデックスの作成も遅くなります。なぜなら、インデックスを構築する前にトークン化が完了する必要があるためです。</p></li>
</ul>

</Admonition>

## アナライザーの解剖学{#anatomy-of-an-analyzer}

アナライザーZillizクラウド正確に1つのトークナイザーとゼロ以上のフィルターで構成されています。

- トークナイザー:トークナイザーは、入力テキストをトークンと呼ばれる離散的な単位に分割します。これらのトークンは、トークナイザーのタイプに応じて単語やフレーズになる可能性があります。

- フィルター:トークンにフィルターを適用して、小文字にしたり、一般的な単語を削除したりすることで、さらに洗練させることができます。

<Admonition type="info" icon="📘" title="ノート">

<p>トークナイザーはUTF-8形式のみをサポートしています。他の形式のサポートは将来のリリースで追加されます。</p>

</Admonition>

以下のワークフローは、アナライザーがテキストを処理する方法を示しています。

![Ke6jw8437hjR8hbZCvEcQtIIn1e](/img/Ke6jw8437hjR8hbZCvEcQtIIn1e.png)

## アナライザーの種類{#analyzer-types}

Zillizクラウド異なるテキスト処理ニーズに対応する2種類のアナライザを提供します

- **ビルトインアナライザー**:これらは、最小限のセットアップで一般的なテキスト処理タスクをカバーする事前定義された構成です。ビルトインアナライザーは、複雑な構成が必要ないため、汎用検索に最適です。

- カスタムアナライザー:より高度な要件に対して、カスタムアナライザーを使用すると、トークナイザーとゼロまたは複数のフィルターの両方を指定して独自の構成を定義できます。このカスタマイズレベルは、テキスト処理に対する正確な制御が必要な特殊なユースケースに特に役立ちます。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>コレクション作成時にアナライザの設定を省略すると、Zillizクラウドデフォルトでは、すべてのテキスト処理に<code>standard</code>アナライザを使用します。詳細については、<a href="./standard-analyzer">スタンダード</a>を参照してください。</p></li>
<li><p>最適な検索とクエリのパフォーマンスを得るために、テキストデータの言語に合ったアナライザを選択してください。たとえば、<code>standard</code>アナライザは多目的ですが、中国語、日本語、韓国語など、独自の文法構造を持つ言語には最適な選択肢ではない場合があります。そのような場合、<code>chinese</code>のような言語固有のアナライザ、または特殊なトークナイザ(<code>lindera</code>、<code>icu</code>など)とフィルタを備えたカスタムアナライザを使用することを強くお勧めします。これにより、正確なトークナイゼーションとより良い検索結果が得られます。</p></li>
</ul>

</Admonition>

### 内蔵アナライザ{#built-in-analyzer}

アナライザが内蔵されていますZilliz Cloudクラスタ特定のトークナイザーとフィルターが事前に設定されているため、これらのコンポーネントを自分で定義する必要がなく、すぐに使用できます。各組み込みアナライザーは、カスタマイズのためのオプションパラメータを備えたプリセットトークナイザーとフィルターを含むテンプレートとして機能します。

たとえば、`standard`組み込みアナライザを使用するには、`standard`という名前を`type`として指定し、必要に応じて`stop_words`など、このアナライザタイプに固有の追加設定を含めます。

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

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] // Defines a list of common words (stop words) to exclude from tokenization
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

アナライザーの実行結果を確認するには、`run_analyzer`メソッドを使用します。

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

<TabItem value='javascript'>

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
```

</TabItem>
</Tabs>

出力は次のようになります:

```plaintext
['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```

これは、ストップワード`"a"`、`"an"`、および`"for"`をフィルタリングして入力テキストを適切にトークン化し、残りの意味のあるトークンを返すことを示しています。

</include>

上記の`standard`組み込みアナライザの設定は、次のパラメータを使用して[カスタムアナライザ](./analyzer-overview#custom-analyzer)を設定するのと同じです。

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

Zillizクラウド以下の組み込みアナライザを提供しており、それぞれ特定のテキスト処理ニーズに対応しています:

- `standard`:汎用テキスト処理に適しており、標準のトークン化と小文字のフィルタリングを適用します。

- `english`:英語のテキストに最適化され、英語のストップワードをサポートしています。

- `chinese`:中国語テキストの処理に特化しており、中国語の言語構造に適応したトークン化も含まれています。

### カスタムアナライザ{#custom-analyzer}

より高度なテキスト処理には、カスタムアナライザが必要ですZillizクラウドトークナイザーとフィルターの両方を指定することで、カスタマイズされたテキスト処理パイプラインを構築できます。この設定は、正確な制御が必要な特殊なユースケースに最適です。

#### トークナイザー{#tokenizer}

トークナイザーは、カスタムアナライザーの必須コンポーネントであり、入力テキストを離散的な単位またはトークンに分解してアナライザーパイプラインを開始します。トークナイザーの種類に応じて、空白や句読点による分割など、特定のルールに従ってトークナイザーを分割します。この過程により、各単語やフレーズのより正確で独立した処理が可能になります。

例えば、トークナイザーはテキスト`"Vector Database Built for Scale"`を別々のトークンに変換します。

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

#### フィルター{#filter}

**フィルター**は、トークナイザーによって生成されたトークンを必要に応じて変換または改良する**オプション**コンポーネントです。たとえば、トークン化された用語`["Vector", "Database", "Built", "for", "Scale"]`に`lowercase`フィルターを適用した後、結果は次のようになります:

```sql
["vector", "database", "built", "for", "scale"]
```

カスタムアナライザーのフィルターは、構成のニーズに応じて、**組み込み**または**カスタム**のいずれかになります。

- **組み込みフィルタ**:事前に設定されていますZillizクラウド最小限の設定が必要です。これらのフィルタは、名前を指定することでそのまま使用できます。以下のフィルタは、直接使用するために組み込まれています

    - `lowercase`:テキストを小文字に変換し、大文字小文字を区別せずに一致させます。詳細については、[小文字](./lowercase-filter)を参照してください。

    - `asciifolding`:非ASCII文字をASCII文字に変換し、多言語テキストの処理を簡素化します。詳細については、[ASCII折りたたみ](./ascii-folding-filter)を参照してください。

    - `alphanumonly`:英数字のみを削除して保持します。詳細については、[Alphanumonlyという名前です。](./alphanumonly-filter)を参照してください。

    - `cnalphanumonly`:漢字、英字、数字以外の文字を含むトークンを削除します。詳細については、[Cnalphanumonly](./cnalphanumonly-filter)を参照してください。

    - `cncharonly`:中国語以外の文字を含むトークンを削除します。詳細については、[Cncharonly](./cncharonly-filter)を参照してください。

    **組み込みフィルタの使用例:**

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

    <TabItem value='javascript'>

    ```javascript
    const analyzer_params = {
        "tokenizer": "standard", // Mandatory: Specifies tokenizer
        "filter": ["lowercase"], // Optional: Built-in filter that converts text to lowercase
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

- カスタムフィルター:カスタムフィルターにより、特殊な設定が可能になります。有効なフィルタータイプ(`filter.type`)を選択し、各フィルタータイプに特定の設定を追加することで、カスタムフィルターを定義できます。カスタマイズをサポートするフィルタータイプの例:

    - `stop`:ストップワードのリストを設定することで、指定された一般的な単語を削除します（例:「stop_words」: ["of","to"]')を参照してください。詳細については、[Stop]を参照してください。](./stop-filter)）。

    - `length`:最大トークン長の設定など、長さの基準に基づいてトークンを除外します。詳細については、[長さ](./length-filter)を参照してください。

    - `stemmer`:より柔軟なマッチングのために、単語をルート形式に縮小します。詳細については、[ステマー](./stemmer-filter)を参照してください。

    **カスタムフィルタの設定例:**

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

## 使用例の例{#example-use}

この例では、以下を含むコレクションスキーマを作成します:

- 埋め込みのためのベクトル場。

- テキスト処理のための2つの`VARCHAR`フィールド:

    - 1つのフィールドは内蔵アナライザを使用しています。

    - もう一方はカスタムアナライザーを使用しています。

これらの設定をコレクションに組み込む前に、`run_analyzer`メソッドを使用して各アナライザを検証します。

</include>

### ステップ1: MilvusClientを初期化し、スキーマを作成する{#step-1-initialize-milvusclient-and-create-schema}

Milvusクライアントを設定し、新しいスキーマを作成してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Set up a Milvus client
client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

// Create schema
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(false)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

// Set up a Milvus client
const client = new MilvusClient("YOUR_CLUSTER_ENDPOINT");
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
```

</TabItem>
</Tabs>

### ステップ2:アナライザの設定を定義して検証する{#step-2-define-and-verify-analyzer-configurations}

1. **組み込みアナライザの設定と検証**(`english`)**:**

    - **構成:**内蔵英語アナライザのアナライザパラメータを定義します。

    - 検証: `run_analyzer`を使用して、構成が期待されるトークン化を生成することを確認してください。

    </include>

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Built-in analyzer configuration for English text processing
    analyzer_params_built_in = {
        "type": "english"
    }
    
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    Map<String, Object> analyzerParamsBuiltin = new HashMap<>();
    analyzerParamsBuiltin.put("type", "english");

    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Use a built-in analyzer for VARCHAR field `title_en`
    const analyzerParamsBuiltIn = {
      type: "english",
    };

    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams := map[string]any{"type": "english"}

    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # restful
    ```

    </TabItem>
    </Tabs>

1. **カスタムアナライザの設定と検証:**

    - **構成:**標準トークナイザーと組み込みの小文字フィルター、トークンの長さとストップワードのカスタムフィルターを使用するカスタムアナライザーを定義してください。

    - 検証: `run_analyzer`を使用して、カスタム構成が意図した通りにテキストを処理することを確認してください。

    </include>

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
    
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Configure a custom analyzer
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
    // Configure a custom analyzer for VARCHAR field `title`
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
    ```

    </TabItem>
    </Tabs>

### ステップ3:スキーマにフィールドを追加する{#step-3-add-fields-to-the-schema}

アナライザの設定を確認したら、スキーマフィールドに追加してください。

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
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .analyzerParams(analyzerParams)
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

<TabItem value='javascript'>

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
```

</TabItem>
</Tabs>

### ステップ4:インデックスパラメータを準備し、コレクションを作成する{#step-4-prepare-index-parameters-and-create-the-collection}

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

<TabItem value='javascript'>

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
# restful
```

</TabItem>
</Tabs>