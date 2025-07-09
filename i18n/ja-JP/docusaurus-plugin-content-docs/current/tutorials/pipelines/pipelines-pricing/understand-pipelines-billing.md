---
title: "パイプラインの価格 | Cloud"
slug: /understand-pipelines-billing
sidebar_label: "パイプラインの価格"
beta: NEAR DEPRECATE
notebook: FALSE
description: "Zilliz Cloud Pipelinesは、プライシングモデルを採用しています。具体的には、Ingestion PipelinesとSearch Pipelinesのモデルの実際の使用に対してのみ支払いを行います。 | Cloud"
type: origin
token: LQYdwnA60iGLAzkmZsdcVtLHnhh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - pricing
  - RAG
  - NLP
  - Neural Network
  - Deep Learning

---

import Admonition from '@theme/Admonition';


# パイプラインの価格

Zilliz Cloud Pipelinesは、[プライシング](https://zilliz.com/pricing)モデルを採用しています。具体的には、Ingestion PipelinesとSearch Pipelinesのモデルの実際の使用に対してのみ支払いを行います。 

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloud Pipelinesは、2025年第2四半期の終わりまでに廃止され、「Data In, Data Out」という新しい機能に置き換えられます。これにより、MilvusとZilliz Cloudの両方で埋め込み生成が効率化されます。2024年12月24日現在、新規ユーザー登録は受け付けられていません。現在のユーザーは、日没日まで月額20ドルの無料手当内でサービスを継続して利用できますが、SLAは提供されていません。モデルプロバイダーまたはオープンソースモデルの埋め込みAPIを使用してベクトル埋め込みを生成することを検討してください。</p>

</Admonition>

## パイプラインの価格設定{#pipelines-pricing}

各埋め込みモデルと再ランクモデルの価格の詳細については、[価格設定](https://zilliz.com/pricing)をご覧ください。

現在、Zilliz Cloud Pipelinesは無料のクォータを提供しています。これは、最初の20ドルの支出が無料であることを意味します。 

さらに、Zilliz Cloud Pipelinesの[総使用量の上限](./limits)があります。各組織は1か月あたり最大20ドルのパイプライン使用量を消費できます。クォータ制限を増やす必要がある場合は、[お問い合わせ](https://zilliz.com/contact-sales)または[Zillizサポートポータル](https://support.zilliz.com/hc/en-us)でチケットを提出してください。

## コストと使用状況を見る{#view-costs-and-usage}

Zilliz Cloud Pipelinesの請求書は、Zilliz Cloudベクトルデータベースの請求書に統合されています。したがって、Pipelinesにかかる料金を理解するには、上部ナビゲーションバーまたは左側パネルの**請求**をクリックしてください。詳細については、[請求書を見る](./view-invoice)を参照してください。

- **コストを見る**

    以下は、請求書のパイプライン費用の詳細な内訳の例です。 

    ![pipelines-cost](/img/pipelines-cost.png)

- **使用状況を見る**

    以下はPipelinesの使用例です。

    ![pipelines-usage](/img/pipelines-usage.png)