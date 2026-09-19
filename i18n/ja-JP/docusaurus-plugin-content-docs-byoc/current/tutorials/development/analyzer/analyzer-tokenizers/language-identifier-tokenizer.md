---
title: "Language Identifier | BYOC"
slug: /language-identifier-tokenizer
sidebar_label: "Language Identifier"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`languageidentifier` は、言語分析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するために設計された専用のトークナイザーです。主な機能は、テキストフィールドの言語を検出し、その言語に最も適した事前設定済みのアナライザーを動的に適用することです。これは、さまざまな言語を扱うアプリケーションに特に有用であり、入力ごとに手動で言語を割り当てる必要をなくします。 | BYOC"
type: origin
token: X6wiwFkuFiF8nekse05cnBIPnic
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Language Identifier

`language_identifier` は、言語分析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するために設計された専用のトークナイザーです。主な機能は、テキストフィールドの言語を検出し、その言語に最も適した事前設定済みのアナライザーを動的に適用することです。これは、さまざまな言語を扱うアプリケーションに特に有用であり、入力ごとに手動で言語を割り当てる必要をなくします。

テキストデータを適切な処理パイプラインへインテリジェントに振り分けることで、`language_identifier` は多言語データの取り込みを効率化し、後続の検索および取得処理に向けた正確なトークン化を実現します。

## 言語検出ワークフロー\{#language-detection-workflow}

`language_identifier` は、テキスト文字列を処理するために一連のステップを実行します。このワークフローは、正しく設定する方法を理解するうえで重要です。

![NZcFw5PuxhQcl1bUG60cS54QnMu](https://zdoc-images.s3.us-west-2.amazonaws.com/NZcFw5PuxhQcl1bUG60cS54QnMu.png)

1. **入力:** ワークフローは、入力としてテキスト文字列を受け取ることから始まります。

1. **言語検出:** この文字列はまず言語検出エンジンに渡され、言語の識別が試みられます。Zilliz Cloud は **`whatlang`** と **`lingua`** の 2 つのエンジンをサポートしています。

1. **アナライザーの選択:**

    - **成功:** 言語が正常に検出された場合、システムは検出された言語名に対応するアナライザーが `analyzers` 辞書に設定されているかを確認します。一致するものが見つかると、システムは指定されたアナライザーを入力テキストに適用します。たとえば、"Mandarin" と検出されたテキストは `jieba` トークナイザーにルーティングされます。

    - **フォールバック:** 検出に失敗した場合、または言語の検出には成功したもののその言語向けの特定のアナライザーを設定していない場合、システムは事前設定された **`default` アナライザー** を使用します。これは重要な補足点です。`default` アナライザーは、検出失敗時と一致するアナライザーが存在しない場合の両方に対するフォールバックです。

適切なアナライザーが選択された後、テキストはトークン化および処理され、ワークフローが完了します。

## 利用可能な言語検出エンジン\{#available-language-detection-engines}

Zilliz Cloud では、2 つの言語検出エンジンから選択できます。

- [whatlang](https://github.com/greyblake/whatlang-rs)

- [lingua](https://github.com/pemistahl/lingua)

どちらを選択するかは、アプリケーションに求められる具体的な性能と精度の要件によって決まります。

| エンジン | 速度 | 精度 | 出力形式 | 最適な用途 |
| --- | --- | --- | --- | --- |
| `whatlang` | 高速 | ほとんどの言語で良好 | 言語名（例: `"English"`,  `"Mandarin"`, `"Japanese"`）<br/>**参考:** [サポートされる言語テーブルの Language 列](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md) | 速度が重要なリアルタイムアプリケーション |
| `lingua` | 低速 | より高い精度（特に短いテキストで有効） | 英語の言語名（例: `"English"`, `"Chinese"`, `"Japanese"`）<br/>**参考:** [サポート言語一覧](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported) | 速度よりも精度が重要なアプリケーション |

重要な考慮点は、エンジンの命名規則です。両方のエンジンは言語名を英語で返しますが、一部の言語では異なる用語を使用します（例: `whatlang` は `Mandarin` を返し、`lingua` は `Chinese` を返します）。アナライザーのキーは、選択した検出エンジンが返す名前と完全に一致している必要があります。

## 設定\{#configuration}

`language_identifier` トークナイザーを正しく使用するには、その設定を定義して適用するために次の手順を実行する必要があります。

### ステップ 1: 使用する言語とアナライザーを選択する\{#step-1-choose-your-languages-and-analyzers}

`language_identifier` の設定の中核は、サポートする予定の言語に合わせてアナライザーを調整することです。システムは検出された言語を正しいアナライザーと照合して動作するため、このステップは正確なテキスト処理に不可欠です。

以下は、言語と適切な Zilliz Cloud アナライザーの推奨マッピングです。この表は、言語検出エンジンの出力と、その用途に最適なツールとをつなぐ役割を果たします。

| 言語（検出エンジンの出力） | 推奨アナライザー | 説明 |
| --- | --- | --- |
| `English` | `type: english` | ステミングとストップワードフィルタリングを伴う標準的な英語トークン化。 |
| `Mandarin`（whatlang を使用）または `Chinese`（lingua を使用） | `tokenizer: jieba` | スペースで区切られないテキスト向けの中国語の単語分割。 |
| `Japanese` | `tokenizer: icu` | 日本語を含む複雑な文字体系に対応する堅牢なトークナイザー。 |
| `French` | `type: standard`, `filter: ["lowercase", "asciifolding"]` | フランス語のアクセントや文字を処理するカスタム設定。 |

<Admonition type="info" title="Notes">

- **一致が重要:** アナライザーの名前は、検出エンジンが出力する言語名と**完全に一致**していなければなりません。たとえば、`whatlang` を使用している場合、中国語テキスト用のキーは `Mandarin` である必要があります。

- **ベストプラクティス:** 上記の表は、いくつかの一般的な言語に対する推奨設定を示していますが、網羅的な一覧ではありません。アナライザーの選択に関するより包括的なガイドについては、[ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **検出エンジンの出力**: 検出エンジンが返す言語名の完全な一覧については、[Whatlang supported languages table](https://github.com/greyblake/whatlang-rs) および [Lingua supported languages list](https://github.com/pemistahl/lingua-rs) を参照してください。

</Admonition>

### ステップ 2: analyzer_params を定義する\{#step-2-define-analyzerparams}

Zilliz Cloud で `language_identifier` トークナイザーを使用するには、次の主要コンポーネントを含む辞書を作成します。

**必須コンポーネント:**

- `analyzers` 設定セット – すべてのアナライザー設定を含む辞書で、以下を含める必要があります。

    - `default` – 言語検出に失敗した場合、または一致するアナライザーが見つからない場合に使用されるフォールバックアナライザー

    - **言語固有のアナライザー** – それぞれ `<analyzer_name>: <analyzer_config>` として定義され、次のとおりです。

        - `analyzer_name` は、選択した検出エンジンの出力と一致します（例: `"English"`, `"Japanese"`）

        - `analyzer_config` は標準のアナライザーパラメータ形式に従います（[アナライザーの概要](./analyzer-overview#analyzer-types) を参照）

**オプションコンポーネント:**

- `identifier` – 使用する言語検出エンジン（`whatlang` または `lingua`）を指定します。指定しない場合の既定値は `whatlang` です

- `mapping` – アナライザーのカスタムエイリアスを作成し、検出エンジンの厳密な出力形式の代わりにわかりやすい名前を使用できるようにします

このトークナイザーは、まず入力テキストの言語を検出し、その後設定から適切なアナライザーを選択して動作します。検出に失敗した場合、または一致するアナライザーが存在しない場合は、自動的に `default` アナライザーにフォールバックします。

#### 推奨: 名前を直接一致させる\{#recommended-direct-name-matching}

アナライザー名は、選択した言語検出エンジンの出力と正確に一致させる必要があります。この方法はよりシンプルで、混乱の可能性を避けられます。

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

カスタムアナライザー名を使用したい場合や、既存の設定との互換性を維持する必要がある場合は、`mapping` パラメータを使用できます。これによりアナライザーのエイリアスが作成され、元の検出エンジン名とカスタム名の両方が機能します。

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

`analyzer_params` を定義した後、コレクションスキーマを定義する際に、それを `VARCHAR` フィールドに適用できます。これにより Zilliz Cloud は、そのフィールド内のテキストを指定したアナライザーで処理し、効率的なトークン化とフィルタリングを実現できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

以下は、一般的なシナリオ向けのすぐに使用できる設定です。各例には設定と検証用コードの両方が含まれているため、すぐにセットアップをテストできます。

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

- **フィールドごとに単一言語:** これは、フィールドを単一の均質なテキスト単位として扱います。あるレコードには英語の文が含まれ、次のレコードにはフランス語の文が含まれるといったように、異なるデータレコードをまたいで異なる言語を処理するように設計されています。

- **言語が混在する文字列には対応しません:** 複数の言語のテキストを含む単一の文字列を処理するようには**設計されていません**。たとえば、英語の文と引用符で囲まれた日本語のフレーズの両方を含む単一の `VARCHAR` フィールドは、単一言語として処理されます。

- **支配的な言語の処理:** 言語が混在するシナリオでは、検出エンジンが支配的な言語を識別する可能性が高く、対応するアナライザーがテキスト全体に適用されます。その結果、埋め込まれた外国語テキストについては、トークン化の品質が低下するか、まったくトークン化されない可能性があります。

