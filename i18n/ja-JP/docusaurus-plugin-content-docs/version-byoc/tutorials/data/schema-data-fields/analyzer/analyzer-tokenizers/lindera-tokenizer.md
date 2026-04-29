---
title: "Lindera | BYOC"
slug: /lindera-tokenizer
sidebar_key: lindera-tokenizer
sidebar_label: "Lindera"
beta: FALSE
notebook: FALSE
description: "`lindera` トークナイザーは辞書ベースの形態素解析を実行します。単語がスペースで区切られず、助詞などの文法マーカーが単語に直接付加される日本語や韓国語向けに設計されています。| BYOC"
type: origin
token: PvwZwtu3FiBQNqkPa5VcqH6qnmg
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - analyzer
  - 組み込みトークナイザー
  - lindera-tokenizer

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lindera

`lindera` トークナイザーは、辞書ベースの形態素解析を実行します。これは、単語がスペースで区切られず、助詞などの文法的要素が直接単語に付属する日本語や韓国語向けに設計されています。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>中国語テキストの場合</strong>: <code>lindera</code> は <code>cc-cedict</code> 辞書を介して中国語をサポートしていますが、代わりに<a href="./jieba-tokenizer"><code>jieba</code></a> トークナイザーの使用を推奨します。Jieba は中国語の単語分割に特化しており、より優れた結果を提供します。</p>

</Admonition>

## 概要\{#overview}

日本語と韓国語は膠着語です。つまり、「助詞」と呼ばれる文法的要素が名詞などに直接付属し、多数の組み合わせを形成します。例えば：

<table>
   <tr>
     <th><p>言語</p></th>
     <th><p>Root word</p></th>
     <th><ul><li>Particle</li></ul></th>
     <th><p>= Combined form</p></th>
     <th><p>Meaning</p></th>
   </tr>
   <tr>
     <td><p>Korean</p></td>
     <td><p>서울 (Seoul)</p></td>
     <td><p>에서</p></td>
     <td><p>서울에서</p></td>
     <td><p>in Seoul</p></td>
   </tr>
   <tr>
     <td><p>Japanese</p></td>
     <td><p>東京 (Tokyo)</p></td>
     <td><p>に</p></td>
     <td><p>東京に</p></td>
     <td><p>to Tokyo</p></td>
   </tr>
</table>

`lindera` トークナイザーは以下の処理を行います：

1. **テキストを個々の形態素**（単語や助詞）

1. **各トークンに辞書から品詞**（POS）

1. **不要なトークン**（例：助詞、句読点）

この「分割 → 品詞に基づくフィルタリング」という二段階の処理により、検索用にインデックスするトークンを正確に制御できます。

## 設定\{#configuration}

`lindera` トークナイザーを使用するアナライザーを設定するには、`tokenizer.type` を `lindera` に設定し、`dict_kind` で辞書を選択し、必要に応じてフィルターを適用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();                                 
  analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
      put("type", "lindera");                                                           
      put("dict_kind", "ko-dic");                                 
      put("filter", Arrays.asList(
          new HashMap<String, Object>() {{
              put("kind", "korean_stop_tags");
              put("tags", Arrays.asList(
                  "SP", "SSC", "SSO", "SC", "SE", "SF",
                  "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                  "JX", "JC", "UNK", "EP", "ETM"
              ));
          }}
      ));
  }});
```

</TabItem>

<TabItem value='java'>

```go
analyzerParams := map[string]interface{}{                                             
      "tokenizer": map[string]interface{}{     
          "type":      "lindera",                                                       
          "dict_kind": "ko-dic",                                  
          "filter": []interface{}{                                                      
              map[string]interface{}{                             
                  "kind": "korean_stop_tags",
                  "tags": []string{
                      "SP", "SSC", "SSO", "SC", "SE", "SF",
                      "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                      "JX", "JC", "UNK", "EP", "ETM",
                  },
              },
          },
      },
  }
```

</TabItem>

<TabItem value='java'>

```javascript
const analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
};
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>トークナイザーのタイプ。これは固定で <code>"lindera"</code> です。</p></td>
   </tr>
   <tr>
     <td><p><code>dict_kind</code></p></td>
     <td><p>語彙を定義するために使用される辞書。指定可能な値:</p><ul><li><p><code>ko-dic</code>: 韓国語 - 韓国語形態素辞書 (<a href="https://bitbucket.org/eunjeon/mecab-ko-dic">MeCab Ko-dic</a>)</p></li><li><p><code>ipadic</code>: 日本語 - 標準形態素辞書 (<a href="https://taku910.github.io/mecab/">MeCab IPADIC</a>)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>filter</code></p></td>
     <td><p>セグメンテーション後に適用するトークナイザーレベルのフィルターのリスト。各フィルターは以下のプロパティを持つオブジェクトです:</p><ul><li><p><code>kind</code>: フィルターの種類。サポートされている値:</p><ul><li><p><code>korean_stop_tags</code>: 指定された韓国語の品詞タグに一致するトークンを削除します。</p></li><li><p><code>japanese_stop_tags</code>: 指定された日本語の品詞タグに一致するトークンを削除します。</p></li></ul></li><li><p><code>tags</code>: フィルタリング対象となる品詞タグのリスト。<code>kind</code> によって利用可能なタグが異なります:</p><ul><li><p><code>korean_stop_tags</code> の場合: 正確なタグコードを使用します (例: <code>JKS</code>, <code>JKO</code>, <code>SF</code>)。韓国語のタグは完全一致が必要です。Sejong タグセットに基づく全タグ一覧については、<a href="https://docs.rs/lindera/latest/src/lindera/token_filter/korean_stop_tags.rs.html">Lindera Korean stop tags source</a> を参照してください。</p></li><li><p><code>japanese_stop_tags</code> の場合: 正確なタグコードを使用します (例: <code>助詞,格助詞</code>, <code>助詞,係助詞</code>, <code>助動詞</code>)。日本語のタグは完全一致が必要です。全タグ一覧 (IPADIC) については、<a href="https://github.com/taku910/mecab/blob/master/mecab-ipadic/pos-id.def">Japanese POS tags reference</a> を参照してください。</p></li></ul></li></ul></td>
   </tr>
</table>

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` 型フィールドに適用できます。これにより、Zilliz Cloud はそのフィールド内のテキストを指定されたアナライザーを使って処理し、効率的なトークン化とフィルタリングを実現します。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

コレクションスキーマにアナライザー設定を適用する前に、`run_analyzer` メソッドを使ってその動作を検証することを推奨します。

### 韓国語の例\{#korean-example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
}

# Sample Korean text: "서울에서 맛있는 음식을 먹었습니다" (I ate delicious food in Seoul)
sample_text = "서울에서 맛있는 음식을 먹었습니다"

result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
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

Map<String, Object> analyzerParams = new HashMap<>();                                                                          
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "lindera");                                                                                                    
  put("dict_kind", "ko-dic");                                 
  put("filter", Arrays.asList(
      new HashMap<String, Object>() {{
          put("kind", "korean_stop_tags");
          put("tags", Arrays.asList(
              "SP", "SSC", "SSO", "SC", "SE", "SF",
              "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
              "JX", "JC", "UNK", "EP", "ETM"
          ));
      }}
  ));
}});

List<String> texts = new ArrayList<>();
texts.add("서울에서 맛있는 음식을 먹었습니다");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
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

analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
      "type":      "lindera",
      "dict_kind": "ko-dic",
      "filter": []interface{}{
          map[string]interface{}{
              "kind": "korean_stop_tags",
              "tags": []string{
                  "SP", "SSC", "SSO", "SC", "SE", "SF",
                  "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                  "JX", "JC", "UNK", "EP", "ETM",
              },
          },
      },
  },
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"서울에서 맛있는 음식을 먹었습니다"}
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

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  uri: "YOUR_CLUSTER_ENDPOINT",
});

const analyzer_params = {
  tokenizer: {
    type: "lindera",
    dict_kind: "ko-dic",
    filter: [
      {
        kind: "korean_stop_tags",
        tags: [
          "SP",
          "SSC",
          "SSO",
          "SC",
          "SE",
          "SF",
          "JKS",
          "JKC",
          "JKG",
          "JKO",
          "JKB",
          "JKV",
          "JKQ",
          "JX",
          "JC",
          "UNK",
          "EP",
          "ETM",
        ],
      },
    ],
  },
};

const sample_text = "서울에서 맛있는 음식을 먹었습니다";

const result = await client.run_analyzer(sample_text, analyzer_params);
console.log("Analyzer output:", result);

```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

**期待される出力**:

```plaintext
['서울', '맛있', '음식', '먹', '습니다']
```

`korean_stop_tags` を使用しない場合、出力には「에서」（～で）、「는」（主題を示す助詞）、「을」（目的語を示す助詞）などの助詞が含まれますが、これらは通常検索において有用ではありません。

### 日本語の例\{#japanese-example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic",
        "filter": [
            {
                "kind": "japanese_stop_tags",
                "tags": ["接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"]
            }
        ]
    }
}

# Sample Japanese text: "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"
sample_text = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"

result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```javascript

import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  uri: "YOUR_CLUSTER_ENDPOINT",
});

const analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic",
        "filter": [
            {
                "kind": "japanese_stop_tags",
                "tags": ["接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"]
            }
        ]
    }
}

// Sample Japanese text: "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"
const sample_text = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"

const result = await client.run_analyzer(sample_text, analyzer_params);
console.log("Analyzer output:", result);
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

**期待される出力:**

```plaintext
['東京', 'スカイ', 'ツリー', '最寄り駅', 'とう', 'きょう', 'スカイ', 'ツリー', '駅']
```

`japanese_stop_tags` を使用しない場合、出力には「の」（所有を示す助詞）、「は」（主題を示す助詞）、「です」（コピュラ）などの助詞が含まれます。