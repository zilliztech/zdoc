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

機能の**提供フェーズ**は、Zilliz Cloud におけるその機能の成熟度、安定性、および推奨される使用方法を示します。以下では、機能ライフサイクルの各段階と、それがユーザーにとって何を意味するかを説明します。

![YBh6wiorGhbetoba42DchATjnVm](https://zdoc-images.s3.us-west-2.amazonaws.com/YBh6wiorGhbetoba42DchATjnVm.png)

- **Private Preview:** 

    - **定義:** Private Preview の機能は現在も積極的に開発中であり、変更される可能性があります。これらの機能は Zilliz Cloud 内で実装およびテストされていますが、完全な使いやすさ、安定性、およびエッジケースへの対応がまだ十分ではない場合があります。

    - **アクセス**: デフォルトでは利用できません。アクセスを希望する場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。

    - **使用**: 本番ワークロード向けではありません。

- **Public Preview:** 

    - **定義:** Public Preview の機能は本番利用に近い状態にあり、General Availability (GA) に到達する前に大きく変更される可能性は低いです。

    - **アクセス**: 通常、cluster の Milvus バージョンをアップグレードするとデフォルトで有効になります。一部の機能は、お使いの cluster が古いバージョンの Milvus で実行されている場合は利用できないことがあります。その場合は、cluster をアップグレードするために [サポートにお問い合わせください](http://support.zilliz.com)。

    - **使用:** 本番利用は推奨されません。

- **General Availability (GA):** 

    - **定義:** GA 機能は正式リリース済みで、本番利用が可能であり、継続的にサポートされています。

    - **アクセス**: ほとんどのユーザーにはデフォルトで有効ですが、価格に関する考慮が必要なエンタープライズ機能など、一部の機能については有効化のために [営業にお問い合わせいただく](https://zilliz.com/contact-sales) 必要があります。

    - **使用**: 本番利用向けです。

- **Deprecation Notice:** 

    - **定義:** このフェーズの機能は引き続き動作し利用可能ですが、重大なバグ修正を除き、もはや積極的な開発は行われません。

    - **アクセス**: 引き続き利用可能ですが、正式な廃止予定の通知がメールで送信されています。

    - **使用**: この機能は将来削除される予定であるため、新しいソリューションへの移行を開始するには [専門家にご相談ください](https://zilliz.com/contact-sales)。

- **Deprecated:** 

    - **定義:** この機能は Zilliz Cloud から完全に削除されており、現在はアクセスもサポートもされていません。

    - **アクセス**: 利用不可。

## 機能の提供フェーズを識別する方法\{#how-to-identify-a-features-availability-phase}

各機能の提供フェーズは、対応するラベルによって Zilliz Cloud ドキュメント内に表示されます。特に明記されていない限り、その機能は General Availability と見なされます。

## 現在の機能の提供状況\{#current-feature-availability}

### Private preview\{#private-preview}

- [バックアップファイルのエクスポート](./export-backup-files)

- Hosted models

<Admonition type="info" icon="📘" title="📘 Notes">

これらの機能へのアクセスを希望する場合は、[Zilliz Support](http://support.zilliz.com) にお問い合わせください。 

</Admonition>

### Public preview\{#public-preview}

- Embedding ([OpenAI](./openai), [Voyage AI](./voyage-ai), および [Cohere](./cohere)) と Rerank Functions ([Cohere reranker](./cohere-model-ranker) および [Voyage AI reranker](./voyage-ai-model-ranker))

<Admonition type="info" icon="📘" title="📘 Notes">

これらの機能にアクセスするには、cluster の Milvus バージョンをアップグレードしてください。

</Admonition>

- [Access Logs の概要](./access-log-overview)

- [オンデマンドコンピュート](./on-demand-cluster)

<Admonition type="info" icon="📘" title="📘 Notes">

お使いのリージョンがこの機能をサポートしている場合、より多くのリージョンについては [お問い合わせください](http://support.zilliz.com)

</Admonition>

### Deprecation notice\{#deprecation-notice}

- [NumPy ファイルからのデータインポート](./data-import-numpy)

- [RESTful APIs (V1)](/reference/restful/v1)

### Deprecated\{#deprecated}

- Pipelines

