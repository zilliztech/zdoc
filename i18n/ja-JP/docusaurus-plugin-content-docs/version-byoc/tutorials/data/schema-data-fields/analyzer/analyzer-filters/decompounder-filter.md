---
title: "Decompounder | BYOC"
slug: /decompounder-filter
sidebar_key: decompounder-filter
sidebar_label: "Decompounder"
beta: FALSE
notebook: FALSE
description: "`decompounder` フィルターは、指定された辞書に基づいて複合語を個別の構成要素に分割し、複合語の一部を検索しやすくします。このフィルターは、ドイツ語のように複合語を頻繁に使用する言語で特に役立ちます。構成要素の辞書は、`wordlist` パラメーターを通じてインラインで提供するか、`wordlistfile` パラメーターを通じて登録済みファイルリソースから読み込むことができます。| BYOC"
type: origin
token: DDrHwdsb7idJa9kVU6zc2VwInBf
sidebar_position: 8
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - decompounder

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decompounder

`decompounder` フィルターは、指定された辞書に基づいて複合語を個別の構成要素に分割し、複合語の一部を検索しやすくします。このフィルターは、ドイツ語のように複合語を頻繁に使用する言語で特に役立ちます。構成要素の辞書は、`word_list` パラメーターを通じてインラインで提供するか、`word_list_file` パラメーターを通じて [登録済みファイルリソース](./undefined) から読み込むことができます。

## 設定\{#configuration}

`decompounder` フィルターは、構成要素の辞書を `word_list` パラメーターを通じてインラインで受け取るか、`word_list_file` パラメーターを通じて登録済みファイルリソースから受け取ります。

### Inline word list\{#inline-word-list}

`decompounder` フィルターは Zilliz Cloud のカスタムフィルターです。使用するには、フィルター設定で `"type": "decompounder"` を指定し、認識する単語の構成要素の辞書を提供する `word_list` パラメーターを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", # Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "decompounder");
                    put("word_list", Arrays.asList("dampf", "schiff", "fahrt", "brot", "backen", "automat"));
                }}
        )
);
```

</TabItem>

<TabItem value='java'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", // Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
};
```

</TabItem>

<TabItem value='java'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "decompounder",
        "word_list": []string{"dampf", "schiff", "fahrt", "brot", "backen", "automat"},
    }}}
```

</TabItem>

<TabItem value='java'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "decompounder",
      "word_list": [
        "dampf",
        "schiff",
        "fahrt",
        "brot",
        "backen",
        "automat"
      ]
    }
  ]
}'

```

</TabItem>
</Tabs>

`decompounder` フィルターは、以下の設定可能なパラメーターを受け付けます。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>word_list</code></p></td>
     <td><p>複合語を分割するために使用される単語構成要素のリストです。この辞書により、複合語が個別の用語に分解される方法が決定されます。</p></td>
   </tr>
</table>

`decompounder` フィルターはトークナイザーによって生成された用語に対して動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloud で利用可能なトークナイザーの一覧については、[トークナイザーリファレンス](./analyzer-tokenizers) を参照してください。

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` フィールドにこれらを適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを実行できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

### ファイルリソースから単語構成要素を読み込む | プライベートプレビュー\{#load-word-components-from-a-file-resource}

大規模な構成要素辞書（特に完全な言語の単語リストなど）の場合、構成要素をファイルに保存し、そのファイルをリモートファイルリソースとして登録してから、`word_list_file` パラメーターを通じてフィルターから参照します。`word_list_file` を単独で使用することも、インラインの `word_list` と併用することも可能です。両方が設定されている場合、フィルターはこれら 2 つのソースを単一の構成要素リストにマージします。

ファイルは UTF‑8 のプレーンテキストであり、**1 行に 1 つの構成要素単語**を含みます。例：

```plaintext
dampf
schiff
fahrt
brot
backen
automat
```

ファイルを Milvus クラスターが使用するように構成されているオブジェクトストアにアップロードし、その後登録します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Register the uploaded file under a name you'll reference from analyzer configs.
client.add_file_resource(
    name="de_components",
    path="file/decompounder.txt",    # full S3 object key, including the rootPath prefix
)
```

`word_list_file` を使用して、フィルター内で登録済みリソースを参照します。

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [{
        "type": "decompounder",
        "word_list_file": {
            "type": "remote",
            "resource_name": "de_components",
            "file_name": "decompounder.txt",
        },
    }],
}
```

`word_list_file` パラメータは、以下のフィールドを持つオブジェクトを受け付けます：

<table>
   <tr>
     <th><p><strong>Field</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>The resource type. Use <code>"remote"</code> for a file registered via <code>add_file_resource</code>. For the <code>"local"</code> variant used in self-hosted deployments, refer to <a href="./undefined">Manage File リソース</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>resource_name</code></p></td>
     <td><p>The name used when the file was registered with <code>add_file_resource</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>file_name</code></p></td>
     <td><p>The filename portion of the registered resource's object-store path (for example, <code>"decompounder.txt"</code> if the resource was registered with <code>path="file/decompounder.txt"</code>).</p></td>
   </tr>
</table>

## Examples\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", # Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "decompounder");
                    put("word_list", Arrays.asList("dampf", "schiff", "fahrt", "brot", "backen", "automat"));
                }}
        )
);
```

</TabItem>

<TabItem value='java'>

```javascript
// javascript
```

</TabItem>

<TabItem value='java'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "decompounder",
        "word_list": []string{"dampf", "schiff", "fahrt", "brot", "backen", "automat"},
    }}}
```

</TabItem>

<TabItem value='java'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "decompounder",
      "word_list": [
        "dampf",
        "schiff",
        "fahrt",
        "brot",
        "backen",
        "automat"
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Sample text to analyze
sample_text = "dampfschifffahrt brotbackautomat"

# Run the standard analyzer with the defined configuration
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
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("dampfschifffahrt brotbackautomat");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='java'>

```javascript
// javascript
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

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"dampfschifffahrt brotbackautomat"}
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
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['dampf', 'schiff', 'fahrt', 'brotbackautomat']
```

