---
title: "Open SearchからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-opensearch
sidebar_label: "OpenSearchから"
beta: FALSE
notebook: FALSE
description: "Open Searchは、Webサイト上の検索ボックスの実装から脅威検出のためのセキュリティデータの分析まで、さまざまなユースケースをサポートする分散型検索および分析エンジンです。Zilliz Cloudは、Open Searchからのスムーズな移行を可能にし、高度な分析とAIによる洞察を活用できます。このガイドでは、Open SearchデータをZilliz Cloudに転送する方法について説明します。 | Cloud"
type: origin
token: LgqUwntrNiqDTNkwLo7cHgB5nfd
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - amazon
  - opensearch
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store

---

import Admonition from '@theme/Admonition';


# Open SearchからZilliz Cloudへの移行

[Open Search](https://opensearch.org/)は、Webサイト上の検索ボックスの実装から脅威検出のためのセキュリティデータの分析まで、さまざまなユースケースをサポートする分散型検索および分析エンジンです。Zilliz Cloudは、Open Searchからのスムーズな移行を可能にし、高度な分析とAIによる洞察を活用できます。このガイドでは、Open SearchデータをZilliz Cloudに転送する方法について説明します。

## 考慮事項{#}

- 各移行タスクについて、各ソースインデックスから1つのベクトルフィールドのみを選択できます。

- 各移行タスクは、単一のソースOpen Searchクラスタに制限されます。複数のソースクラスタにデータがある場合は、それぞれに別々の移行ジョブを設定できます。

## 始める前に{#}

- ソースのOpen Searchクラスタはインターネットからアクセスできます。

- ネットワーク環境で許可リストが設定されている場合は、Zilliz CloudのIPアドレスが追加されていることを確認してください。詳細については、[Zilliz CloudのIPアドレス](./zilliz-cloud-ips)を参照してください。

- あなたには**組織オーナー**または**プロジェクト管理者**の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## Open SearchからZilliz Cloudへの移行{#open-searchzilliz-cloud}

ソースデータを任意のプランレベルのZilliz Cloudクラスタに移行できます(CU体格がソースデータに対応している場合)。

![migrate_from_opensearch](/img/ja-JP/migrate_from_opensearch.png)

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトページに移動し、**Migrations**>**Open Search**を選択してください。

1. 「**データソースに接続**」ステップで、ソースOpen Searchクラスタの**クラスタエンドポイント**、**ユーザ名**、**パスワード**を入力して接続を確立します。次に、「**次**へ」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>Open Searchの認証情報を見つけるのに役立つ情報が必要ですか?<a href="https://opensearch.org/docs/latest/getting-started/communicate/">Open Searchと通信</a>を確認してください。</p>

    </Admonition>

1. 「**ソースとターゲットを選択**」ステップで、ソースOpen SearchクラスタとターゲットZilliz Cloudクラスタの設定を行います。その後、「**次**へ」をクリックしてください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>Open Searchから移行する各ソースインデックスには、ベクトルフィールドが含まれている必要があります。</p>

    </Admonition>

1. 「**スキーマ構成**」ステップでは、

    1. Open Searchデータと対応するZilliz Cloudデータタイプとのデータマッピングを確認してください。Zilliz Cloudには、Open Searchデータタイプを自分自身にマッピングするためのデフォルトのメカニズムがありますが、必要に応じてレビューして調整することができます。現在、フィールドの名前を変更することはできますが、基礎となるデータタイプを変更することはできません。

    1. 「**詳細設定**」で、**ダイナミックフィールド**と**パーティションキー**を設定します。詳細については、「[ダイナミックフィールド](./enable-dynamic-field)と[パーティションキーを使う](./use-partition-key)する」を参照してください。

    1. [**ターゲットコレクション名**と**説明**]で、ターゲットコレクション名と説明をカスタマイズします。コレクション名は、各クラスターで一意である必要があります。名前が既存の名前と重複する場合は、コレクション名を変更します。

1. [**移行**]をクリックします。

## 移行過程を監視する{#}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/ja-JP/verify_collection.png)

## 移行ジョブをキャンセル{#}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

## フィールドマッピングリファレンス{#}

Open SearchデータタイプがZilliz Cloudフィールドタイプにどのようにマップされるかを理解するには、以下の表を確認してください。

<table>
   <tr>
     <th><p><strong>Open Searchフィールドタイプ</strong></p></th>
     <th><p><strong>Zilliz Cloudフィールドタイプ</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/knn-vector/">k-NNベクトル</a></p></td>
     <td><p><code>フロートベクトル</code></p></td>
     <td><p>Open Searchからの<code>float</code>ベクトルタイプは、Zilliz Cloud上の<code>FLOAT_VECTOR</code>にマップされます。Open Searchからのバイト/バイナリベクトルは移行に対応していません。 ベクトルの寸法は変わりません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/alias/">エイリアス</a></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>エイリアスフィールドはサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/binary/">バイナリ</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>バイナリデータは文字列としてZilliz Cloudに保存されます。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/numeric/">数値の</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>バイト</code></p></td>
     <td><p><code>INT 8</code></p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>ダブル</code></p></td>
     <td><p><code>ダブル</code></p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>フロート</code></p></td>
     <td><p><code>フロート</code></p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>ハーフフロート</code></p></td>
     <td><p><code>フロート</code></p></td>
     <td><p>FLOATにマップされま<code>し</code>た。</p></td>
   </tr>
   <tr>
     <td><p><code>整数</code></p></td>
     <td><p><code>INT 32</code></p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>長い</code></p></td>
     <td><p><code>INT 64</code></p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>短い</code></p></td>
     <td><p><code>INT 16</code></p></td>
     <td><p>直接マッピング。</p></td>
   </tr>
   <tr>
     <td><p><code>符号なし長</code></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><code>スケールドフロート</code></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/boolean/">ブール値</a></p></td>
     <td><p><code>BOOL</code></p></td>
     <td><p>ストア<code>true</code>または<code>false</code>。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/dates/">日付</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として保存されます。正しいフォーマット変換を確認してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/ip/">IPアドレス</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/range/">範囲</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/object-fields/">オブジェクト</a></p></td>
     <td><p><code>JSON</code></p></td>
     <td><p>JSON形式にシリアライズします。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/string/">ストリング</a></p></td>
     <td></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>キーワード</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td></td>
   </tr>
   <tr>
     <td><p><code>テキスト</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>Milvus 2.5以前では<code>VARCHAR</code>。</p></td>
   </tr>
   <tr>
     <td><p><code>テキストのみにマッチ</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><code>トークン数</code></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><code>ワイルドカード</code></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>Zilliz Cloudではサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/autocomplete/">オートコンプリート</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/geographic/">地理的な</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/rank/">ランク</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/percolator/">パーコレーター</a></p></td>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/derived/">派生した</a></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>Zilliz Cloudでは派生フィールドはサポートされていません。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://opensearch.org/docs/latest/field-types/supported-field-types/star-tree/">スターツリー</a></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>スターツリーフィールドはZilliz Cloudではサポートされていません。</p></td>
   </tr>
</table>

- **潜在的なデータ損失や切り捨て**: Date、Range、IPアドレス、大きなテキストコンテンツなどのフィールドを`VARCHAR`列に格納する場合は、Zilliz Cloudの長さの制限やインデックス要件を考慮してください。

- **サポートされていないフィールドタイプ**:サポートされて**いない**Open Searchタイプについては、Zilliz Cloudに移行する前に変換または除外してください。

