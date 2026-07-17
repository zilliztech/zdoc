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
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 機能の提供状況

*最終更新日: 2025年10月13日*

機能の**提供フェーズ**は、Zilliz Cloud におけるその機能の成熟度、安定性、推奨される利用方法を示します。以下では、機能ライフサイクルの各ステージと、それがユーザーにとって何を意味するかを説明します。

![YBh6wiorGhbetoba42DchATjnVm](https://zdoc-images.s3.us-west-2.amazonaws.com/YBh6wiorGhbetoba42DchATjnVm.png)

- **Private Preview:** 

    - **定義:** Private Preview の機能は現在も積極的に開発中であり、変更される可能性があります。これらの機能は Zilliz Cloud 内で実装およびテストされていますが、完全な使いやすさ、安定性、およびコーナーケースへの対応はまだ十分ではない場合があります。

    - **アクセス**: デフォルトでは利用できません。アクセスをリクエストするには、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

    - **利用**: 本番ワークロード向けではありません。

- **Public Preview:** 

    - **定義:** Public Preview の機能は本番利用の準備がほぼ整っており、General Availability (GA) に到達する前に大きく変更される可能性は低いです。

    - **アクセス**: 通常、クラスターの Milvus バージョンをアップグレードするとデフォルトで有効になります。一部の機能は、クラスターで古いバージョンの Milvus が実行されている場合、利用できないことがあります。その場合は、クラスターをアップグレードするために [support にお問い合わせください](http://support.zilliz.com)。

    - **利用:** 本番利用は推奨されません。

- **General Availability (GA):** 

    - **定義:** GA 機能は完全にリリースされており、本番利用可能で、積極的にサポートされています。

    - **アクセス**: ほとんどのユーザーにはデフォルトで有効化されていますが、価格に関する考慮が必要な一部のエンタープライズ機能など、[営業へのお問い合わせ](https://zilliz.com/contact-sales) による有効化が必要な機能もあります。

    - **利用**: 本番利用向けです。

- **Deprecation Notice:** 

    - **定義:** このフェーズの機能は引き続き動作しアクセス可能ですが、重大なバグ修正を除き、もはや積極的な開発は行われていません。

    - **アクセス**: 引き続き利用可能ですが、正式な廃止予定の通知がメールで発行されています。

    - **利用**: この機能は将来削除される予定のため、新しいソリューションへの移行を開始するには [当社のエキスパートにご相談ください](https://zilliz.com/contact-sales)。

- **Deprecated:** 

    - **定義:** この機能は Zilliz Cloud から完全に削除されており、アクセスもサポートもできません。

    - **アクセス**: 利用できません。

## 機能の提供フェーズを識別する方法\{#how-to-identify-a-features-availability-phase}

各機能の提供フェーズは、Zilliz Cloud ドキュメント内で対応するラベルによって示されています。特に明記されていない限り、機能は General Availability と見なされます。

## 現在の機能の提供状況\{#current-feature-availability}

### Private preview\{#private-preview}

- [バックアップファイルのエクスポート](./export-backup-files)

- Hosted models

<Admonition type="info" icon="📘" title="📘 Notes">

これらの機能へのアクセスをリクエストするには、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。 

</Admonition>

### Public preview\{#public-preview}

- Embedding ([OpenAI](./openai), [Voyage AI](./voyage-ai), および [Cohere](./cohere)) と Rerank Functions ([Cohere reranker](./cohere-model-ranker) および [Voyage AI reranker](./voyage-ai-model-ranker))

<Admonition type="info" icon="📘" title="📘 Notes">

これらの機能にアクセスするには、クラスターの Milvus バージョンをアップグレードしてください。

</Admonition>

- [アクセスログの概要](./access-log-overview)

- [オンデマンドコンピュート](./on-demand-cluster)

<Admonition type="info" icon="📘" title="📘 Notes">

お使いのリージョンでこの機能がサポートされている場合、より多くのリージョンをリクエストするには [お問い合わせください](http://support.zilliz.com)

</Admonition>

### Deprecation notice\{#deprecation-notice}

- [NumPy ファイルからのデータインポート](./data-import-numpy)

- [RESTful APIs (V1)](/reference/restful/v1)

### Deprecated\{#deprecated}

- Pipelines

