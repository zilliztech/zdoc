---
title: "リリースノート（2023年10月17日） | Cloud"
slug: /release-notes-230
sidebar_label: "2023年10月17日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "EU における AWS Frankfurt リージョンの提供開始をお知らせします。この拡張にあわせて、検索機能とデータ管理の効率を向上させるベータ機能として、Range Search、Upsert、Cosine Metric Type を導入します。さらに、API Key Access、Retrieve Raw ベクトル、JSONCONTAINS Filter、Entity Count などの機能も追加されています。また、RBAC、課金、価格計算、アカウント管理、サービス安定性に関する注目すべき改善も実施し、ユーザー体験を向上させています。 | Cloud"
type: origin
token: MocQwCCItiHYEbkkJtOcROPTnod
sidebar_position: 29
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年10月17日）

EU における AWS Frankfurt リージョンの提供開始をお知らせできることを嬉しく思います。この拡張にあわせて、検索機能とデータ管理の効率を向上させるベータ機能として、Range Search、Upsert、Cosine Metric Type を導入します。さらに、API Key Access、Retrieve Raw ベクトル、JSON_CONTAINS Filter、Entity Count などの機能も追加されています。また、RBAC、課金、価格計算、アカウント管理、サービス安定性に関する注目すべき改善も実施し、ユーザー体験を向上させています。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## 新しい AWS リージョン: Frankfurt (aws-eu-central-1) - 提供開始\{#new-aws-region-frankfurt-aws-eu-central-1-now-live}

ヨーロッパのユーザー基盤により適切に対応できるよう設計された新しい AWS Frankfurt リージョンを公開できることを嬉しく思います。このリージョンは強化されたサポートを提供するだけでなく、AWS Marketplace による支払いオプションも利用できます。利用可能なすべてのクラウドリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

## 革新的なベータ機能\{#innovative-beta-features}

Dedicated クラスターで利用可能な最新のベータ機能で、未来を体験してください。今すぐアップグレードして、これらの機能強化をご利用ください。

- ***Range Search***

    [Range Search](./range-search) でクエリを再定義し、検索の半径を設定できるようになります。従来の ANN Search とは異なり、Range Search は指定した半径内のすべてのベクトルを確実に含めるため、より包括的な全体像を把握できます。

- ***Upsert***

    「update」と「insert」を融合させた [Upsert](./upsert-entities) により、動的なデータセットをシームレスに管理できます。変更が頻繁に発生するデータセットでは、効率の向上を実感できます。

- ***Cosine Metric Type***

    [Cosine](./search-metrics-explained#cosine-similarity)、[Inner Product](./search-metrics-explained#inner-product-ip)、[Euclidean Distance](./search-metrics-explained#euclidean-distance-l2) のサポートにより、高度なベクトル検索を体験できます。Cosine metric は事前のベクトル正規化を不要にし、検索プロセスを簡素化します。

- ***Access Control***

    [API Key](./manage-api-keys) または [username password authentication](./cluster-credentials) を使用して、Dedicated クラスターや Serverless インスタンスに安全にアクセスできます。

- ***Return Raw ベクトル***

    [検索パラメータ](./single-vector-search#use-output-fields)でベクトルフィールドを指定すると、検索結果の一部としてそれらを受け取ることができます。

- ***JSON_CONTAINS Filter***

    [JSON_CONTAINS operator](./json-filtering-operators) を使用すると、JSON フィールド値に基づいたフィルタリング条件を指定でき、検索をさらに絞り込めます。

- ***Entity Count***

    [ロード済みコレクション内のエンティティの総数](./single-vector-search#use-output-fields)をすばやく把握でき、データ管理の向上に役立ちます。

## 機能強化\{#enhancements}

全体的なユーザー体験を向上させるために、以下の機能強化も実施しました。

- ***New Role for RBAC***

    より円滑なコラボレーションのために、プロジェクトの共同作業者に Project Member [Role](./manage-platform-roles#predefined-project-roles) を付与できます。

- ***Billing Optimizations***

    合理化されたプロセスにより、より効率的な課金管理を利用できます。

- ***Advanced [Pricing Calculator*](https://zilliz.com/pricing#calculator)***

    primary key、ベクトルフィールド、文字列フィールドを組み合わせた包括的な見積もりにより、より正確な価格の概要を取得できます。

- ***Self-Service Account Deletion***

    プロフィールをより細かく制御できるように、[自分のアカウント](./email-accounts#close-your-account)や[組織](./organization-settings#delete-organization)を簡単に削除できます。

- ***Stability Enhancements***

    サービスの信頼性を高めるために、既知の問題に対応しました。

イノベーションとパフォーマンスが融合する Zilliz Cloud をお選びいただき、ありがとうございます。
