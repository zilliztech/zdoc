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

機能の**提供フェーズ**は、Zilliz Cloud におけるその機能の成熟度、安定性、および推奨される利用方法を示します。以下では、機能ライフサイクルの各段階と、それがユーザーにとって何を意味するのかを説明します。

![YBh6wiorGhbetoba42DchATjnVm](https://zdoc-images.s3.us-west-2.amazonaws.com/YBh6wiorGhbetoba42DchATjnVm.png)

- **Private Preview:** 

    - **定義:** Private Preview の機能は現在も積極的に開発中であり、変更される可能性があります。Zilliz Cloud 内で実装およびテストは行われていますが、完全な使いやすさ、安定性、およびエッジケースへの対応はまだ十分でない場合があります。

    - **アクセス**: デフォルトでは利用できません。アクセスを希望する場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

    - **利用方法**: 本番ワークロードでの使用を目的としていません。

- **Public Preview:** 

    - **定義:** Public Preview の機能は本番利用の準備にかなり近く、General Availability (GA) に到達する前に大幅な変更が加えられる可能性は低いです。

    - **アクセス**: 通常、クラスターの Milvus バージョンをアップグレードするとデフォルトで有効になります。一部の機能は、クラスターが古いバージョンの Milvus を実行している場合には利用できないことがあります。その場合は、クラスターをアップグレードするために [support にお問い合わせください](http://support.zilliz.com)。

    - **利用方法:** 本番利用は推奨されません。

- **General Availability (GA):** 

    - **定義:** GA 機能は完全にリリースされており、本番利用に対応し、アクティブにサポートされています。

    - **アクセス**: ほとんどのユーザーに対してデフォルトで有効ですが、価格に関する考慮が必要なエンタープライズ機能など一部の機能については、有効化のために [営業にお問い合わせいただく](https://zilliz.com/contact-sales) 必要があります。

    - **利用方法**: 本番利用向けです。

- **Deprecation Notice:** 

    - **定義:** このフェーズの機能は引き続き動作し利用可能ですが、重大なバグ修正を除いて、もはや積極的な開発は行われません。

    - **アクセス**: 引き続き利用可能ですが、正式な非推奨のお知らせがメールで通知されています。

    - **利用方法**: この機能は将来削除される予定のため、新しいソリューションへの移行を開始するには [当社のエキスパートにご相談ください](https://zilliz.com/contact-sales)。

- **Deprecated:** 

    - **定義:** この機能は Zilliz Cloud から完全に削除されており、アクセスもサポートも提供されません。

    - **アクセス**: 利用できません。

## 機能の提供フェーズを識別する方法\{#how-to-identify-a-features-availability-phase}

各機能の提供フェーズは、Zilliz Cloud ドキュメント内で対応するラベルによって示されています。特に明記されていない限り、機能は General Availability と見なされます。

## 現在の機能の提供状況\{#current-feature-availability}

### Private preview\{#private-preview}

- [バックアップファイルのエクスポート](./export-backup-files)

- Hosted models

<Admonition type="info" icon="📘" title="📘 Notes">

これらの機能へのアクセスを希望する場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。 

</Admonition>

### Public preview\{#public-preview}

- Embedding ([OpenAI](./openai), [Voyage AI](./voyage-ai), [Cohere](./cohere)) および Rerank Functions ([Cohere reranker](./cohere-model-ranker) と [Voyage AI reranker](./voyage-ai-model-ranker))

<Admonition type="info" icon="📘" title="📘 Notes">

これらの機能にアクセスするには、クラスターの Milvus バージョンをアップグレードしてください。

</Admonition>

- [アクセスログの概要](./access-log-overview)

- [オンデマンドコンピュート](./on-demand-cluster)

<Admonition type="info" icon="📘" title="📘 Notes">

お使いのリージョンでこの機能がサポートされている場合は、より多くのリージョンをリクエストするために [お問い合わせください](http://support.zilliz.com)

</Admonition>

### Deprecation notice\{#deprecation-notice}

- [NumPy ファイルからデータをインポート](./data-import-numpy)

- [RESTful APIs (V1)](/reference/restful/v1)

### Deprecated\{#deprecated}

- Pipelines

