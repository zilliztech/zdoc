---
title: "ユースケースに適したアナライザーの選択 | Cloud"
slug: /choose-the-right-analyzer-for-your-use-case
sidebar_label: "ベストプラクティス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドは、Zilliz Cloudでテキストコンテンツに最も適したアナライザーを選択および構成する方法を説明します。 | Cloud"
type: origin
token: Pulhw06e5iXJTFkidFXcGbylnod
sidebar_position: 6
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - best
  - practice
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# ユースケースに適したアナライザーの選択

このガイドは、Zilliz Cloudでテキストコンテンツに最も適した**アナライザー**を選択および構成する方法を説明します。

**実践的な意思決定**に焦点を当てています: 使用するアナライザー、カスタマイズが必要な場合、構成を検証する方法。アナライザーの構成要素とパラメーターの背景情報については、[アナライザー概要](./analyzer-overview)を参照してください。

## クイック概念: アナライザーの動作\{#quick-concept-how-analyzers-work}

アナライザーは、[全文検索](./full-text-search) (BM25ベース)、[フレーズマッチ](./phrase-match)、または[テキストマッチ](./text-match)などの機能で検索可能なようにテキストデータを処理します。2段階のパイプラインを通じて生のテキストを検索可能なトークンに変換します。

![JwMZwIYUwhbSZ4bjhxcc1PfNnvx](/img/JwMZwIYUwhbSZ4bjhxcc1PfNnvx.png)

1. **トークナイズ (必須)**: まずこのステージで**トークナイザー**を適用し、連続したテキスト文字列をトークンと呼ばれる離散的で意味のある単位に分解します。トークナイズ方法は言語やコンテンツの種類によって大きく異なります。

1. **トークンフィルタリング (オプション)**: トークナイズの後、**フィルター**が適用されてトークンを変更、削除、または洗練します。これらの操作には、すべてのトークンを小文字に変換、一般的で意味のない単語（ストップワードなど）を削除、または単語を原型に縮小（ステミング）することが含まれます。

例:

```plaintext
入力: "Hello World!"
       1. トークナイズ → ["Hello", "World", "!"]
       2. 小文字化および句読点フィルタリング → ["hello", "world"]
```

## アナライザー選択が重要な理由\{#why-the-choice-of-analyzer-matters}

選択したアナライザーは、**検索の品質と関連性**に直接影響します。

不適切なアナライザーは、過剰または不十分なトークナイズ、用語の欠落、または無関係な結果を引き起こす可能性があります。

<table>
   <tr>
     <th><p>問題</p></th>
     <th><p>症状</p></th>
     <th><p>例 (入力 & 出力)</p></th>
     <th><p>原因 (悪いアナライザー)</p></th>
     <th><p>解決策 (良いアナライザー)</p></th>
   </tr>
   <tr>
     <td><p>過剰なトークナイズ</p></td>
     <td><p>技術用語、識別子、またはURLの誤分割</p></td>
     <td><ul><li><p><code>"user_id"</code> → <code>['user', 'id']</code></p></li><li><p><code>"C++"</code> → <code>['c']</code></p></li></ul></td>
     <td><p><a href="./standard-analyzer"><code>standard</code></a> アナライザー</p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーを使用; <a href="./alphanumonly-filter"><code>alphanumonly</code></a> フィルターと組み合わせる。</p></td>
   </tr>
   <tr>
     <td><p>不十分なトークナイズ</p></td>
     <td><p>複数語のフレーズが1つのトークンとして扱われる</p></td>
     <td><p><code>"state-of-the-art"</code> → <code>['state-of-the-art']</code></p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーを使用するアナライザー</p></td>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a> トークナイザーを使用して句読点とスペースで分割; カスタム <a href="./regex-filter">regex</a> フィルターを使用。</p></td>
   </tr>
   <tr>
     <td><p>言語の不一致</p></td>
     <td><p>外国語の結果が意味をなさない</p></td>
     <td><p>中国語テキスト: <code>"机器学习"</code> → <code>['机器学习']</code> (1つのトークン)</p></td>
     <td><p><a href="./english-analyzer"><code>english</code></a> アナライザー</p></td>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a> などの言語固有のアナライザーを使用。</p></td>
   </tr>
</table>

## ステップ1: アナライザーを選択する必要がありますか？\{#step-1-do-you-need-to-choose-an-analyzer}

テキスト検索機能（例：**全文検索**、**フレーズマッチ**、または**テキストマッチ**）を使用しているが**明示的にアナライザーを指定しない**場合、

Zilliz Cloudは自動的に[standard analyzer](./standard-analyzer)を適用します。

**Standard analyzerの動作**:

- スペースと句読点でテキストを分割

- すべてのトークンを小文字に変換

**変換例**:

```plaintext
入力:  "The Milvus vector database is built for scale!"
出力: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']
```

## ステップ2: standard analyzerがニーズに合っているか確認\{#step-2-check-if-the-standard-analyzer-meets-your-needs}

この表を使用して、デフォルトの[`standard`](./standard-analyzer)[ analyzer](./standard-analyzer)がニーズに合っているか迅速に判断してください。合っていなければ、[異なるパスを選択](./choose-the-right-analyzer-for-your-use-case#step-3-choose-your-path)する必要があります。

<table>
   <tr>
     <th><p>コンテンツ</p></th>
     <th><p>Standard AnalyzerでOK?</p></th>
     <th><p>理由</p></th>
     <th><p>必要事項</p></th>
   </tr>
   <tr>
     <td><p>英語のブログ記事</p></td>
     <td><p>✅ はい</p></td>
     <td><p>デフォルト動作で十分。</p></td>
     <td><p>デフォルトを使用（構成不要）。</p></td>
   </tr>
   <tr>
     <td><p>中国語ドキュメント</p></td>
     <td><p>❌ いいえ</p></td>
     <td><p>中国語の単語にはスペースがないため1つのトークンとして処理される。</p></td>
     <td><p>組み込み <a href="./chinese-analyzer"><code>chinese</code></a> アナライザーを使用。</p></td>
   </tr>
   <tr>
     <td><p>技術文書</p></td>
     <td><p>❌ いいえ</p></td>
     <td><p><code>C++</code>のような用語から句読点が削除される。</p></td>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a> トークナイザーと <a href="./alphanumonly-filter"><code>alphanumonly</code></a> フィルターでカスタムアナライザーを作成。</p></td>
   </tr>
   <tr>
     <td><p>フランス語/スペイン語などスペースで区切られた言語</p></td>
     <td><p>⚠️ たぶん</p></td>
     <td><p>アクセント付き文字 (<code>café</code> vs. <code>cafe</code>) が一致しない可能性。</p></td>
     <td><p>より良い結果を得るために <a href="./ascii-folding-filter"><code>asciifolding</code></a> でカスタムアナライザーを使用することを推奨。</p></td>
   </tr>
   <tr>
     <td><p>多言語または不明な言語</p></td>
     <td><p>❌ いいえ</p></td>
     <td><p><code>standard</code> アナライザーは、異なる文字セットとトークナイズ規則を処理するために必要な言語固有のロジックを持っていません。</p></td>
     <td><p>unicode対応のトークナイズのために <a href="./icu-tokenizer"><code>icu</code></a> トークナイザーでカスタムアナライザーを使用。 </p><p>また、多言語コンテンツのより正確な処理のために <a href="./multi-language-analyzers">多言語アナライザー</a> または <a href="./language-identifier-tokenizer">言語識別子</a> の構成を検討してください。</p></td>
   </tr>
</table>

## ステップ3: 自分の道を選ぶ\{#step-3-choose-your-path}

デフォルトの[standard analyzer](./standard-analyzer)が不十分な場合、以下の2つの道から選択してください:

- **道A - 組み込みアナライザーを使用** (すぐに使用できる、言語固有)

- **道B - カスタムアナライザーを作成** (手動でトークナイザー + フィルターのセットを定義)

### 道A: 組み込みアナライザーを使用\{#path-a-use-built-in-analyzers}

組み込みアナライザーは、一般的な言語用に事前構成されたソリューションです。デフォルトのstandard analyzerが完璧に適合しない場合、最も簡単に開始する方法です。

#### 使用可能な組み込みアナライザー\{#available-built-in-analyzers}

<table>
   <tr>
     <th><p>アナライザー</p></th>
     <th><p>言語サポート</p></th>
     <th><p>構成要素</p></th>
     <th><p>注釈</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-analyzer"><code>standard</code></a></p></td>
     <td><p>多くのスペースで区切られた言語 (英語、フランス語、ドイツ語、スペイン語など)</p></td>
     <td><ul><li><p>トークナイザー: <code>standard</code></p></li><li><p>フィルター: <code>lowercase</code></p></li></ul></td>
     <td><p>初期テキスト処理のための汎用アナライザー。単一言語シナリオでは、( <code>english</code>のような)言語固有のアナライザーの方が良いパフォーマンスを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./english-analyzer"><code>english</code></a></p></td>
     <td><p>専用の英語、ステミングとストップワード削除を適用して英語のセマンティックマッチングを向上</p></td>
     <td><ul><li><p>トークナイザー: <code>standard</code></p></li><li><p>フィルター: <code>lowercase</code>, <code>stemmer</code>, <code>stop</code></p></li></ul></td>
     <td><p>英語のみのコンテンツには<code>standard</code>より推奨。</p></td>
   </tr>
   <tr>
     <td><p><a href="./chinese-analyzer"><code>chinese</code></a></p></td>
     <td><p>中国語</p></td>
     <td><ul><li><p>トークナイザー: <code>jieba</code></p></li><li><p>フィルター: <code>cnalphanumonly</code></p></li></ul></td>
     <td><p>現在、デフォルトで簡体字中国語辞書を使用。</p></td>
   </tr>
</table>

#### 実装例\{#implementation-example}

組み込みアナライザーを使用するには、フィールドスキーマを定義する際に`analyzer_params`でその種類を指定します。

```python
# 組み込み英語アナライザーの使用
analyzer_params = {
    "type": "english"
}

# コレクションスキーマ内のターゲットVARCHARフィールドへのアナライザー構成の適用
schema.add_field(
    field_name='text',
    datatype=DataType.VARCHAR,
    max_length=200,
    enable_analyzer=True,
    # highlight-next-line
    analyzer_params=analyzer_params,
)
```

<Admonition type="info" icon="📘" title="注釈">

<p>詳細な使用方法については、<a href="./full-text-search">全文検索</a>、<a href="./text-match">テキストマッチ</a>、または<a href="./phrase-match">フレーズマッチ</a>を参照してください。</p>

</Admonition>

### 道B: カスタムアナライザーを作成\{#path-b-create-a-custom-analyzer}

[組み込み](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers)[ オプション](./choose-the-right-analyzer-for-your-use-case#available-built-in-analyzers)がニーズを満たさない場合、トークナイザーとフィルターのセットを組み合わせてカスタムアナライザーを作成できます。これにより、テキスト処理パイプラインを完全に制御できます。

#### ステップ1: 言語に基づいてトークナイザーを選択\{#step-1-select-the-tokenizer-based-on-language}

コンテンツの主な言語に基づいてトークナイザーを選択してください:

##### 西欧言語\{#western-languages}

スペースで区切られた言語には以下のオプションがあります:

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>動作方法</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./standard-tokenizer"><code>standard</code></a></p></td>
     <td><p>スペースと句読点に基づいてテキストを分割</p></td>
     <td><p>一般的なテキスト、混在する句読点</p></td>
     <td><ul><li><p>入力: <code>"Hello, world! Visit example.com"</code></p></li><li><p>出力: <code>['Hello', 'world', 'Visit', 'example', 'com']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./whitespace-tokenizer"><code>whitespace</code></a></p></td>
     <td><p>空白文字のみで分割</p></td>
     <td><p>前処理済みコンテンツ、ユーザー整形テキスト</p></td>
     <td><ul><li><p>入力: <code>"user_id = get_user_data()"</code></p></li><li><p>出力: <code>['user_id', '=', 'get_user_data()']</code></p></li></ul></td>
   </tr>
</table>

##### 東アジア言語\{#east-asian-languages}

辞書ベースの言語は、適切な単語区切りのために特別なトークナイザーが必要です:

###### 中国語\{#chinese}

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>動作方法</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./jieba-tokenizer"><code>jieba</code></a></p></td>
     <td><p>中国語辞書ベースの区切りとインテリジェントアルゴリズム</p></td>
     <td><p><strong>中国語コンテンツに推奨</strong> - 辞書とインテリジェントアルゴリズムを組み合わせ、中国語用に特別に設計</p></td>
     <td><ul><li><p>入力: <code>"机器学习是人工智能的一个分支"</code></p></li><li><p>出力: <code>['机器', '学习', '是', '人工', '智能', '人工智能', '的', '一个', '分支']</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p>純粋な辞書ベースの形態素解析 ( <a href="https://cc-cedict.org/wiki/">cc-cedict</a>中国語辞書)</p></td>
     <td><p><code>jieba</code>と比較して、中国語テキストをより一般的な方法で処理</p></td>
     <td><ul><li><p>入力: <code>"机器学习算法"</code></p></li><li><p>出力: <code>["机器", "学习", "算法"]</code></p></li></ul></td>
   </tr>
</table>

###### 日本語と韓国語\{#japanese-and-korean}

<table>
   <tr>
     <th><p>言語</p></th>
     <th><p>トークナイザー</p></th>
     <th><p>辞書オプション</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p>日本語</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://taku910.github.io/mecab/">ipadic</a> (汎用)、 <a href="https://github.com/neologd/mecab-ipadic-neologd">ipadic-neologd</a> (現代用語)、 <a href="https://clrd.ninjal.ac.jp/unidic/">unidic</a> (学術)</p></td>
     <td><p>名詞処理を伴う形態素解析</p></td>
     <td><ul><li><p>入力: <code>"東京都渋谷区"</code></p></li><li><p>出力: <code>["東京", "都", "渋谷", "区"]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p>韓国語</p></td>
     <td><p><a href="./lindera-tokenizer"><code>lindera</code></a></p></td>
     <td><p><a href="https://bitbucket.org/eunjeon/mecab-ko-dic/src/master/">ko-dic</a></p></td>
     <td><p>韓国語形態素解析</p></td>
     <td><ul><li><p>入力: <code>"안녕하세요"</code></p></li><li><p>出力: <code>["안녕", "하", "세요"]</code></p></li></ul></td>
   </tr>
</table>

##### 多言語または不明な言語\{#multilingual-or-unknown-languages}

言語が予測不可能またはドキュメント内で混合されているコンテンツ:

<table>
   <tr>
     <th><p>トークナイザー</p></th>
     <th><p>動作方法</p></th>
     <th><p>最適な用途</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./icu-tokenizer"><code>icu</code></a></p></td>
     <td><p>Unicode対応のトークナイズ (International Components for Unicode)</p></td>
     <td><p>混合スクリプト、不明な言語、または単純なトークナイズで十分な場合</p></td>
     <td><ul><li><p>入力: <code>"Hello 世界 مرحبا"</code></p></li><li><p>出力: <code>['Hello', ' ', '世界', ' ', 'مرحبا']</code></p></li></ul></td>
   </tr>
</table>

**icuを使用する場合**:

- 言語識別が現実的でない混合言語。

- [多言語アナライザー](./multi-language-analyzers)または[言語識別子](./language-identifier-tokenizer)のオーバーヘッドを避けたい場合。

- 主な言語に全体の意味に貢献しない偶発的な外国語があるコンテンツ（例：日本語やフランス語のブランド名または技術用語が偶発的に含まれている英語テキスト）。

**代替アプローチ**: 多言語コンテンツのより正確な処理のため、多言語アナライザーや言語識別子の使用を検討してください。詳細については、[多言語アナライザー](./multi-language-analyzers)または[言語識別子](./language-identifier-tokenizer)を参照してください。

#### ステップ2: 精度のためにフィルターを追加\{#step-2-add-filters-for-precision}

[トークナイザーを選択](./choose-the-right-analyzer-for-your-use-case#step-1-select-the-tokenizer-based-on-language)した後、特定の検索要件とコンテンツ特性に応じてフィルターを適用します。

##### よく使われるフィルター\{#commonly-used-filters}

これらのフィルターは、ほとんどのスペースで区切られた言語構成（英語、フランス語、ドイツ語、スペイン語など）に不可欠であり、検索品質を大幅に向上させます:

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>動作方法</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./lowercase-filter"><code>lowercase</code></a></p></td>
     <td><p>すべてのトークンを小文字に変換</p></td>
     <td><p>万能 - ケース区別のあるすべての言語に適用</p></td>
     <td><ul><li><p>入力: <code>["Apple", "iPhone"]</code></p></li><li><p>出力: <code>[['apple'], ['iphone']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stemmer-filter"><code>stemmer</code></a></p></td>
     <td><p>単語を原型に縮小</p></td>
     <td><p>語形変化のある言語 (英語、フランス語、ドイツ語など)</p></td>
     <td><p>英語の場合:</p><ul><li><p>入力: <code>["running", "runs", "ran"]</code></p></li><li><p>出力: <code>[['run'], ['run'], ['ran']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./stop-filter"><code>stop</code></a></p></td>
     <td><p>一般的で意味のない単語を削除</p></td>
     <td><p>ほとんどの言語 - 特にスペースで区切られた言語に効果的</p></td>
     <td><ul><li><p>入力: <code>["the", "quick", "brown", "fox"]</code></p></li><li><p>出力: <code>[[], ['quick'], ['brown'], ['fox']]</code></p></li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注釈">

<p>東アジア言語（中国語、日本語、韓国語など）では、代わりに<a href="./choose-the-right-analyzer-for-your-use-case#language-specific-filters">言語固有のフィルター</a>に注力してください。これらの言語では通常、テキスト処理に異なるアプローチを使用し、ステミングから大幅な利益を得ないことがあります。</p>

</Admonition>

##### テキスト正規化フィルター\{#text-normalization-filters}

これらのフィルターは、マッチングの一貫性を向上させるためにテキスト変種を標準化します:

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>動作方法</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./ascii-folding-filter"><code>asciifolding</code></a></p></td>
     <td><p>アクセント付き文字をASCII相当に変換</p></td>
     <td><p>国際的コンテンツ、ユーザー生成コンテンツ</p></td>
     <td><ul><li><p>入力: <code>["café", "naïve", "résumé"]</code></p></li><li><p>出力: <code>[['cafe'], ['naive'], ['resume']]</code></p></li></ul></td>
   </tr>
</table>

##### トークンフィルタリング\{#token-filtering}

文字コンテンツまたは長さに基づいて維持するトークンを制御:

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>動作方法</p></th>
     <th><p>使用する場合</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./remove-punct-filter"><code>removepunct</code></a></p></td>
     <td><p>独立した句読点トークンを削除</p></td>
     <td><p><code>jieba</code>、 <code>lindera</code>、 <code>icu</code> トークナイザーの出力から句読点を削除。これらは句読点を単独のトークンとして返す</p></td>
     <td><ul><li><p>入力: <code>["Hello", "!", "world"]</code></p></li><li><p>出力: <code>[['Hello'], ['world']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./alphanumonly-filter"><code>alphanumonly</code></a></p></td>
     <td><p>文字と数字のみを保持</p></td>
     <td><p>技術コンテンツ、クリーンなテキスト処理</p></td>
     <td><ul><li><p>入力: <code>["user123", "test@email.com"]</code></p></li><li><p>出力: <code>[['user123'], ['test', 'email', 'com']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./length-filter"><code>length</code></a></p></td>
     <td><p>指定された長さ範囲外のトークンを削除</p></td>
     <td><p>ノイズをフィルター (過度に長いトークン)</p></td>
     <td><ul><li><p>入力: <code>["a", "very", "extraordinarily"]</code></p></li><li><p>出力: <code>[['a'], ['very'], []]</code> ( <strong>max=10</strong>の場合)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./regex-filter"><code>regex</code></a></p></td>
     <td><p>カスタムパターンベースのフィルタリング</p></td>
     <td><p>ドメイン固有のトークン要件</p></td>
     <td><ul><li><p>入力: <code>["test123", "prod456"]</code></p></li><li><p>出力: <code>[[], ['prod456']]</code> ( <strong>expr="^prod"</strong>の場合)</p></li></ul></td>
   </tr>
</table>

##### 言語固有のフィルター\{#language-specific-filters}

これらのフィルターは、特定の言語特性を処理:

<table>
   <tr>
     <th><p>フィルター</p></th>
     <th><p>言語</p></th>
     <th><p>動作方法</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><a href="./decompounder-filter"><code>decompounder</code></a></p></td>
     <td><p>ドイツ語</p></td>
     <td><p>複合語を検索可能な構成要素に分割</p></td>
     <td><ul><li><p>入力: <code>["dampfschifffahrt"]</code></p></li><li><p>出力: <code>[['dampf', 'schiff', 'fahrt']]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cnalphanumonly-filter">cnalphanumonly</a></p></td>
     <td><p>中国語</p></td>
     <td><p>中国語文字 + 英数字を保持</p></td>
     <td><ul><li><p>入力: <code>["Hello", "世界", "123", "!@#"]</code></p></li><li><p>出力: <code>[['Hello'], ['世界'], ['123'], []]</code></p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cncharonly-filter"><code>cncharonly</code></a></p></td>
     <td><p>中国語</p></td>
     <td><p>中国語文字のみを保持</p></td>
     <td><ul><li><p>入力: <code>["Hello", "世界", "123"]</code></p></li><li><p>出力: <code>[[], ['世界'], []]</code></p></li></ul></td>
   </tr>
</table>

#### ステップ3: 組み合わせて実装\{#step-3-combine-and-implement}

カスタムアナライザーを作成するには、`analyzer_params`辞書にトークナイザーとフィルターのリストを定義します。フィルターはリストされている順番に適用されます。

```python
# 例: 技術的内容用のカスタムアナライザー
analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase", "alphanumonly"]
}

# コレクションスキーマ内のターゲットVARCHARフィールドへのアナライザー構成の適用
schema.add_field(
    field_name='text',
    datatype=DataType.VARCHAR,
    max_length=200,
    enable_analyzer=True,
    # highlight-next-line
    analyzer_params=analyzer_params,
)
```

#### 最終: `run_analyzer`でテスト\{#final-test-with-runanalyzer}

コレクションに適用する前に、常に構成を検証してください:

```python
# 分析するサンプルテキスト
sample_text = "The Milvus vector database is built for scale!"

# 定義された構成でアナライザーを実行
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

確認すべき一般的な問題:

- **過剰なトークナイズ**: 技術用語が正しく分割されている

- **不十分なトークナイズ**: フレーズが適切に分離されていない

- **トークンの欠落**: 重要な用語がフィルターで削除されている

詳細な使用方法については、[run_analyzer](https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md)を参照してください。

## ユースケース別のクイックレシピ\{#quick-recipes-by-use-case}

このセクションでは、Zilliz Cloudでアナライザーを使用する際の一般的なユースケースに推奨されるトークナイザーとフィルター構成を提供します。コンテンツタイプと検索要件に最も一致する組み合わせを選択してください。

<Admonition type="info" icon="📘" title="注釈">

<p>アナライザーをコレクションに適用する前に、<a href="https://milvus.io/api-reference/pymilvus/v2.6.x/MilvusClient/CollectionSchema/run_analyzer.md"><code>run_analyzer</code></a>を使用してテキスト分析パフォーマンスをテストおよび検証することを推奨します。</p>

</Admonition>

### 英語\{#english}

```json
analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "english"
        },
        {
            "type": "stop",
            "stop_words": [
                "_english_"
            ]
        }
    ]
}
```

### 中国語\{#chinese}

```json
{
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
}
```

### アラビア語\{#arabic}

```python
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "arabig"
        }
    ]
}
```

### ベンガル語\{#bengali}

```python
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### フランス語\{#french}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "french"
        },
        {
            "type": "stop",
            "stop_words": [
                "_french_"
            ]
        }
    ]
}
```

### ドイツ語\{#german}

```json
{
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic"
    },
    "filter": [
        "removepunct"
    ]
}
```

### ヒンディー語\{#hindi}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### 日本語\{#japanese}

```json
{
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic"
    },
    "filter": [
        "removepunct"
    ]
}
```

### ポルトガル語\{#portuguese}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "portuguese"
        },
        {
            "type": "stop",
            "stop_words": [
                "_portuguese_"
            ]
        }
    ]
}
```

### ロシア語\{#russian}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "russian"
        },
        {
            "type": "stop",
            "stop_words": [
                "_russian_"
            ]
        }
    ]
}
```

### スペイン語\{#spanish}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "spanish"
        },
        {
            "type": "stop",
            "stop_words": [
                "_spanish_"
            ]
        }
    ]
}
```

### スワヒリ語\{#swahili}

```json
{
    "tokenizer": "standard",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### トルコ語\{#turkish}

```json
{
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stemmer",
            "language": "turkish"
        }
    ]
}
```

### ウルドゥー語\{#urdu}

```json
{
    "tokenizer": "icu",
    "filter": ["lowercase", {
        "type": "stop",
        "stop_words": [<put stop words list here>]
    }]
}
```

### 混合または多言語コンテンツ\{#mixed-or-multilingual-content}

複数の言語にまたがるコンテンツや、予測不可能に使用されるスクリプトを処理する場合は、`icu`アナライザーから始めます。このUnicode対応アナライザーは、混合スクリプトと記号を効果的に処理します。

**基本的な多言語構成 (ステミングなし)**:

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["lowercase", "asciifolding"]
}
```

**高度な多言語処理**:

異なる言語間でのトークン動作をよりよく制御するには:

- **多言語アナライザー**構成を使用。詳細については、[多言語アナライザー](./multi-language-analyzers)を参照してください。

- コンテンツに**言語識別子**を実装。詳細については、[言語識別子](./language-identifier-tokenizer)を参照してください。

## Zilliz Cloudでアナライザーを構成およびプレビュー\{#configure-and-preview-analyzers-in-zilliz-cloud}

Zilliz Cloudでは、コードを書かずに[Zilliz Cloud](https://cloud.zilliz.com/)[コンソール](https://cloud.zilliz.com/)から直接テキストアナライザーを構成およびテストできます。

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />
