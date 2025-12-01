---
title: "リリースノート (2023年10月17日) | Cloud"
slug: /release-notes-230
sidebar_label: "リリースノート (2023年10月17日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "EUのAWSフランクフルトリージョンのローンチを発表できることを嬉しく思います。この拡大に伴い、検索機能およびデータ管理効率を向上させるベータ機能である範囲検索、アップサート、およびコサイン距離メトリックタイプを導入します。追加機能には、APIキーによるアクセス、生ベクトルの取得、JSONCONTAINSフィルター、エンティティ数が含まれます。RBAC、請求、価格計算、アカウント管理、およびサービス安定性における注目すべき改善も実装され、ユーザーエクスペリエンスが向上しました。 | Cloud"
type: origin
token: MocQwCCItiHYEbkkJtOcROPTnod
sidebar_position: 20
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination

---

import Admonition from '@theme/Admonition';


# リリースノート (2023年10月17日)

EUのAWSフランクフルトリージョンのローンチを発表できることを嬉しく思います。この拡大に伴い、検索機能およびデータ管理効率を向上させるベータ機能を導入します：範囲検索、アップサート、およびコサイン距離メトリックタイプ。追加機能には、APIキーによるアクセス、生ベクトルの取得、JSON_CONTAINSフィルター、エンティティ数が含まれます。RBAC、請求、価格計算、アカウント管理、およびサービス安定性における注目すべき改善も実装され、ユーザーエクスペリエンスが向上しました。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.2.x**および**Milvus 2.3.x (Beta)**と互換性があります。

## 新AWSリージョン：フランクフルト (aws-eu-central-1) - 現在運用中\{#new-aws-region-frankfurt-aws-eu-central-1-now-live}

欧州市場のユーザーをより適切に支援するために設計された新しいAWSフランクフルトリージョンの公開を嬉しく思います。このリージョンは、拡張サポートを提供するだけでなく、AWS Marketplaceの支払いオプションの利便性も提供します。利用可能なすべてのクラウドリージョンについては、[クラウドプロバイダーおよびリージョン](./cloud-providers-and-regions)を参照してください。

## 革新的なベータ機能\{#innovative-beta-features}

最新のベータ機能で未来を探索し、専用クラスターで利用可能です。今すぐアップグレードしてこれらの強化を体験してください：

- *範囲検索*

    [範囲検索](./range-search)でクエリを再定義し、検索の半径を設定できます。従来のANN検索とは異なり、範囲検索は指定された半径内のすべてのベクトルを含めることを保証し、より包括的なビューを提供します。

- *アップサート*

    [アップサート](./upsert-entities)で動的データセットをシームレスに管理し、「更新」と「挿入」を融合したものです。変更が頻繁なデータセットにおいてより効率的です。

- *コサイン距離メトリックタイプ*

    [コサイン](./search-metrics-explained#cosine-similarity)、[内積](./search-metrics-explained#inner-product-ip)、および[ユークリッド距離](./search-metrics-explained#euclidean-distance-l2)サポートによる高度なベクトル検索を体験してください。コサインメトリックは、事前ベクトル正規化の必要性を排除し、検索プロセスを合理化します。

- *アクセス制御*

    [APIキー](./manage-api-keys)または[ユーザー名パスワード認証](./cluster-credentials)で専用クラスターおよびサーバーレスインスタンスに安全にアクセスできます。

- *生ベクトルの取得*

    [検索パラメータ](./single-vector-search#use-output-fields)でベクトルフィールドを指定して、検索結果の一部として受信できます。

- *JSON_CONTAINSフィルター*

    [JSON_CONTAINS演算子](./json-filtering-operators)で検索をさらに絞り込み、JSONフィールド値に基づいてフィルタリング条件を指定できます。

- *エンティティ数*

    読み込まれたコレクション内の[エンティティの総数](./single-vector-search#use-output-fields)に関する概要をすばやく取得し、データ管理をより効果的に行えます。

## 機能強化\{#enhancements}

全体的なエクスペリエンスを向上させるために、いくつかの強化も実装しました：

- *RBACの新ロール*

    よりスムーズなコラボレーションのために、プロジェクト共同作業者に[プロジェクトメンバー役割](./project-users)を付与します。

- *請求の最適化*

    効率的な請求管理を、合理化されたプロセスで楽しめます。

- *高度な[価格計算機](https://zilliz.com/pricing#calculator)*

    主キー、ベクトルフィールド、および文字列フィールドを組み合わせた包括的な見積もりにより、より正確な価格概要を取得できます。

- *セルフサービスアカウント削除*

    プロファイルに対するより大きな制御のために、[自身のアカウントを簡単に削除](./email-accounts#close-your-account)したり、[組織を削除](./organization-settings#delete-organization)できます。

- *安定性強化*

    サービスの信頼性を向上させるために既知の問題に対処しました。

イノベーションとパフォーマンスが融合するZilliz Cloudをお選びいただきありがとうございます！