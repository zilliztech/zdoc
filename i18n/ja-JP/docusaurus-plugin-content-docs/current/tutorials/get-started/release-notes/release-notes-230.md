---
title: "リリースノート（2023年10月17日） | Cloud"
slug: /release-notes-230
sidebar_label: "2023年10月17日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "EU における AWS Frankfurt リージョンの提供開始をお知らせします。この拡張にあわせて、検索機能とデータ管理効率を強化するベータ機能として、Range Search、Upsert、Cosine Metric Type を導入しました。さらに、API Key Access、Retrieve Raw Vectors、JSONCONTAINS Filter、Entity Count などの機能も追加されています。加えて、RBAC、課金、価格計算、アカウント管理、サービス安定性に関する重要な改善も実施し、ユーザー体験を向上させました。 | Cloud"
type: origin
token: MocQwCCItiHYEbkkJtOcROPTnod
sidebar_position: 28
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年10月17日）

EU における AWS Frankfurt リージョンの提供開始をお知らせします。この拡張にあわせて、検索機能とデータ管理効率を強化するベータ機能として、Range Search、Upsert、Cosine Metric Type を導入しました。さらに、API Key Access、Retrieve Raw Vectors、JSON_CONTAINS Filter、Entity Count などの機能も追加されています。加えて、RBAC、課金、価格計算、アカウント管理、サービス安定性に関する重要な改善も実施し、ユーザー体験を向上させました。 

## Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## 新しい AWS リージョン: Frankfurt (aws-eu-central-1) - 提供開始\{#new-aws-region-frankfurt-aws-eu-central-1-now-live}

ヨーロッパのユーザー基盤への対応をさらに強化するため、新しい AWS Frankfurt リージョンを公開しました。このリージョンでは、サポートの向上に加えて、AWS Marketplace の支払いオプションも利用できます。利用可能なすべてのクラウドリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

## 革新的なベータ機能\{#innovative-beta-features}

Dedicated cluster で利用可能な最新のベータ機能で、未来を体験してください。今すぐアップグレードして、これらの機能強化をご利用ください。

- *Range Search*

    [Range Search](./range-search) によりクエリを再定義し、検索に半径を設定できるようになります。従来の ANN Search とは異なり、Range Search は指定した半径内のすべての vector を確実に含めるため、より包括的な結果を得られます。

- *Upsert*

    「update」と「insert」を組み合わせた [Upsert](./upsert-entities) により、動的なデータセットをシームレスに管理できます。変更が頻繁に発生するデータセットで、より高い効率を実現します。

- *Cosine Metric Type*

    [Cosine](./search-metrics-explained#cosine-similarity)、[Inner Product](./search-metrics-explained#inner-product-ip)、[Euclidean Distance](./search-metrics-explained#euclidean-distance-l2) をサポートし、高度な vector 検索を実現します。Cosine metric は事前の vector 正規化を不要にし、検索プロセスを簡素化します。

- *Access Control*

    [API Key](./manage-api-keys) または [username password authentication](./cluster-credentials) を使用して、Dedicated cluster および Serverless インスタンスに安全にアクセスできます。

- *Return Raw Vectors*

    [検索パラメータ](./single-vector-search#use-output-fields)で vector フィールドを指定すると、検索結果の一部としてそれらを受け取ることができます。

- *JSON_CONTAINS Filter*

    [JSON_CONTAINS operator](./json-filtering-operators) を使用して、JSON フィールド値に基づくフィルタリング条件を指定し、検索をさらに絞り込むことができます。

- *Entity Count*

    [ロードされた collection 内の entity 総数](./single-vector-search#use-output-fields)をすばやく把握し、データ管理に役立てることができます。

## 機能強化\{#enhancements}

全体的な利用体験を向上させるため、以下の機能強化も実施しました。

- *New Role for RBAC*

    より円滑なコラボレーションのために、プロジェクト共同作業者に [Project Member Role](./project-users) を付与できます。

- *Billing Optimizations*

    合理化されたプロセスにより、より効率的な課金管理を実現します。

- *Advanced [Pricing Calculator](https://zilliz.com/pricing#calculator)*

    primary key、vector フィールド、string フィールドを組み合わせた包括的な見積もりにより、より正確な価格の概要を取得できます。

- *Self-Service Account Deletion*

    自分のプロフィールをより細かく管理できるよう、[自分のアカウント](./email-accounts#close-your-account)や[組織](./organization-settings#delete-organization)を簡単に削除できます。

- *Stability Enhancements*

    サービスの信頼性を向上させるため、既知の問題に対応しました。

イノベーションとパフォーマンスが融合する Zilliz Cloud をお選びいただき、ありがとうございます。
