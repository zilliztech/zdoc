---
title: "機能の利用可否 | Cloud"
slug: /feature-availability
sidebar_key: feature-availability
sidebar_label: "機能の利用可否"
beta: FALSE
notebook: FALSE
description: "最終更新日: 2025年10月13日 | Cloud"
type: origin
token: HpbSwzS6kiW9gikHpQ0cUZLWnlc
sidebar_position: 19
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 機能の利用可否

---

import Admonition from '@theme/Admonition';


# 機能の利用可否

*最終更新日: 2025年10月13日*

機能の**利用可能フェーズ**は、Zilliz Cloud におけるその機能の成熟度、安定性、および推奨される使用方法を示します。以下に、機能のライフサイクル段階の概要と、ユーザーとしてのそれぞれの意味について説明します。

![YBh6wiorGhbetoba42DchATjnVm](https://zdoc-images.s3.us-west-2.amazonaws.com/YBh6wiorGhbetoba42DchATjnVm.png)

- **プライベートプレビュー:** 

    - **定義:** プライベートプレビューの機能は、積極的に開発中であり、変更される可能性があります。Zilliz Cloud 内で実装およびテストはされていますが、完全な使いやすさ、安定性、および隅々までのカバレッジは完了していない場合があります。

    - **アクセス**: デフォルトでは利用できません。[Zilliz サポート](http://support.zilliz.com)に連絡してアクセスをリクエストしてください。

    - **使用方法**: 本番ワークロードを目的としていません。

- **パブリックプレビュー:** 

    - **定義:** パブリックプレビューの機能は、本番環境に近い状態であり、一般提供 (GA) に到達する前に大幅に変更される可能性は低いです。

    - **アクセス**: クラスタの Milvus バージョンをアップグレードした後、一般的にデフォルトで有効になります。クラスタが古いバージョンの Milvus を実行している場合、一部の機能にアクセスできないことがあります。そのような場合は、[サポートに連絡](http://support.zilliz.com)してクラスタをアップグレードしてください。

    - **使用方法:** 本番環境での使用は推奨されません。

- **一般提供 (GA):** 

    - **定義:** GA の機能は、完全にリリースされ、本番環境で使用可能であり、積極的にサポートされています。

    - **アクセス**: ほとんどのユーザーに対してデフォルトで有効になっていますが、価格に関する考慮事項のあるエンタープライズ機能など、一部の機能は [営業に連絡](https://zilliz.com/contact-sales)して有効化する必要があります。

    - **使用方法**: 本番環境での使用に適しています。

- **非推奨のお知らせ:** 

    - **定義:** このフェーズの機能は、まだ機能し、アクセス可能ですが、重大なバグ修正を除き、積極的な開発は行われていません。

    - **アクセス**: まだ利用可能ですが、正式な非推奨の発表がメールで行われています。

    - **使用方法**: 将来の日付に機能が削除されるため、[専門家に相談](https://zilliz.com/contact-sales)して新しいソリューションへの移行を開始してください。

- **非推奨:** 

    - **定義:** 機能は Zilliz Cloud から完全に削除され、アクセスまたはサポートはできなくなりました。

    - **アクセス**: 利用不可。

## 機能の利用可能フェーズの確認方法\{#how-to-identify-a-features-availability-phase}

各機能の利用可能フェーズは、Zilliz Cloud ドキュメント内で対応するラベルで示されています。特に記載がない限り、機能は一般提供と見なされます。

## 現在の機能の利用可否\{#current-feature-availability}

### プライベートプレビュー\{#private-preview}

- [バックアップファイルのエクスポート](./export-backup-files)

<Admonition type="info" icon="📘" title="Notes">

<p>これらの機能へのアクセスをリクエストするには、<a href="http://support.zilliz.com">Zilliz サポート</a>に連絡してください。 </p>

</Admonition>

### パブリックプレビュー\{#public-preview}

- [Embedding](./model-based-functions) および [Rerank](./reranking) Functions

<Admonition type="info" icon="📘" title="Notes">

<p>これらの機能にアクセスするには、クラスタの Milvus バージョンをアップグレードしてください。</p>

</Admonition>

- [アクセスログ](./access-logs)

- [オンデマンドコンピュート](./on-demand-compute)

<Admonition type="info" icon="📘" title="Notes">

<p>お使いのリージョンがこの機能をサポートしている場合は、<a href="http://support.zilliz.com">お問い合わせ</a>いただき、より多くのリージョンをリクエストしてください</p>

</Admonition>

### 非推奨のお知らせ\{#deprecation-notice}

- [NumPy ファイルからのデータインポート](./data-import-numpy)

- [RESTful API (V1)](/reference/restful/v1)

- [データのマージ](./merge-data)

### 非推奨\{#deprecated}

- Pipelines
