---
title: "Jieba | BYOC"
slug: /jieba-tokenizer
sidebar_label: "Jieba"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`jieba`トークナイザーは、中国語テキストを構成単語に分割することで処理します。| BYOC"
type: origin
token: JGURwBQNOijp2DkspFFctbAGnLh
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - jieba-tokenizer
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

`jieba`トークナイザーは、中国語テキストを構成単語に分割することで処理します。

<Admonition type="info" icon="📘" title="注意">

<p><code>jieba</code>トークナイザーは、句読点記号を出力内の独立したトークンとして保持します。例えば、<code>"你好！世界。"</code>は<code>["你好", "！", "世界", "。"]</code>になります。これらの独立した句読点トークンを削除するには、<a href="./remove-punct-filter"><code>removepunct</code></a>フィルターを使用してください。</p>

</Admonition>

## 構成\{#configuration}

Milvusは`jieba`トークナイザーの2つの構成方法をサポートしています：シンプル構成とカスタム構成です。

### シンプル構成\{#simple-configuration}

シンプル構成では、トークナイザーを`"jieba"`に設定するだけで済みます。例えば：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# シンプル構成：トークナイザー名のみを指定
analyzer_params = {
    "tokenizer": "jieba",  # デフォルト設定を使用：dict=["_default_"], mode="search", hmm=True
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "jieba"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba"
}'
```

</TabItem>
</Tabs>

このシンプル構成は、以下のカスタム構成と同等です：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 上記のシンプル構成と同等のカスタム構成
analyzer_params = {
    "type": "jieba",          # トークナイザーの種類、固定で"jieba"
    "dict": ["_default_"],     # デフォルト辞書を使用
    "mode": "search",          # 検索モードを使用してリコール率を向上（詳細はモード参照）
    "hmm": True                # HMMを有効にして確率的セグメンテーションを実行
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("_default_"));
analyzerParams.put("mode", "search");
analyzerParams.put("hmm", true);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"_default_"}, "mode": "search", "hmm": true}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

パラメータの詳細については、[カスタム構成](./jieba-tokenizer#custom-configuration)を参照してください。

### カスタム構成\{#custom-configuration}

より多くの制御を行うには、カスタム辞書を指定し、セグメンテーションモードを選択し、隠れマルコフモデル（HMM）を有効または無効にすることができるカスタム構成を提供できます。例えば：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# ユーザー定義設定によるカスタム構成
analyzer_params = {
    "tokenizer": {
        "type": "jieba",           # 固定のトークナイザーの種類
        "dict": ["customDictionary"],  # カスタム辞書リスト；独自の用語に置き換えてください
        "mode": "exact",           # exactモードを使用（重複しないトークン）
        "hmm": False               # HMMを無効化；一致しないテキストは個別文字に分割されます
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("customDictionary"));
analyzerParams.put("mode", "exact");
analyzerParams.put("hmm", false);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"customDictionary"}, "mode": "exact", "hmm": false}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
     <th><p>デフォルト値</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>トークナイザーの種類。これは<code>"jieba"</code>に固定されています。</p></td>
     <td><p><code>"jieba"</code></p></td>
   </tr>
   <tr>
     <td><p><code>dict</code></p></td>
     <td><p>アナライザーが語彙源として読み込む辞書のリスト。組み込みオプション：</p><ul><li><p><code>"_default_"</code>: エンジンの組み込み簡体字中国語辞書を読み込みます。詳細については、<a href="https://github.com/messense/jieba-rs/blob/v0.6.8/src/data/dict.txt">dict.txt</a>を参照してください。</p></li><li><p><code>"_extend_default_"</code>: <code>"_default_"</code>のすべてに、追加の繁体字中国語補足を読み込みます。詳細については、<a href="https://github.com/milvus-io/milvus/blob/v2.5.11/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/data/jieba/dict.txt.big">dict.txt.big</a>を参照してください。</p><p>組み込み辞書を任意の数のカスタム辞書と混在させることもできます。例：<code>["_default_", "结巴分词器"]</code>。</p></li></ul></td>
     <td><p><code>["_default_"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>mode</code></p></td>
     <td><p>セグメンテーションモード。可能な値：</p><ul><li><p><code>"exact"</code>: 文を最も正確な方法でセグメント化しようとし、テキスト分析に理想的です。</p></li><li><p><code>"search"</code>: exactモードを基盤とし、さらに長い単語を分解してリコール率を向上させ、検索エンジンのトークン化に適しています。</p><p>詳細については、<a href="https://github.com/fxsjy/jieba">Jieba GitHubプロジェクト</a>を参照してください。</p></li></ul></td>
     <td><p><code>"search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>hmm</code></p></td>
     <td><p>辞書にない単語の確率的セグメンテーションのために隠れマルコフモデル（HMM）を有効にするかどうかを示すブールフラグ。</p></td>
     <td><p><code>true</code></p></td>
   </tr>
</table>

`analyzer_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用できます。これにより、Zilliz Cloudは、指定されたアナライザーを使用してそのフィールド内のテキストを効率的にトークン化およびフィルタリング処理できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

コレクションスキーマにアナライザー構成を適用する前に、`run_analyzer`メソッドを使用してその動作を検証してください。

### アナライザー構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["结巴分词器"],
        "mode": "exact",
        "hmm": False
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("结巴分词器"));
analyzerParams.put("mode", "exact");
analyzerParams.put("hmm", false);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"结巴分词器"}, "mode": "exact", "hmm": false}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
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
sample_text = "milvus结巴分词器中文测试"

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
texts.add("milvus结巴分词器中文测试");

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
texts := []string{"milvus结巴分词器中文测试"}
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

```python
['milvus', '结巴分词器', '中', '文', '测', '试']
```
