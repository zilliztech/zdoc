---
title: "Language Identifier | Cloud"
slug: /language-identifier-tokenizer
sidebar_label: "Language Identifier"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`languageidentifier` は、言語分析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するように設計された特殊なトークナイザーです。その主な機能は、テキストフィールドの言語を検出し、その言語に最も適した事前設定されたアナライザーを動的に適用することです。これは、さまざまな言語を処理するアプリケーションにとって特に価値があり、入力ごとに手動で言語を割り当てる必要性を排除します。| Cloud"
type: origin
token: X6wiwFkuFiF8nekse05cnBIPnic
sidebar_position: 6
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - language identifier
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems

---

import Admonition from '@theme/Admonition';


# Language Identifier

`language_identifier` は、言語分析プロセスを自動化することで Zilliz Cloud のテキスト検索機能を強化するように設計された特殊なトークナイザーです。その主な機能は、テキストフィールドの言語を検出し、その言語に最も適した事前設定されたアナライザーを動的に適用することです。これは、さまざまな言語を処理するアプリケーションにとって特に価値があり、入力ごとに手動で言語を割り当てる必要性を排除します。

`language_identifier` は、適切な処理パイプラインにテキストデータを賢くルーティングすることで、多言語データの取り込みを合理化し、その後の検索および検索操作のための正確なトークナイズを保証します。

## 言語検出ワークフロー\{#language-detection-workflow}

`language_identifier` は、文字列を処理するために一連のステップを実行し、ユーザーがそれを正しく設定する方法を理解するために重要なワークフローです。

![NZcFw5PuxhQcl1bUG60cS54QnMu](/img/NZcFw5PuxhQcl1bUG60cS54QnMu.png)

1. **入力:** ワークフローは、文字列を入力として開始されます。

1. **言語検出:** この文字列は最初に言語検出エンジンに渡され、言語を識別しようと試みます。Zilliz Cloud は 2 つのエンジンをサポートしています：**whatlang** と **lingua**。

1. **アナライザー選択:**

    - **成功:** 言語が正常に検出された場合、システムは検出された言語名に応じたアナライザーが `analyzers` 辞書内に構成されているかどうかを確認します。一致が見つかった場合、システムは指定されたアナライザーを入力テキストに適用します。たとえば、検出された "Mandarin" テキストは `jieba` トークナイザーにルーティングされます。

    - **フォールバック:** 検出が失敗した場合、または言語が正常に検出されたが特定のアナライザーが提供されていない場合は、システムは事前設定された **デフォルトアナライザー** にデフォルトで戻ります。これは重要な明確化のポイントです。`default` アナライザーは、検出失敗と一致するアナライザーが存在しない場合の両方のフォールバックです。

適切なアナライザーが選択された後、テキストはトークナイズされ処理され、ワークフローが完了します。

## 利用可能な言語検出エンジン\{#available-language-detection-engines}

Zilliz Cloud は、2 つの言語検出エンジンから選択できます：

- [whatlang](https://github.com/greyblake/whatlang-rs)

- [lingua](https://github.com/pemistahl/lingua)

選択は、アプリケーションの特定のパフォーマンスおよび精度要件に依存します。

<table>
   <tr>
     <th><p>エンジン</p></th>
     <th><p>速度</p></th>
     <th><p>精度</p></th>
     <th><p>出力形式</p></th>
     <th><p>最適な用途</p></th>
   </tr>
   <tr>
     <td><p><code>whatlang</code></p></td>
     <td><p>高速</p></td>
     <td><p>ほとんどの言語に適しています</p></td>
     <td><p>言語名 (例：<code>"English"</code>, <code>"Mandarin"</code>, <code>"Japanese"</code>)</p><p><strong>参考:</strong> <a href="https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md">サポートされている言語テーブルの言語列</a></p></td>
     <td><p>速度が重要なリアルタイムアプリケーション</p></td>
   </tr>
   <tr>
     <td><p><code>lingua</code></p></td>
     <td><p>低速</p></td>
     <td><p>特に短いテキストでより高い精度</p></td>
     <td><p>英語の言語名 (例：<code>"English"</code>, <code>"Chinese"</code>, <code>"Japanese"</code>)</p><p><strong>参考:</strong> <a href="https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported">サポートされている言語リスト</a></p></td>
     <td><p>速度よりも精度が重要なアプリケーション</p></td>
   </tr>
</table>

重要な考慮事項は、エンジンの命名規則です。両方のエンジンは英語の言語名を返しますが、一部の言語には異なる用語を使用します（例：`whatlang` は `Mandarin` を返し、`lingua` は `Chinese` を返します）。アナライザーのキーは、選択した検出エンジンが返す名前と完全に一致する必要があります。

## 設定\{#configuration}

`language_identifier` トークナイザーを正しく使用するには、設定を定義および適用するために以下の手順を実施する必要があります。

### ステップ 1: 言語とアナライザーを選択\{#step-1-choose-your-languages-and-analyzers}

`language_identifier` の設定の核となるのは、サポートする特定の言語に合わせてアナライザーを調整することです。システムは検出された言語と正しいアナライザーを一致させて動作するため、このステップは正確なテキスト処理にとって不可欠です。

以下は、言語から適切な Zilliz Cloud アナライザーへの推奨マッピングです。このテーブルは、言語検出エンジンの出力と適切なツールとの間の橋渡しをします。

<table>
   <tr>
     <th><p>言語（検出器の出力）</p></th>
     <th><p>推奨アナライザー</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>English</code></p></td>
     <td><p><code>type: english</code></p></td>
     <td><p>ステミングとストップワードフィルタリングを含む標準的な英語トークナイズ。</p></td>
   </tr>
   <tr>
     <td><p><code>Mandarin</code> (whatlang 経由) または <code>Chinese</code> (lingua 経由)</p></td>
     <td><p><code>tokenizer: jieba</code></p></td>
     <td><p>スペース区切りでないテキストの中国語単語セグメンテーション。</p></td>
   </tr>
   <tr>
     <td><p><code>Japanese</code></p></td>
     <td><p><code>tokenizer: icu</code></p></td>
     <td><p>日本語を含む複雑なスクリプト用の堅牢なトークナイザー。</p></td>
   </tr>
   <tr>
     <td><p><code>French</code></p></td>
     <td><p><code>type: standard</code>, <code>filter: ["lowercase", "asciifolding"]</code></p></td>
     <td><p>フランス語のアクセントと文字を処理するカスタム設定。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p><strong>一致が鍵:</strong> アナライザー名は<strong>完全に一致する必要があります</strong>検出エンジンの言語出力と。たとえば、<code>whatlang</code> を使用している場合、中国語テキストのキーは <code>Mandarin</code> でなければなりません。</p></li>
<li><p><strong>ベストプラクティス:</strong> 上記のテーブルはいくつかの一般的な言語の推奨設定を提供していますが、網羅的なリストではありません。アナライザー選択に関するより包括的なガイドについては、<a href="./choose-the-right-analyzer-for-your-use-case">ユースケースに適したアナライザーの選択</a>を参照してください。</p></li>
<li><p><strong>検出器の出力</strong>: 検出エンジンが返す言語名の完全なリストについては、<a href="https://github.com/greyblake/whatlang-rs">Whatlang サポートされている言語テーブル</a>および <a href="https://github.com/pemistahl/lingua-rs">Lingua サポートされている言語リスト</a>を参照してください。</p></li>
</ul>

</Admonition>

### ステップ 2: analyzer_params の定義\{#step-2-define-analyzerparams}

Zilliz Cloud で `language_identifier` トークナイザーを使用するには、これらの主要コンポーネントを含む辞書を作成します：

**必須コンポーネント:**

- `analyzers` 設定セット - 以下のすべてのアナライザー設定を含む辞書：

    - `default` - 言語検出が失敗した場合または一致するアナライザーが見つからない場合に使用されるフォールバックアナライザー

    - **言語固有のアナライザー** - 各アナライザーを `<analyzer_name>: <analyzer_config>` として定義し、以下の通り：

        - `analyzer_name` は選択した検出エンジンの出力と一致（例：<code>"English"</code>, <code>"Japanese"</code>）

        - `analyzer_config` は標準のアナライザーのパラメータ形式に従う（参考：[アナライザー概要](./analyzer-overview#analyzer-types)）

**オプションコンポーネント:**

- `identifier` - 使用する言語検出エンジンを指定（<code>whatlang</code> または <code>lingua</code>）。指定されていない場合はデフォルトで <code>whatlang</code>

- `mapping` - アナライザーのカスタムエイリアスを作成し、検出エンジンの正確な出力形式の代わりに説明的な名前を使用できるようにする

トークナイザーは、最初に入力テキストの言語を検出し、次に設定から適切なアナライザーを選択することで動作します。検出が失敗した場合または一致するアナライザーが存在しない場合は、自動的に `default` アナライザーにフォールバックします。

#### 推奨: 直接名前マッチング\{#recommended-direct-name-matching}

アナライザー名は、選択した言語検出エンジンの出力と完全に一致する必要があります。このアプローチは単純で、潜在的な混乱を回避します。

`whatlang` と `lingua` の両方について、それぞれのドキュメンテーションに示されている言語名を使用してください：

- [whatlang サポートされている言語](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md) (「**言語**」列を使用)

- [lingua サポートされている言語](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported)

```python
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",  # `language_identifier` でなければならない
        "identifier": "whatlang",  # または `lingua`
        "analyzers": {  # アナライザー設定のセット
            "default": {
                "tokenizer": "standard"  # 言語検出が失敗した場合のフォールバック
            },
            "English": {  # whatlang の出力と一致するアナライザー名
                "type": "english"
            },
            "Mandarin": {  # whatlang の出力と一致するアナライザー名
                "tokenizer": "jieba"
            }
        }
    }
}
```

#### 代替アプローチ: マッピング付きのカスタム名\{#alternative-approach-custom-names-with-mapping}

カスタムアナライザー名を使用することを好み、または既存の設定との互換性を維持する必要がある場合は、`mapping` パラメータを使用できます。これにより、アナライザーのエイリアスが作成され、元の検出エンジン名とカスタム名の両方が機能します。

```python
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {
                "tokenizer": "standard"
            },
            "english_analyzer": {  # カスタムアナライザー名
                "type": "english"
            },
            "chinese_analyzer": {  # カスタムアナライザー名
                "tokenizer": "jieba"
            }
        },
        "mapping": {
            "English": "english_analyzer",   # 検出出力をカスタム名にマッピング
            "Chinese": "chinese_analyzer"
        }
    }
}
```

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用して、そのフィールド内のテキストを効率的なトークナイズおよびフィルタリングのために処理できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

一般的なシナリオのためのすぐに使用できる設定がいくつかあります。各例には、設定と検証コードが含まれており、すぐにセットアップをテストできます。

### 英語と中国語の検出\{#english-and-chinese-detection}

```python
from pymilvus import MilvusClient

# 設定
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

# 設定をテスト
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 英語テキスト
result_en = client.run_analyzer("The Milvus vector database is built for scale!", analyzer_params)
print("English:", result_en)
# 出力:
# English: ['The', 'Milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']

# 中国語テキスト
result_cn = client.run_analyzer("Milvus向量数据库专为大规模应用而设计", analyzer_params)
print("Chinese:", result_cn)
# 出力:
# Chinese: ['Milvus', '向量', '数据', '据库', '数据库', '专', '为', '大规', '规模', '大规模', '应用', '而', '设计']
```

### アクセント正規化付きヨーロッパ言語\{#european-languages-with-accent-normalization}

```python
# フランス語、ドイツ語、スペイン語など向けの設定
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

# アクセント付きテキストでテスト
result_fr = client.run_analyzer("Café français très délicieux", analyzer_params)
print("French:", result_fr)
# 出力:
# French: ['cafe', 'francais', 'tres', 'delicieux']
```

## 使用に関する注意事項\{#usage-notes}

- **フィールドごとの単一言語:** 単一の均質なテキストユニットとしてフィールドを処理します。英語の文を含むレコードと次にフランス語の文を含むレコードなど、異なるレコード間で異なる言語を処理するように設計されています。

- **混合言語文字列はなし:** 単一の文字列に複数の言語のテキストを含むことを処理する<strong>わけではありません</strong>。たとえば、英語の文と引用された日本語のフレーズの両方を含む単一の `VARCHAR` フィールドは、単一言語として処理されます。

- **主要言語処理:** 混合言語シナリオでは、検出エンジンは主要言語を識別しそれに応じたアナライザーが全体のテキストに適用されます。これにより、埋め込まれた外国語のトークナイズが不適切または行われない結果になります。