---
title: "機能の可用性 | Cloud"
slug: /feature-availability
sidebar_label: "機能の可用性"
beta: FALSE
notebook: FALSE
description: "最終更新日 2025年7月14日 | Cloud"
type: origin
token: HpbSwzS6kiW9gikHpQ0cUZLWnlc
sidebar_position: 14
keywords: 
  - zilliz
  - vector database
  - cloud
  - feature availability
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG

---

import Admonition from '@theme/Admonition';


# 機能の可用性

*最終更新日: 2025年7月14日*

機能の**可用性フェーズ**は、Zilliz Cloudでの成熟度、安定性、および推奨される使用方法を示します。以下は、機能のライフサイクルステージの概要と、ユーザーにとっての意味を示しています。

![YBh6wiorGhbetoba42DchATjnVm](/img/YBh6wiorGhbetoba42DchATjnVm.png)

- **プライベートプレビュー:** 

    - **定義:**プライベートプレビューの機能は積極的に開発中であり、変更される可能性があります。Zilliz Cloud内で実装およびテストされていますが、完全な使いやすさ、安定性、およびコーナーケースカバレッジが完全でない場合があります。

    - アクセス:デフォルトでは利用できません。アクセスをリクエストするには、[Zillizサポート](http://support.zilliz.com)に連絡してください。

    - **使用法**:本番ワークロード向けではありません。

- **パブリックプレビュー:** 

    - **定義:**パブリックプレビューの機能は、本番環境に近く、一般提供（GA）に到達する前に大幅に変更される可能性は低いです。

    - **アクセス**:通常、クラスターのMilvusバージョンをアップグレードした後にデフォルトが有効になります。クラスターが古いバージョンのMilvusを実行している場合、一部の機能にアクセスできない場合があります。そのような場合は、[サポートに連絡](http://support.zilliz.com)を使用してクラスターをアップグレードしてください。

    - **使用法:**本番環境での使用はお勧めしません。

- **ジェネラルアベイラビリティ(GA):** 

    - **定義:**GA機能は完全にリリースされ、本番環境に対応し、積極的にサポートされています。

    - **アクセス**:ほとんどのユーザーにとってデフォルトで有効になっていますが、価格に関する考慮事項があるエンタープライズ機能など、アクティベーションに[セールスに連絡する](https://zilliz.com/contact-sales)が必要な一部の機能を除きます。

    - **使用法**:生産用に使用します。

- **廃止のお知らせ:** 

    - **定義:**このフェーズの機能はまだ機能しており、アクセス可能ですが、重要なバグ修正以外は積極的に開発されていません。

    - アクセス:まだ利用可能ですが、正式な廃止発表が電子メールで発行されました。

    - 使用法: [当社の専門家と話す](https://zilliz.com/contact-sales)を使用して、将来的に機能が削除されるため、新しいソリューションへの移行を開始します。

- **廃止されました:** 

    - **定義:**この機能はZilliz Cloudから完全に削除され、アクセスまたはサポートされなくなりました。

    - **アクセス**:利用できません。

## 機能の可用性フェーズを特定する方法{#how-to-identify-a-features-availability-phase}

各機能の可用性フェーズは、Zilliz Cloudのドキュメントに対応するラベルで示されています。特に示されていない限り、機能は一般提供中と見なされます。

## 現在の機能の利用可能性{#current-feature-availability}

### プライベートプレビュー{#private-preview}

- [ステージを介した移行](./via-stage)

- [抽出、変換、およびロード（ETL）](/reference/restful/merge-data-v2)

- [ゼロダウンタイム移行](./zero-downtime-migration)

- [監査ログ](./audit-logs)

- [バックアップファイルをエクスポートする](./export-backup-files)

- [Amazon S 3との統合](./integrate-with-aws-s3)

- [トップ>Azure Blob Storage](./integrate-with-azure-blob-storage)

<Admonition type="info" icon="📘" title="ノート">

<p>これらの機能へのアクセスをリクエストするには、<a href="http://support.zilliz.com">Zillizサポート</a>に連絡してください。 </p>

</Admonition>

### リクエストに応じたGA機能{#on-request-ga-features}

- [シングルサインオン（SSO）](./single-sign-on)

<Admonition type="info" icon="📘" title="ノート">

<p>この機能を有効にするには、<a href="https://zilliz.com/contact-sales">セールス</a>に連絡してください。</p>

</Admonition>

### 廃止のお知らせ{#deprecation-notice}

- [パイプライン](./pipelines)

- [RESTful APIについて](/reference/restful/v1)

