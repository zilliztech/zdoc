---
title: "機能の提供状況 | Cloud"
slug: /feature-availability
sidebar_label: "機能の提供状況"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "最終更新日 2025年10月13日 | Cloud"
type: origin
token: HpbSwzS6kiW9gikHpQ0cUZLWnlc
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 機能の提供状況

*最終更新日: 2025年10月13日*

機能の**提供フェーズ**は、Zilliz Cloud におけるその機能の成熟度、安定性、および推奨される使用方法を示します。以下では、機能のライフサイクルの各段階の概要と、それがユーザーにとって何を意味するかについて説明します。

![YBh6wiorGhbetoba42DchATjnVm](https://zdoc-images.s3.us-west-2.amazonaws.com/YBh6wiorGhbetoba42DchATjnVm.png)

- **Private Preview:** 

    - **定義:** Private Preview の機能は現在活発に開発中であり、変更される可能性があります。Zilliz Cloud 内で実装およびテストされていますが、使いやすさ、安定性、およびコーナーケースへの対応が完全ではない場合があります。

    - **アクセス**: デフォルトでは利用できません。アクセスを希望する場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

    - **使用**: 本番ワークロードを対象としたものではありません。

- **Public Preview:** 

    - **定義:** Public Preview の機能は本番環境で利用できる状態に近く、General Availability（GA）に到達する前に大幅に変更される可能性はほとんどありません。

    - **アクセス**: 通常、クラスターの Milvus バージョンをアップグレードするとデフォルトで有効になります。クラスターで古いバージョンの Milvus を実行している場合、一部の機能を利用できないことがあります。そのような場合は、クラスターをアップグレードするために [サポートにお問い合わせください](http://support.zilliz.com)。

    - **使用:** 本番環境での使用は推奨されません。

- **General Availability (GA):** 

    - <strong>定義:</strong> GA の機能は完全にリリースされ、本番環境に対応しており、積極的にサポートされています。

    - **アクセス**: ほとんどのユーザーに対してデフォルトで有効になっていますが、価格に関する考慮事項があるエンタープライズ機能など、一部の機能については有効化のために [営業担当者へのお問い合わせ](https://zilliz.com/contact-sales) が必要です。

    - **使用**: 本番環境で使用するためのものです。

- **Deprecation Notice:** 

    - <strong>定義:</strong> このフェーズの機能は引き続き動作しアクセスできますが、重大なバグ修正を除き、積極的な開発は行われていません。

    - **アクセス**: 引き続き利用できますが、正式な非推奨の告知がメールで発行されています。

    - **使用**: この機能は将来の日付で削除される予定であるため、新しいソリューションへの移行を開始するには [専門家にご相談ください](https://zilliz.com/contact-sales)。

- **Deprecated:** 

    - <strong>定義:</strong> この機能は Zilliz Cloud から完全に削除されており、アクセスもサポートもされていません。

    - **アクセス**: 利用できません。

## 機能の提供フェーズを識別する方法\{#how-to-identify-a-features-availability-phase}

各機能の提供フェーズは、Zilliz Cloud ドキュメント内で対応するラベルによって示されます。特に明記されていない限り、その機能は General Availability であると見なされます。

## 現在の機能の提供状況\{#current-feature-availability}

### Private preview\{#private-preview}

- [バックアップファイルのエクスポート](./export-backup-files)

- Hosted models

<Admonition type="info" title="Notes">

これらの機能へのアクセスを希望する場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。 

</Admonition>

### Public preview\{#public-preview}

- Embedding（[OpenAI](./openai)、[Voyage AI](./voyage-ai)、および [Cohere](./cohere)）と Rerank Functions（[Cohere reranker](./cohere-model-ranker) および [Voyage AI reranker](./voyage-ai-model-ranker)）

<Admonition type="info" title="Notes">

これらの機能にアクセスするには、クラスターの Milvus バージョンをアップグレードしてください。

</Admonition>

- [Access Logs の概要](./access-log-overview)

- [オンデマンドコンピュート](./on-demand-cluster)

- [Spark バッチジョブ](./spark-batch-jobs)

<Admonition type="info" title="Notes">

お使いのリージョンがこの機能をサポートしている場合は、より多くのリージョンについて [お問い合わせください](http://support.zilliz.com)

</Admonition>

### Deprecation notice\{#deprecation-notice}

- [NumPy ファイルからのデータインポート](./data-import-numpy)

- [RESTful APIs (V1)](/reference/restful/v1)

### Deprecated\{#deprecated}

- Pipelines
