---
title: "リリースノート（2023 年 10 月 17 日） | Cloud"
slug: /release-notes-230
sidebar_key: release-notes-230
sidebar_label: "2023 年 10 月 17 日"
beta: FALSE
notebook: FALSE
description: "EU における AWS フランクフルトリージョンの開始を発表できることを嬉しく思います。この拡張に伴い、検索機能とデータ管理効率を向上させるベータ機能として、範囲検索、アップサート、およびコサインメトリックタイプを導入しました。その他の新機能には、API キーアクセス、生ベクトルの取得、JSONCONTAINS フィルター、エンティティ数があります。さらに、ユーザー体験を向上させるために、RBAC、請求、価格計算、アカウント管理、サービスの安定性に関する重要な改善も実施されました。 | Cloud"
type: origin
token: MocQwCCItiHYEbkkJtOcROPTnod
sidebar_position: 25
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年10月17日）

AWS Frankfurtリージョン（EU）の提供を開始したことをお知らせします。この拡張に伴い、検索機能とデータ管理効率を強化するベータ機能として、Range Search、Upsert、コサイン メトリックタイプを導入しました。その他の新機能には、APIキー Access、Rawベクトルの取得、JSON_CONTAINSフィルター、エンティティ数が含まれます。さらに、RBAC、請求、価格計算、アカウント管理、サービス安定性においても重要な改善が実施され、ユーザーエクスペリエンスが向上しています。

## Milvus 互換性\{#milvus-compatibility}

本リリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## 新しい AWS リージョン：Frankfurt (aws-eu-central-1) — ただいま稼働中\{#new-aws-region-frankfurt-aws-eu-central-1-now-live}

欧州ユーザーの皆さまにより良いサービスを提供するため、新しい AWS Frankfurt リージョンをリリースしました。このリージョンでは、より強化されたサポートに加え、AWS Marketplaceでの支払いオプションもご利用いただけます。利用可能なすべてのクラウドリージョンについては、[クラウドプロバイダーs & Regions](./cloud-providers-and-regions) をご参照ください。

## 革新的なベータ機能\{#innovative-beta-features}

専用クラスター向けの最新ベータ機能で未来を体験してください。今すぐアップグレードして、これらの強化機能をお試しください：

- *Range Search*

    [Range Search](./range-search) を使用して、検索の半径を設定できます。従来の ANN Search とは異なり、Range Search は指定された半径内のすべてのベクトルを確実に含むため、より包括的な結果を提供します。

- *Upsert*

    [Upsert](./upsert-entities)（「update」と「insert」の融合）により、頻繁に変更される動的データセットをシームレスに管理できます。

- *コサイン メトリックタイプ*

    [コサイン](./search-metrics-explained#cosine-similarity)、[内積](./search-metrics-explained#inner-product-ip)、[ユークリッド距離](./search-metrics-explained#euclidean-distance-l2) をサポートした高度なベクトル検索を体験してください。コサインメトリックでは事前のベクトル正規化が不要となり、検索プロセスが簡素化されます。

- *アクセス制御*

    [APIキー](./manage-api-keys) または [ユーザー名とパスワード認証](./cluster-credentials) を使用して、専用クラスターおよびサーバーレスインスタンスに安全にアクセスできます。

- *Rawベクトルの返却*

    [検索パラメーター](./single-vector-search#use-output-fields) でベクトルフィールドを指定すると、検索結果の一部としてそれらのベクトルを受け取れます。

- *JSON_CONTAINS フィルター*

    [JSON_CONTAINS 演算子](./json-filtering-operators) を使用して、JSONフィールドの値に基づくフィルタリング条件を指定し、検索をさらに絞り込めます。

- *エンティティ数*

    [ロード済みコレクション内のエンティティ総数](./single-vector-search#use-output-fields) を簡単に確認でき、データ管理がより効率的になります。

## 機能強化\{#enhancements}

全体的なユーザーエクスペリエンスを向上させるため、以下の機能強化も実施しました：

- *RBAC の新ロール*

    プロジェクト共同作業者に [Project Member ロール](./project-users) を付与することで、コラボレーションがよりスムーズになります。

- *請求の最適化*

    効率的な請求管理を実現するため、プロセスを合理化しました。

- *高度な [Pricing Calculator](https://zilliz.com/pricing#calculator)*

    プライマリキー、ベクトルフィールド、文字列フィールドを組み合わせた包括的な見積もりにより、より正確な価格概算が可能になりました。

- *セルフサービスによるアカウント削除*

    自身の [アカウント](./email-accounts#close-your-account) や [組織](./organization-settings#delete-organization) を簡単に削除でき、プロファイル管理の自由度が高まります。

- *安定性の強化*

    既知の問題を修正し、サービスの信頼性を向上させました。

イノベーションとパフォーマンスが融合した Zilliz Cloud をお選びいただき、誠にありがとうございます！