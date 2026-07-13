---
title: "Collections の管理（コンソール）| Cloud"
slug: /manage-collections-console
sidebar_label: "コンソール上"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "collection は、vector embeddings と metadata を保存するために使用される 2 次元のテーブルです。collection 内のすべての entity は同じ schema を共有します。データ管理やマルチテナンシーの目的で、複数の collection を作成できます。| Cloud"
type: origin
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Collections の管理（コンソール）

collection は、vector embeddings と metadata を保存するために使用される 2 次元のテーブルです。collection 内のすべての entity は同じ schema を共有します。データ管理やマルチテナンシーの目的で、複数の collection を作成できます。 

このガイドでは、Web コンソールでの collection の作成および管理操作について説明します。これは、ビジュアルインターフェイスを好むユーザーを対象としています。SDK に慣れている場合は、SDK を通じて collection を作成および管理することもできます。詳細については、[Collection の作成](./manage-collections-sdks)を参照してください。

<Admonition type="info" icon="📘" title="Notes">

強力なデータ分離が必要で、少数のテナントのみを管理する場合は、テナントごとに個別の collection を作成できます。

ただし、[cluster plan](./limits) に応じて、作成できる collection は最大 16,384 個までです。そのため、大規模なマルチテナンシーでは、ユースケースに応じて partition ベースまたは partition key ベースのマルチテナンシーなど、代替戦略の使用を検討してください。詳細については、[マルチテナンシーの実装](./multi-tenancy)を参照してください。

</Admonition>

## collection を作成する\{#create-a-collection}

Zilliz Cloud コンソールでは、collection を作成するための 3 つの方法が提供されており、それぞれ異なるシナリオ向けに設計されています。

- **独自の collection を作成:** データセットとユースケースに合わせて schema と index パラメータをカスタマイズします。schema を細かく制御する必要があるユーザーに最適です。

- **サンプル collection を作成:** 定義済みの schema とサンプルデータセットを使用して、collection をすばやくセットアップします。Zilliz Cloud を試している新規ユーザーに推奨されます。

- **データ付きの既存 collection をクローン:** 同じ database 内で既存の collection を複製します。テスト用 collection から本番用 collection へ schema とデータの両方をコピーする必要がある環境複製シナリオで役立ちます。

- **既存の schema から作成**: 既存の collection の schema を使用して新しい collection をすばやく作成し、確定前に編集するオプションもあります。

次のデモでは、Web UI 上でこれらの機能がどこにあるかを示しています。

<Supademo id="cmap9as9900yyx80ihbaf3rqt" title="Create Collection" isShowcase="true" />

以下は、collection を作成する際に出てくる概念の一部です。

### Collection の基本情報\{#collection-basic-information}

collection の metadata には次が含まれます。

- Collection 名

- （任意）Collection の説明。最大 1024（UTF-8 バイト）。

- collection が属する database。[database](./database-concept) は cluster と collection の間の層であり、collection を管理および整理するための論理コンテナとして機能します。関連する collection を同じ database の下にグループ化できます。

### Collection schema\{#collection-schema}

schema は collection のデータ構造を定義し、以下を含める必要があります。

- 1 つの primary key（PK）field

- 少なくとも 1 つの vector field。collection で許可される vector field 数の制限については、[Zilliz Cloud Limits](./limits#fields) を参照してください。

- （任意）metadata 用の scalar fields

- （任意）Dynamic field。dynamic field を有効にすると、既存の schema を変更せずにデータ挿入時に field を追加できるため、collection schema に柔軟性がもたらされます。データ構造が固定されていない場合は、dynamic field を有効にすることをお勧めします。フィルターやクエリで頻繁に使用される field については、dynamic field を使用するのではなく、schema で事前に定義してください。これにより、最適なクエリ性能を維持できます。

<Supademo id="cmaqefyds2e7aho3rna9w8trp" title="Zilliz Cloud - Create Collection Schema" />

<Admonition type="info" icon="📘" title="Notes">

ほとんどの schema 設定は、collection の作成後には変更できません。現在および将来のビジネスニーズを満たすように、schema を慎重に設計してください。ベストプラクティスについては、[Schema Explained](./schema-explained) を参照してください。

</Admonition>

### Index\{#index}

index は、検索とクエリを高速化するためにデータを整理するデータ構造です。Zilliz Cloud は 2 種類の index をサポートしています。

- **Vector index**: vector 検索を高速化するために [AUTOINDEX](./autoindex-explained) を使用して自動的に作成されます。schema に複数の vector field がある場合は、各 vector field に個別の index を作成できます。さらに、vector 間の距離を計算するために使用される [metric type](./search-metrics-explained) と、index のコスト、性能、容量のトレードオフのために基盤となる量子化戦略を制御する index build level も編集できます。 

    <Supademo id="cmgk9ynaq290okrn90l496fq7?utm_source=link" title=""  />

- **Scalar index**: デフォルトでは、Zilliz Cloud は scalar fields の index を自動的に作成しません。ただし、検索とクエリを高速化するために、フィルタリングでよく使用される scalar fields に手動で index を作成できます。

collection 作成時に index の作成をスキップし、後で index を追加できます。詳細については、[Indexes](./indexes) を参照してください。

### Functions\{#functions}

Zilliz Cloud では、**functions** は、データ投入およびクエリ実行中に collection 内でテキスト関連機能をどのように適用するかを定義します。

Functions は、適用されるタイミングに基づいて 2 つの主要なカテゴリに分類されます。

- **Pre-search Functions**

    Pre-search Functions は、生テキストを検索に使用できる vector 表現に変換する方法を定義します。これらは **collection の作成時に設定**され、collection の schema の一部になります。

    Pre-search Functions の例には、BM25 function、モデルベースの functions などがあります。

    Pre-search Functions の仕組みの概念的な概要については、[Function Overview](./function-and-model-inference-overview) を参照してください。

    <Supademo id="cmjm7ydhy01ouxy0ibvzvne7r" title="" isShowcase />

- **Post-search Functions**

    Post-search Functions は、**クエリ時**に検索結果の順序を調整します。Pre-search Functions とは異なり、Post-search Functions は **collection schema に紐づけられません**。これらは検索リクエストのパラメータとして指定され、検索によって返された候補結果に対して動作します。

    Post-search Functions は indexing や候補取得には影響しません。

    Post-search Functions の仕組みの概念的な概要については、[Function Overview](./function-and-model-inference-overview) を参照してください。

### Partition と partition key\{#partition-and-partition-key}

**Partition:** partition は collection の物理的なサブセットです。partition は親 collection と同じデータ schema を共有しますが、collection 内のデータの一部のみを含みます。各 collection にはデフォルトで 1 つの partition があります。マルチテナンシーやデータ管理の目的で、手動でさらに partition を追加できます。追加の partition が作成されていない場合、collection に挿入されたすべてのデータはデフォルトの partition に入ります。詳細については、[Partitions の管理](./manage-partitions)を参照してください。

**Partition key:** partition key は、partitions に基づく検索最適化ソリューションです。非 primary key の `INT64` または `VARCHAR` field を partition key として指定すると、Zilliz Cloud によって 16 個の partitions が自動的に作成され、挿入されたすべての entity は partition key の値に基づいて、これら 16 個の自動生成 partition に入ります。collection で partition key が有効になると、この collection 内で partition を手動で作成することはできません。詳細については、[Partition Key の使用](./use-partition-key)を参照してください。

<Admonition type="info" icon="📘" title="Notes">

partition を作成する必要があるか、partition key を使用する必要があるかを判断するには、次の要素を考慮できます。

- **マルチテナンシー戦略:** 数百万のテナントをサポートする必要がある場合は、partition key を使用してください。テナント間で強力な物理的データ分離が必要な場合は、partitions を使用してください。詳細については、[マルチテナンシーの実装](./multi-tenancy)を参照してください。

- **リソース管理:** partition の作成と管理を自分で行いたい場合は、partitions の使用を選択できます。partitions の自動作成と管理が必要な場合は、partitions keys を使用してください。

- **ホットデータとコールドデータの管理:** ホットデータとコールドデータを効率的に処理する必要がある場合は、partition key を使用してください。Dedicated clusters でホットデータとコールドデータの管理に partition key を使用するには、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

### mmap\{#mmap}

Memory mapping（mmap）は、大きなファイルをメモリにロードせずにディスク上で直接アクセスできるようにする、メモリ使用量の最適化です。mmap を有効にすると、同じ CU サイズ仕様でより多くのデータを保存できます。以下に示すように、mmap は CU type と plan に基づいて推奨デフォルトで設定されます。

- extended-capacity CU type の Free、Serverless、および Dedicated clusters では、mmap がデフォルトで有効になっています。この設定は固定されており変更できないため、collection 作成時に mmap 設定オプションが表示されない場合があります。

- performance-optimized CU type の Dedicated clusters では、mmap がデフォルトで無効になっています。

- capacity-optimized CU type の Dedicated clusters では、mmap がデフォルトで有効になっています。

cluster レベルのデフォルト mmap 設定の詳細については、[mmap の使用](./use-mmap#global-mmap-strategy)を参照してください。

collection 作成時に、ユースケースに応じて **collection** レベルまたは **field** レベルで mmap 設定を任意に構成できます。低いレベルの設定は高いレベルの設定より優先されます: **Field > Collection > Cluster.** 

- **Collection レベルの mmap:** collection 全体の raw data に対して mmap を有効にします。この設定は後で変更できますが、先に collection を release する必要があります。

- **Field レベルの mmap:** カスタム設定により、選択した field の raw data と scalar indexes に対して mmap を有効にします。一般に、データサイズが大きく、頻繁にフィルタリングまたはクエリされない field に対して mmap を有効にすることが推奨されます。この設定は選択した field にのみ適用され、後で変更できます。field レベルの mmap 設定を変更するには、先に collection を release する必要があります。

<Admonition type="info" icon="📘" title="Notes">

mmap 設定には注意してください。デフォルトの mmap 設定を変更すると、out-of-memory（OOM）の問題により性能低下や load 失敗が発生する可能性があります。ベストプラクティスについては、[mmap の使用](./use-mmap#collection-specific-mmap-settings)を参照してください。

</Admonition>

以下のデモでは、Zilliz Cloud Web コンソール上でのこの機能の入口を示しています。

<Supademo id="cmbk94p4i8hm0sn1rhzrph2b5" title=""  />

### Shard\{#shard}

shard は、データ入力チャネルに対応する collection の水平スライスです。すべての collection には、デフォルトで 1 つの shard があります。書き込みスループットを向上させるために、さらに shard を追加できます。 

一般的なガイドラインとして、データ 1 億行ごとに 1 つの shard を追加することを検討してください。許可される shard の最大数は、cluster plan と cluster CU size によって異なります。詳細については、[Zilliz Cloud Limits](./limits#shards) を参照してください。

shard の数は、collection の作成後に [clone collection](./manage-collections-console#create-a-collection) 機能を使用して後から編集できます。

### Full text search\{#full-text-search}

Zilliz Cloud コンソールは、full text search で使用する functions と analyzer の設定をサポートしています。full text search の詳細については、[Full Text Search](./full-text-search) を参照してください。

以下のデモでは、Zilliz Cloud Web コンソール上でのこの機能の入口を示しています。

<Supademo id="cmbj8ahun7j48sn1redlc3e93" title=""  />

### Text Match\{#text-match}

Zilliz Cloud コンソールは、text match 用の field と analyzer の設定もサポートしています。text match の詳細については、[Text Match](./text-match) を参照してください。

以下のデモでは、Zilliz Cloud Web コンソール上でのこの機能の入口を示しています。

<Supademo id="cmbj80qyf7it8sn1r6lzo0g1c" title=""  />

## collection を管理する\{#manage-collection}

Zilliz Cloud は、作成済み collection に対して Web コンソール上で次の管理操作をサポートしています。

<Supademo id="cmaqjykyn002myh0irk72q332" title="" isShowcase />

- **collection の名前変更:** 既存の collection の名前を変更できます。

- **collection の説明を編集:** 既存の collection の説明を変更できます。 

    ![SBlWwPqMPhqspYbR7pxct59xnle](https://zdoc-images.s3.us-west-2.amazonaws.com/SBlWwPqMPhqspYbR7pxct59xnle.png)

- **collection schema と設定を編集:** 現在、Zilliz Cloud は以下の schema と設定の編集のみをサポートしています。

    - 既存の [VARCHAR field](./use-string-field) の `max_length` 値を編集できます。

    - 既存の [ARRAY field](./use-array-fields) の `max_capacity` 値、および ARRAY type が VARCHAR の場合は `max_length`値を編集できます。

    - 既存の schema に新しい scalar fields を追加できます。

    - **shard** 設定を変更するには、代わりに [Clone collection](./manage-collections-console#create-a-collection) 機能を使用してください。

    - **mmap** または **partition key** 設定を変更するには、代わりに SDK を使用してください。詳細については、[Collection の変更](./modify-collections)を参照してください。

    - collection 作成時に dynamic field を有効にしていない場合は、後から SDK または Web コンソールを使用して有効にできます。SDK の詳細については、[Collection の変更](./modify-collections#example-5-enable-dynamic-field)を参照してください。Web コンソールで dynamic field を有効にする方法の詳細については、上記のデモを参照してください。

    その他の collection schema 設定は編集できません。変更を適用するには、目的の設定で新しい collection を作成し、そこにデータをインポートしてください。

- **collection の load と release:** Zilliz Cloud Web コンソールでは、collection は作成直後に自動的にメモリにロードされ、検索とクエリで利用可能になります。メモリ領域を解放するために、未使用の collection を release できます。Zilliz Cloud Web コンソールは、単一 collection の load または release、および複数 collection の一括 load または release をサポートしています。

- **collection を別の database に移動:** 関連する collection を同じ database 内にグループ化し、必要に応じて collection を database 間で移動できます。

- **collection 内の partitions を管理:** **partition key** が **有効** な collection では、partitions を手動で管理する必要はありません。partition key が **無効** な collection では、partitions を手動で管理し、次の操作を実行できます。

    - **partition を作成:** 各 collection で最大 1,024 個の partitions を作成できます。詳細については、[Zilliz Cloud Limits](./limits#collections) を参照してください。

    - **partition を削除:** デフォルトの partition は削除できません。また、partition を削除すると、その中のすべてのデータが不可逆的に削除されます。partition を削除する前に、まず collection を release する必要があります。

- **collection alias を表示**: collection list page で、cluster 内のすべての collection の alias を表示できます。

- **collection timezone を編集**: collection timezone は、この collection 内のすべての TIMESTAMPTZ entity の timezone を定義します。デフォルトでは **UTC** が使用されますが、アプリケーションのニーズに合わせて別の timezone を選択できます。

- **collection TTL を編集**: Time-to-live（TTL）は、collection 内のデータの有効期限を決定する collection property です。詳細については、[Collection TTL の設定](./set-collection-ttl)を参照してください。

- **Allow Insert Auto ID を有効化:** `allow_insert_auto_id` property により、AutoID が有効な collection は、insert、upsert、bulk import 時にユーザー指定の primary key 値を受け入れられるようになります。詳細については、[Collection の変更](./modify-collections#example-6-enable-allowinsertautoid)を参照してください。

- **collection を削除:** リソースのオーバーヘッドを削減するために、不要になった collection を削除できます。collection を削除すると、その中のすべてのデータが不可逆的に削除されます。

## collection データをプレビューする\{#preview-collection-data}

**Data** タブを使用して、Zilliz Cloud コンソールから collection 内の entity を直接プレビューします。 

フィルター式を定義し、プレビューに表示される entity の数を制御するために `limit` パラメータを設定し（デフォルトは 100、最大 16,384）、一致する entity をクエリしてテーブル内の field 値を確認できます。

また、**Order By** を使用して、primary key field、数値 fields、または scalar fields によってデータプレビューを昇順または降順で並べ替えることもできます。

![WHDsw55d9hAOZeboD3Fc7yTwnSg](https://zdoc-images.s3.us-west-2.amazonaws.com/WHDsw55d9hAOZeboD3Fc7yTwnSg.png)
