---
title: "コレクションの管理（コンソール） | BYOC"
slug: /manage-collections-console
sidebar_label: "コンソール上"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "collection は、vector 埋め込みとメタデータを保存するための二次元テーブルです。collection 内のすべてのエンティティは同じ schema を共有します。データ管理やマルチテナンシーの目的で複数の collection を作成できます。 | BYOC"
type: origin
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# コレクションの管理（コンソール）

collection は、vector 埋め込みとメタデータを保存するための二次元テーブルです。collection 内のすべてのエンティティは同じ schema を共有します。データ管理やマルチテナンシーの目的で複数の collection を作成できます。 

このガイドでは、Web コンソール上での collection の作成および管理操作について説明します。ビジュアルインターフェースを好むユーザーを対象としています。SDK に慣れている場合は、SDK を通じて collection を作成および管理することもできます。詳細については、[Create Collection](./manage-collections-sdks) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

強力なデータ分離が必要で、管理する tenant 数が少ない場合は、tenant ごとに個別の collection を作成できます。

ただし、作成できる collection の最大数は [cluster plan](./limits) に応じて 16,384 です。したがって、大規模なマルチテナンシーでは、ユースケースに応じて partition ベースまたは partition key ベースのマルチテナンシーなど、代替戦略の使用を検討してください。詳細については、[Implement Multi-tenancy](./multi-tenancy) を参照してください。

</Admonition>

## collection の作成\{#create-a-collection}

Zilliz Cloud コンソールでは、collection を作成する 3 つの方法が提供されており、それぞれ異なるシナリオ向けに設計されています。

- **独自の collection を作成:** データセットとユースケースに合わせて schema と index パラメータをカスタマイズします。schema を細かく制御する必要があるユーザーに最適です。

- **サンプル collection を作成:** 定義済み schema とサンプルデータセットを使用して collection をすばやくセットアップします。Zilliz Cloud を試し始める新規ユーザーにおすすめです。

- **既存の collection をデータごと複製:** 同じ database 内で既存の collection を複製します。テスト用 collection から本番用 collection に schema とデータの両方をコピーする必要がある、環境複製のシナリオで便利です。

- **既存の schema から作成**: 既存 collection の schema を使用して新しい collection をすばやく作成し、確定前に編集することもできます。

以下のデモでは、Web UI 上でこれらの機能がどこにあるかを確認できます。

<Supademo id="cmap9as9900yyx80ihbaf3rqt" title="Create Collection" isShowcase="true" />

以下は、collection 作成時に登場するいくつかの概念です。

### collection の基本情報\{#collection-basic-information}

collection のメタデータには次のものが含まれます。

- collection 名

- （任意）collection の説明。最大 1024（UTF-8 バイト単位）。

- collection が属する database。[database](./database-concept) は cluster と collection の間にあるレイヤーであり、collection を管理・整理するための論理コンテナとして機能します。関連する collection を同じ database の下にグループ化できます。

### collection schema\{#collection-schema}

schema は collection のデータ構造を定義し、以下を含める必要があります。

- 1 つの primary key（PK）field

- 少なくとも 1 つの vector field。collection で許可される vector field 数の制限については、[Zilliz Cloud Limits](./limits#fields) を参照してください。

- （任意）メタデータ用の scalar field

- （任意）Dynamic field。dynamic field を有効にすると、既存の schema を変更せずにデータ挿入時に field を追加できるため、collection schema に柔軟性が生まれます。データ構造が固定されていない場合は、dynamic field を有効にすることをおすすめします。filter や query で頻繁に使用される field については、dynamic field を使用するのではなく、事前に schema で定義しておくことで、最適な query パフォーマンスを維持しやすくなります。

<Supademo id="cmaqefyds2e7aho3rna9w8trp" title="Zilliz Cloud - Create Collection Schema" />

<Admonition type="info" icon="📘" title="Notes">

schema の設定の多くは、collection 作成後に変更できません。現在および将来のビジネスニーズを満たすよう、schema は慎重に設計してください。ベストプラクティスについては、[Schema Explained](./schema-explained) を参照してください。

</Admonition>

### Index\{#index}

index は、検索および query を高速化するためにデータを整理するデータ構造です。Zilliz Cloud は 2 種類の index をサポートしています。

- **Vector index**: vector 検索を高速化するために、[AUTOINDEX](./autoindex-explained) を使用して自動的に作成されます。schema に複数の vector field がある場合、vector field ごとに個別の index を作成できます。さらに、vector 間の距離計算に使用される [metric type](./search-metrics-explained) や、index コスト、パフォーマンス、容量のトレードオフを制御する基盤となる量子化戦略を制御する index build level を編集することもできます。 

    <Supademo id="cmgk9ynaq290okrn90l496fq7?utm_source=link" title=""  />

- **Scalar index**: デフォルトでは、Zilliz Cloud は scalar field に対して自動的に index を作成しません。ただし、filter によく使用される scalar field には、検索と query を高速化するために手動で index を作成できます。

collection 作成時に index の作成をスキップし、後で index を追加することもできます。詳細については、[Indexes](./indexes) を参照してください。

### Functions\{#functions}

Zilliz Cloud では、**functions** は、データ取り込みおよび query 実行時に collection 内でテキスト関連機能をどのように適用するかを定義します。

functions は、適用されるタイミングに基づいて大きく 2 つのカテゴリに分かれます。

- **Pre-search Functions**

    Pre-search Functions は、生のテキストを検索に使用できる vector 表現にどのように変換するかを定義します。これらは **collection 作成時に設定され**、collection の schema の一部になります。

    Pre-search Functions の例には、BM25 function や model ベースの functions があります。

    Pre-search Functions の動作に関する概念的な概要については、[Function Overview](./function-and-model-inference-overview) を参照してください。

    <Supademo id="cmjm7ydhy01ouxy0ibvzvne7r" title="" isShowcase />

- **Post-search Functions**

    Post-search Functions は、**query 時** に検索結果の並び順を調整します。Pre-search Functions とは異なり、Post-search Functions は **collection schema に紐づきません**。これらは検索リクエストのパラメータとして指定され、検索によって返された候補結果に対して動作します。

    Post-search Functions は、index 作成や候補取得には影響しません。

    Post-search Functions の動作に関する概念的な概要については、[Function Overview](./function-and-model-inference-overview) を参照してください。

### Partition と partition key\{#partition-and-partition-key}

**Partition:** partition は collection の物理的なサブセットです。partition は親 collection と同じ data schema を共有しますが、collection 内のデータの一部のみを含みます。各 collection には 1 つの default partition が付属しています。マルチテナンシーやデータ管理のために、手動でさらに partition を追加できます。追加の partition を作成しない場合、collection に挿入されたすべてのデータは default partition に入ります。詳細については、[Manage Partitions](./manage-partitions) を参照してください。

**Partition key:** partition key は、partition に基づく検索最適化ソリューションです。primary key ではない `INT64` または `VARCHAR` field を partition key として指定すると、Zilliz Cloud により 16 個の partition が自動的に作成され、挿入されたすべてのエンティティは partition key の値に基づいてこれら 16 個の自動生成 partition に入ります。collection で partition key を有効にすると、この collection で手動で partition を作成できなくなります。詳細については、[Use Partition Key](./use-partition-key) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

partition を作成する必要があるか、partition key を使用する必要があるかを判断するには、次の要素を検討できます。

- **マルチテナンシー戦略:** 数百万の tenant をサポートする必要がある場合は、partition key を使用してください。tenant 間で強力な物理データ分離が必要な場合は、partition を使用してください。詳細については、[Implement Multi-tenancy](./multi-tenancy) を参照してください。

- **リソース管理:** partition を自分で作成・管理したい場合は、partition を使用できます。partition の自動作成および管理が必要な場合は、partition keys を使用してください。

- **ホットデータとコールドデータの管理:** ホットデータとコールドデータを効率的に扱いたい場合は、partition key を使用してください。Dedicated cluster でホットデータとコールドデータの管理に partition key を使用するには、[お問い合わせ](http://support.zilliz.com)ください。

</Admonition>

### mmap\{#mmap}

メモリマッピング（mmap）は、ディスク上の大きなファイルをメモリにロードせずに直接アクセスできるようにするメモリ使用量最適化です。mmap を有効にすると、同じ CU サイズ仕様の下でより多くのデータを保存できます。

cluster レベルのデフォルト mmap 設定の詳細については、[Use mmap](./use-mmap#global-mmap-strategy) を参照してください。

collection 作成時には、ユースケースに応じて **collection** レベルまたは **field** レベルで mmap 設定を任意に構成できます。下位レベルの設定は上位レベルより優先されます: **Field > Collection > Cluster.** 

- **Collection-level mmap:** collection 全体の生データに対して mmap を有効にします。この設定は後から変更できますが、最初に collection を release する必要があります。

- **Field-level mmap:** カスタム設定により、選択した field の生データおよび scalar index に対して mmap を有効にします。一般に、データサイズが大きく、filter や query で頻繁に使用されない field に対して mmap を有効にすることが推奨されます。この設定は選択した field にのみ適用され、後から変更することも可能です。field レベルの mmap 設定を変更するには、最初に collection を release する必要があります。

<Admonition type="info" icon="📘" title="Notes">

mmap 設定には十分注意してください。デフォルトの mmap 設定を変更すると、パフォーマンス低下や、メモリ不足（OOM）によるロード失敗を引き起こす可能性があります。ベストプラクティスについては、[Use mmap](./use-mmap#collection-specific-mmap-settings) を参照してください。

</Admonition>

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能の入口を確認できます。

<Supademo id="cmbk94p4i8hm0sn1rhzrph2b5" title=""  />

### Shard\{#shard}

shard は、データ入力チャネルに対応する collection の水平スライスです。すべての collection にはデフォルトで 1 つの shard があります。書き込みスループットを高めるために shard を追加できます。 

一般的な目安として、データ 1 億行ごとに 1 shard を追加することを検討してください。許可される shard の最大数は、cluster plan と cluster CU サイズによって異なります。詳細については、[Zilliz Cloud Limits](./limits#shards) を参照してください。

collection 作成後は、[clone collection](./manage-collections-console#create-a-collection) 機能を使用して shard 数を後から編集できます。

### Full text search\{#full-text-search}

Zilliz Cloud コンソールでは、full text search で使用する functions と analyzer の設定をサポートしています。full text search の詳細については、[Full Text Search](./full-text-search) を参照してください。

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能の入口を確認できます。

<Supademo id="cmbj8ahun7j48sn1redlc3e93" title=""  />

### Text Match\{#text-match}

Zilliz Cloud コンソールでは、text match 用の field と analyzer の設定もサポートしています。text match の詳細については、[Text Match](./text-match) を参照してください。

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能の入口を確認できます。

<Supademo id="cmbj80qyf7it8sn1r6lzo0g1c" title=""  />

## collection の管理\{#manage-collection}

Zilliz Cloud は、作成済み collection に対して Web コンソール経由で以下の管理操作をサポートしています。

<Supademo id="cmaqjykyn002myh0irk72q332" title="" isShowcase />

- **collection の名前変更:** 既存 collection の名前を変更できます。

- **collection の説明を編集:** 既存 collection の説明を変更できます。 

    ![SBlWwPqMPhqspYbR7pxct59xnle](https://zdoc-images.s3.us-west-2.amazonaws.com/SBlWwPqMPhqspYbR7pxct59xnle.png)

- **collection schema と設定を編集:** 現在、Zilliz Cloud は以下の schema と設定のみ編集をサポートしています。

    - 既存の [VARCHAR field](./use-string-field) の `max_length` 値を編集できます。

    - 既存の [ARRAY field](./use-array-fields) の `max_capacity` 値、および ARRAY 型が VARCHAR の場合は `max_length`値を編集できます。

    - 既存 schema に新しい scalar field を追加できます。

    - **shard** 設定を変更するには、代わりに [Clone collection](./manage-collections-console#create-a-collection) 機能を使用してください。

    - **mmap** または **partition key** 設定を変更するには、代わりに SDK を使用してください。詳細については、[Modify Collection](./modify-collections) を参照してください。

    - collection 作成時に dynamic field を有効にしていなかった場合、後から SDK または Web コンソールを使用して有効にできます。SDK の詳細については、[Modify Collection](./modify-collections#example-5-enable-dynamic-field) を参照してください。Web コンソールで dynamic field を有効にする方法については、上のデモを参照してください。

    その他の collection schema 設定は編集できません。変更を適用するには、目的の設定で新しい collection を作成し、その collection にデータをインポートしてください。

- **collection の load と release:** Zilliz Cloud Web コンソールでは、collection は作成直後に自動的にメモリに load され、検索および query に利用可能になります。メモリ領域を解放するために、未使用の collection を release できます。Zilliz Cloud Web コンソールでは、単一 collection の load または release、あるいは複数 collection の一括 load または release をサポートしています。

- **collection を別の database に移動:** 関連する collection を同じ database 内にグループ化し、必要に応じて database 間で collection を移動できます。

- **collection 内の partition を管理:** **partition key** が **有効** な collection では、partition を手動で管理する必要はありません。partition key が **無効** な collection では、partition を手動で管理でき、以下の操作を実行できます。

    - **partition の作成:** 各 collection には最大 1,024 個の partition を作成できます。詳細については、[Zilliz Cloud Limits](./limits#collections) を参照してください。

    - **partition の削除:** default partition は削除できず、partition を削除するとその中のすべてのデータは元に戻せない形で削除されます。collection 内の partition を削除する前に、まず collection を release する必要があります。

- **collection alias の表示**: collection 一覧ページで、cluster 内のすべての collection の alias を表示できます。

- **collection timezone の編集**: collection timezone は、この collection 内のすべての TIMESTAMPTZ エンティティに対するタイムゾーンを定義します。デフォルトでは **UTC** を使用しますが、アプリケーションの要件に合わせて別のタイムゾーンを選択できます。

- **collection TTL の編集**: Time-to-live（TTL）は、collection 内データの有効期限を決定する collection のプロパティです。詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください。

- **Allow Insert Auto ID を有効化:** `allow_insert_auto_id` プロパティにより、AutoID が有効な collection は、insert、upsert、および bulk import 時にユーザー指定の primary key 値を受け入れられるようになります。詳細については、[Modify Collection](./modify-collections#example-6-enable-allowinsertautoid) を参照してください。

- **collection の削除:** リソースのオーバーヘッドを減らすため、不要になった collection を削除できます。collection を削除すると、その中のすべてのデータは元に戻せない形で削除されます。

## collection データのプレビュー\{#preview-collection-data}

**Data** タブを使用すると、Zilliz Cloud コンソールから collection 内のエンティティを直接プレビューできます。 

filter 式を定義し、`limit` パラメータを設定してプレビューに表示するエンティティ数を制御し（デフォルトは 100、最大 16,384）、一致するエンティティを query して、table 内で field 値を確認できます。

また、**Order By** を使用して、primary key field、numeric field、または scalar field によってデータプレビューを昇順または降順に並べ替えることもできます。

![WHDsw55d9hAOZeboD3Fc7yTwnSg](https://zdoc-images.s3.us-west-2.amazonaws.com/WHDsw55d9hAOZeboD3Fc7yTwnSg.png)
