---
title: "Language Identifier | Cloud"
slug: /language-identifier-tokenizer
sidebar_label: "Language Identifier"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`languageidentifier` は、言語分析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するために設計された特化型 tokenizer です。その主な機能は、テキストフィールドの言語を検出し、その言語に最適な事前設定済み analyzer を動的に適用することです。これは、さまざまな言語を扱うアプリケーションにおいて特に有用であり、入力ごとに手動で言語を割り当てる必要をなくします。 | Cloud"
type: origin
token: X6wiwFkuFiF8nekse05cnBIPnic
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Language Identifier

`language_identifier` は、言語分析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するために設計された特化型 tokenizer です。その主な機能は、テキストフィールドの言語を検出し、その言語に最適な事前設定済み analyzer を動的に適用することです。これは、さまざまな言語を扱うアプリケーションにおいて特に有用であり、入力ごとに手動で言語を割り当てる必要をなくします。

`language_identifier` は、テキストデータを適切な処理パイプラインへインテリジェントに振り分けることで、多言語データの取り込みを効率化し、後続の検索および取得操作のための正確な tokenization を実現します。

## 言語検出ワークフロー\{#language-detection-workflow}

`language_identifier` は、テキスト文字列を処理するために一連のステップを実行します。このワークフローは、正しく設定する方法を理解するうえで重要です。

![NZcFw5PuxhQcl1bUG60cS54QnMu](https://zdoc-images.s3.us-west-2.amazonaws.com/NZcFw5PuxhQcl1bUG60cS54QnMu.png)

1. **入力:** ワークフローは、入力としてテキスト文字列から始まります。

1. **言語検出:** この文字列はまず言語検出エンジンに渡され、言語の識別が試みられます。Zilliz Cloud は 2 つのエンジン、**whatlang** と **lingua** をサポートしています。

1. **analyzer の選択:**

    - **成功:** 言語が正常に検出された場合、システムは検出された言語名に対応する analyzer が `analyzers` 辞書内に設定されているかを確認します。一致が見つかると、システムは指定された analyzer を入力テキストに適用します。たとえば、"Mandarin" と検出されたテキストは `jieba` tokenizer にルーティングされます。

    - **フォールバック:** 検出に失敗した場合、または言語は正常に検出されたもののその言語用の特定の analyzer を提供していない場合、システムは事前設定された **default analyzer** を使用します。これは重要なポイントです。`default` analyzer は、検出失敗時と一致する analyzer が存在しない場合の両方に対するフォールバックです。

適切な analyzer が選択されると、テキストは tokenization および処理され、ワークフローが完了します。

## 利用可能な言語検出エンジン\{#available-language-detection-engines}

Zilliz Cloud では、2 つの言語検出エンジンから選択できます。

- [whatlang](https://github.com/greyblake/whatlang-rs)

- [lingua](https://github.com/pemistahl/lingua)

選択は、アプリケーションに必要な性能および精度要件によって異なります。

| Engine | Speed | Accuracy | Output Format | Best For |
| --- | --- | --- | --- | --- |
| `whatlang` | 高速 | 多くの言語で十分良好 | 言語名（例: `"English"`、`"Mandarin"`、`"Japanese"`）<br/>**Reference:** [サポート言語テーブルの Language 列](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md) | 速度が重要なリアルタイムアプリケーション |
| `lingua` | より低速 | より高精度、特に短いテキストで有効 | 英語の言語名（例: `"English"`、`"Chinese"`、`"Japanese"`）<br/>**Reference:** [サポート言語一覧](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported) | 速度より精度が重要なアプリケーション |

重要な考慮点は、エンジンの命名規則です。両方のエンジンとも英語の言語名を返しますが、一部の言語では異なる用語を使用します（例: `whatlang` は `Mandarin` を返し、`lingua` は `Chinese` を返します）。analyzer のキーは、選択した検出エンジンが返す名前と完全に一致している必要があります。

## 設定\{#configuration}

`language_identifier` tokenizer を正しく使用するには、その設定を定義して適用するために以下の手順を実行する必要があります。

### ステップ 1: 使用する言語と analyzer を選択する\{#step-1-choose-your-languages-and-analyzers}

`language_identifier` の設定の中核は、サポート予定の特定の言語に合わせて analyzer を調整することです。システムは検出された言語を正しい analyzer に一致させることで動作するため、このステップは正確なテキスト処理に不可欠です。

以下は、言語と適切な Zilliz Cloud analyzer の推奨マッピングです。この表は、言語検出エンジンの出力と、その用途に最適なツールとの橋渡し役となります。

| Language (Detector Output) | Recommended Analyzer | Description |
| --- | --- | --- |
| `English` | `type: english` | stemming と stop-word filtering を備えた標準的な英語 tokenization。 |
| `Mandarin` (via whatlang) or `Chinese` (via lingua) | `tokenizer: jieba` | スペースで区切られないテキストに対する中国語の単語分割。 |
| `Japanese` | `tokenizer: icu` | 日本語を含む複雑な文字体系に対応する堅牢な tokenizer。 |
| `French` | `type: standard`, `filter: ["lowercase", "asciifolding"]` | フランス語のアクセントや文字を処理するカスタム設定。 |

<Admonition type="info" icon="📘" title="Notes">

- **一致が重要:** analyzer の名前は、検出エンジンの言語出力と**完全に一致**している必要があります。たとえば、`whatlang` を使用している場合、中国語テキスト用のキーは `Mandarin` でなければなりません。

- **ベストプラクティス:** 上の表は、いくつかの一般的な言語向けの推奨設定を示していますが、網羅的な一覧ではありません。analyzer の選択に関するより包括的なガイドについては、[ユースケースに適した Analyzer の選び方](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **Detector output**: 検出エンジンが返す言語名の完全な一覧については、[Whatlang supported languages table](https://github.com/greyblake/whatlang-rs) および [Lingua supported languages list](https://github.com/pemistahl/lingua-rs) を参照してください。

</Admonition>

### ステップ 2: analyzer_params を定義する\{#step-2-define-analyzerparams}

Zilliz Cloud で `language_identifier` tokenizer を使用するには、以下の主要コンポーネントを含む辞書を作成します。

**必須コンポーネント:**

- `analyzers` config set – すべての analyzer 設定を含む辞書。以下を含める必要があります。

    - `default` – 言語検出に失敗した場合、または一致する analyzer が見つからない場合に使用されるフォールバック analyzer

    - **言語固有の analyzer** – それぞれ `<analyzer_name>: <analyzer_config>` として定義します。ここで:

        - `analyzer_name` は、選択した検出エンジンの出力（例: `"English"`、`"Japanese"`）と一致します

        - `analyzer_config` は、標準的な analyzer パラメータ形式に従います（[Analyzer Overview](./analyzer-overview#analyzer-types) を参照）

**オプションコンポーネント:**

- `identifier` – 使用する言語検出エンジンを指定します（`whatlang` または `lingua`）。指定しない場合、デフォルトは `whatlang` です

- `mapping` – analyzer 用のカスタムエイリアスを作成し、検出エンジンの厳密な出力形式ではなく説明的な名前を使用できるようにします

この tokenizer は、まず入力テキストの言語を検出し、その後、設定から適切な analyzer を選択して動作します。検出に失敗した場合、または一致する analyzer が存在しない場合は、自動的に `default` analyzer にフォールバックします。

#### 推奨: 名前を直接一致させる\{#recommended-direct-name-matching}

analyzer 名は、選択した言語検出エンジンの出力と完全に一致させる必要があります。この方法はよりシンプルで、混乱を避けられます。

`whatlang` と `lingua` の両方について、それぞれのドキュメントに記載されている言語名を使用してください。

- [whatlang supported languages](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md)（"**Language**" 列を使用）

- [lingua supported languages](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported)

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

#### 代替アプローチ: mapping を使用したカスタム名\{#alternative-approach-custom-names-with-mapping}

カスタム analyzer 名を使用したい場合や、既存の設定との互換性を維持する必要がある場合は、`mapping` パラメータを使用できます。これにより analyzer のエイリアスが作成され、元の検出エンジン名とカスタム名の両方が機能します。

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

`analyzer_params` を定義した後、collection schema を定義する際にそれらを `VARCHAR` フィールドへ適用できます。これにより Zilliz Cloud は、そのフィールド内のテキストを指定された analyzer で処理し、効率的な tokenization と filtering を実現できます。詳細は、[Example use](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

以下は、一般的なシナリオ向けのすぐに使える設定例です。各例には、すぐに設定をテストできるように、設定と検証コードの両方が含まれています。

### 英語と中国語の検出\{#english-and-chinese-detection}

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

### アクセント正規化を伴うヨーロッパ言語\{#european-languages-with-accent-normalization}

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
result_fr = client.run_analyzer("Café français très délicieux", analyzer_params)
print("French:", result_fr)
# Output: 
# French: ['cafe', 'francais', 'tres', 'delicieux']
```

## 使用上の注意\{#usage-notes}

- **フィールドごとに単一言語:** これは、1 つのフィールドを単一かつ均質なテキスト単位として扱います。1 つのレコードには英語の文、次のレコードにはフランス語の文が含まれるといったように、異なるデータレコード間で異なる言語を扱うよう設計されています。

- **複数言語が混在した文字列には非対応:** これは、複数の言語のテキストを含む 1 つの文字列を処理するようには**設計されていません**。たとえば、英語の文と引用された日本語のフレーズの両方を含む 1 つの `VARCHAR` フィールドは、単一言語として処理されます。

- **支配的な言語による処理:** 複数言語が混在するシナリオでは、検出エンジンは支配的な言語を識別する可能性が高く、それに対応する analyzer がテキスト全体に適用されます。その結果、埋め込まれた外国語テキストに対しては tokenization の品質が低下するか、まったく行われない可能性があります。

