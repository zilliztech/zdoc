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
sidebar_position: 1
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

        このリリースにより、**Milvus v2.6.x クラスター** が Zilliz Cloud で **Public Preview** として利用可能になりました。安定性、効率性、柔軟性を向上させる複数の機能強化と最適化が含まれています。

        - **ダウンタイムなしのフィールド追加** — スキーマの回避策なしで、コレクションに新しいフィールドをその場で追加できます。詳細については、[既存のコレクションへのフィールド追加](./add-fields-to-an-existing-collection) を参照してください。

        - **強化されたフルテキスト検索** — Elasticsearch と比べて最大 **4倍高速** で、複数言語のサポートとフレーズ一致機能を備えています。詳細については、[多言語アナライザー](./multi-language-analyzers)、[フレーズ一致](./phrase-match)、および [ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case) を参照してください。

        - **高速化された JSON フィルタリング** — **JSON indexing** と **shredding** により、複雑でネストされたメタデータクエリを最大 **100倍高速** に実行できます。詳細については、[JSON Indexing](./json-indexing) と [JSON Shredding](./json-shredding) を参照してください。

        - **新しいリランキング関数** — **Boost Ranker** と **Decay Ranker** により、意味的類似性と文脈的関連性を組み合わせて検索結果を洗練できます。詳細については、[Boost Ranker](./boost-ranker) と [Decay Ranker Overview](./decay-ranker-oveview) を参照してください。

        - **INT8 ベクトルサポート** — 軽量なディープラーニング推論向けに量子化されたベクトルを保存できます。詳細については、[Dense Vector](./use-dense-vector) を参照してください。

        - **MINHASH_LSH インデックス** — MinHash と Locality-Sensitive Hashing を活用して、大規模な重複排除と類似性チェックを効率的に実行できます。この機能は **Private Preview** で利用可能で、興味がある場合は [お問い合わせ](https://support.zilliz.com/hc/en-us) いただけます。詳細については、[MINHASH_LSH](./minhash-lsh) を参照してください。

        - **部分 upsert** — レコード全体を書き換えることなく、特定のフィールドを更新できます。詳細については、[エンティティの Upsert](./upsert-entities) を参照してください。

        **Public Preview** を有効にするには、Zilliz Cloud コンソールの **Cluster Overview** ページで **Try Preview Features** を選択して、クラスターを Milvus v2.6.x にアップグレードします。アップグレード後も、Milvus v2.5.x の機能は引き続き利用可能です。

        ## Tiered Storage Upgrade\{#tiered-storage-upgrade}

        Zilliz Cloud の Tiered Storage がアップグレードされ、パフォーマンスとコスト効率が最適化されました。現在、すべての Extended Capacity クラスターは新しいアーキテクチャへ移行されており、以下の主な改善が提供されます。

        - **スマートデータ管理**: アクセスパターンに基づいて、Hot（メモリ）、Warm（SSD）、Cold（オブジェクトストレージ）の各ティア間でデータを自動的に移動し、パフォーマンスとコスト効率の両方を向上させます。

        - **より高いキャッシュヒット率**: キャッシュヒット率は 90% を超え、大半のクエリはより高速なティアから処理されます。

        - **コスト削減**: コンピュートコストは 25% 削減され、ストレージコストは 1 GB あたり月額 &#36;0.30 から &#36;0.04 へと 87% 低下します。10TB のデータセットでは、月間ストレージコストが &#36;3,000 から &#36;400 に削減される一方で、高いパフォーマンスを維持します。

        ## Cross-Region Backup\{#cross-region-backup}

        Zilliz Cloud は現在、Dedicated クラスター向けに Cross-Region Backup をサポートしており、災害復旧機能を強化します。この機能により、バックアップを他のリージョンへ自動的に複製することで、クラウドリージョン全体の障害に対する耐障害性が確保されます。

        **主な機能**

        - **自動レプリケーション:** バックアップポリシーを一度設定すれば、Zilliz Cloud が選択した保存先リージョンへの継続的なレプリケーションを自動的に処理します。

        - **地理的冗長性:** 元のバックアップとは物理的に離れた場所にバックアップコピーを保存することで、リージョン障害に備えます。

        - **迅速な復旧:** クロスリージョンバックアップから新しいクラスターへデータを迅速に復元し、ダウンタイムを最小限に抑え、Recovery Time Objective（RTO）を大幅に改善します。

        詳細については、[他のリージョンへのコピー](./backup-to-other-regions) を参照してください。

        ## Index Build Level\{#index-build-level}

        Milvus 2.6.x と次世代の量子化エンジンにより、アプリケーションの要件に合わせて検索精度（リコール）とデータ容量のトレードオフを細かく調整できます。Zilliz Cloud の新しい Index Build Level 機能では、インデックス作成時にベクトル検索パフォーマンスを制御でき、次の 3 つのレベルが提供されます。

        - **Precision-first:** 精度が最重要となるミッションクリティカルなアプリケーション向けに、検索精度を最大化します。

        - **Balanced (Default):** ほとんどのユースケースに推奨される設定で、リコール、パフォーマンス、容量の理想的なバランスを提供します。

        - **Capacity-first:** データ密度を重視して最適化されており、クエリのリコールは低下しますが、同じ予算でより多くのベクトルを保存できます。

        詳細については、[Index Build Level の調整](./tune-index-build-level) を参照してください。

        ## Enhancements\{#enhancements}

        - **Analyzer GUI** を使用して、**言語別テンプレート** によるアナライザーの設定と、結果の **テスト** をすばやく行えるようになりました。これにより、アナライザーの設定がトークン化にどのように影響し、最終的にフルテキスト検索結果へどう影響するかをユーザーが理解しやすくなります。デモについては、[Analyzer Overview](./analyzer-overview) を参照してください。

        - より明確なエラーメッセージと改善されたエクスペリエンスにより、ユーザーは **接続の問題を診断** し、移行用のソースデータベースをより簡単に設定できるようになりました。

        - データなしでコレクションをクローンする際に、スキーマを編集し、コレクション設定を変更できるようになりました。

        ## Deprecation notice\{#deprecation-notice}

        - Pipeline 機能は非推奨となり、現在はオフラインです。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025-09-20**

    </div>

    <div>

        ## Azure North Europe（アイルランド）をサポート\{#support-azure-north-europe-ireland}

    </div>

</Grid>

