---
title: "Collections の管理（Console）| Cloud"
slug: /manage-collections-console
sidebar_label: "Console 上"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "collection は、vector 埋め込みとメタデータを保存するための二次元テーブルです。collection 内のすべてのエンティティは同じスキーマを共有します。データ管理やマルチテナンシーの目的で複数の collections を作成できます。| Cloud"
type: origin
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Collections の管理（Console）

collection は、vector 埋め込みとメタデータを保存するための二次元テーブルです。collection 内のすべてのエンティティは同じスキーマを共有します。データ管理やマルチテナンシーの目的で複数の collections を作成できます。 

このガイドでは、Web コンソールでの collection の作成および管理操作について説明します。視覚的なインターフェースを好むユーザー向けです。SDK に慣れている場合は、SDK を通じて collections を作成・管理することもできます。詳細については、[Create Collection](./manage-collections-sdks) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

強力なデータ分離が必要で、管理する tenant 数が少ない場合は、tenant ごとに個別の collection を作成できます。

ただし、[cluster plan](./limits) に応じて作成できる collection 数の上限は 16,384 です。そのため、大規模なマルチテナンシーでは、ユースケースに応じて partition ベースまたは partition key ベースのマルチテナンシーなど、代替戦略の使用を検討してください。詳細については、[Implement Multi-tenancy](./multi-tenancy) を参照してください。

</Admonition>

## collection を作成する\{#create-a-collection}

Zilliz Cloud コンソールでは、collection を作成するための 3 つの方法が提供されており、それぞれ異なるシナリオ向けに設計されています。

- **独自の collection を作成:** スキーマと index パラメータを、データセットおよびユースケースに合わせてカスタマイズします。スキーマを細かく制御したいユーザーに最適です。

- **サンプル collection を作成:** 定義済みのスキーマとサンプルデータセットを使用して、collection をすばやくセットアップします。Zilliz Cloud を試す新規ユーザーに推奨されます。

- **データ付きで既存の collection をクローン:** 同じ database 内で既存の collection を複製します。テスト用 collection から本番用 collection にスキーマとデータの両方をコピーする必要がある、環境複製のシナリオで便利です。

- **既存のスキーマから作成**: 既存の collection のスキーマを使用して新しい collection をすばやく作成し、確定前に編集することもできます。

以下のデモでは、Web UI 上でこれらの機能がどこにあるかを示しています。

<Supademo id="cmap9as9900yyx80ihbaf3rqt" title="Create Collection" isShowcase="true" />

以下は、collection を作成する際に登場する主な概念です。

### Collection の基本情報\{#collection-basic-information}

collection のメタデータには、以下が含まれます。

- Collection 名

- （任意）Collection の説明。最大 1024（UTF-8 バイト）。

- collection が属する database。[database](./database-concept) は cluster と collection の間にあるレイヤーで、collections を管理および整理するための論理コンテナとして機能します。関連する collections を同じ database の下にグループ化できます。

### Collection スキーマ\{#collection-schema}

スキーマは collection のデータ構造を定義し、以下を含める必要があります。

- 1 つの primary key（PK）field

- 少なくとも 1 つの vector field。collection に許可される vector fields 数の制限については、[Zilliz Cloud Limits](./limits#fields) を参照してください。

- （任意）メタデータ用の scalar fields

- （任意）Dynamic field。dynamic field を有効にすると、既存のスキーマを変更せずにデータ挿入時に fields を追加できるため、collection スキーマに柔軟性が生まれます。データ構造が固定されていない場合は、dynamic field を有効にすることを推奨します。フィルタやクエリで頻繁に使用する fields については、dynamic fields を使うのではなく、あらかじめスキーマ内で定義しておくことをお勧めします。これにより、最適なクエリ性能を維持しやすくなります。

<Supademo id="cmaqefyds2e7aho3rna9w8trp" title="Zilliz Cloud - Create Collection Schema" />

<Admonition type="info" icon="📘" title="Notes">

スキーマ構成の大部分は、collection 作成後に変更できません。現在および将来のビジネスニーズを満たせるよう、慎重にスキーマを設計してください。ベストプラクティスについては、[Schema Explained](./schema-explained) を参照してください。

</Admonition>

### Index\{#index}

index は、検索やクエリを高速化するためにデータを整理するデータ構造です。Zilliz Cloud は 2 種類の indexes をサポートしています。

- **Vector index**: vector 検索を高速化するために、[AUTOINDEX](./autoindex-explained) を使用して自動的に作成されます。スキーマに複数の vector fields がある場合は、各 vector field ごとに個別の index を作成できます。さらに、vectors 間の距離計算に使用する [metric type](./search-metrics-explained) や、index のコスト・性能・容量のトレードオフを左右する基盤となる量子化戦略を制御する index build level を編集することもできます。 

    <Supademo id="cmgk9ynaq290okrn90l496fq7?utm_source=link" title=""  />

- **Scalar index**: デフォルトでは、Zilliz Cloud は scalar fields に対して自動的に indexes を作成しません。ただし、フィルタで一般的に使用される scalar fields に対しては、検索やクエリを高速化するために手動で indexes を作成できます。

collection 作成時に indexes の作成をスキップし、後から追加することもできます。詳細については、[Indexes](./indexes) を参照してください。

### Functions\{#functions}

Zilliz Cloud では、**functions** はデータ投入時およびクエリ実行時に、collection 内でテキスト関連機能をどのように適用するかを定義します。

functions は、適用されるタイミングに応じて大きく 2 つのカテゴリに分かれます。

- **Pre-search Functions**

    Pre-search Functions は、生のテキストを検索に使用できる vector 表現へどのように変換するかを定義します。これらは **collection 作成時に設定され**、collection のスキーマの一部になります。

    Pre-search Functions の例には、BM25 function や model ベースの functions があります。

    Pre-search Functions の仕組みについての概念的な概要は、[Function Overview](./function-and-model-inference-overview) を参照してください。

    <Supademo id="cmjm7ydhy01ouxy0ibvzvne7r" title="" isShowcase />

- **Post-search Functions**

    Post-search Functions は、**クエリ時**に検索結果の並び順を調整します。Pre-search Functions とは異なり、Post-search Functions は **collection スキーマに紐づきません**。これらは検索リクエストのパラメータとして指定され、検索で返された候補結果に対して動作します。

    Post-search Functions は、index 作成や候補取得には影響しません。

    Post-search Functions の仕組みについての概念的な概要は、[Function Overview](./function-and-model-inference-overview) を参照してください。

### Partition & partition key\{#partition-and-partition-key}

**Partition:** partition は collection の物理的なサブセットです。partition は親 collection と同じデータスキーマを共有しますが、collection 内データの一部のみを含みます。各 collection には 1 つのデフォルト partition が付属しています。マルチテナンシーやデータ管理の目的で、手動でさらに partitions を追加できます。追加の partition を作成しない場合、collection に挿入されたすべてのデータはデフォルト partition に入ります。詳細については、[Manage Partitions](./manage-partitions) を参照してください。

**Partition key:** partition key は、partitions に基づく検索最適化ソリューションです。非 primary key の `INT64` または `VARCHAR` field を partition key として指定すると、Zilliz Cloud により 16 個の partitions が自動的に作成され、挿入されたすべてのエンティティはその partition key 値に基づいてこれら 16 個の自動生成 partitions に振り分けられます。collection で partition key を有効にすると、この collection では partitions を手動で作成できなくなります。詳細については、[Use Partition Key](./use-partition-key) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

partitions を作成する必要があるか、partition key を使用する必要があるかを判断するには、次の要素を検討してください。

- **マルチテナンシー戦略:** 数百万の tenants をサポートする必要がある場合は、partition key を使用してください。tenants 間で強力な物理データ分離が必要な場合は、partitions を使用してください。詳細については、[Implement Multi-tenancy](./multi-tenancy) を参照してください。

- **リソース管理:** partitions を自分で作成および管理したい場合は、partitions を使用できます。partitions の自動作成および自動管理が必要な場合は、partition keys を使用してください。

- **ホットデータとコールドデータの管理:** ホットデータとコールドデータを効率的に扱いたい場合は、partition key を使用してください。Dedicated clusters でホットデータ／コールドデータ管理のために partition key を使用するには、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

### mmap\{#mmap}

メモリマッピング（mmap）は、ファイル全体をメモリに読み込まずにディスク上の大きなファイルへ直接アクセスできるようにするメモリ使用量最適化機能です。mmap を有効にすると、同じ CU サイズ仕様のままでより多くのデータを保存できます。以下に示すように、mmap は CU タイプとプランに基づいて推奨デフォルトで構成されます。

- Free、Serverless、および拡張容量 CU タイプの Dedicated clusters では、mmap はデフォルトで有効です。この設定は固定されており変更できないため、collection 作成時に mmap の設定オプションが表示されない場合があります。

- パフォーマンス最適化 CU タイプの Dedicated clusters では、mmap はデフォルトで無効です。

- 容量最適化 CU タイプの Dedicated clusters では、mmap はデフォルトで有効です。

cluster レベルのデフォルト mmap 設定の詳細については、[Use mmap](./use-mmap#global-mmap-strategy) を参照してください。

collection 作成時には、ユースケースに応じて **collection** レベルまたは **field** レベルで mmap 設定を任意に構成できます。より下位レベルの設定が上位レベルより優先されます: **Field > Collection > Cluster.** 

- **Collection-level mmap:** collection 全体の生データに対して mmap を有効にします。この設定は後から変更できますが、先に collection を release する必要があります。

- **Field-level mmap:** カスタム設定により、選択した fields の生データおよび scalar indexes に対して mmap を有効にします。一般的には、データサイズが大きく、フィルタやクエリで頻繁に使用されない fields に対して mmap を有効にすることが推奨されます。この設定は選択した fields にのみ適用され、後から変更可能です。field レベルの mmap 設定を変更するには、先に collection を release する必要があります。

<Admonition type="info" icon="📘" title="Notes">

mmap 設定の扱いには注意してください。デフォルトの mmap 設定を変更すると、パフォーマンス低下や、メモリ不足（OOM）によるロード失敗を引き起こす可能性があります。ベストプラクティスについては、[Use mmap](./use-mmap#collection-specific-mmap-settings) を参照してください。

</Admonition>

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能への入り口を示しています。

<Supademo id="cmbk94p4i8hm0sn1rhzrph2b5" title=""  />

### Shard\{#shard}

shard は collection の水平分割単位で、データ入力チャネルに対応します。すべての collection にはデフォルトで 1 つの shard があります。書き込みスループットを高めるために、さらに shards を追加できます。 

一般的な目安として、データが 1 億行増えるごとに 1 shard の追加を検討してください。許可される shard の最大数は、cluster plan および cluster CU サイズによって異なります。詳細については、[Zilliz Cloud Limits](./limits#shards) を参照してください。

shards 数は、collection 作成後でも [clone collection](./manage-collections-console#create-a-collection) 機能を通じて編集できます。

### Full text search\{#full-text-search}

Zilliz Cloud コンソールでは、full text search で使用する functions と analyzer の設定をサポートしています。full text search の詳細については、[Full Text Search](./full-text-search) を参照してください。

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能への入り口を示しています。

<Supademo id="cmbj8ahun7j48sn1redlc3e93" title=""  />

### Text Match\{#text-match}

Zilliz Cloud コンソールでは、text match 用の field と analyzer の設定もサポートしています。text match の詳細については、[Text Match](./text-match) を参照してください。

以下のデモでは、Zilliz Cloud Web コンソール上でこの機能への入り口を示しています。

<Supademo id="cmbj80qyf7it8sn1r6lzo0g1c" title=""  />

## collection を管理する\{#manage-collection}

Zilliz Cloud は、作成済み collections に対して Web コンソール経由で以下の管理操作をサポートしています。

<Supademo id="cmaqjykyn002myh0irk72q332" title="" isShowcase />

- **collection 名を変更:** 既存の collection 名を変更できます。

- **collection の説明を編集:** 既存の collection の説明を変更できます。 

    ![SBlWwPqMPhqspYbR7pxct59xnle](https://zdoc-images.s3.us-west-2.amazonaws.com/SBlWwPqMPhqspYbR7pxct59xnle.png)

- **collection スキーマと設定を編集:** 現在、Zilliz Cloud では以下のスキーマと設定のみ編集をサポートしています。

    - 既存の [VARCHAR field](./use-string-field) の `max_length` 値を編集できます。

    - 既存の [ARRAY field](./use-array-fields) の `max_capacity` 値、および ARRAY 型が VARCHAR の場合は `max_length` 値を編集できます。

    - 既存のスキーマに新しい scalar fields を追加できます。

    - **shard** 設定を変更するには、代わりに [Clone collection](./manage-collections-console#create-a-collection) 機能を使用してください。

    - **mmap** または **partition key** 設定を変更するには、代わりに SDKs を使用してください。詳細については、[Modify Collection](./modify-collections) を参照してください。

    - collection 作成時に dynamic field を有効にしていなかった場合でも、後から SDK または Web コンソールを使って有効化できます。SDK の詳細については、[Modify Collection](./modify-collections#example-5-enable-dynamic-field) を参照してください。Web コンソールで dynamic field を有効にする方法の詳細については、上記のデモを参照してください。

    その他の collection スキーマ設定は編集できません。変更を適用するには、目的の設定で新しい collection を作成し、その collection にデータをインポートしてください。

- **collection の load と release:** Zilliz Cloud Web コンソールでは、collection は作成直後に自動的にメモリへ load され、search および query にすぐ利用可能になります。メモリ領域を解放するために、未使用の collections を release できます。Zilliz Cloud Web コンソールでは、単一の collection の load / release、および複数 collections の一括 load / release をサポートしています。

- **collection を別の database に移動:** 関連する collections を同じ database 内にグループ化し、必要に応じて databases 間で collections を移動できます。

- **collection 内の partitions を管理:** **partition key** が **有効** な collections では、partitions を手動で管理する必要はありません。partition key が **無効** な collections では、partitions を手動で管理し、以下の操作を実行できます。

    - **partition を作成:** 各 collection には最大 1,024 個の partitions を作成できます。詳細については、[Zilliz Cloud Limits](./limits#collections) を参照してください。

    - **partition を削除:** デフォルト partition は削除できず、partition を削除するとその中のすべてのデータが元に戻せない形で削除されます。partition を削除する前に、まずその collection を release する必要があります。

- **collection alias を表示**: cluster 内のすべての collections の aliases を、collection 一覧ページで確認できます。

- **collection timezone を編集**: collection timezone は、この collection 内のすべての TIMESTAMPTZ エンティティのタイムゾーンを定義します。デフォルトでは **UTC** を使用しますが、アプリケーションの要件に合わせて別のタイムゾーンを選択できます。

- **collection TTL を編集**: Time-to-live（TTL）は、collection 内データの有効期限を決定する collection プロパティです。詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください。

- **Allow Insert Auto ID を有効化:** `allow_insert_auto_id` プロパティにより、AutoID が有効な collection で、insert、upsert、および bulk import 時にユーザー指定の primary key 値を受け入れられるようになります。詳細については、[Modify Collection](./modify-collections#example-6-enable-allowinsertautoid) を参照してください。

- **collection を削除:** リソースのオーバーヘッドを減らすために、不要になった collections を削除できます。collection を削除すると、その中のすべてのデータが元に戻せない形で削除されます。

## コレクションデータをプレビューする\{#preview-collection-data}

**Data** タブを使用すると、Zilliz Cloud コンソールからコレクション内のエンティティを直接プレビューできます。 

フィルター式を定義し、`limit` パラメータを設定してプレビューに表示するエンティティ数を制御し（デフォルトは 100、最大 16,384）、一致するエンティティをクエリしてテーブル内のフィールド値を確認できます。

また、**Order By** を使用して、主キーフィールド、数値フィールド、またはスカラーフィールドでデータプレビューを昇順または降順に並べ替えることもできます。

![WHDsw55d9hAOZeboD3Fc7yTwnSg](https://zdoc-images.s3.us-west-2.amazonaws.com/WHDsw55d9hAOZeboD3Fc7yTwnSg.png)
