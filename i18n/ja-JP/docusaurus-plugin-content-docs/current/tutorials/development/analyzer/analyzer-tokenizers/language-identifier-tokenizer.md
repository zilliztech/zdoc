---
title: "言語識別子 | Cloud"
slug: /language-identifier-tokenizer
sidebar_label: "言語識別子"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`languageidentifier` は、言語解析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するために設計された専用トークナイザーです。主な機能は、テキストフィールドの言語を検出し、その言語に最適な事前構成済みのアナライザーを動的に適用することです。これは、多種多様な言語を扱うアプリケーションに特に役立ち、入力ごとに手動で言語を割り当てる必要がなくなります。 | Cloud"
type: origin
token: X6wiwFkuFiF8nekse05cnBIPnic
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 言語識別子

`language_identifier` は、言語解析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するために設計された専用トークナイザーです。主な機能は、テキストフィールドの言語を検出し、その言語に最適な事前構成済みのアナライザーを動的に適用することです。これは、多種多様な言語を扱うアプリケーションに特に役立ち、入力ごとに手動で言語を割り当てる必要がなくなります。

テキストデータを適切な処理パイプラインにインテリジェントにルーティングすることで、`language_identifier` は多言語データの取り込みを効率化し、その後の検索および取得操作に向けて正確なトークン化を保証します。

## 言語検出ワークフロー\{#language-detection-workflow}

`language_identifier` はテキスト文字列を処理するために一連のステップを実行します。このワークフローは、正しく構成する方法を理解するうえで重要です。

![NZcFw5PuxhQcl1bUG60cS54QnMu](https://zdoc-images.s3.us-west-2.amazonaws.com/NZcFw5PuxhQcl1bUG60cS54QnMu.png)

1. **入力**: ワークフローは、テキスト文字列を入力として開始します。

1. **言語検出**: この文字列はまず言語検出エンジンに渡され、エンジンが言語の識別を試みます。Zilliz Cloud は **`whatlang`** と **`lingua`** の 2 つのエンジンをサポートしています。

1. **アナライザーの選択**:

    - **成功時**: 言語が正常に検出されると、システムは検出された言語名に対応するアナライザーが `analyzers` ディクショナリに構成されているかどうかを確認します。一致するものが見つかると、システムは指定されたアナライザーを入力テキストに適用します。たとえば、検出された「Mandarin」のテキストは `jieba` トークナイザーにルーティングされます。

    - **フォールバック**: 検出に失敗した場合、または言語の検出には成功したもののその言語に固有のアナライザーを提供していない場合、システムは事前構成済みの **`default` アナライザー** にデフォルト設定します。これは重要な補足です。`default` アナライザーは、検出の失敗と一致するアナライザーが存在しない場合の両方に対するフォールバックです。

適切なアナライザーが選択されると、テキストはトークン化および処理され、ワークフローが完了します。

## 利用可能な言語検出エンジン\{#available-language-detection-engines}

Zilliz Cloud は 2 つの言語検出エンジンから選択できます。

- [whatlang](https://github.com/greyblake/whatlang-rs)

- [lingua](https://github.com/pemistahl/lingua)

選択は、アプリケーションの特定のパフォーマンスと精度の要件によって異なります。

| エンジン | 速度 | 精度 | 出力形式 | 最適な用途 |
| --- | --- | --- | --- | --- |
| `whatlang` | 高速 | ほとんどの言語に適しています | 言語名（例: `"English"`,  `"Mandarin"`, `"Japanese"`）<br/>**参照:** [サポートされている言語表の Language 列](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md) | 速度が重要なリアルタイムアプリケーション |
| `lingua` | 低速 | 高い精度、特に短いテキストに適しています | 英語の言語名（例: `"English"`, `"Chinese"`, `"Japanese"`）<br/>**参照:** [サポートされている言語のリスト](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported) | 速度よりも精度が重要なアプリケーション |

重要な考慮点は、エンジンの命名規則です。両方のエンジンは言語名を英語で返しますが、一部の言語では異なる用語を使用します（例: `whatlang` は `Mandarin` を返し、`lingua` は `Chinese` を返します）。アナライザーのキーは、選択した検出エンジンが返す名前と完全に一致している必要があります。

## 構成\{#configuration}

`language_identifier` トークナイザーを正しく使用するには、その構成を定義して適用するために次のステップを実行する必要があります。

### ステップ 1: 言語とアナライザーを選択する\{#step-1-choose-your-languages-and-analyzers}

`language_identifier` の設定の核心は、サポートする予定の特定の言語に合わせてアナライザーを調整することです。システムは検出された言語を正しいアナライザーと照合して動作するため、このステップは正確なテキスト処理にとって重要です。

以下は、言語を適切な Zilliz Cloud アナライザーにマッピングするための推奨事項です。この表は、言語検出エンジンの出力と最適なツールをつなぐ役割を果たします。

| 言語（検出器の出力） | 推奨アナライザー | 説明 |
| --- | --- | --- |
| `English` | `type: english` | ステミングとストップワードのフィルタリングを備えた標準の英語トークン化です。 |
| `Mandarin`（whatlang 経由）または `Chinese`（lingua 経由） | `tokenizer: jieba` | スペースで区切られていないテキストの中国語単語分割です。 |
| `Japanese` | `tokenizer: icu` | 日本語を含む複雑な文字体系に対応する堅牢なトークナイザーです。 |
| `French` | `type: standard`, `filter: ["lowercase", "asciifolding"]` | フランス語のアクセントと文字を処理するカスタム構成です。 |

<Admonition type="info" title="Notes">

- **一致が重要**: アナライザーの名前は、検出エンジンの言語出力と**完全に一致している必要があります**。たとえば、`whatlang` を使用している場合、中国語テキストのキーは `Mandarin` である必要があります。

- **ベストプラクティス**: 上の表は、いくつかの一般的な言語に対する推奨構成を示していますが、網羅的なリストではありません。アナライザーの選択に関するより包括的なガイドについては、[ユースケースに合ったアナライザーの選択](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **検出器の出力**: 検出エンジンが返す言語名の完全なリストについては、[Whatlang がサポートする言語表](https://github.com/greyblake/whatlang-rs) および [Lingua がサポートする言語リスト](https://github.com/pemistahl/lingua-rs) を参照してください。

</Admonition>

### ステップ 2: analyzer_params を定義する\{#step-2-define-analyzerparams}

Zilliz Cloud で `language_identifier` トークナイザーを使用するには、次の主要なコンポーネントを含むディクショナリを作成します。

**必須コンポーネント:**

- `analyzers` 構成セット – すべてのアナライザー構成を含むディクショナリで、次を含める必要があります:

    - `default` – 言語検出に失敗した場合、または一致するアナライザーが見つからない場合に使用されるフォールバックアナライザー

    - **言語固有のアナライザー** – それぞれ `<analyzer_name>: <analyzer_config>` として定義され、次のとおりです:

        - `analyzer_name` は、選択した検出エンジンの出力と一致します（例: `"English"`, `"Japanese"`）

        - `analyzer_config` は標準のアナライザーパラメーター形式に従います（[アナライザーの概要](./analyzer-overview#analyzer-types) を参照）

**オプションのコンポーネント:**

- `identifier` – 使用する言語検出エンジン（`whatlang` または `lingua`）を指定します。指定しない場合は `whatlang` がデフォルトになります

- `mapping` – アナライザーのカスタムエイリアスを作成し、検出エンジンの正確な出力形式の代わりに説明的な名前を使用できるようにします

このトークナイザーは、まず入力テキストの言語を検出し、次に構成から適切なアナライザーを選択して動作します。検出に失敗した場合、または一致するアナライザーが存在しない場合は、自動的に `default` アナライザーにフォールバックします。

#### 推奨: 名前の直接一致\{#recommended-direct-name-matching}

アナライザー名は、選択した言語検出エンジンの出力と完全に一致させる必要があります。この方法はよりシンプルで、混乱を招く可能性を回避できます。

`whatlang` と `lingua` の両方で、それぞれのドキュメントに示されている言語名を使用します。

- [whatlang がサポートする言語](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md)（「**Language**」列を使用）

- [lingua がサポートする言語](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported)

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",  # Must be `language_identifier`
        "identifier": "whatlang",  # or `lingua`
        "analyzers": {  # A set of analyzer configs
            "default": {
                "tokenizer": "standard"  # fallback if language detection fails
            },
            "English": {  # Analyzer name that matches whatlang output
                "type": "english"
            },
            "Mandarin": {  # Analyzer name that matches whatlang output
                "tokenizer": "jieba"
            }
        }
    }
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

Map<String, Object> defaultAnalyzer = new HashMap<>();
defaultAnalyzer.put("tokenizer", "standard");

Map<String, Object> englishAnalyzer = new HashMap<>();
englishAnalyzer.put("type", "english");

Map<String, Object> mandarinAnalyzer = new HashMap<>();
mandarinAnalyzer.put("tokenizer", "jieba");

Map<String, Object> analyzers = new HashMap<>();
analyzers.put("default", defaultAnalyzer);
analyzers.put("English", englishAnalyzer);
analyzers.put("Mandarin", mandarinAnalyzer);

Map<String, Object> tokenizer = new HashMap<>();
tokenizer.put("type", "language_identifier");
tokenizer.put("identifier", "whatlang");
tokenizer.put("analyzers", analyzers);

analyzerParams.put("tokenizer", tokenizer);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": map[string]any{
        "type":       "language_identifier",
        "identifier": "whatlang",
        "analyzers": map[string]any{
            "default":  map[string]any{"tokenizer": "standard"},
            "English":  map[string]any{"type": "english"},
            "Mandarin": map[string]any{"tokenizer": "jieba"},
        },
    },
}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "whatlang",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "Mandarin": {"tokenizer": "jieba"}
        }
    }
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "language_identifier"},
        {"identifier", "whatlang"},
        {"analyzers", {
            {"default", {{"tokenizer", "standard"}}},
            {"English", {{"type", "english"}}},
            {"Mandarin", {{"tokenizer", "jieba"}}}
        }}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "whatlang",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "Mandarin": {"tokenizer": "jieba"}
        }
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "language_identifier",
    "identifier": "whatlang",
    "analyzers": {
      "default": {
        "tokenizer": "standard"
      },
      "English": {
        "type": "english"
      },
      "Mandarin": {
        "tokenizer": "jieba"
      }
    }
  }
}'
```

</TabItem>
</Tabs>

#### 代替アプローチ: mapping によるカスタム名\{#alternative-approach-custom-names-with-mapping}

カスタムアナライザー名を使用したい場合、または既存の構成との互換性を維持する必要がある場合は、`mapping` パラメーターを使用できます。これによりアナライザーのエイリアスが作成され、元の検出エンジン名とカスタム名の両方が機能します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {
                "tokenizer": "standard"
            },
            "english_analyzer": {  # Custom analyzer name
                "type": "english"
            },
            "chinese_analyzer": {  # Custom analyzer name
                "tokenizer": "jieba"
            }
        },
        "mapping": {
            "English": "english_analyzer",   # Maps detection output to custom name
            "Chinese": "chinese_analyzer"
        }
    }
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

Map<String, Object> defaultAnalyzer = new HashMap<>();
defaultAnalyzer.put("tokenizer", "standard");

Map<String, Object> englishAnalyzer = new HashMap<>();
englishAnalyzer.put("type", "english");

Map<String, Object> chineseAnalyzer = new HashMap<>();
chineseAnalyzer.put("tokenizer", "jieba");

Map<String, Object> analyzers = new HashMap<>();
analyzers.put("default", defaultAnalyzer);
analyzers.put("english_analyzer", englishAnalyzer);
analyzers.put("chinese_analyzer", chineseAnalyzer);

Map<String, Object> mapping = new HashMap<>();
mapping.put("English", "english_analyzer");
mapping.put("Chinese", "chinese_analyzer");

Map<String, Object> tokenizer = new HashMap<>();
tokenizer.put("type", "language_identifier");
tokenizer.put("identifier", "lingua");
tokenizer.put("analyzers", analyzers);
tokenizer.put("mapping", mapping);

analyzerParams.put("tokenizer", tokenizer);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": map[string]any{
        "type":       "language_identifier",
        "identifier": "lingua",
        "analyzers": map[string]any{
            "default":           map[string]any{"tokenizer": "standard"},
            "english_analyzer":  map[string]any{"type": "english"},
            "chinese_analyzer":  map[string]any{"tokenizer": "jieba"},
        },
        "mapping": map[string]any{
            "English": "english_analyzer",
            "Chinese": "chinese_analyzer",
        },
    },
}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "english_analyzer": {"type": "english"},
            "chinese_analyzer": {"tokenizer": "jieba"}
        },
        "mapping": {
            "English": "english_analyzer",
            "Chinese": "chinese_analyzer"
        }
    }
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "language_identifier"},
        {"identifier", "lingua"},
        {"analyzers", {
            {"default", {{"tokenizer", "standard"}}},
            {"english_analyzer", {{"type", "english"}}},
            {"chinese_analyzer", {{"tokenizer", "jieba"}}}
        }},
        {"mapping", {
            {"English", "english_analyzer"},
            {"Chinese", "chinese_analyzer"}
        }}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "english_analyzer": {"type": "english"},
            "chinese_analyzer": {"tokenizer": "jieba"}
        },
        "mapping": {
            "English": "english_analyzer",
            "Chinese": "chinese_analyzer"
        }
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "language_identifier",
    "identifier": "lingua",
    "analyzers": {
      "default": {
        "tokenizer": "standard"
      },
      "english_analyzer": {
        "type": "english"
      },
      "chinese_analyzer": {
        "tokenizer": "jieba"
      }
    },
    "mapping": {
      "English": "english_analyzer",
      "Chinese": "chinese_analyzer"
    }
  }
}'
```

</TabItem>
</Tabs>

`analyzer_params` を定義したら、コレクションスキーマを定義するときにそれを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行うことができます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

ここでは、一般的なシナリオですぐに使用できる構成をいくつか紹介します。各例には構成と検証コードの両方が含まれているため、セットアップをすぐにテストできます。

### 英語と中国語の検出\{#english-and-chinese-detection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Configuration
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "whatlang",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "Mandarin": {"tokenizer": "jieba"}
        }
    }
}

# Test the configuration
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# English text
result_en = client.run_analyzer("The Milvus vector database is built for scale!", analyzer_params)
print("English:", result_en)
# Output: 
# English: ['The', 'Milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']

# Chinese text  
result_cn = client.run_analyzer("Milvus向量数据库专为大规模应用而设计", analyzer_params)
print("Chinese:", result_cn)
# Output: 
# Chinese: ['Milvus', '向量', '数据', '据库', '数据库', '专', '为', '大规', '规模', '大规模', '应用', '而', '设计']
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Configuration
Map<String, Object> analyzerParams = new HashMap<>();
Map<String, Object> analyzers = new HashMap<>();
analyzers.put("default", Collections.singletonMap("tokenizer", "standard"));
analyzers.put("English", Collections.singletonMap("type", "english"));
analyzers.put("Mandarin", Collections.singletonMap("tokenizer", "jieba"));
Map<String, Object> tokenizer = new HashMap<>();
tokenizer.put("type", "language_identifier");
tokenizer.put("identifier", "whatlang");
tokenizer.put("analyzers", analyzers);
analyzerParams.put("tokenizer", tokenizer);

// Test the configuration
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

// English text
RunAnalyzerResp resultEn = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(Collections.singletonList("The Milvus vector database is built for scale!"))
        .analyzerParams(analyzerParams)
        .build());
System.out.println("English: " + resultEn.getResults());

// Chinese text
RunAnalyzerResp resultCn = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(Collections.singletonList("Milvus向量数据库专为大规模应用而设计"))
        .analyzerParams(analyzerParams)
        .build());
System.out.println("Chinese: " + resultCn.getResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// Configuration
analyzerParams := map[string]any{
    "tokenizer": map[string]any{
        "type":       "language_identifier",
        "identifier": "whatlang",
        "analyzers": map[string]any{
            "default":  map[string]any{"tokenizer": "standard"},
            "English":  map[string]any{"type": "english"},
            "Mandarin": map[string]any{"tokenizer": "jieba"},
        },
    },
}

// Test the configuration
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)

// English text
resultEn, err := client.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption(
    "The Milvus vector database is built for scale!").WithAnalyzerParamsStr(string(bs)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("English:", resultEn)

// Chinese text
resultCn, err := client.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption(
    "Milvus向量数据库专为大规模应用而设计").WithAnalyzerParamsStr(string(bs)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("Chinese:", resultCn)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    // Configuration
    let analyzer_params = json!({
        "tokenizer": {
            "type": "language_identifier",
            "identifier": "whatlang",
            "analyzers": {
                "default": {"tokenizer": "standard"},
                "English": {"type": "english"},
                "Mandarin": {"tokenizer": "jieba"}
            }
        }
    });

    // English text
    let result_en = client.run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["The Milvus vector database is built for scale!".to_string()])
            .analyzer_params(analyzer_params.clone())
            .build()?,
    ).await?;
    println!("English: {:?}", result_en.results());

    // Chinese text
    let result_cn = client.run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["Milvus向量数据库专为大规模应用而设计".to_string()])
            .analyzer_params(analyzer_params)
            .build()?,
    ).await?;
    println!("Chinese: {:?}", result_cn.results());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

// Configuration
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "language_identifier"},
        {"identifier", "whatlang"},
        {"analyzers", {
            {"default", {{"tokenizer", "standard"}}},
            {"English", {{"type", "english"}}},
            {"Mandarin", {{"tokenizer", "jieba"}}}
        }}
    }}
};

// Test the configuration
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// English text
milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(milvus::RunAnalyzerRequest()
                                .AddText("The Milvus vector database is built for scale!")
                                .WithAnalyzerParams(analyzer_params),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << " ";
    }
    std::cout << std::endl;
}

// Chinese text
status = client->RunAnalyzer(milvus::RunAnalyzerRequest()
                                .AddText("Milvus向量数据库专为大规模应用而设计")
                                .WithAnalyzerParams(analyzer_params),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << " ";
    }
    std::cout << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// Configuration
const analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "whatlang",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "Mandarin": {"tokenizer": "jieba"}
        }
    }
};

// Test the configuration
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

// English text
const resultEn = await client.runAnalyzer({
  text: 'The Milvus vector database is built for scale!',
  analyzer_params: analyzer_params
});
console.log('English:', resultEn);

// Chinese text
const resultCn = await client.runAnalyzer({
  text: 'Milvus向量数据库专为大规模应用而设计',
  analyzer_params: analyzer_params
});
console.log('Chinese:', resultCn);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"language_identifier\",\"identifier\":\"whatlang\",\"analyzers\":{\"default\":{\"tokenizer\":\"standard\"},\"English\":{\"type\":\"english\"},\"Mandarin\":{\"tokenizer\":\"jieba\"}}}}",
    "text": ["The Milvus vector database is built for scale!"]
  }'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"language_identifier\",\"identifier\":\"whatlang\",\"analyzers\":{\"default\":{\"tokenizer\":\"standard\"},\"English\":{\"type\":\"english\"},\"Mandarin\":{\"tokenizer\":\"jieba\"}}}}",
    "text": ["Milvus向量数据库专为大规模应用而设计"]
  }'
```

</TabItem>
</Tabs>

### アクセント正規化付きのヨーロッパ言語\{#european-languages-with-accent-normalization}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Configuration for French, German, Spanish, etc.
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "French": {
                "tokenizer": "standard",
                "filter": ["lowercase", "asciifolding"]
            }
        }
    }
}

# Test with accented text
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

result_fr = client.run_analyzer("Café français très délicieux", analyzer_params)
print("French:", result_fr)
# Output: 
# French: ['cafe', 'francais', 'tres', 'delicieux']
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

// Configuration for French, German, Spanish, etc.
Map<String, Object> analyzerParams = new HashMap<>();
Map<String, Object> frenchAnalyzer = new HashMap<>();
frenchAnalyzer.put("tokenizer", "standard");
frenchAnalyzer.put("filter", Arrays.asList("lowercase", "asciifolding"));
Map<String, Object> analyzers = new HashMap<>();
analyzers.put("default", Collections.singletonMap("tokenizer", "standard"));
analyzers.put("English", Collections.singletonMap("type", "english"));
analyzers.put("French", frenchAnalyzer);
Map<String, Object> tokenizer = new HashMap<>();
tokenizer.put("type", "language_identifier");
tokenizer.put("identifier", "lingua");
tokenizer.put("analyzers", analyzers);
analyzerParams.put("tokenizer", tokenizer);

// Test with accented text
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

RunAnalyzerResp resultFr = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(Collections.singletonList("Café français très délicieux"))
        .analyzerParams(analyzerParams)
        .build());
System.out.println("French: " + resultFr.getResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// Configuration for French, German, Spanish, etc.
analyzerParams := map[string]any{
    "tokenizer": map[string]any{
        "type":       "language_identifier",
        "identifier": "lingua",
        "analyzers": map[string]any{
            "default": map[string]any{"tokenizer": "standard"},
            "English": map[string]any{"type": "english"},
            "French": map[string]any{
                "tokenizer": "standard",
                "filter":    []any{"lowercase", "asciifolding"},
            },
        },
    },
}

// Test with accented text
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)

resultFr, err := client.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption(
    "Café français très délicieux").WithAnalyzerParamsStr(string(bs)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("French:", resultFr)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    // Configuration for French, German, Spanish, etc.
    let analyzer_params = json!({
        "tokenizer": {
            "type": "language_identifier",
            "identifier": "lingua",
            "analyzers": {
                "default": {"tokenizer": "standard"},
                "English": {"type": "english"},
                "French": {
                    "tokenizer": "standard",
                    "filter": ["lowercase", "asciifolding"]
                }
            }
        }
    });

    // Test with accented text
    let result_fr = client.run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["Café français très délicieux".to_string()])
            .analyzer_params(analyzer_params)
            .build()?,
    ).await?;
    println!("French: {:?}", result_fr.results());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

// Configuration for French, German, Spanish, etc.
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "language_identifier"},
        {"identifier", "lingua"},
        {"analyzers", {
            {"default", {{"tokenizer", "standard"}}},
            {"English", {{"type", "english"}}},
            {"French", {
                {"tokenizer", "standard"},
                {"filter", {"lowercase", "asciifolding"}}
            }}
        }}
    }}
};

// Test with accented text
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(milvus::RunAnalyzerRequest()
                                .AddText("Café français très délicieux")
                                .WithAnalyzerParams(analyzer_params),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << " ";
    }
    std::cout << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// Configuration for French, German, Spanish, etc.
const analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "French": {
                "tokenizer": "standard",
                "filter": ["lowercase", "asciifolding"]
            }
        }
    }
};

// Test with accented text
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

const resultFr = await client.runAnalyzer({
  text: 'Café français très délicieux',
  analyzer_params: analyzer_params
});
console.log('French:', resultFr);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"language_identifier\",\"identifier\":\"lingua\",\"analyzers\":{\"default\":{\"tokenizer\":\"standard\"},\"English\":{\"type\":\"english\"},\"French\":{\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",\"asciifolding\"]}}}}",
    "text": ["Café français très délicieux"]
  }'
```

</TabItem>
</Tabs>

## 使用上の注意\{#usage-notes}

- **フィールドごとに単一言語**: フィールドを単一の均質なテキスト単位として操作します。異なるデータレコード間で異なる言語を処理するように設計されています。たとえば、あるレコードに英語の文が含まれ、次のレコードにフランス語の文が含まれる場合などです。

- **混在言語文字列の非サポート**: 複数の言語のテキストを含む単一の文字列を処理するようには設計されて**いません**。たとえば、英語の文と引用された日本語のフレーズの両方を含む単一の `VARCHAR` フィールドは、単一言語として処理されます。

- **支配的な言語の処理**: 言語が混在するシナリオでは、検出エンジンは支配的な言語を識別する可能性が高く、対応するアナライザーがテキスト全体に適用されます。その結果、埋め込まれた外国語のテキストはトークン化が不十分になるか、まったくトークン化されなくなります。

