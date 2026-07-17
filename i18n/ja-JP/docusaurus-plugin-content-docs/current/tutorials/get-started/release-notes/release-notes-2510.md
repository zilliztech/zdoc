---
title: " 2025年10月 リリースノート | Cloud"
slug: /release-notes-2510
sidebar_label: "2025年10月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: PmaowiSUaiTa8ckPMYJcqdRYnQg
sidebar_position: 10
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

#  2025年10月 リリースノート

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025-10-09**

    </div>

    <div>

        ## Milvus v2.6.x Public Preview\{#milvus-v26x-public-preview}

        このリリースにより、**Milvus v2.6.x clusters** が Zilliz Cloud 上で **Public Preview** として利用可能になりました。安定性、効率性、柔軟性を向上させる複数の機能強化と最適化が含まれています。

        - **ダウンタイムなしのフィールド追加** — スキーマの回避策なしで、collection に新しいフィールドをその場で追加できます。詳細については、[Add Fields to an Existing Collection](./add-fields-to-an-existing-collection) を参照してください。

        - **強化されたフルテキスト検索** — Elasticsearch より最大 **4倍高速** で、多言語サポートとフレーズ一致機能を提供します。詳細については、[Multi-language Analyzers](./multi-language-analyzers)、[Phrase Match](./phrase-match)、および [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case) を参照してください。

        - **高速化された JSON フィルタリング** — **JSON indexing** と **shredding** により、複雑でネストされたメタデータクエリを最大 **100倍高速** に実行できます。詳細については、[JSON Indexing](./json-indexing) および [JSON Shredding](./json-shredding) を参照してください。

        - **新しい reranking 関数** — **Boost Ranker** と **Decay Ranker** により、意味的類似性と文脈上の関連性を組み合わせて検索結果を改善できます。詳細については、[Boost Ranker](./boost-ranker) および [Decay Ranker Overview](./decay-ranker-oveview) を参照してください。

        - **INT8 vector サポート** — 軽量なディープラーニング推論向けに量子化された vector を保存できます。詳細については、[Dense Vector](./use-dense-vector) を参照してください。

        - **MINHASH_LSH index** — MinHash と Locality-Sensitive Hashing を活用して、大規模な重複排除と類似性チェックを効率的に実行できます。この機能は **Private Preview** として提供されており、興味がある場合は [お問い合わせ](https://support.zilliz.com/hc/en-us) いただけます。詳細については、[MINHASH_LSH](./minhash-lsh) を参照してください。

        - **部分 upsert** — レコード全体を書き換えることなく、特定のフィールドを更新できます。詳細については、[Upsert Entities](./upsert-entities#upsert-in-merge-mode) を参照してください。

        **Public Preview** を有効にするには、Zilliz Cloud コンソールの **Cluster Overview** ページで **Try Preview Features** を選択し、cluster を Milvus v2.6.x にアップグレードします。アップグレード後も、Milvus v2.5.x の機能は引き続き利用できます。

        ## Tiered Storage のアップグレード\{#tiered-storage-upgrade}

        Zilliz Cloud の Tiered Storage がアップグレードされ、パフォーマンスとコスト効率が最適化されました。すべての Extended Capacity cluster は新しいアーキテクチャへ移行済みで、以下の主要な改善が提供されます。

        - **スマートデータ管理**: アクセスパターンに基づいて、Hot（メモリ）、Warm（SSD）、Cold（オブジェクトストレージ）の各階層間でデータを自動的に移動し、パフォーマンスとコスト効率の両方を向上させます。

        - **より高いキャッシュヒット率**: 90% を超えるキャッシュヒット率を実現し、ほとんどのクエリが高速な階層から処理されます。

        - **コスト削減**: コンピュートコストは 25% 削減され、ストレージコストは 1GB あたり月額 &#36;0.30 から &#36;0.04 へと 87% 削減されます。10TB のデータセットでは、月間ストレージコストが &#36;3,000 から &#36;400 に低下しつつ、高いパフォーマンスを維持します。

        ## Cross-Region Backup\{#cross-region-backup}

        Zilliz Cloud は Dedicated Clusters 向けに Cross-Region Backup をサポートするようになり、災害復旧機能が強化されました。この機能により、バックアップを他のリージョンへ自動的に複製し、クラウドリージョン全体の障害に対する耐障害性を確保します。

        **主な機能**

        - **自動レプリケーション:** バックアップポリシーを一度設定すれば、選択した保存先リージョンへの継続的なレプリケーションは Zilliz Cloud が自動的に処理します。

        - **地理的冗長性:** 元のバックアップとは物理的に離れた場所にバックアップコピーを保存することで、リージョン障害から保護します。

        - **迅速な復旧:** Cross-Region Backup から新しい cluster へすばやくデータを復元でき、ダウンタイムを最小限に抑え、Recovery Time Objective（RTO）を大幅に改善します。

        詳細については、[Copy To Other Regions](./backup-to-other-regions) を参照してください。

        ## Index Build Level\{#index-build-level}

        Milvus 2.6.x と次世代の量子化エンジンにより、検索精度（recall）とデータ容量のトレードオフを、アプリケーションのニーズに合わせて細かく調整できます。Zilliz Cloud の新しい Index Build Level 機能では、index 作成時に vector 検索パフォーマンスを制御でき、以下の 3 つのレベルを選択できます。

        - **Precision-first:** 精度が最重要となるミッションクリティカルなアプリケーション向けに、検索精度を最大化します。

        - **Balanced (Default):** ほとんどのユースケースに推奨される設定で、recall、パフォーマンス、容量の理想的なバランスを提供します。

        - **Capacity-first:** データ密度に最適化されており、クエリの recall は低下しますが、予算内でより多くの vector を保存できます。

        詳細については、[Tune Index Build Level](./tune-index-build-level) を参照してください。

        ## 機能強化\{#enhancements}

        - **Analyzer GUI** を使用して、**言語固有のテンプレート** による analyzer の設定や、結果の **テスト** をすばやく行えるようになりました。これにより、analyzer の設定がトークン化にどのような影響を与え、最終的にフルテキスト検索結果へどう影響するかを理解しやすくなります。デモについては、[Analyzer Overview](./analyzer-overview#example-use-on-the-zilliz-cloud-console) を参照してください。

        - より明確なエラーメッセージと改善された体験により、ユーザーは **接続の問題を診断** し、移行用のソースデータベースをより簡単に設定できるようになりました。

        - データなしで collection をクローンする際に、スキーマを編集し、collection 設定を変更できるようになりました。

        ## 非推奨のお知らせ\{#deprecation-notice}

        - Pipeline 機能は非推奨となり、現在はオフラインです。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025-09-20**

    </div>

    <div>

        ## Azure North Europe（アイルランド）のサポート\{#support-azure-north-europe-ireland}

    </div>

</Grid>

