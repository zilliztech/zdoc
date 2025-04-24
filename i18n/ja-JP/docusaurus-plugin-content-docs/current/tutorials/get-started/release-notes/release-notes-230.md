---
title: "リリースノート（2023年10月17日） | Cloud"
slug: /release-notes-230
sidebar_label: "リリースノート（2023年10月17日）"
beta: FALSE
notebook: FALSE
description: "私たちは、EUにおけるAWSフランクフルト地域のローンチを発表できることを喜んでいます。この拡張に伴い、ベータ機能であるRange Search、Upsert、Cosine Metric Typeを導入し、検索機能とデータ管理の効率を向上させました。追加機能には、APIKey Access、Retrieve Raw Vectors、JSONCONTAINS Filter、Entity Countが含まれます。RBAC、請求、価格計算、アカウントマネジメント、サービスの安定性にも注目すべき改善が実装され、ユーザーエクスペリエンスが向上しました。 | Cloud"
type: origin
token: QEWhwhoNciJQCDklDF4cJEYrnfh
sidebar_position: 13
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年10月17日）

私たちは、EUにおけるAWSフランクフルト地域のローンチを発表できることを喜んでいます。この拡張に伴い、ベータ機能であるRange Search、Upsert、Cosine Metric Typeを導入し、検索機能とデータ管理の効率を向上させました。追加機能には、APIKey Access、Retrieve Raw Vectors、JSON_CONTAINS Filter、Entity Countが含まれます。RBAC、請求、価格計算、アカウントマネジメント、サービスの安定性にも注目すべき改善が実装され、ユーザーエクスペリエンスが向上しました。

## Milvusの互換性{#milvus}

このリリースは、**Milvus 2.2. x**および**Milvus 2.3.x(Beta)**と互換性があります。

## 新しいAWSリージョン:フランクフルト(aws-eu-central-1)が利用可能になりました。{#new-aws-region-frankfurt-aws-eu-central-1-now-live}

私たちは、ヨーロッパのユーザーベースにより適した新しいAWSフランクフルトリージョンを発表できることを喜んでいます。このリージョンは、強化されたサポートだけでなく、AWS Marketplaceの支払いオプションの利便性も提供しています。利用可能なすべてのクラウドリージョンについては、「[クラウドプロバイダー&地域](./cloud-providers-and-regions)」を参照してください。

## 革新的なベータ機能{#innovative-beta-features}

専用クラスタで利用可能な最新のベータ機能で未来を探索しましょう。今すぐアップグレードして、以下の機能強化を体験してください:

- *レンジ検索*

    範囲検索を使用してクエリを再定義し、[検索](./range-search)の半径を設定できるようにします。従来のANN検索とは異なり、範囲検索は指定された半径内のすべてのベクトルを確実に含めるため、より包括的なビューを提供します。

- *アップサート*

    「更新」と「挿入」を融合した[Upsert](./upsert-entities)を使用して、動的なデータセットをシームレスに管理できます。頻繁に変更が行われるデータセットの効率を高めることができます。

- *コサインメトリック型*

    高度なベクトル検索を[コサイン](./search-metrics-explained#cosine-similarity)、[内積](./search-metrics-explained#inner-product-ip)、[ユークリッド距離](./search-metrics-explained#euclidean-distance-l2)のサポートで体験できます。コサインメトリックにより、事前のベクトル正規化が不要になり、検索過程が効率化されます。

- *アクセス制御*

    専用クラスタやサーバーレスインスタンスには、[APIキー](./manage-api-keys)または[ユーザー名パスワード認証](./cluster-credentials)で安全にアクセスできます。

- *生のベクトルを返す*

    検索結果の一部として受け取るために、[検索パラメータ](./single-vector-search#use-output-fields)にベクトルフィールドを指定してください。

- *JSON_CONTAINSフィルタ*

    さらに[JSON_CONTAINS演算子](./json-filtering-operators)を使用して検索を絞り込むと、JSONフィールドの値に基づいてフィルタリング条件を指定できます。

- *エンティティカウント*

    データ管理を改善するために、[ロードされたコレクション内のエンティティの総数](./single-vector-search#use-output-fields)の概要をすばやく確認できます。

## エンハンスメント{#enhancements}

あなたの全体的な体験を改善するために、いくつかの改良も実装しました。

- *RBACの新しい役割*

    より効率的なコラボレーションのために、[プロジェクトメンバーロール](./project-users)をプロジェクトコラボレーターに付与します。

- *課金の最適化*

    合理化されたプロセスでより効率的な請求管理をお楽しみください。

- *高度な[価格計算ツール](https://zilliz.com/pricing#calculator)*

    主キー、ベクトルフィールド、文字列フィールドを組み合わせた包括的な見積もりを取得して、より正確な価格概要を確認します。

- *セルフサービスアカウントの削除*

    簡単に[自分のアカウント](./email-accounts)や[組織](./organizations)を削除して、プロフィールをより細かく管理できます。

- *安定性の強化*

    私たちは、サービスの信頼性を高めるために既知の問題に対処しました。

イノベーションとパフォーマンスが融合したZilliz Cloudをお選びいただきありがとうございます!