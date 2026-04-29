---
title: "機能の利用可能性 | Cloud"
slug: /feature-availability
sidebar_key: feature-availability
sidebar_label: "機能の利用可能性"
beta: FALSE
notebook: FALSE
description: "最終更新日：2025 年 10 月 13 日 | Cloud"
type: origin
token: HpbSwzS6kiW9gikHpQ0cUZLWnlc
sidebar_position: 19
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - 機能の利用可能性

---

import Admonition from '@theme/Admonition';


# 機能の提供状況

*最終更新日：2025 年 10 月 13 日*

機能の**利用可能フェーズ**は、Zilliz Cloud におけるその成熟度、安定性、および推奨される使用方法を示します。以下に、機能ライフサイクルの段階と、ユーザーとしての皆様にとっての意味について概説します。

![YBh6wiorGhbetoba42DchATjnVm](https://zdoc-images.s3.us-west-2.amazonaws.com/YBh6wiorGhbetoba42DchATjnVm.png)

- **プライベートプレビュー:** 

    - **定義:** プライベートプレビュー中の機能は現在開発中であり、変更される可能性があります。Zilliz Cloud 内で実装およびテスト済みですが、完全な使いやすさ、安定性、および隅々のケースのカバレッジが整っていない場合があります。

    - **アクセス**: デフォルトでは利用できません。アクセスをリクエストするには、[Zilliz サポート](http://support.zilliz.com) にお問い合わせください。

    - **使用方法**: 本番ワークロード用ではありません。

- **パブリックプレビュー:** 

    - **定義:** パブリックプレビュー中の機能は本番環境対応に近く、一般提供（GA）に至るまでに大幅に変更される可能性は低いです。

    - **アクセス**: クラスターの Milvus バージョンをアップグレードした後、通常はデフォルトで有効になります。クラスターが古いバージョンの Milvus を実行している場合、一部の機能にアクセスできないことがあります。その場合は、[サポートにお問い合わせ](http://support.zilliz.com) クラスターをアップグレードしてください。

    - **使用方法:** 本番使用は推奨されません。

- **一般提供（GA）:** 

    - **定義:** GA 機能は完全にリリースされ、本番環境に対応しており、積極的にサポートされています。

    - **アクセス**: ほとんどのユーザーに対してデフォルトで有効ですが、価格設定の検討が必要なエンタープライズ機能など、一部の機能については、有効化のために [営業担当者にお問い合わせ](https://zilliz.com/contact-sales) いただく必要があります。

    - **使用方法**: 本番使用向けです。

- **廃止予告:** 

    - **定義:** このフェーズの機能はまだ動作しアクセス可能ですが、重要なバグ修正を除き、積極的な開発は行われていません。

    - **アクセス**: まだ利用可能ですが、メールを通じて正式な廃止予告が発行されています。

    - **使用方法**: 将来的に機能が削除されるため、新しいソリューションへの移行を開始するには [専門家にご相談ください](https://zilliz.com/contact-sales)。

- **廃止済み:** 

    - **定義:** 機能は Zilliz Cloud から完全に削除され、アクセスもサポートもされていません。

    - **アクセス**: 利用不可。

## 機能の利用可能フェーズの識別方法\{#how-to-identify-a-features-availability-phase}

各機能の利用可能フェーズは、Zilliz Cloud のドキュメントにおいて対応するラベルで示されます。特に記載がない限り、機能は一般提供中とみなされます。

## 現在の機能提供状況\{#current-feature-availability}

### プライベートプレビュー\{#private-preview}

- [バックアップファイルのエクスポート](./export-backup-files)

- [ホストモデル](./hosted-models)

<Admonition type="info" icon="📘" title="Notes">

<p>これらの機能へのアクセスをリクエストするには、<a href="http://support.zilliz.com">Zilliz サポート</a> までご連絡ください。</p>

</Admonition>

### パブリックプレビュー\{#public-preview}

- [埋め込み](./model-based-functions) および [再ランキング](./reranking) 関数

<Admonition type="info" icon="📘" title="Notes">

<p>これらの機能にアクセスするには、クラスターの Milvus バージョンをアップグレードしてください。</p>

</Admonition>

- [アクセスログ](./access-logs)

- [オンデマンドコンピューティング](./compute-real-time-serving-and-on-demand-compute#on-demand-compute-or-public)

<Admonition type="info" icon="📘" title="Notes">

<p>お住まいの地域でこの機能がサポートされていない場合は、<a href="http://support.zilliz.com">お問い合わせ</a> いただき、さらなる地域のサポートをご請求ください。</p>

</Admonition>

### 廃止予告\{#deprecation-notice}

- [NumPy ファイルからのデータインポート](./data-import-numpy)

- [RESTful API (V1)](/reference/restful/v1)

- [データのマージ](./merge-data)

### 廃止済み\{#deprecated}

- パイプライン

