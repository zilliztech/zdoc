---
title: "Manage Collections（コンソール） | BYOC"
slug: /manage-collections-console
sidebar_label: "コンソール上で"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "collection は、vector embedding とメタデータを保存するために使用される二次元テーブルです。collection 内のすべての entity は同じ schema を共有します。データ管理やマルチテナンシーの目的で複数の collection を作成できます。 | BYOC"
type: origin
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Manage Collections（コンソール）

collection は、vector embedding とメタデータを保存するために使用される二次元テーブルです。collection 内のすべての entity は同じ schema を共有します。データ管理やマルチテナンシーの目的で複数の collection を作成できます。 

このガイドでは、Web コンソール上での collection の作成および管理操作について説明します。視覚的なインターフェースを好むユーザー向けです。SDK に慣れている場合は、それらを通じて collection を作成・管理することもできます。詳細は、[Create Collection](./manage-collections-sdks) を参照してください。

<Admonition type="info" icon="📘" title="注意">

強力なデータ分離が必要で、管理する tenant 数が少ない場合は、tenant ごとに個別の collection を作成できます。

ただし、作成できる collection の最大数は [cluster plan](./limits) に応じて 16,384 です。そのため、大規模なマルチテナンシーでは、ユースケースに応じて partition ベースまたは partition key ベースのマルチテナンシーなど、代替戦略の使用を検討してください。詳細は、[Implement Multi-tenancy](./multi-tenancy) を参照してください。

</Admonition>

## collection を作成する\{#create-a-collection}

Zilliz Cloud コンソールでは、異なるシナリオ向けに設計された 3 つの collection 作成方法を提供しています。

- **Create your own collection:** dataset やユースケースに合わせて schema と index パラメータをカスタマイズします。schema をきめ細かく制御したいユーザーに最適です。

- **Create sample collection:** 事前定義された schema とサンプル dataset を使って collection をすばやくセットアップします。Zilliz Cloud を試す新規ユーザーに推奨されます。

- **Clone an existing collection with data:** 同じ database 内で既存の collection を複製します。テスト用 collection から本番用 collection へ、schema とデータの両方をコピーする必要がある環境複製シナリオで役立ちます。

- **Create from an existing schema**: 既存の collection の schema を使って新しい collection をすばやく作成し、確定前に編集することもできます。

次のデモでは、Web UI 上でこれらの機能がどこにあるかを確認できます。

<Supademo id="cmap9as9900yyx80ihbaf3rqt" title="Create Collection" isShowcase="true" />

以下は、collection 作成時に登場するいくつかの概念です。

### Collection の基本情報\{#collection-basic-information}

collection のメタデータには以下が含まれます。

- Collection 名

- （任意）Collection の説明。最大 1024（UTF-8 bytes）。

- collection が属する database。[database](./database-concept) は cluster と collection の間にある層であり、collection を管理・整理するための論理コンテナとして機能します。関連する collection を同じ database の下にまとめることができます。

### Collection schema\{#collection-schema}

schema は collection のデータ構造を定義し、以下を含める必要があります。

- 1 つの primary key（PK）field

- 少なくとも 1 つの vector field。collection で許可される vector field 数の上限については、[Zilliz Cloud Limits](./limits#fields) を参照してください。

- （任意）メタデータ用の scalar field

- （任意）Dynamic field。dynamic field を有効にすると、既存の schema を変更せずにデータ挿入時に field を追加できるため、collection schema の柔軟性が向上します。データ構造が固定されていない場合は、dynamic field を有効にすることを推奨します。フィルタや query で頻繁に使用する field については、dynamic field を使う代わりに schema で事前定義することで、最適な query パフォーマンスを維持しやすくなります。

<Supademo id="cmaqefyds2e7aho3rna9w8trp" title="Zilliz Cloud - Create Collection Schema" />

<Admonition type="info" icon="📘" title="注意">

schema 設定の大部分は、collection 作成後に変更できません。現在および将来のビジネス要件を満たせるよう、schema は慎重に設計してください。ベストプラクティスについては、[Schema Explained](./schema-explained) を参照してください。

</Admonition>

### Index\{#index}

index は、検索や query を高速化するためにデータを整理するデータ構造です。Zilliz Cloud は 2 種類の index をサポートしています。

- **Vector index**: vector 検索を高速化するために、[AUTOINDEX](./autoindex-explained) を使用して自動的に作成されます。schema に複数の vector field がある場合は、各 vector field に個別の index を作成できます。さらに、vector 間の距離計算に使用する [metric type](./search-metrics-explained) や、index コスト・パフォーマンス・容量のトレードオフを左右する基盤となる量子化戦略を制御する index build level を編集することもできます。 

    <Supademo id="cmgk9ynaq290okrn90l496fq7?utm_source=link" title=""  />

- **Scalar index**: デフォルトでは、Zilliz Cloud は scalar field 用の index を自動作成しません。ただし、フィルタによく使われる scalar field に対しては、検索や query を高速化するために手動で index を作成できます。

collection 作成時に index の作成をスキップし、後から追加することもできます。詳細は、[Indexes](./indexes) を参照してください。

### Functions\{#functions}

Zilliz Cloud では、**functions** はデータ注入時および query 実行時に、text 関連機能が collection 内でどのように適用されるかを定義します。

functions は、適用されるタイミングに基づいて主に 2 つのカテゴリに分かれます。

- **Pre-search Functions**

    Pre-search Functions は、生の text を検索に使用できる vector 表現へどのように変換するかを定義します。これらは **collection 作成時に設定され**、collection の schema の一部になります。

    Pre-search Functions の例には、BM25 function や model-based functions があります。

    Pre-search Functions の動作に関する概念的な概要については、[Function Overview](./function-and-model-inference-overview) を参照してください。

    <Supademo id="cmjm7ydhy01ouxy0ibvzvne7r" title="" isShowcase />

- **Post-search Functions**

    Post-search Functions は、**query 時に** 検索結果の順序を調整します。Pre-search Functions とは異なり、Post-search Functions は **collection schema に紐づきません**。これらは search request のパラメータとして指定され、search によって返された候補結果に対して動作します。

    Post-search Functions は、index 作成や候補取得には影響しません。

    Post-search Functions の動作に関する概念的な概要については、[Function Overview](./function-and-model-inference-overview) を参照してください。

### Partition & partition key\{#partition-and-partition-key}

**Partition:** partition は collection の物理的な部分集合です。partition は親 collection と同じ data schema を共有しますが、collection 内のデータの一部のみを保持します。各 collection にはデフォルトで 1 つの partition が付属しています。マルチテナンシーやデータ管理の目的で、さらに partition を手動で追加できます。追加の partition を作成しない場合、collection に挿入されたすべてのデータはデフォルト partition に入ります。詳細は、[Manage Partitions](./manage-partitions) を参照してください。

**Partition key:** partition key は、partition に基づく検索最適化ソリューションです。非 primary key の `INT64` または `VARCHAR` field を partition key として指定すると、Zilliz Cloud により 16 個の partition が自動作成され、挿入されたすべての entity は partition key の値に基づいてこれら 16 個の自動生成 partition に振り分けられます。collection で partition key を有効にすると、その collection では手動で partition を作成できなくなります。詳細は、[Use Partition Key](./use-partition-key) を参照してください。

<Admonition type="info" icon="📘" title="注意">

partition を作成するか partition key を使用するかを判断するには、以下の要素を考慮できます。

- **マルチテナンシー戦略:** 数百万の tenant をサポートする必要がある場合は、partition key を使用してください。tenant 間で強力な物理データ分離が必要な場合は、partition を使用してください。詳細は、[Implement Multi-tenancy](./multi-tenancy) を参照してください。

- **リソース管理:** partition を自分で作成・管理したい場合は、partition を使用できます。partition の自動作成と自動管理が必要な場合は、partition key を使用してください。

- **ホットデータとコールドデータの管理:** ホットデータとコールドデータを効率的に扱いたい場合は、partition key を使用してください。Dedicated cluster でホットデータとコールドデータの管理に partition key を使用するには、[contact us](http://support.zilliz.com) してください。

</Admonition>

### mmap\{#mmap}

Memory mapping（mmap）は、ディスク上の大きなファイルをメモリに読み込むことなく直接アクセスできるようにする、メモリ使用量の最適化機能です。mmap を有効にすると、同じ CU サイズ仕様でより多くのデータを保存できます。

cluster レベルのデフォルト mmap 設定の詳細については、[Use mmap](./use-mmap#global-mmap-strategy) を参照してください。

collection 作成時には、ユースケースに応じて **collection** レベルまたは **field** レベルで mmap 設定を任意で構成できます。下位レベルの設定は上位レベルより優先されます: **Field > Collection > Cluster.** 

- **Collection-level mmap:** collection 全体の raw data に対して mmap を有効にします。この設定は後から変更できますが、先に collection を release する必要があります。

- **Field-level mmap:** カスタム設定により、選択した field の raw data と scalar indexes に対して mmap を有効にします。一般に、データサイズが大きく、フィルタや query で頻繁に使用されない field に対して mmap を有効にすることが推奨されます。この設定は選択した field にのみ適用され、後から変更できます。field-level mmap 設定を変更するには、先に collection を release する必要があります。

<Admonition type="info" icon="📘" title="注意">

mmap 設定の取り扱いには注意してください。デフォルトの mmap 設定を変更すると、パフォーマンス低下や、メモリ不足（OOM）によるロード失敗を引き起こす可能性があります。ベストプラクティスについては、[Use mmap](./use-mmap#collection-specific-mmap-settings) を参照してください。

</Admonition>

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能への入り口を確認できます。

<Supademo id="cmbk94p4i8hm0sn1rhzrph2b5" title=""  />

### Shard\{#shard}

shard は collection の水平分割単位で、データ入力チャネルに対応します。すべての collection にはデフォルトで 1 つの shard があります。書き込みスループットを増やすために、さらに shard を追加できます。 

一般的な目安として、データ 1 億行ごとに 1 shard を追加することを検討してください。許可される shard の最大数は cluster plan および cluster CU size に依存します。詳細は、[Zilliz Cloud Limits](./limits#shards) を参照してください。

shard 数は、collection 作成後に [clone collection](./manage-collections-console#create-a-collection) 機能を使って後から編集できます。

### Full text search\{#full-text-search}

Zilliz Cloud コンソールでは、full text search で使用する functions と analyzer の設定をサポートしています。full text search の詳細については、[Full Text Search](./full-text-search) を参照してください。

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能への入り口を確認できます。

<Supademo id="cmbj8ahun7j48sn1redlc3e93" title=""  />

### Text Match\{#text-match}

Zilliz Cloud コンソールでは、text match 用の field と analyzer の設定もサポートしています。text match の詳細については、[Text Match](./text-match) を参照してください。

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能への入り口を確認できます。

<Supademo id="cmbj80qyf7it8sn1r6lzo0g1c" title=""  />

## collection を管理する\{#manage-collection}

Zilliz Cloud は、作成済み collection に対して Web コンソール経由で以下の管理操作をサポートしています。

<Supademo id="cmaqjykyn002myh0irk72q332" title="" isShowcase />

- **collection 名を変更する:** 既存の collection 名を変更できます。

- **collection の説明を編集する:** 既存の collection の説明を変更できます。 

    ![SBlWwPqMPhqspYbR7pxct59xnle](https://zdoc-images.s3.us-west-2.amazonaws.com/SBlWwPqMPhqspYbR7pxct59xnle.png)

- **collection schema と設定を編集する:** 現在、Zilliz Cloud は以下の schema と設定の編集のみをサポートしています。

    - 既存の [VARCHAR field](./use-string-field) の `max_length` 値を編集できます。

    - 既存の [ARRAY field](./use-array-fields) の `max_capacity` 値、および ARRAY type が VARCHAR の場合は `max_length` 値も編集できます。

    - 既存の schema に新しい scalar field を追加できます。

    - **shard** 設定を変更するには、代わりに [Clone collection](./manage-collections-console#create-a-collection) 機能を使用してください。

    - **mmap** または **partition key** 設定を変更するには、代わりに SDK を使用してください。詳細は、[Modify Collection](./modify-collections) を参照してください。

    - collection 作成時に dynamic field を有効にしていなかった場合は、後から SDK または Web コンソールを使用して有効化できます。SDK の詳細は、[Modify Collection](./modify-collections#example-5-enable-dynamic-field) を参照してください。Web コンソールで dynamic field を有効にする方法については、上記のデモを参照してください。

    その他の collection schema 設定は編集できません。変更を適用するには、目的の設定で新しい collection を作成し、そこにデータをインポートしてください。

- **collection を load / release する:** Zilliz Cloud Web コンソールでは、collection は作成直後に自動的にメモリへ load され、search と query に使用可能になります。メモリ領域を解放するには、未使用の collection を release できます。Zilliz Cloud Web コンソールでは、単一 collection の load / release、または複数 collection の一括 load / release をサポートしています。

- **collection を別の database に移動する:** 関連する collection を同じ database 内にグループ化し、必要に応じて database 間で collection を移動できます。

- **collection 内の partition を管理する:** **partition key** が **有効** な collection では、partition を手動で管理する必要はありません。partition key が **無効** な collection では、partition を手動で管理し、以下の操作を実行できます。

    - **partition を作成する:** 各 collection には最大 1,024 個の partition を作成できます。詳細は、[Zilliz Cloud Limits](./limits#collections) を参照してください。

    - **partition を削除する:** デフォルト partition は削除できず、partition を削除するとその中のすべてのデータが元に戻せない形で削除されます。collection 内の partition を削除する前に、まず collection を release する必要があります。

- **collection alias を表示する**: cluster 内のすべての collection の alias を、collection 一覧ページで確認できます。

- **collection timezone を編集する**: collection timezone は、この collection 内のすべての TIMESTAMPTZ entity の timezone を定義します。デフォルトでは **UTC** を使用しますが、アプリケーションのニーズに合わせて別の timezone を選択できます。

- **collection TTL を編集する**: Time-to-live（TTL）は、collection 内データの有効期限を決定する collection のプロパティです。詳細は、[Set Collection TTL](./set-collection-ttl) を参照してください。

- **Allow Insert Auto ID を有効にする:** `allow_insert_auto_id` プロパティにより、AutoID が有効な collection は、insert、upsert、および bulk import 時にユーザーが指定した primary key 値を受け入れられるようになります。詳細は、[Modify Collection](./modify-collections#example-6-enable-allowinsertautoid) を参照してください。

- **collection を削除する:** リソースのオーバーヘッドを削減するため、不要になった collection を削除できます。collection を削除すると、その中のすべてのデータは元に戻せない形で削除されます。

## collection データをプレビューする\{#preview-collection-data}

**Data** タブを使用すると、Zilliz Cloud コンソールから collection 内の entity を直接プレビューできます。 

フィルタ式を定義し、`limit` パラメータを設定してプレビューに表示する entity 数を制御し（デフォルトは 100、最大 16,384）、一致する entity を query して table 内の field 値を確認できます。

また、**Order By** を使用して、primary key field、numeric field、または scalar field によってデータプレビューを昇順または降順に並べ替えることもできます。

![WHDsw55d9hAOZeboD3Fc7yTwnSg](https://zdoc-images.s3.us-west-2.amazonaws.com/WHDsw55d9hAOZeboD3Fc7yTwnSg.png)
