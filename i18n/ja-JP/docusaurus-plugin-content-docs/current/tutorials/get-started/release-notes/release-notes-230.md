---
title: "リリースノート (2023年10月17日) | Cloud"
slug: /release-notes-230
sidebar_key: release-notes-230
sidebar_label: "2023年10月17日"
beta: FALSE
notebook: FALSE
description: "AWS フランクフルトリージョン（EU）のローンチを発表いたします。この拡張に伴い、ベータ機能として Range Search、Upsert、およびコサイン メトリックタイプを導入し、検索機能とデータ管理の効率性を向上させました。その他の機能には、APIキーアクセス、生ベクトルの取得、JSONCONTAINS フィルター、およびエンティティ数が含まれます。また、RBAC、請求、料金計算、アカウント管理、およびサービス安定性の改善も実施し、ユーザー体験を向上させました。 | Cloud"
type: origin
token: MocQwCCItiHYEbkkJtOcROPTnod
sidebar_position: 27
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年10月17日）

AWS フランクフルトリージョン（EU）のローンチを発表いたします。この拡張に伴い、Range Search、Upsert、コサイン メトリックタイプ のベータ機能を導入し、検索機能とデータ管理効率を向上させました。その他の機能として、APIキー Access、Retrieve Raw Vectors、JSON_CONTAINS Filter、エンティティ数 が含まれます。また、RBAC、請求、料金計算、アカウント管理、サービス安定性における注目すべき改善も実施され、ユーザー体験が向上しています。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## 新規 AWS リージョン：フランクフルト（aws-eu-central-1）- 稼働開始\{#new-aws-region-frankfurt-aws-eu-central-1-now-live}

ヨーロッパのユーザーベースにより適切に対応するために設計された、新しい AWS フランクフルトリージョンを発表いたします。このリージョンは、強化されたサポートを提供するだけでなく、AWS Marketplace の支払いオプションの利便性も提供します。利用可能なすべてのクラウドリージョンについては、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。

## 革新的なベータ機能\{#innovative-beta-features}

専用クラスターで利用可能な最新のベータ機能で、未来を探索してください。今すぐアップグレードして、これらの機能強化を体験してください：

- *Range Search*

    [Range Search](./range-search) でクエリを再定義し、検索の半径を設定できます。従来の ANN Search とは異なり、Range Search は指定された半径内のすべてのベクトルを確実に含めるため、より包括的なビューを提供します。

- *Upsert*

    [Upsert](./upsert-entities)（「update」と「insert」の融合）で、動的なデータセットをシームレスに管理します。変更が頻繁なデータセットの効率が向上します。

- *コサイン メトリックタイプ*

    [コサイン](./search-metrics-explained#cosine-similarity)、[内積](./search-metrics-explained#inner-product-ip)、[ユークリッド距離](./search-metrics-explained#euclidean-distance-l2) のサポートにより、高度なベクトル検索を体験できます。コサイン メトリックは、事前のベクトル正規化の必要をなくし、検索プロセスを効率化します。

- *アクセス制御*

    [APIキー](./manage-api-keys) または [ユーザー名・パスワード認証](./cluster-credentials) で、専用クラスターとサーバーレスインスタンスに安全にアクセスできます。

- *生ベクトルの返却*

    [検索パラメーター](./single-vector-search#use-output-fields) でベクトルフィールドを指定し、検索結果の一部として受け取ることができます。

- *JSON_CONTAINS Filter*

    [JSON_CONTAINS 演算子](./json-filtering-operators) で、JSON フィールド値に基づくフィルタリング条件を指定し、検索をさらに絞り込むことができます。

- *エンティティ数*

    [ロードされたコレクション内のエンティティの総数](./single-vector-search#use-output-fields) を簡単に確認し、データ管理を改善できます。

## 機能強化\{#enhancements}

全体的な体験を向上させるため、いくつかの機能強化も実施しました：

- *RBAC の新しいロール*

    プロジェクトの共同作業者に [Project Member ロール](./project-users) を付与し、より効率的な共同作業を実現します。

- *請求の最適化*

    効率化されたプロセスにより、より効率的な請求管理をお楽しみいただけます。

- *高度な [料金計算ツール](https://zilliz.com/pricing#calculator)*

    プライマリキー、ベクトルフィールド、文字列フィールドを組み合わせた包括的な見積もりにより、より正確な料金概要を取得できます。

- *セルフサービスのアカウント削除*

    [自分のアカウント](./email-accounts#close-your-account) または [組織](./organization-settings#delete-organization) を簡単に削除し、プロフィールをより細かく管理できます。

- *安定性の強化*

    既知の問題に対処し、サービスの信頼性を向上させました。

イノベーションとパフォーマンスが融合する Zilliz Cloud をお選びいただき、ありがとうございます！