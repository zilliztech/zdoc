---
title: "mmapを使う | BYOC"
slug: /use-mmap
sidebar_label: "mmapを使う"
beta: FALSE
notebook: FALSE
description: "メモリマッピング(Mmap)により、ディスク上の大きなファイルに直接メモリアクセスできるため、Zilliz Cloudはインデックスとデータをメモリとハードドライブの両方に保存できます。このアプローチにより、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張できます。このページでは、Zilliz Cloudがmmapを使用して高速かつ効率的なデータストレージと取得を可能にする方法を理解するのに役立ちます。 | BYOC"
type: origin
token: QD4lwWwBeiECoJks7tecJg7dnVc
sidebar_position: 14
keywords: 
  - zilliz
  - vector database
  - cloud
  - mmap
  - search optimization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm

---

import Admonition from '@theme/Admonition';


# mmapを使う

メモリマッピング(Mmap)により、ディスク上の大きなファイルに直接メモリアクセスできるため、Zilliz Cloudはインデックスとデータをメモリとハードドライブの両方に保存できます。このアプローチにより、アクセス頻度に基づいてデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張できます。このページでは、Zilliz Cloudがmmapを使用して高速かつ効率的なデータストレージと取得を可能にする方法を理解するのに役立ちます。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>この機能はまだ<strong>パブリックプレビュー</strong>中です。この機能に関する問題が発生した場合は、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p></li>
<li><p>異なるプランを持つソースクラスタとターゲットクラスタ間でデータを移行または復元する場合、ソースコレクションのMmap設定はターゲットクラスタに移行されません。ターゲットクラスタのMMAP設定を手動で再構成してください。</p></li>
</ul>

</Admonition>

## 概要について{#overview}

Zilliz Cloudは、ベクトル埋め込みとそのメタデータを整理するためにコレクションを使用し、コレクション内の各行はエンティティを表します。下の左図に示すように、ベクトルフィールドにはベクトル埋め込みが格納され、スカラーフィールドにはメタデータが格納されます。特定のフィールドにインデックスを作成し、コレクションをロードすると、Zilliz Cloudは作成されたインデックスとすべてのフィールドからの生データをメモリにロードします。

![BHV4wSDV0hAYCeb8aOkcuz0Enof](/img/BHV4wSDV0hAYCeb8aOkcuz0Enof.png)

Zilliz Cloudクラスターはメモリを大量に消費するデータベースシステムであり、利用可能なメモリ体格がコレクションの容量を決定します。データ体格がメモリ容量を超える場合、大量のデータを含むフィールドをメモリにロードすることは不可能であり、これはAI駆動型アプリケーションの通常の場合です。

このような問題を解決するために、Zilliz Cloudはmmapを導入して、コレクション内のホットデータとコールドデータのロードをバランスさせます。上の右図に示すように、Zilliz Cloudはベクトルインデックスのみをメモリにロードし、容量最適化されたCUを使用しているZilliz Cloudクラスターを使用している場合は、コレクションをロードするときにすべてのフィールドとスカラーインデックスの生データをメモリマップします。

左の図と右の図のデータ配置手順を比較することで、左の図のメモリ使用量が右の図よりもはるかに高いことがわかります。mmapが有効になっている場合、メモリにロードされるはずのデータはハードドライブにオフロードされ、オペレーティングシステムのページキャッシュにキャッシュされ、メモリフットプリントが減少します。ただし、キャッシュヒットの失敗はパフォーマンスの低下につながる可能性があります。詳細については、[この記事](https://en.wikipedia.org/wiki/Mmap)を参照してください。

## グローバルmmap戦略{#global-mmap-strategy}

次の表は、さまざまな階層のクラスターに対するグローバルmmap戦略を示しています。

<table>
   <tr>
     <th rowspan="2"><p>Mmapターゲット</p></th>
     <th colspan="3"><p>専用クラスター</p></th>
     <th rowspan="2"><p>フリークラスタと&lt;/br&gt; </p><p>サーバーレスクラスタ</p></th>
   </tr>
   <tr>
     <td><p>Performance-optimized</p></td>
     <td><p>Capacity-optimized</p></td>
     <td><p>Extended-capacity</p></td>
   </tr>
   <tr>
     <td><p>スカラー場の生データ</p></td>
     <td><p>無効と変更可能</p></td>
     <td><p>有効および変更可能</p></td>
     <td colspan="2"><p>有効および変更不可</p></td>
   </tr>
   <tr>
     <td><p>スカラー場指数</p></td>
     <td><p>無効と変更可能</p></td>
     <td><p>有効および変更可能</p></td>
     <td colspan="2"><p>有効および変更不可</p></td>
   </tr>
   <tr>
     <td><p>ベクトルデータ</p></td>
     <td><p>有効および変更可能</p></td>
     <td><p>有効および変更可能</p></td>
     <td colspan="2"><p>有効および変更不可</p></td>
   </tr>
   <tr>
     <td><p>ベクトル場インデックス</p></td>
     <td><p>無効および変更不可</p></td>
     <td><p>無効および変更不可</p></td>
     <td colspan="2"><p>有効および変更不可</p></td>
   </tr>
</table>

専用 クラスターで**Performance-optimized**CUを使用する場合、Zilliz Cloudはベクトルフィールドの生データに対してのみmmapを有効にし、スカラーフィールドの生データとすべてのフィールドインデックスをメモリにロードします。検索やクエリ中のメタデータフィルタリングと取得のパフォーマンスを確保するために、グローバル設定を保持することをお勧めします。ただし、メタデータフィルタリングに関与しないフィールドや出力フィールドとして使用されないフィールドに対しては、引き続きmmapを有効にすることができます。

専用クラスターで**Capacity-Optimized**CUを使用する場合、Zilliz Cloudは自動インデックスのためにベクトルフィールドインデックスのmmapを無効にし、スカラーフィールドとすべてのフィールド生データのインデックスをメモリマップして、最大ストレージ容量を確保します。メタデータフィルタリング条件で使用される一部のフィールドの生データまたは出力フィールドにリストされている生データが大きすぎてハードドライブに残されると、応答が遅くなったりネットワークジッターが発生する場合は、これらのフィールドのmmapを無効にして検索パフォーマンスを向上させることを検討できます。

Zilliz Cloudを使用すると、**フリー**および**サーバーレスクラスター**、および**Extended-capacity**CUを使用する専用クラスターでは、すべてのフィールドの生データとインデックスのmmapを使用して、システムキャッシュを最大限に活用し、ホットデータのパフォーマンスを向上させ、コールドデータのコストを削減できます。

## コレクション固有のmmap設定{#collection-specific-mmap-settings}

You need to release a collection to make changes to the mmap settings and load it again to make the changes tothe mmap settings take effect.特定のフィールド、フィールドインデックス、またはコレクションに対してmmapを設定できます。

<Admonition type="info" icon="📘" title="ノート">

<p>mmap設定を変更する際は注意してください。不適切なmmap設定は以下の問題を引き起こす可能性があります:</p>
<ul>
<li><p>専用クラスターperformance-optimized場合、検索やクエリ中にスカラーフィールドを高速に取得するために、すべてのスカラーフィールドの生データとベクトルインデックスがデフォルトでメモリにロードされます。デフォルトのmmap設定を変更すると、パフォーマンスが低下する可能性があります。</p></li>
<li><p>容量最適化された専用クラスターでは、最大ストレージ容量を確保するために、ベクトルインデックスのみがデフォルトでメモリにロードされます。デフォルトのmmap設定を変更すると、メモリ不足(OOM)の問題によりロードエラーが発生する場合があります。</p></li>
</ul>

</Admonition>

### 特定のフィールド用にmmapを設定する{#configure-mmap-for-specific-fields}

小さなperformance-optimizedCUを持つ専用クラスターを使用していて、データセット内のフィールドの生データが大きい場合は、mmapを有効にしてコレクションにフィールドを追加することを検討してください。

次の例では、performance-optimized専用クラスターに接続することを前提としており、フィールドを追加しながら**doc_chunk**という名前のVarCharフィールドでmmapを有効にする方法を示します。

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
TOKEN="YOUR_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

schema = MilvusClient.create_schema()

# Disable mmap on a field upon creating the schema for a collection
schema.add_field(
    field_name="doc_chunk",
    datatype=DataType.INT64,
    max_length=512,
    # highlight-next-line
    mmap_enabled=False,
)

# Disable mmap on an existing field
# The following assumes that you have a collection named `my_collection`
client.alter_collection_field(
    collection="my_collection",
    field_name="doc_chunk",
    properties={"mmap.enable": True}
)
```

上記のスキーマを使用して作成されたコレクションをロードすると、Zilliz Cloudは**doc_chunk**フィールドの生データをメモリマップします。フィールドのmmap設定を変更するには、コレクションを解放し、変更後に再度コレクションをロードする必要があることに注意してください。

### スカラーインデックス用にmmapを設定する{#configure-mmap-for-scalar-indexes}

メタデータフィルタリングに関与するスカラーフィールド、または出力フィールドとして使用されるスカラーフィールドについては、他のスカラーフィールドをハードドライブに保持しながらメモリにロードすることを検討してください。

次の例では、容量が最適化された専用クラスターへの接続を前提としており、**title**という名前のVarCharフィールドのインデックスでmmapを無効にしてすばやく取得する方法を示します。

```python
# Add a varchar field
schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512   
)

index_params = MilvusClient.prepare_index_params()

# Create index on the varchar field with mmap settings
index_params.add_index(
    field_name="title", 
    index_type="INVERTED"
    # highlight-next-line
    params={ "mmap.enabled": "false" }
)

# Change mmap settings for an index
# The following assumes that you have a collection named `my_collection`
client.alter_index_properties(
    collection_name="my_collection",
    index_name="title",
    properties={"mmap.enabled": True}
)
```

上記のインデックスパラメータを使用して作成されたコレクションをロードすると、Zilliz Cloudは**タイトル**フィールドのインデックスをメモリにロードします。フィールドのmmap設定を変更するには、コレクションをリリースし、変更後に再度コレクションをロードする必要があることに注意してください。

