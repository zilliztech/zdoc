---
title: "言語識別子 | Cloud"
slug: /language-identifier-tokenizer
sidebar_label: "言語識別子"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`languageidentifier` は、言語分析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するために設計された特殊な tokenizer です。主な機能は、テキストフィールドの言語を検出し、その言語に最も適した事前設定済みの analyzer を動的に適用することです。これは、さまざまな言語を扱うアプリケーションにとって特に有用で、入力ごとに手動で言語を割り当てる必要がなくなります。 | Cloud"
type: origin
token: X6wiwFkuFiF8nekse05cnBIPnic
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 言語識別子

`language_identifier` は、言語分析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するために設計された特殊な tokenizer です。主な機能は、テキストフィールドの言語を検出し、その言語に最も適した事前設定済みの analyzer を動的に適用することです。これは、さまざまな言語を扱うアプリケーションにとって特に有用で、入力ごとに手動で言語を割り当てる必要がなくなります。

テキストデータを適切な処理パイプラインへインテリジェントにルーティングすることで、`language_identifier` は多言語データの取り込みを効率化し、その後の検索および取得操作に向けて正確なトークン化を保証します。

## 言語検出ワークフロー\{#language-detection-workflow}

`language_identifier` は、テキスト文字列を処理するために一連の手順を実行します。このワークフローは、ユーザーが正しく設定する方法を理解するうえで重要です。

![NZcFw5PuxhQcl1bUG60cS54QnMu](https://zdoc-images.s3.us-west-2.amazonaws.com/NZcFw5PuxhQcl1bUG60cS54QnMu.png)

1. **入力:** ワークフローは、入力としてのテキスト文字列から始まります。

1. **言語検出:** この文字列はまず言語検出エンジンに渡され、言語の識別が試行されます。Zilliz Cloud は **whatlang** と **lingua** の 2 つのエンジンをサポートしています。

1. **Analyzer の選択:**

    - **成功:** 言語が正常に検出されると、システムは検出された言語名に対応する analyzer が `analyzers` dictionary に設定されているかを確認します。一致するものが見つかった場合、システムは指定された analyzer を入力テキストに適用します。たとえば、検出された "Mandarin" テキストは `jieba` tokenizer にルーティングされます。

    - **フォールバック:** 検出に失敗した場合、または言語が正常に検出されてもその言語に対する特定の analyzer を提供していない場合、システムは事前設定済みの **default analyzer** を使用します。これは重要な明確化ポイントです。`default` analyzer は、検出失敗と一致する analyzer が存在しない場合の両方に対するフォールバックです。

適切な analyzer が選択されると、テキストはトークン化および処理され、ワークフローが完了します。

## 利用可能な言語検出エンジン\{#available-language-detection-engines}

Zilliz Cloud では、2 つの言語検出エンジンから選択できます。

- [whatlang](https://github.com/greyblake/whatlang-rs)

- [lingua](https://github.com/pemistahl/lingua)

選択は、アプリケーションの具体的なパフォーマンスおよび精度要件によって決まります。

| エンジン | 速度 | 精度 | 出力形式 | 最適な用途 |
| --- | --- | --- | --- | --- |
| `whatlang` | 高速 | ほとんどの言語で良好 | 言語名（例: `"English"`、 `"Mandarin"`、`"Japanese"`）<br/>**参照:** [サポート言語テーブルの Language 列](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md) | 速度が重要なリアルタイムアプリケーション |
| `lingua` | 遅め | より高精度、特に短いテキストで有効 | 英語の言語名（例: `"English"`、`"Chinese"`、`"Japanese"`）<br/>**参照:** [サポート言語リスト](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported) | 速度よりも精度が重要なアプリケーション |

重要な考慮事項は、エンジンの命名規則です。どちらのエンジンも英語で言語名を返しますが、一部の言語では異なる用語を使用します（例: `whatlang` は `Mandarin` を返し、`lingua` は `Chinese` を返します）。analyzer のキーは、選択した検出エンジンが返す名前と完全に一致している必要があります。

## 設定\{#configuration}

`language_identifier` tokenizer を正しく使用するには、次の手順に従って設定を定義し適用する必要があります。

### ステップ 1: 言語と analyzer を選択する\{#step-1-choose-your-languages-and-analyzers}

`language_identifier` の設定の中核は、サポート予定の特定の言語に合わせて analyzer を調整することです。システムは、検出された言語を正しい analyzer と照合することで動作するため、この手順は正確なテキスト処理にとって重要です。

以下は、言語と適切な Zilliz Cloud analyzer の推奨マッピングです。この表は、言語検出エンジンの出力と、その処理に最適なツールをつなぐ橋渡しとして機能します。

| 言語（検出器の出力） | 推奨 analyzer | 説明 |
| --- | --- | --- |
| `English` | `type: english` | stemming と stop-word filtering を備えた標準的な英語のトークン化。 |
| `Mandarin`（whatlang 経由）または `Chinese`（lingua 経由） | `tokenizer: jieba` | スペースで区切られないテキスト向けの中国語単語分割。 |
| `Japanese` | `tokenizer: icu` | 日本語を含む複雑な文字体系向けの堅牢な tokenizer。 |
| `French` | `type: standard`, `filter: ["lowercase", "asciifolding"]` | フランス語のアクセントや文字を処理するカスタム設定。 |

<Admonition type="info" icon="📘" title="Notes">

- **一致が重要:** analyzer の名前は、検出エンジンの言語出力と**完全に一致**している必要があります。たとえば、`whatlang` を使用している場合、中国語テキストのキーは `Mandarin` である必要があります。

- **ベストプラクティス:** 上記の表は、いくつかの一般的な言語に対する推奨設定を示していますが、網羅的なリストではありません。analyzer の選択に関するより包括的なガイドについては、[ユースケースに適した analyzer を選択する](./choose-the-right-analyzer-for-your-use-case)を参照してください。

- **検出器の出力**: 検出エンジンが返す言語名の完全なリストについては、[Whatlang サポート言語テーブル](https://github.com/greyblake/whatlang-rs)および [Lingua サポート言語リスト](https://github.com/pemistahl/lingua-rs)を参照してください。

</Admonition>

### ステップ 2: analyzer_params を定義する\{#step-2-define-analyzerparams}

Zilliz Cloud で `language_identifier` tokenizer を使用するには、次の主要コンポーネントを含む dictionary を作成します。

**必須コンポーネント:**

- `analyzers` config set – すべての analyzer 設定を含む dictionary で、以下を含める必要があります。

    - `default` – 言語検出が失敗した場合、または一致する analyzer が見つからない場合に使用されるフォールバック analyzer

    - **言語固有の analyzer** – それぞれ `<analyzer_name>: <analyzer_config>` として定義されます。ここで:

        - `analyzer_name` は選択した検出エンジンの出力と一致します（例: `"English"`、`"Japanese"`）

        - `analyzer_config` は標準の analyzer パラメータ形式に従います（[Analyzer の概要](./analyzer-overview#analyzer-types)を参照）

**任意コンポーネント:**

- `identifier` – 使用する言語検出エンジン（`whatlang` または `lingua`）を指定します。指定しない場合、デフォルトは `whatlang` です

- `mapping` – analyzer に対するカスタムエイリアスを作成し、検出エンジンの正確な出力形式の代わりに説明的な名前を使用できるようにします

tokenizer は、まず入力テキストの言語を検出し、その後、設定から適切な analyzer を選択することで動作します。検出に失敗した場合、または一致する analyzer が存在しない場合は、自動的に `default` analyzer にフォールバックします。

#### 推奨: 直接の名前一致\{#recommended-direct-name-matching}

analyzer 名は、選択した言語検出エンジンの出力と完全に一致させる必要があります。このアプローチはよりシンプルで、潜在的な混乱を避けられます。

`whatlang` と `lingua` の両方について、それぞれのドキュメントに示されている言語名を使用してください。

- [whatlang サポート言語](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md)（"**Language**" 列を使用）

- [lingua サポート言語](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported)

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

カスタム analyzer 名を使用したい場合、または既存の設定との互換性を維持する必要がある場合は、`mapping` パラメータを使用できます。これにより analyzer のエイリアスが作成され、元の検出エンジン名とカスタム名の両方が使用できるようになります。

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

`analyzer_params` を定義した後、collection schema を定義する際に `VARCHAR` フィールドへ適用できます。これにより、Zilliz Cloud はそのフィールド内のテキストを指定された analyzer で処理し、効率的なトークン化と filtering を実現できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

一般的なシナリオ向けの、すぐに使用できる設定をいくつか示します。各例には設定と検証コードの両方が含まれているため、セットアップをすぐにテストできます。

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

- **フィールドごとに単一言語:** フィールドを単一で同質なテキスト単位として扱います。あるレコードには英語の文が含まれ、次のレコードにはフランス語の文が含まれる、といった異なるデータレコード間で異なる言語を扱うように設計されています。

- **混在言語文字列には非対応:** 複数の言語のテキストを含む単一文字列を扱うようには**設計されていません**。たとえば、英語の文と引用された日本語フレーズの両方を含む単一の `VARCHAR` フィールドは、単一の言語として処理されます。

- **主要言語の処理:** 混在言語のシナリオでは、検出エンジンは主要な言語を識別する可能性が高く、対応する analyzer がテキスト全体に適用されます。その結果、埋め込まれた外国語テキストに対してトークン化が不十分になるか、まったく行われない可能性があります。

