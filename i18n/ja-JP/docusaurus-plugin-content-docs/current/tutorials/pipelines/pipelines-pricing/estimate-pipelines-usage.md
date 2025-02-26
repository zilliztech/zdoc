---
title: "パイプライン利用予測 | Cloud"
slug: /estimate-pipelines-usage
sidebar_label: "パイプライン利用予測"
beta: FALSE
notebook: FALSE
description: "パイプラインの実行コストはトークンによって測定されます。トークンを基本単位として使用する大規模言語モデル(LLM)と同様に、パイプラインはテキストを解析して一連のトークンとして埋め込むことによって、ドキュメントや検索クエリを過程化します。パイプラインの実行コストを理解するには、ファイルまたはテキスト文字列のトークンをカウントするために、当社の推定パイプライン使用量ツールを使用できます。 | Cloud"
type: origin
token: LrTAwIXn1ih4aPkotM1cYvHjnAd
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - pricing
  - usage
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction

---

import Admonition from '@theme/Admonition';


# パイプライン利用予測

パイプラインの実行コストはトークンによって測定されます。トークンを基本単位として使用する大規模言語モデル(LLM)と同様に、パイプラインはテキストを解析して一連のトークンとして埋め込むことによって、ドキュメントや検索クエリを過程化します。パイプラインの実行コストを理解するには、ファイルまたはテキスト文字列のトークンをカウントするために、当社の推定パイプライン使用量ツールを使用できます。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>Zilliz Cloud Pipelinesは、2025年第2四半期の終わりまでに廃止され、「Data In, Data Out」という新しい機能に置き換えられます。これにより、MilvusとZilliz Cloudの両方で埋め込み生成が効率化されます。2024年12月24日現在、新規ユーザー登録は受け付けられていません。現在のユーザーは、日没日まで月額20ドルの無料手当内でサービスを継続して利用できますが、SLAは提供されていません。モデルプロバイダーまたはオープンソースモデルの埋め込みAPIを使用してベクトル埋め込みを生成することを検討してください。</p></li>
<li><p>このツールはByte-Pair Encoding(BPE)トークナイザーを使用しており、処理戦略によって推定使用量が30%異なる場合があります。そのため、推定使用量は参考としてのみ使用してください。実際の使用方法については、<a href="./pipelines-ingest-search-delete-data">パイプラインリスト</a>を参照してください。</p></li>
</ul>

</Admonition>

## トークンとは何ですか?{#what-are-tokens}

トークンはNLPにおける特別な概念です。それはサブワードと考えることができます。一部の単語はトークンそのものであり、一部の長い単語には複数のトークンが含まれる場合があります。トークンは言語にも依存します。一般的には、次のようになります:

- 1トークンは3～4文字の英語です

- 1トークンは1.12漢字です

- 1英単語には1.3トークンが含まれています

## Pipelinesはトークンをどのように処理しますか?{#how-is-the-token-processed-by-pipelines}

Ingestion Pipelineは、ファイルをトークンに解析し、トークンシリーズを分割して埋め込むことでドキュメントを処理します。Search Pipelineは、トークンシリーズを埋め込むことでクエリを処理します。トークンを深層学習モデル(埋め込みモデルと呼ばれる)に渡すことで、テキストの「本質」をベクトル表現に変換し、ベクトルデータベースに格納して取得できます。この過程の助けを借りて、PipelinesはAPIユーザーが文やテキスト内の異なる単語の意味や意味、およびその文脈を理解するのを支援することができます。

削除パイプラインは通常、テキストをトークンとして処理することはありません。

## パイプラインの利用予測{#estimate-pipelines-usage}

パイプラインの実行に伴うコストの影響を簡単に理解するために、ファイルやテキスト文字列のトークンを推定できるWeb UIツールを提供しています。このツールを使用して、パイプラインを実行する前にコストを推定できます。

![estimate-piplines-usage-tool-entrance](/img/ja-JP/estimate-piplines-usage-tool-entrance.png)

1. 入力する

    - インジェスチョンパイプラインは、ファイルを入力として受け取ります。ローカルファイルを直接アップロードするか、オブジェクトストレージからファイルを使用して、インジェスチョンパイプラインの実行の使用状況を推定できます。

        - ローカルファイルをアップロードする

            10 MB以下のローカルファイルをアップロードしてください。サポートされているファイル形式は、`. txt`、.`pdf`、`.md`、`.html`、`.epub`、`.csv`、`.document`、`.docx`、`.xls`、.xlsx`、.ppt`、`.pptx`です。

        - オブジェクトストレージからファイルをインポートする

            公開または事前署名されたURLを[AWS S 3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)または[GCS](https://cloud.google.com/storage/docs/access-control/signed-urls)で提供してください。毎回1つのURLを入力してください。

    - 検索パイプラインはクエリ文字列を入力として受け取ります。テキスト文字列を直接入力することで、検索パイプラインの実行状況を推定することができます。

        - 入力ボックスにトークン化するテキストを直接入力してください。

        <Admonition type="info" icon="📘" title="ノート">

        <p>最大10万文字まで入力できます。</p>

        </Admonition>

1. 「**計算**」をクリックします。

    ![estimate-piplines-usage](/img/ja-JP/estimate-piplines-usage.png)

1. ファイルの推定トークン数を確認してください。

1. [**リセット**]をクリックして、別のローカルファイルをアップロードします。

## 関連するトピック{#related-topics}

- [Zillizクラウドの制限](./limits)

- [よくある質問(FAQ)](./faqs)

