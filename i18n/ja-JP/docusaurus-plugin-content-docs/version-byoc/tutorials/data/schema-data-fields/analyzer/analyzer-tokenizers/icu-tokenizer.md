---
title: "ICU | BYOC"
slug: /icu-tokenizer
sidebar_label: "ICU"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`icu`トークナイザーは、ソフトウェアの国際化のための主要ツールを提供するInternationalization Components of Unicodeオープンソースプロジェクトに基づいて構築されています。ICUの語句分割アルゴリズムを使用することで、このトークナイザーは世界中の多数の言語のテキストを正確に単語に分割できます。| BYOC"
type: origin
token: Q3gKwc5lkilAbKkalCWcW2AbnLe
sidebar_position: 5
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - icu-tokenizer
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ICU

`icu`トークナイザーは、[Internationalization Components of Unicode](http://site.icu-project.org/)（ICU）オープンソースプロジェクトに基づいて構築されており、ソフトウェアの国際化のための主要ツールを提供します。ICUの語句分割アルゴリズムを使用することで、このトークナイザーは世界中の多数の言語のテキストを正確に単語に分割できます。

<Admonition type="info" icon="📘" title="注意">

<p><code>icu</code>トークナイザーは、句読点記号とスペースを出力内の独立したトークンとして保持します。例えば、<code>"Привет! Как дела?"</code>は<code>["Привет", "!", " ", "Как", " ", "дела", "?"]</code>になります。これらの独立した句読点トークンを削除するには、<a href="./remove-punct-filter"><code>removepunct</code></a>フィルターを使用してください。</p>

</Admonition>

## 構成\{#configuration}

`icu`トークナイザーを使用したアナライザーを構成するには、`analyzer_params`で`tokenizer`を`icu`に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "icu"}
```

</TabItem>

<TabItem value='bash'>

```bash
# curl
```

</TabItem>
</Tabs>

`icu`トークナイザーは、1つまたは複数のフィルターと連携して動作できます。例えば、以下のコードは`icu`トークナイザーと[句読点削除フィルター](./remove-punct-filter)を使用するアナライザーを定義しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["removepunct"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
analyzerParams.put("filter", Collections.singletonList("removepunct"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "icu", "filter": []string{"removepunct"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# curl
```

</TabItem>
</Tabs>

`analyzer_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用できます。これにより、Zilliz Cloudは、指定されたアナライザーを使用してそのフィールド内のテキストを効率的にトークン化およびフィルタリング処理できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

コレクションスキーマにアナライザー構成を適用する前に、`run_analyzer`メソッドを使用してその動作を検証してください。

### アナライザー構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "icu"}
```

</TabItem>

<TabItem value='bash'>

```bash
# curl
```

</TabItem>
</Tabs>

### `run_analyzer`を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 解析するサンプルテキスト
sample_text = "Привет! Как дела?"

# 定義された構成でstandardアナライザーを実行
result = client.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("Привет! Как дела?");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
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

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"Привет! Как дела?"}
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

### 期待される出力\{#expected-output}

```plaintext
['Привет', '!', ' ', 'Как', ' ', 'дела', '?']
```
