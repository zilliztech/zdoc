---
title: "2025 年 10 月リリースノート | Cloud"
slug: /release-notes-2510
sidebar_key: release-notes-2510
sidebar_label: "2025 年 10 月"
beta: FALSE
notebook: FALSE
description: "2025 年 10 月の Zilliz Cloud リリースノートです。"
type: origin
token: PmaowiSUaiTa8ckPMYJcqdRYnQg
sidebar_position: 7
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2025 年 10 月リリースノート

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025-10-09**

    </div>

    <div>

        ## Milvus v2.6.x パブリックプレビュー\{#milvus-v26x-public-preview}

        このリリースにより、**Milvus v2.6.x クラスター**が Zilliz Cloud で**パブリックプレビュー**として利用可能になりました。これには、安定性、効率性、および柔軟性を向上させる複数の機能強化と最適化が含まれています。

        - **ダウンタイムなしのフィールド追加** — スキーマの回避策を講じることなく、実行中にコレクションへ新しいフィールドを追加できます。詳細については、[既存のコレクションへのフィールドの追加](./add-fields-to-an-existing-collection) を参照してください。

        - **Enhanced 全文検索** — 多言語サポートと フレーズ一致 機能を備え、Elasticsearch よりも最大**4 倍高速**です。詳細については、[多言語アナライザー](./multi-language-analyzers)、[Phrase Match](./phrase-match)、および [ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case) を参照してください。

        - **高速化されたJSONフィルタリング** — **JSON インデックス**と**シュレッディング**により、複雑なネストされたメタデータクエリを最大**100 倍高速**で実行できます。詳細については、[JSON インデックス作成](./json-indexing) および [JSON シュレッディング](./json-shredding) を参照してください。

        - **新しい再ランキング関数** — **Boost Ranker**および**Decay Ranker**は、セマンティック類似性と文脈的関連性を組み合わせることで検索結果を洗練させます。詳細については、Boost Ranker および Decay Ranker を参照してください。

        - **INT8ベクトルサポート** — 軽量なディープラーニング推論のために量子化されたベクトルを保存できます。詳細については、[密ベクトル](./use-dense-vector) を参照してください。

        - **MINHASH_LSH index** — MinHash と Locality-Sensitive ハッシュ化 を活用して、大規模な重複排除と類似性チェックを効率的に実行します。この機能は**プライベートプレビュー**で利用可能であり、ご興味がある場合は [お問い合わせ](https://support.zilliz.com/hc/en-us) ください。詳細については、[MINHASH_LSH](./minhash-lsh) を参照してください。

        - **部分的なアップサート** — レコード全体を書き換えることなく、特定のフィールドを更新できます。詳細については、[エンティティのアップサート](./upsert-entities#upsert-in-merge-mode) を参照してください。

        **パブリックプレビュー**を有効にするには、Zilliz Cloud コンソールの**クラスター概要**ページで**プレビュー機能を試す**を選択し、クラスターを Milvus v2.6.x にアップグレードしてください。アップグレード後でも、Milvus v2.5.x の機能は引き続き利用可能です。

        ## Tiered Storage Upgrade\{#tiered-storage-upgrade}

        Zilliz Cloud のティアードストレージが、パフォーマンスとコスト効率を最適化するためにアップグレードされました。すべての Extended Capacity クラスターが新しいアーキテクチャに移行され、以下の主要な改善が提供されます。

        - **スマートデータ管理**: アクセスパターンに基づいてデータを Hot（メモリ）、Warm（SSD）、Cold（オブジェクトストレージ）の各ティア間で自動的に移動し、パフォーマンスとコスト効率の両方を向上させます。

        - **キャッシュヒット率の向上**: 90% 以上のキャッシュヒット率を実現し、ほとんどのクエリがより高速なティアから提供されます。

        - **コスト削減**: 計算コストが 25% 削減され、ストレージコストは GB あたり月額 0.30 ドルから 0.04 ドルへと 87% 削減されます。10TB のデータセットの場合、高性能を維持しつつ、月間のストレージコストが 3,000 ドルから 400 ドルに低下します。

        ## Cross-Region Backup\{#cross-region-backup}

        Zilliz Cloud は、専用クラスター向けに Cross-Region Backup をサポートし、災害復旧機能を強化しました。この機能は、バックアップを他のリージョンに自動的に複製することで、クラウドリージョン全体の障害に対する回復力を確保します。

        **主要機能**

        - **Automated Replication:** バックアップポリシーを一度設定するだけで、Zilliz Cloud が選択した宛先リージョンへの継続的な複製を自動的に処理します。

        - **Geographic Redundancy:** オリジナルのバックアップとは物理的に離れた場所にバックアップコピーを保存することで、リージョン全体の障害から保護します。

        - **Rapid Recovery:** クロスリージョンバックアップから新しいクラスターへデータを迅速に復元し、ダウンタイムを最小限に抑えながら、目標復旧時間（RTO）を大幅に改善します。

        詳細については、[他のリージョンへのコピー](./backup-to-other-regions) を参照してください。

        ## Index Build Level\{#index-build-level}

        Milvus 2.6.x と次世代の量子化エンジンにより、アプリケーションのニーズに合わせて検索精度（再現率）とデータ容量のトレードオフを微調整できます。Zilliz Cloud の新しい Index Build Level 機能により、インデックス作成時にベクトル検索パフォーマンスを制御でき、以下の 3 つのレベルを提供します。

        - **精度優先:** 精度が最も重要となるミッションクリティカルなアプリケーション向けに、検索精度を最大化します。

        - **バランス (Default):** ほとんどのユースケースにおすすめの設定で、再現率、パフォーマンス、容量の理想的なバランスを提供します。

        - **容量優先:** データ密度に最適化されており、クエリの再現率は低下しますが、予算内でより多くのベクトルを保存できます。

        詳細については、[Index Build Level の調整](./tune-index-build-level) を参照してください。

        ## Enhancements\{#enhancements}

        - **Analyzer GUI**を使用して、**言語固有のテンプレート**でアナライザーをすばやく構成し、結果を**テスト**できるようになりました。これにより、ユーザーはアナライザー構成がトークン化にどのように影響し、最終的に全文検索の結果にどのような影響を与えるかを理解できます。デモについては、[アナライザーの概要](./analyzer-overview#example-use-on-the-zilliz-cloud-console) を参照してください。

        - エラーメッセージがより明確になり、エクスペリエンスが強化されたことで、ユーザーは**接続の問題を診断する**ことや、移行用のソースデータベースをより簡単にセットアップできるようになりました。

        - データなしでコレクションをクローンする場合、スキーマを編集し、コレクション設定を変更できるようになりました。

        ## Deprecation notice\{#deprecation-notice}

        - Pipeline 機能は非推奨となり、現在はオフラインになっています。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025-09-20**

    </div>

    <div>

        ## Support Azure North Europe (Ireland)\{#support-azure-north-europe-ireland}

    </div>

</Grid>

