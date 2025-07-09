---
title: "リリースノート（2023年10月17日） | Cloud"
slug: /release-notes-230
sidebar_label: "リリースノート（2023年10月17日）"
beta: FALSE
notebook: FALSE
description: "私たちは、AWSフランクフルト地域のEUでのローンチを発表できることを喜んでいます。この拡張に伴い、ベータ機能であるRange Search、Upsert、Cosine Metric Typeを導入し、検索機能とデータ管理の効率を向上させます。追加機能には、APIキーアクセス、生のベクトルの取得、JSONCONTAINSフィルター、エンティティカウントが含まれます。RBAC、請求、価格計算、アカウントマネジメント、サービスの安定性においても、ユーザーエクスペリエンスを向上させるために注目すべき改善が実装されています。 | Cloud"
type: origin
token: MocQwCCItiHYEbkkJtOcROPTnod
sidebar_position: 16
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年10月17日）

私たちは、AWSフランクフルト地域のEUでのローンチを発表できることを喜んでいます。この拡張に伴い、ベータ機能であるRange Search、Upsert、Cosine Metric Typeを導入し、検索機能とデータ管理の効率を向上させます。追加機能には、APIキーアクセス、生のベクトルの取得、JSON_CONTAINSフィルター、エンティティカウントが含まれます。RBAC、請求、価格計算、アカウントマネジメント、サービスの安定性においても、ユーザーエクスペリエンスを向上させるために注目すべき改善が実装されています。 

## Milvusの互換性{#milvus-compatibility}

このリリースは、Milvus 2.2. xおよびMilvus 2.3.x(Beta)と互換性があります。

## 新しいAWSリージョン:フランクフルト(aws-eu-central-1)が利用可能になりました。{#new-aws-region-frankfurt-aws-eu-central-1-now-live}

私たちは、ヨーロッパのユーザーベースにより適した新しいAWSフランクフルトリージョンを発表できることを喜んでいます。このリージョンは、強化されたサポートだけでなく、AWS Marketplaceの支払いオプションの利便性も提供しています。利用可能なすべてのクラウドリージョンについては、[クラウドプロバイダー&地域](./cloud-providers-and-regions)を参照してください。

## 革新的なベータ機能{#innovative-beta-features}

専用クラスタで利用可能な最新のベータ機能で未来を探索しましょう。今すぐアップグレードして、以下の機能強化を体験してください:

- *レンジ検索*

    [レンジ検索](./range-search)を使用してクエリを再定義すると、検索の半径を設定できます。従来のANN検索とは異なり、範囲検索では指定された半径内のすべてのベクトルが確実に含まれるため、より包括的なビューが提供されます。

- *アップサート*

    [アップサート](./upsert-entities)を使用することで、動的なデータセットをシームレスに管理できます。更新と挿入が融合しています。頻繁に変更されるデータセットの効率を高めることができます。

- *コサインメトリックタイプ*

    [コサイン](./search-metrics-explained#cosine-similarity)、[インナープロダクト](./search-metrics-explained#inner-product-ip)、[ユークリッド距離](./search-metrics-explained#euclidean-distance-l2)のサポートにより、高度なベクトル検索を体験できます。コサインメトリックにより、事前のベクトル正規化が不要になり、検索過程が効率化されます。

- *アクセス制御*

    [APIキー](./manage-api-keys)または[ユーザー名とパスワードの認証](./cluster-credentials)を使用して、専用クラスターやサーバーレスインスタンスに安全にアクセスできます。

- *生のベクトルを返す*

    [検索パラメータ](./single-vector-search#use-output-fields)にベクトルフィールドを指定すると、検索結果の一部として受け取ることができます。

- *JSON_CONTAINSフィルタ*

    [JSON_CONTAINS演算子](./json-filtering-operators)を使用して検索をさらに絞り込むことで、JSONフィールドの値に基づいてフィルタリング条件を指定できます。

- *エンティティカウント*

    より良いデータ管理のために、[ロードされたコレクション内のエンティティの総数](./single-vector-search#use-output-fields)の概要を簡単に把握してください。

## エンハンスメント{#enhancements}

あなたの全体的な体験を改善するために、いくつかの改良も実装しました。

- *RBACの新しい役割*

    プロジェクトコラボレーターに[プロジェクトメンバーの役割](./project-users)を付与して、より効率的なコラボレーションを実現します。

- *課金の最適化*

    合理化されたプロセスでより効率的な請求管理をお楽しみください。

- *高度な[価格計算ツール](https://zilliz.com/pricing#calculator)*

    主キー、ベクトルフィールド、文字列フィールドを組み合わせた包括的な見積もりを取得して、より正確な価格概要を確認します。

- *セルフサービスアカウントの削除*

    プロフィールをより細かく制御するために、[自分のアカウントを削除してください](./email-accounts#close-your-account)または[組織など](./organization-settings#delete-organization)を簡単に使用できます。

- *安定性の向上*

    私たちは、サービスの信頼性を高めるために既知の問題に対処しました。

イノベーションとパフォーマンスが融合したZilliz Cloudをお選びいただきありがとうございます!