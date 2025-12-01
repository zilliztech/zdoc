---
title: "言語識別子 | BYOC"
slug: /language-identifier-tokenizer
sidebar_label: "Language Identifier"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`languageidentifier`は、言語分析プロセスを自動化することでZilliz Cloudのテキスト検索機能を強化するように設計された特殊なトークナイザーです。その主な機能は、テキストフィールドの言語を検出し、その後その言語に最も適した事前設定されたアナライザーを動的に適用することです。これは特にさまざまな言語を扱うアプリケーションに価値があり、入力ごとに手動で言語を割り当てる必要性を排除します。| BYOC"
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
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search

---

import Admonition from '@theme/Admonition';


# 言語識別子

`language_identifier`は、言語分析プロセスを自動化することでZilliz Cloudのテキスト検索機能を強化するように設計された特殊なトークナイザーです。その主な機能は、テキストフィールドの言語を検出し、その後その言語に最も適した事前設定されたアナライザーを動的に適用することです。これは特にさまざまな言語を扱うアプリケーションに価値があり、入力ごとに手動で言語を割り当てる必要性を排除します。

適切な処理パイプラインにテキストデータをインテリジェントにルーティングすることにより、`language_identifier`は多言語データの取り込みを合理化し、その後の検索および検索操作のための正確なトークン化を保証します。

## 言語検出ワークフロー\{#language-detection-workflow}

`language_identifier`は、テキスト文字列を処理するために一連の手順を実行します。このワークフローは、ユーザーがこれを正しく構成する方法を理解するために重要です。

![NZcFw5PuxhQcl1bUG60cS54QnMu](/img/NZcFw5PuxhQcl1bUG60cS54QnMu.png)

1. **入力:** ワークフローは、入力としてテキスト文字列から始まります。

1. **言語検出:** この文字列は最初に言語検出エンジンに渡され、言語を識別しようとします。Zilliz Cloudは2つのエンジンをサポートしています：**whatlang**および**lingua**。

1. **アナライザー選択:**

    - **成功:** 言語が正常に検出された場合、システムは検出された言語名に対応するアナライザーが`analyzers`辞書内に構成されているかどうかを確認します。一致が見つかった場合、システムは指定されたアナライザーを入力テキストに適用します。たとえば、検出された"Mandarin"テキストは`jieba`トークナイザーにルーティングされます。

    - **フォールバック:** 検出が失敗した場合、または言語が正常に検出されたがその特定のアナライザーを提供していない場合、システムは事前設定された**defaultアナライザー**にデフォルトで戻ります。これは明確にする重要な点です。`default`アナライザーは検出失敗と一致するアナライザーの不在の両方に対するフォールバックです。

適切なアナライザーが選択されると、テキストはトークン化されて処理され、ワークフローが完了します。

## 利用可能な言語検出エンジン\{#available-language-detection-engines}

Zilliz Cloudは2つの言語検出エンジンの間で選択を提供します：

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
     <td><p>多くの言語において良好</p></td>
     <td><p>言語名（例：<code>"English"</code>, <code>"Mandarin"</code>, <code>"Japanese"</code>）</p><p><strong>参考：</strong><a href="https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md">サポートされている言語の表の言語列</a></p></td>
     <td><p>速度が重要なリアルタイムアプリケーション</p></td>
   </tr>
   <tr>
     <td><p><code>lingua</code></p></td>
     <td><p>遅い</p></td>
     <td><p>より高い精度、特に短いテキストのため</p></td>
     <td><p>英語の言語名（例：<code>"English"</code>, <code>"Chinese"</code>, <code>"Japanese"</code>）</p><p><strong>参考：</strong><a href="https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported">サポートされている言語リスト</a></p></td>
     <td><p>速度よりも精度が重要なアプリケーション</p></td>
   </tr>
</table>

重要な検討事項はエンジンの命名規則です。両方のエンジンが英語の言語名を返すにしても、いくつかの言語には異なる用語を使用します（例：`whatlang`は`Mandarin`を返しますが、`lingua`は`Chinese`を返します）。アナライザーのキーは、選択した検出エンジンが返す名前と完全に一致する必要があります。

## 構成\{#configuration}

`language_identifier`トークナイザーを正しく使用するには、以下の手順を実行して構成を定義および適用する必要があります。

### ステップ1: 言語とアナライザーを選択\{#step-1-choose-your-languages-and-analyzers}

`language_identifier`の設定の核心は、サポートする特定の言語に合わせてアナライザーを調整することです。このシステムは、検出された言語と正しいアナライザーを一致させることで動作するため、このステップはテキスト処理の正確性に不可欠です。

以下は、言語と適切なZilliz Cloudアナライザーの推奨マッピングです。この表は、言語検出エンジンの出力と最適なツールの間の橋渡しをします。

<table>
   <tr>
     <th><p>言語（検出器の出力）</p></th>
     <th><p>推奨アナライザー</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>English</code></p></td>
     <td><p><code>type: english</code></p></td>
     <td><p>ステミングとストップワードフィルタリング付きの標準的な英語トークン化。</p></td>
   </tr>
   <tr>
     <td><p><code>Mandarin</code>（via whatlang）または <code>Chinese</code>（via lingua）</p></td>
     <td><p><code>tokenizer: jieba</code></p></td>
     <td><p>スペースで区切られていない中国語テキストのための中国語語彙分割。</p></td>
   </tr>
   <tr>
     <td><p><code>Japanese</code></p></td>
     <td><p><code>tokenizer: icu</code></p></td>
     <td><p>日本語を含む複雑なスクリプトのための堅牢なトークナイザー。</p></td>
   </tr>
   <tr>
     <td><p><code>French</code></p></td>
     <td><p><code>type: standard</code>, <code>filter: ["lowercase", "asciifolding"]</code></p></td>
     <td><p>フランス語のアクセントと文字を処理するカスタム構成。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p><strong>一致が重要：</strong>アナライザーの名前は検出エンジンの言語出力と<strong>完全に一致する必要があります</strong>。たとえば、<code>whatlang</code>を使用している場合、中国語テキストのキーは<code>Mandarin</code>でなければなりません。</p></li>
<li><p><strong>ベストプラクティス：</strong>上の表はいくつかの一般的な言語に対応する推奨構成を提供していますが、すべてを網羅したリストではありません。アナライザー選択のより包括的なガイドについては、<a href="./choose-the-right-analyzer-for-your-use-case">ニーズに合った正しいアナライザーの選択</a>を参照してください。</p></li>
<li><p><strong>検出器の出力</strong>：検出エンジンが返す言語名の完全なリストについては、<a href="https://github.com/greyblake/whatlang-rs">Whatlangサポート言語表</a>および<a href="https://github.com/pemistahl/lingua-rs">Linguaサポート言語リスト</a>を参照してください。</p></li>
</ul>

</Admonition>

### ステップ2: analyzer_paramsを定義\{#step-2-define-analyzerparams}

Zilliz Cloudで`language_identifier`トークナイザーを使用するには、これらの主要コンポーネントを含む辞書を作成します：

**必須コンポーネント:**

- `analyzers`構成セット – すべてのアナライザー構成を含む辞書で、以下のものを含む必要があります：

    - `default` – 言語検出が失敗した場合または一致するアナライザーが見つからない場合に使用されるフォールバックアナライザー

    - **言語固有のアナライザー** – 各々が`<analyzer_name>: <analyzer_config>`として定義され、以下の通りです：

        - `analyzer_name`は選択した検出エンジンの出力と一致する必要があります（例："English"、"Japanese"）

        - `analyzer_config`は標準のアナライザーパラメータ形式に従います（[アナライザー概要](./analyzer-overview#analyzer-types)を参照）

**オプションコンポーネント:**

- `identifier` – 使用する言語検出エンジンを指定します（`whatlang`または`lingua`）。指定しない場合はデフォルトで`whatlang`になります

- `mapping` – アナライザーのカスタムエイリアスを作成し、検出エンジンの正確な出力形式の代わりに説明的な名前を使用できるようにします

このトークナイザーは、最初に入力テキストの言語を検出し、次に構成から適切なアナライザーを選択します。検出が失敗した場合、または一致するアナライザーが存在しない場合は、自動的に`default`アナライザーにフォールバックします。

#### 推奨：直接名前マッチング\{#recommended-direct-name-matching}

アナライザー名は選択した言語検出エンジンの出力と完全に一致する必要があります。このアプローチはより簡単で、潜在的な混乱を避けます。

`whatlang`と`lingua`の両方で、それぞれのドキュメントに示されている言語名を使用してください：

- [whatlangサポート言語](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md)（「**Language**」列を使用）

- [linguaサポート言語](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported)

```python
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",  # `language_identifier`でなければなりません
        "identifier": "whatlang",  # または `lingua`
        "analyzers": {  # アナライザー構成のセット
            "default": {
                "tokenizer": "standard"  # 言語検出が失敗した場合のフォールバック
            },
            "English": {  # whatlang出力と一致するアナライザー名
                "type": "english"
            },
            "Mandarin": {  # whatlang出力と一致するアナライザー名
                "tokenizer": "jieba"
            }
        }
    }
}
```

#### 代替アプローチ：マッピングによるカスタム名\{#alternative-approach-custom-names-with-mapping}

カスタムアナライザー名を使用することを好む場合や、既存の構成との互換性を維持する必要がある場合は、`mapping`パラメータを使用できます。これによりアナライザーのエイリアスが作成され、元の検出エンジン名とカスタム名の両方が機能します。

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

`analyzer_params`を定義した後、コレクションスキーマを定義する際に`VARCHAR`フィールドに適用できます。これにより、Zilliz Cloudは、指定されたアナライザーを使用してそのフィールド内のテキストを効率的にトークン化およびフィルタリング処理できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

一般的なシナリオのためのすぐに使用できる構成をいくつか紹介します。各例には構成と検証コードが含まれており、すぐにセットアップをテストできます。

### 英語と中国語の検出\{#english-and-chinese-detection}

```python
from pymilvus import MilvusClient

# 構成
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

# 構成をテスト
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

### アクセント正規化付きのヨーロッパ言語\{#european-languages-with-accent-normalization}

```python
# フランス語、ドイツ語、スペイン語など用の構成
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

## 使用上の注意\{#usage-notes}

- **フィールドあたり単一言語：** 1つの均質なテキスト単位としてフィールドを操作します。これは異なるデータレコード間で異なる言語を処理するように設計されています。たとえば、あるレコードに英語の文が含まれていて、次のレコードにフランス語の文が含まれている場合などです。

- **混合言語文字列なし：** 1つの文字列に複数の言語のテキストを含める処理は**設計されていません**。たとえば、1つの`VARCHAR`フィールドに英語の文と引用された日本語のフレーズの両方が含まれている場合、1つの言語として処理されます。

- **支配的な言語処理：** 混合言語シナリオでは、検出エンジンはおそらく支配的な言語を識別し、対応するアナライザーがテキスト全体に適用されます。これにより、埋め込まれた外国語のトークン化が不適切またはできない結果となります。
