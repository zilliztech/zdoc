---
title: "Postgre SQLからZilliz Cloudに移行 | Cloud"
slug: /migrate-from-pgvector
sidebar_label: "PostgreSQL"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudがデータ型マッピング、コレクションの命名規則、およびPostgre SQLから移行する際の考慮事項を処理する方法について説明します。 | Cloud"
type: origin
token: CiVHwbwPwipX5SkFkqVcLpESnfe
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - postgresql
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database

---

import Admonition from '@theme/Admonition';


# Postgre SQLからZilliz Cloudに移行

このトピックでは、Zilliz Cloudがデータ型マッピング、コレクションの命名規則、および[Postgre SQL](https://www.postgresql.org/)から移行する際の考慮事項を処理する方法について説明します。

## 前提条件{#prerequisites}

Postgre SQLからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください:

### Postgre SQLの要件{#postgresql-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>Postgre SQLデータベースのソースは、一般のインターネットからアクセスできる必要があります</p></td>
   </tr>
   <tr>
     <td><p>データベースアクセス</p></td>
     <td><p>必要な権限を持つ有効なデータベースエンドポイント、ユーザー名、およびパスワード</p></td>
   </tr>
   <tr>
     <td><p>pgvector拡張モジュール</p></td>
     <td><p>テーブルはベクトルデータの保存にpgvector拡張を使用する必要があります</p></td>
   </tr>
   <tr>
     <td><p>ベクトルフィールドの要件</p></td>
     <td><p>各ソーステーブルには少なくとも1つのベクトルフィールドが含まれている必要があり、ベクトルフィールドにはnull値を含めることはできません。</p></td>
   </tr>
   <tr>
     <td><p>データの可用性</p></td>
     <td><p>ソーステーブルにはデータが含まれている必要があります。空のテーブルは移行できません。</p></td>
   </tr>
</table>

### Zilliz Cloudの要件{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ユーザーの役割</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスタ容量</p></td>
     <td><p>十分なストレージとコンピューティングリソース(<a href="https://zilliz.com/pricing#calculator">CUの計算機</a>を使用してCU体格を推定)</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用する場合は、許可リストに<a href="./zilliz-cloud-ips">Zilliz CloudのIPアドレス</a>を追加してください。</p></td>
   </tr>
</table>

## データ型マッピング{#data-type-mapping}

Postgre SQLのデータ型がZilliz Cloudにどのようにマッピングされるかを理解することは、移行を計画する上で重要です。

<table>
   <tr>
     <th><p>Postgre SQLのフィールドタイプ</p></th>
     <th><p>Zilliz Cloudフィールドタイプ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>プライマリキー/オートID</p></td>
     <td><ul><li><p>シングルフィールドプライマリキー:ターゲットコレクションのプライマリキーとして直接マップされます。</p></li><li><p>プライマリキーの不在:プライマリキーのないテーブルをサポートするために、ターゲットコレクションの自動IDが有効になっています。</p></li><li><p><strong>複合主キー:</strong>自動IDが有効になっています。複合キーは通常のスカラーフィールドとして扱われます。</p><p>データを移行する際には、Auto IDを有効にすることができます。ただし、そうすると、ソースコレクションの元のプライマリキー値は破棄されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>ベクトル</p></td>
     <td><p>フロートベクトル</p></td>
     <td><p>ベクトルの寸法は変わりません。</p></td>
   </tr>
   <tr>
     <td><p>テキスト/varchar/日付/時刻</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>文字列として格納される。</p></td>
   </tr>
   <tr>
     <td><p>bigint</p></td>
     <td><p>INT 64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>整数</p></td>
     <td><p>INT 32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>smallint</p></td>
     <td><p>INT 16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ダブルプレシジョン</p></td>
     <td><p>ダブル</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>リアル</p></td>
     <td><p>フロート</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>ブール値</p></td>
     <td><p>BOOL</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>配列</p></td>
     <td><p>アレイ</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>json</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## Postgre SQL固有の処理ルール{#postgresql-specific-handling-rules}

### コレクションの命名規則{#collection-naming-rules}

Postgre SQLのテーブル名は、以下の考慮事項を考慮してZilliz Cloudに転送されます。

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>インパクト</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p><strong>デフォルトの命名</strong></p></td>
     <td><p>コレクション名はソーステーブル名と完全に一致します</p></td>
     <td><p>名前はPostgre SQLからそのまま保持されます</p></td>
   </tr>
   <tr>
     <td><p><strong>名前の衝突</strong></p></td>
     <td><p>同じ名前のコレクションがすでに存在する場合、ジョブを送信できません</p></td>
     <td><p>移行設定中に既存のコレクションを削除するか、別のデータベースを選択するか、名前を変更してください</p></td>
   </tr>
   <tr>
     <td><p><strong>コレクション名の変更</strong></p></td>
     <td><p>移行中にサポート</p></td>
     <td><p>移行設定過程でコレクションの名前を変更できます</p></td>
   </tr>
</table>

### 移行に関する考慮事項{#migration-considerations}

以下の機能はPostgre SQLの移行には**サポートされていません**:

<table>
   <tr>
     <th><p>制限</p></th>
     <th><p>インパクト</p></th>
     <th><p>オルタナティブ</p></th>
   </tr>
   <tr>
     <td><p>ダイナミックフィールドから固定フィールドへの変換</p></td>
     <td><p>既存の動的フィールドを固定型に変換できません</p></td>
     <td><p>フィールドは元の動的な性質を維持します</p></td>
   </tr>
   <tr>
     <td><p>フィールドを追加</p></td>
     <td><p>移行中に新しいフィールドを追加できません</p></td>
     <td><p>既存のElasticsearchフィールドのみが移行されます</p></td>
   </tr>
</table>

