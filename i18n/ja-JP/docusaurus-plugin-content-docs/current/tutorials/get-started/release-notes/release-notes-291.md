---
title: "リリースノート（2024年7月23日） | Cloud"
slug: /release-notes-291
sidebar_label: "リリースノート（2024年7月23日）"
beta: FALSE
notebook: FALSE
description: "このアップデートでは、Zilliz CloudはMilvusの新しいRESTful API v 2をサポートし、一貫したインターフェースと拡張された機能を提供しています。新しいドキュメンテーションチャットボットにより、ユーザーサポートが強化されています。ジョブセンターでは、バックアップ、復元、移行、インポート、クローン収集などのタスクを管理および追跡するための直感的なインターフェースが導入されています。プライベートプレビューで利用可能な専用クラスターの自動スケーリングは、Compute Unit(CU)Capacity Thresholdによってトリガーされ、需要に基づいて容量を動的に調整します。その他の改善点には、より多くのクラスターモニタリングメトリック、改良されたクラスター管理インターフェース、改善されたユーザーメールテンプレートが含まれます。 | Cloud"
type: origin
token: RlhDw3Fr9iCpWSkylfAcyes1nLh
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年7月23日）

このアップデートでは、Zilliz CloudはMilvusの新しいRESTful API v 2をサポートし、一貫したインターフェースと拡張された機能を提供しています。新しいドキュメンテーションチャットボットにより、ユーザーサポートが強化されています。**ジョブセンター**では、バックアップ、復元、移行、インポート、クローン収集などのタスクを管理および追跡するための直感的なインターフェースが導入されています。**プライベートプレビューで利用可能な専用クラスターの自動スケーリング**は、Compute Unit(CU)Capacity Thresholdによってトリガーされ、需要に基づいて容量を動的に調整します。その他の改善点には、より多くのクラスターモニタリングメトリック、改良されたクラスター管理インターフェース、改善されたユーザーメールテンプレートが含まれます。

## Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.3. x**と互換性があります。 

クラスタをBETAにアップグレードする場合は、アップグレード後に**Milvus 2.4. x**の機能が利用可能です。

### RESTful API v 2とは{#restful-api-v2}

最近のMilvus 2.4のアップデートで、新しいRESTful API v 2がリリースされました。このリリースにより、Zilliz CloudはこれらのAPIを完全にサポートし、一連のコントロールプレーンインターフェイスを提供しています。新しいv 2 APIは、インターフェイススタイルがより一貫しており、v 1に比べてより幅広い機能をカバーしています。これらの機能には、ベクトル操作、コレクション管理、インデックス管理、パーティション管理、ロールおよびユーザー管理、およびデータプレーン上のエイリアス操作が含まれます。コントロールプレーンでは、APIはデータインポートとクラスタ管理をカバーしています。詳細については、RESTful v 2 [コントロールプレーンAPI](/reference/restful/control-plane-v2)および[データプレーンAPI](/reference/restful/data-plane-v2)を参照してください。

### チャットボット{#chatbot}

Zilliz Cloudには、従来の検索バーに比べてより柔軟で強力なサポートツールを提供するドキュメンテーションチャットボットが追加されました。このチャットボットを使用すると、ユーザーは簡単に情報を検索し、質問に対する支援を受けることができます。Zilliz Cloudのドキュメンテーションページの右下にあるアイコンをクリックすることで、チャットボットにアクセス可能です。

### ジョブセンター{#job-center}

Zilliz Cloudは、1つのプロジェクト内にすべての履歴データと非同期データのタスクを統合した直感的なジョブページを提供しています。このシンプルなインターフェースにより、進捗状況を簡単に追跡し、さまざまな種類のジョブを管理できます。

- バックアップ

- 復元する

- マイグレーション

- インポート

- クローンコレクションName

詳細は[プロジェクトの仕事を管理する](./job-center)を参照してください。

### 専用クラスタの自動スケーリング[プライベートプレビュー]{#auto-scaling-for-dedicated-clusters-private-preview}

Zilliz Cloudは、需要に基づいてクラスタの容量を動的に調整する機能であるオートスケーリングを導入しています。オートスケーリングは、主にCU(Compute Unit)容量閾値によってトリガーされます。Zilliz Cloudは、クラスタのCU容量を毎分監視し、2分間連続して70%(デフォルトの閾値)を超える場合、システムは自動的にスケーリング過程を開始します。ユーザーは、自動スケーリングの最大CU体格を設定できますが、下方自動スケーリングは現在サポートされていません。

現在、自動スケーリングはプライベートプレビュー段階であり、Dedicated（Enterprise）クラスターでのみ利用可能です。この機能を有効にするには、[お問い合わせ](https://zilliz.com/contact-sales?_gl=1*y9u24o*_ga*NDAwNDA1MDY5LjE3MDkxNTcwNzU.*_ga_KKMVYG8YF2*MTcyMTcwNjA5MC4xMjQuMS4xNzIxNzA5OTk3LjAuMC4w*_ga_HT329313WV*MTcyMTcwNjA5MC4zNS4xLjE3MjE3MDk5OTcuMC4wLjA.*_ga_Q1F8R2NWDP*MTcyMTcwNjA5MC4zMy4xLjE3MjE3MDk5OTcuMC4wLjA.*_gcl_au*ODIwMjEwMjY0LjE3MTcwNjEwOTc.)を使用してください。使用方法については、[オートスケーリング](./manage-cluster)を参照してください。

### パイプライン{#pipelines}

- パイプラインは、新しいSEARCH_IMAGE_BY_TEXT関数を使用して、テキストによる画像検索をサポートするようになりました。この機能により、ユーザーはテキストクエリを入力してデータベースから関連する画像データを取得できます。検索機能は複数の言語に対応しており、テキストと画像のエンコーディングにCLIP vit base patch 32マルチモーダルモデルを利用しています。詳細については、[画像データ](./pipelines-image-data)を参照してください。

- ユーザーは、RestFul APIとUIコンソールの両方を使用して、パイプラインの詳細情報でパイプラインの使用状況情報を取得できるようになりました。この機能強化により、ユーザーはパイプラインの使用状況を包括的に把握し、より良いモニタリングと分析が可能になります。詳細については、[パイプライン利用予測](./estimate-pipelines-usage)を参照してください。

- 各プロジェクトにおける各種パイプラインの最大数の制限が引き上げられました。ユーザーは、以前の10個の制限に比べて、1つのプロジェクトで最大100個のあらゆる種類のパイプラインを作成できるようになりました。この変更により、プロジェクト内でパイプラインを管理する際の柔軟性とスケーラビリティが向上しました。すべてのパイプライン制限の詳細については、[Zilliz Cloudによるパイプラインの制限](./estimate-pipelines-usage)を参照してください。

### エンハンスメント{#enhancements}

このリリースには、一連の強化も含まれています。

- クラスタを監視するための[メトリクス](/docs/metrics-alerts-reference)をもっと見る

- クラスタの変更、移行、バックアップを含むクラスタ管理ページのリファクタリング。

- ユーザーのメールテンプレートの改良

